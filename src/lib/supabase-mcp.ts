// import { createBrowserClient } from '@supabase/ssr'
import { supabase } from './supabase'

/**
 * MCP (Model Context Protocol) para Supabase
 * Fornece uma interface padronizada e simplificada para operações de banco de dados
 */

// Tipos auxiliares
type SupabaseResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
}

/**
 * Classe MCP para padronizar operações do Supabase
 */
export class SupabaseMCP {
  private client = supabase

  /**
   * Expor cliente para casos especiais (como listeners)
   */
  get supabaseClient() {
    return this.client
  }

  /**
   * Executar consulta com tratamento de erro padronizado
   */
  async query<T>(operation: () => Promise<any>): Promise<SupabaseResponse<T>> {
    try {
      const result = await operation()
      
      if (result.error) {
        console.error('Erro na operação Supabase:', result.error)
        return {
          success: false,
          data: null,
          error: result.error.message || 'Erro na operação do banco de dados'
        }
      }
      
      return {
        success: true,
        data: result.data,
        error: null
      }
    } catch (error) {
      console.error('Erro na consulta MCP:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Obter dados de uma tabela com filtros
   */
  async select<T>(
    table: string,
    options?: {
      select?: string
      filter?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
    }
  ): Promise<SupabaseResponse<T[]>> {
    return this.query<T[]>(async () => {
      let query = this.client.from(table).select(options?.select || '*')
      
      // Aplicar filtros
      if (options?.filter) {
        Object.entries(options.filter).forEach(([column, value]) => {
          query = query.eq(column, value)
        })
      }
      
      // Aplicar ordenação
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }
      
      // Aplicar limite
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      return query
    })
  }

  /**
   * Inserir dados em uma tabela
   */
  async insert<T>(
    table: string, 
    data: any
  ): Promise<SupabaseResponse<T[]>> {
    return this.query<T[]>(async () => {
      return this.client.from(table).insert(data).select()
    })
  }

  /**
   * Atualizar dados em uma tabela
   */
  async update<T>(
    table: string, 
    data: any, 
    filter: Record<string, any>
  ): Promise<SupabaseResponse<T[]>> {
    return this.query<T[]>(async () => {
      let query = this.client.from(table).update(data)
      
      Object.entries(filter).forEach(([column, value]) => {
        query = query.eq(column, value)
      })
      
      return query.select()
    })
  }

  /**
   * Deletar dados de uma tabela
   */
  async delete(
    table: string, 
    filter: Record<string, any>
  ): Promise<SupabaseResponse<void>> {
    return this.query<void>(async () => {
      let query = this.client.from(table).delete()
      
      Object.entries(filter).forEach(([column, value]) => {
        query = query.eq(column, value)
      })
      
      return query
    })
  }

  /**
   * Operações de autenticação
   */
  auth = {
    /**
     * Login com email e senha
     */
    signIn: async (email: string, password: string): Promise<SupabaseResponse<any>> => {
      return this.query(async () => {
        return this.client.auth.signInWithPassword({ email, password })
      })
    },

    /**
     * Cadastro com email e senha
     */
    signUp: async (email: string, password: string, metadata?: Record<string, any>): Promise<SupabaseResponse<any>> => {
      return this.query(async () => {
        return this.client.auth.signUp({ 
          email, 
          password,
          options: { data: metadata }
        })
      })
    },

    /**
     * Logout
     */
    signOut: async (): Promise<SupabaseResponse<void>> => {
      return this.query(async () => {
        const result = await this.client.auth.signOut()
        return { data: undefined, error: result.error }
      })
    },

    /**
     * Obter sessão atual
     */
    getSession: async (): Promise<SupabaseResponse<any>> => {
      return this.query(async () => {
        return this.client.auth.getSession()
      })
    },

    /**
     * Obter usuário atual
     */
    getUser: async (): Promise<SupabaseResponse<any>> => {
      return this.query(async () => {
        return this.client.auth.getUser()
      })
    }
  }

  /**
   * Subscrições em tempo real
   */
  realtime = {
    /**
     * Subscrever mudanças em uma tabela
     */
    subscribe: (
      table: string,
      callback: (payload: any) => void,
      filter?: { column: string; value: any }
    ) => {
      let channel = this.client.channel(`realtime:${table}`)

      if (filter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `${filter.column}=eq.${filter.value}`
          },
          callback
        )
      } else {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table
          },
          callback
        )
      }

      channel.subscribe()
      return channel
    }
  }
}

// Instância singleton do MCP
export const mcp = new SupabaseMCP()

// Exportar também o cliente original para casos especiais
export { supabase }