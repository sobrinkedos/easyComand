import { MainLayout } from '../layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, StatusIndicator, Button, KPICard, DataTable } from '../ui';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const sampleData = [
  { id: '1', name: 'Pizza Margherita', category: 'Pizza', price: 'R$ 45,00', stock: 25 },
  { id: '2', name: 'Hambúrguer Artesanal', category: 'Lanches', price: 'R$ 32,00', stock: 18 },
  { id: '3', name: 'Refrigerante', category: 'Bebidas', price: 'R$ 8,00', stock: 150 },
];

export function DesignSystemShowcase() {

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-display font-bold text-neutral-800">
            Design System
          </h1>
          <p className="text-neutral-600 mt-2">
            Componentes e estilos do sistema de gestão gastronômica
          </p>
        </div>

        {/* KPI Cards */}
        <Card>
          <CardHeader>
            <CardTitle>KPI Cards</CardTitle>
            <CardDescription>
              Cards de métricas com ícones e indicadores de tendência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                trend={{ value: 8, isPositive: true }}
              />
              <KPICard
                title="Clientes"
                value="156"
                icon={Users}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-100"
                trend={{ value: 5.2, isPositive: false }}
              />
              <KPICard
                title="Ticket Médio"
                value="R$ 85,50"
                icon={TrendingUp}
                iconColor="text-amber-600"
                iconBgColor="bg-amber-100"
                subtitle="Últimos 7 dias"
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Paleta de Cores</CardTitle>
            <CardDescription>
              Cores temáticas para o segmento gastronômico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary - Amarelo */}
            <div>
              <h3 className="font-medium mb-3">Primary (Amarelo)</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-1">
                    <div
                      className={`h-16 rounded-lg bg-primary-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs text-center text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary - Verde */}
            <div>
              <h3 className="font-medium mb-3">Secondary (Verde)</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-1">
                    <div
                      className={`h-16 rounded-lg bg-secondary-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs text-center text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent - Laranja */}
            <div>
              <h3 className="font-medium mb-3">Accent (Laranja)</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-1">
                    <div
                      className={`h-16 rounded-lg bg-accent-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs text-center text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Tipografia</CardTitle>
            <CardDescription>
              Fontes Poppins (Display) e Inter (Sans)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-4xl font-display font-bold">Heading 1 - Poppins Bold</h1>
              <h2 className="text-3xl font-display font-semibold">Heading 2 - Poppins Semibold</h2>
              <h3 className="text-2xl font-display font-medium">Heading 3 - Poppins Medium</h3>
              <p className="text-base font-sans mt-4">
                Body text - Inter Regular. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p className="text-sm font-sans text-neutral-600 mt-2">
                Small text - Inter Regular. Sed do eiusmod tempor incididunt ut labore.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>
              Indicadores visuais para status e categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
            <CardDescription>
              Indicadores de status com animação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-neutral-700">Status de Mesas</h4>
                <StatusIndicator variant="available" label="Disponível" />
                <StatusIndicator variant="occupied" label="Ocupada" />
                <StatusIndicator variant="reserved" label="Reservada" />
                <StatusIndicator variant="maintenance" label="Manutenção" />
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-neutral-700">Status de Pedidos</h4>
                <StatusIndicator variant="pending" label="Pendente" />
                <StatusIndicator variant="preparing" label="Preparando" />
                <StatusIndicator variant="ready" label="Pronto" />
                <StatusIndicator variant="delivered" label="Entregue" />
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-neutral-700">Status de Comandas</h4>
                <StatusIndicator variant="open" label="Aberta" />
                <StatusIndicator variant="closed" label="Fechada" />
                <StatusIndicator variant="paid" label="Paga" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Variações de botões disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <Card>
          <CardHeader>
            <CardTitle>KPI Cards</CardTitle>
            <CardDescription>
              Cards de métricas com ícones e tendências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                trend={{ value: 8, isPositive: true }}
              />
              <KPICard
                title="Clientes"
                value="156"
                icon={Users}
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
                subtitle="por cliente"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>
              Tabela de dados com formatação customizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={sampleData}
              columns={[
                { key: 'name', header: 'Produto' },
                { key: 'category', header: 'Categoria' },
                { key: 'price', header: 'Preço' },
                {
                  key: 'stock',
                  header: 'Estoque',
                  render: (item) => (
                    <Badge variant={item.stock > 20 ? 'success' : item.stock > 10 ? 'warning' : 'destructive'}>
                      {item.stock} unidades
                    </Badge>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>
              Exemplos de cards com diferentes conteúdos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Card Simples</CardTitle>
                  <CardDescription>Com descrição</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    Conteúdo do card com informações relevantes.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border-primary-200 bg-primary-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Card Destacado
                    <Badge variant="default">Novo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-700">
                    Card com destaque visual usando cores primárias.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Card com Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <StatusIndicator variant="ready" label="Pronto para servir" />
                  <p className="text-sm text-neutral-600">
                    Card mostrando status atual.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
