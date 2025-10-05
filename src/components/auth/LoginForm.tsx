import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '../ui'
import { LoadingSpinner } from '../ui/loading'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LoginFormProps {
  onSwitchToSignUp?: () => void
}

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const { signIn, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  /**
   * Validar formulário
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido'
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Manipular mudanças no formulário
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Limpar erro geral
    if (error) {
      clearError()
    }
  }

  /**
   * Submeter formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await signIn(formData.email, formData.password)
    
    if (success) {
      console.log('✅ Login realizado com sucesso')
      // O redirecionamento será feito pelo componente pai
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Entrar no EasyComand
        </CardTitle>
        <CardDescription>
          Faça login para acessar seu estabelecimento
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {validationErrors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Erro geral */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {/* Botão de submit */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          {/* Links adicionais */}
          <div className="text-center space-y-2">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
            
            {onSwitchToSignUp && (
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  disabled={loading}
                >
                  Cadastre-se
                </button>
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}