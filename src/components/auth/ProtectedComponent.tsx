import { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { AlertTriangle, Lock } from 'lucide-react';

/**
 * Props do componente ProtectedComponent
 */
interface ProtectedComponentProps {
  /** Nome da permissão necessária */
  permission?: string;
  /** Lista de permissões (usuário precisa ter pelo menos uma) */
  anyPermission?: string[];
  /** Lista de permissões (usuário precisa ter todas) */
  allPermissions?: string[];
  /** Conteúdo a ser renderizado se o usuário tiver permissão */
  children: ReactNode;
  /** Componente alternativo a ser renderizado se não tiver permissão */
  fallback?: ReactNode;
  /** Se true, mostra mensagem de acesso negado. Se false, não renderiza nada */
  showDenied?: boolean;
}

/**
 * Componente para proteger elementos da UI baseado em permissões
 * 
 * @example
 * // Verificar uma permissão específica
 * <ProtectedComponent permission="manage_counter">
 *   <Button>Abrir Caixa</Button>
 * </ProtectedComponent>
 * 
 * @example
 * // Verificar múltiplas permissões (OR)
 * <ProtectedComponent anyPermission={['view_kitchen', 'view_bar']}>
 *   <OrdersList />
 * </ProtectedComponent>
 * 
 * @example
 * // Verificar múltiplas permissões (AND)
 * <ProtectedComponent allPermissions={['manage_cashier', 'view_reports']}>
 *   <FinancialReport />
 * </ProtectedComponent>
 * 
 * @example
 * // Com fallback customizado
 * <ProtectedComponent 
 *   permission="manage_settings"
 *   fallback={<p>Você não tem acesso às configurações</p>}
 * >
 *   <SettingsPanel />
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback,
  showDenied = false,
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();

  // Aguardar carregamento das permissões
  if (isLoading) {
    return null;
  }

  // Verificar permissões
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  } else {
    // Se nenhuma permissão foi especificada, permitir acesso
    hasAccess = true;
  }

  // Se não tem acesso
  if (!hasAccess) {
    // Se tem fallback customizado, renderizar ele
    if (fallback) {
      return <>{fallback}</>;
    }

    // Se deve mostrar mensagem de acesso negado
    if (showDenied) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">Você não tem permissão para acessar este recurso</span>
        </div>
      );
    }

    // Caso contrário, não renderizar nada
    return null;
  }

  // Se tem acesso, renderizar o conteúdo
  return <>{children}</>;
}

/**
 * Componente para mostrar indicador visual de permissão negada
 */
interface AccessDeniedProps {
  message?: string;
  icon?: ReactNode;
}

export function AccessDenied({ 
  message = 'Você não tem permissão para acessar este recurso',
  icon
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        {icon || <AlertTriangle className="h-16 w-16 text-yellow-500" />}
        <h2 className="text-2xl font-semibold text-slate-800">Acesso Negado</h2>
        <p className="text-slate-600">{message}</p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Se você acredita que deveria ter acesso a este recurso, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
