-- Script de verificação da configuração do banco de dados
-- Execute este script no SQL Editor do Supabase para verificar se as migrações foram aplicadas corretamente

-- Verificar se as tabelas principais foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar tipos ENUM criados
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;