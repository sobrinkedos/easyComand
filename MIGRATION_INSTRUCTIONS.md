# Como Aplicar a Migração para Corrigir o Erro RLS

## Problema
Erro: `stack depth limit exceeded` - causado por recursão infinita nas políticas RLS.

## Solução

### Opção 1: Via Dashboard do Supabase (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `ctvvjsszxhyipekbgsoo`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole TODO o conteúdo do arquivo:
   `supabase/migrations/20250105000000_fix_rls_recursion.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a confirmação de sucesso

### Opção 2: Via Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
npx supabase db push
```

### Opção 3: Executar SQL manualmente

Copie o SQL abaixo e execute no SQL Editor do Supabase:

```sql
-- Drop existing function
DROP FUNCTION IF EXISTS public.requesting_user_establishment_id();

-- Recreate function with proper security context to bypass RLS
CREATE OR REPLACE FUNCTION public.requesting_user_establishment_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  est_id int;
BEGIN
  SELECT establishment_id INTO est_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN est_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.requesting_user_establishment_id() TO authenticated;

-- Drop and recreate the users table policy
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.users;

CREATE POLICY "Allow access to own establishment data" ON public.users FOR ALL
USING (
  establishment_id = (
    SELECT establishment_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Fix auth helper functions
DROP FUNCTION IF EXISTS auth.get_current_establishment_id();
DROP FUNCTION IF EXISTS auth.get_current_user_role_id();

CREATE OR REPLACE FUNCTION public.get_current_establishment_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  est_id int;
BEGIN
  SELECT establishment_id INTO est_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN est_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r_id int;
BEGIN
  SELECT role_id INTO r_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN r_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_establishment_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role_id() TO authenticated;
```

## Após Aplicar a Migração

1. Reinicie o servidor de desenvolvimento:
   ```cmd
   npm.cmd run dev
   ```

2. O erro "stack depth limit exceeded" deve desaparecer

## O que foi corrigido?

- ✅ Função `requesting_user_establishment_id()` agora usa `SECURITY DEFINER` para bypassar RLS
- ✅ Política da tabela `users` não causa mais recursão
- ✅ Funções helper movidas para o schema `public` com segurança adequada
