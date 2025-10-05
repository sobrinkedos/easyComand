# Funcionalidades por Módulo

<cite>
**Arquivos Referenciados neste Documento**  
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Gestão de Estabelecimentos](#gestão-de-estabelecimentos)
3. [Usuários e Permissões](#usuários-e-permissões)
4. [Pedidos](#pedidos)
5. [Reservas](#reservas)
6. [Estoque](#estoque)
7. [Ambientes e Mesas](#ambientes-e-mesas)
8. [Pagamentos](#pagamentos)
9. [Relatórios](#relatórios)

## Visão Geral do Sistema

O sistema é uma aplicação de gestão para restaurantes com uma arquitetura multi-inquilino robusta. Isso significa que um único banco de dados pode servir múltiplos estabelecimentos (inquilinos) de forma segura e isolada. O pilar central dessa arquitetura é o campo `establishment_id`, presente na maioria das tabelas, que vincula todos os dados a um estabelecimento específico.

A segurança e o isolamento de dados são garantidos pelo **Row Level Security (RLS)** do Supabase. O RLS assegura que um usuário só possa acessar dados do seu próprio estabelecimento. Isso é implementado por meio de políticas que utilizam uma função auxiliar (como `public.get_my_establishment_id()` ou `auth.get_establishment_id()`) para determinar a qual estabelecimento o usuário autenticado pertence. Além disso, um gatilho (`on_auth_user_created`) sincroniza automaticamente novos usuários do sistema de autenticação (`auth.users`) com a tabela `public.users`, vinculando-os ao seu `establishment_id` desde o cadastro.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L412-L504)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L686-L717)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L0-L72)

## Gestão de Estabelecimentos

Este módulo é responsável pelo cadastro e configuração dos estabelecimentos, servindo como a base para todos os outros dados.

**Propósito**: Cadastrar e gerenciar as informações principais de um restaurante, como nome, endereço, tipo de estabelecimento, plano de assinatura e status operacional.

**Tabelas Envolvidas**:
- `establishments`: Armazena todos os dados principais do estabelecimento.
- `establishment_types`: Tabela global que define os tipos de estabelecimentos (ex: restaurante, bar, lanchonete).
- `subscription_plans`: Tabela global que define os planos de assinatura disponíveis (ex: básico, premium).

**Fluxo de Dados**:
1.  Um novo estabelecimento é criado, inserindo um registro na tabela `establishments`.
2.  O registro faz referência a um `establishment_type_id` da tabela `establishment_types` e a um `subscription_plan_id` da tabela `subscription_plans`.
3.  O campo `establishment_id` é propagado para todas as entidades filhas (usuários, produtos, pedidos, etc.).

**Integração com o Frontend**: O frontend exibe um formulário para cadastro de estabelecimento, onde o usuário seleciona o tipo e o plano. Após o cadastro, o sistema redireciona para a configuração inicial.

**Exemplo de Relacionamento**:
```sql
-- A tabela establishments referencia establishment_types
CREATE TABLE public.establishments (
    id integer PRIMARY KEY,
    establishment_type_id integer NOT NULL REFERENCES public.establishment_types(id),
    subscription_plan_id integer NOT NULL REFERENCES public.subscription_plans(id),
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L105-L120)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L80-L85)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L90-L95)

## Usuários e Permissões

Este módulo gerencia os usuários do sistema e seus níveis de acesso, garantindo que cada um tenha as permissões adequadas.

**Propósito**: Criar perfis de usuário, atribuir papéis (como gerente, garçom, cozinheiro) e definir permissões específicas para cada papel, controlando o que cada usuário pode visualizar e fazer no sistema.

**Tabelas Envolvidas**:
- `users`: Armazena os perfis dos usuários, vinculados a um `establishment_id`.
- `roles`: Define os papéis (ex: proprietário, gerente, garçom).
- `permissions`: Define permissões granulares (ex: `read_orders`, `create_products`).
- `role_permissions`: Tabela de junção que associa permissões a papéis.

**Fluxo de Dados**:
1.  Um novo usuário é criado no sistema de autenticação (Supabase Auth).
2.  O gatilho `on_auth_user_created` é acionado, inserindo um novo registro na tabela `public.users` com o `id` do `auth.users`, o `establishment_id` e o `role_id` fornecidos nos metadados do cadastro.
3.  Ao acessar o sistema, o RLS garante que o usuário só veja dados do seu `establishment_id`.
4.  O frontend pode consultar as permissões do papel do usuário para habilitar ou desabilitar funcionalidades na interface.

**Integração com o Frontend**: O frontend exibe uma lista de usuários do estabelecimento. Ao adicionar um novo usuário, o administrador seleciona um papel. O sistema então aplica automaticamente todas as permissões associadas àquele papel.

**Exemplo de Relacionamento**:
```sql
-- A tabela users referencia roles
CREATE TABLE public.users (
    id uuid PRIMARY KEY,
    establishment_id integer NOT NULL REFERENCES public.establishments(id),
    role_id integer REFERENCES public.roles(id),
    -- ... outros campos
);

-- A tabela role_permissions faz a ligação entre roles e permissions
CREATE TABLE public.role_permissions (
    role_id integer NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id integer NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L125-L148)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L86-L95)

## Pedidos

Este módulo é o coração do sistema, gerenciando todo o ciclo de vida de um pedido, desde a criação até o pagamento.

**Propósito**: Permitir a criação, acompanhamento e finalização de pedidos feitos no local, no balcão, por delivery ou retirada.

**Tabelas Envolvidas**:
- `orders`: Representa o pedido principal, com informações como tipo, status e valor total.
- `order_items`: Representa os itens individuais dentro de um pedido.
- `products`: A tabela de produtos é referenciada pelos itens do pedido.
- `order_item_variations`: Armazena variações personalizadas de um produto (ex: tamanho, ponto da carne).

**Fluxo de Dados**:
1.  Um novo pedido é criado na tabela `orders` com status `open`.
2.  Itens são adicionados à tabela `order_items`, cada um referenciando um `product_id` e fazendo parte do `order_id`.
3.  Para cada item, variações podem ser adicionadas na tabela `order_item_variations`, referenciando `variation_option_id`.
4.  O status do pedido é atualizado (ex: `sent_to_kitchen`, `ready`, `paid`) conforme o fluxo.

**Integração com o Frontend**: O frontend possui uma interface de ponto de venda (PDV) onde o garçom adiciona produtos ao pedido. O sistema calcula automaticamente o valor total com base nos preços dos produtos e variações. O status do pedido é atualizado em tempo real.

**Exemplo de Relacionamento**:
```sql
-- A tabela order_items referencia orders e products
CREATE TABLE public.order_items (
    id integer PRIMARY KEY,
    order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id integer NOT NULL REFERENCES public.products(id),
    -- ... outros campos
);

-- A tabela order_item_variations referencia order_items e variation_options
CREATE TABLE public.order_item_variations (
    id integer PRIMARY KEY,
    order_item_id integer NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    variation_option_id integer NOT NULL REFERENCES public.variation_options(id),
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L249-L305)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L225-L248)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L205-L224)

## Reservas

Este módulo gerencia o agendamento de mesas para os clientes.

**Propósito**: Permitir que os clientes reservem mesas para um horário específico, ajudando na gestão da capacidade do restaurante.

**Tabelas Envolvidas**:
- `reservations`: Armazena os detalhes da reserva (data, horário, número de pessoas, status).
- `tables`: A mesa reservada é referenciada pela reserva.
- `customers`: A reserva pode estar vinculada a um cliente cadastrado.

**Fluxo de Dados**:
1.  Uma nova reserva é criada na tabela `reservations` com status `confirmed`.
2.  Opcionalmente, um `table_id` é atribuído, vinculando a reserva a uma mesa específica.
3.  O status pode ser atualizado para `cancelled`, `attended` ou `no_show`.

**Integração com o Frontend**: O frontend exibe um calendário e um layout do restaurante. O usuário pode visualizar as mesas disponíveis e criar uma nova reserva arrastando para um horário livre.

**Exemplo de Relacionamento**:
```sql
-- A tabela reservations referencia tables
CREATE TABLE public.reservations (
    id integer PRIMARY KEY,
    establishment_id integer NOT NULL REFERENCES public.establishments(id),
    table_id integer REFERENCES public.tables(id) ON DELETE SET NULL,
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L178-L196)

## Estoque

Este módulo gerencia os produtos e insumos do restaurante, desde o cadastro até o controle de movimentações.

**Propósito**: Controlar o inventário de produtos, registrar entradas e saídas, e gerenciar categorias e fornecedores.

**Tabelas Envolvidas**:
- `stock_items`: Representa um item de estoque (ex: carne, farinha).
- `stock_categories`: Categorias para organizar os itens de estoque.
- `suppliers`: Fornecedores dos itens de estoque.
- `stock_movements`: Registra todas as movimentações de estoque (compras, vendas, perdas).
- `recipes`: Receitas que definem como os itens de estoque são usados para produzir produtos do cardápio.

**Fluxo de Dados**:
1.  Um novo item de estoque é cadastrado na tabela `stock_items`, vinculado a uma categoria e a um fornecedor preferencial.
2.  Quando uma compra é feita, um registro é criado na tabela `stock_movements` com `movement_type` = `entry`.
3.  Quando um produto do cardápio é vendido, um registro é criado na tabela `stock_movements` com `movement_type` = `exit`, consumindo os itens de estoque definidos na receita.

**Integração com o Frontend**: O frontend possui uma interface de gestão de estoque onde o usuário pode visualizar o saldo atual, registrar novas compras e ver o histórico de movimentações.

**Exemplo de Relacionamento**:
```sql
-- A tabela stock_movements referencia stock_items
CREATE TABLE public.stock_movements (
    id integer PRIMARY KEY,
    establishment_id integer NOT NULL REFERENCES public.establishments(id),
    stock_item_id integer NOT NULL REFERENCES public.stock_items(id) ON DELETE CASCADE,
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L335-L389)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L306-L334)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L390-L411)

## Ambientes e Mesas

Este módulo gerencia a disposição física do restaurante, incluindo ambientes (como salão principal, varanda) e mesas.

**Propósito**: Criar um layout do restaurante com diferentes ambientes e mesas, permitindo uma gestão visual da ocupação.

**Tabelas Envolvidas**:
- `environments`: Define os ambientes do restaurante.
- `tables`: Define as mesas, cada uma vinculada a um ambiente e com um número, forma e capacidade.

**Fluxo de Dados**:
1.  Um novo ambiente é criado na tabela `environments`.
2.  Mesas são adicionadas à tabela `tables`, cada uma associada a um `environment_id`.
3.  O status de uma mesa (`available`, `occupied`, `reserved`) é atualizado conforme o uso.

**Integração com o Frontend**: O frontend exibe um mapa interativo do restaurante. O usuário pode clicar em uma mesa para ver seu status ou atribuir um pedido a ela.

**Exemplo de Relacionamento**:
```sql
-- A tabela tables referencia environments
CREATE TABLE public.tables (
    id integer PRIMARY KEY,
    establishment_id integer NOT NULL REFERENCES public.establishments(id),
    environment_id integer NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L149-L177)

## Pagamentos

Este módulo gerencia os métodos de pagamento e o fechamento de pedidos.

**Propósito**: Registrar os pagamentos realizados pelos clientes, suportando múltiplos métodos (dinheiro, cartão, PIX) e gerenciar o caixa.

**Tabelas Envolvidas**:
- `payment_methods`: Define os métodos de pagamento aceitos pelo estabelecimento.
- `order_payments`: Registra o pagamento de um pedido específico.
- `cash_sessions`: Representa uma sessão de caixa (abertura e fechamento).
- `cash_session_movements`: Registra todas as movimentações dentro de uma sessão de caixa (vendas, reforços, sangrias).

**Fluxo de Dados**:
1.  Um método de pagamento é cadastrado na tabela `payment_methods`.
2.  Ao finalizar um pedido, um ou mais registros são criados na tabela `order_payments`, vinculando o `order_id` ao `payment_method_id` e ao valor pago.
3.  O caixa é aberto, criando um registro em `cash_sessions`. Todas as vendas em dinheiro são registradas como movimentações em `cash_session_movements`.

**Integração com o Frontend**: O frontend exibe uma tela de fechamento de pedido onde o usuário seleciona um ou mais métodos de pagamento e insere o valor. O sistema calcula automaticamente o troco.

**Exemplo de Relacionamento**:
```sql
-- A tabela order_payments referencia orders e payment_methods
CREATE TABLE public.order_payments (
    id integer PRIMARY KEY,
    order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method_id integer NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L412-L445)

## Relatórios

Este módulo fornece insights sobre o desempenho do estabelecimento através de dados analíticos.

**Propósito**: Gerar relatórios sobre vendas, fidelidade de clientes e feedback, permitindo decisões baseadas em dados.

**Tabelas Envolvidas**:
- `orders`, `order_items`: Fonte primária de dados para relatórios de vendas.
- `customers`: Fonte de dados para relatórios de fidelidade.
- `customer_loyalty_transactions`: Registra pontos ganhos e resgatados.
- `customer_feedback`: Armazena avaliações e comentários dos clientes.

**Fluxo de Dados**:
1.  Os dados são coletados de várias tabelas (pedidos, clientes, feedback).
2.  O sistema realiza consultas agregadas (ex: `SUM(total_amount)`, `COUNT(*)`) para calcular métricas.
3.  Os resultados são apresentados em gráficos e tabelas no frontend.

**Integração com o Frontend**: O frontend possui um painel de relatórios com filtros por período. O usuário pode selecionar um tipo de relatório (vendas diárias, produtos mais vendidos, clientes mais fiéis) e visualizar os dados em formato gráfico.

**Exemplo de Relacionamento**:
```sql
-- A tabela customer_loyalty_transactions referencia customers e loyalty_programs
CREATE TABLE public.customer_loyalty_transactions (
    id integer PRIMARY KEY,
    customer_id integer NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    loyalty_program_id integer NOT NULL REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
    -- ... outros campos
);
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L182-L196)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L446-L468)