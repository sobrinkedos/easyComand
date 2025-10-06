import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermission } from '../../hooks/usePermission'
import { LoadingSpinner } from '../ui/loading'
import { AccessDenied } from './ProtectedComponent'

interface ProtectedRouteProps {
  children: ReactNode
  requireEstablishment?: boolean
  /** Nome da permissão necessária para acessar a rota */
  permission?: string
  /** Lista de permissões (usuário precisa ter pelo menos uma) */
  anyPermission?: string[]
  /** Lista de permissões (usuário precisa ter todas) */
  allPermissions?: string[]
}

/**
 * Componente de rota protegida
 * Redireciona para login se não autenticado
 * Opcionalmente requer que o usuário tenha um estabelecimento
 * Opcionalmente verifica permissões do usuário
 * 
 * @example
 * // Rota simples protegida
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Rota com permissão específica
 * <ProtectedRoute permission="manage_counter">
 *   <CounterPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Rota com múltiplas permissões (OR)
 * <ProtectedRoute anyPermission={['view_kitchen', 'view_bar']}>
 *   <OrdersPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  requireEstablishment = false,
  permission,
  anyPermission,
  allPermissions,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasEstablishment, loading: authLoading } = useAuth()
  const location = useLocation()

  console.log('🛡️ ProtectedRoute - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
  console.log('🔑 Permissões requeridas - permission:', permission, 'anyPermission:', anyPermission, 'allPermissions:', allPermissions);
  
  // NOTA: Verificação de permissões temporariamente desabilitada para desenvolvimento

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Redirecionar para setup de estabelecimento se requerido e não tem
  if (requireEstablishment && !hasEstablishment) {
    return <Navigate to="/setup-establishment" state={{ from: location }} replace />
  }

  // Se há verificação de permissões, aguardar carregamento
  // TEMPORARIAMENTE DESABILITADO - usando versão simplificada
  // if ((permission || anyPermission || allPermissions) && permissionsLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center space-y-4">
  //         <LoadingSpinner size="lg" />
  //         <p className="text-gray-600">Verificando permissões...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Verificar permissões se especificadas
  // TEMPORARIAMENTE DESABILITADO - usando versão simplificada que sempre retorna true
  // if (permission || anyPermission || allPermissions) {
  //   let hasAccess = false;

  //   if (permission) {
  //     hasAccess = hasPermission(permission);
  //   } else if (anyPermission && anyPermission.length > 0) {
  //     hasAccess = hasAnyPermission(anyPermission);
  //   } else if (allPermissions && allPermissions.length > 0) {
  //     hasAccess = hasAllPermissions(allPermissions);
  //   }

  //   // Se não tem permissão, mostrar página de acesso negado
  //   if (!hasAccess) {
  //     return <AccessDenied />;
  //   }
  // }

  // Renderizar conteúdo protegido
  return <>{children}</>
}

/**
 * Componente de rota pública (só para usuários não autenticados)
 * Redireciona para dashboard se já autenticado
 */
interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para dashboard se já autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Renderizar conteúdo público
  return <>{children}</>
}