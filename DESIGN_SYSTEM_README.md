# 🎨 Design System - EasyComand

Sistema de design completo para o sistema de gestão de restaurantes e bares.

## 📚 Documentação

### 1. [DESIGN_SYSTEM_IMPLEMENTATION.md](./DESIGN_SYSTEM_IMPLEMENTATION.md)
Documentação da implementação inicial do design system (Task 1).
- Paleta de cores gastronômica
- Fontes Poppins e Inter
- Componentes base (Badge, StatusIndicator)
- Menu lateral e layout responsivo

### 2. [DESIGN_INSPIRATION_ANALYSIS.md](./DESIGN_INSPIRATION_ANALYSIS.md)
Análise detalhada do design de referência do Dribbble.
- Elementos principais identificados
- Sugestões de melhorias
- Paleta de cores específica
- Checklist de implementação

### 3. [DESIGN_IMPROVEMENTS_SUMMARY.md](./DESIGN_IMPROVEMENTS_SUMMARY.md)
Resumo completo das melhorias implementadas.
- Sidebar com tema escuro
- Novos componentes (KPICard, DataTable, SearchBar)
- Dashboard redesenhado
- Comparação antes/depois

### 4. [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md)
Guia prático de uso de todos os componentes.
- Exemplos de código
- Props e variantes
- Boas práticas
- Páginas completas de exemplo

## 🚀 Quick Start

### Visualizar o Design System
```bash
npm run dev
```

Acesse:
- `/design-system` - Showcase completo dos componentes
- `/dashboard` - Dashboard com os novos componentes

### Usar os Componentes

```tsx
import { 
  KPICard, 
  DataTable, 
  SearchBar, 
  Badge, 
  StatusIndicator 
} from '@/components/ui'
import { MainLayout } from '@/components/layout'
```

## 📦 Componentes Disponíveis

### Layout
- `<MainLayout />` - Layout principal com sidebar
- `<Sidebar />` - Menu lateral com tema escuro

### Métricas
- `<KPICard />` - Cards de KPI com ícones e tendências

### Dados
- `<DataTable />` - Tabela de dados reutilizável
- `<SearchBar />` - Input de busca estilizado

### Status e Tags
- `<StatusIndicator />` - Indicadores de status animados
- `<Badge />` - Tags e labels coloridos

### Base (Shadcn/ui)
- `<Card />` - Container de conteúdo
- `<Button />` - Botões com variantes
- `<Input />` - Inputs de formulário
- `<Label />` - Labels de formulário

## 🎨 Paleta de Cores

### Cores Principais
- **Primary**: Amarelo (#FFC107) - Destaque, ações principais
- **Secondary**: Verde (#4CAF50) - Sucesso, positivo
- **Accent**: Laranja (#FF9800) - Avisos, atenção

### Cores Semânticas
- **Success**: Verde (#10B981) - Sucesso, confirmação
- **Warning**: Laranja (#F59E0B) - Aviso, atenção
- **Error**: Vermelho (#EF4444) - Erro, negativo
- **Info**: Azul (#3B82F6) - Informação

### Cores da Sidebar
- **Background**: Slate 900 (#0F172A)
- **Hover**: Slate 800 (#1E293B)
- **Text**: Slate 100 (#F1F5F9)

### Ícones dos Módulos
Cada módulo tem sua cor específica:
- Dashboard: Azul
- Balcão: Âmbar
- Mesas: Verde
- Cozinha: Vermelho
- Bar: Roxo
- Caixa: Teal
- Cardápio: Laranja
- Estoque: Índigo
- Clientes: Pink
- Relatórios: Cyan
- Configurações: Slate

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Comportamento
- **Mobile**: Sidebar oculta, botão hamburguer
- **Tablet**: Sidebar colapsável
- **Desktop**: Sidebar expandida por padrão

## 🎯 Exemplos Rápidos

### KPI Card
```tsx
<KPICard
  title="Vendas Hoje"
  value="R$ 2.450,00"
  icon={DollarSign}
  iconColor="text-emerald-600"
  iconBgColor="bg-emerald-100"
  trend={{ value: 12.5, isPositive: true }}
/>
```

### Data Table
```tsx
<DataTable
  data={orders}
  columns={[
    { key: 'id', header: 'Pedido' },
    { key: 'total', header: 'Total' },
    {
      key: 'status',
      header: 'Status',
      render: (order) => <StatusIndicator variant={order.status} />
    }
  ]}
/>
```

### Search Bar
```tsx
<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Buscar..."
/>
```

## 🔧 Customização

### Adicionar Item ao Menu
Edite `src/components/layout/Sidebar.tsx`:

```typescript
const menuItems: SidebarMenuItem[] = [
  {
    id: 'novo-item',
    label: 'Novo Item',
    icon: Star,
    path: '/novo-item',
    iconColor: 'text-yellow-400'
  },
  // ... outros itens
]
```

### Criar Nova Variante de Badge
Edite `src/components/ui/badge.tsx`:

```typescript
const badgeVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // ... variantes existentes
        custom: "bg-custom-500 text-white",
      },
    },
  }
)
```

## 📊 Estrutura de Arquivos

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Menu lateral
│   │   ├── MainLayout.tsx       # Layout principal
│   │   └── index.ts
│   ├── ui/
│   │   ├── badge.tsx            # Badges
│   │   ├── status-indicator.tsx # Status indicators
│   │   ├── kpi-card.tsx         # KPI cards
│   │   ├── data-table.tsx       # Tabelas
│   │   ├── search-bar.tsx       # Busca
│   │   ├── button.tsx           # Botões
│   │   ├── card.tsx             # Cards
│   │   ├── input.tsx            # Inputs
│   │   ├── label.tsx            # Labels
│   │   └── index.ts
│   ├── dashboard/
│   │   └── Dashboard.tsx        # Dashboard principal
│   ├── design-system/
│   │   └── DesignSystemShowcase.tsx  # Showcase
│   └── pages/
│       └── ComingSoon.tsx       # Placeholder pages
```

## ✅ Checklist de Qualidade

- ✅ TypeScript completo
- ✅ Componentes reutilizáveis
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Acessível (ARIA labels, contraste)
- ✅ Performático (lazy loading, memoization)
- ✅ Documentado (JSDoc, exemplos)
- ✅ Testável (props bem definidas)
- ✅ Consistente (design tokens, padrões)

## 🚀 Próximas Melhorias

### Curto Prazo
- [ ] Adicionar gráficos (Recharts)
- [ ] Implementar DateRangePicker
- [ ] Adicionar paginação no DataTable
- [ ] Implementar sorting no DataTable

### Médio Prazo
- [ ] Dark mode completo
- [ ] Animações com Framer Motion
- [ ] Temas customizáveis
- [ ] Mais variantes de componentes

### Longo Prazo
- [ ] Storybook para documentação
- [ ] Testes automatizados
- [ ] Biblioteca de componentes standalone
- [ ] Design tokens exportáveis

## 📝 Convenções

### Nomenclatura
- Componentes: PascalCase (`KPICard`, `DataTable`)
- Props: camelCase (`iconColor`, `isPositive`)
- Arquivos: kebab-case (`kpi-card.tsx`, `data-table.tsx`)

### Estrutura de Componentes
```tsx
// 1. Imports
import { ... } from '...'

// 2. Types/Interfaces
export interface ComponentProps { ... }

// 3. Component
export function Component({ ... }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => { ... }
  
  // 6. Render
  return (...)
}
```

### Cores
Use sempre as classes do Tailwind:
```tsx
// ✅ Correto
iconColor="text-emerald-600"
iconBgColor="bg-emerald-100"

// ❌ Evite
style={{ color: '#10B981' }}
```

## 🤝 Contribuindo

1. Siga as convenções estabelecidas
2. Documente novos componentes
3. Adicione exemplos de uso
4. Teste em diferentes resoluções
5. Verifique acessibilidade

## 📞 Suporte

Para dúvidas ou sugestões:
1. Consulte a documentação
2. Veja os exemplos no showcase
3. Leia o guia de uso dos componentes

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Status**: ✅ Produção

