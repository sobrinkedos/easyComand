# 🛠️ Troubleshooting - EasyComand

## 🚨 Erros Comuns e Soluções

### 1. "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

#### **Causa**
A variável `VITE_SUPABASE_URL` no arquivo `.env` não está configurada corretamente ou contém um valor inválido.

#### **Solução**
1. **Verifique o arquivo `.env`**:
   ```bash
   # Verificar conteúdo
   cat .env
   ```

2. **Certifique-se de que a URL está correta**:
   ```env
   # ✅ CORRETO
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   
   # ❌ INCORRETO
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_URL=seu-projeto.supabase.co
   VITE_SUPABASE_URL=http://localhost:3000
   ```

3. **Reinicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

#### **Verificação Rápida**
```bash
# Script para verificar configuração
npm run check:env
```

### 2. "Invalid API key"

#### **Causa**
A variável `VITE_SUPABASE_ANON_KEY` está incorreta ou incompleta.

#### **Solução**
1. **Obtenha a chave correta** no dashboard do Supabase:
   - Settings → API
   - Copie a "anon public key"

2. **Verifique o formato**:
   ```env
   # ✅ CORRETO (começa com eyJhbGci)
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ❌ INCORRETO
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. "Connection refused" ou timeout

#### **Causa**
- Projeto Supabase ainda provisionando
- Problemas de rede
- Firewall bloqueando conexão

#### **Solução**
1. **Aguarde alguns minutos** se o projeto é novo
2. **Teste a URL diretamente** no navegador
3. **Verifique sua conexão com internet"

### 4. Comandos npm não funcionam no Windows

#### **Causa**
Política de execução do PowerShell bloqueando scripts npm

#### **Solução**
1. **Use os scripts batch fornecidos** (método recomendado):
   ```cmd
   # Na pasta do projeto, execute:
   install-deps.bat    # Para instalar dependências
   start-dev.bat       # Para iniciar servidor de desenvolvimento
   ```

2. **Ou configure manualmente a política**:
   ```powershell
   # Executar no PowerShell como administrador
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Ou use política temporária para processo**:
   ```cmd
   # No prompt de comando
   powershell -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"
   npm install
   npm run dev
   ```**

## 🧪 Scripts de Diagnóstico

### Verificar Configuração do Ambiente
```bash
# Verificar configuração básica
npm run check:env

# Ou usando PowerShell
.\scripts\setup.ps1
Test-SupabaseConnection
```

### Configurar Supabase Interativamente
```bash
# Script interativo de configuração
npm run setup:supabase
```

## 🔧 Comandos Úteis

### Resetar Configuração
```bash
# Copiar template novamente
cp .env.example .env

# Editar com seu editor preferido
code .env
```

### Verificar Variáveis de Ambiente
```bash
# PowerShell
Get-Content .env

# Bash/Linux
cat .env
```

## 📋 Checklist de Configuração

- [ ] Arquivo `.env` existe
- [ ] `VITE_SUPABASE_URL` configurada corretamente
- [ ] `VITE_SUPABASE_URL` começa com `https://`
- [ ] `VITE_SUPABASE_ANON_KEY` configurada corretamente
- [ ] `VITE_SUPABASE_ANON_KEY` é longa (mais de 100 caracteres)
- [ ] Servidor reiniciado após mudanças
- [ ] Projeto Supabase provisionado e acessível

## 📞 Suporte Adicional

Se os problemas persistirem:

1. **Verifique os logs do console** do navegador
2. **Confirme acesso ao projeto Supabase** via dashboard
3. **Teste credenciais** no SQL Editor do Supabase
4. **Consulte a documentação** em `docs/supabase-configuration.md`

---

**EasyComand Troubleshooting Guide**  
**Autor**: Rilton Oliveira de Souza  
**E-mail**: riltons@bb.com.br