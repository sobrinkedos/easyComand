import { supabase } from '../src/lib/supabase'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigration() {
  console.log('🔄 Aplicando migração para corrigir recursão RLS...')
  
  // Ler o arquivo de migração
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250105000000_fix_rls_recursion.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  // Dividir em comandos individuais (separados por ponto e vírgula)
  const commands = migrationSQL
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('/*') && !cmd.startsWith('--'))
  
  console.log(`📝 Encontrados ${commands.length} comandos SQL para executar`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i] + ';'
    console.log(`\n[${i + 1}/${commands.length}] Executando comando...`)
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: command })
      
      if (error) {
        console.error(`❌ Erro:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Sucesso`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Erro ao executar:`, err)
      errorCount++
    }
  }
  
  console.log(`\n📊 Resumo:`)
  console.log(`   ✅ Sucesso: ${successCount}`)
  console.log(`   ❌ Erros: ${errorCount}`)
  
  if (errorCount === 0) {
    console.log(`\n🎉 Migração aplicada com sucesso!`)
  } else {
    console.log(`\n⚠️  Migração concluída com erros. Verifique os logs acima.`)
  }
}

applyMigration().catch(console.error)
