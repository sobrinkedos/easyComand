@echo off
title EasyComand - Instalação de Dependências
echo ========================================
echo 🍽️ EasyComand - Instalação de Dependências
echo ========================================
echo.

REM Configurar política de execução para o processo
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass" >nul 2>&1

echo 📦 Instalando dependências do projeto...
echo.

REM Instalar dependências
npm install

if %errorlevel% == 0 (
    echo.
    echo ✅ Dependências instaladas com sucesso!
) else (
    echo.
    echo ❌ Erro ao instalar dependências!
    echo Verifique sua conexão com a internet e tente novamente.
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul