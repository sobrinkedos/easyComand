import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { Button } from '../ui'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button variant="ghost" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🍽️ EasyComand
            </h1>
            <p className="text-gray-600">
              Sistema de Gestão para Restaurantes e Bares
            </p>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <LoginForm onSwitchToSignUp={() => setMode('signup')} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setMode('login')} />
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Ao usar o EasyComand, você concorda com nossos{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
      </div>
    </div>
  )
}