# Triggers e Funções de Banco de Dados

<cite>
**Arquivos Referenciados neste Documento**  
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Tabela de Conteúdos
1. [Introdução](#introdução)
2. [Função handle_new_user()](#função-handle_new_user)
3. [Função requesting_user_establishment_id()](#função-requesting_user_establishment_id)
4. [Fluxo de Dados e Segurança](#fluxo-de-dados-e-segurança)
5. [Conclusão](#conclusão)

## Introdução

Este documento detalha as funções armazenadas e triggers críticas no banco de dados do sistema easyComand, responsáveis pela integração segura entre a autenticação de usuários e a lógica de negócios multi-inquilino. O foco está em duas funções principais: `handle_new_user()`, que automatiza a criação de perfis de usuário, e `requesting_user_establishment_id()`, que é fundamental para a aplicação de políticas de segurança de isolamento de dados entre inquilinos. Essas funções são pilares da arquitetura de segurança e automação do sistema.

## Função handle_new_user()

A função `handle_new_user()` é um componente essencial do processo de onboarding de novos usuários no sistema easyComand. Ela é acionada automaticamente por um trigger sempre que um novo usuário se cadastra na plataforma de autenticação (Supabase Auth), garantindo que um perfil correspondente seja criado de forma síncrona no schema público do banco de dados.

**Seu papel crucial é:**
- **Sincronização Automática:** Eliminar a necessidade de um passo manual de criação de perfil após o login.
- **Integridade de Dados:** Garantir que todo usuário autenticado tenha um registro correspondente na tabela `public.users`.
- **Fluxo de Automação:** Permitir que o sistema comece a rastrear atividades e atribuir permissões imediatamente após o cadastro.

A função é definida com atributos de segurança específicos para operar corretamente no contexto do schema `auth`:

- **`SECURITY DEFINER`:** Esta cláusula permite que a função execute com os privilégios do seu proprietário (geralmente um superusuário), não com os privilégios do usuário que disparou o evento. Isso é necessário porque o schema `auth` é protegido e usuários regulares não têm permissão para inserir dados diretamente na tabela `auth.users`. A função, sendo um `SECURITY DEFINER`, pode contornar essa restrição para realizar a inserção no schema `public`.
- **`SET search_path = public`:** Esta configuração garante que todos os comandos SQL dentro da função sejam executados no schema `public`, evitando ambiguidades e garantindo que a inserção ocorra na tabela `public.users` e não em alguma tabela com nome semelhante em outro schema.

**Parâmetros Extraídos dos Metadados:**
Durante o processo de cadastro, o cliente (frontend) pode enviar metadados personalizados junto com as credenciais. A função `handle_new_user()` extrai esses dados do campo `raw_user_meta_data` do novo registro em `auth.users`:
- **`full_name`:** O nome completo do usuário, acessado via `new.raw_user_meta_data->>'full_name'`.
- **`establishment_id`:** O ID do estabelecimento ao qual o usuário pertence, acessado via `(new.raw_user_meta_data->>'establishment_id')::integer`.
- **`role_id`:** O ID do papel (role) do usuário no estabelecimento, acessado via `(new.raw_user_meta_data->>'role_id')::integer`.

Esses valores são então inseridos diretamente na tabela `public.users`, vinculando o novo usuário ao seu estabelecimento e papel desde o momento de sua criação.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L413-L422)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L35-L40)

## Função requesting_user_establishment_id()

A função `requesting_user_establishment_id()` é a espinha dorsal do sistema de segurança multi-inquilino do easyComand. Ela é utilizada extensivamente nas políticas de Segurança em Nível de Linha (Row Level Security - RLS) para determinar o contexto do inquilino (estabelecimento) do usuário que está fazendo uma requisição ao banco de dados.

**Seu papel crucial é:**
- **Isolamento de Dados:** Garantir que um usuário só possa acessar, modificar ou excluir dados que pertençam ao seu próprio estabelecimento.
- **Contexto de Execução:** Fornecer uma maneira segura e confiável de obter o `establishment_id` do usuário autenticado atual (`auth.uid()`).
- **Reutilização de Políticas:** Permitir a criação de políticas RLS genéricas que podem ser aplicadas a todas as tabelas do schema `public` que contêm um campo `establishment_id`.

A função é definida como `STABLE` e `SECURITY DEFINER`:
- **`STABLE`:** Indica que a função não modifica o banco de dados e que, para um dado conjunto de argumentos, retornará o mesmo resultado durante a execução de uma única consulta. Isso permite otimizações pelo PostgreSQL.
- **`SECURITY DEFINER`:** Garante que a função possa acessar a tabela `public.users` independentemente das permissões do usuário chamador, desde que o usuário tenha permissão para executar a função em si.
- **`SET search_path = public`:** Garante que a consulta seja executada no schema correto.

A função executa uma simples consulta `SELECT` na tabela `public.users`, usando `auth.uid()` para identificar o usuário atual e retornando o valor do seu `establishment_id`.

**Exemplo de Uso em Políticas RLS:**
```sql
CREATE POLICY "Allow access to own establishment data" ON public.products FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());
```
Nesta política, qualquer operação (SELECT, INSERT, UPDATE, DELETE) na tabela `products` só será permitida se o `establishment_id` da linha em questão for igual ao `establishment_id` retornado pela função `requesting_user_establishment_id()` para o usuário que está fazendo a requisição.

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L27-L33)

## Fluxo de Dados e Segurança

O impacto combinado dessas funções no fluxo de dados e na segurança do sistema é profundo:

1.  **Cadastro de Usuário:**
    - Um novo usuário se cadastra via Supabase Auth, fornecendo `email`, `password` e metadados (`full_name`, `establishment_id`, `role_id`).
    - O trigger `on_auth_user_created` dispara a função `handle_new_user()`.
    - A função `handle_new_user()` (como `SECURITY DEFINER`) insere um novo registro na tabela `public.users`, sincronizando os dados.

2.  **Autenticação e Acesso:**
    - O usuário autentica-se e obtém um token JWT.
    - O token JWT contém o `user_id` (UUID).
    - Quando o usuário faz uma requisição à API que envolve o banco de dados, o Supabase injeta o `user_id` como `auth.uid()`.

3.  **Aplicação de Segurança (RLS):**
    - Para qualquer consulta a uma tabela com RLS habilitada (ex: `public.products`), o PostgreSQL avalia a política.
    - A política chama a função `requesting_user_establishment_id()`.
    - A função consulta `public.users` usando `auth.uid()` e retorna o `establishment_id` do usuário.
    - A política RLS compara o `establishment_id` da linha na tabela com o valor retornado pela função. Se forem iguais, a operação é permitida.

Este fluxo garante que a automação de criação de perfis e o isolamento de dados sejam realizados de forma segura, eficiente e transparente para o usuário final, formando a base da arquitetura multi-inquilino do easyComand.

## Conclusão

As funções `handle_new_user()` e `requesting_user_establishment_id()` são componentes fundamentais e bem projetados da arquitetura do easyComand. A primeira automatiza a integração entre autenticação e dados do aplicativo, enquanto a segunda é a pedra angular do sistema de segurança que protege os dados de cada inquilino. O uso de `SECURITY DEFINER` e `SET search_path` demonstra uma compreensão profunda dos mecanismos de segurança do PostgreSQL, permitindo a construção de um sistema robusto e seguro. O entendimento dessas funções é vital para qualquer desenvolvedor que precise manter, depurar ou expandir o sistema.