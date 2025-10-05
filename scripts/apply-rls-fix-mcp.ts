#!/usr/bin/env node

/**
 * Script para aplicar a migração de correção de RLS através do MCP
 * Esta migração resolve o problema de recursão nas políticas RLS
 */

import * as fs from 'fs'
import * as path from 'path'

async function applyRLSFixViaMCP() {
  console.log('🔧 Aplicando correção de recursão RLS através do MCP')
  console.log('================================================\n')
  
  // Caminho da migração específica
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250105000000_fix_rls_recursion.sql')
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migração de correção de RLS não encontrada!')
    process.exit(1)
  }
  
  // Ler o conteúdo da migração
  const migrationContent = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('📋 PROBLEMA IDENTIFICADO:')
  console.log('   Existe uma recursão nas políticas RLS (Row Level Security) que causa')
  console.log('   "stack depth limit exceeded" quando usuários tentam acessar seus dados.\n')
  
  console.log('🔍 DETALHES TÉCNICOS:')
  console.log('   • Função problemática: requesting_user_establishment_id()')
  console.log('   • Causa: A função consulta a tabela users que tem RLS habilitado')
  console.log('   • Efeito: Política RLS chama a função novamente, criando loop infinito\n')
  
  console.log('🔧 SOLUÇÃO IMPLEMENTADA:')
  console.log('   1. Recriar função com SECURITY DEFINER para evitar RLS')
  console.log('   2. Atualizar políticas para evitar recursão')
  console.log('   3. Criar funções auxiliares com contexto de segurança adequado\n')
  
  console.log('✅ INSTRUÇÕES PARA APLICAR A MIGRAÇÃO:')
  console.log('=====================================\n')
  
  console.log('OPÇÃO 1 - Painel do Supabase (Recomendado):')
  console.log('   1. Acesse https://app.supabase.com')
  console.log('   2. Selecione seu projeto EasyComand')
  console.log('   3. Vá para "SQL Editor" no menu lateral')
  console.log('   4. Cole o conteúdo abaixo no editor')
  console.log('   5. Clique em "RUN" para executar\n')
  
  console.log('📄 CONTEÚDO DA MIGRAÇÃO:')
  console.log('========================\n')
  console.log(migrationContent)
  console.log('========================\n')
  
  console.log('💡 DICA PÓS-APLICAÇÃO:')
  console.log('   Após aplicar a migração:')
  console.log('   1. Reinicie sua aplicação')
  console.log('   2. Faça login novamente')
  console.log('   3. Verifique se o erro "stack depth limit exceeded" foi resolvido\n')
  
  console.log('✅ RESULTADO ESPERADO:')
  console.log('   • Usuários poderão acessar dados de seu estabelecimento')
  console.log('   • Erro de recursão RLS eliminado')
  console.log('   • Sistema funcionando normalmente\n')
}

// Executar o script
applyRLSFixViaMCP().catch(console.error)