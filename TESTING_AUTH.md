# 🧪 Guia de Teste - Sistema de Autenticação

## Pré-requisitos

1. ✅ Servidor rodando: `npm.cmd run dev`
2. ✅ Supabase configurado no `.env`
3. ✅ Email provider habilitado no Supabase

## Teste 1: Cadastro de Novo Usuário

### Passos:

1. Acesse: http://localhost:5173/auth
2. Clique em "Cadastre-se"
3. Preencha o formulário:
   - **Nome Completo:** João Silva
   - **E-mail:** joao@teste.com
   - **Telefone:** (11) 98765-4321
   - **Nome do Estabelecimento:** Restaurante Teste
   - **Senha:** Teste123
   - **Confirmar Senha:** Teste123
4. Clique em "Criar Conta"

### Resultado Esperado:
- ✅ Mensagem de sucesso
- ✅ Informação sobre verificação de e-mail
- ✅ Botão "Voltar para Login"

### Verificar no Supabase:
1. Dashboard → Authentication → Users
2. Deve aparecer o novo usuário
3. Status: "Waiting for verification"

---

## Teste 2: Confirmação de E-mail

### Passos:

1. Abra o e-mail de confirmação
2. Clique no link de confirmação
3. Deve redirecionar para a aplicação

### Resultado Esperado:
- ✅ E-mail confirmado
- ✅ Status no Supabase muda para "Confirmed"

### Verificar no Supabase:
1. Dashboard → Authentication → Users
2. Status deve estar "Confirmed"

---

## Teste 3: Login

### Passos:

1. Acesse: http://localhost:5173/auth
2. Preencha:
   - **E-mail:** joao@teste.com
   - **Senha:** Teste123
3. Clique em "Entrar"

### Resultado Esperado:
- ✅ Tela de boas-vindas aparece
- ✅ Mostra informações do usuário
- ✅ Redireciona para dashboard em 3 segundos

### Verificar no Console:
```
✅ Login realizado com sucesso
✅ Dados do usuário carregados: { establishment_id: null, ... }
```

---

## Teste 4: Validações de Formulário

### Teste 4.1: E-mail Inválido

**Passos:**
1. Tente fazer login com: `teste@invalido`
2. Clique em "Entrar"

**Resultado:** ❌ "E-mail inválido"

### Teste 4.2: Senha Fraca

**Passos:**
1. No cadastro, use senha: `123`
2. Tente criar conta

**Resultado:** ❌ "Senha deve ter pelo menos 6 caracteres"

### Teste 4.3: Senhas Não Coincidem

**Passos:**
1. Senha: `Teste123`
2. Confirmar: `Teste456`
3. Tente criar conta

**Resultado:** ❌ "Senhas não coincidem"

### Teste 4.4: Telefone Inválido

**Passos:**
1. Digite telefone: `123456`
2. Saia do campo

**Resultado:** ❌ "Formato inválido. Use: (11) 99999-9999"

---

## Teste 5: Recuperação de Senha

### Passos:

1. Acesse: http://localhost:5173/auth
2. Clique em "Esqueceu sua senha?"
3. Digite: joao@teste.com
4. Clique em "Enviar Link de Recuperação"

### Resultado Esperado:
- ✅ Mensagem "E-mail Enviado!"
- ✅ Instruções para verificar caixa de entrada

### Verificar E-mail:
1. Abra o e-mail de recuperação
2. Deve conter link para redefinir senha

---

## Teste 6: Redefinição de Senha

### Passos:

1. Clique no link do e-mail de recuperação
2. Deve abrir: http://localhost:5173/reset-password
3. Digite nova senha: `NovaSenha123`
4. Confirme: `NovaSenha123`
5. Clique em "Redefinir Senha"

### Resultado Esperado:
- ✅ Mensagem "Senha Redefinida!"
- ✅ Redireciona para login

### Verificar:
1. Faça login com a nova senha
2. Deve funcionar normalmente

---

## Teste 7: Logout

### Passos:

1. Estando logado no dashboard
2. Clique no botão de logout
3. Deve redirecionar para home

### Resultado Esperado:
- ✅ Sessão encerrada
- ✅ Redirecionado para página inicial
- ✅ Não consegue acessar /dashboard

---

## Teste 8: Proteção de Rotas

### Teste 8.1: Acesso sem Login

**Passos:**
1. Faça logout (se estiver logado)
2. Tente acessar: http://localhost:5173/dashboard

**Resultado:** ✅ Redireciona para /auth

### Teste 8.2: Acesso Logado a Páginas Públicas

**Passos:**
1. Faça login
2. Tente acessar: http://localhost:5173/auth

**Resultado:** ✅ Redireciona para /dashboard

---

## Teste 9: Persistência de Sessão

### Passos:

1. Faça login
2. Feche o navegador
3. Abra novamente
4. Acesse: http://localhost:5173

### Resultado Esperado:
- ✅ Ainda está logado
- ✅ Pode acessar dashboard diretamente

---

## Teste 10: Erros Comuns

### Teste 10.1: Credenciais Inválidas

**Passos:**
1. Tente fazer login com senha errada

**Resultado:** ❌ "E-mail ou senha incorretos"

### Teste 10.2: E-mail Não Confirmado

**Passos:**
1. Cadastre novo usuário
2. Tente fazer login sem confirmar e-mail

**Resultado:** ❌ "Por favor, confirme seu e-mail"

### Teste 10.3: Usuário Já Cadastrado

**Passos:**
1. Tente cadastrar com e-mail já existente

**Resultado:** ❌ "Este e-mail já está cadastrado"

---

## Checklist de Testes

- [ ] Cadastro de novo usuário
- [ ] Confirmação de e-mail
- [ ] Login com credenciais válidas
- [ ] Validação de e-mail inválido
- [ ] Validação de senha fraca
- [ ] Validação de senhas não coincidentes
- [ ] Validação de telefone
- [ ] Recuperação de senha
- [ ] Redefinição de senha
- [ ] Logout
- [ ] Proteção de rotas (sem login)
- [ ] Proteção de rotas (com login)
- [ ] Persistência de sessão
- [ ] Erro: credenciais inválidas
- [ ] Erro: e-mail não confirmado
- [ ] Erro: usuário já cadastrado

---

## Problemas Comuns e Soluções

### Problema: E-mail não chega

**Soluções:**
1. Verifique pasta de spam
2. Verifique configuração SMTP no Supabase
3. Em desenvolvimento, use o Supabase Inbucket (Dashboard → Authentication → Email Templates → View Emails)

### Problema: Erro "Invalid token"

**Soluções:**
1. Link de recuperação expirou (solicite novo)
2. Link já foi usado
3. Verifique URL de redirecionamento no Supabase

### Problema: Não redireciona após login

**Soluções:**
1. Verifique console do navegador
2. Verifique se `establishment_id` está sendo carregado
3. Verifique se trigger `on_auth_user_created` está funcionando

### Problema: RLS bloqueia queries

**Soluções:**
1. Verifique se usuário tem `establishment_id`
2. Verifique políticas RLS no Supabase
3. Verifique função `requesting_user_establishment_id()`

---

## Logs Úteis

### Console do Navegador:
```javascript
// Login bem-sucedido
✅ Login realizado com sucesso
✅ Dados do usuário carregados

// Mudança de estado
🔄 Mudança de estado auth: SIGNED_IN

// Logout
✅ Logout realizado com sucesso
```

### Supabase Dashboard:
1. **Logs** → Filtrar por "auth"
2. **Authentication** → Users → Ver atividade
3. **Database** → Logs → Ver queries

---

## Métricas de Sucesso

✅ **Todos os testes passaram**
- Cadastro funciona
- Login funciona
- Recuperação de senha funciona
- Validações funcionam
- Proteção de rotas funciona
- Sessão persiste

🎉 **Sistema de autenticação está pronto para uso!**
