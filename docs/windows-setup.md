# 🪟 Configuração no Windows - EasyComand

## 📋 Scripts Batch para Facilitar o Desenvolvimento

Para facilitar o desenvolvimento no Windows, foram criados scripts batch que lidam automaticamente com as políticas de execução do PowerShell.

## 🚀 Scripts Disponíveis

### 1. `start-dev.bat` - Iniciar Servidor de Desenvolvimento

```cmd
start-dev.bat
```

**O que faz:**
- Configura automaticamente a política de execução para o processo
- Inicia o servidor Vite diretamente via Node.js
- Mostra a URL de acesso (geralmente http://localhost:5175)
- Evita problemas com scripts PowerShell bloqueados

### 2. `install-deps.bat` - Instalar Dependências

```cmd
install-deps.bat
```

**O que faz:**
- Configura automaticamente a política de execução
- Executa `npm install` com tratamento de erros
- Mostra feedback visual sobre o sucesso ou falha

## 🎯 Como Usar

### Método 1: Interface Gráfica (Recomendado)

1. **Navegue até a pasta do projeto**
2. **Dê duplo clique no script desejado:**
   - `start-dev.bat` para iniciar o servidor
   - `install-deps.bat` para instalar dependências

### Método 2: Prompt de Comando

```cmd
# Abrir Prompt de Comando (cmd)
# Navegar até a pasta do projeto
cd c:\Users\F8616485\Downloads\projetos\easyComand

# Executar scripts
install-deps.bat
start-dev.bat
```

## 🔧 Solução de Problemas

### Erro: "npm.ps1 não pode ser carregado"

**Causa:** Política de execução do PowerShell bloqueando scripts

**Solução:** Use os scripts batch que configuram automaticamente a política

### Erro: "Port in use"

**Causa:** Outra instância do servidor já está rodando

**Solução:** 
1. Feche o terminal/script anterior
2. Ou use `taskkill /F /IM node.exe` para finalizar processos Node

### Erro: "node_modules não encontrado"

**Causa:** Dependências não instaladas

**Solução:** Execute `install-deps.bat` primeiro

## 🛡️ Segurança

Os scripts batch:
- Configuram política apenas para o processo atual (`-Scope Process`)
- Não alteram configurações permanentes do sistema
- Usam `>nul 2>&1` para suprimir mensagens de erro de política

## 📁 Estrutura dos Scripts

```
easyComand/
├── start-dev.bat          # Iniciar servidor de desenvolvimento
├── install-deps.bat       # Instalar dependências
├── scripts/
│   ├── setup-supabase.ps1 # Configuração interativa do Supabase
│   └── setup.ps1          # Scripts de verificação PowerShell
└── node_modules/          # Dependências instaladas
```

## 🔄 Alternativas

Se preferir usar comandos diretamente:

### PowerShell (como administrador):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
npm run dev
```

### Prompt de Comando:
```cmd
# Configurar política para processo atual
powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"
npm install
npm run dev
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique se está executando os scripts na pasta correta**
2. **Certifique-se de que o Node.js está instalado**
3. **Use os scripts batch em vez dos comandos npm diretamente**
4. **Consulte `docs/troubleshooting.md` para erros específicos**

---

**EasyComand Windows Setup Guide**  
**Autor**: Rilton Oliveira de Souza  
**E-mail**: riltons@bb.com.br