# 📦 Módulo de Gestão de Estoque

Sistema completo de gestão de estoque para produtos de revenda em bares e restaurantes.

## 🎯 Objetivo

Gerenciar produtos que são comprados prontos para revenda, sem manipulação na cozinha:
- Bebidas (refrigerantes, cervejas, águas, sucos)
- Salgadinhos industrializados
- Salgados congelados
- Doces e sobremesas
- Condimentos
- Descartáveis

## ✨ Funcionalidades

### ✅ Implementadas

- **Gestão de Produtos**
  - Cadastro completo com todas as informações
  - Categorização flexível
  - Controle de estoque mínimo/máximo
  - Preços de custo e venda
  - Código de barras e SKU
  - Produtos perecíveis com controle de validade
  - Informações de embalagem

- **Controle de Estoque**
  - Movimentações de entrada (compras)
  - Movimentações de saída (vendas)
  - Ajustes manuais
  - Registro de perdas
  - Histórico completo
  - Auditoria de todas as operações

- **Fornecedores**
  - Cadastro completo
  - Múltiplos contatos
  - Endereço e dados fiscais
  - Histórico de compras

- **Alertas Automáticos**
  - Estoque baixo
  - Produto sem estoque
  - Produtos vencendo
  - Produtos vencidos

- **Dashboard**
  - Estatísticas em tempo real
  - Valor total do estoque
  - Produtos críticos
  - Visão geral do negócio

### 🚧 Em Desenvolvimento

- Formulários completos de cadastro
- Integração com leitor de código de barras
- Relatórios avançados
- Gráficos de movimentação
- Exportação de dados

### 📋 Planejadas

- Importação de XML de nota fiscal
- Previsão de demanda com IA
- Pedidos automáticos para fornecedores
- App mobile para contagem
- Etiquetas de preço
- Análise de curva ABC
- Gestão de lotes
- Transferência entre estabelecimentos

## 🚀 Instalação

### 1. Aplicar Migração

```bash
# Opção 1: Supabase CLI
supabase db push

# Opção 2: SQL Editor do Supabase
# Copie e execute: supabase/migrations/20250105000004_create_stock_management.sql
```

### 2. Verificar Instalação

```bash
# Execute no SQL Editor:
# supabase/verify-stock-setup.sql
```

### 3. Popular Dados de Exemplo (Opcional)

```bash
# Execute no SQL Editor:
# supabase/seed-stock-data.sql
```

## 📖 Documentação

- **[Documentação Completa](docs/stock-management.md)** - Guia detalhado do sistema
- **[Guia Rápido](docs/stock-quick-start.md)** - Início rápido em 5 minutos
- **[Resumo da Implementação](STOCK_SYSTEM_IMPLEMENTATION.md)** - Detalhes técnicos

## 🗂️ Estrutura de Arquivos

```
📦 Sistema de Estoque
├── 📁 supabase/migrations/
│   └── 20250105000004_create_stock_management.sql  # Migração principal
├── 📁 supabase/
│   ├── seed-stock-data.sql                         # Dados de exemplo
│   └── verify-stock-setup.sql                      # Verificação
├── 📁 src/components/pages/
│   └── Estoque.tsx                                 # Interface web
├── 📁 docs/
│   ├── stock-management.md                         # Documentação completa
│   └── stock-quick-start.md                        # Guia rápido
├── STOCK_SYSTEM_IMPLEMENTATION.md                  # Resumo técnico
└── STOCK_README.md                                 # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

1. **stock_units** - Unidades de medida (un, cx, kg, L, etc.)
2. **stock_categories** - Categorias de produtos
3. **suppliers** - Fornecedores
4. **stock_products** - Produtos de estoque
5. **stock_movements** - Movimentações de estoque
6. **stock_alerts** - Alertas automáticos

### Funções SQL

- `update_product_stock()` - Atualiza estoque automaticamente
- `get_low_stock_products()` - Lista produtos com estoque baixo
- `get_stock_value()` - Calcula valor total do estoque
- `register_stock_exit_on_order()` - Saída automática em vendas

### Triggers

- `trigger_update_product_stock` - Atualiza estoque após movimentação

## 🔐 Segurança

- ✅ RLS (Row Level Security) em todas as tabelas
- ✅ Políticas de acesso por estabelecimento
- ✅ Auditoria de movimentações
- ✅ Validações de integridade

## 🎨 Interface

### Páginas

- **Dashboard** - Visão geral e estatísticas
- **Produtos** - Listagem e gestão de produtos
- **Categorias** - Gestão de categorias
- **Movimentações** - Histórico de movimentações
- **Fornecedores** - Gestão de fornecedores

### Componentes

- Cards de estatísticas
- Tabela de produtos com busca e filtros
- Cards de categorias com ícones
- Status visual (ok, baixo, sem estoque)
- Ações rápidas

## 💡 Exemplos de Uso

### Cadastrar Produto

```typescript
// Exemplo de produto
{
  name: "Coca-Cola 2L",
  category_id: 1,
  supplier_id: 1,
  unit_id: 1,
  current_stock: 48,
  minimum_stock: 24,
  cost_price: 6.50,
  sale_price: 12.00,
  brand: "Coca-Cola",
  sku: "REF-001"
}
```

### Registrar Entrada

```typescript
// Exemplo de movimentação
{
  product_id: 1,
  type: "entry",
  quantity: 48,
  unit_cost: 6.50,
  total_cost: 312.00,
  supplier_id: 1,
  invoice_number: "NF-12345"
}
```

### Consultar Estoque Baixo

```sql
SELECT * FROM get_low_stock_products(1);
```

### Calcular Valor do Estoque

```sql
SELECT get_stock_value(1);
```

## 📊 Relatórios

### Disponíveis

- Valor total do estoque
- Produtos com estoque baixo
- Produtos sem estoque
- Estatísticas gerais

### Em Desenvolvimento

- Produtos mais vendidos
- Análise de giro de estoque
- Previsão de compras
- Análise de fornecedores
- Margem de lucro por produto

## 🔄 Fluxos de Trabalho

### Fluxo de Compra

```
1. Receber mercadoria
2. Registrar entrada no sistema
3. Informar quantidade e custo
4. Sistema atualiza estoque
5. Verificar alertas
```

### Fluxo de Venda

```
1. Cliente faz pedido
2. Sistema registra saída automaticamente
3. Estoque é atualizado
4. Alerta gerado se necessário
```

### Fluxo de Contagem

```
1. Fazer contagem física
2. Comparar com sistema
3. Registrar ajuste se necessário
4. Investigar diferenças
```

## 🛠️ Tecnologias

- **Backend**: PostgreSQL + Supabase
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📞 Suporte

### Problemas Comuns

**Estoque negativo**
- Verifique movimentações
- Faça ajuste manual
- Investigue a causa

**Alerta não aparece**
- Verifique estoque mínimo
- Confirme que produto está ativo
- Verifique RLS

**Não consigo cadastrar**
- Verifique campos obrigatórios
- Confirme que categoria existe
- Verifique SKU duplicado

### Recursos

- [Documentação Completa](docs/stock-management.md)
- [Guia Rápido](docs/stock-quick-start.md)
- [Issues no GitHub](#)

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto faz parte do sistema EasyComand.

## 🎉 Agradecimentos

Desenvolvido com ❤️ para facilitar a gestão de bares e restaurantes.

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Status:** ✅ Pronto para uso
