import { useState, useCallback } from 'react'
import { mcp } from '../lib/supabase-mcp'

/**
 * Hook customizado para usar o Supabase MCP
 * Fornece uma interface React-friendly para operações MCP
 */
export function useSupabaseMCP() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Executar operação MCP com estados de loading e error
   */
  const execute = useCallback(async <T>(
    operation: () => Promise<{ success: boolean; data: T | null; error: string | null }>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await operation()
      
      if (!result.success) {
        setError(result.error)
        return null
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Operações de banco de dados
   */
  const database = {
    select: useCallback(<T>(
      table: string,
      options?: Parameters<typeof mcp.select>[1]
    ) => {
      return execute(() => mcp.select<T>(table, options))
    }, [execute]),

    insert: useCallback(<T>(
      table: string,
      data: any
    ) => {
      return execute(() => mcp.insert<T>(table, data))
    }, [execute]),

    update: useCallback(<T>(
      table: string,
      data: any,
      filter: Record<string, any>
    ) => {
      return execute(() => mcp.update<T>(table, data, filter))
    }, [execute]),

    delete: useCallback((
      table: string,
      filter: Record<string, any>
    ) => {
      return execute(() => mcp.delete(table, filter))
    }, [execute])
  }

  /**
   * Operações de autenticação
   */
  const auth = {
    signIn: useCallback((email: string, password: string) => {
      return execute(() => mcp.auth.signIn(email, password))
    }, [execute]),

    signUp: useCallback((email: string, password: string, metadata?: Record<string, any>) => {
      return execute(() => mcp.auth.signUp(email, password, metadata))
    }, [execute]),

    signOut: useCallback(() => {
      return execute(() => mcp.auth.signOut())
    }, [execute]),

    getSession: useCallback(() => {
      return execute(() => mcp.auth.getSession())
    }, [execute]),

    getUser: useCallback(() => {
      return execute(() => mcp.auth.getUser())
    }, [execute])
  }

  return {
    loading,
    error,
    database,
    auth,
    // Acesso direto ao MCP para casos avançados
    mcp
  }
}

/**
 * Hook para operações específicas de estabelecimentos
 */
export function useEstablishments() {
  const { database, loading, error } = useSupabaseMCP()

  const getEstablishmentTypes = useCallback(() => {
    return database.select('establishment_types', {
      select: 'id, name',
      orderBy: { column: 'name', ascending: true }
    })
  }, [database])

  const getSubscriptionPlans = useCallback(() => {
    return database.select('subscription_plans', {
      select: 'id, name, description, price, features',
      orderBy: { column: 'price', ascending: true }
    })
  }, [database])

  return {
    loading,
    error,
    getEstablishmentTypes,
    getSubscriptionPlans
  }
}

/**
 * Hook para autenticação com estado persistente
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const { auth, loading, error } = useSupabaseMCP()

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await auth.signIn(email, password)
    if (result?.user) {
      setUser(result.user)
      setSession(result.session)
    }
    return result
  }, [auth])

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    const result = await auth.signUp(email, password, metadata)
    if (result?.user) {
      setUser(result.user)
      setSession(result.session)
    }
    return result
  }, [auth])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setUser(null)
    setSession(null)
  }, [auth])

  const checkSession = useCallback(async () => {
    const sessionResult = await auth.getSession()
    if (sessionResult?.session) {
      setSession(sessionResult.session)
      const userResult = await auth.getUser()
      if (userResult?.user) {
        setUser(userResult.user)
      }
    }
  }, [auth])

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    checkSession,
    isAuthenticated: !!user
  }
}