# Scripts de Configuração do EasyComand

# Script para verificar se o ambiente está configurado corretamente
function Test-Environment {
    Write-Host "🔍 Verificando configuração do ambiente..." -ForegroundColor Cyan
    
    # Verificar se existe .env
    if (-not (Test-Path ".env")) {
        Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
        Write-Host "💡 Crie o arquivo .env baseado no .env.example" -ForegroundColor Yellow
        return $false
    }
    
    # Verificar se Node.js está instalado
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
        return $false
    }
    
    # Verificar se as dependências estão instaladas
    if (-not (Test-Path "node_modules")) {
        Write-Host "❌ Dependências não instaladas!" -ForegroundColor Red
        Write-Host "💡 Execute: npm install" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✅ Ambiente configurado corretamente!" -ForegroundColor Green
    return $true
}

# Script para verificar conexão com Supabase
function Test-SupabaseConnection {
    Write-Host "🔍 Verificando conexão com Supabase..." -ForegroundColor Cyan
    
    # Verificar se o arquivo .env existe
    if (-not (Test-Path ".env")) {
        Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
        Write-Host "💡 Execute: cp .env.example .env" -ForegroundColor Yellow
        return $false
    }
    
    # Ler conteúdo do .env
    $envContent = Get-Content ".env" -ErrorAction SilentlyContinue
    
    $supabaseUrl = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_URL=" }
    $supabaseKey = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_ANON_KEY=" }
    
    if (-not $supabaseUrl -or $supabaseUrl -match "your_supabase_project_url") {
        Write-Host "❌ VITE_SUPABASE_URL não configurada!" -ForegroundColor Red
        Write-Host "💡 Edite o arquivo .env com a URL do seu projeto" -ForegroundColor Yellow
        Write-Host "📝 Exemplo: VITE_SUPABASE_URL=https://seu-projeto.supabase.co" -ForegroundColor Gray
        return $false
    }
    
    # Extrair apenas o valor da URL
    $urlValue = ($supabaseUrl -split "=", 2)[1].Trim()
    
    if (-not $urlValue.StartsWith("http://") -and -not $urlValue.StartsWith("https://")) {
        Write-Host "❌ VITE_SUPABASE_URL inválida!" -ForegroundColor Red
        Write-Host "💡 A URL deve começar com http:// ou https://" -ForegroundColor Yellow
        return $false
    }
    
    if (-not $supabaseKey -or $supabaseKey -match "your_supabase_anon_key") {
        Write-Host "❌ VITE_SUPABASE_ANON_KEY não configurada!" -ForegroundColor Red
        Write-Host "💡 Edite o arquivo .env com a chave anon do seu projeto" -ForegroundColor Yellow
        Write-Host "📝 A chave começa com: eyJhbGciOi..." -ForegroundColor Gray
        return $false
    }
    
    # Extrair apenas o valor da chave
    $keyValue = ($supabaseKey -split "=", 2)[1].Trim()
    
    if ($keyValue.Length -lt 50) {
        Write-Host "❌ VITE_SUPABASE_ANON_KEY parece inválida!" -ForegroundColor Red
        Write-Host "💡 A chave deve ser longa (mais de 100 caracteres)" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✅ Variáveis do Supabase configuradas corretamente!" -ForegroundColor Green
    Write-Host "🌐 URL: $urlValue" -ForegroundColor Gray
    Write-Host "🔑 Key length: $($keyValue.Length) caracteres" -ForegroundColor Gray
    return $true
}

# Script para iniciar o servidor de desenvolvimento
function Start-DevServer {
    if (Test-Environment -and Test-SupabaseConnection) {
        Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
        
        # Usar o binário do vite diretamente para evitar problemas de política
        & "node_modules\.bin\vite"
    } else {
        Write-Host "❌ Não foi possível iniciar o servidor. Corrija os problemas acima." -ForegroundColor Red
        Write-Host "💡 Veja docs/supabase-configuration.md para instruções detalhadas" -ForegroundColor Yellow
    }
}

# Exportar funções
Export-ModuleMember -Function Test-Environment, Start-DevServer, Test-SupabaseConnection

# Exemplo de uso:
# . .\scripts\setup.ps1
# Test-Environment
# Start-DevServer