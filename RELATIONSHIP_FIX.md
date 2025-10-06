# 🔗 Correção de Relacionamento Ambíguo

## Problema Identificado

Erro ao carregar produtos:
```
PGRST201: Could not embed because more than one relationship 
was found for 'stock_products' and 'stock_units'
```

### Causa:

A tabela `stock_products` tem **duas foreign keys** para `stock_units`:

1. **`unit_id`** → Unidade do produto (ex: "un", "kg", "L")
2. **`package_unit_id`** → Unidade da embalagem (ex: "cx", "fd")

Quando fazemos:
```typescript
.select('*, unit:stock_units(*)')
```

O Supabase não sabe qual foreign key usar, resultando em erro.

## Solução Aplicada

Especificar explicitamente qual foreign key usar através do **nome da constraint**:

### Antes (Ambíguo):
```typescript
const { data, error } = await supabase
  .from('stock_products')
  .select(`
    *,
    unit:stock_units(*)  // ❌ Ambíguo!
  `)
```

### Depois (Específico):
```typescript
const { data, error } = await supabase
  .from('stock_products')
  .select(`
    *,
    unit:stock_units!stock_products_unit_id_fkey(*)  // ✅ Específico!
  `)
```

## Como Funciona

A sintaxe `!constraint_name` diz ao Supabase exatamente qual relacionamento usar:

- `stock_units!stock_products_unit_id_fkey` → Usa a FK `unit_id`
- `stock_units!stock_products_package_unit_id_fkey` → Usaria a FK `package_unit_id`

## Nomes das Constraints

Para referência futura:

| Coluna | Constraint Name |
|--------|----------------|
| `unit_id` | `stock_products_unit_id_fkey` |
| `package_unit_id` | `stock_products_package_unit_id_fkey` |
| `category_id` | `stock_products_category_id_fkey` |
| `supplier_id` | `stock_products_supplier_id_fkey` |

## Query Completa Corrigida

```typescript
const { data, error } = await supabase
  .from('stock_products')
  .select(`
    *,
    category:stock_categories(*),
    supplier:suppliers(*),
    unit:stock_units!stock_products_unit_id_fkey(*)
  `)
  .eq('establishment_id', establishmentId)
  .eq('is_active', true)
  .order('name');
```

## Como Descobrir o Nome da Constraint

Se precisar descobrir o nome de outras constraints:

```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'stock_products';
```

## Resultado Esperado

Após a correção:
- ✅ Produtos carregam sem erro
- ✅ Relacionamentos corretos
- ✅ Dados completos na interface

## Arquivo Corrigido

- `src/hooks/useStock.ts` - Linha ~140

## Status

✅ **Correção aplicada**
✅ **Relacionamento específico**
✅ **Pronto para uso**

---

**Data:** 06/01/2025  
**Correção:** Ambiguous Relationship Fix  
**Status:** ✅ Resolvido
