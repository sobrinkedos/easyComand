import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'
import { LoadingSpinner } from '../ui/loading'
import { CheckCircle, Building, User, ArrowRight } from 'lucide-react'

export function WelcomeScreen() {
  const { user, establishmentId, hasEstablishment } = useAuth()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Countdown para redirecionar
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-800">
            Bem-vindo!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações do usuário */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Usuário</p>
                <p className="text-sm text-blue-900">{user?.email}</p>
              </div>
            </div>

            {hasEstablishment && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Building className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Estabelecimento</p>
                  <p className="text-sm text-purple-900">ID: {establishmentId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mensagem de redirecionamento */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-600">
                Redirecionando para o dashboard em {countdown}s...
              </p>
            </div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
            >
              Ir agora
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dicas rápidas */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">💡 Dicas Rápidas:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Configure seu estabelecimento no menu Configurações</li>
              <li>• Adicione produtos e categorias no menu Cardápio</li>
              <li>• Gerencie mesas e ambientes em Mesas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
