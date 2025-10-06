-- =============================================
-- SEED DATA - GESTÃO DE ESTOQUE
-- =============================================
/*
# Dados Iniciais para Sistema de Estoque

## Descrição:
Este script popula o banco com dados iniciais para facilitar
o desenvolvimento e testes do sistema de gestão de estoque.

## Inclui:
- Categorias padrão de produtos
- Produtos de exemplo
- Fornecedores de exemplo
*/

-- =============================================
-- 1. CATEGORIAS PADRÃO (para establishment_id = 1)
-- =============================================

-- Verificar se já existem categorias antes de inserir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.stock_categories WHERE establishment_id = 1) THEN
        INSERT INTO public.stock_categories (establishment_id, name, description, icon, color) VALUES
            (1, 'Refrigerantes', 'Refrigerantes e bebidas gaseificadas', '🥤', '#3B82F6'),
            (1, 'Cervejas', 'Cervejas nacionais e importadas', '🍺', '#F59E0B'),
            (1, 'Águas e Sucos', 'Águas minerais e sucos naturais', '💧', '#06B6D4'),
            (1, 'Vinhos e Destilados', 'Vinhos, whisky, vodka e outros destilados', '🍷', '#8B5CF6'),
            (1, 'Energéticos', 'Bebidas energéticas', '⚡', '#EF4444'),
            (1, 'Salgadinhos', 'Salgadinhos industrializados', '🍿', '#F97316'),
            (1, 'Salgados Congelados', 'Coxinhas, pastéis e outros salgados', '🥟', '#10B981'),
            (1, 'Doces e Sobremesas', 'Chocolates, balas e sobremesas', '🍫', '#EC4899'),
            (1, 'Condimentos', 'Molhos, temperos e condimentos', '🧂', '#6B7280'),
            (1, 'Descartáveis', 'Copos, pratos, talheres descartáveis', '🥤', '#64748B');
        
        RAISE NOTICE 'Categorias padrão inseridas com sucesso!';
    ELSE
        RAISE NOTICE 'Categorias já existem, pulando inserção.';
    END IF;
END $$;

-- =============================================
-- 2. FORNECEDORES DE EXEMPLO (para establishment_id = 1)
-- =============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.suppliers WHERE establishment_id = 1) THEN
        INSERT INTO public.suppliers (
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
        ) VALUES
            (1, 'Distribuidora ABC Ltda', 'ABC Bebidas', '12.345.678/0001-90', 'contato@abcbebidas.com.br', '(11) 3456-7890', '(11) 98765-4321', 'São Paulo', 'SP', 'João Silva'),
            (1, 'Comercial XYZ S.A.', 'XYZ Alimentos', '98.765.432/0001-10', 'vendas@xyzalimentos.com.br', '(11) 2345-6789', '(11) 97654-3210', 'São Paulo', 'SP', 'Maria Santos'),
            (1, 'Atacadão do Bar', 'Atacadão do Bar', '11.222.333/0001-44', 'pedidos@atacadaobar.com.br', '(11) 4567-8901', '(11) 96543-2109', 'Guarulhos', 'SP', 'Pedro Costa'),
            (1, 'Distribuidora Cervejeira Nacional', 'DCN Bebidas', '22.333.444/0001-55', 'sac@dcnbebidas.com.br', '(11) 5678-9012', '(11) 95432-1098', 'São Paulo', 'SP', 'Ana Oliveira');
        
        RAISE NOTICE 'Fornecedores de exemplo inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Fornecedores já existem, pulando inserção.';
    END IF;
END $$;

-- =============================================
-- 3. PRODUTOS DE EXEMPLO (para establishment_id = 1)
-- =============================================

DO $$
DECLARE
    cat_refrigerantes INT;
    cat_cervejas INT;
    cat_aguas INT;
    cat_salgadinhos INT;
    cat_salgados INT;
    sup_abc INT;
    sup_xyz INT;
    sup_atacadao INT;
    sup_dcn INT;
    unit_un INT;
    unit_cx INT;
    unit_pct INT;
BEGIN
    -- Buscar IDs das categorias
    SELECT id INTO cat_refrigerantes FROM public.stock_categories WHERE name = 'Refrigerantes' AND establishment_id = 1;
    SELECT id INTO cat_cervejas FROM public.stock_categories WHERE name = 'Cervejas' AND establishment_id = 1;
    SELECT id INTO cat_aguas FROM public.stock_categories WHERE name = 'Águas e Sucos' AND establishment_id = 1;
    SELECT id INTO cat_salgadinhos FROM public.stock_categories WHERE name = 'Salgadinhos' AND establishment_id = 1;
    SELECT id INTO cat_salgados FROM public.stock_categories WHERE name = 'Salgados Congelados' AND establishment_id = 1;
    
    -- Buscar IDs dos fornecedores
    SELECT id INTO sup_abc FROM public.suppliers WHERE name = 'Distribuidora ABC Ltda' AND establishment_id = 1;
    SELECT id INTO sup_xyz FROM public.suppliers WHERE name = 'Comercial XYZ S.A.' AND establishment_id = 1;
    SELECT id INTO sup_atacadao FROM public.suppliers WHERE name = 'Atacadão do Bar' AND establishment_id = 1;
    SELECT id INTO sup_dcn FROM public.suppliers WHERE name = 'Distribuidora Cervejeira Nacional' AND establishment_id = 1;
    
    -- Buscar IDs das unidades
    SELECT id INTO unit_un FROM public.stock_units WHERE abbreviation = 'un';
    SELECT id INTO unit_cx FROM public.stock_units WHERE abbreviation = 'cx';
    SELECT id INTO unit_pct FROM public.stock_units WHERE abbreviation = 'pct';
    
    IF NOT EXISTS (SELECT 1 FROM public.stock_products WHERE establishment_id = 1) THEN
        -- Refrigerantes
        INSERT INTO public.stock_products (
            establishment_id, category_id, supplier_id, name, unit_id,
            current_stock, minimum_stock, cost_price, sale_price, brand, sku
        ) VALUES
            (1, cat_refrigerantes, sup_abc, 'Coca-Cola 2L', unit_un, 48, 24, 6.50, 12.00, 'Coca-Cola', 'REF-001'),
            (1, cat_refrigerantes, sup_abc, 'Coca-Cola Zero 2L', unit_un, 36, 24, 6.50, 12.00, 'Coca-Cola', 'REF-002'),
            (1, cat_refrigerantes, sup_abc, 'Guaraná Antarctica 2L', unit_un, 42, 24, 5.80, 10.00, 'Antarctica', 'REF-003'),
            (1, cat_refrigerantes, sup_abc, 'Fanta Laranja 2L', unit_un, 30, 18, 5.50, 10.00, 'Fanta', 'REF-004'),
            (1, cat_refrigerantes, sup_abc, 'Sprite 2L', unit_un, 24, 18, 5.50, 10.00, 'Sprite', 'REF-005'),
            
            -- Cervejas
            (1, cat_cervejas, sup_dcn, 'Heineken 600ml', unit_un, 120, 60, 5.80, 12.00, 'Heineken', 'CER-001'),
            (1, cat_cervejas, sup_dcn, 'Brahma Duplo Malte 350ml', unit_un, 144, 72, 2.80, 6.00, 'Brahma', 'CER-002'),
            (1, cat_cervejas, sup_dcn, 'Skol Lata 350ml', unit_un, 168, 96, 2.50, 5.50, 'Skol', 'CER-003'),
            (1, cat_cervejas, sup_dcn, 'Budweiser 330ml', unit_un, 96, 48, 3.20, 7.00, 'Budweiser', 'CER-004'),
            (1, cat_cervejas, sup_dcn, 'Corona Extra 330ml', unit_un, 72, 36, 4.50, 10.00, 'Corona', 'CER-005'),
            
            -- Águas e Sucos
            (1, cat_aguas, sup_xyz, 'Água Mineral Crystal 500ml', unit_un, 96, 48, 1.20, 3.00, 'Crystal', 'AGU-001'),
            (1, cat_aguas, sup_xyz, 'Suco Del Valle Laranja 1L', unit_un, 36, 24, 4.80, 9.00, 'Del Valle', 'SUC-001'),
            (1, cat_aguas, sup_xyz, 'Suco Del Valle Uva 1L', unit_un, 30, 24, 4.80, 9.00, 'Del Valle', 'SUC-002'),
            
            -- Salgadinhos
            (1, cat_salgadinhos, sup_atacadao, 'Ruffles 100g', unit_pct, 48, 36, 4.20, 8.00, 'Ruffles', 'SAL-001'),
            (1, cat_salgadinhos, sup_atacadao, 'Doritos 100g', unit_pct, 42, 36, 4.50, 8.50, 'Doritos', 'SAL-002'),
            (1, cat_salgadinhos, sup_atacadao, 'Cheetos 100g', unit_pct, 36, 30, 4.00, 7.50, 'Cheetos', 'SAL-003'),
            (1, cat_salgadinhos, sup_atacadao, 'Amendoim Japonês 150g', unit_pct, 30, 24, 3.50, 7.00, 'Dori', 'SAL-004'),
            
            -- Salgados Congelados
            (1, cat_salgados, sup_xyz, 'Coxinha de Frango (pacote 50un)', unit_pct, 10, 5, 45.00, 3.00, 'Sadia', 'SALG-001'),
            (1, cat_salgados, sup_xyz, 'Pastel de Carne (pacote 50un)', unit_pct, 8, 5, 42.00, 2.80, 'Sadia', 'SALG-002'),
            (1, cat_salgados, sup_xyz, 'Bolinha de Queijo (pacote 50un)', unit_pct, 6, 5, 38.00, 2.50, 'Sadia', 'SALG-003');
        
        RAISE NOTICE 'Produtos de exemplo inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Produtos já existem, pulando inserção.';
    END IF;
END $$;

-- =============================================
-- 4. MOVIMENTAÇÕES INICIAIS DE ESTOQUE
-- =============================================

DO $$
DECLARE
    product RECORD;
BEGIN
    -- Criar movimentação de entrada inicial para cada produto
    FOR product IN 
        SELECT id, establishment_id, current_stock, cost_price, unit_id
        FROM public.stock_products 
        WHERE establishment_id = 1
    LOOP
        INSERT INTO public.stock_movements (
            establishment_id,
            product_id,
            type,
            quantity,
            unit_cost,
            total_cost,
            stock_before,
            stock_after,
            reason,
            created_at
        ) VALUES (
            product.establishment_id,
            product.id,
            'entry',
            product.current_stock,
            product.cost_price,
            product.current_stock * product.cost_price,
            0,
            product.current_stock,
            'Estoque inicial do sistema',
            now() - INTERVAL '7 days'
        );
    END LOOP;
    
    RAISE NOTICE 'Movimentações iniciais de estoque criadas com sucesso!';
END $$;

-- =============================================
-- 5. VERIFICAÇÃO FINAL
-- =============================================

DO $$
DECLARE
    cat_count INT;
    sup_count INT;
    prod_count INT;
    mov_count INT;
BEGIN
    SELECT COUNT(*) INTO cat_count FROM public.stock_categories WHERE establishment_id = 1;
    SELECT COUNT(*) INTO sup_count FROM public.suppliers WHERE establishment_id = 1;
    SELECT COUNT(*) INTO prod_count FROM public.stock_products WHERE establishment_id = 1;
    SELECT COUNT(*) INTO mov_count FROM public.stock_movements WHERE establishment_id = 1;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESUMO DA INICIALIZAÇÃO DO ESTOQUE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Categorias criadas: %', cat_count;
    RAISE NOTICE 'Fornecedores criados: %', sup_count;
    RAISE NOTICE 'Produtos criados: %', prod_count;
    RAISE NOTICE 'Movimentações criadas: %', mov_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sistema de estoque pronto para uso!';
    RAISE NOTICE '========================================';
END $$;
