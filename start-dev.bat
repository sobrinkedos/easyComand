@echo off
title EasyComand Development Server
echo ========================================
echo 🍽️ EasyComand - Servidor de Desenvolvimento
echo ========================================
echo.

REM Configurar política de execução para o processo
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass" >nul 2>&1

echo 🚀 Iniciando servidor de desenvolvimento...
echo Acesse: http://localhost:5175
echo.

REM Executar Vite diretamente
node node_modules/vite/bin/vite.js

echo.
echo Pressione qualquer tecla para sair...
pause >nul