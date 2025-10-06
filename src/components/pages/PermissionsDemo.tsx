import { MainLayout } from '../layout';
import { usePermission } from '../../hooks/usePermission';
import { ProtectedComponent } from '../auth/ProtectedComponent';
import { PermissionBadge, PermissionsList } from '../auth/PermissionBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';
import { Button } from '../ui/button';
import { Shield, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Página de demonstração do sistema de permissões
 * Esta página mostra exemplos práticos de como usar o sistema de permissões
 */
export function PermissionsDemo() {
  const { 
    permissions, 
    hasPermission, 
    hasAnyPermission,
    hasAllPermissions,
    roleName, 
    isLoading 
  } = usePermission();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <p>Carregando permissões...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary-500" />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Sistema de Permissões
            </h1>
            <p className="text-slate-600">
              Demonstração do controle de acesso baseado em permissões
            </p>
          </div>
        </div>

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Informações</CardTitle>
            <CardDescription>
              Papel e permissões do usuário atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Papel:</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {roleName || 'Não definido'}
              </span>
            </div>
            <div>
              <span className="font-semibold">Total de Permissões:</span>
              <span className="ml-2 text-slate-600">{permissions.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Todas as Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Permissões</CardTitle>
            <CardDescription>
              Lista completa de permissões atribuídas ao seu papel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionsList 
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
          </CardContent>
        </Card>

        {/* Exemplos de Componentes Protegidos */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes Protegidos</CardTitle>
            <CardDescription>
              Exemplos de componentes que aparecem apenas com permissão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exemplo 1: Botão protegido */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Exemplo 1: Botão Protegido</h3>
                <PermissionBadge permission="manage_counter" size="sm" />
              </div>
              <p className="text-sm text-slate-600">
                Este botão só aparece se você tiver a permissão <code className="bg-slate-200 px-1 rounded">manage_counter</code>
              </p>
              <ProtectedComponent permission="manage_counter">
                <Button className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Você pode ver este botão!
                </Button>
              </ProtectedComponent>
            </div>

            {/* Exemplo 2: Componente com fallback */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Exemplo 2: Com Fallback</h3>
                <PermissionBadge permission="manage_settings" size="sm" />
              </div>
              <p className="text-sm text-slate-600">
                Mostra mensagem alternativa se não tiver permissão
              </p>
              <ProtectedComponent 
                permission="manage_settings"
                fallback={
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      Você não tem permissão para acessar configurações
                    </span>
                  </div>
                }
              >
                <Button variant="outline" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Acessar Configurações
                </Button>
              </ProtectedComponent>
            </div>

            {/* Exemplo 3: Múltiplas permissões (OR) */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Exemplo 3: Múltiplas Permissões (OR)</h3>
                <PermissionBadge permission="view_kitchen" size="sm" />
                <span className="text-xs text-slate-500">ou</span>
                <PermissionBadge permission="view_bar" size="sm" />
              </div>
              <p className="text-sm text-slate-600">
                Aparece se tiver pelo menos uma das permissões
              </p>
              <ProtectedComponent anyPermission={['view_kitchen', 'view_bar']}>
                <Button variant="outline" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Visualizar Pedidos
                </Button>
              </ProtectedComponent>
            </div>

            {/* Exemplo 4: Múltiplas permissões (AND) */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Exemplo 4: Múltiplas Permissões (AND)</h3>
                <PermissionBadge permission="manage_cashier" size="sm" />
                <span className="text-xs text-slate-500">e</span>
                <PermissionBadge permission="view_reports" size="sm" />
              </div>
              <p className="text-sm text-slate-600">
                Aparece apenas se tiver todas as permissões
              </p>
              <ProtectedComponent allPermissions={['manage_cashier', 'view_reports']}>
                <Button variant="outline" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Relatório Financeiro
                </Button>
              </ProtectedComponent>
            </div>

            {/* Exemplo 5: Com mensagem de negado */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Exemplo 5: Com Mensagem de Negado</h3>
                <PermissionBadge permission="manage_stock" size="sm" />
              </div>
              <p className="text-sm text-slate-600">
                Mostra mensagem de acesso negado se não tiver permissão
              </p>
              <ProtectedComponent permission="manage_stock" showDenied>
                <Button variant="outline" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Gerenciar Estoque
                </Button>
              </ProtectedComponent>
            </div>
          </CardContent>
        </Card>

        {/* Exemplos de Verificação no Código */}
        <Card>
          <CardHeader>
            <CardTitle>Verificação no Código</CardTitle>
            <CardDescription>
              Exemplos de como verificar permissões programaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <h3 className="font-semibold">hasPermission()</h3>
              <code className="block p-3 bg-slate-800 text-slate-100 rounded text-sm">
                {`const canManageCounter = hasPermission('manage_counter');`}
              </code>
              <div className="flex items-center gap-2">
                <span className="text-sm">Resultado:</span>
                {hasPermission('manage_counter') ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    true
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    false
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <h3 className="font-semibold">hasAnyPermission()</h3>
              <code className="block p-3 bg-slate-800 text-slate-100 rounded text-sm">
                {`const canViewOrders = hasAnyPermission(['view_kitchen', 'view_bar']);`}
              </code>
              <div className="flex items-center gap-2">
                <span className="text-sm">Resultado:</span>
                {hasAnyPermission(['view_kitchen', 'view_bar']) ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    true
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    false
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <h3 className="font-semibold">hasAllPermissions()</h3>
              <code className="block p-3 bg-slate-800 text-slate-100 rounded text-sm">
                {`const canViewFinancial = hasAllPermissions(['manage_cashier', 'view_reports']);`}
              </code>
              <div className="flex items-center gap-2">
                <span className="text-sm">Resultado:</span>
                {hasAllPermissions(['manage_cashier', 'view_reports']) ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    true
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    false
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentação */}
        <Card>
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
            <CardDescription>
              Recursos adicionais para aprender mais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-600">
              Para mais informações sobre como usar o sistema de permissões, consulte:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
              <li>
                <code className="bg-slate-200 px-1 rounded">docs/permissions-system.md</code> - Documentação completa
              </li>
              <li>
                <code className="bg-slate-200 px-1 rounded">src/components/auth/README.md</code> - Guia rápido
              </li>
              <li>
                <code className="bg-slate-200 px-1 rounded">PERMISSIONS_IMPLEMENTATION_SUMMARY.md</code> - Resumo da implementação
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
