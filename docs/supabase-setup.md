# 🔧 Guia de Configuração do Supabase - EasyComand

## 📋 Pré-requisitos

1. **Conta no Supabase**: Acesse [https://app.supabase.com](https://app.supabase.com) e crie uma conta gratuita
2. **Projeto Criado**: Crie um novo projeto no Supabase

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Escolha uma organização ou crie uma nova
4. Configure o projeto:
   - **Name**: `easycomand` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha segura e anote
   - **Region**: Escolha a região mais próxima (recomendado: South America)
5. Clique em "Create new project"

### 2. Obter Credenciais do Projeto

Após a criação do projeto:

1. Vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (exemplo: `https://xxxxxxxxxxx.supabase.co`)
   - **anon/public key** (chave longa que começa com `eyJhbGciOi...`)

### 3. Configurar Variáveis de Ambiente

Abra o arquivo `.env` na raiz do projeto e substitua as variáveis:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

### 4. Aplicar Migrações do Banco de Dados

As migrações estão localizadas em `supabase/migrations/`:
- `20250101000000_initial_schema.sql` - Schema inicial completo
- `20250101000000_initial_schema_corrected.sql` - Correções do schema
- `20250101000001_initial_schema_fixed.sql` - Fixes adicionais
- `20250101000001_rls_security_fix.sql` - Configurações de segurança RLS

**Para aplicar manualmente via Dashboard:**

1. Vá para **SQL Editor** no dashboard do Supabase
2. Execute cada arquivo de migração na ordem cronológica
3. Ou copie e cole o conteúdo de cada arquivo SQL

**Para aplicar via CLI do Supabase (Recomendado):**

```bash
# Instalar CLI do Supabase
npm install -g supabase

# Login no Supabase
supabase login

# Linkar com o projeto
supabase link --project-ref SEU_PROJECT_ID

# Aplicar migrações
supabase db push
```

### 5. Verificar Instalação

Após aplicar as migrações, verifique se as seguintes tabelas foram criadas:

- `establishments` (estabelecimentos)
- `users` (usuários)
- `tables` (mesas)
- `products` (produtos)
- `orders` (pedidos)
- `order_items` (itens do pedido)
- `customers` (clientes)
- `stock_items` (estoque)
- E muitas outras...

### 6. Testar Conexão

Com as variáveis configuradas, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo deve iniciar sem erros de conexão com o Supabase.

## 🔐 Configurações de Segurança

O projeto utiliza **Row Level Security (RLS)** para isolamento multi-tenant:

- Cada estabelecimento tem seus dados isolados
- Usuários só acessam dados do seu estabelecimento
- Políticas RLS aplicadas automaticamente

## 📞 Suporte

Se encontrar problemas:

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que todas as migrações foram aplicadas
3. Verifique os logs no dashboard do Supabase
4. Teste a conexão usando o SQL Editor

## 🎯 Próximos Passos

Após a configuração:
1. ✅ Sistema de autenticação
2. ✅ Dashboard principal
3. ✅ Gestão de estabelecimentos
4. ✅ E todos os outros módulos do planejamento...