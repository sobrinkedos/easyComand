# Gestão de Estabelecimentos

<cite>
**Arquivos Referenciados neste Documento**  
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
</cite>

## Sumário
1. [Introdução](#introdução)
2. [Estrutura da Tabela `establishments`](#estrutura-da-tabela-establishments)
3. [Chaves Estrangeiras e Relacionamentos](#chaves-estrangeiras-e-relacionamentos)
4. [Políticas de Segurança (RLS)](#políticas-de-segurança-rls)
5. [Exemplos de Consultas](#exemplos-de-consultas)
6. [Considerações Finais](#considerações-finais)

## Introdução

Este documento detalha a estrutura e funcionalidades relacionadas à tabela `establishments` no sistema easyComand, uma aplicação de gestão para estabelecimentos comerciais com arquitetura multi-inquilino. A tabela `establishments` é o núcleo do sistema, representando cada unidade de negócio registrada na plataforma, como restaurantes, bares ou cafés. Ela armazena informações essenciais como identificação, localização, tipo de negócio, plano de assinatura e status operacional. O sistema garante o isolamento de dados entre diferentes inquilinos (estabelecimentos) através de políticas rigorosas de segurança no nível de linha (Row Level Security - RLS), assegurando que os dados de um estabelecimento sejam inacessíveis a usuários de outros estabelecimentos. Esta documentação é fundamental para desenvolvedores que implementam funcionalidades de cadastro, configuração e gerenciamento de estabelecimentos.

**Section sources**
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L101-L124)

## Estrutura da Tabela `establishments`

A tabela `establishments` é uma tabela central no esquema de banco de dados do easyComand, projetada para armazenar todos os dados específicos de um estabelecimento. Cada registro na tabela representa uma entidade comercial única. A estrutura da tabela é definida com campos que capturam informações administrativas, fiscais, de localização e operacionais.

Abaixo está um resumo dos principais campos:

| Campo | Tipo de Dado | Obrigatório | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `serial` | Sim | - | Identificador único do estabelecimento. Chave primária da tabela. |
| `name` | `varchar(255)` | Sim | - | Nome comercial do estabelecimento (ex: "Restaurante Sabor da Cidade"). |
| `cnpj` | `varchar(18)` | Sim | - | Número de Cadastro Nacional da Pessoa Jurídica, único para cada estabelecimento. |
| `establishment_type_id` | `integer` | Sim | - | Chave estrangeira que referencia o tipo de estabelecimento (ex: restaurante, bar, lanchonete). |
| `address_street` | `varchar(255)` | Sim | - | Nome da rua ou avenida. |
| `address_number` | `varchar(50)` | Sim | - | Número do endereço. |
| `address_complement` | `varchar(255)` | Não | `NULL` | Complemento do endereço (ex: "Sala 10", "Fundos"). |
| `address_neighborhood` | `varchar(255)` | Sim | - | Bairro onde o estabelecimento está localizado. |
| `address_city` | `varchar(255)` | Sim | - | Cidade do estabelecimento. |
| `address_state` | `varchar(2)` | Sim | - | Sigla do estado (ex: SP, RJ). |
| `address_zip_code` | `varchar(10)` | Sim | - | CEP do endereço. |
| `subscription_plan_id` | `integer` | Sim | - | Chave estrangeira que referencia o plano de assinatura ativo do estabelecimento. |
| `operational_status` | `establishment_operational_status` | Sim | `'active'` | Status operacional do estabelecimento. Um tipo ENUM com valores: `active`, `inactive`, `suspended`. |
| `table_capacity` | `integer` | Não | `NULL` | Capacidade total de mesas do estabelecimento. |
| `accepts_delivery` | `boolean` | Sim | `false` | Indica se o estabelecimento oferece serviço de entrega. |
| `accepts_reservations` | `boolean` | Sim | `false` | Indica se o estabelecimento aceita reservas de mesas. |
| `service_fee_percentage` | `decimal(5, 2)` | Não | `0.00` | Percentual de taxa de serviço cobrada nas comandas. |
| `created_at` | `timestamptz` | Sim | `now()` | Timestamp de criação do registro. |
| `updated_at` | `timestamptz` | Sim | `now()` | Timestamp da última atualização do registro. |

Essa estrutura permite uma modelagem rica e flexível, suportando diferentes tipos de negócios e suas necessidades operacionais específicas.

**Section sources**
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L101-L124)

## Chaves Estrangeiras e Relacionamentos

A tabela `establishments` depende de outras tabelas globais para manter a integridade referencial e evitar redundância de dados. As principais chaves estrangeiras são:

### `establishment_type_id` (Referência: `establishment_types`)
Este campo estabelece uma relação com a tabela `establishment_types`, que contém uma lista padronizada de tipos de estabelecimentos (por exemplo, "Restaurante", "Bar", "Cafeteria", "Pizzaria"). Isso permite que o sistema categorize os estabelecimentos de forma consistente e possa aplicar regras de negócio específicas baseadas no tipo. A relação é definida como `NOT NULL` e `ON DELETE CASCADE`, o que significa que um tipo de estabelecimento não pode ser excluído se houver estabelecimentos vinculados a ele.

### `subscription_plan_id` (Referência: `subscription_plans`)
Este campo vincula o estabelecimento a um plano de assinatura específico, definido na tabela `subscription_plans`. Essa tabela armazena informações sobre diferentes planos oferecidos pela plataforma, como nome, preço, descrição e uma lista de funcionalidades disponíveis (armazenadas em um campo `jsonb`). Isso permite que o sistema controle o acesso às funcionalidades do sistema com base no plano contratado pelo estabelecimento. A relação também é `NOT NULL` e `ON DELETE CASCADE`, garantindo que um plano não possa ser removido enquanto estiver em uso.

Essas relações são fundamentais para a arquitetura do sistema, promovendo a normalização dos dados e a escalabilidade.

**Section sources**
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L101-L124)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L60-L75)

## Políticas de Segurança (RLS)

A segurança e o isolamento de dados entre diferentes inquilinos (estabelecimentos) são garantidos pelo mecanismo de **Row Level Security (RLS)** do PostgreSQL, implementado no Supabase. As políticas de RLS são aplicadas à tabela `establishments` e a todas as demais tabelas que contêm o campo `establishment_id`, assegurando que um usuário só possa acessar dados do seu próprio estabelecimento.

### Função de Segurança `get_my_establishment_id()`
A política de segurança depende de uma função auxiliar que determina a qual estabelecimento o usuário autenticado pertence. A função `public.get_my_establishment_id()` (ou variações como `public.requesting_user_establishment_id()` ou `auth.get_current_establishment_id()` em diferentes versões do esquema) é crucial para esse processo. Ela executa a seguinte lógica:
1.  Usa `auth.uid()` para obter o ID do usuário autenticado no sistema de autenticação do Supabase.
2.  Consulta a tabela `public.users` para encontrar o registro correspondente ao `id` do usuário.
3.  Retorna o valor do campo `establishment_id` desse registro.

Essa função é marcada como `SECURITY DEFINER`, o que permite que ela acesse dados que o usuário autenticado normalmente não poderia, garantindo que a consulta seja executada com privilégios elevados.

### Políticas de RLS na Tabela `establishments`
As políticas de RLS definidas para a tabela `establishments` evoluíram ao longo das migrações do banco de dados, mas o princípio central permanece o mesmo: **isolar os dados por inquilino**.

-   **Política de Leitura (SELECT)**: A política mais comum é `USING (id = public.get_my_establishment_id())`. Isso significa que um usuário só pode selecionar (ver) o registro do estabelecimento cujo `id` corresponde ao `establishment_id` retornado pela função de segurança. Como um usuário pertence a apenas um estabelecimento, ele só pode ver um único registro nesta tabela.
-   **Política de Escrita (INSERT, UPDATE, DELETE)**: Em versões mais robustas do esquema, as políticas de escrita são mais granulares. Por exemplo, pode haver uma política de `UPDATE` que exige `USING (id = auth.get_current_establishment_id()) AND auth.get_current_user_role_id() <= 2`, permitindo apenas que proprietários (role_id=1) ou gerentes (role_id=2) atualizem as informações do estabelecimento.

Essas políticas são aplicadas automaticamente em todas as consultas feitas ao banco de dados, fornecendo uma camada de segurança transparente e eficaz contra vazamentos de dados entre inquilinos.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L441)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L59)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L497-L498)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L686-L717)

## Exemplos de Consultas

Os exemplos abaixo demonstram como interagir com a tabela `establishments` de forma segura, utilizando as funções de segurança para garantir o isolamento de dados.

### Criar um Novo Estabelecimento
Para criar um novo estabelecimento, você insere um novo registro na tabela. A função de segurança `handle_new_user` é responsável por vincular o usuário criador ao novo estabelecimento, geralmente através de metadados fornecidos durante o processo de cadastro.

```sql
-- Este exemplo é conceitual. A criação real é feita via aplicação.
INSERT INTO public.establishments (
    name, cnpj, establishment_type_id, 
    address_street, address_number, address_complement, 
    address_neighborhood, address_city, address_state, address_zip_code,
    subscription_plan_id, operational_status
) VALUES (
    'Meu Novo Restaurante', '12.345.678/0001-90', 1,
    'Avenida Principal', '100', 'Sala 1',
    'Centro', 'São Paulo', 'SP', '01001-000',
    2, 'active'
);
```

### Listar o Estabelecimento do Usuário Atual
Esta é a consulta mais comum e segura. Ela utiliza a função `get_my_establishment_id()` para garantir que o usuário só veja seu próprio estabelecimento.

```sql
-- Consulta segura que respeita a política de RLS
SELECT 
    id, name, cnpj, operational_status, 
    address_street, address_number, address_city, address_state
FROM public.establishments 
WHERE id = public.get_my_establishment_id();
```

### Atualizar Informações do Estabelecimento
Para atualizar informações, como mudar o status operacional, a consulta deve garantir que a alteração esteja sendo feita no estabelecimento correto. A política de RLS faz isso automaticamente.

```sql
-- Atualiza o status operacional para 'inactive'
UPDATE public.establishments 
SET 
    operational_status = 'inactive',
    updated_at = now()
WHERE id = public.get_my_establishment_id();
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L441)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L59)

## Considerações Finais

A tabela `establishments` é a pedra angular da arquitetura multi-inquilino do sistema easyComand. Sua estrutura bem definida, combinada com o uso rigoroso de chaves estrangeiras e políticas de segurança RLS, cria um sistema robusto, seguro e escalável. A função `get_my_establishment_id()` (ou suas variações) é o componente crítico que permite o isolamento de dados, sendo o elo entre a autenticação do usuário e a autorização de acesso aos dados do seu estabelecimento. Ao seguir os padrões de consulta demonstrados, os desenvolvedores podem garantir que todas as operações de banco de dados sejam realizadas de forma segura, protegendo a privacidade e a integridade dos dados de cada cliente do sistema.