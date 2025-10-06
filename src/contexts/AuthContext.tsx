import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { mcp } from '../lib/supabase-mcp'
import { supabase } from '../lib/supabase'
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
      console.log('🔍 Verificando sessão...')
      setLoading(true)
      setError(null)

      // Verificar sessão atual
      const sessionResult = await mcp.auth.getSession()
      console.log('📋 Resultado da sessão:', sessionResult)
      
      if (sessionResult.success && sessionResult.data?.session) {
        const { session: currentSession } = sessionResult.data
        console.log('✅ Sessão encontrada, usuário:', currentSession.user.email)
        setSession(currentSession)
        setUser(currentSession.user)

        // Buscar dados do usuário na tabela public.users
        await loadUserData(currentSession.user.id)
      } else {
        console.log('⚠️ Nenhuma sessão ativa')
        setSession(null)
        setUser(null)
        setEstablishmentId(null)
      }
    } catch (err) {
      console.error('❌ Erro ao verificar sessão:', err)
      setError('Erro ao verificar autenticação')
    } finally {
      console.log('✅ checkSession finalizado, setLoading(false)')
      setLoading(false)
    }
  }

  /**
   * Carregar dados do usuário incluindo establishment_id
   */
  const loadUserData = async (userId: string) => {
    console.log('🚨 VERSÃO NOVA DO CÓDIGO - TIMESTAMP:', Date.now())
    console.log('🔍 [1/5] loadUserData iniciado para:', userId)
    
    try {
      console.log('🔍 [2/5] Verificando sessão...')
      
      // Timeout wrapper para evitar travamento
      const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
          )
        ])
      }
      
      // Verificar sessão com timeout
      const sessionData = await withTimeout(
        mcp.supabaseClient.auth.getSession(),
        5000
      )
      console.log('📋 [3/5] Sessão:', sessionData?.data?.session ? 'Ativa ✅' : 'Inativa ❌')
      
      // Fazer query com timeout
      console.log('🔍 [4/5] Executando query na tabela users...')
      const result = await withTimeout(
        mcp.supabaseClient
          .from('users')
          .select('establishment_id,full_name,role_id')
          .eq('id', userId)
          .single(),
        5000
      )

      console.log('📊 [5/5] Resultado:', { data: result.data, error: result.error })

      if (result.error) {
        console.error('❌ Erro ao buscar usuário:', result.error)
        setEstablishmentId(null)
        return
      }

      if (result.data) {
        console.log('✅ Dados carregados com sucesso:', result.data)
        setEstablishmentId(result.data.establishment_id)
      } else {
        console.log('⚠️ Nenhum dado retornado')
        setEstablishmentId(null)
      }
    } catch (err) {
      console.error('❌ Erro em loadUserData:', err)
      setEstablishmentId(null)
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
    console.log('🚀 AuthProvider montado, iniciando checkSession')
    
    // Timeout de segurança: se após 5 segundos ainda estiver loading, forçar false
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança: forçando loading = false após 5s')
      setLoading(false)
    }, 5000)
    
    checkSession().finally(() => {
      clearTimeout(safetyTimeout)
    })

    // Escutar mudanças de autenticação
    console.log('👂 Configurando listener onAuthStateChange')
    const { data: { subscription } } = mcp.supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Mudança de estado auth:', event, 'session:', !!session)
        
        try {
          // Ignorar INITIAL_SESSION pois checkSession já cuidou disso
          if (event === 'INITIAL_SESSION') {
            console.log('⏭️ Ignorando INITIAL_SESSION (já processado por checkSession)')
            return
          }
          
          if (event === 'SIGNED_IN' && session) {
            setSession(session)
            setUser(session.user)
            // Só carregar dados se ainda não temos establishmentId
            if (!establishmentId) {
              await loadUserData(session.user.id)
            } else {
              console.log('⏭️ establishmentId já existe, pulando loadUserData')
            }
          } else if (event === 'SIGNED_OUT') {
            setSession(null)
            setUser(null)
            setEstablishmentId(null)
          }
        } catch (err) {
          console.error('❌ Erro no onAuthStateChange:', err)
        } finally {
          console.log('✅ onAuthStateChange finalizado, setLoading(false)')
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🔌 Desconectando listener onAuthStateChange')
      clearTimeout(safetyTimeout)
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