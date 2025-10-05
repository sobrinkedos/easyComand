# Políticas Diretas de RLS

<cite>
**Arquivos Referenciados neste Documento**   
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Tabela de Conteúdos
1. [Introdução](#introdução)
2. [Função de Segurança `requesting_user_establishment_id`](#função-de-segurança-requesting_user_establishment_id)
3. [Aplicação de Políticas RLS com `requesting_user_establishment_id`](#aplicação-de-políticas-rls-com-requesting_user_establishment_id)
4. [Boas Práticas e Considerações](#boas-práticas-e-considerações)

## Introdução

Este documento detalha as políticas de segurança de nível de linha (Row Level Security - RLS) que utilizam diretamente a função `requesting_user_establishment_id()` para garantir o isolamento de dados em uma arquitetura multi-tenant. Essas políticas são aplicadas a tabelas onde o campo `establishment_id` está presente diretamente, como `establishments`, `users`, `products`, `orders` e `customers`. O objetivo é assegurar que usuários autenticados acessem apenas dados pertencentes ao seu próprio estabelecimento, prevenindo vazamentos de dados entre diferentes locais.

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L1-L357)

## Função de Segurança `requesting_user_establishment_id`

A função `requesting_user_establishment_id()` é um componente central para a implementação da segurança multi-tenant no banco de dados. Ela é definida com `SECURITY DEFINER`, o que significa que é executada com os privilégios do seu proprietário (geralmente um superusuário), permitindo que acesse dados da tabela `public.users` mesmo quando chamada por usuários com privilégios limitados.

A função consulta a tabela `public.users` para encontrar o `establishment_id` associado ao `id` do usuário autenticado, obtido pela função `auth.uid()` do Supabase. O uso de `SECURITY DEFINER` é crucial, pois permite que a função funcione corretamente dentro das políticas RLS, independentemente das permissões diretas do usuário na tabela `public.users`.

```sql
CREATE OR REPLACE FUNCTION public.requesting_user_establishment_id()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT establishment_id
  FROM public.users
  WHERE id = auth.uid();
$$;
```

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L10-L20)

## Aplicação de Políticas RLS com `requesting_user_establishment_id`

As políticas RLS são criadas para todas as tabelas que contêm o campo `establishment_id`. A política padrão utiliza a cláusula `FOR ALL` para aplicar restrições a operações `SELECT`, `INSERT`, `UPDATE` e `DELETE` simultaneamente. A condição `USING` compara o `establishment_id` da linha com o valor retornado pela função `requesting_user_establishment_id()`.

Abaixo estão exemplos de como essas políticas são criadas para tabelas específicas:

### Tabela `products`

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to own establishment data" ON public.products FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());
```

### Tabela `orders`

```sql
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to own establishment data" ON public.orders FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());
```

### Tabela `customers`

```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to own establishment data" ON public.customers FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());
```

Essas políticas garantem que qualquer operação realizada na tabela `products`, `orders` ou `customers` só afetará linhas cujo `establishment_id` corresponda ao do usuário autenticado. Isso é fundamental para manter a integridade e a confidencialidade dos dados em um ambiente multi-tenant.

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L50-L100)

## Boas Práticas e Considerações

### Nomenclatura Descritiva
Utilize nomes descritivos para as políticas RLS. Isso facilita a auditoria e a manutenção. Por exemplo, `"Allow access to own establishment data"` é mais informativo do que um nome genérico como `"policy1"`.

### Teste de Permissões
É essencial testar as políticas RLS com diferentes papéis (roles) para garantir que funcionem conforme o esperado. Crie papéis de teste com diferentes níveis de acesso e verifique se eles podem ou não acessar dados de outros estabelecimentos.

### Auditoria e Modificação
Para auditar as políticas existentes, use o comando `SELECT * FROM pg_policies;`. Para modificar uma política, use `DROP POLICY IF EXISTS` seguido de `CREATE POLICY` com a nova definição. Sempre faça backup do estado atual antes de fazer alterações.

### Considerações de Desempenho
Embora as políticas RLS sejam eficientes, é importante garantir que os campos usados na cláusula `USING` estejam indexados. No caso, o campo `establishment_id` deve ter um índice para otimizar as consultas de filtro.

Seguindo essas práticas, você pode garantir um sistema de segurança robusto e confiável que protege os dados dos seus clientes.

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L1-L357)