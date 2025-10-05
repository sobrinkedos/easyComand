# 🔐 Sistema de Autenticação - EasyComand

## Visão Geral

O EasyComand utiliza o Supabase Auth para gerenciar autenticação de usuários com suporte a:
- Login com e-mail e senha
- Cadastro de novos usuários
- Recuperação de senha
- Redefinição de senha
- Sessões persistentes
- Multi-tenancy (isolamento por estabelecimento)

## Fluxo de Autenticação

### 1. Cadastro (Sign Up)

**Endpoint:** `/auth` (modo cadastro)

**Campos obrigatórios:**
- E-mail
- Senha (mínimo 6 caracteres, com letras maiúsculas, minúsculas e números)
- Nome completo
- Confirmação de senha

**Campos opcionais:**
- Telefone (formato: (11) 99999-9999)
- Nome do estabelecimento

**Processo:**
1. Usuário preenche o formulário de cadastro
2. Sistema valida os dados
3. Cria conta no Supabase Auth
4. Trigger `on_auth_user_created` cria registro em `public.users`
5. E-mail de confirmação é enviado
6. Usuário confirma e-mail
7. Pode fazer login

**Validações:**
- E-mail único no sistema
- Senha forte (letras maiúsculas, minúsculas e números)
- Telefone no formato brasileiro (opcional)

### 2. Login (Sign In)

**Endpoint:** `/auth` (modo login)

**Campos:**
- E-mail
- Senha

**Processo:**
1. Usuário insere credenciais
2. Sistema valida com Supabase Auth
3. Se válido, carrega dados do usuário de `public.users`
4. Obtém `establishment_id` para multi-tenancy
5. Redireciona para dashboard

**Segurança:**
- Senhas são hasheadas pelo Supabase
- Sessões são gerenciadas com JWT
- Tokens expiram automaticamente

### 3. Recuperação de Senha

**Endpoint:** `/forgot-password`

**Processo:**
1. Usuário insere e-mail
2. Sistema envia link de recuperação
3. Link válido por tempo limitado
4. Usuário clica no link do e-mail
5. Redireciona para `/reset-password`

### 4. Redefinição de Senha

**Endpoint:** `/reset-password`

**Processo:**
1. Sistema valida token de recuperação
2. Usuário define nova senha
3. Senha é atualizada no Supabase
4. Redireciona para login

## Componentes

### AuthContext

Gerencia estado global de autenticação:

```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  establishmentId: number | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, userData?: UserSignUpData) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
  hasEstablishment: boolean
}
```

### Componentes de UI

1. **AuthPage** - Container principal com alternância login/cadastro
2. **LoginForm** - Formulário de login
3. **SignUpForm** - Formulário de cadastro
4. **ForgotPasswordForm** - Recuperação de senha
5. **ResetPasswordForm** - Redefinição de senha
6. **WelcomeScreen** - Tela de boas-vindas após login

### Rotas Protegidas

```typescript
// Rota pública (apenas para não autenticados)
<PublicRoute>
  <AuthPage />
</PublicRoute>

// Rota protegida (apenas para autenticados)
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## Configuração do Supabase

### 1. Habilitar Email Provider

No Dashboard do Supabase:
1. Vá para **Authentication** → **Providers**
2. Habilite **Email**
3. Configure:
   - Confirm email: `true` (recomendado)
   - Secure email change: `true`

### 2. Configurar URLs de Redirecionamento

**Site URL:**
- Development: `http://localhost:5173`
- Production: `https://seu-dominio.com`

**Redirect URLs:**
- `http://localhost:5173/reset-password`
- `https://seu-dominio.com/reset-password`

### 3. Email Templates

Personalize os templates em **Authentication** → **Email Templates**:
- Confirmation email
- Reset password email
- Magic link email

## Segurança

### Row Level Security (RLS)

Todas as queries são automaticamente filtradas por `establishment_id`:

```sql
-- Exemplo de política RLS
CREATE POLICY "Users can view their own establishment data" 
ON public.users FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());
```

### Funções de Segurança

```sql
-- Obter establishment_id do usuário atual
CREATE FUNCTION public.requesting_user_establishment_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  est_id int;
BEGIN
  SELECT establishment_id INTO est_id
  FROM public.users
  WHERE id = auth.uid();
  RETURN est_id;
END;
$$;
```

### Trigger de Criação de Usuário

```sql
-- Criar registro em public.users quando usuário se cadastra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
```

## Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Invalid login credentials` | E-mail ou senha incorretos | Verificar credenciais |
| `Email not confirmed` | E-mail não confirmado | Verificar caixa de entrada |
| `User already registered` | E-mail já cadastrado | Usar recuperação de senha |
| `Invalid token` | Token de recuperação expirado | Solicitar novo link |

### Mensagens de Erro Amigáveis

O sistema traduz erros técnicos para mensagens amigáveis:

```typescript
const errorMessages: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos',
  'Email not confirmed': 'Por favor, confirme seu e-mail',
  'User already registered': 'Este e-mail já está cadastrado',
  // ...
}
```

## Testes

### Testar Cadastro

1. Acesse `/auth`
2. Clique em "Cadastre-se"
3. Preencha o formulário
4. Verifique e-mail de confirmação
5. Confirme e-mail
6. Faça login

### Testar Login

1. Acesse `/auth`
2. Insira credenciais
3. Clique em "Entrar"
4. Deve redirecionar para dashboard

### Testar Recuperação de Senha

1. Acesse `/forgot-password`
2. Insira e-mail
3. Verifique e-mail
4. Clique no link
5. Defina nova senha
6. Faça login com nova senha

## Boas Práticas

### Senhas

- ✅ Mínimo 6 caracteres
- ✅ Letras maiúsculas e minúsculas
- ✅ Pelo menos 1 número
- ✅ Considere adicionar caracteres especiais
- ✅ Habilite proteção contra senhas vazadas no Supabase

### Sessões

- ✅ Tokens JWT com expiração
- ✅ Refresh tokens automáticos
- ✅ Logout em todas as abas
- ✅ Sessão persistente (localStorage)

### UX

- ✅ Feedback visual de loading
- ✅ Mensagens de erro claras
- ✅ Validação em tempo real
- ✅ Máscaras de input (telefone)
- ✅ Toggle de visibilidade de senha

## Próximos Passos

- [ ] Implementar autenticação social (Google, Facebook)
- [ ] Adicionar autenticação de dois fatores (2FA)
- [ ] Implementar magic link (login sem senha)
- [ ] Adicionar rate limiting
- [ ] Implementar CAPTCHA em produção
- [ ] Logs de auditoria de login

## Suporte

Para problemas com autenticação:
1. Verifique os logs do navegador (Console)
2. Verifique os logs do Supabase (Dashboard → Logs)
3. Consulte a documentação do Supabase Auth
4. Abra uma issue no repositório
