# 🚀 Guia de Configuração - EasyComand

## ✅ Status da Configuração

### Banco de Dados
- ✅ Schema criado e configurado
- ✅ RLS (Row Level Security) habilitado
- ✅ Dados iniciais inseridos
- ✅ Funções de segurança configuradas

### Dados Iniciais Disponíveis

#### Tipos de Estabelecimento
1. Restaurante
2. Bar
3. Lanchonete
4. Pizzaria
5. Cafeteria
6. Food Truck
7. Pub
8. Bistrô

#### Planos de Assinatura
1. **Básico** - R$ 89,90/mês
   - Até 5 usuários
   - Até 20 mesas
   - Suporte por email

2. **Profissional** - R$ 189,90/mês
   - Até 15 usuários
   - Até 50 mesas
   - Relatórios incluídos
   - Suporte por telefone

3. **Empresarial** - R$ 389,90/mês
   - Usuários ilimitados
   - Mesas ilimitadas
   - Relatórios e analytics
   - Suporte prioritário

#### Papéis (Roles)
1. **Administrador** - Acesso total
2. **Gerente** - Gerenciar operações
3. **Garçom** - Atender mesas e pedidos
4. **Cozinheiro** - Gerenciar cozinha
5. **Caixa** - Processar pagamentos
6. **Bartender** - Preparar bebidas

## 📋 Próximos Passos

### 1. Configurar Autenticação no Supabase

Acesse o Dashboard do Supabase:
1. Vá para **Authentication** → **Providers**
2. Habilite **Email** provider
3. Configure as URLs de redirecionamento:
   - Development: `http://localhost:5173`
   - Production: (sua URL de produção)

### 2. Criar Primeiro Estabelecimento (Opcional)

Você pode criar um estabelecimento de teste via SQL:

```sql
-- Inserir estabelecimento de teste
INSERT INTO public.establishments (
  name, 
  cnpj, 
  establishment_type_id, 
  subscription_plan_id,
  address_street,
  address_number,
  address_neighborhood,
  address_city,
  address_state,
  address_zip_code
) VALUES (
  'Restaurante Teste',
  '12.345.678/0001-90',
  1, -- Restaurante
  1, -- Plano Básico
  'Rua Exemplo',
  '123',
  'Centro',
  'São Paulo',
  'SP',
  '01234-567'
) RETURNING id;
```

### 3. Testar Sistema de Autenticação

Execute o servidor:
```cmd
npm.cmd run dev
```

Acesse: http://localhost:5173

### 4. Funcionalidades Disponíveis

- ✅ Conexão com Supabase
- ✅ Sistema de autenticação (pronto para implementar)
- ✅ Multi-tenancy (isolamento por estabelecimento)
- ✅ Sistema de permissões por papel
- ⏳ Interface de cadastro/login (próximo passo)
- ⏳ Dashboard principal (próximo passo)

## 🔒 Segurança

### RLS Configurado
Todas as tabelas tenant-specific têm Row Level Security habilitado, garantindo que:
- Usuários só acessam dados do seu estabelecimento
- Queries são automaticamente filtradas por `establishment_id`
- Não há risco de vazamento de dados entre estabelecimentos

### Avisos Pendentes
- ⚠️ Proteção contra senhas vazadas (recomendado habilitar no Supabase Auth)
- ⚠️ Uma função com search_path mutável (baixo risco)

## 🛠️ Comandos Úteis

### Desenvolvimento
```cmd
npm.cmd run dev          # Iniciar servidor de desenvolvimento
npm.cmd run build        # Build para produção
npm.cmd run preview      # Preview do build
```

### Alternativa (Batch)
```cmd
start-dev.bat           # Iniciar servidor (contorna problemas do PowerShell)
```

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [React + TypeScript](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🆘 Problemas Comuns

### Erro: "stack depth limit exceeded"
✅ **Resolvido** - Migração aplicada corretamente

### Erro: PowerShell execution policy
**Solução**: Use `npm.cmd` ao invés de `npm` ou execute `start-dev.bat`

### Erro: Supabase URL inválida
**Solução**: Verifique o arquivo `.env` e confirme que as credenciais estão corretas
