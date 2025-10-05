# Relatórios

<cite>
**Arquivos Referenciados neste Documento**  
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Introdução](#introdução)
2. [Fontes de Dados Primárias](#fontes-de-dados-primárias)
3. [Métricas-Chave e Agregações](#métricas-chave-e-agregações)
4. [Consultas Analíticas Exemplares](#consultas-analíticas-exemplares)
5. [Segurança e Isolamento de Dados (RLS)](#segurança-e-isolamento-de-dados-rls)
6. [Otimização de Desempenho](#otimização-de-desempenho)
7. [Personalização no Frontend](#personalização-no-frontend)

## Introdução

Este documento detalha o módulo de Relatórios do sistema de gestão para restaurantes e bares. O sistema é projetado com uma arquitetura multi-tenant, onde todos os dados são segregados por estabelecimento. Os relatórios são gerados a partir de dados agregados de vendas, estoque, fidelidade e atividade de usuários, garantindo que cada cliente tenha acesso apenas às informações relevantes ao seu próprio negócio. A segurança, desempenho e flexibilidade são pilares fundamentais do design.

## Fontes de Dados Primárias

Os dados para os relatórios são extraídos de várias tabelas centrais no banco de dados, todas compartilhando um mecanismo comum de isolamento de dados por meio da coluna `establishment_id`.

### Tabelas Principais

As tabelas a seguir são as fontes primárias para a geração de relatórios:

| Tabela | Descrição | Fonte |
| :--- | :--- | :--- |
| `orders` | Armazena todos os pedidos realizados, incluindo valor total, status, tipo (local, delivery) e data. É a base para relatórios de vendas. | [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L279) |
| `order_items` | Detalha os itens de cada pedido, com quantidade, preço unitário e produto. Essencial para análises de produtos mais vendidos. | [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L307) |
| `customers` | Contém informações sobre os clientes, incluindo o total gasto (`total_spent`) e pontos de fidelidade (`loyalty_points`). Fundamental para relatórios de fidelidade. | [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L180) |
| `stock_movements` | Registra todas as movimentações de estoque (entradas, saídas, ajustes) com motivo, quantidade e custo. Base para relatórios de controle de estoque. | [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L386) |
| `user_activity_log` | Monitora as ações dos usuários dentro do sistema, permitindo auditoria e análise de uso. | [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L142) |

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L142-L386)

## Métricas-Chave e Agregações

O módulo de relatórios calcula diversas métricas essenciais para a gestão do negócio, utilizando funções de agregação SQL como `SUM`, `COUNT`, `AVG` e `GROUP BY`.

### Métricas de Vendas
- **Total de Vendas por Período**: Calculado pela soma do campo `total_amount` na tabela `orders`, agrupado por dia, semana ou mês.
- **Produtos Mais Vendidos**: Determinado pela soma do campo `quantity` na tabela `order_items`, agrupado pelo `product_id` e ordenado em ordem decrescente.

### Métricas de Fidelidade
- **Pontos de Fidelidade Acumulados**: A soma do campo `loyalty_points` na tabela `customers` fornece o total de pontos do programa. Para pontos ganhos por período, seria necessário consultar uma tabela de transações de fidelidade (implícita no tipo `customer_loyalty_transaction_type`).
- **Clientes Mais Ativos**: Identificado pela contagem de pedidos por `customer_id` na tabela `orders`.

### Métricas de Estoque
- **Movimentações de Estoque**: A tabela `stock_movements` permite calcular o volume total de entradas e saídas, além de identificar movimentações por motivo (ex: `sale`, `loss`, `purchase`).
- **Custo de Insumos por Pedido**: Pode ser estimado somando o `cost_at_movement` dos itens de estoque consumidos, correlacionados com os produtos do pedido.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L180-L386)

## Consultas Analíticas Exemplares

Abaixo estão exemplos de consultas SQL que podem ser usadas para gerar relatórios comuns.

### Faturamento Diário

Esta consulta retorna o faturamento total para cada dia.

```sql
SELECT 
    order_date,
    SUM(total_amount) AS daily_revenue
FROM public.orders
GROUP BY order_date
ORDER BY order_date DESC;
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L279)

### Custo de Insumos por Pedido

Esta consulta complexa estima o custo dos insumos para cada pedido, assumindo uma relação entre produtos e itens de estoque (por exemplo, via uma tabela de receitas).

```sql
SELECT 
    o.id AS order_id,
    SUM(oi.quantity * sm.cost_at_movement) AS total_cost
FROM public.orders o
JOIN public.order_items oi ON o.id = oi.order_id
-- JOIN com uma tabela de receitas para mapear produtos para itens de estoque
-- JOIN com stock_movements para obter o custo no momento do consumo
GROUP BY o.id;
```

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L307)

## Segurança e Isolamento de Dados (RLS)

A segurança dos dados é garantida pela implementação de **Políticas de Segurança em Nível de Linha (RLS - Row Level Security)** no PostgreSQL. Isso assegura que um usuário só possa acessar dados do seu próprio estabelecimento.

### Mecanismo de Isolamento

1.  **Coluna `establishment_id`**: Todas as tabelas de dados do cliente (tenant-specific) possuem uma coluna `establishment_id` que referencia o estabelecimento ao qual os dados pertencem.
2.  **Função de Autorização**: Uma função armazenada, como `auth.get_current_establishment_id()` ou `public.get_my_establishment_id()`, é usada para determinar o ID do estabelecimento do usuário autenticado atual.
3.  **Políticas RLS**: Políticas são criadas em cada tabela para restringir o acesso. Por exemplo, a política para a tabela `orders` é:
    ```sql
    CREATE POLICY "Tenant isolation for orders" ON public.orders 
    USING (establishment_id = public.get_my_establishment_id());
    ```
    Isso significa que qualquer consulta à tabela `orders` só retornará linhas onde o `establishment_id` corresponde ao do usuário logado.

### Implementação

As políticas RLS são definidas nos arquivos de migração, como `20250101000001_initial_schema_fixed.sql` e `20250101000001_rls_security_fix.sql`. O uso de uma função centralizada para obter o `establishment_id` garante consistência e facilita a manutenção.

```mermaid
graph TD
A[Usuário Autenticado] --> B{Consulta SQL}
B --> C[Tabela com RLS]
C --> D[Política RLS]
D --> E[Função: get_current_establishment_id()]
E --> F[Retorna ID do Estabelecimento]
D --> G[Compara establishment_id da linha com o ID retornado]
G --> H{Corresponde?}
H --> |Sim| I[Retorna a Linha]
H --> |Não| J[Não Retorna a Linha]
```

**Diagram sources**
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L469-L501)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L1-L357)

**Section sources**
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L469-L501)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L1-L357)

## Otimização de Desempenho

Para garantir que os relatórios sejam rápidos mesmo com grandes volumes de dados, são necessárias estratégias de otimização.

### Índices

Índices são cruciais para acelerar consultas de agregação e filtragem. Exemplos de índices recomendados:
- `CREATE INDEX idx_orders_establishment_date ON orders(establishment_id, order_date);` para filtrar por estabelecimento e período.
- `CREATE INDEX idx_stock_movements_establishment_item ON stock_movements(establishment_id, stock_item_id);` para análises de movimentação por item.
- `CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);` para juntar pedidos e itens.

### Views Materializadas

Para relatórios muito pesados que não precisam ser atualizados em tempo real, **views materializadas** são a solução ideal. Elas armazenam o resultado de uma consulta em disco, permitindo leituras extremamente rápidas.

Por exemplo, uma view materializada para o faturamento diário:
```sql
CREATE MATERIALIZED VIEW daily_revenue_mv AS
SELECT 
    establishment_id,
    order_date,
    SUM(total_amount) AS daily_revenue
FROM public.orders
GROUP BY establishment_id, order_date;

-- Atualizar a view (pode ser feito por um job agendado)
REFRESH MATERIALIZED VIEW daily_revenue_mv;
```
Isso transforma uma consulta de agregação em uma simples leitura de tabela.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L279)
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L386)

## Personalização no Frontend

O frontend da aplicação permite que os usuários personalizem seus relatórios, mas a lógica de segurança e agregação permanece no backend.

### Fluxo de Personalização
1.  **Seleção de Filtros**: O usuário escolhe filtros como período, tipo de pedido ou categoria de produto.
2.  **Geração de Consulta**: O frontend (ou um serviço backend) constrói uma consulta SQL parametrizada com base nos filtros selecionados.
3.  **Execução Segura**: A consulta é executada no banco de dados. Graças às políticas RLS, mesmo que a consulta não inclua explicitamente `establishment_id`, o sistema automaticamente filtra os resultados.
4.  **Visualização**: Os dados retornados são renderizados em gráficos ou tabelas no frontend.

Essa arquitetura permite flexibilidade na apresentação dos dados sem comprometer a segurança ou a integridade dos dados do multi-tenant.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L469-L505)