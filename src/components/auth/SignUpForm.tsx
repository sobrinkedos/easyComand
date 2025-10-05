import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '../ui'
import { LoadingSpinner } from '../ui/loading'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, AlertCircle, CheckCircle } from 'lucide-react'

interface SignUpFormProps {
  onSwitchToLogin?: () => void
}

interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phoneNumber: string
  establishmentName: string
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    establishmentName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  /**
   * Validar formulário
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // E-mail
    if (!formData.email) {
      errors.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido'
    }

    // Senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'
    }

    // Confirmar senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem'
    }

    // Nome completo
    if (!formData.fullName) {
      errors.fullName = 'Nome completo é obrigatório'
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Telefone (opcional, mas se preenchido deve ser válido)
    if (formData.phoneNumber && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Formato inválido. Use: (11) 99999-9999'
    }

    // Nome do estabelecimento (opcional)
    if (formData.establishmentName && formData.establishmentName.length < 2) {
      errors.establishmentName = 'Nome do estabelecimento deve ter pelo menos 2 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Formatar telefone automaticamente
   */
  const formatPhone = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  /**
   * Manipular mudanças no formulário
   */
  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    let processedValue = value

    // Formatar telefone automaticamente
    if (field === 'phoneNumber') {
      processedValue = formatPhone(value)
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
    
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

    const success = await signUp(formData.email, formData.password, {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber || undefined,
      establishmentName: formData.establishmentName || undefined
    })
    
    if (success) {
      setSignUpSuccess(true)
      console.log('✅ Cadastro realizado com sucesso')
    }
  }

  // Se o cadastro foi bem-sucedido, mostrar mensagem de sucesso
  if (signUpSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Cadastro Realizado!
          </CardTitle>
          <CardDescription>
            Verifique seu e-mail para confirmar a conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Enviamos um link de confirmação para <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Após confirmar seu e-mail, você poderá fazer login no sistema.
          </p>
          
          {onSwitchToLogin && (
            <Button 
              onClick={onSwitchToLogin}
              variant="outline"
              className="w-full"
            >
              Voltar para Login
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Criar Conta
        </CardTitle>
        <CardDescription>
          Cadastre-se para começar a usar o EasyComand
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`pl-10 ${validationErrors.fullName ? 'border-red-500' : ''}`}
                disabled={loading}
                autoComplete="name"
              />
            </div>
            {validationErrors.fullName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.fullName}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
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

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={`pl-10 ${validationErrors.phoneNumber ? 'border-red-500' : ''}`}
                disabled={loading}
                autoComplete="tel"
              />
            </div>
            {validationErrors.phoneNumber && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.phoneNumber}
              </p>
            )}
          </div>

          {/* Nome do Estabelecimento */}
          <div className="space-y-2">
            <Label htmlFor="establishmentName">Nome do Estabelecimento</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="establishmentName"
                type="text"
                placeholder="Nome do seu restaurante/bar"
                value={formData.establishmentName}
                onChange={(e) => handleInputChange('establishmentName', e.target.value)}
                className={`pl-10 ${validationErrors.establishmentName ? 'border-red-500' : ''}`}
                disabled={loading}
                autoComplete="organization"
              />
            </div>
            {validationErrors.establishmentName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.establishmentName}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
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
                autoComplete="new-password"
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

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

          {/* Link para login */}
          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  disabled={loading}
                >
                  Faça login
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}