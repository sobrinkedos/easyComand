/**
 * Hook simplificado de permissões
 * Versão temporária que sempre retorna true para desenvolvimento
 */
export function usePermission() {
  // Retornar imediatamente sem fazer queries
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

  return {
    permissions: allPermissions,
    permissionsData: {
      role_id: 1,
      role: {
        id: 1,
        name: 'Admin (Dev)',
        permissions: allPermissions.map(name => ({
          permission: { id: 0, name, description: null }
        }))
      }
    },
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    isLoading: false,
    error: null,
    roleName: 'Admin (Dev)',
    roleId: 1,
  };
}
