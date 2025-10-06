import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { cn } from '../../lib/utils';

/**
 * Props do componente PermissionBadge
 */
interface PermissionBadgeProps {
  /** Nome da permissão a ser verificada */
  permission: string;
  /** Mostrar apenas quando não tem permissão */
  showOnlyDenied?: boolean;
  /** Tamanho do badge */
  size?: 'sm' | 'md' | 'lg';
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para mostrar indicador visual de status de permissão
 * Útil para debugging e feedback visual ao usuário
 * 
 * @example
 * <PermissionBadge permission="manage_counter" />
 * 
 * @example
 * <PermissionBadge 
 *   permission="view_reports" 
 *   showOnlyDenied 
 *   size="sm"
 * />
 */
export function PermissionBadge({
  permission,
  showOnlyDenied = false,
  size = 'md',
  className,
}: PermissionBadgeProps) {
  const { hasPermission, isLoading } = usePermission();

  if (isLoading) {
    return null;
  }

  const hasAccess = hasPermission(permission);

  // Se deve mostrar apenas quando negado e tem acesso, não renderizar
  if (showOnlyDenied && hasAccess) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        hasAccess
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-red-100 text-red-700 border border-red-200',
        className
      )}
    >
      {hasAccess ? (
        <CheckCircle className={iconSizes[size]} />
      ) : (
        <Lock className={iconSizes[size]} />
      )}
      <span>{hasAccess ? 'Permitido' : 'Negado'}</span>
    </div>
  );
}

/**
 * Props do componente PermissionsList
 */
interface PermissionsListProps {
  /** Lista de permissões para verificar */
  permissions: string[];
  /** Título da lista */
  title?: string;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para listar múltiplas permissões com seus status
 * Útil para páginas de debug ou configuração
 * 
 * @example
 * <PermissionsList 
 *   title="Permissões do Módulo Caixa"
 *   permissions={['manage_cashier', 'view_reports', 'manage_payments']}
 * />
 */
export function PermissionsList({
  permissions,
  title,
  className,
}: PermissionsListProps) {
  const { hasPermission, isLoading, roleName } = usePermission();

  if (isLoading) {
    return (
      <div className={cn('p-4 bg-slate-50 rounded-lg', className)}>
        <p className="text-sm text-slate-600">Carregando permissões...</p>
      </div>
    );
  }

  return (
    <div className={cn('p-4 bg-slate-50 rounded-lg space-y-3', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {roleName && (
            <span className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded">
              {roleName}
            </span>
          )}
        </div>
      )}
      <ul className="space-y-2">
        {permissions.map((permission) => {
          const hasAccess = hasPermission(permission);
          return (
            <li
              key={permission}
              className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
            >
              <span className="text-sm text-slate-700 font-mono">
                {permission}
              </span>
              {hasAccess ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
