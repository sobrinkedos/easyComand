# 🔧 Correção de RLS Aplicada

## Problema Identificado

O erro 500 estava ocorrendo devido a uma **recursão infinita** nas políticas RLS da tabela `users`:

1. Frontend tenta buscar dados do usuário
2. Política RLS chama `get_my_establishment_id()`
3. Função tenta fazer SELECT na tabela `users`
4. SELECT aciona novamente as políticas RLS
5. **Loop infinito** → Erro 500

## Solução Aplicada

### 1. Removida Política Problemática
```sql
DROP POLICY "Allow access to own establishment data" ON public.users;
```

### 2. Criada Política Simples
```sql
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (id = auth.uid());
```

### 3. Função Atualizada com SECURITY DEFINER
```sql
CREATE OR REPLACE FUNCTION public.get_my_establishment_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER  -- ← Isso bypassa o RLS
AS $$
  SELECT establishment_id FROM public.users WHERE id = auth.uid();
$$;
```

## Políticas Atuais na Tabela Users

1. **"Users can view their own data"** (SELECT)
   - Permite usuário ver seu próprio registro
   - Usa: `id = auth.uid()`
   - ✅ Sem recursão

2. **"Users can see other users from their own establishment"** (SELECT)
   - Permite ver outros usuários do mesmo establishment
   - Usa: `establishment_id = get_my_establishment_id()`
   - ✅ Função com SECURITY DEFINER evita recursão

3. **"Users can update their own profile"** (UPDATE)
   - Permite atualizar próprio perfil
   - Usa: `id = auth.uid()`
   - ✅ Sem recursão

## Como Funciona Agora

### Fluxo Correto:

1. **Frontend faz request:**
   ```
   GET /rest/v1/users?id=eq.{user_id}
   ```

2. **RLS verifica políticas:**
   - Política 1: `id = auth.uid()` → ✅ Match direto
   - Retorna dados sem chamar função

3. **Se precisar ver outros usuários:**
   - Política 2: `establishment_id = get_my_establishment_id()`
   - Função executa com SECURITY DEFINER
   - Bypassa RLS temporariamente
   - Retorna establishment_id
   - Compara e retorna dados

## Teste de Verificação

Execute no navegador (Console):

```javascript
// Deve retornar dados do usuário sem erro 500
const { data, error } = await supabase
  .from('users')
  .select('establishment_id, full_name, role_id')
  .eq('id', (await supabase.auth.getUser()).data.user.id)
  .single();

console.log('Dados:', data);
console.log('Erro:', error);
```

**Resultado Esperado:**
```javascript
Dados: {
  establishment_id: 1,
  full_name: "Teste1",
  role_id: 1
}
Erro: null
```

## Próximos Passos

1. **Recarregue a página** (F5)
2. **Verifique o console** - não deve haver erro 500
3. **Acesse /estoque** - deve carregar normalmente
4. **Teste o sistema** - tudo deve funcionar

## Status

✅ **Políticas RLS corrigidas**
✅ **Funções com SECURITY DEFINER**
✅ **Recursão eliminada**
✅ **Sistema pronto para uso**

---

**Data:** 06/01/2025  
**Correção:** RLS Recursion Fix  
**Status:** ✅ Aplicado
