import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '../ui'
import { LoadingSpinner } from '../ui/loading'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // Verificar se há um token de recuperação válido
    const checkToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidToken(true)
      } else {
        setError('Link de recuperação inválido ou expirado')
      }
    }
    checkToken()
  }, [])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!password) {
      errors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/auth')
      }, 3000)
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err)
      setError(err.message || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              Link Inválido
            </CardTitle>
            <CardDescription>
              Este link de recuperação não é válido ou expirou
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Solicite um novo link de recuperação de senha.
            </p>
            
            <Button onClick={() => navigate('/forgot-password')} className="w-full">
              Solicitar Novo Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Senha Redefinida!
            </CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Você será redirecionado para a página de login em instantes...
            </p>
            
            <Button onClick={() => navigate('/auth')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Redefinir Senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua nova senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (validationErrors.password) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.password
                        return newErrors
                      })
                    }
                  }}
                  className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                  autoComplete="new-password"
                  autoFocus
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

            {/* Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (validationErrors.confirmPassword) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.confirmPassword
                        return newErrors
                      })
                    }
                  }}
                  className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Requisitos de senha */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium mb-1">Requisitos da senha:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Mínimo de 6 caracteres</li>
                <li>• Pelo menos 1 letra minúscula</li>
                <li>• Pelo menos 1 letra maiúscula</li>
                <li>• Pelo menos 1 número</li>
              </ul>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
