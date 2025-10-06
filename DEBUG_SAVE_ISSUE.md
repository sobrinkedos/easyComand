# 🐛 Debug: Modal Travando ao Salvar

## Logs Adicionados

Para identificar onde o processo está travando, foram adicionados logs detalhados:

### ProductModal.tsx

```typescript
console.log('📤 Enviando dados para salvar:', dataToSave);
const result = await onSave(dataToSave);
console.log('✅ Produto salvo com sucesso:', result);
```

### useStock.ts - createProduct()

```typescript
console.log('🔵 createProduct chamado com:', product);
console.log('🔵 Establishment ID:', establishmentId);
console.log('🔵 Dados para inserir:', dataToInsert);
// ... após insert
console.log('✅ Produto inserido:', data);
console.log('🔄 Recarregando lista de produtos...');
// ... após reload
console.log('✅ Lista recarregada');
```

## Como Debugar

### 1. Abrir Console do Navegador

1. Pressione **F12**
2. Vá para aba **Console**
3. Limpe o console (ícone 🚫)

### 2. Tentar Salvar Produto

1. Preencha o formulário
2. Clique em "Salvar Produto"
3. Observe os logs no console

### 3. Identificar Onde Trava

Verifique qual foi o **último log** que apareceu:

#### Cenário A: Trava antes de enviar
```
(nenhum log aparece)
```
**Problema:** Validação ou evento não está funcionando
**Solução:** Verificar se `handleSubmit` está sendo chamado

#### Cenário B: Trava ao enviar
```
📤 Enviando dados para salvar: {...}
(para aqui)
```
**Problema:** Função `onSave` não está sendo chamada ou trava
**Solução:** Verificar se `createProduct` está definido corretamente

#### Cenário C: Trava no createProduct
```
📤 Enviando dados para salvar: {...}
🔵 createProduct chamado com: {...}
🔵 Establishment ID: 1
🔵 Dados para inserir: {...}
(para aqui)
```
**Problema:** Query do Supabase está travando
**Solução:** Verificar conexão com Supabase ou dados inválidos

#### Cenário D: Trava após insert
```
📤 Enviando dados para salvar: {...}
🔵 createProduct chamado com: {...}
🔵 Establishment ID: 1
🔵 Dados para inserir: {...}
✅ Produto inserido: {...}
🔄 Recarregando lista de produtos...
(para aqui)
```
**Problema:** `loadProducts()` está travando
**Solução:** Verificar query de relacionamentos

#### Cenário E: Trava após reload
```
📤 Enviando dados para salvar: {...}
🔵 createProduct chamado com: {...}
🔵 Establishment ID: 1
🔵 Dados para inserir: {...}
✅ Produto inserido: {...}
🔄 Recarregando lista de produtos...
✅ Lista recarregada
(para aqui)
```
**Problema:** Modal não fecha (`onClose` não funciona)
**Solução:** Verificar estado do modal

#### Cenário F: Sucesso Total
```
📤 Enviando dados para salvar: {...}
🔵 createProduct chamado com: {...}
🔵 Establishment ID: 1
🔵 Dados para inserir: {...}
✅ Produto inserido: {...}
🔄 Recarregando lista de produtos...
✅ Lista recarregada
✅ Produto salvo com sucesso: {...}
```
**Resultado:** Tudo funcionou! Modal deve fechar.

## Problemas Comuns

### 1. Establishment ID Undefined

**Log:**
```
❌ Estabelecimento não definido
```

**Causa:** Usuário não tem `establishment_id`

**Solução:**
```sql
UPDATE users 
SET establishment_id = 1 
WHERE id = auth.uid();
```

### 2. Erro de Foreign Key

**Log:**
```
❌ Erro do Supabase: {
  code: "23503",
  message: "insert or update on table violates foreign key constraint"
}
```

**Causa:** Categoria, fornecedor ou unidade não existe

**Solução:** Verificar se os IDs são válidos

### 3. Erro de Relacionamento

**Log:**
```
❌ Erro do Supabase: {
  code: "PGRST201",
  message: "Could not embed because more than one relationship..."
}
```

**Causa:** Query de relacionamento ambígua em `loadProducts()`

**Solução:** Já corrigido com `!stock_products_unit_id_fkey`

### 4. Timeout de Rede

**Log:**
```
(trava sem erro)
```

**Causa:** Conexão lenta ou timeout

**Solução:** Verificar conexão com internet

## Teste Passo a Passo

### 1. Teste Simples

Preencha apenas campos obrigatórios:
- Nome: "Teste Debug"
- Categoria: Qualquer
- Unidade: Unidade (un)
- Preço de Custo: 10

Clique em Salvar e observe os logs.

### 2. Verificar Dados Enviados

No console, expanda o objeto `dataToSave`:

```javascript
{
  name: "Teste Debug",
  description: null,
  category_id: 1,
  unit_id: 1,
  supplier_id: null,
  sku: null,
  barcode: null,
  brand: null,
  cost_price: 10,
  sale_price: null,
  current_stock: 0,
  minimum_stock: 0,
  maximum_stock: null,
  package_quantity: null,
  package_unit_id: null,
  is_perishable: false,
  expiration_alert_days: null
}
```

Verifique se:
- ✅ Campos obrigatórios estão preenchidos
- ✅ IDs são números
- ✅ Strings vazias viraram null
- ✅ Números são números (não strings)

### 3. Verificar Resposta do Supabase

Se aparecer "✅ Produto inserido:", expanda o objeto:

```javascript
{
  id: 5,
  name: "Teste Debug",
  establishment_id: 1,
  category_id: 1,
  // ... outros campos
}
```

Verifique se:
- ✅ ID foi gerado
- ✅ Todos os campos estão corretos

## Solução Temporária

Se o problema persistir, adicione um timeout de segurança:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  // Timeout de segurança (10 segundos)
  const timeoutId = setTimeout(() => {
    console.error('⏱️ TIMEOUT: Operação demorou mais de 10 segundos');
    setError('Operação demorou muito. Tente novamente.');
    setLoading(false);
  }, 10000);

  try {
    // ... código normal
    await onSave(dataToSave);
    clearTimeout(timeoutId);
    onClose();
  } catch (err) {
    clearTimeout(timeoutId);
    // ... tratamento de erro
  }
};
```

## Próximos Passos

1. **Recarregue a página** (F12)
2. **Abra o console** (F12 → Console)
3. **Limpe o console** (🚫)
4. **Tente salvar** um produto
5. **Copie todos os logs** que aparecerem
6. **Identifique** onde travou usando os cenários acima

## Informações para Suporte

Se precisar de ajuda, forneça:

1. **Último log** que apareceu
2. **Dados do formulário** (screenshot)
3. **Erro no console** (se houver)
4. **Navegador e versão**

---

**Data:** 06/01/2025  
**Debug:** Save Operation Hanging  
**Status:** 🔍 Investigando
