#!/usr/bin/env node

/**
 * Script para verificar se a função MCP foi criada corretamente
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

async function verifyMCPFunction() {
  console.log('🔍 Verificando função MCP no Supabase...')
  
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
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Configurações do Supabase não encontradas!')
    process.exit(1)
  }
  
  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Verificar se a função mcp_execute_sql existe
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'mcp_execute_sql')
    
    if (error) {
      console.error('❌ Erro ao verificar função:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ Função mcp_execute_sql encontrada no banco de dados')
    } else {
      console.log('❌ Função mcp_execute_sql NÃO encontrada no banco de dados')
      console.log('💡 Você precisa criar a função no Supabase primeiro')
    }
  } catch (err) {
    console.error('❌ Erro ao verificar função:', err)
  }
}

verifyMCPFunction().catch(console.error)