# 🔧 Troubleshooting - Sistema de Estoque

## Problema: Página fica "Carregando..." indefinidamente

### Possíveis Causas:

1. **Tabelas não foram criadas no banco de dados**
2. **Erro de conexão com o Supabase**
3. **Usuário sem establishment_id**
4. **Políticas RLS bloqueando acesso**

---

## 🔍 Diagnóstico

### Passo 1: Verificar Console do Navegador

1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Procure por erros em vermelho

**Erros Comuns:**

#### Erro: "relation 'public.stock_products' does not exist"
**Causa:** Tabelas não foram criadas  
**Solução:** Aplicar a migração (veja abaixo)

#### Erro: "permission denied for table stock_products"
**Causa:** Políticas RLS bloqueando  
**Solução:** Verificar RLS (veja abaixo)

#### Erro: "Cannot read property 'id' of null"
**Causa:** Usuário sem establishment_id  
**Solução:** Configurar establishment (veja abaixo)

---

### Passo 2: Verificar se as Tabelas Existem

Execute no **SQL Editor do Supabase**:

```sql
-- Copie e execute: supabase/check-stock-tables.sql
```

**Resultado Esperado:**
```
table_name          | exists
--------------------|-------
stock_units         | true
stock_categories    | true
suppliers           | true
stock_products      | true
stock_movements     | true
stock_alerts        | true
```

**Se alguma tabela retornar `false`:**
→ Você precisa aplicar a migração (veja Solução 1)

---

### Passo 3: Verificar Dados

Execute no **SQL Editor do Supabase**:

```sql
-- Verificar se há dados
SELECT 
    (SELECT COUNT(*) FROM stock_units) as units,
    (SELECT COUNT(*) FROM stock_categories) as categories,
    (SELECT COUNT(*) FROM suppliers) as suppliers,
    (SELECT COUNT(*) FROM stock_products) as products;
```

**Resultado Esperado (com seed data):**
```
units | categories | suppliers | products
------|------------|-----------|----------
11    | 10         | 4         | 20
```

**Se todos retornarem 0:**
→ Você pode executar o seed data (opcional)

---

### Passo 4: Verificar Establishment ID

Execute no **SQL Editor do Supabase**:

```sql
-- Verificar seu usuário
SELECT 
    id,
    email,
    establishment_id,
    role_id
FROM users
WHERE email = 'seu-email@exemplo.com'; -- Substitua pelo seu email
```

**Resultado Esperado:**
- `establishment_id` deve ter um valor (não null)

**Se establishment_id for null:**
→ Você precisa configurar o establishment (veja Solução 3)

---

### Passo 5: Verificar RLS

Execute no **SQL Editor do Supabase**:

```sql
-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('stock_products', 'stock_categories', 'suppliers')
ORDER BY tablename, policyname;
```

**Resultado Esperado:**
- Deve haver políticas para cada tabela
- Roles deve incluir 'authenticated'

---

## ✅ Soluções

### Solução 1: Aplicar Migração do Banco de Dados

**Se as tabelas não existem:**

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo de:
   ```
   supabase/migrations/20250105000004_create_stock_management.sql
   ```
5. Cole no editor
6. Clique em **Run** (ou Ctrl+Enter)
7. Aguarde a execução (pode levar alguns segundos)
8. Verifique se não há erros

**Verificar se funcionou:**
```sql
-- Execute novamente:
SELECT * FROM stock_units LIMIT 1;
```

Se retornar dados, a migração foi aplicada com sucesso! ✅

---

### Solução 2: Popular Dados Iniciais (Opcional)

**Para ter dados de exemplo:**

1. No **SQL Editor do Supabase**
2. Copie todo o conteúdo de:
   ```
   supabase/seed-stock-data.sql
   ```
3. Cole no editor
4. Clique em **Run**
5. Aguarde a execução

**Verificar se funcionou:**
```sql
SELECT COUNT(*) FROM stock_products;
```

Deve retornar 20 (ou mais) ✅

---

### Solução 3: Configurar Establishment ID

**Se seu usuário não tem establishment_id:**

```sql
-- Primeiro, verificar se há establishments
SELECT * FROM establishments LIMIT 1;

-- Se não houver, criar um:
INSERT INTO establishments (
    name,
    cnpj,
    establishment_type_id,
    address_street,
    address_number,
    address_neighborhood,
    address_city,
    address_state,
    address_zip_code,
    subscription_plan_id
) VALUES (
    'Meu Estabelecimento',
    '12.345.678/0001-90',
    1,
    'Rua Exemplo',
    '123',
    'Centro',
    'São Paulo',
    'SP',
    '01234-567',
    1
) RETURNING id;

-- Anote o ID retornado

-- Atualizar seu usuário com o establishment_id:
UPDATE users
SET establishment_id = 1 -- Use o ID retornado acima
WHERE email = 'seu-email@exemplo.com'; -- Seu email
```

**Verificar se funcionou:**
```sql
SELECT establishment_id FROM users WHERE email = 'seu-email@exemplo.com';
```

Deve retornar um número ✅

---

### Solução 4: Verificar Função get_current_establishment_id

**Se RLS não está funcionando:**

```sql
-- Verificar se a função existe
SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_current_establishment_id'
);

-- Se retornar 'false', criar a função:
CREATE OR REPLACE FUNCTION public.get_current_establishment_id()
RETURNS INT AS $$
BEGIN
    RETURN (
        SELECT establishment_id 
        FROM public.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão:
GRANT EXECUTE ON FUNCTION public.get_current_establishment_id() TO authenticated;
```

---

### Solução 5: Recriar Políticas RLS

**Se as políticas não estão funcionando:**

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Enable access for users of the same establishment" ON stock_products;
DROP POLICY IF EXISTS "Enable access for users of the same establishment" ON stock_categories;
DROP POLICY IF EXISTS "Enable access for users of the same establishment" ON suppliers;

-- Recriar políticas
CREATE POLICY "Enable access for users of the same establishment" 
ON stock_products FOR ALL 
USING (establishment_id = public.get_current_establishment_id());

CREATE POLICY "Enable access for users of the same establishment" 
ON stock_categories FOR ALL 
USING (establishment_id = public.get_current_establishment_id());

CREATE POLICY "Enable access for users of the same establishment" 
ON suppliers FOR ALL 
USING (establishment_id = public.get_current_establishment_id());
```

---

### Solução 6: Desabilitar RLS Temporariamente (Apenas para Debug)

**⚠️ ATENÇÃO: Use apenas para testar!**

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE stock_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;

-- Testar se funciona
-- Se funcionar, o problema é com RLS

-- IMPORTANTE: Reabilitar depois!
ALTER TABLE stock_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
```

---

## 🔄 Checklist de Verificação

Após aplicar as soluções, verifique:

- [ ] Tabelas existem no banco de dados
- [ ] Unidades de medida foram inseridas (11 registros)
- [ ] Seu usuário tem establishment_id
- [ ] Função get_current_establishment_id existe
- [ ] Políticas RLS estão ativas
- [ ] Console do navegador não mostra erros
- [ ] Página carrega os dados

---

## 🆘 Ainda não Funciona?

### Debug Avançado

1. **Verificar autenticação:**
```sql
SELECT auth.uid(); -- Deve retornar seu user ID
```

2. **Testar função manualmente:**
```sql
SELECT public.get_current_establishment_id(); -- Deve retornar seu establishment_id
```

3. **Testar query diretamente:**
```sql
SELECT * FROM stock_products 
WHERE establishment_id = public.get_current_establishment_id();
```

4. **Verificar logs do Supabase:**
   - Vá para Logs no dashboard
   - Procure por erros recentes

---

## 📞 Suporte

Se nada funcionar:

1. **Copie os erros do console**
2. **Tire screenshots**
3. **Anote o que já tentou**
4. **Entre em contato com suporte**

---

## 🎯 Solução Rápida (Reset Completo)

**Se quiser começar do zero:**

```sql
-- ⚠️ CUIDADO: Isso apaga TODOS os dados de estoque!

-- Desabilitar RLS
ALTER TABLE stock_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categories DISABLE ROW LEVEL SECURITY;

-- Apagar dados
TRUNCATE TABLE stock_alerts CASCADE;
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE stock_products CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE stock_categories CASCADE;

-- Reabilitar RLS
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categories ENABLE ROW LEVEL SECURITY;

-- Agora execute novamente:
-- 1. A migração (20250105000004_create_stock_management.sql)
-- 2. O seed data (seed-stock-data.sql)
```

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
