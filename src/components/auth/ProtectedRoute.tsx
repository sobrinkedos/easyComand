import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/loading'

interface ProtectedRouteProps {
  children: ReactNode
  requireEstablishment?: boolean
}

/**
 * Componente de rota protegida
 * Redireciona para login se não autenticado
 * Opcionalmente requer que o usuário tenha um estabelecimento
 */
export function ProtectedRoute({ children, requireEstablishment = false }: ProtectedRouteProps) {
  const { isAuthenticated, hasEstablishment, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
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