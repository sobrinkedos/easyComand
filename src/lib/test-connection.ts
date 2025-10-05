import { mcp } from './supabase-mcp'

/**
 * Função para testar a conectividade com o Supabase usando MCP
 * Retorna informações sobre o status da conexão e configuração
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase via MCP...')
    
    // Verificar se as variáveis de ambiente estão definidas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
      throw new Error('VITE_SUPABASE_URL não está configurada corretamente no arquivo .env')
    }
    
    if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
      throw new Error('VITE_SUPABASE_ANON_KEY não está configurada corretamente no arquivo .env')
    }
    
    console.log('✅ Variáveis de ambiente configuradas')
    
    // Testar uma consulta simples usando MCP
    const tablesResult = await mcp.select('establishment_types', {
      select: 'id, name',
      limit: 5
    })
    
    if (!tablesResult.success) {
      console.error('❌ Erro ao consultar tabelas:', tablesResult.error)
      throw new Error(tablesResult.error || 'Erro na consulta')
    }
    
    console.log('✅ Conexão com banco de dados estabelecida')
    console.log('📊 Tipos de estabelecimento encontrados:', tablesResult.data?.length || 0)
    
    // Verificar autenticação usando MCP
    const sessionResult = await mcp.auth.getSession()
    const isAuthenticated = sessionResult.success && sessionResult.data?.session
    
    console.log('🔐 Status da autenticação:', isAuthenticated ? 'Logado' : 'Não logado')
    
    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso via MCP!',
      details: {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        tablesFound: tablesResult.data?.length || 0,
        isAuthenticated: !!isAuthenticated,
        mcpEnabled: true
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: null
    }
  }
}

/**
 * Função para verificar se as migrações foram aplicadas usando MCP
 */
export async function checkMigrations() {
  try {
    console.log('🔍 Verificando migrações...')
    
    const tables = [
      'establishments',
      'users', 
      'roles',
      'permissions',
      'establishment_types',
      'subscription_plans'
    ]
    
    const results = []
    
    for (const table of tables) {
      try {
        const result = await mcp.select(table, {
          select: 'id',
          limit: 1
        })
        
        if (result.success) {
          results.push({ table, exists: true, count: result.data?.length || 0 })
        } else {
          results.push({ table, exists: false, error: result.error || 'Tabela não encontrada' })
        }
      } catch (err) {
        results.push({ table, exists: false, error: 'Tabela não encontrada' })
      }
    }
    
    const existingTables = results.filter(r => r.exists)
    console.log(`✅ ${existingTables.length}/${tables.length} tabelas encontradas`)
    
    return {
      success: existingTables.length === tables.length,
      results,
      message: existingTables.length === tables.length 
        ? 'Todas as migrações foram aplicadas!' 
        : `${existingTables.length}/${tables.length} tabelas encontradas. Algumas migrações podem estar pendentes.`
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar migrações:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao verificar migrações',
      results: []
    }
  }
}