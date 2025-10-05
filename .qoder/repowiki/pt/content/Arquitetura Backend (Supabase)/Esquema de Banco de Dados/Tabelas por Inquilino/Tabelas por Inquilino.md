# Tabelas por Inquilino

<cite>
**Referenced Files in This Document**   
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Introdução](#introdução)
2. [Tabelas por Inquilino e Isolamento de Dados](#tabelas-por-inquilino-e-isolamento-de-dados)
3. [Política de Segurança em Nível de Linha (RLS)](#política-de-segurança-em-nível-de-linha-rls)
4. [Relacionamentos entre Tabelas](#relacionamentos-entre-tabelas)
5. [Chaves Estrangeiras e Restrições](#chaves-estrangeiras-e-restrições)
6. [Diagrama de Modelo de Dados](#diagrama-de-modelo-de-dados)

## Introdução

Este documento fornece uma análise detalhada do modelo de dados multi-inquilino do sistema **easyComand**. O sistema é projetado para gerenciar múltiplos estabelecimentos (inquilinos) em um único banco de dados, garantindo que os dados de cada estabelecimento sejam isolados e seguros. A coluna `establishment_id` é o pilar central dessa arquitetura, presente em todas as tabelas que armazenam dados específicos de um estabelecimento. Este documento detalha as principais tabelas, a política de segurança que garante o isolamento de dados e os relacionamentos entre as entidades do sistema.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L1-L50)

## Tabelas por Inquilino e Isolamento de Dados

O sistema easyComand utiliza um modelo de dados multi-inquilino onde todas as tabelas que contêm informações específicas de um estabelecimento possuem uma coluna `establishment_id`. Esta coluna é uma chave estrangeira que referencia a tabela `establishments` e é fundamental para o isolamento de dados.

As principais tabelas que seguem este padrão são:

*   **`establishments`**: Armazena informações sobre cada estabelecimento, como nome, CNPJ, endereço e plano de assinatura.
*   **`users`**: Armazena perfis de usuários (funcionários) e associa cada um a um estabelecimento específico.
*   **`products`**: Armazena o cardápio do estabelecimento, incluindo nome, preço e descrição dos produtos.
*   **`orders`**: Registra todos os pedidos realizados, vinculando-os ao estabelecimento onde foram feitos.
*   **`tables`**: Define as mesas físicas do estabelecimento, seu número, capacidade e status.
*   **`reservations`**: Gerencia as reservas de mesas, associando-as a um estabelecimento e a uma mesa específica.
*   **`suppliers`**: Mantém o cadastro de fornecedores de cada estabelecimento.
*   **`stock_items`**: Controla os itens de estoque, como ingredientes e materiais, pertencentes a um estabelecimento.

A presença da coluna `establishment_id` em todas essas tabelas permite que o sistema identifique imediatamente a qual inquilino pertence cada registro, formando a base para a aplicação de políticas de segurança.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L112-L499)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L101-L747)

## Política de Segurança em Nível de Linha (RLS)

A segurança e o isolamento de dados entre inquilinos são garantidos pela **Política de Segurança em Nível de Linha (Row Level Security - RLS)** do PostgreSQL, implementada no Supabase. A RLS é ativada em todas as tabelas que possuem a coluna `establishment_id`.

O mecanismo funciona da seguinte maneira:

1.  **Função de Ajuda**: Uma função chamada `public.get_my_establishment_id()` (ou `public.requesting_user_establishment_id()` em versões corrigidas) é definida. Esta função consulta a tabela `users` para encontrar o `establishment_id` do usuário autenticado (identificado por `auth.uid()`).
2.  **Ativação da RLS**: A RLS é ativada em cada tabela de inquilino com o comando `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
3.  **Criação de Políticas**: Para cada tabela, uma política de RLS é criada. A condição `USING` de todas as políticas verifica se o `establishment_id` do registro na tabela é igual ao `establishment_id` retornado pela função de ajuda.

Por exemplo, a política para a tabela `products` é definida como:
```sql
CREATE POLICY "Tenant isolation for products" ON public.products USING (establishment_id = public.get_my_establishment_id());
```

Isso significa que, quando um usuário autenticado faz uma consulta (SELECT), apenas os produtos cujo `establishment_id` corresponde ao do seu estabelecimento serão retornados. O mesmo princípio se aplica a operações de inserção (INSERT), atualização (UPDATE) e exclusão (DELETE), garantindo que um usuário só possa modificar dados do seu próprio estabelecimento.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L469-L499)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L39-L72)

## Relacionamentos entre Tabelas

O modelo de dados do easyComand define uma série de relacionamentos entre as tabelas para representar a lógica de negócio de um restaurante.

*   **Produtos e Categorias de Menu**: A tabela `products` possui uma chave estrangeira `category_id` que referencia a tabela `menu_categories`. Isso permite organizar o cardápio em categorias como "Bebidas", "Pratos Principais" ou "Sobremesas".
*   **Pedidos e Itens de Pedido**: A tabela `orders` é o registro principal de um pedido. A tabela `order_items` representa os itens individuais dentro de um pedido, com uma chave estrangeira `order_id` que referencia `orders`. Um pedido pode conter múltiplos itens.
*   **Reservas e Mesas**: A tabela `reservations` possui uma chave estrangeira `table_id` que referencia a tabela `tables`. Isso permite associar uma reserva a uma mesa específica dentro do estabelecimento.
*   **Itens de Estoque e Fornecedores**: A tabela `stock_items` tem uma chave estrangeira `preferred_supplier_id` que referencia a tabela `suppliers`, indicando qual fornecedor é preferido para a reposição daquele item.

Esses relacionamentos são fundamentais para a integridade dos dados e para a funcionalidade do sistema, permitindo consultas complexas e relatórios detalhados.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L280-L320)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L340-L360)

## Chaves Estrangeiras e Restrições

O modelo de dados utiliza chaves estrangeiras para garantir a integridade referencial, o que significa que o banco de dados impede a criação de registros inválidos.

*   **Integridade Referencial**: A cláusula `REFERENCES` em uma coluna cria uma chave estrangeira. Por exemplo, `products.category_id` referencia `menu_categories.id`. Isso garante que um produto só possa ser criado se a categoria especificada já existir.
*   **Ações em Cascata**: A cláusula `ON DELETE CASCADE` é usada em muitas chaves estrangeiras. Por exemplo, se um `establishment` for excluído, todos os seus `users`, `products`, `orders` e outras entidades relacionadas também serão excluídos automaticamente, evitando dados órfãos.
*   **Restrições de Unicidade**: As cláusulas `UNIQUE` são usadas para garantir que certos valores sejam únicos dentro do contexto de um estabelecimento. Por exemplo, `UNIQUE (establishment_id, name)` na tabela `products` garante que um estabelecimento não possa ter dois produtos com o mesmo nome, mas dois estabelecimentos diferentes podem ter produtos com o mesmo nome sem conflito.

Essas restrições são essenciais para manter a consistência e a qualidade dos dados no sistema.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L112-L499)

## Diagrama de Modelo de Dados

O diagrama abaixo ilustra as principais tabelas do sistema easyComand, seus relacionamentos e a coluna `establishment_id` que garante o isolamento de dados.

```mermaid
erDiagram
establishments ||--o{ users : "possui"
establishments ||--o{ products : "possui"
establishments ||--o{ orders : "possui"
establishments ||--o{ tables : "possui"
establishments ||--o{ reservations : "possui"
establishments ||--o{ suppliers : "possui"
establishments ||--o{ stock_items : "possui"
menu_categories ||--o{ products : "contém"
orders ||--o{ order_items : "contém"
tables ||--o{ reservations : "associada_a"
suppliers ||--o{ stock_items : "fornecido_por"
establishments {
integer id PK
varchar(255) name
varchar(18) cnpj UK
integer establishment_type_id FK
varchar(255) address_street
varchar(50) address_number
varchar(255) address_complement
varchar(255) address_neighborhood
varchar(255) address_city
varchar(2) address_state
varchar(10) address_zip_code
integer subscription_plan_id FK
establishment_operational_status operational_status
integer table_capacity
boolean accepts_delivery
boolean accepts_reservations
numeric(5, 2) service_fee_percentage
timestamptz created_at
timestamptz updated_at
}
users {
uuid id PK
integer establishment_id FK
varchar(255) full_name
varchar(255) email UK
varchar(20) phone_number
integer role_id FK
numeric(10, 2) salary
date admission_date
user_status status
timestamptz last_login_at
timestamptz created_at
timestamptz updated_at
}
products {
integer id PK
integer establishment_id FK
integer category_id FK
varchar(255) name UK
text description
text ingredients
numeric(10, 2) normal_price
numeric(10, 2) promotional_price
boolean is_promotional
integer calories
jsonb allergens
boolean is_vegetarian
boolean is_vegan
boolean is_gluten_free
boolean is_lactose_free
integer preparation_time_minutes
boolean is_available
timestamptz created_at
timestamptz updated_at
}
orders {
integer id PK
integer establishment_id FK
date order_date
varchar(50) order_number UK
order_type order_type
integer table_id FK
uuid waiter_id FK
integer customer_id FK
varchar(255) delivery_address_street
varchar(50) delivery_address_number
varchar(255) delivery_address_complement
varchar(255) delivery_address_neighborhood
varchar(255) delivery_address_city
varchar(2) delivery_address_state
varchar(10) delivery_address_zip_code
order_status status
numeric(10, 2) subtotal
numeric(10, 2) service_fee_amount
numeric(10, 2) delivery_fee_amount
numeric(10, 2) discount_amount
numeric(10, 2) total_amount
text notes
timestamptz created_at
timestamptz updated_at
}
tables {
integer id PK
integer establishment_id FK
integer environment_id FK
varchar(50) table_number UK
table_shape shape
integer capacity
table_status status
text notes
integer layout_x
integer layout_y
timestamptz created_at
timestamptz updated_at
}
reservations {
integer id PK
integer establishment_id FK
varchar(255) customer_name
varchar(20) customer_phone
varchar(255) customer_email
integer number_of_people
date reservation_date
time reservation_time
reservation_status status
integer table_id FK
text notes
timestamptz created_at
timestamptz updated_at
}
suppliers {
integer id PK
integer establishment_id FK
varchar(255) name
varchar(18) cnpj_cpf UK
varchar(255) contact_person
varchar(20) phone
varchar(255) email
varchar(255) address_street
varchar(50) address_number
varchar(255) address_complement
varchar(255) address_neighborhood
varchar(255) address_city
varchar(2) address_state
varchar(10) address_zip_code
text payment_terms
text special_conditions
numeric(3, 2) rating
timestamptz created_at
timestamptz updated_at
}
stock_items {
integer id PK
integer establishment_id FK
integer category_id FK
varchar(255) name UK
text description
varchar(255) barcode UK
stock_item_unit_of_measure unit_of_measure
varchar(255) storage_location
integer min_stock_level
integer preferred_supplier_id FK
numeric(10, 2) current_cost_price
timestamptz created_at
timestamptz updated_at
}
menu_categories {
integer id PK
integer establishment_id FK
varchar(255) name UK
text description
varchar(255) icon
varchar(7) color
integer display_order
boolean is_seasonal
time available_from
time available_until
timestamptz created_at
timestamptz updated_at
}
```

**Diagram sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L112-L499)