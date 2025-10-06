# Hotfix - Problema de Carregamento Infinito

## Problema Identificado

Ao executar a aplicação, ela ficava em carregamento infinito após a implementação do sistema de permissões.

## Causa Raiz

Havia dois problemas principais:

### 1. Query Complexa com Joins
O hook `usePermission` estava tentando fazer uma query com joins aninhados que não estava funcionando corretamente com o Supabase MCP:

```typescript
// ❌ PROBLEMA: Query muito complexa
select: `
  role_id,
  role:roles(
    id,
    name,
    permissions:role_permissions(
      permission:permissions(
        id,
        name,
        description
      )
    )
  )
`
```

### 2. Dependência de Função no useMemo
O `Sidebar` estava usando `hasAnyPermission` (uma função) como dependência do `useMemo`, causando re-renders infinitos:

```typescript
// ❌ PROBLEMA: Função como dependência
const filteredMenuItems = useMemo(() => {
  return menuItems.filter(item => {
    return hasAnyPermission(item.permissions);
  });
}, [hasAnyPermission, permissionsLoading]); // hasAnyPermission muda a cada render
```

## Solução Implementada

### 1. Simplificação da Query
Dividimos a query complexa em múltiplas queries simples:

```typescript
// ✅ SOLUÇÃO: Queries separadas
// 1. Buscar role_id do usuário
const userResult = await mcp.select('users', {
  select: 'role_id',
  filter: { id: user.id },
  limit: 1
});

// 2. Buscar informações do role
const roleResult = await mcp.select('roles', {
  select: 'id, name, description',
  filter: { id: roleId },
  limit: 1
});

// 3. Buscar permissões do role
const rolePermsResult = await mcp.select('role_permissions', {
  select: 'permission_id',
  filter: { role_id: roleId }
});

// 4. Buscar detalhes das permissões
const permsResult = await mcp.execute(`
  SELECT id, name, description 
  FROM permissions 
  WHERE id IN (${permissionIds.join(',')})
`);
```

### 2. Uso de Array de Permissões no useMemo
Mudamos para usar o array `permissions` diretamente ao invés da função:

```typescript
// ✅ SOLUÇÃO: Array como dependência
const { permissions, isLoading: permissionsLoading } = usePermission();

const filteredMenuItems = useMemo(() => {
  if (permissionsLoading) {
    return [];
  }

  return menuItems.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    // Usar o array diretamente
    return item.permissions.some(permission => permissions.includes(permission));
  });
}, [permissionsLoading, permissions]); // permissions é um array estável
```

### 3. Melhorias Adicionais

#### Verificação de Loading nas Funções
```typescript
const hasPermission = (permissionName: string): boolean => {
  if (!isAuthenticated) return false;
  if (isLoading) return false; // ✅ Não bloquear durante loading
  if (!permissionsData) return false;
  return permissions.includes(permissionName);
};
```

#### Retry Limitado
```typescript
useQuery({
  // ...
  retry: 1, // ✅ Tentar apenas 1 vez para evitar loops
  gcTime: 10 * 60 * 1000, // ✅ Usar gcTime ao invés de cacheTime (deprecated)
})
```

## Arquivos Modificados

1. `src/hooks/usePermission.ts`
   - Simplificação da query
   - Queries separadas
   - Melhor tratamento de erros
   - Retry limitado

2. `src/components/layout/Sidebar.tsx`
   - Uso de `permissions` array ao invés de `hasAnyPermission`
   - useMemo com dependências estáveis

## Testes Realizados

- ✅ Aplicação carrega normalmente
- ✅ Menu lateral filtra corretamente
- ✅ Permissões são carregadas sem loops
- ✅ Não há re-renders infinitos
- ✅ Loading states funcionam corretamente

## Lições Aprendidas

1. **Evitar queries complexas com joins aninhados**
   - Preferir múltiplas queries simples
   - Mais fácil de debugar
   - Melhor performance

2. **Cuidado com dependências de useMemo/useCallback**
   - Funções mudam a cada render
   - Usar valores primitivos ou arrays estáveis
   - Verificar com React DevTools

3. **Sempre limitar retries em queries**
   - Evitar loops infinitos
   - Melhor UX com falhas rápidas

4. **Logs são seus amigos**
   - Adicionar console.log em pontos críticos
   - Facilita identificação de problemas

## Próximos Passos

1. **Monitorar Performance**
   - Verificar se múltiplas queries não impactam performance
   - Considerar otimizações se necessário

2. **Adicionar Testes**
   - Testes unitários para o hook
   - Testes de integração para o Sidebar

3. **Documentar Padrões**
   - Adicionar guidelines sobre queries
   - Documentar boas práticas de useMemo

## Referências

- React Query: https://tanstack.com/query/latest
- React useMemo: https://react.dev/reference/react/useMemo
- Supabase Queries: https://supabase.com/docs/guides/database/joins

---

**Data**: 05/01/2025
**Desenvolvido por**: Kiro AI Assistant
**Status**: ✅ Resolvido
