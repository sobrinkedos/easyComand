# Guia Rápido - Sistema EasyComand

## 🚀 Como Usar os Novos Componentes

### 1. KPICard - Cards de Métricas

Use para exibir métricas importantes com indicadores visuais:

```tsx
import { KPICard } from '@/components/ui';
import { DollarSign } from 'lucide-react';

<KPICard
  title="Vendas Hoje"
  value="R$ 2.450,00"
  icon={DollarSign}
  iconColor="text-emerald-600"
  iconBgColor="bg-emerald-100"
  trend={{ 
    value: 12.5, 
    isPositive: true, 
    label: 'vs. ontem' 
  }}
/>
```

**Props:**
- `title`: Título do card
- `value`: Valor principal (string ou número)
- `icon`: Ícone do Lucide React
- `iconColor`: Cor do ícone (Tailwind class)
- `iconBgColor`: Cor de fundo do ícone (Tailwind class)
- `trend`: Objeto com `value`, `isPositive` e `label` opcional
- `subtitle`: Texto adicional (opcional)
- `loading`: Estado de carregamento (opcional)

### 2. DataTable - Tabelas de Dados

Use para exibir listas de dados com sorting:

```tsx
import { DataTable } from '@/components/ui';
import type { Column } from '@/components/ui';

// Defina suas colunas
const columns: Column<Order>[] = [
  { 
    key: 'id', 
    header: 'Pedido', 
    sortable: true 
  },
  { 
    key: 'status', 
    header: 'Status',
    render: (order) => (
      <StatusIndicator variant={order.status} />
    )
  },
];

// Use o componente
<DataTable
  data={orders}
  columns={columns}
  keyExtractor={(order) => order.id}
  onRowClick={(order) => handleClick(order)}
  loading={isLoading}
  emptyMessage="Nenhum pedido encontrado"
/>
```

**Props:**
- `data`: Array de dados
- `columns`: Array de definições de colunas
- `keyExtractor`: Função para extrair chave única
- `onRowClick`: Callback ao clicar na linha (opcional)
- `loading`: Estado de carregamento (opcional)
- `emptyMessage`: Mensagem quando vazio (opcional)

**Column Props:**
- `key`: Chave do campo no objeto
- `header`: Texto do cabeçalho
- `sortable`: Habilita ordenação (opcional)
- `render`: Função customizada de renderização (opcional)
- `className`: Classes CSS adicionais (opcional)

### 3. StatusIndicator - Indicadores de Status

Use para mostrar status com cores e animações:

```tsx
import { StatusIndicator } from '@/components/ui';

<StatusIndicator 
  variant="preparing" 
  label="Preparando" 
/>
```

**Variantes disponíveis:**
- `available` - Verde com pulso
- `occupied` - Laranja
- `reserved` - Amarelo
- `maintenance` - Cinza
- `pending` - Amarelo com pulso
- `preparing` - Laranja
- `ready` - Verde com pulso
- `delivered` - Cinza
- `open` - Verde com pulso
- `closed` - Cinza
- `paid` - Amarelo

### 4. Badge - Etiquetas

Use para categorias, tags e status:

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="info">Em breve</Badge>
```

**Variantes:**
- `default` - Amarelo primário
- `secondary` - Verde
- `accent` - Laranja
- `success` - Verde
- `warning` - Laranja
- `destructive` - Vermelho
- `info` - Azul
- `outline` - Contorno apenas

## 🎨 Cores dos Ícones por Módulo

Use estas cores para manter consistência:

```tsx
// Dashboard
iconColor="text-blue-400"
iconBgColor="bg-blue-100"

// Vendas/Caixa
iconColor="text-emerald-600"
iconBgColor="bg-emerald-100"

// Pedidos
iconColor="text-blue-600"
iconBgColor="bg-blue-100"

// Clientes
iconColor="text-purple-600"
iconBgColor="bg-purple-100"

// Métricas
iconColor="text-amber-600"
iconBgColor="bg-amber-100"
```

## 📐 Layout Padrão

Todas as páginas devem usar o MainLayout:

```tsx
import { MainLayout } from '@/components/layout';

export function MyPage() {
  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-800">
          Título da Página
        </h1>
        <p className="text-neutral-600 mt-1">
          Descrição da página
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Seu conteúdo aqui */}
      </div>
    </MainLayout>
  );
}
```

## 🎯 Exemplo Completo: Página de Pedidos

```tsx
import { MainLayout } from '@/components/layout';
import { KPICard, DataTable, StatusIndicator, Button } from '@/components/ui';
import { ShoppingBag, Clock, CheckCircle, DollarSign } from 'lucide-react';
import type { Column } from '@/components/ui';

interface Order {
  id: string;
  table: string;
  items: number;
  total: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  time: string;
}

export function OrdersPage() {
  const orders: Order[] = [
    // seus dados aqui
  ];

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Pedido', sortable: true },
    { key: 'table', header: 'Mesa', sortable: true },
    { key: 'items', header: 'Items', sortable: true },
    { key: 'total', header: 'Total', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <StatusIndicator variant={order.status} />
      ),
    },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Pedidos
          </h1>
          <p className="text-neutral-600 mt-1">
            Gerencie todos os pedidos do estabelecimento
          </p>
        </div>
        <Button>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Pedidos Hoje"
          value="48"
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Em Preparo"
          value="12"
          icon={Clock}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <KPICard
          title="Concluídos"
          value="36"
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <KPICard
          title="Faturamento"
          value="R$ 2.450"
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={{ value: 8.5, isPositive: true }}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={orders}
            columns={columns}
            keyExtractor={(order) => order.id}
            onRowClick={(order) => console.log('Clicked:', order)}
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
```

## 🎨 Tipografia

Use as classes corretas para hierarquia:

```tsx
// Títulos de página
<h1 className="text-3xl font-display font-bold text-neutral-800">

// Subtítulos
<h2 className="text-2xl font-display font-semibold text-neutral-800">

// Títulos de seção
<h3 className="text-xl font-display font-medium text-neutral-800">

// Texto normal
<p className="text-base text-neutral-600">

// Texto pequeno
<p className="text-sm text-neutral-500">
```

## 📱 Grid Responsivo

Use o sistema de grid do Tailwind:

```tsx
// 1 coluna mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// 1 coluna mobile, 2 desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// 1 coluna mobile, 3 desktop
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

## 🔍 Dicas de Performance

1. **Use React.memo** para componentes pesados:
```tsx
export const MyComponent = React.memo(({ data }) => {
  // ...
});
```

2. **Use useMemo** para cálculos complexos:
```tsx
const sortedData = useMemo(() => {
  return data.sort(/* ... */);
}, [data]);
```

3. **Use useCallback** para funções passadas como props:
```tsx
const handleClick = useCallback((item) => {
  // ...
}, [dependencies]);
```

## 📚 Recursos Adicionais

- **Ícones**: [Lucide React](https://lucide.dev/)
- **Tailwind CSS**: [Documentação](https://tailwindcss.com/docs)
- **React Router**: [Documentação](https://reactrouter.com/)
- **TypeScript**: [Documentação](https://www.typescriptlang.org/docs/)

## 🐛 Troubleshooting

### Ícones não aparecem
```bash
npm install lucide-react
```

### Estilos não aplicam
Verifique se o Tailwind está configurado corretamente em `tailwind.config.js`

### TypeScript errors
Execute:
```bash
npm run build
```

Para ver todos os erros de uma vez.

---

**Dúvidas?** Consulte os arquivos de documentação:
- `DESIGN_SYSTEM_IMPLEMENTATION.md`
- `DESIGN_IMPROVEMENTS_IMPLEMENTED.md`
- `DESIGN_INSPIRATION_ANALYSIS.md`
