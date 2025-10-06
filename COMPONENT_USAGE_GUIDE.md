# Guia de Uso dos Componentes

## 📚 Índice
1. [KPICard](#kpicard)
2. [DataTable](#datatable)
3. [SearchBar](#searchbar)
4. [Sidebar](#sidebar)
5. [StatusIndicator](#statusindicator)
6. [Badge](#badge)

---

## KPICard

### Importação
```typescript
import { KPICard } from '@/components/ui'
import { DollarSign } from 'lucide-react'
```

### Uso Básico
```tsx
<KPICard
  title="Vendas Hoje"
  value="R$ 2.450,00"
  icon={DollarSign}
  iconColor="text-emerald-600"
  iconBgColor="bg-emerald-100"
/>
```

### Com Tendência
```tsx
<KPICard
  title="Pedidos Ativos"
  value="24"
  icon={ShoppingBag}
  iconColor="text-blue-600"
  iconBgColor="bg-blue-100"
  trend={{ 
    value: 12.5, 
    isPositive: true, 
    label: 'vs. ontem' 
  }}
/>
```

### Com Subtitle
```tsx
<KPICard
  title="Ticket Médio"
  value="R$ 85,50"
  icon={TrendingUp}
  iconColor="text-amber-600"
  iconBgColor="bg-amber-100"
  subtitle="por cliente"
/>
```

### Com Loading
```tsx
<KPICard
  title="Carregando..."
  value="0"
  icon={DollarSign}
  loading={true}
/>
```

### Grid de KPIs
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
</div>
```

### Cores Recomendadas por Tipo

#### Financeiro
```tsx
iconColor="text-emerald-600"
iconBgColor="bg-emerald-100"
```

#### Pedidos/Vendas
```tsx
iconColor="text-blue-600"
iconBgColor="bg-blue-100"
```

#### Clientes/Pessoas
```tsx
iconColor="text-purple-600"
iconBgColor="bg-purple-100"
```

#### Métricas/Analytics
```tsx
iconColor="text-amber-600"
iconBgColor="bg-amber-100"
```

---

## DataTable

### Importação
```typescript
import { DataTable, type Column } from '@/components/ui'
```

### Uso Básico
```tsx
const data = [
  { id: 1, name: 'Pizza', price: 'R$ 45,00' },
  { id: 2, name: 'Hambúrguer', price: 'R$ 32,00' },
]

const columns: Column<typeof data[0]>[] = [
  { key: 'name', header: 'Produto' },
  { key: 'price', header: 'Preço' },
]

<DataTable data={data} columns={columns} />
```

### Com Renderização Customizada
```tsx
const columns: Column<Order>[] = [
  { key: 'id', header: 'Pedido' },
  { key: 'table', header: 'Mesa' },
  {
    key: 'status',
    header: 'Status',
    render: (order) => (
      <StatusIndicator 
        variant={order.status} 
        label={getStatusLabel(order.status)} 
      />
    ),
  },
  {
    key: 'total',
    header: 'Total',
    render: (order) => (
      <span className="font-semibold text-emerald-600">
        {formatCurrency(order.total)}
      </span>
    ),
  },
]
```

### Com Click Handler
```tsx
<DataTable
  data={orders}
  columns={columns}
  onRowClick={(order) => {
    console.log('Pedido clicado:', order)
    navigate(`/orders/${order.id}`)
  }}
/>
```

### Com Loading
```tsx
<DataTable
  data={[]}
  columns={columns}
  loading={isLoading}
/>
```

### Com Empty State
```tsx
<DataTable
  data={[]}
  columns={columns}
  emptyMessage="Nenhum pedido encontrado"
/>
```

### Com Classes Customizadas
```tsx
const columns: Column<Product>[] = [
  { 
    key: 'name', 
    header: 'Produto',
    className: 'font-semibold' 
  },
  { 
    key: 'stock', 
    header: 'Estoque',
    className: 'text-right text-slate-500' 
  },
]
```

### Exemplo Completo
```tsx
function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders().then(data => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const columns: Column<Order>[] = [
    { key: 'id', header: 'ID' },
    { key: 'customer', header: 'Cliente' },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <StatusIndicator variant={order.status} />
      ),
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (order) => formatCurrency(order.total),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum pedido encontrado"
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
        />
      </CardContent>
    </Card>
  )
}
```

---

## SearchBar

### Importação
```typescript
import { SearchBar } from '@/components/ui'
```

### Uso Básico
```tsx
const [search, setSearch] = useState('')

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Buscar produtos..."
/>
```

### Com Callback de Limpar
```tsx
<SearchBar
  value={search}
  onChange={setSearch}
  onClear={() => {
    setSearch('')
    refetchData()
  }}
  placeholder="Buscar..."
/>
```

### Com Debounce
```tsx
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

function SearchableList() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch)
    }
  }, [debouncedSearch])

  return (
    <SearchBar
      value={search}
      onChange={setSearch}
      placeholder="Buscar..."
    />
  )
}
```

### Em um Header de Página
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">Produtos</h1>
  <SearchBar
    value={search}
    onChange={setSearch}
    placeholder="Buscar produtos..."
    className="w-64"
  />
</div>
```

---

## Sidebar

### Uso
A Sidebar é usada automaticamente pelo `MainLayout`:

```tsx
import { MainLayout } from '@/components/layout'

function MyPage() {
  return (
    <MainLayout>
      {/* Seu conteúdo aqui */}
    </MainLayout>
  )
}
```

### Customização de Itens
Para adicionar/modificar itens do menu, edite `src/components/layout/Sidebar.tsx`:

```typescript
const menuItems: SidebarMenuItem[] = [
  { 
    id: 'novo-item', 
    label: 'Novo Item', 
    icon: Star, 
    path: '/novo-item',
    iconColor: 'text-yellow-400',
    badge: 5 // Opcional
  },
  // ... outros itens
]
```

### Cores dos Ícones
Use as classes do Tailwind para cores:

```typescript
iconColor: 'text-blue-400'    // Azul
iconColor: 'text-emerald-400' // Verde
iconColor: 'text-amber-400'   // Amarelo/Laranja
iconColor: 'text-red-400'     // Vermelho
iconColor: 'text-purple-400'  // Roxo
iconColor: 'text-pink-400'    // Rosa
iconColor: 'text-cyan-400'    // Ciano
iconColor: 'text-indigo-400'  // Índigo
```

---

## StatusIndicator

### Importação
```typescript
import { StatusIndicator } from '@/components/ui'
```

### Variantes Disponíveis

#### Status de Mesas
```tsx
<StatusIndicator variant="available" label="Disponível" />
<StatusIndicator variant="occupied" label="Ocupada" />
<StatusIndicator variant="reserved" label="Reservada" />
<StatusIndicator variant="maintenance" label="Manutenção" />
```

#### Status de Pedidos
```tsx
<StatusIndicator variant="pending" label="Pendente" />
<StatusIndicator variant="preparing" label="Preparando" />
<StatusIndicator variant="ready" label="Pronto" />
<StatusIndicator variant="delivered" label="Entregue" />
```

#### Status de Comandas
```tsx
<StatusIndicator variant="open" label="Aberta" />
<StatusIndicator variant="closed" label="Fechada" />
<StatusIndicator variant="paid" label="Paga" />
```

### Sem Ponto Animado
```tsx
<StatusIndicator 
  variant="available" 
  label="Disponível" 
  showDot={false} 
/>
```

### Uso em Tabelas
```tsx
{
  key: 'status',
  header: 'Status',
  render: (item) => (
    <StatusIndicator 
      variant={item.status} 
      label={getStatusLabel(item.status)} 
    />
  ),
}
```

---

## Badge

### Importação
```typescript
import { Badge } from '@/components/ui'
```

### Variantes
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="accent">Accent</Badge>
<Badge variant="success">Sucesso</Badge>
<Badge variant="warning">Aviso</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="outline">Outline</Badge>
```

### Uso Semântico

#### Sucesso/Positivo
```tsx
<Badge variant="success">Ativo</Badge>
<Badge variant="success">Pago</Badge>
<Badge variant="success">Aprovado</Badge>
```

#### Aviso/Atenção
```tsx
<Badge variant="warning">Pendente</Badge>
<Badge variant="warning">Estoque Baixo</Badge>
<Badge variant="warning">Aguardando</Badge>
```

#### Erro/Negativo
```tsx
<Badge variant="destructive">Cancelado</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="destructive">Inativo</Badge>
```

#### Informação
```tsx
<Badge variant="info">Novo</Badge>
<Badge variant="info">Em breve</Badge>
<Badge variant="info">Beta</Badge>
```

### Em Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Título do Card
      <Badge variant="success">Ativo</Badge>
    </CardTitle>
  </CardHeader>
</Card>
```

### Em Tabelas
```tsx
{
  key: 'stock',
  header: 'Estoque',
  render: (item) => (
    <Badge 
      variant={
        item.stock > 20 ? 'success' : 
        item.stock > 10 ? 'warning' : 
        'destructive'
      }
    >
      {item.stock} unidades
    </Badge>
  ),
}
```

---

## 🎨 Exemplos de Páginas Completas

### Dashboard
```tsx
import { MainLayout } from '@/components/layout'
import { KPICard, DataTable, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'

export function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-slate-600 mt-1">Visão geral do estabelecimento</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Vendas Hoje"
            value="R$ 2.450,00"
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            trend={{ value: 12.5, isPositive: true }}
          />
          {/* ... mais KPIs */}
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={orders} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
```

### Página de Listagem com Busca
```tsx
import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { SearchBar, DataTable, Button } from '@/components/ui'
import { Plus } from 'lucide-react'

export function ProductsPage() {
  const [search, setSearch] = useState('')

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header com Busca */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Produtos</h1>
            <p className="text-slate-600 mt-1">Gerencie seu cardápio</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Busca */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar produtos..."
        />

        {/* Tabela */}
        <DataTable
          data={filteredProducts}
          columns={columns}
          onRowClick={(product) => navigate(`/products/${product.id}`)}
        />
      </div>
    </MainLayout>
  )
}
```

---

## 💡 Dicas e Boas Práticas

### 1. Consistência de Cores
Use sempre as mesmas cores para os mesmos tipos de dados:
- Verde: Sucesso, positivo, dinheiro
- Azul: Informação, pedidos
- Amarelo/Laranja: Aviso, atenção
- Vermelho: Erro, negativo
- Roxo: Clientes, pessoas

### 2. Loading States
Sempre forneça feedback visual durante carregamento:
```tsx
<KPICard loading={isLoading} {...props} />
<DataTable loading={isLoading} {...props} />
```

### 3. Empty States
Forneça mensagens claras quando não há dados:
```tsx
<DataTable
  data={[]}
  emptyMessage="Nenhum pedido encontrado. Crie seu primeiro pedido!"
/>
```

### 4. Responsividade
Use grids responsivos para KPIs:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### 5. Acessibilidade
- Use labels descritivos
- Forneça títulos para ícones no modo colapsado
- Mantenha contraste adequado

---

## 📚 Recursos Adicionais

- [Lucide Icons](https://lucide.dev/) - Biblioteca de ícones
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Shadcn/ui](https://ui.shadcn.com/) - Inspiração de componentes

---

**Nota:** Todos os componentes são totalmente tipados com TypeScript e seguem as melhores práticas do React.
