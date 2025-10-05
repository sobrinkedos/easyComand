import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '../ui'
import { LoadingSpinner } from '../ui/loading'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setValidationError('E-mail é obrigatório')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('E-mail inválido')
      return false
    }
    setValidationError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateEmail(email)) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      console.error('Erro ao enviar e-mail de recuperação:', err)
      setError(err.message || 'Erro ao enviar e-mail de recuperação')
    } finally {
      setLoading(false)
    }
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
              E-mail Enviado!
            </CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Clique no link do e-mail para redefinir sua senha.
            </p>
            <p className="text-xs text-gray-500">
              Não recebeu o e-mail? Verifique sua pasta de spam.
            </p>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      <div className="p-4">
        <Button variant="ghost" asChild>
          <Link to="/auth" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Login
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Recuperar Senha
            </CardTitle>
            <CardDescription>
              Digite seu e-mail para receber o link de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setValidationError(null)
                      setError(null)
                    }}
                    className={`pl-10 ${validationError ? 'border-red-500' : ''}`}
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {validationError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationError}
                  </p>
                )}
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
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>
                  Lembrou sua senha?{' '}
                  <Link 
                    to="/auth" 
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Faça login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
