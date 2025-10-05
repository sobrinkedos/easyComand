import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '../ui'
import { User, Building, LogOut, Settings } from 'lucide-react'

export function Dashboard() {
  const { user, establishmentId, signOut, hasEstablishment } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🍽️ EasyComand Dashboard
            </h1>
            <p className="text-gray-600">Bem-vindo ao seu sistema de gestão</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              {user?.email}
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Status da Conta
              </CardTitle>
              <CardDescription>
                Informações sobre sua conta e estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* User Info */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações do Usuário
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>E-mail:</strong> {user?.email}</p>
                    <p><strong>ID:</strong> {user?.id}</p>
                    <p><strong>Criado em:</strong> {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Establishment Info */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Estabelecimento
                  </h3>
                  {hasEstablishment ? (
                    <div className="space-y-1 text-sm">
                      <p><strong>ID do Estabelecimento:</strong> {establishmentId}</p>
                      <p className="text-green-600">✅ Vinculado a um estabelecimento</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-yellow-600">⚠️ Não vinculado a um estabelecimento</p>
                      <Button size="sm" variant="outline">
                        Configurar Estabelecimento
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🍽️ Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Gerenciar pedidos do estabelecimento</p>
                <Button size="sm" className="w-full" disabled>
                  Em breve
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🪑 Mesas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Organizar mesas e ambientes</p>
                <Button size="sm" className="w-full" disabled>
                  Em breve
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📋 Cardápio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Gerenciar produtos e preços</p>
                <Button size="sm" className="w-full" disabled>
                  Em breve
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📊 Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Análises e métricas</p>
                <Button size="sm" className="w-full" disabled>
                  Em breve
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Development Info */}
          <Card>
            <CardHeader>
              <CardTitle>🚧 Em Desenvolvimento</CardTitle>
              <CardDescription>
                Próximas funcionalidades que serão implementadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Próximas Implementações:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Gestão de estabelecimentos</li>
                    <li>• Sistema de usuários e permissões</li>
                    <li>• Gestão de mesas e ambientes</li>
                    <li>• Catálogo de produtos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Funcionalidades Avançadas:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Sistema de pedidos em tempo real</li>
                    <li>• Interface da cozinha</li>
                    <li>• Gestão de clientes e fidelidade</li>
                    <li>• Relatórios e analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}