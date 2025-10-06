-- =============================================
-- VERIFICAÇÃO RÁPIDA DAS TABELAS DE ESTOQUE
-- =============================================

-- Verificar se as tabelas existem
SELECT 
    'stock_units' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stock_units'
    ) as exists
UNION ALL
SELECT 
    'stock_categories',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stock_categories'
    )
UNION ALL
SELECT 
    'suppliers',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
    )
UNION ALL
SELECT 
    'stock_products',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stock_products'
    )
UNION ALL
SELECT 
    'stock_movements',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stock_movements'
    )
UNION ALL
SELECT 
    'stock_alerts',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stock_alerts'
    );

-- Se todas retornarem 'true', as tabelas existem
-- Se alguma retornar 'false', você precisa aplicar a migração
