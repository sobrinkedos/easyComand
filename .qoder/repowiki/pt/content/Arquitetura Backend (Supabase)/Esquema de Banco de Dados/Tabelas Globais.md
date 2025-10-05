# Tabelas Globais

<cite>
**Arquivos Referenciados neste Documento**   
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Introdução](#introdução)
2. [Estrutura do Sistema de Tabelas Globais](#estrutura-do-sistema-de-tabelas-globais)
3. [Tabela `establishment_types`](#tabela-establishment_types)
4. [Tabela `subscription_plans`](#tabela-subscription_plans)
5. [Tabela `roles`](#tabela-roles)
6. [Tabela `permissions`](#tabela-permissions)
7. [Tabela `role_permissions`](#tabela-role_permissions)
8. [Diagrama de Relacionamento entre Tabelas Globais](#diagrama-de-relacionamento-entre-tabelas-globais)
9. [Fluxo de Trabalho e Exemplos de Uso](#fluxo-de-trabalho-e-exemplos-de-uso)
10. [Considerações de Segurança e Acesso](#considerações-de-segurança-e-acesso)

## Introdução

Este documento fornece uma análise detalhada das tabelas globais do sistema **easyComand**, que são compartilhadas entre todos os inquilinos (estabelecimentos) e definem as configurações centrais da aplicação. Essas tabelas são fundamentais para a arquitetura multi-inquilino do sistema, pois armazenam dados comuns que não pertencem a um único estabelecimento, mas são utilizados por todos eles.

As tabelas globais analisadas são:
- `establishment_types`: Define os tipos de estabelecimentos suportados pelo sistema.
- `subscription_plans`: Define os planos de assinatura disponíveis.
- `roles`: Define os papéis (funções) de usuário dentro do sistema.
- `permissions`: Define as permissões individuais que podem ser atribuídas a papéis.
- `role_permissions`: É uma tabela de junção que relaciona papéis a permissões.

Essas tabelas são criadas no esquema `public` do banco de dados e não estão sujeitas à Segurança em Nível de Linha (RLS) baseada em `establishment_id`, pois seu propósito é ser acessível globalmente. Elas são configuradas durante a migração inicial do banco de dados e servem como a base para a configuração central da aplicação, influenciando diretamente como os estabelecimentos são criados, como os usuários são autorizados e quais funcionalidades estão disponíveis com base no plano contratado.

## Estrutura do Sistema de Tabelas Globais

O sistema de tabelas globais é projetado para fornecer uma configuração centralizada e consistente para todos os estabelecimentos no sistema easyComand. Essas tabelas são independentes do conceito de inquilino (tenant) e são carregadas uma vez durante a configuração inicial do banco de dados.

A estrutura é baseada em um modelo de dados relacional onde:
- As tabelas `establishment_types` e `subscription_plans` são referenciadas por registros na tabela `establishments`, que é específica de cada inquilino.
- As tabelas `roles` e `permissions` formam um modelo de Controle de Acesso Baseado em Papéis (RBAC), onde os papéis são compostos por um conjunto de permissões.
- A tabela `role_permissions` atua como uma tabela de junção (many-to-many) entre `roles` e `permissions`, permitindo que um papel tenha múltiplas permissões e que uma permissão possa ser atribuída a múltiplos papéis.

Essa estrutura centralizada permite que a equipe de desenvolvimento e administração do sistema defina uma política de acesso e uma estrutura de planos de assinatura de forma uniforme, garantindo que todas as instâncias do sistema operem com as mesmas regras fundamentais.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L30-L150)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L40-L150)

## Tabela `establishment_types`

A tabela `establishment_types` define os diferentes tipos de estabelecimentos que podem ser criados no sistema easyComand. Isso permite que a aplicação se adapte a diferentes modelos de negócio, como restaurantes, bares, cafés, pizzarias, entre outros.

### Estrutura e Restrições
- **`id`**: Chave primária do tipo de estabelecimento. É um inteiro gerado automaticamente (`SERIAL`).
- **`name`**: Nome do tipo de estabelecimento (ex: "Restaurante", "Bar", "Cafeteria"). É uma string de até 255 caracteres e possui uma restrição de unicidade (`UNIQUE`), garantindo que não haja dois tipos com o mesmo nome.
- **`created_at`**: Timestamp que registra quando o registro foi criado. Tem um valor padrão de `now()`.
- **`updated_at`**: Timestamp que registra a última atualização do registro. Também tem um valor padrão de `now()`.

### Relacionamentos
Esta tabela é referenciada pela tabela `establishments` através da coluna `establishment_type_id`, que é uma chave estrangeira. Isso significa que ao criar um novo estabelecimento, ele deve ser associado a um tipo existente nesta tabela.

### Exemplo de Uso
Para registrar um novo tipo de estabelecimento, como "Lanchonete", um administrador do sistema executaria um comando SQL como:
```sql
INSERT INTO public.establishment_types (name) VALUES ('Lanchonete');
```
Após essa inserção, qualquer novo estabelecimento criado na interface do sistema poderá selecionar "Lanchonete" como seu tipo.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L30-L35)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L40-L45)

## Tabela `subscription_plans`

A tabela `subscription_plans` define os planos de assinatura que os estabelecimentos podem adquirir para utilizar o sistema easyComand. Cada plano oferece um conjunto diferente de funcionalidades e limites, permitindo uma estratégia de precificação por níveis.

### Estrutura e Restrições
- **`id`**: Chave primária do plano de assinatura. É um inteiro gerado automaticamente (`SERIAL`).
- **`name`**: Nome do plano (ex: "Básico", "Premium", "Enterprise"). É uma string de até 255 caracteres com restrição de unicidade.
- **`description`**: Texto descritivo que detalha as características do plano.
- **`price`**: Preço mensal do plano, armazenado como um número decimal com precisão de 10 dígitos e 2 casas decimais.
- **`features`**: Um campo do tipo `jsonb` que pode armazenar uma lista estruturada de funcionalidades incluídas no plano (ex: número máximo de produtos, suporte prioritário, integração com plataformas de entrega).
- **`created_at`**: Timestamp de criação do plano.
- **`updated_at`**: Timestamp da última atualização do plano.

### Relacionamentos
Esta tabela é referenciada pela tabela `establishments` através da coluna `subscription_plan_id`, que é uma chave estrangeira. O plano de assinatura de um estabelecimento determina quais funcionalidades estão disponíveis para ele.

### Exemplo de Uso
Para criar um novo plano chamado "Avançado" com um preço de R$ 199,90, um administrador executaria:
```sql
INSERT INTO public.subscription_plans (name, description, price, features)
VALUES ('Avançado', 'Plano com funcionalidades avançadas de relatórios e integração.', 199.90, '{"max_products": 500, "delivery_integration": true}');
```
Um estabelecimento novo ou existente pode então ser atualizado para usar este plano.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L37-L45)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L47-L57)

## Tabela `roles`

A tabela `roles` define os papéis (ou funções) que os usuários podem ter dentro de um estabelecimento. Este é um componente central do modelo de segurança do sistema, permitindo a definição de diferentes níveis de acesso.

### Estrutura e Restrições
- **`id`**: Chave primária do papel. É um inteiro gerado automaticamente.
- **`name`**: Nome do papel (ex: "Proprietário", "Gerente", "Garçom", "Cozinheiro"). É uma string única.
- **`description`**: Texto descritivo que explica as responsabilidades e permissões típicas do papel.
- **`created_at`**: Timestamp de criação.
- **`updated_at`**: Timestamp da última atualização.

### Relacionamentos
Esta tabela é referenciada pela tabela `users` (no esquema público) através da coluna `role_id`, que é uma chave estrangeira. Isso significa que cada usuário em um estabelecimento é atribuído a um papel específico.

### Exemplo de Uso
Para criar um novo papel chamado "Supervisor de Qualidade", um administrador do sistema poderia executar:
```sql
INSERT INTO public.roles (name, description)
VALUES ('Supervisor de Qualidade', 'Responsável por realizar inspeções de controle de qualidade.');
```
Após a criação, os administradores dos estabelecimentos poderão atribuir este papel a usuários específicos, que então terão acesso às funcionalidades relacionadas ao controle de qualidade.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L47-L52)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L59-L64)

## Tabela `permissions`

A tabela `permissions` define as permissões individuais que podem ser concedidas aos papéis. Cada permissão representa uma ação específica que um usuário pode realizar no sistema.

### Estrutura e Restrições
- **`id`**: Chave primária da permissão. É um inteiro gerado automaticamente.
- **`name`**: Nome da permissão, geralmente no formato `recurso.acao` (ex: `products.create`, `orders.view`, `users.manage`). É uma string única.
- **`description`**: Descrição clara da ação que a permissão permite.
- **`created_at`**: Timestamp de criação.
- **`updated_at`**: Timestamp da última atualização.

### Relacionamentos
Esta tabela não é referenciada diretamente por tabelas de inquilino. Em vez disso, ela é usada indiretamente através da tabela de junção `role_permissions`, que a vincula aos papéis.

### Exemplo de Uso
Para adicionar uma nova permissão que permita a geração de relatórios financeiros, um administrador executaria:
```sql
INSERT INTO public.permissions (name, description)
VALUES ('reports.finance.generate', 'Permite ao usuário gerar relatórios financeiros do estabelecimento.');
```
Essa permissão pode então ser atribuída a um papel, como "Gerente", através da tabela `role_permissions`.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L54-L59)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L66-L71)

## Tabela `role_permissions`

A tabela `role_permissions` é uma tabela de junção (junction table) que implementa a relação muitos-para-muitos (many-to-many) entre as tabelas `roles` e `permissions`. Ela é essencial para o funcionamento do modelo RBAC (Role-Based Access Control).

### Estrutura e Restrições
- **`role_id`**: Chave estrangeira que referencia o `id` na tabela `roles`. Tem uma cláusula `ON DELETE CASCADE`, o que significa que se um papel for excluído, todas as suas atribuições de permissão serão automaticamente removidas.
- **`permission_id`**: Chave estrangeira que referencia o `id` na tabela `permissions`. Também tem `ON DELETE CASCADE`.
- **`created_at`**: Timestamp de quando a permissão foi atribuída ao papel.
- **`updated_at`**: Timestamp da última atualização da atribuição.
- **Chave Primária Composta**: A chave primária é definida como `(role_id, permission_id)`, garantindo que um papel não possa ter a mesma permissão atribuída mais de uma vez.

### Relacionamentos
Esta tabela é a peça central que conecta papéis a permissões. Ela não é referenciada por outras tabelas, mas é consultada pelo sistema de autorização para determinar se um usuário (através do seu papel) tem permissão para executar uma ação.

### Exemplo de Uso
Para conceder a permissão `products.create` ao papel "Gerente", um administrador executaria:
```sql
INSERT INTO public.role_permissions (role_id, permission_id)
VALUES (
  (SELECT id FROM public.roles WHERE name = 'Gerente'),
  (SELECT id FROM public.permissions WHERE name = 'products.create')
);
```
Esta operação vincula explicitamente a capacidade de criar produtos ao papel de gerente. Qualquer usuário com esse papel herdará automaticamente essa permissão.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L61-L70)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L73-L83)

## Diagrama de Relacionamento entre Tabelas Globais

O diagrama abaixo ilustra as relações entre as tabelas globais do sistema easyComand. As setas indicam as direções das chaves estrangeiras.

```mermaid
erDiagram
establishment_types ||--o{ establishments : "tem"
subscription_plans ||--o{ establishments : "possui"
roles ||--o{ users : "atribuído_a"
permissions ||--o{ role_permissions : "possuído_por"
roles ||--o{ role_permissions : "possui"
establishment_types {
integer id PK
varchar(255) name UK
timestamptz created_at
timestamptz updated_at
}
subscription_plans {
integer id PK
varchar(255) name UK
text description
decimal(10,2) price
jsonb features
timestamptz created_at
timestamptz updated_at
}
roles {
integer id PK
varchar(255) name UK
text description
timestamptz created_at
timestamptz updated_at
}
permissions {
integer id PK
varchar(255) name UK
text description
timestamptz created_at
timestamptz updated_at
}
role_permissions {
integer role_id FK
integer permission_id FK
timestamptz created_at
timestamptz updated_at
PK role_id, permission_id
}
establishments {
integer id PK
integer establishment_type_id FK
integer subscription_plan_id FK
}
users {
uuid id PK
integer role_id FK
}
```

**Diagram sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L30-L70)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L40-L83)

## Fluxo de Trabalho e Exemplos de Uso

Este sistema de tabelas globais suporta fluxos de trabalho essenciais para a operação e administração do easyComand.

### Criação de um Novo Tipo de Estabelecimento
1. Um administrador do sistema identifica a necessidade de um novo tipo de estabelecimento (ex: "Food Truck").
2. Ele executa um `INSERT` na tabela `establishment_types`.
3. Ao criar um novo estabelecimento na interface, o operador pode selecionar "Food Truck" como o tipo.
4. O sistema cria um registro em `establishments` com a `establishment_type_id` correspondente.

### Definição de um Novo Papel com Permissões
1. Um administrador decide criar um papel "Auxiliar de Cozinha".
2. Ele insere um novo registro na tabela `roles`.
3. Ele identifica as permissões necessárias (ex: `products.view`, `order_items.update`).
4. Ele insere registros na tabela `role_permissions` para vincular o novo papel às permissões.
5. Quando um usuário é criado com o papel "Auxiliar de Cozinha", ele automaticamente herda essas permissões.

### Atualização de um Plano de Assinatura
1. A equipe de negócios decide atualizar o plano "Premium" para incluir uma nova funcionalidade.
2. Um administrador atualiza o registro na tabela `subscription_plans`, modificando o campo `features` para incluir a nova funcionalidade.
3. Todos os estabelecimentos com o plano "Premium" passam a ter acesso à nova funcionalidade imediatamente.

Esses fluxos demonstram como as tabelas globais permitem uma configuração centralizada e eficiente, onde mudanças feitas uma vez se propagam para todos os inquilinos do sistema.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L30-L70)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L40-L83)

## Considerações de Segurança e Acesso

As tabelas globais são um ponto crítico de segurança no sistema easyComand. Como elas definem as regras fundamentais de acesso e funcionalidade, seu acesso deve ser estritamente controlado.

- **Acesso Restrito**: Apenas usuários com privilégios de administrador do sistema (não apenas administradores de estabelecimento) devem ter permissão para modificar essas tabelas. Isso é geralmente gerenciado fora do banco de dados, na camada da aplicação.
- **Auditoria**: Embora não esteja explicitamente definido nas migrações fornecidas, é uma boa prática manter um log de auditoria para rastrear quem fez alterações em tabelas globais, especialmente em `role_permissions`.
- **Consistência de Dados**: As restrições de unicidade (`UNIQUE`) em campos como `name` são cruciais para evitar ambiguidades. Por exemplo, dois papéis com o mesmo nome poderiam causar falhas de autorização.
- **Integridade Referencial**: As chaves estrangeiras com `ON DELETE CASCADE` garantem que a exclusão de um papel ou permissão não deixe registros órfãos na tabela `role_permissions`, mantendo a integridade do modelo RBAC.

A segurança dessas tabelas é reforçada pelo fato de que elas não estão sujeitas à RLS baseada em `establishment_id`. Isso significa que qualquer usuário autenticado com privilégios suficientes pode acessá-las, independentemente do seu estabelecimento, o que destaca a importância de um controle rigoroso de acesso na camada da aplicação.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L61-L70)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L10-L25)