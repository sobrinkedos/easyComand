# Controle de Estoque por Inquilino

<cite>
**Arquivos Referenciados neste Documento**   
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Introdução](#introdução)
2. [Estrutura de Tabelas e Isolamento por Inquilino](#estrutura-de-tabelas-e-isolamento-por-inquilino)
3. [Tipos de Movimentação e Motivos](#tipos-de-movimentação-e-motivos)
4. [Políticas de Segurança (RLS)](#políticas-de-segurança-rls)
5. [Exemplos de Consultas](#exemplos-de-consultas)
6. [Conclusão](#conclusão)

## Introdução
Este documento detalha o módulo de controle de estoque no contexto multi-inquilino do sistema EasyComand. O foco está nas tabelas `suppliers`, `stock_categories`, `stock_items` e `stock_movements`, explicando como o campo `establishment_id` garante o isolamento dos dados entre diferentes estabelecimentos. Também são descritos os tipos de movimentação, as razões possíveis, as políticas de segurança aplicadas e exemplos práticos de consultas para operações comuns no módulo de gestão de compras e controle de insumos.

## Estrutura de Tabelas e Isolamento por Inquilino

As tabelas de estoque são projetadas para suportar um modelo multi-inquilino, onde múltiplos estabelecimentos (inquilinos) compartilham a mesma instância do banco de dados, mas têm seus dados logicamente isolados. O mecanismo central para esse isolamento é o campo `establishment_id`, presente em todas as tabelas relacionadas ao estoque.

- **`suppliers`**: Armazena informações sobre fornecedores. Cada fornecedor pertence a um único estabelecimento, garantido pela chave estrangeira `establishment_id` que referencia a tabela `establishments`. A restrição `UNIQUE (establishment_id, cnpj_cpf)` impede que um mesmo fornecedor seja cadastrado duas vezes dentro do mesmo estabelecimento.
- **`stock_categories`**: Define categorias para itens de estoque, permitindo uma organização hierárquica (com a coluna `parent_category_id`). A presença do `establishment_id` assegura que categorias criadas por um estabelecimento não sejam visíveis ou utilizáveis por outro.
- **`stock_items`**: Representa os itens físicos em estoque, como ingredientes ou produtos acabados. Cada item é vinculado a uma categoria (`category_id`) e a um estabelecimento (`establishment_id`). As restrições `UNIQUE (establishment_id, name)` e `UNIQUE (establishment_id, barcode)` garantem que nomes e códigos de barras sejam únicos dentro do contexto de cada estabelecimento.

Esse padrão de design, onde o `establishment_id` é uma coluna obrigatória e parte de chaves únicas, é fundamental para a integridade dos dados em um ambiente multi-inquilino.

**Fontes da Seção**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L334-L385)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L334-L385)

## Tipos de Movimentação e Motivos

A tabela `stock_movements` registra todas as alterações no nível de estoque de um item. O tipo de movimentação é definido pelo ENUM `stock_movement_type`, que inclui os seguintes valores:

- **`entry`**: Uma entrada de estoque, geralmente resultante de uma compra ou transferência de entrada.
- **`exit`**: Uma saída de estoque, como a venda de um produto ou a utilização de um insumo.
- **`adjustment`**: Um ajuste manual no estoque, usado para corrigir discrepâncias encontradas em inventários.
- **`loss`**: Perda de itens, por exemplo, devido a derramamentos ou erros de manuseio.
- **`transfer`**: Transferência de itens entre estabelecimentos (se suportado).

A coluna `reason` (motivo), do tipo ENUM `stock_movement_reason`, fornece um contexto mais detalhado para a movimentação:

- **`sale`**: Saída de estoque devida à venda de um produto.
- **`loss`**: Perda de itens.
- **`expiration`**: Saída devido à validade vencida.
- **`breakage`**: Quebra ou dano do item.
- **`free_sample`**: Distribuição de amostras grátis.
- **`purchase`**: Entrada de estoque por meio de uma compra.
- **`consumption`**: Consumo interno, como em eventos ou degustações.

Essa granularidade permite gerar relatórios detalhados sobre o consumo e a movimentação de insumos, essenciais para a gestão de compras.

**Fontes da Seção**
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L15-L24)

## Políticas de Segurança (RLS)

A segurança e o isolamento de dados são garantidos pelo Row Level Security (RLS) do PostgreSQL. O RLS está habilitado em todas as tabelas de estoque, e políticas são aplicadas para garantir que um usuário só possa acessar dados do seu próprio estabelecimento.

O mecanismo funciona da seguinte maneira:
1.  Uma função auxiliar, `auth.get_current_establishment_id()` (ou `public.requesting_user_establishment_id()`), é usada para determinar o ID do estabelecimento do usuário autenticado atualmente. Essa função consulta a tabela `users` usando o ID do usuário fornecido pelo sistema de autenticação (`auth.uid()`).
2.  Políticas de RLS são criadas para cada tabela. Por exemplo, na tabela `stock_items`, a política é definida como `USING (establishment_id = auth.get_current_establishment_id())`. Isso significa que qualquer operação (SELECT, INSERT, UPDATE, DELETE) só será permitida se o `establishment_id` da linha for igual ao ID do estabelecimento do usuário logado.

Essas políticas são aplicadas de forma consistente a todas as tabelas de estoque (`suppliers`, `stock_categories`, `stock_items`, `stock_movements`), criando uma barreira de segurança robusta que previne o acesso acidental ou malicioso a dados de outros inquilinos.

```mermaid
graph TD
A[Usuário Autenticado] --> B[auth.uid()]
B --> C[Função: get_current_establishment_id()]
C --> D[Obtém establishment_id do Usuário]
D --> E[Tabela: stock_items]
E --> F[Política RLS: establishment_id = ?]
F --> G{Igual?}
G --> |Sim| H[Acesso Permitido]
G --> |Não| I[Acesso Negado]
```

**Fontes do Diagrama**
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L450-L547)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L184-L206)

**Fontes da Seção**
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L450-L547)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L184-L206)

## Exemplos de Consultas

Abaixo estão exemplos de consultas SQL que demonstram operações comuns no módulo de controle de estoque.

### Registrar uma Entrada de Estoque
Esta consulta insere um novo registro na tabela `stock_movements` para registrar a entrada de 50 unidades de um item de estoque com ID 123, devido a uma compra.

```sql
INSERT INTO public.stock_movements (establishment_id, stock_item_id, movement_type, quantity, reason, cost_at_movement)
VALUES (1, 123, 'entry', 50, 'purchase', 150.00);
```

**Fontes da Seção**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L386-L410)

### Consultar o Nível Atual de um Item
Para obter o nível atual de estoque de um item específico, é necessário somar todas as entradas e subtrair todas as saídas e perdas registradas na tabela `stock_movements`. Esta consulta calcula o saldo atual para o item com ID 123.

```sql
SELECT 
    si.name,
    COALESCE(SUM(CASE WHEN sm.movement_type = 'entry' THEN sm.quantity ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN sm.movement_type IN ('exit', 'loss', 'adjustment') THEN sm.quantity ELSE 0 END), 0) AS current_stock
FROM public.stock_items si
LEFT JOIN public.stock_movements sm ON si.id = sm.stock_item_id
WHERE si.id = 123
GROUP BY si.id, si.name;
```

**Fontes da Seção**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L386-L410)

### Gerar Relatórios de Consumo
Esta consulta gera um relatório de consumo (saídas de estoque) para um período específico, agrupado por motivo. Ela é útil para entender os padrões de uso de insumos.

```sql
SELECT 
    reason,
    SUM(quantity) AS total_quantity
FROM public.stock_movements
WHERE movement_type = 'exit' 
    AND created_at >= '2025-01-01' 
    AND created_at < '2025-02-01'
GROUP BY reason
ORDER BY total_quantity DESC;
```

**Fontes da Seção**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L386-L410)

## Conclusão
O módulo de controle de estoque do EasyComand implementa um modelo multi-inquilino robusto e seguro. O uso do campo `establishment_id` em conjunto com políticas de RLS garante que os dados de fornecedores, categorias, itens e movimentações sejam rigorosamente isolados entre diferentes estabelecimentos. A definição clara de tipos de movimentação e motivos permite um rastreamento preciso do fluxo de insumos, fornecendo as informações necessárias para uma gestão de compras eficiente e a geração de relatórios de consumo detalhados.