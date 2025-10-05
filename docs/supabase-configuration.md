# 🛠️ Configuração do Supabase - EasyComand

## 📋 Pré-requisitos

Antes de continuar, você precisa ter:

1. **Conta no Supabase** - [https://app.supabase.com](https://app.supabase.com)
2. **Projeto Supabase criado**
3. **Credenciais do projeto** (URL e Anon Key)

## 🚀 Passo a Passo de Configuração

### 1. Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Configure o projeto:
   - **Name**: `easycomand-dev` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha segura
   - **Region**: Escolha a região mais próxima
4. Clique em **"Create new project"**

> ⏱️ **Aguarde** alguns minutos enquanto o projeto é provisionado

### 2. Obter Credenciais do Projeto

Após a criação do projeto:

1. Vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (exemplo: `https://seu-projeto.supabase.co`)
   - **anon/public key** (começa com `eyJhbGciOi...`)

### 3. Configurar Variáveis de Ambiente

#### Opção A: Configuração Manual

Edite o arquivo `.env` na raiz do projeto:

```env
# Substitua estas variáveis com os valores do seu projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
```

**Exemplo correto:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU4NjAwMH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Opção B: Configuração Interativa (Recomendado)

```bash
# Script interativo que guia pela configuração
npm run setup:supabase
```

#### Opção C: Verificação Automática

```bash
# Verificar se configuração está correta
npm run check:env
```

### 4. Aplicar Migrações do Banco de Dados

As migrações já estão no projeto em `supabase/migrations/`. Você precisa aplicá-las:

#### Opção A: Via Dashboard do Supabase (Recomendado para desenvolvimento)

1. No dashboard do Supabase, vá para **SQL Editor**
2. Execute cada arquivo de migração na ordem:
   - `20250101000000_initial_schema.sql`
   - `20250101000000_initial_schema_corrected.sql`
   - `20250101000001_initial_schema_fixed.sql`
   - `20250101000001_rls_security_fix.sql`

#### Opção B: Via Supabase CLI (Recomendado para produção)

```bash
# Instalar CLI do Supabase (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Linkar com o projeto (substitua PROJECT_ID)
supabase link --project-ref SEU_PROJECT_ID

# Aplicar migrações
supabase db push
```

### 5. Verificar Instalação

Após aplicar as migrações:

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Verifique se não há mais erros de conexão

## 🔧 Troubleshooting

### Erro: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

**Causa**: URL do Supabase não configurada ou inválida

**Solução**:
1. Verifique o arquivo `.env`
2. Certifique-se de que `VITE_SUPABASE_URL` começa com `https://`
3. Certifique-se de que não há espaços extras
4. Reinicie o servidor de desenvolvimento

### Erro: "Invalid API key"

**Causa**: Chave Anon inválida

**Solução**:
1. Verifique se copiou a chave correta (anon/public key)
2. Certifique-se de que a chave está completa
3. Verifique se não há caracteres especiais adicionais

### Erro: "Connection refused" ou timeout

**Causa**: Problemas de rede ou projeto ainda provisionando

**Solução**:
1. Aguarde alguns minutos e tente novamente
2. Verifique sua conexão com internet
3. Tente acessar a URL do projeto diretamente no navegador

## 🔐 Configurações de Segurança

### Row Level Security (RLS)

O projeto utiliza RLS para isolamento multi-tenant:

- Cada estabelecimento tem seus dados isolados
- Políticas RLS aplicadas automaticamente
- Usuários só acessam dados do seu estabelecimento

### Verificar RLS

Para verificar se RLS está habilitado:

```sql
-- Verificar tabelas com RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## 📋 Verificação Pós-Configuração

### 1. Testar Conexão

Acesse o dashboard da aplicação e verifique:
- ✅ Status da conexão com Supabase
- ✅ Verificação das migrações
- ✅ Teste de autenticação

### 2. Verificar Tabelas

No SQL Editor do Supabase, execute:
```sql
-- Listar tabelas criadas
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deve mostrar tabelas como:
- `establishments`
- `users`
- `roles`
- `products`
- `orders`
- etc.

### 3. Testar Autenticação

1. Tente fazer cadastro/login na aplicação
2. Verifique se o usuário é criado na tabela `auth.users`
3. Verifique se o trigger cria registro na tabela `public.users`

## 🎯 Próximos Passos

Após configurar o Supabase corretamente:

1. ✅ Sistema de autenticação funcionará
2. ✅ Dashboard mostrará dados reais
3. ✅ Você poderá implementar funcionalidades

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador
2. Confirme que todas as migrações foram aplicadas
3. Teste a conexão usando o SQL Editor do Supabase
4. Verifique as variáveis de ambiente

---

**Configuração Supabase EasyComand**  
**Autor**: Rilton Oliveira de Souza  
**E-mail**: riltons@bb.com.br