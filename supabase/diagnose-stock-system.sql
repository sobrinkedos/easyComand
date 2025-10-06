-- =============================================
-- DIAGNÓSTICO AUTOMÁTICO DO SISTEMA DE ESTOQUE
-- =============================================
/*
Execute este script no SQL Editor do Supabase para
diagnosticar problemas com o sistema de estoque.
*/

DO $$
DECLARE
    table_exists BOOLEAN;
    function_exists BOOLEAN;
    policy_count INT;
    unit_count INT;
    user_establishment INT;
    current_user_id UUID;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNÓSTICO DO SISTEMA DE ESTOQUE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- =============================================
    -- 1. VERIFICAR TABELAS
    -- =============================================
    RAISE NOTICE '1. VERIFICANDO TABELAS...';
    RAISE NOTICE '----------------------------------------';
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'stock_units'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ Tabela stock_units existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_units NÃO existe';
        RAISE NOTICE '  → AÇÃO: Execute a migração 20250105000004_create_stock_management.sql';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'stock_categories'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ Tabela stock_categories existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_categories NÃO existe';
        RAISE NOTICE '  → AÇÃO: Execute a migração 20250105000004_create_stock_management.sql';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'stock_products'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ Tabela stock_products existe';
    ELSE
        RAISE NOTICE '✗ Tabela stock_products NÃO existe';
        RAISE NOTICE '  → AÇÃO: Execute a migração 20250105000004_create_stock_management.sql';
        RETURN; -- Parar aqui se tabelas não existem
    END IF;
    
    RAISE NOTICE '';
    
    -- =============================================
    -- 2. VERIFICAR DADOS
    -- =============================================
    RAISE NOTICE '2. VERIFICANDO DADOS...';
    RAISE NOTICE '----------------------------------------';
    
    SELECT COUNT(*) INTO unit_count FROM stock_units;
    IF unit_count > 0 THEN
        RAISE NOTICE '✓ Unidades de medida: % registros', unit_count;
    ELSE
        RAISE NOTICE '✗ Nenhuma unidade de medida cadastrada';
        RAISE NOTICE '  → AÇÃO: Execute a migração novamente';
    END IF;
    
    RAISE NOTICE '';
    
    -- =============================================
    -- 3. VERIFICAR USUÁRIO ATUAL
    -- =============================================
    RAISE NOTICE '3. VERIFICANDO USUÁRIO ATUAL...';
    RAISE NOTICE '----------------------------------------';
    
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '✗ Nenhum usuário autenticado';
        RAISE NOTICE '  → AÇÃO: Faça login no sistema';
        RETURN;
    ELSE
        RAISE NOTICE '✓ Usuário autenticado: %', current_user_id;
    END IF;
    
    -- Verificar establishment_id
    SELECT establishment_id INTO user_establishment
    FROM users
    WHERE id = current_user_id;
    
    IF user_establishment IS NULL THEN
        RAISE NOTICE '✗ Usuário sem establishment_id';
        RAISE NOTICE '  → AÇÃO: Configure o establishment do usuário';
        RAISE NOTICE '  → SQL: UPDATE users SET establishment_id = 1 WHERE id = ''%'';', current_user_id;
    ELSE
        RAISE NOTICE '✓ Establishment ID: %', user_establishment;
    END IF;
    
    RAISE NOTICE '';
    
    -- =============================================
    -- 4. VERIFICAR FUNÇÕES
    -- =============================================
    RAISE NOTICE '4. VERIFICANDO FUNÇÕES...';
    RAISE NOTICE '----------------------------------------';
    
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_current_establishment_id'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✓ Função get_current_establishment_id existe';
        
        -- Testar função
        BEGIN
            EXECUTE 'SELECT public.get_current_establishment_id()' INTO user_establishment;
            IF user_establishment IS NOT NULL THEN
                RAISE NOTICE '✓ Função retorna: %', user_establishment;
            ELSE
                RAISE NOTICE '✗ Função retorna NULL';
                RAISE NOTICE '  → AÇÃO: Verifique se o usuário tem establishment_id';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '✗ Erro ao executar função: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '✗ Função get_current_establishment_id NÃO existe';
        RAISE NOTICE '  → AÇÃO: Execute a migração novamente';
    END IF;
    
    RAISE NOTICE '';
    
    -- =============================================
    -- 5. VERIFICAR RLS
    -- =============================================
    RAISE NOTICE '5. VERIFICANDO RLS...';
    RAISE NOTICE '----------------------------------------';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'stock_products';
    
    IF policy_count > 0 THEN
        RAISE NOTICE '✓ Políticas RLS em stock_products: %', policy_count;
    ELSE
        RAISE NOTICE '✗ Nenhuma política RLS em stock_products';
        RAISE NOTICE '  → AÇÃO: Execute a migração novamente';
    END IF;
    
    RAISE NOTICE '';
    
    -- =============================================
    -- 6. TESTAR ACESSO AOS DADOS
    -- =============================================
    RAISE NOTICE '6. TESTANDO ACESSO AOS DADOS...';
    RAISE NOTICE '----------------------------------------';
    
    IF user_establishment IS NOT NULL THEN
        BEGIN
            SELECT COUNT(*) INTO policy_count
            FROM stock_products
            WHERE establishment_id = user_establishment;
            
            RAISE NOTICE '✓ Acesso aos produtos: % registros encontrados', policy_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '✗ Erro ao acessar produtos: %', SQLERRM;
            RAISE NOTICE '  → AÇÃO: Verifique as políticas RLS';
        END;
    END IF;
    
    RAISE NOTICE '';
    
    -- =============================================
    -- 7. RESUMO
    -- =============================================
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESUMO DO DIAGNÓSTICO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    IF table_exists AND function_exists AND user_establishment IS NOT NULL THEN
        RAISE NOTICE '✓ Sistema configurado corretamente!';
        RAISE NOTICE '';
        RAISE NOTICE 'Próximos passos:';
        RAISE NOTICE '1. Recarregue a página /estoque';
        RAISE NOTICE '2. Se ainda não funcionar, verifique o console do navegador';
        RAISE NOTICE '3. Execute o seed data para ter dados de exemplo';
    ELSE
        RAISE NOTICE '✗ Sistema com problemas. Veja as ações acima.';
        RAISE NOTICE '';
        RAISE NOTICE 'Ações necessárias:';
        IF NOT table_exists THEN
            RAISE NOTICE '- Execute a migração do banco de dados';
        END IF;
        IF NOT function_exists THEN
            RAISE NOTICE '- Recrie as funções SQL';
        END IF;
        IF user_establishment IS NULL THEN
            RAISE NOTICE '- Configure o establishment_id do usuário';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    
END $$;
