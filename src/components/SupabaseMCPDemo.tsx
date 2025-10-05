import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from './ui'
import { LoadingSpinner } from './ui/loading'
import { useSupabaseMCP, useEstablishments } from '../hooks/useSupabaseMCP'
import { Database, Table, Users, Building, CheckCircle, XCircle } from 'lucide-react'

/**
 * Componente de demonstração do Supabase MCP
 * Mostra exemplos práticos de uso da interface MCP
 */
export function SupabaseMCPDemo() {
  const { database, loading: generalLoading, error: generalError } = useSupabaseMCP()
  const { getEstablishmentTypes, getSubscriptionPlans, loading: estLoading, error: estError } = useEstablishments()
  
  const [establishmentTypes, setEstablishmentTypes] = useState<any[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any[]>([])

  /**
   * Carregar dados iniciais
   */
  useEffect(() => {
    async function loadData() {
      console.log('🔄 Carregando dados via MCP...')
      
      const types = await getEstablishmentTypes()
      if (types) {
        setEstablishmentTypes(types)
        console.log('✅ Tipos de estabelecimento carregados:', types)
      }

      const plans = await getSubscriptionPlans()
      if (plans) {
        setSubscriptionPlans(plans)
        console.log('✅ Planos de assinatura carregados:', plans)
      }
    }

    loadData()
  }, [getEstablishmentTypes, getSubscriptionPlans])

  /**
   * Executar testes de operações CRUD
   */
  const runCrudTests = async () => {
    const results = []
    
    try {
      // Teste 1: SELECT simples
      console.log('🧪 Teste 1: SELECT establishment_types')
      const selectResult = await database.select('establishment_types', {
        select: 'id, name',
        limit: 3
      })
      
      results.push({
        operation: 'SELECT establishment_types',
        success: !!selectResult,
        data: selectResult ? `${selectResult.length} registros` : null,
        error: generalError
      })

      // Teste 2: SELECT com filtro (se há dados)
      if (establishmentTypes.length > 0) {
        console.log('🧪 Teste 2: SELECT com filtro')
        const filteredResult = await database.select('establishment_types', {
          select: 'id, name',
          filter: { id: establishmentTypes[0].id }
        })
        
        results.push({
          operation: 'SELECT com filtro',
          success: !!filteredResult,
          data: filteredResult ? `${filteredResult.length} registros` : null,
          error: generalError
        })
      }

      // Teste 3: Verificar tabela users
      console.log('🧪 Teste 3: Verificar tabela users')
      const usersResult = await database.select('users', {
        select: 'id, email',
        limit: 1
      })
      
      results.push({
        operation: 'SELECT users',
        success: !!usersResult,
        data: usersResult ? `${usersResult.length} registros` : null,
        error: generalError
      })

    } catch (error) {
      console.error('❌ Erro nos testes CRUD:', error)
      results.push({
        operation: 'Teste CRUD',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }

    setTestResults(results)
  }

  const isLoading = generalLoading || estLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Demonstração Supabase MCP
          </CardTitle>
          <CardDescription>
            Exemplos práticos de uso do Model Context Protocol para Supabase
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tipos de Estabelecimento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Tipos de Estabelecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : establishmentTypes.length > 0 ? (
              <div>
                <p className="text-2xl font-bold text-green-600">{establishmentTypes.length}</p>
                <p className="text-sm text-gray-600">registros encontrados</p>
                <div className="mt-2 space-y-1">
                  {establishmentTypes.slice(0, 3).map((type) => (
                    <div key={type.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {type.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">Nenhum tipo encontrado</p>
                {estError && (
                  <p className="text-xs text-red-600 mt-1">{estError}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Planos de Assinatura */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Table className="h-4 w-4" />
              Planos de Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : subscriptionPlans.length > 0 ? (
              <div>
                <p className="text-2xl font-bold text-blue-600">{subscriptionPlans.length}</p>
                <p className="text-sm text-gray-600">planos disponíveis</p>
                <div className="mt-2 space-y-1">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="text-xs bg-blue-50 px-2 py-1 rounded">
                      {plan.name} - R$ {plan.price}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">Nenhum plano encontrado</p>
                {estError && (
                  <p className="text-xs text-red-600 mt-1">{estError}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testes CRUD */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Testes CRUD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runCrudTests} 
              disabled={isLoading}
              className="w-full mb-3"
              size="sm"
            >
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Executar Testes
            </Button>
            
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 text-xs p-2 rounded ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.operation}</p>
                      {result.data && (
                        <p className="text-gray-600">{result.data}</p>
                      )}
                      {result.error && (
                        <p className="text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exemplo de Código */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exemplo de Uso do MCP</CardTitle>
          <CardDescription>
            Como usar o Supabase MCP no seu código
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{`// 1. Importar o hook
import { useSupabaseMCP } from '../hooks/useSupabaseMCP'

// 2. Usar no componente
const { database, loading, error } = useSupabaseMCP()

// 3. Fazer consultas
const tipos = await database.select('establishment_types', {
  select: 'id, name',
  orderBy: { column: 'name', ascending: true },
  limit: 10
})

// 4. Inserir dados
const novoTipo = await database.insert('establishment_types', {
  name: 'Novo Tipo'
})

// 5. Atualizar dados
const atualizado = await database.update('establishment_types', 
  { name: 'Nome Atualizado' },
  { id: 1 }
)`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}