# Arquitetura Backend (Supabase)

<cite>
**Arquivos Referenciados neste Documento**  
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura de Dados e Migrações](#estrutura-de-dados-e-migrações)
3. [Segurança e Isolamento de Inquilinos](#segurança-e-isolamento-de-inquilinos)
4. [Autenticação e Sincronização de Usuários](#autenticação-e-sincronização-de-usuários)
5. [Políticas de Segurança em Nível de Linha (RLS)](#políticas-de-segurança-em-nível-de-linha-rls)
6. [Diagrama de Arquitetura](#diagrama-de-arquitetura)

## Visão Geral da Arquitetura

O backend do sistema easyComand é construído sobre a plataforma Supabase, aproveitando seu poderoso conjunto de ferramentas para criar uma aplicação multi-inquilino segura e escalável para gerenciamento de restaurantes. A arquitetura centraliza-se em um banco de dados PostgreSQL que armazena todos os dados da aplicação, desde informações de estabelecimentos e usuários até pedidos, produtos e controle de estoque.

A estrutura é projetada para suportar múltiplos inquilinos (restaurantes) em um único banco de dados, garantindo que os dados de cada estabelecimento sejam isolados e seguros. Este isolamento é alcançado principalmente através do uso de Políticas de Segurança em Nível de Linha (RLS - Row Level Security), um recurso nativo do PostgreSQL que permite controlar o acesso a linhas específicas com base na identidade do usuário autenticado.

O sistema utiliza um modelo de migrações SQL para definir e evoluir o esquema do banco de dados de forma controlada e reversível. Todas as mudanças na estrutura do banco são realizadas por meio de scripts SQL versionados no diretório `supabase/migrations`, garantindo que o estado do banco possa ser reproduzido de forma consistente em diferentes ambientes (desenvolvimento, teste, produção).

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L1-L50)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L1-L100)

## Estrutura de Dados e Migrações

A estrutura de dados do sistema é definida por uma série de migrações SQL localizadas no diretório `supabase/migrations`. Essas migrações criam todas as tabelas, tipos de dados, funções e políticas necessárias para o funcionamento da aplicação.

### Tipos de Dados Enumerados
O sistema define diversos tipos de dados ENUM para garantir a consistência dos dados e restringir os valores possíveis em colunas específicas. Alguns exemplos incluem:
- `establishment_operational_status`: Define o status operacional de um estabelecimento (active, inactive, suspended).
- `user_status`: Define o status de um usuário (active, inactive, suspended).
- `table_status`: Define o status de uma mesa (available, occupied, reserved, maintenance).
- `order_status`: Define o status de um pedido (open, sent_to_kitchen, preparing, ready, delivered, paid, cancelled).
- `payment_method_type`: Define o tipo de método de pagamento (cash, credit_card, debit_card, pix, digital_wallet, meal_voucher).

Esses tipos de dados são criados nas migrações iniciais e são utilizados em várias tabelas para garantir que apenas valores válidos sejam inseridos.

### Tabelas Principais
O esquema do banco de dados é composto por duas categorias principais de tabelas:

1. **Tabelas Globais**: Tabelas que não são específicas de um inquilino e são compartilhadas entre todos os estabelecimentos. Exemplos incluem:
   - `establishment_types`: Define os tipos de estabelecimentos.
   - `subscription_plans`: Define os planos de assinatura do sistema.
   - `roles` e `permissions`: Define os papéis e permissões dos usuários.

2. **Tabelas Específicas de Inquilino**: Tabelas que armazenam dados pertencentes a um estabelecimento específico. Todas essas tabelas contêm uma coluna `establishment_id` que referencia o estabelecimento ao qual os dados pertencem. Exemplos incluem:
   - `establishments`: Armazena informações sobre cada estabelecimento.
   - `users`: Armazena perfis de usuários vinculados a um estabelecimento.
   - `products`: Armazena os produtos do cardápio.
   - `orders`: Armazena os pedidos realizados.
   - `tables`: Armazena as mesas do estabelecimento.
   - `customers`: Armazena informações sobre os clientes.

A coluna `establishment_id` é a chave para o isolamento de dados entre inquilinos, sendo utilizada pelas políticas RLS para garantir que os usuários só possam acessar dados do seu próprio estabelecimento.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L91-L355)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L101-L124)

## Segurança e Isolamento de Inquilinos

O isolamento de inquilinos é um aspecto fundamental da arquitetura do sistema, garantindo que os dados de um restaurante não sejam acessíveis por usuários de outros restaurantes. Este isolamento é implementado principalmente através de duas camadas: a função `get_my_establishment_id` e as Políticas de Segurança em Nível de Linha (RLS).

### Função `get_my_establishment_id`
A função `get_my_establishment_id` é uma função SQL definida no esquema `public` que desempenha um papel crucial na segurança do sistema. Ela é utilizada pelas políticas RLS para determinar a que estabelecimento pertence o usuário autenticado no momento.

A função consulta a tabela `public.users` usando o identificador do usuário fornecido pela função `auth.uid()` do Supabase (que retorna o ID do usuário autenticado) e retorna o `establishment_id` associado a esse usuário. Isso permite que as políticas RLS façam referência direta ao estabelecimento do usuário atual ao definir as condições de acesso.

Embora o nome exato da função tenha variado entre as migrações (`get_my_establishment_id`, `requesting_user_establishment_id`, `auth.get_establishment_id`, `auth.get_current_establishment_id`), o propósito e a lógica permanecem consistentes: recuperar o ID do estabelecimento do usuário autenticado.

**Section sources**
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L686-L717)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L39-L52)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L468-L485)

## Autenticação e Sincronização de Usuários

O sistema integra-se profundamente com o serviço de autenticação do Supabase, mas utiliza um mecanismo personalizado para sincronizar dados entre o esquema protegido `auth` e o esquema público `public`.

### Função e Gatilho `handle_new_user`
A função `handle_new_user` é um componente crítico da arquitetura de autenticação. Trata-se de uma função PL/pgSQL que é executada automaticamente por um gatilho (trigger) sempre que um novo usuário se cadastra no sistema (ou seja, quando uma nova linha é inserida na tabela `auth.users`).

O gatilho `on_auth_user_created` é configurado para disparar a função `handle_new_user` após cada inserção na tabela `auth.users`. A função então insere automaticamente uma nova linha na tabela `public.users`, vinculando o perfil público do usuário ao seu ID no sistema de autenticação.

Durante o cadastro, os metadados do usuário (como `full_name`, `establishment_id` e `role_id`) são passados no momento do signup. A função `handle_new_user` extrai esses metadados e os utiliza para preencher os campos correspondentes na tabela `public.users`, garantindo que o novo usuário já esteja vinculado ao seu estabelecimento e papel desde o início.

Este mecanismo evita a necessidade de uma chave estrangeira direta entre `public.users` e `auth.users`, o que poderia causar problemas de permissão, enquanto ainda mantém uma ligação segura entre os dois registros.

**Section sources**
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L649-L684)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L398-L432)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L39-L72)

## Políticas de Segurança em Nível de Linha (RLS)

As Políticas de Segurança em Nível de Linha (RLS) são o mecanismo principal de segurança do sistema, responsáveis por garantir que os usuários só possam acessar dados pertencentes ao seu próprio estabelecimento.

### Habilitação do RLS
O RLS é habilitado explicitamente em todas as tabelas específicas de inquilino utilizando o comando `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. Isso ativa o mecanismo de controle de acesso em nível de linha para a tabela.

### Políticas de Acesso
Para cada tabela com RLS habilitado, são criadas políticas que definem as condições sob as quais um usuário pode executar operações (SELECT, INSERT, UPDATE, DELETE). A política principal utilizada é:

```sql
USING (establishment_id = public.get_my_establishment_id())
```

Esta política garante que qualquer operação de leitura (SELECT) só retornará linhas cujo `establishment_id` corresponda ao estabelecimento do usuário autenticado.

Para operações de escrita (INSERT, UPDATE, DELETE), é comum utilizar a cláusula `WITH CHECK` para garantir que os dados inseridos ou modificados também pertençam ao estabelecimento correto:

```sql
WITH CHECK (establishment_id = public.get_my_establishment_id())
```

### Políticas Granulares
Além da política geral baseada no `establishment_id`, o sistema também implementa políticas mais granulares para cenários específicos. Por exemplo:
- Na tabela `users`, existe uma política que permite a um usuário atualizar apenas seu próprio perfil (`id = auth.uid()`).
- Para tabelas que não possuem diretamente a coluna `establishment_id` (como `product_images`), são criadas políticas que verificam a existência de um registro pai no estabelecimento correto, utilizando subconsultas com `EXISTS`.

Essas políticas são aplicadas a todas as tabelas relevantes, garantindo um isolamento de dados abrangente e robusto.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L356-L505)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L718-L747)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L53-L199)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L486-L547)

## Diagrama de Arquitetura

O diagrama abaixo ilustra a arquitetura geral do backend, destacando os principais componentes e seus relacionamentos.

```mermaid
graph TD
subgraph "Supabase"
subgraph "Auth Schema"
AuthUsers[auth.users<br/>- id (UUID)<br/>- email<br/>- raw_user_meta_data]
end
subgraph "Public Schema"
PublicUsers[public.users<br/>- id (UUID)<br/>- establishment_id<br/>- role_id<br/>- email<br/>- full_name]
Establishments[public.establishments<br/>- id<br/>- name<br/>- cnpj]
Products[public.products<br/>- id<br/>- establishment_id<br/>- name<br/>- normal_price]
Orders[public.orders<br/>- id<br/>- establishment_id<br/>- order_number<br/>- total_amount]
Tables[public.tables<br/>- id<br/>- establishment_id<br/>- table_number<br/>- capacity]
end
RLS[Row Level Security<br/>- Policies for each table]
HelperFunction[get_my_establishment_id()<br/>- Returns establishment_id<br/>- Based on auth.uid()]
end
subgraph "Application"
Frontend[Frontend<br/>- React/Vite]
SupabaseClient[Supabase Client<br/>- Autenticação<br/>- Consultas ao Banco]
end
Trigger[on_auth_user_created<br/>- AFTER INSERT ON auth.users<br/>- Executes handle_new_user()]
AuthUsers -- "INSERT" --> Trigger
Trigger --> PublicUsers
PublicUsers -- "SELECT establishment_id" --> HelperFunction
HelperFunction -- "establishment_id" --> RLS
RLS -- "USING (establishment_id = ...)" --> PublicUsers
RLS -- "USING (establishment_id = ...)" --> Establishments
RLS -- "USING (establishment_id = ...)" --> Products
RLS -- "USING (establishment_id = ...)" --> Orders
RLS -- "USING (establishment_id = ...)" --> Tables
Frontend --> SupabaseClient
SupabaseClient --> AuthUsers
SupabaseClient --> PublicUsers
SupabaseClient --> Establishments
SupabaseClient --> Products
SupabaseClient --> Orders
SupabaseClient --> Tables
style AuthUsers fill:#f9f,stroke:#333
style PublicUsers fill:#bbf,stroke:#333
style Establishments fill:#bbf,stroke:#333
style Products fill:#bbf,stroke:#333
style Orders fill:#bbf,stroke:#333
style Tables fill:#bbf,stroke:#333
style HelperFunction fill:#f96,stroke:#333
style RLS fill:#6f9,stroke:#333
style Trigger fill:#69f,stroke:#333
```

**Diagram sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L91-L355)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L649-L684)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L39-L199)