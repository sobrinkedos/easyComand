# Exemplos de Queries SQL - Sistema de Estoque

Este documento contém queries SQL úteis para trabalhar com o sistema de gestão de estoque.

## 📊 Consultas Básicas

### Listar Todos os Produtos

```sql
SELECT 
    sp.id,
    sp.name,
    sp.sku,
    sc.name as category,
    sp.current_stock,
    sp.minimum_stock,
    su.abbreviation as unit,
    sp.cost_price,
    sp.sale_price,
    s.name as supplier
FROM stock_products sp
JOIN stock_categories sc ON sp.category_id = sc.id
JOIN stock_units su ON sp.unit_id = su.id
LEFT JOIN suppliers s ON sp.supplier_id = s.id
WHERE sp.establishment_id = 1
AND sp.is_active = true
ORDER BY sp.name;
```

### Produtos com Estoque Baixo

```sql
SELECT 
    sp.name,
    sp.current_stock,
    sp.minimum_stock,
    su.abbreviation as unit,
    sc.name as category
FROM stock_products sp
JOIN stock_units su ON sp.unit_id = su.id
JOIN stock_categories sc ON sp.category_id = sc.id
WHERE sp.establishment_id = 1
AND sp.is_active = true
AND sp.current_stock <= sp.minimum_stock
ORDER BY sp.current_stock ASC;
```

### Produtos Sem Estoque

```sql
SELECT 
    sp.name,
    sc.name as category,
    s.name as supplier,
    s.phone as supplier_phone
FROM stock_products sp
JOIN stock_categories sc ON sp.category_id = sc.id
LEFT JOIN suppliers s ON sp.supplier_id = s.id
WHERE sp.establishment_id = 1
AND sp.is_active = true
AND sp.current_stock = 0
ORDER BY sc.name, sp.name;
```

### Valor Total do Estoque

```sql
SELECT 
    SUM(current_stock * cost_price) as total_value,
    COUNT(*) as total_products,
    SUM(current_stock) as total_items
FROM stock_products
WHERE establishment_id = 1
AND is_active = true;
```

### Valor do Estoque por Categoria

```sql
SELECT 
    sc.name as category,
    sc.icon,
    COUNT(sp.id) as product_count,
    SUM(sp.current_stock) as total_items,
    SUM(sp.current_stock * sp.cost_price) as total_value
FROM stock_categories sc
LEFT JOIN stock_products sp ON sc.id = sp.category_id AND sp.is_active = true
WHERE sc.establishment_id = 1
AND sc.is_active = true
GROUP BY sc.id, sc.name, sc.icon
ORDER BY total_value DESC;
```

## 📈 Movimentações

### Histórico de Movimentações de um Produto

```sql
SELECT 
    sm.created_at,
    sm.type,
    sm.quantity,
    su.abbreviation as unit,
    sm.unit_cost,
    sm.total_cost,
    sm.stock_before,
    sm.stock_after,
    s.name as supplier,
    sm.invoice_number,
    sm.reason,
    u.full_name as created_by
FROM stock_movements sm
JOIN stock_products sp ON sm.product_id = sp.id
JOIN stock_units su ON sp.unit_id = su.id
LEFT JOIN suppliers s ON sm.supplier_id = s.id
LEFT JOIN users u ON sm.created_by = u.id
WHERE sp.id = 1
ORDER BY sm.created_at DESC;
```

### Movimentações do Dia

```sql
SELECT 
    sm.created_at,
    sp.name as product,
    sm.type,
    sm.quantity,
    su.abbreviation as unit,
    sm.total_cost,
    s.name as supplier,
    u.full_name as created_by
FROM stock_movements sm
JOIN stock_products sp ON sm.product_id = sp.id
JOIN stock_units su ON sp.unit_id = su.id
LEFT JOIN suppliers s ON sm.supplier_id = s.id
LEFT JOIN users u ON sm.created_by = u.id
WHERE sm.establishment_id = 1
AND DATE(sm.created_at) = CURRENT_DATE
ORDER BY sm.created_at DESC;
```

### Total de Entradas por Fornecedor (Mês Atual)

```sql
SELECT 
    s.name as supplier,
    COUNT(sm.id) as entry_count,
    SUM(sm.quantity) as total_quantity,
    SUM(sm.total_cost) as total_cost
FROM stock_movements sm
JOIN suppliers s ON sm.supplier_id = s.id
WHERE sm.establishment_id = 1
AND sm.type = 'entry'
AND DATE_TRUNC('month', sm.created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY s.id, s.name
ORDER BY total_cost DESC;
```

### Perdas do Mês

```sql
SELECT 
    sp.name as product,
    SUM(sm.quantity) as total_lost,
    su.abbreviation as unit,
    SUM(sm.total_cost) as total_cost,
    STRING_AGG(DISTINCT sm.reason, ', ') as reasons
FROM stock_movements sm
JOIN stock_products sp ON sm.product_id = sp.id
JOIN stock_units su ON sp.unit_id = su.id
WHERE sm.establishment_id = 1
AND sm.type = 'loss'
AND DATE_TRUNC('month', sm.created_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY sp.id, sp.name, su.abbreviation
ORDER BY total_cost DESC;
```

## 🚨 Alertas

### Alertas Ativos

```sql
SELECT 
    sa.created_at,
    sa.alert_type,
    sp.name as product,
    sa.message,
    sc.name as category
FROM stock_alerts sa
JOIN stock_products sp ON sa.product_id = sp.id
JOIN stock_categories sc ON sp.category_id = sc.id
WHERE sa.establishment_id = 1
AND sa.is_resolved = false
ORDER BY 
    CASE sa.alert_type
        WHEN 'out_of_stock' THEN 1
        WHEN 'expired' THEN 2
        WHEN 'expiring_soon' THEN 3
        WHEN 'low_stock' THEN 4
    END,
    sa.created_at DESC;
```

### Produtos Vencendo nos Próximos 7 Dias

```sql
SELECT 
    sp.name as product,
    sm.expiration_date,
    sm.quantity,
    su.abbreviation as unit,
    (sm.expiration_date - CURRENT_DATE) as days_until_expiration
FROM stock_movements sm
JOIN stock_products sp ON sm.product_id = sp.id
JOIN stock_units su ON sp.unit_id = su.id
WHERE sm.establishment_id = 1
AND sm.expiration_date IS NOT NULL
AND sm.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY sm.expiration_date ASC;
```

## 📦 Fornecedores

### Fornecedores Mais Utilizados

```sql
SELECT 
    s.name,
    s.phone,
    s.whatsapp,
    COUNT(DISTINCT sm.id) as purchase_count,
    SUM(sm.total_cost) as total_spent,
    MAX(sm.created_at) as last_purchase
FROM suppliers s
LEFT JOIN stock_movements sm ON s.id = sm.supplier_id AND sm.type = 'entry'
WHERE s.establishment_id = 1
AND s.is_active = true
GROUP BY s.id, s.name, s.phone, s.whatsapp
ORDER BY total_spent DESC;
```

### Produtos por Fornecedor

```sql
SELECT 
    s.name as supplier,
    COUNT(sp.id) as product_count,
    STRING_AGG(sp.name, ', ') as products
FROM suppliers s
LEFT JOIN stock_products sp ON s.id = sp.supplier_id AND sp.is_active = true
WHERE s.establishment_id = 1
AND s.is_active = true
GROUP BY s.id, s.name
ORDER BY product_count DESC;
```

## 📊 Análises Avançadas

### Produtos Mais Vendidos (por Saídas)

```sql
SELECT 
    sp.name as product,
    sc.name as category,
    COUNT(sm.id) as sale_count,
    SUM(sm.quantity) as total_sold,
    su.abbreviation as unit,
    SUM(sm.total_cost) as total_cost,
    SUM(sm.quantity * sp.sale_price) as total_revenue,
    SUM(sm.quantity * sp.sale_price) - SUM(sm.total_cost) as profit
FROM stock_movements sm
JOIN stock_products sp ON sm.product_id = sp.id
JOIN stock_categories sc ON sp.category_id = sc.id
JOIN stock_units su ON sp.unit_id = su.id
WHERE sm.establishment_id = 1
AND sm.type = 'exit'
AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY sp.id, sp.name, sc.name, su.abbreviation, sp.sale_price
ORDER BY total_sold DESC
LIMIT 10;
```

### Margem de Lucro por Produto

```sql
SELECT 
    sp.name as product,
    sp.cost_price,
    sp.sale_price,
    sp.sale_price - sp.cost_price as profit_per_unit,
    ROUND(((sp.sale_price - sp.cost_price) / sp.sale_price * 100)::numeric, 2) as profit_margin_percent,
    sp.current_stock,
    (sp.sale_price - sp.cost_price) * sp.current_stock as potential_profit
FROM stock_products sp
WHERE sp.establishment_id = 1
AND sp.is_active = true
AND sp.sale_price IS NOT NULL
ORDER BY profit_margin_percent DESC;
```

### Giro de Estoque (últimos 30 dias)

```sql
SELECT 
    sp.name as product,
    sp.current_stock,
    COALESCE(SUM(CASE WHEN sm.type = 'exit' THEN sm.quantity ELSE 0 END), 0) as sold_last_30_days,
    CASE 
        WHEN sp.current_stock > 0 THEN 
            ROUND((COALESCE(SUM(CASE WHEN sm.type = 'exit' THEN sm.quantity ELSE 0 END), 0) / sp.current_stock)::numeric, 2)
        ELSE 0 
    END as turnover_rate,
    CASE 
        WHEN COALESCE(SUM(CASE WHEN sm.type = 'exit' THEN sm.quantity ELSE 0 END), 0) > 0 THEN
            ROUND((sp.current_stock / (COALESCE(SUM(CASE WHEN sm.type = 'exit' THEN sm.quantity ELSE 0 END), 0) / 30.0))::numeric, 1)
        ELSE NULL
    END as days_of_stock
FROM stock_products sp
LEFT JOIN stock_movements sm ON sp.id = sm.product_id 
    AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE sp.establishment_id = 1
AND sp.is_active = true
GROUP BY sp.id, sp.name, sp.current_stock
ORDER BY turnover_rate DESC;
```

### Análise de Compras por Mês

```sql
SELECT 
    TO_CHAR(sm.created_at, 'YYYY-MM') as month,
    COUNT(DISTINCT sm.id) as purchase_count,
    SUM(sm.quantity) as total_items,
    SUM(sm.total_cost) as total_spent,
    COUNT(DISTINCT sm.supplier_id) as supplier_count
FROM stock_movements sm
WHERE sm.establishment_id = 1
AND sm.type = 'entry'
AND sm.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(sm.created_at, 'YYYY-MM')
ORDER BY month DESC;
```

## 🔧 Manutenção

### Produtos Sem Movimentação (últimos 90 dias)

```sql
SELECT 
    sp.name as product,
    sc.name as category,
    sp.current_stock,
    su.abbreviation as unit,
    sp.current_stock * sp.cost_price as stock_value,
    MAX(sm.created_at) as last_movement
FROM stock_products sp
JOIN stock_categories sc ON sp.category_id = sc.id
JOIN stock_units su ON sp.unit_id = su.id
LEFT JOIN stock_movements sm ON sp.id = sm.product_id
WHERE sp.establishment_id = 1
AND sp.is_active = true
GROUP BY sp.id, sp.name, sc.name, sp.current_stock, su.abbreviation, sp.cost_price
HAVING MAX(sm.created_at) < CURRENT_DATE - INTERVAL '90 days' OR MAX(sm.created_at) IS NULL
ORDER BY stock_value DESC;
```

### Limpar Alertas Antigos Resolvidos

```sql
DELETE FROM stock_alerts
WHERE establishment_id = 1
AND is_resolved = true
AND resolved_at < CURRENT_DATE - INTERVAL '30 days';
```

### Produtos Duplicados (mesmo nome)

```sql
SELECT 
    name,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as product_ids
FROM stock_products
WHERE establishment_id = 1
GROUP BY name
HAVING COUNT(*) > 1;
```

## 🎯 Funções Auxiliares

### Usar Função de Produtos com Estoque Baixo

```sql
SELECT * FROM get_low_stock_products(1);
```

### Usar Função de Valor do Estoque

```sql
SELECT get_stock_value(1) as total_stock_value;
```

### Calcular Total de uma Comanda (se integrado)

```sql
SELECT * FROM calculate_tab_total(1);
```

## 📝 Inserções de Exemplo

### Inserir Nova Categoria

```sql
INSERT INTO stock_categories (establishment_id, name, description, icon, color)
VALUES (1, 'Energéticos', 'Bebidas energéticas', '⚡', '#EF4444');
```

### Inserir Novo Fornecedor

```sql
INSERT INTO suppliers (
    establishment_id, 
    name, 
    trade_name, 
    cnpj, 
    email, 
    phone, 
    whatsapp,
    address_city,
    address_state,
    contact_person
) VALUES (
    1,
    'Distribuidora Exemplo Ltda',
    'Exemplo Bebidas',
    '12.345.678/0001-90',
    'contato@exemplo.com.br',
    '(11) 3456-7890',
    '(11) 98765-4321',
    'São Paulo',
    'SP',
    'João Silva'
);
```

### Inserir Novo Produto

```sql
INSERT INTO stock_products (
    establishment_id,
    category_id,
    supplier_id,
    name,
    unit_id,
    current_stock,
    minimum_stock,
    cost_price,
    sale_price,
    brand,
    sku
) VALUES (
    1,
    1,
    1,
    'Red Bull 250ml',
    1,
    48,
    24,
    8.50,
    15.00,
    'Red Bull',
    'ENE-001'
);
```

### Registrar Entrada de Estoque

```sql
INSERT INTO stock_movements (
    establishment_id,
    product_id,
    type,
    quantity,
    unit_cost,
    total_cost,
    stock_before,
    stock_after,
    supplier_id,
    invoice_number,
    reason,
    created_by
) VALUES (
    1,
    1,
    'entry',
    48,
    8.50,
    408.00,
    0,
    48,
    1,
    'NF-12345',
    'Compra inicial',
    'user-uuid-here'
);
```

## 💡 Dicas

### Performance

- Use índices nas colunas mais consultadas
- Evite SELECT * em tabelas grandes
- Use LIMIT quando apropriado
- Considere criar views para queries complexas frequentes

### Boas Práticas

- Sempre filtre por `establishment_id`
- Verifique `is_active` quando relevante
- Use transações para operações múltiplas
- Mantenha histórico de movimentações

### Segurança

- Nunca exponha dados de outros estabelecimentos
- Use RLS para garantir isolamento
- Valide dados antes de inserir
- Mantenha auditoria de operações críticas

---

**Nota:** Substitua `establishment_id = 1` pelo ID do seu estabelecimento e `'user-uuid-here'` pelo UUID do usuário autenticado.
