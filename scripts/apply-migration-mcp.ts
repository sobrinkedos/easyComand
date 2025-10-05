#!/usr/bin/env node

/**
 * Script para aplicar migrações via MCP (Model Context Protocol)
 * Este script fornece instruções claras para aplicar a migração pendente
 */

import * as fs from 'fs'
import * as path from 'path'

async function applyMigrationViaMCP() {
  console.log('🔄 Migração pendente detectada - Correção de recursão RLS')
  console.log('=====================================================\n')
  
  // Caminho do arquivo de migração
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250105000000_fix_rls_recursion.sql')
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Arquivo de migração não encontrado!')
    process.exit(1)
  }
  
  // Ler o conteúdo da migração
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('📋 PROBLEMA IDENTIFICADO:')
  console.log('   Existe uma recursão nas políticas RLS (Row Level Security) que causa')
  console.log('   "stack depth limit exceeded" quando usuários tentam acessar seus dados.\n')
  
  console.log('🔧 SOLUÇÃO IMPLEMENTADA:')
  console.log('   1. Recriar função requesting_user_establishment_id() com SECURITY DEFINER')
  console.log('   2. Atualizar políticas para evitar recursão')
  console.log('   3. Criar funções auxiliares com contexto de segurança adequado\n')
  
  console.log('✅ INSTRUÇÕES PARA APLICAR A MIGRAÇÃO:')
  console.log('=====================================\n')
  
  console.log('OPÇÃO 1 - Painel do Supabase (Recomendado):')
  console.log('   1. Acesse https://app.supabase.com')
  console.log('   2. Selecione seu projeto')
  console.log('   3. Vá para "SQL Editor" no menu lateral')
  console.log('   4. Cole o conteúdo abaixo no editor')
  console.log('   5. Clique em "RUN" para executar\n')
  
  console.log('OPÇÃO 2 - CLI do Supabase (se configurado):')
  console.log('   Execute no terminal:')
  console.log('   npx supabase migration up\n')
  
  console.log('📄 CONTEÚDO DA MIGRAÇÃO:')
  console.log('========================\n')
  console.log(migrationSQL)
  console.log('========================\n')
  
  console.log('💡 DICA:')
  console.log('   Após aplicar a migração, reinicie sua aplicação para garantir')
  console.log('   que as mudanças tenham efeito.\n')
  
  console.log('✅ Resultado esperado:')
  console.log('   O erro "stack depth limit exceeded" deve ser resolvido e os')
  console.log('   usuários poderão acessar seus dados normalmente.\n')
}

applyMigrationViaMCP().catch(console.error)
