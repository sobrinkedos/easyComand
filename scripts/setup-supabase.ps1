# Script PowerShell para configurar o Supabase
# EasyComand - Configuração inicial

Write-Host "🍽️ EasyComand - Configuração do Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Criando arquivo .env a partir do template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Arquivo .env.example não encontrado!" -ForegroundColor Red
        Write-Host "💡 Certifique-se de que está no diretório raiz do projeto" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Instruções para configurar o Supabase:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse https://app.supabase.com" -ForegroundColor Gray
Write-Host "2. Crie um novo projeto (ou use um existente)" -ForegroundColor Gray
Write-Host "3. Vá em Settings > API" -ForegroundColor Gray
Write-Host "4. Copie as credenciais abaixo:" -ForegroundColor Gray
Write-Host ""

# Solicitar URL do projeto
do {
    $supabaseUrl = Read-Host "Digite a Project URL (ex: https://seu-projeto.supabase.co)"
    
    if (-not $supabaseUrl) {
        Write-Host "❌ URL não pode estar vazia!" -ForegroundColor Red
    } elseif (-not ($supabaseUrl.StartsWith("http://") -or $supabaseUrl.StartsWith("https://"))) {
        Write-Host "❌ URL deve começar com http:// ou https://" -ForegroundColor Red
    }
} while (-not $supabaseUrl -or -not ($supabaseUrl.StartsWith("http://") -or $supabaseUrl.StartsWith("https://")))

# Solicitar Anon Key
do {
    $supabaseKey = Read-Host "Digite a anon key (começa com eyJhbGci...)"
    
    if (-not $supabaseKey) {
        Write-Host "❌ Key não pode estar vazia!" -ForegroundColor Red
    } elseif ($supabaseKey.Length -lt 50) {
        Write-Host "❌ Key parece muito curta!" -ForegroundColor Red
    }
} while (-not $supabaseKey -or $supabaseKey.Length -lt 50)

# Atualizar arquivo .env
Write-Host ""
Write-Host "💾 Atualizando arquivo .env..." -ForegroundColor Yellow

try {
    $envContent = Get-Content ".env" -Raw
    $envLines = $envContent -split "`n"
    
    # Atualizar URL
    $envLines = $envLines | ForEach-Object {
        if ($_ -match "^VITE_SUPABASE_URL=") {
            "VITE_SUPABASE_URL=$supabaseUrl"
        } else {
            $_
        }
    }
    
    # Atualizar Key
    $envLines = $envLines | ForEach-Object {
        if ($_ -match "^VITE_SUPABASE_ANON_KEY=") {
            "VITE_SUPABASE_ANON_KEY=$supabaseKey"
        } else {
            $_
        }
    }
    
    # Salvar arquivo
    $envLines -join "`n" | Set-Content ".env"
    
    Write-Host "✅ Arquivo .env atualizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao atualizar .env: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Aplique as migrações do banco de dados" -ForegroundColor Gray
Write-Host "2. Execute: npm run dev" -ForegroundColor Gray
Write-Host "3. Acesse: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Veja docs/supabase-configuration.md para mais detalhes" -ForegroundColor Yellow