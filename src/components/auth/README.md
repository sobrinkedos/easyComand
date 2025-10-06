# Sistema de Permissões - Guia Rápido

## Componentes Disponíveis

### `usePermission` - Hook
```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
```

### `ProtectedRoute` - Proteger Rotas
```typescript
<ProtectedRoute permission="manage_counter">
  <CounterPage />
</ProtectedRoute>
```

### `ProtectedComponent` - Proteger Elementos
```typescript
<ProtectedComponent permission="manage_cashier">
  <Button>Abrir Caixa</Button>
</ProtectedComponent>
```

### `AccessDenied` - Página de Acesso Negado
```typescript
<AccessDenied message="Você não tem permissão" />
```

### `PermissionBadge` - Indicador Visual
```typescript
<PermissionBadge permission="manage_counter" />
```

### `PermissionsList` - Lista de Permissões
```typescript
<PermissionsList 
  title="Minhas Permissões"
  permissions={['manage_counter', 'view_reports']}
/>
```

## Permissões Disponíveis

- `view_dashboard` - Dashboard
- `manage_counter` - Balcão
- `manage_tables` - Mesas
- `view_kitchen` - Cozinha
- `view_bar` - Bar
- `manage_cashier` - Caixa
- `manage_menu` - Cardápio
- `manage_stock` - Estoque
- `manage_customers` - Clientes
- `view_reports` - Relatórios
- `manage_settings` - Configurações

## Exemplos Rápidos

### Verificar uma permissão
```typescript
if (hasPermission('manage_counter')) {
  // Fazer algo
}
```

### Verificar múltiplas permissões (OR)
```typescript
if (hasAnyPermission(['view_kitchen', 'view_bar'])) {
  // Fazer algo
}
```

### Verificar múltiplas permissões (AND)
```typescript
if (hasAllPermissions(['manage_cashier', 'view_reports'])) {
  // Fazer algo
}
```

### Proteger rota com permissão
```typescript
<Route path="/caixa" element={
  <ProtectedRoute permission="manage_cashier">
    <CaixaPage />
  </ProtectedRoute>
} />
```

### Proteger componente com fallback
```typescript
<ProtectedComponent 
  permission="manage_settings"
  fallback={<p>Sem acesso</p>}
>
  <SettingsPanel />
</ProtectedComponent>
```

### Mostrar mensagem de acesso negado
```typescript
<ProtectedComponent 
  permission="manage_settings"
  showDenied
>
  <SettingsPanel />
</ProtectedComponent>
```

## Documentação Completa

Veja `docs/permissions-system.md` para documentação completa com exemplos detalhados.
