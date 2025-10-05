#!/usr/bin/env node

/**
 * Script para verificar configuração do Supabase
 * Verifica se as variáveis de ambiente estão configuradas corretamente
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Caminho do arquivo .env
const envPath = path.join(__dirname, '..', '.env')

console.log('🔍 Verificando configuração do Supabase...\n')

// Verificar se arquivo .env existe
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!')
  console.log('💡 Execute: cp .env.example .env')
  process.exit(1)
}

// Ler conteúdo do .env
const envContent = fs.readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')

// Extrair variáveis
let supabaseUrl = ''
let supabaseKey = ''

for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1]?.trim() || ''
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1]?.trim() || ''
  }
}

// Verificar URL
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.error('❌ VITE_SUPABASE_URL não configurada!')
  console.log('💡 Edite o arquivo .env e adicione a URL do seu projeto Supabase')
  console.log('📝 Exemplo: VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
  process.exit(1)
}

if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ VITE_SUPABASE_URL inválida!')
  console.log('💡 A URL deve começar com http:// ou https://')
  console.log('📝 Exemplo: VITE_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co')
  process.exit(1)
}

// Verificar chave
if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
  console.error('❌ VITE_SUPABASE_ANON_KEY não configurada!')
  console.log('💡 Edite o arquivo .env e adicione a chave anon do seu projeto Supabase')
  console.log('📝 A chave começa com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  process.exit(1)
}

if (supabaseKey.length < 50) {
  console.error('❌ VITE_SUPABASE_ANON_KEY parece inválida!')
  console.log('💡 A chave anon deve ser longa (mais de 100 caracteres)')
  process.exit(1)
}

// Tudo certo!
console.log('✅ Configuração do Supabase verificada com sucesso!')
console.log('🌐 URL:', supabaseUrl)
console.log('🔑 Key length:', supabaseKey.length, 'characters')
console.log('\n🚀 Pronto para executar a aplicação!')
console.log('💡 Execute: npm run dev')