import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, StatusIndicator, KPICard, DataTable, type Column } from '../ui'
import { MainLayout } from '../layout'
import { User, Building, Settings, DollarSign, ShoppingBag, Users as UsersIcon, TrendingUp, Clock } from 'lucide-react'

// Mock data para demonstração
const mockOrders = [
  { id: '001', table: 'Mesa 5', items: 3, total: 'R$ 125,00', status: 'preparing', time: '10 min' },
  { id: '002', table: 'Mesa 12', items: 5, total: 'R$ 230,00', status: 'ready', time: '5 min' },
  { id: '003', table: 'Balcão', items: 2, total: 'R$ 45,00', status: 'delivered', time: '2 min' },
  { id: '004', table: 'Mesa 8', items: 4, total: 'R$ 180,00', status: 'pending', time: '15 min' },
]

export function Dashboard() {
  const { user, establishmentId, hasEstablishment } = useAuth()

  const orderColumns: Column<typeof mockOrders[0]>[] = [
    { key: 'id', header: 'Pedido' },
    { key: 'table', header: 'Local' },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total' },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <StatusIndicator
          variant={order.status as any}
          label={
            order.status === 'preparing' ? 'Preparando' :
            order.status === 'ready' ? 'Pronto' :
            order.status === 'delivered' ? 'Entregue' :
            'Pendente'
          }
        />
      ),
    },
    { key: 'time', header: 'Tempo', className: 'text-slate-500' },
  ]

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-neutral-600 bg-white px-4 py-2 rounded-lg border border-neutral-200">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <p className="text-neutral-600">Visão geral do seu estabelecimento</p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Vendas Hoje"
            value="R$ 2.450,00"
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            trend={{ value: 12.5, isPositive: true, label: 'vs. ontem' }}
          />
          <KPICard
            title="Pedidos Ativos"
            value="24"
            icon={ShoppingBag}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            trend={{ value: 8, isPositive: true, label: 'vs. ontem' }}
          />
          <KPICard
            title="Clientes Hoje"
            value="156"
            icon={UsersIcon}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            trend={{ value: 5.2, isPositive: false, label: 'vs. ontem' }}
          />
          <KPICard
            title="Ticket Médio"
            value="R$ 85,50"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
            trend={{ value: 3.8, isPositive: true, label: 'vs. ontem' }}
          />
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Últimos pedidos do estabelecimento</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockOrders}
              columns={orderColumns}
            />
          </CardContent>
        </Card>
        {/* Account Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-neutral-500">E-mail</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Membro desde</p>
                <p className="font-medium">{new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Estabelecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasEstablishment ? (
                <div className="space-y-3">
                  <StatusIndicator variant="open" label="Estabelecimento configurado" />
                  <div>
                    <p className="text-sm text-neutral-500">ID</p>
                    <p className="font-medium font-mono text-sm">{establishmentId}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <StatusIndicator variant="pending" label="Estabelecimento não configurado" />
                  <Button size="sm" variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}