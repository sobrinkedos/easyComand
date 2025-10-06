-- =============================================
-- VERIFICAÇÃO DO SISTEMA DE ESTOQUE
-- =============================================
/*
# Script de Verificação

Execute este script para verificar se o sistema de estoque
foi configurado corretamente.
*/

-- =============================================
-- 1. VERIFICAR TABELAS
-- =============================================

DO $$
DECLARE
    table_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICANDO TABELAS DO SISTEMA DE ESTOQUE';
    RAISE NOTICE '========================================';
    
    -- Verificar stock_units
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'stock_units';
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Tabela stock_units existe';
        SELECT COUNT(*) INTO table_count FROM public.stock_units;
        RAISE NOTICE '  → % unidades de medida cadastradas', table_count;
    ELSE
        RAISE NOTICE '✗ Tabela stock_units NÃO existe';
    END IF;
    
    -- Verificar stock_categories
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'stock_categories';
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Tabela stock_categories existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_categories NÃO existe';
    END IF;
    
    -- Verificar suppliers
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'suppliers';
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Tabela suppliers existe';
    ELSE
        RAISE NOTICE '✗ Tabela suppliers NÃO existe';
    END IF;
    
    -- Verificar stock_products
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'stock_products';
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Tabela stock_products existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_products NÃO existe';
    END IF;
    
    -- Verificar stock_movements
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'stock_movements';
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Tabela stock_movements existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_movements NÃO existe';
    END IF;
    
    -- Verificar stock_alerts
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'stock_alerts';
    IF table_count > 0 THEN
        RAISE NOTICE '✓ Tabela stock_alerts existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_alerts NÃO existe';
    END IF;
END $$;

-- =============================================
-- 2. VERIFICAR FUNÇÕES
-- =============================================

DO $$
DECLARE
    function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICANDO FUNÇÕES SQL';
    RAISE NOTICE '========================================';
    
    -- Verificar update_product_stock
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_product_stock'
    ) INTO function_exists;
    IF function_exists THEN
        RAISE NOTICE '✓ Função update_product_stock() existe';
    ELSE
        RAISE NOTICE '✗ Função update_product_stock() NÃO existe';
    END IF;
    
    -- Verificar get_low_stock_products
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_low_stock_products'
    ) INTO function_exists;
    IF function_exists THEN
        RAISE NOTICE '✓ Função get_low_stock_products() existe';
    ELSE
        RAISE NOTICE '✗ Função get_low_stock_products() NÃO existe';
    END IF;
    
    -- Verificar get_stock_value
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_stock_value'
    ) INTO function_exists;
    IF function_exists THEN
        RAISE NOTICE '✓ Função get_stock_value() existe';
    ELSE
        RAISE NOTICE '✗ Função get_stock_value() NÃO existe';
    END IF;
END $$;

-- =============================================
-- 3. VERIFICAR TRIGGERS
-- =============================================

DO $$
DECLARE
    trigger_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICANDO TRIGGERS';
    RAISE NOTICE '========================================';
    
    -- Verificar trigger_update_product_stock
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_product_stock'
    ) INTO trigger_exists;
    IF trigger_exists THEN
        RAISE NOTICE '✓ Trigger trigger_update_product_stock existe';
    ELSE
        RAISE NOTICE '✗ Trigger trigger_update_product_stock NÃO existe';
    END IF;
END $$;

-- =============================================
-- 4. VERIFICAR RLS (ROW LEVEL SECURITY)
-- =============================================

DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICANDO RLS (ROW LEVEL SECURITY)';
    RAISE NOTICE '========================================';
    
    -- Verificar RLS em stock_categories
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'stock_categories';
    IF rls_enabled THEN
        RAISE NOTICE '✓ RLS habilitado em stock_categories';
        SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'stock_categories';
        RAISE NOTICE '  → % políticas configuradas', policy_count;
    ELSE
        RAISE NOTICE '✗ RLS NÃO habilitado em stock_categories';
    END IF;
    
    -- Verificar RLS em suppliers
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'suppliers';
    IF rls_enabled THEN
        RAISE NOTICE '✓ RLS habilitado em suppliers';
        SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'suppliers';
        RAISE NOTICE '  → % políticas configuradas', policy_count;
    ELSE
        RAISE NOTICE '✗ RLS NÃO habilitado em suppliers';
    END IF;
    
    -- Verificar RLS em stock_products
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'stock_products';
    IF rls_enabled THEN
        RAISE NOTICE '✓ RLS habilitado em stock_products';
        SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'stock_products';
        RAISE NOTICE '  → % políticas configuradas', policy_count;
    ELSE
        RAISE NOTICE '✗ RLS NÃO habilitado em stock_products';
    END IF;
    
    -- Verificar RLS em stock_movements
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'stock_movements';
    IF rls_enabled THEN
        RAISE NOTICE '✓ RLS habilitado em stock_movements';
        SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'stock_movements';
        RAISE NOTICE '  → % políticas configuradas', policy_count;
    ELSE
        RAISE NOTICE '✗ RLS NÃO habilitado em stock_movements';
    END IF;
    
    -- Verificar RLS em stock_alerts
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'stock_alerts';
    IF rls_enabled THEN
        RAISE NOTICE '✓ RLS habilitado em stock_alerts';
        SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'stock_alerts';
        RAISE NOTICE '  → % políticas configuradas', policy_count;
    ELSE
        RAISE NOTICE '✗ RLS NÃO habilitado em stock_alerts';
    END IF;
END $$;

-- =============================================
-- 5. VERIFICAR ÍNDICES
-- =============================================

DO $$
DECLARE
    index_count INT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICANDO ÍNDICES';
    RAISE NOTICE '========================================';
    
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN ('stock_categories', 'suppliers', 'stock_products', 'stock_movements', 'stock_alerts');
    
    RAISE NOTICE '✓ % índices criados nas tabelas de estoque', index_count;
END $$;

-- =============================================
-- 6. ESTATÍSTICAS (se houver dados)
-- =============================================

DO $$
DECLARE
    cat_count INT;
    sup_count INT;
    prod_count INT;
    mov_count INT;
    alert_count INT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ESTATÍSTICAS DE DADOS';
    RAISE NOTICE '========================================';
    
    SELECT COUNT(*) INTO cat_count FROM public.stock_categories;
    SELECT COUNT(*) INTO sup_count FROM public.suppliers;
    SELECT COUNT(*) INTO prod_count FROM public.stock_products;
    SELECT COUNT(*) INTO mov_count FROM public.stock_movements;
    SELECT COUNT(*) INTO alert_count FROM public.stock_alerts;
    
    RAISE NOTICE 'Categorias: %', cat_count;
    RAISE NOTICE 'Fornecedores: %', sup_count;
    RAISE NOTICE 'Produtos: %', prod_count;
    RAISE NOTICE 'Movimentações: %', mov_count;
    RAISE NOTICE 'Alertas: %', alert_count;
    
    IF prod_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Produtos por categoria:';
        FOR cat_count IN 
            SELECT sc.name || ': ' || COUNT(sp.id) AS info
            FROM public.stock_categories sc
            LEFT JOIN public.stock_products sp ON sc.id = sp.category_id
            GROUP BY sc.name
        LOOP
            -- Loop apenas para contar
        END LOOP;
    END IF;
END $$;

-- =============================================
-- 7. RESUMO FINAL
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Se todas as verificações mostraram ✓, o sistema está pronto!';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Execute seed-stock-data.sql para popular dados de exemplo';
    RAISE NOTICE '2. Acesse /estoque no sistema web';
    RAISE NOTICE '3. Comece a cadastrar seus produtos!';
    RAISE NOTICE '';
END $$;
