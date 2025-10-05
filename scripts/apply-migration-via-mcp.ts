#!/usr/bin/env node

/**
 * Script para aplicar migrações através do MCP (Model Context Protocol)
 * Este script utiliza o cliente Supabase para aplicar migrações diretamente
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

async function applyMigrationViaMCP() {
  console.log('🔄 Aplicando migrações através do MCP...')
  
  // Carregar variáveis de ambiente manualmente
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
        process.env[key.trim()] = value
      }
    }
  }
  
  // Configuração do Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here') {
    console.error('❌ Service Role Key não configurada!')
    console.log('💡 Configure SUPABASE_SERVICE_ROLE_KEY no arquivo .env com a chave de serviço do Supabase')
    console.log('💡 Você pode encontrar esta chave em: Supabase Dashboard > Settings > API > Service Role Key')
    process.exit(1)
  }
  
  // Criar cliente Supabase com credenciais de serviço
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Caminho do arquivo de migração principal
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250105000000_fix_rls_recursion.sql')
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Arquivo de migração não encontrado!')
    process.exit(1)
  }
  
  // Ler o conteúdo da migração
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('📄 Migração carregada:')
  console.log(`   Caminho: ${migrationPath}`)
  console.log(`   Tamanho: ${migrationSQL.length} caracteres`)
  
  // Dividir em comandos individuais
  const commands = migrationSQL
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('/*') && !cmd.startsWith('--'))
  
  console.log(`📝 Encontrados ${commands.length} comandos SQL para executar`)
  
  // Executar cada comando individualmente
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i].trim() + ';'
    console.log(`\n[${i + 1}/${commands.length}] Executando comando...`)
    
    try {
      // Tentar executar através da função RPC mcp_execute_sql
      console.log(`🔍 Comando: ${command.substring(0, 60)}${command.length > 60 ? '...' : ''}`)
      
      const { data, error } = await supabase.rpc('mcp_execute_sql', { sql_text: command })
      
      if (error) {
        console.error(`❌ Erro na RPC:`, error.message)
        errorCount++
        continue
      }
      
      if (data && !data.success) {
        console.error(`❌ Erro ao executar SQL:`, data.error)
        errorCount++
      } else {
        console.log(`✅ Comando executado com sucesso`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Erro ao executar comando:`, err)
      errorCount++
    }
  }
  
  // Resumo
  console.log(`\n📊 Resumo da aplicação de migrações:`)
  console.log(`   ✅ Comandos executados com sucesso: ${successCount}`)
  console.log(`   ❌ Comandos com erro: ${errorCount}`)
  
  if (errorCount === 0) {
    console.log(`\n🎉 Todas as migrações foram aplicadas com sucesso através do MCP!`)
    console.log(`✅ O problema de recursão RLS foi resolvido.`)
  } else {
    console.log(`\n⚠️  Algumas migrações falharam. Verifique os erros acima.`)
    console.log(`💡 Você pode tentar aplicar a migração manualmente através do painel do Supabase.`)
  }
}

// Executar a função principal
applyMigrationViaMCP().catch(console.error)