#!/usr/bin/env node

/**
 * Gerenciador de Migrações MCP (Model Context Protocol)
 * Este script verifica o status das migrações e fornece instruções para aplicá-las
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

interface Migration {
  id: string;
  name: string;
  path: string;
  applied: boolean;
}

async function runMCPMigrationManager() {
  console.log('🔄 Gerenciador de Migrações MCP')
  console.log('==============================\n')
  
  // Carregar variáveis de ambiente
  loadEnvVariables();
  
  // Configuração do Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Configurações do Supabase incompletas!')
    console.log('💡 Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no .env')
    process.exit(1)
  }
  
  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Listar migrações disponíveis
  const migrations = await listMigrations();
  
  if (migrations.length === 0) {
    console.log('✅ Nenhuma migração pendente encontrada')
    process.exit(0)
  }
  
  console.log(`📝 ${migrations.length} migrações encontradas:`)
  migrations.forEach((migration, index) => {
    const status = migration.applied ? '✅ Aplicada' : '⏳ Pendente'
    console.log(`   ${index + 1}. ${migration.id} - ${migration.name} (${status})`)
  })
  
  console.log('')
  
  // Verificar quais migrações já foram aplicadas
  const pendingMigrations = migrations.filter(m => !m.applied)
  
  if (pendingMigrations.length === 0) {
    console.log('✅ Todas as migrações já foram aplicadas!')
    process.exit(0)
  }
  
  console.log(`⏳ ${pendingMigrations.length} migrações pendentes:`)
  pendingMigrations.forEach((migration, index) => {
    console.log(`   ${index + 1}. ${migration.id} - ${migration.name}`)
  })
  
  console.log('\n📋 Instruções para aplicar as migrações:')
  console.log('========================================')
  
  pendingMigrations.forEach((migration, index) => {
    console.log(`\n🔧 Migração ${index + 1}: ${migration.name}`)
    console.log(`   ID: ${migration.id}`)
    
    // Ler conteúdo da migração
    if (fs.existsSync(migration.path)) {
      const content = fs.readFileSync(migration.path, 'utf-8')
      console.log(`   Conteúdo:`)
      console.log(`   --------`)
      console.log(content)
      console.log(`   --------`)
    }
    
    console.log(`   Instruções:`)
    console.log(`   1. Acesse o painel do Supabase (https://app.supabase.com)`)
    console.log(`   2. Selecione seu projeto`)
    console.log(`   3. Vá para "SQL Editor" no menu lateral`)
    console.log(`   4. Cole o conteúdo acima no editor`)
    console.log(`   5. Clique em "RUN" para executar`)
    console.log(`   6. Após executar, marque a migração como aplicada`)
  })
  
  console.log('\n💡 Dica: Após aplicar todas as migrações, execute este script novamente para verificar o status.')
}

function loadEnvVariables() {
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
}

async function listMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Diretório de migrações não encontrado!')
    return []
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  const migrations: Migration[] = []
  
  for (const file of files) {
    const migrationId = file.split('_')[0]
    const migrationName = file.split('_').slice(1).join('_').replace('.sql', '')
    const migrationPath = path.join(migrationsDir, file)
    
    // Verificar se a migração já foi aplicada (simplificado)
    const applied = await checkIfMigrationApplied(migrationId)
    
    migrations.push({
      id: migrationId,
      name: migrationName,
      path: migrationPath,
      applied
    })
  }
  
  return migrations
}

async function checkIfMigrationApplied(migrationId: string): Promise<boolean> {
  // Esta é uma verificação simplificada
  // Em um sistema real, isso verificaria em uma tabela de controle de migrações
  return false
}

// Executar o gerenciador
runMCPMigrationManager().catch(console.error)