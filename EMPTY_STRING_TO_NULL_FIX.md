# 🔧 Correção: String Vazia → Null

## Problema Identificado

Mesmo deixando o campo SKU em branco, o erro de duplicação ainda ocorria:

```
❌ Já existe um produto com este SKU. Use um SKU diferente ou deixe em branco.
```

### Causa:

Quando o campo SKU estava vazio, o valor `""` (string vazia) estava sendo enviado ao banco de dados.

O PostgreSQL considera strings vazias como valores válidos e únicos, então:
- Primeiro produto com SKU vazio: `sku = ""`
- Segundo produto com SKU vazio: `sku = ""` → ❌ Duplicado!

A constraint `unique_sku_per_establishment` não permite dois produtos com o mesmo SKU (mesmo que seja vazio).

## Solução Aplicada

### Converter String Vazia para NULL

```typescript
// ❌ ANTES: String vazia era enviada
const dataToSave = {
  ...formData,
  sku: formData.sku,  // "" (string vazia)
};

// ✅ DEPOIS: String vazia vira null
const dataToSave = {
  sku: formData.sku?.trim() || null,  // null
};
```

### Comportamento Correto:

- **Campo vazio** → `null` → ✅ Permitido (múltiplos produtos podem ter SKU null)
- **Campo com espaços** → `null` → ✅ Trim remove espaços
- **Campo preenchido** → `"REF-001"` → ✅ Valor único

## Implementação Completa

```typescript
const dataToSave = {
  name: formData.name,
  description: formData.description || null,
  category_id: Number(formData.category_id),
  unit_id: Number(formData.unit_id),
  supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
  
  // Campos de texto - converter string vazia para null
  sku: formData.sku?.trim() || null,
  barcode: formData.barcode?.trim() || null,
  brand: formData.brand?.trim() || null,
  
  // Números
  cost_price: Number(formData.cost_price),
  sale_price: formData.sale_price ? Number(formData.sale_price) : null,
  current_stock: Number(formData.current_stock),
  minimum_stock: Number(formData.minimum_stock),
  maximum_stock: formData.maximum_stock ? Number(formData.maximum_stock) : null,
  package_quantity: formData.package_quantity ? Number(formData.package_quantity) : null,
  package_unit_id: formData.package_unit_id ? Number(formData.package_unit_id) : null,
  
  // Booleano e outros
  is_perishable: formData.is_perishable,
  expiration_alert_days: formData.expiration_alert_days ? Number(formData.expiration_alert_days) : null
};
```

## Campos Tratados

### Texto (String vazia → null):
- ✅ `sku` - Código interno
- ✅ `barcode` - Código de barras
- ✅ `brand` - Marca
- ✅ `description` - Descrição

### Números (String vazia → null):
- ✅ `supplier_id`
- ✅ `sale_price`
- ✅ `maximum_stock`
- ✅ `package_quantity`
- ✅ `package_unit_id`
- ✅ `expiration_alert_days`

### Sempre Preenchidos:
- ✅ `name` - Obrigatório
- ✅ `category_id` - Obrigatório
- ✅ `unit_id` - Obrigatório
- ✅ `cost_price` - Obrigatório
- ✅ `current_stock` - Padrão 0
- ✅ `minimum_stock` - Padrão 0
- ✅ `is_perishable` - Padrão false

## Método `.trim()`

Remove espaços em branco no início e fim:

```typescript
"  REF-001  ".trim()  // "REF-001"
"   ".trim()          // ""
"".trim()             // ""
```

Combinado com `|| null`:

```typescript
"  REF-001  ".trim() || null  // "REF-001"
"   ".trim() || null          // null
"".trim() || null             // null
```

## Comparação: String Vazia vs Null

### No PostgreSQL:

| Valor | Tipo | Unique Constraint |
|-------|------|-------------------|
| `""` | String vazia | ❌ Apenas um permitido |
| `null` | Null | ✅ Múltiplos permitidos |
| `"REF-001"` | String | ❌ Apenas um permitido |

### Constraint Behavior:

```sql
-- Tabela com constraint unique
CREATE TABLE products (
  sku VARCHAR(50),
  CONSTRAINT unique_sku UNIQUE (sku)
);

-- ❌ Erro: Duplicate key
INSERT INTO products (sku) VALUES ('');
INSERT INTO products (sku) VALUES ('');  -- ERRO!

-- ✅ OK: Null não é considerado duplicado
INSERT INTO products (sku) VALUES (NULL);
INSERT INTO products (sku) VALUES (NULL);  -- OK!
```

## Teste de Verificação

### Teste 1: SKU Vazio
1. Cadastre produto sem preencher SKU
2. ✅ Deve salvar com `sku = null`
3. Cadastre outro produto sem SKU
4. ✅ Deve salvar normalmente (múltiplos null permitidos)

### Teste 2: SKU com Espaços
1. Digite "   " (apenas espaços) no SKU
2. ✅ Deve ser convertido para null
3. Produto salva normalmente

### Teste 3: SKU Preenchido
1. Digite "REF-001" no SKU
2. ✅ Salva como "REF-001"
3. Tente cadastrar outro com "REF-001"
4. ✅ Deve dar erro de duplicação

### Teste 4: SKU com Espaços nas Pontas
1. Digite "  REF-001  " no SKU
2. ✅ Salva como "REF-001" (trim remove espaços)

## Verificação no Banco

Para verificar como os dados foram salvos:

```sql
SELECT 
    id,
    name,
    sku,
    CASE 
        WHEN sku IS NULL THEN 'NULL'
        WHEN sku = '' THEN 'STRING VAZIA'
        ELSE 'VALOR: ' || sku
    END as sku_status
FROM stock_products
ORDER BY id DESC
LIMIT 5;
```

**Resultado Esperado:**
```
id | name              | sku      | sku_status
---|-------------------|----------|------------
1  | Coca-Cola 2L      | REF-001  | VALOR: REF-001
2  | Água Mineral      | NULL     | NULL
3  | Suco de Laranja   | NULL     | NULL
```

## Benefícios

✅ **Múltiplos Produtos Sem SKU** - Permitido
✅ **Validação Correta** - SKU único quando preenchido
✅ **Trim Automático** - Remove espaços desnecessários
✅ **Consistência** - Null em vez de string vazia

## Arquivos Modificados

- ✅ `src/components/stock/ProductModal.tsx`
  - Conversão de string vazia para null
  - Trim em campos de texto
  - Organização melhor dos campos

## Status

✅ **String vazia → null implementado**
✅ **Trim adicionado**
✅ **Múltiplos produtos sem SKU permitidos**
✅ **Validação de SKU único mantida**

---

**Data:** 06/01/2025  
**Correção:** Empty String to Null Conversion  
**Status:** ✅ Resolvido
