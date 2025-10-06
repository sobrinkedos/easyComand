import { useAuth } from '../contexts/AuthContext';

/**
 * Versão simplificada do hook de permissões
 * Retorna todas as permissões como true para desenvolvimento
 */
export function usePermissionSimple() {
  const { isAuthenticated } = useAuth();

  // Lista de todas as permissões disponíveis
  const allPermissions = [
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
  ];

  const hasPermission = (permissionName: string): boolean => {
    return isAuthenticated; // Se autenticado, tem todas as permissões
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return isAuthenticated;
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return isAuthenticated;
  };

  return {
    permissions: isAuthenticated ? allPermissions : [],
    permissionsData: isAuthenticated ? {
      role_id: 1,
      role: {
        id: 1,
        name: 'Admin (Dev)',
        permissions: allPermissions.map(name => ({
          permission: { id: 0, name, description: null }
        }))
      }
    } : null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: false,
    error: null,
    roleName: isAuthenticated ? 'Admin (Dev)' : null,
    roleId: isAuthenticated ? 1 : null,
  };
}
