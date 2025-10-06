# 🚀 Guia Rápido de Correção - Sistema de Estoque

## Problema: Página fica "Carregando..."

### ⚡ Solução Rápida (5 minutos)

#### Passo 1: Diagnóstico Automático

1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie e cole este arquivo:
   ```
   supabase/diagnose-stock-system.sql
   ```
5. Clique em **Run** (ou Ctrl+Enter)
6. Leia os resultados no painel inferior

**O que procurar:**
- ✓ = Tudo OK
- ✗ = Problema encontrado (com ação sugerida)

---

#### Passo 2: Aplicar Migração (se necessário)

**Se o diagnóstico mostrou "Tabela NÃO existe":**

1. No **SQL Editor**
2. Abra uma **New Query**
3. Copie TODO o conteúdo de:
   ```
   supabase/migrations/20250105000004_create_stock_management.sql
   ```
4. Cole no editor
5. Clique em **Run**
6. Aguarde (pode levar 10-20 segundos)
7. Verifique se não há erros em vermelho

---

#### Passo 3: Configurar Establishment (se necessário)

**Se o diagnóstico mostrou "Usuário sem establishment_id":**

```sql
-- 1. Verificar se há establishments
SELECT * FROM establishments LIMIT 1;

-- 2. Se não houver, criar um:
INSERT INTO establishments (
    name, cnpj, establishment_type_id,
    address_street, address_number, address_neighborhood,
    address_city, address_state, address_zip_code,
    subscription_plan_id
) VALUES (
    'Meu Restaurante', '12.345.678/0001-90', 1,
    'Rua Exemplo', '123', 'Centro',
    'São Paulo', 'SP', '01234-567', 1
) RETURNING id;

-- 3. Anote o ID retornado (ex: 1)

-- 4. Atualizar seu usuário:
UPDATE users
SET establishment_id = 1  -- Use o ID do passo 2
WHERE id = auth.uid();

-- 5. Verificar:
SELECT establishment_id FROM users WHERE id = auth.uid();
-- Deve retornar o número (ex: 1)
```

---

#### Passo 4: Popular Dados de Exemplo (opcional)

**Para ter produtos de exemplo:**

1. No **SQL Editor**
2. Copie TODO o conteúdo de:
   ```
   supabase/seed-stock-data.sql
   ```
3. Cole no editor
4. Clique em **Run**
5. Aguarde a execução

---

#### Passo 5: Testar

1. Volte para o navegador
2. Recarregue a página `/estoque` (F5)
3. Aguarde o carregamento

**Resultado Esperado:**
- ✅ Página carrega com dados
- ✅ Cards mostram estatísticas
- ✅ Tabela mostra produtos (se executou seed data)
- ✅ Sem "Carregando..." infinito

---

## 🔍 Ainda não Funciona?

### Verificar Console do Navegador

1. Pressione **F12** (DevTools)
2. Vá para a aba **Console**
3. Procure por erros em vermelho
4. Copie a mensagem de erro

### Erros Comuns:

#### "relation 'public.stock_products' does not exist"
→ Volte ao Passo 2 (Aplicar Migração)

#### "permission denied for table stock_products"
→ Execute este SQL:
```sql
-- Verificar RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'stock_products';

-- Se não retornar nada, recriar políticas:
CREATE POLICY "Enable access for users of the same establishment" 
ON stock_products FOR ALL 
USING (establishment_id = public.get_current_establishment_id());
```

#### "Cannot read property 'id' of null"
→ Volte ao Passo 3 (Configurar Establishment)

---

## 📊 Checklist Final

Após seguir os passos:

- [ ] Diagnóstico executado
- [ ] Todas as verificações com ✓
- [ ] Migração aplicada (se necessário)
- [ ] Establishment configurado (se necessário)
- [ ] Seed data executado (opcional)
- [ ] Página recarregada
- [ ] Sistema funcionando

---

## 🎯 Atalho: Script Completo

**Se quiser executar tudo de uma vez:**

```sql
-- =============================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO
-- =============================================

-- 1. Verificar se tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'stock_products'
    ) THEN
        RAISE EXCEPTION 'Tabelas não existem. Execute a migração primeiro!';
    END IF;
END $$;

-- 2. Criar establishment se não existir
INSERT INTO establishments (
    name, cnpj, establishment_type_id,
    address_street, address_number, address_neighborhood,
    address_city, address_state, address_zip_code,
    subscription_plan_id
)
SELECT 
    'Meu Estabelecimento', '12.345.678/0001-90', 1,
    'Rua Exemplo', '123', 'Centro',
    'São Paulo', 'SP', '01234-567', 1
WHERE NOT EXISTS (SELECT 1 FROM establishments LIMIT 1);

-- 3. Atualizar usuário atual
UPDATE users
SET establishment_id = (SELECT id FROM establishments LIMIT 1)
WHERE id = auth.uid()
AND establishment_id IS NULL;

-- 4. Verificar resultado
SELECT 
    'Usuário: ' || email as info,
    'Establishment: ' || establishment_id as establishment
FROM users
WHERE id = auth.uid();

-- Se retornar dados, está configurado! ✅
```

---

## 📞 Precisa de Ajuda?

1. **Execute o diagnóstico** (`diagnose-stock-system.sql`)
2. **Copie os resultados**
3. **Tire screenshot do erro** (se houver)
4. **Entre em contato** com as informações

---

## ✅ Sucesso!

Se tudo funcionou:
- ✅ Página carrega normalmente
- ✅ Estatísticas aparecem
- ✅ Você pode criar categorias
- ✅ Você pode cadastrar produtos

**Próximos passos:**
1. Criar suas categorias
2. Cadastrar seus produtos
3. Começar a usar o sistema!

---

**Tempo estimado:** 5-10 minutos  
**Dificuldade:** Fácil  
**Última atualização:** Janeiro 2025
