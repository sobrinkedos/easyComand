import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { mcp } from '../lib/supabase-mcp'
import type { User, Session } from '@supabase/supabase-js'

// Tipos do contexto de autenticação
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  establishmentId: number | null
  // Métodos de autenticação
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, userData?: UserSignUpData) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
  // Métodos de verificação
  isAuthenticated: boolean
  hasEstablishment: boolean
}

interface UserSignUpData {
  fullName?: string
  phoneNumber?: string
  establishmentName?: string
}

interface AuthProviderProps {
  children: ReactNode
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de autenticação usando Supabase MCP
 * Gerencia estado global de autenticação e estabelecimento
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [establishmentId, setEstablishmentId] = useState<number | null>(null)

  /**
   * Verificar sessão atual e carregar dados do usuário
   */
  const checkSession = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar sessão atual
      const sessionResult = await mcp.auth.getSession()
      
      if (sessionResult.success && sessionResult.data?.session) {
        const { session: currentSession } = sessionResult.data
        setSession(currentSession)
        setUser(currentSession.user)

        // Buscar dados do usuário na tabela public.users
        await loadUserData(currentSession.user.id)
      } else {
        setSession(null)
        setUser(null)
        setEstablishmentId(null)
      }
    } catch (err) {
      console.error('Erro ao verificar sessão:', err)
      setError('Erro ao verificar autenticação')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carregar dados do usuário incluindo establishment_id
   */
  const loadUserData = async (userId: string) => {
    try {
      const userDataResult = await mcp.select('users', {
        select: 'establishment_id, full_name, role_id',
        filter: { id: userId },
        limit: 1
      })

      if (userDataResult.success && userDataResult.data?.[0]) {
        const userData = userDataResult.data[0] as any
        setEstablishmentId(userData.establishment_id)
        console.log('✅ Dados do usuário carregados:', userData)
      } else {
        console.log('⚠️ Usuário não encontrado na tabela public.users')
        setEstablishmentId(null)
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err)
    }
  }

  /**
   * Fazer login
   */
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const result = await mcp.auth.signIn(email, password)

      if (result.success && result.data?.user) {
        setUser(result.data.user)
        setSession(result.data.session)
        
        // Carregar dados do estabelecimento
        await loadUserData(result.data.user.id)
        
        console.log('✅ Login realizado com sucesso')
        return true
      } else {
        setError(result.error || 'Credenciais inválidas')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no login'
      setError(errorMessage)
      console.error('❌ Erro no login:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fazer cadastro
   */
  const signUp = async (
    email: string, 
    password: string, 
    userData?: UserSignUpData
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const result = await mcp.auth.signUp(email, password, {
        full_name: userData?.fullName,
        phone_number: userData?.phoneNumber
      })

      if (result.success && result.data?.user) {
        console.log('✅ Cadastro realizado com sucesso')
        
        // Note: O trigger on_auth_user_created irá criar o registro em public.users
        // Aguardar um momento para o trigger processar
        setTimeout(() => {
          checkSession()
        }, 1000)
        
        return true
      } else {
        setError(result.error || 'Erro no cadastro')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no cadastro'
      setError(errorMessage)
      console.error('❌ Erro no cadastro:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fazer logout
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      await mcp.auth.signOut()
      
      setUser(null)
      setSession(null)
      setEstablishmentId(null)
      setError(null)
      
      console.log('✅ Logout realizado com sucesso')
    } catch (err) {
      console.error('❌ Erro no logout:', err)
      setError('Erro ao fazer logout')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Limpar erro
   */
  const clearError = () => {
    setError(null)
  }

  // Verificar sessão ao montar o componente
  useEffect(() => {
    checkSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = mcp.supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Mudança de estado auth:', event)
        
        if (event === 'SIGNED_IN' && session) {
          setSession(session)
          setUser(session.user)
          await loadUserData(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setEstablishmentId(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Valores do contexto
  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    establishmentId,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!user,
    hasEstablishment: !!establishmentId
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}