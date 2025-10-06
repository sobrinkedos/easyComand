# Sistema de Permissões - Frontend

Este documento descreve como usar o sistema de permissões implementado no frontend do EasyComand.

## Visão Geral

O sistema de permissões permite controlar o acesso a diferentes módulos e funcionalidades do sistema baseado nas permissões atribuídas ao papel (role) do usuário.

## Componentes Principais

### 1. Hook `usePermission`

Hook para verificar permissões do usuário logado.

```typescript
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    permissions,
    roleName,
    isLoading 
  } = usePermission();

  // Verificar uma permissão específica
  if (hasPermission('manage_counter')) {
    // Usuário tem permissão
  }

  // Verificar se tem pelo menos uma das permissões
  if (hasAnyPermission(['view_kitchen', 'view_bar'])) {
    // Usuário tem pelo menos uma das permissões
  }

  // Verificar se tem todas as permissões
  if (hasAllPermissions(['manage_cashier', 'view_reports'])) {
    // Usuário tem todas as permissões
  }
}
```

### 2. Componente `ProtectedRoute`

Componente para proteger rotas inteiras baseado em permissões.

```typescript
import { ProtectedRoute } from '@/components/auth';

// Rota simples protegida (apenas autenticação)
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Rota com permissão específica
<Route path="/caixa" element={
  <ProtectedRoute permission="manage_cashier">
    <CaixaPage />
  </ProtectedRoute>
} />

// Rota com múltiplas permissões (OR - pelo menos uma)
<Route path="/pedidos" element={
  <ProtectedRoute anyPermission={['view_kitchen', 'view_bar']}>
    <PedidosPage />
  </ProtectedRoute>
} />

// Rota com múltiplas permissões (AND - todas necessárias)
<Route path="/relatorios-financeiros" element={
  <ProtectedRoute allPermissions={['view_reports', 'manage_cashier']}>
    <RelatoriosFinanceirosPage />
  </ProtectedRoute>
} />
```

### 3. Componente `ProtectedComponent`

Componente para proteger elementos específicos da UI.

```typescript
import { ProtectedComponent } from '@/components/auth';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Mostrar botão apenas se tiver permissão */}
      <ProtectedComponent permission="manage_counter">
        <Button>Abrir Caixa</Button>
      </ProtectedComponent>

      {/* Com fallback customizado */}
      <ProtectedComponent 
        permission="view_reports"
        fallback={<p>Você não tem acesso aos relatórios</p>}
      >
        <ReportsWidget />
      </ProtectedComponent>

      {/* Mostrar mensagem de acesso negado */}
      <ProtectedComponent 
        permission="manage_settings"
        showDenied
      >
        <SettingsPanel />
      </ProtectedComponent>

      {/* Verificar múltiplas permissões (OR) */}
      <ProtectedComponent anyPermission={['view_kitchen', 'view_bar']}>
        <OrdersPanel />
      </ProtectedComponent>

      {/* Verificar múltiplas permissões (AND) */}
      <ProtectedComponent allPermissions={['manage_cashier', 'view_reports']}>
        <FinancialSummary />
      </ProtectedComponent>
    </div>
  );
}
```

### 4. Componente `AccessDenied`

Componente para mostrar página de acesso negado.

```typescript
import { AccessDenied } from '@/components/auth';

// Uso padrão
<AccessDenied />

// Com mensagem customizada
<AccessDenied message="Você precisa ser gerente para acessar esta página" />

// Com ícone customizado
<AccessDenied 
  message="Área restrita"
  icon={<Lock className="h-16 w-16 text-red-500" />}
/>
```

### 5. Componentes de Indicadores Visuais

#### PermissionBadge

Mostra um badge indicando se o usuário tem ou não uma permissão.

```typescript
import { PermissionBadge } from '@/components/auth/PermissionBadge';

// Badge padrão
<PermissionBadge permission="manage_counter" />

// Mostrar apenas quando negado
<PermissionBadge 
  permission="view_reports" 
  showOnlyDenied 
/>

// Tamanhos diferentes
<PermissionBadge permission="manage_settings" size="sm" />
<PermissionBadge permission="manage_settings" size="md" />
<PermissionBadge permission="manage_settings" size="lg" />
```

#### PermissionsList

Lista múltiplas permissões com seus status.

```typescript
import { PermissionsList } from '@/components/auth/PermissionBadge';

<PermissionsList 
  title="Permissões do Módulo Caixa"
  permissions={[
    'manage_cashier',
    'view_reports',
    'manage_payments'
  ]}
/>
```

## Menu Lateral com Filtro de Permissões

O menu lateral (`Sidebar`) automaticamente filtra os itens baseado nas permissões do usuário. Cada item do menu tem uma propriedade `permissions` que define quais permissões são necessárias para visualizá-lo.

```typescript
// Em src/components/layout/Sidebar.tsx
const menuItems: SidebarMenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard', 
    permissions: ['view_dashboard']
  },
  { 
    id: 'caixa', 
    label: 'Caixa', 
    icon: DollarSign, 
    path: '/caixa', 
    permissions: ['manage_cashier']
  },
  // ... outros itens
];
```

## Permissões Disponíveis

As seguintes permissões estão definidas no sistema:

- `view_dashboard` - Visualizar dashboard
- `manage_counter` - Gerenciar atendimento no balcão
- `manage_tables` - Gerenciar mesas e comandas
- `view_kitchen` - Visualizar interface da cozinha
- `view_bar` - Visualizar interface do bar
- `manage_cashier` - Gerenciar caixa
- `manage_menu` - Gerenciar cardápio
- `manage_stock` - Gerenciar estoque
- `manage_customers` - Gerenciar clientes
- `view_reports` - Visualizar relatórios
- `manage_settings` - Gerenciar configurações

## Estrutura do Banco de Dados

O sistema de permissões utiliza as seguintes tabelas:

```sql
-- Tabela de papéis (roles)
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Tabela de permissões
CREATE TABLE public.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Tabela de relacionamento entre papéis e permissões
CREATE TABLE public.role_permissions (
    role_id INT NOT NULL REFERENCES public.roles(id),
    permission_id INT NOT NULL REFERENCES public.permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- Usuários têm um role_id
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    role_id INT NOT NULL REFERENCES public.roles(id),
    -- ... outros campos
);
```

## Fluxo de Verificação de Permissões

1. Usuário faz login
2. `AuthContext` carrega dados do usuário incluindo `role_id`
3. `usePermission` busca as permissões do papel do usuário
4. Permissões são armazenadas em cache (React Query)
5. Componentes verificam permissões usando o hook
6. Menu lateral é filtrado automaticamente
7. Rotas protegidas verificam permissões antes de renderizar

## Boas Práticas

### 1. Use permissões granulares

```typescript
// ❌ Evite permissões muito amplas
<ProtectedComponent permission="admin">

// ✅ Use permissões específicas
<ProtectedComponent permission="manage_cashier">
```

### 2. Combine permissões quando necessário

```typescript
// Para funcionalidades que requerem múltiplas permissões
<ProtectedComponent allPermissions={['manage_cashier', 'view_reports']}>
  <FinancialReport />
</ProtectedComponent>

// Para funcionalidades acessíveis por diferentes papéis
<ProtectedComponent anyPermission={['view_kitchen', 'view_bar', 'manage_orders']}>
  <OrdersList />
</ProtectedComponent>
```

### 3. Forneça feedback ao usuário

```typescript
// ❌ Não deixe o usuário sem feedback
<ProtectedComponent permission="manage_settings">
  <SettingsButton />
</ProtectedComponent>

// ✅ Mostre mensagem quando não tem permissão
<ProtectedComponent 
  permission="manage_settings"
  showDenied
>
  <SettingsButton />
</ProtectedComponent>

// ✅ Ou use fallback customizado
<ProtectedComponent 
  permission="manage_settings"
  fallback={
    <Tooltip content="Você não tem permissão para acessar configurações">
      <Button disabled>Configurações</Button>
    </Tooltip>
  }
>
  <SettingsButton />
</ProtectedComponent>
```

### 4. Proteja tanto rotas quanto componentes

```typescript
// Proteja a rota
<Route path="/caixa" element={
  <ProtectedRoute permission="manage_cashier">
    <CaixaPage />
  </ProtectedRoute>
} />

// E também componentes sensíveis dentro da página
function CaixaPage() {
  return (
    <div>
      <h1>Caixa</h1>
      
      <ProtectedComponent permission="manage_cashier">
        <OpenCashButton />
      </ProtectedComponent>
      
      <ProtectedComponent allPermissions={['manage_cashier', 'view_reports']}>
        <CashReport />
      </ProtectedComponent>
    </div>
  );
}
```

## Debugging

Para debug, você pode usar o componente `PermissionsList`:

```typescript
import { PermissionsList } from '@/components/auth/PermissionBadge';

function DebugPage() {
  return (
    <div>
      <h1>Debug de Permissões</h1>
      <PermissionsList 
        title="Todas as Permissões"
        permissions={[
          'view_dashboard',
          'manage_counter',
          'manage_tables',
          'view_kitchen',
          'view_bar',
          'manage_cashier',
          'manage_menu',
          'manage_stock',
          'manage_customers',
          'view_reports',
          'manage_settings',
        ]}
      />
    </div>
  );
}
```

## Troubleshooting

### Permissões não estão sendo carregadas

1. Verifique se o usuário está autenticado
2. Verifique se o usuário tem um `role_id` válido
3. Verifique se o papel tem permissões associadas na tabela `role_permissions`
4. Verifique o console do navegador para erros

### Menu lateral está vazio

1. Verifique se as permissões estão sendo carregadas corretamente
2. Verifique se o papel do usuário tem pelo menos uma permissão
3. Verifique se os itens do menu têm permissões definidas corretamente

### Usuário vê "Acesso Negado" em todas as páginas

1. Verifique se o papel do usuário tem as permissões necessárias
2. Verifique se as permissões estão escritas corretamente (case-sensitive)
3. Verifique se a query de permissões está retornando dados

## Exemplos Completos

### Exemplo 1: Página com múltiplos níveis de permissão

```typescript
function CaixaPage() {
  const { hasPermission } = usePermission();

  return (
    <MainLayout>
      <div className="p-6">
        <h1>Módulo de Caixa</h1>

        {/* Todos com permissão manage_cashier podem ver */}
        <ProtectedComponent permission="manage_cashier">
          <CashSessionInfo />
        </ProtectedComponent>

        {/* Apenas quem pode abrir/fechar caixa */}
        <ProtectedComponent allPermissions={['manage_cashier', 'open_close_cash']}>
          <div className="flex gap-2">
            <Button>Abrir Caixa</Button>
            <Button>Fechar Caixa</Button>
          </div>
        </ProtectedComponent>

        {/* Relatórios requerem permissão adicional */}
        <ProtectedComponent 
          allPermissions={['manage_cashier', 'view_reports']}
          fallback={
            <Card>
              <CardContent>
                <p>Você não tem permissão para visualizar relatórios</p>
              </CardContent>
            </Card>
          }
        >
          <CashReports />
        </ProtectedComponent>
      </div>
    </MainLayout>
  );
}
```

### Exemplo 2: Botão condicional com tooltip

```typescript
import { Tooltip } from '@/components/ui/tooltip';

function OrderActions() {
  const { hasPermission } = usePermission();
  const canCancel = hasPermission('cancel_orders');

  return (
    <div className="flex gap-2">
      <Button>Ver Detalhes</Button>
      
      {canCancel ? (
        <Button variant="destructive">Cancelar Pedido</Button>
      ) : (
        <Tooltip content="Você não tem permissão para cancelar pedidos">
          <Button variant="destructive" disabled>
            Cancelar Pedido
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
```

## Conclusão

O sistema de permissões fornece uma maneira flexível e segura de controlar o acesso a diferentes partes do sistema. Use os componentes e hooks fornecidos para implementar controle de acesso granular em toda a aplicação.
