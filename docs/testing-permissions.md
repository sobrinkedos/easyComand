# Guia de Testes - Sistema de Permissões

Este guia fornece instruções passo a passo para testar o sistema de permissões implementado.

## Pré-requisitos

Antes de testar, certifique-se de que:

1. O banco de dados Supabase está configurado
2. As migrações foram aplicadas
3. A aplicação está rodando

## Passo 1: Preparar Dados de Teste

### 1.1 Criar Papéis (Roles)

Execute no SQL Editor do Supabase:

```sql
-- Criar papéis de teste
INSERT INTO public.roles (name, description) VALUES 
('Proprietário', 'Acesso completo ao sistema'),
('Gerente', 'Acesso administrativo'),
('Garçom', 'Acesso limitado ao atendimento'),
('Cozinheiro', 'Acesso apenas à cozinha'),
('Bartender', 'Acesso apenas ao bar')
ON CONFLICT (name) DO NOTHING;
```

### 1.2 Criar Permissões

```sql
-- Criar permissões
INSERT INTO public.permissions (name, description) VALUES 
('view_dashboard', 'Visualizar dashboard'),
('manage_counter', 'Gerenciar atendimento no balcão'),
('manage_tables', 'Gerenciar mesas e comandas'),
('view_kitchen', 'Visualizar interface da cozinha'),
('view_bar', 'Visualizar interface do bar'),
('manage_cashier', 'Gerenciar caixa'),
('manage_menu', 'Gerenciar cardápio'),
('manage_stock', 'Gerenciar estoque'),
('manage_customers', 'Gerenciar clientes'),
('view_reports', 'Visualizar relatórios'),
('manage_settings', 'Gerenciar configurações')
ON CONFLICT (name) DO NOTHING;
```

### 1.3 Associar Permissões aos Papéis

```sql
-- Proprietário: todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'Proprietário'),
    id
FROM public.permissions
ON CONFLICT DO NOTHING;

-- Gerente: quase todas, exceto algumas configurações críticas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'Gerente'),
    id
FROM public.permissions
WHERE name IN (
    'view_dashboard',
    'manage_counter',
    'manage_tables',
    'view_kitchen',
    'view_bar',
    'manage_cashier',
    'manage_menu',
    'manage_stock',
    'manage_customers',
    'view_reports'
)
ON CONFLICT DO NOTHING;

-- Garçom: apenas atendimento
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'Garçom'),
    id
FROM public.permissions
WHERE name IN (
    'view_dashboard',
    'manage_counter',
    'manage_tables'
)
ON CONFLICT DO NOTHING;

-- Cozinheiro: apenas cozinha
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'Cozinheiro'),
    id
FROM public.permissions
WHERE name IN (
    'view_dashboard',
    'view_kitchen'
)
ON CONFLICT DO NOTHING;

-- Bartender: apenas bar
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'Bartender'),
    id
FROM public.permissions
WHERE name IN (
    'view_dashboard',
    'view_bar'
)
ON CONFLICT DO NOTHING;
```

## Passo 2: Criar Usuários de Teste

### 2.1 Criar Estabelecimento de Teste

```sql
-- Criar tipo de estabelecimento se não existir
INSERT INTO public.establishment_types (name) VALUES ('Restaurante')
ON CONFLICT (name) DO NOTHING;

-- Criar plano de assinatura se não existir
INSERT INTO public.subscription_plans (name, description, price) VALUES 
('Básico', 'Plano básico', 99.90)
ON CONFLICT (name) DO NOTHING;

-- Criar estabelecimento de teste
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
    '12345678000190',
    (SELECT id FROM public.establishment_types WHERE name = 'Restaurante' LIMIT 1),
    (SELECT id FROM public.subscription_plans WHERE name = 'Básico' LIMIT 1),
    'Rua Teste',
    '123',
    'Centro',
    'São Paulo',
    'SP',
    '01000-000'
)
ON CONFLICT (cnpj) DO NOTHING;
```

### 2.2 Criar Usuários com Diferentes Papéis

Você precisará criar usuários através da interface de autenticação do Supabase ou via código. Após criar cada usuário no `auth.users`, atualize o registro em `public.users`:

```sql
-- Atualizar role_id do usuário
UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE name = 'Garçom')
WHERE email = 'garcom@teste.com';

UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE name = 'Gerente')
WHERE email = 'gerente@teste.com';

-- E assim por diante para outros usuários
```

## Passo 3: Testes Funcionais

### 3.1 Teste do Menu Lateral

1. **Login como Proprietário**
   - ✅ Deve ver todos os itens do menu
   - ✅ Dashboard, Balcão, Mesas, Cozinha, Bar, Caixa, Cardápio, Estoque, Clientes, Relatórios, Configurações

2. **Login como Garçom**
   - ✅ Deve ver apenas: Dashboard, Balcão, Mesas
   - ❌ Não deve ver: Cozinha, Bar, Caixa, Cardápio, Estoque, Clientes, Relatórios, Configurações

3. **Login como Cozinheiro**
   - ✅ Deve ver apenas: Dashboard, Cozinha
   - ❌ Não deve ver outros módulos

4. **Login como Bartender**
   - ✅ Deve ver apenas: Dashboard, Bar
   - ❌ Não deve ver outros módulos

### 3.2 Teste de Rotas Protegidas

1. **Como Garçom, tentar acessar:**
   - `/dashboard` - ✅ Deve permitir
   - `/balcao` - ✅ Deve permitir
   - `/mesas` - ✅ Deve permitir
   - `/caixa` - ❌ Deve mostrar "Acesso Negado"
   - `/configuracoes` - ❌ Deve mostrar "Acesso Negado"

2. **Como Cozinheiro, tentar acessar:**
   - `/dashboard` - ✅ Deve permitir
   - `/cozinha` - ✅ Deve permitir
   - `/bar` - ❌ Deve mostrar "Acesso Negado"
   - `/mesas` - ❌ Deve mostrar "Acesso Negado"

### 3.3 Teste de Componentes Protegidos

Acesse a página de demonstração: `/permissions-demo`

1. **Verificar badges de permissão**
   - ✅ Verde (com check) = tem permissão
   - ❌ Vermelho (com cadeado) = não tem permissão

2. **Verificar componentes condicionais**
   - Botões devem aparecer/desaparecer baseado em permissões
   - Mensagens de fallback devem aparecer quando apropriado

3. **Verificar lista de permissões**
   - Deve mostrar todas as permissões com status correto
   - Check verde = tem permissão
   - X vermelho = não tem permissão

### 3.4 Teste de Performance

1. **Verificar cache**
   - Navegar entre páginas
   - Permissões não devem ser recarregadas a cada navegação
   - Verificar no Network tab do DevTools

2. **Verificar loading states**
   - Ao fazer login, deve mostrar "Verificando permissões..."
   - Não deve haver flickering de componentes

## Passo 4: Testes de Segurança

### 4.1 Teste de Bypass de Permissões

1. **Tentar acessar rota diretamente pela URL**
   - Como Garçom, digitar `/caixa` na URL
   - ❌ Deve redirecionar para página de acesso negado

2. **Tentar manipular localStorage/sessionStorage**
   - Não deve ser possível burlar permissões
   - Permissões vêm do servidor (Supabase)

### 4.2 Teste de RLS (Row Level Security)

1. **Verificar que usuários só veem dados do próprio estabelecimento**
   - Criar dois estabelecimentos
   - Criar usuários em cada um
   - Verificar que não há vazamento de dados entre estabelecimentos

## Passo 5: Testes de Edge Cases

### 5.1 Usuário sem Papel

```sql
-- Criar usuário sem role_id
UPDATE public.users 
SET role_id = NULL
WHERE email = 'teste@teste.com';
```

- ❌ Não deve ver nenhum item no menu
- ❌ Não deve ter acesso a nenhuma rota protegida

### 5.2 Papel sem Permissões

```sql
-- Criar papel sem permissões
INSERT INTO public.roles (name, description) VALUES 
('Sem Permissões', 'Papel de teste sem permissões');

-- Atribuir a um usuário
UPDATE public.users 
SET role_id = (SELECT id FROM public.roles WHERE name = 'Sem Permissões')
WHERE email = 'teste@teste.com';
```

- ❌ Não deve ver nenhum item no menu (exceto se houver itens sem permissões definidas)
- ❌ Não deve ter acesso a rotas protegidas

### 5.3 Permissão Inexistente

```typescript
// No código, tentar verificar permissão que não existe
hasPermission('permissao_inexistente')
```

- ❌ Deve retornar `false`
- ✅ Não deve causar erro

## Passo 6: Testes de Usabilidade

### 6.1 Feedback Visual

1. **Verificar indicadores visuais**
   - Badges de permissão devem ser claros
   - Cores devem ser consistentes (verde = permitido, vermelho = negado)

2. **Mensagens de erro**
   - Devem ser amigáveis e informativas
   - Devem sugerir ação (ex: "Entre em contato com o administrador")

### 6.2 Experiência do Usuário

1. **Navegação**
   - Menu deve ser intuitivo
   - Usuário não deve ver opções que não pode acessar

2. **Performance**
   - Não deve haver delays perceptíveis
   - Loading states devem ser rápidos

## Checklist de Testes

Use este checklist para garantir que todos os testes foram executados:

- [ ] Dados de teste criados (papéis, permissões, associações)
- [ ] Usuários de teste criados para cada papel
- [ ] Menu lateral filtra corretamente por papel
- [ ] Rotas protegidas funcionam corretamente
- [ ] Componentes protegidos aparecem/desaparecem corretamente
- [ ] Página de demonstração funciona
- [ ] Badges de permissão mostram status correto
- [ ] Lista de permissões mostra status correto
- [ ] Não é possível burlar permissões via URL
- [ ] Cache de permissões funciona
- [ ] Loading states aparecem corretamente
- [ ] Mensagens de erro são amigáveis
- [ ] Performance é aceitável
- [ ] RLS funciona corretamente
- [ ] Edge cases tratados corretamente

## Problemas Comuns e Soluções

### Problema: Menu vazio após login

**Solução:**
1. Verificar se o usuário tem um `role_id` válido
2. Verificar se o papel tem permissões associadas
3. Verificar console do navegador para erros

### Problema: "Acesso Negado" em todas as páginas

**Solução:**
1. Verificar se as permissões estão escritas corretamente (case-sensitive)
2. Verificar se a query de permissões está retornando dados
3. Verificar se o papel do usuário tem as permissões necessárias

### Problema: Permissões não atualizam após mudança

**Solução:**
1. Fazer logout e login novamente
2. Limpar cache do navegador
3. Verificar se o cache do React Query está configurado corretamente

## Conclusão

Após executar todos os testes deste guia, você terá verificado que:

✅ O sistema de permissões funciona corretamente
✅ Usuários só veem o que têm permissão para ver
✅ Não é possível burlar as restrições de segurança
✅ A experiência do usuário é boa
✅ O sistema é performático

Se algum teste falhar, consulte a documentação em `docs/permissions-system.md` ou o código-fonte dos componentes.
