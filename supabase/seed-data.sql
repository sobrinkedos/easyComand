-- Script de dados iniciais para o EasyComand
-- Execute este script após aplicar todas as migrações

-- Inserir tipos de estabelecimento
INSERT INTO public.establishment_types (name) VALUES 
('Restaurante'),
('Bar'),
('Lanchonete'),
('Pizzaria'),
('Cafeteria'),
('Food Truck'),
('Pub'),
('Bistrô')
ON CONFLICT (name) DO NOTHING;

-- Inserir planos de assinatura
INSERT INTO public.subscription_plans (name, description, price, features) VALUES 
('Básico', 'Plano básico para pequenos estabelecimentos', 89.90, '{"max_users": 5, "max_tables": 20, "reports": false, "support": "email"}'),
('Profissional', 'Plano profissional para estabelecimentos médios', 189.90, '{"max_users": 15, "max_tables": 50, "reports": true, "support": "phone"}'),
('Empresarial', 'Plano empresarial para grandes estabelecimentos', 389.90, '{"max_users": -1, "max_tables": -1, "reports": true, "support": "priority", "analytics": true}')
ON CONFLICT (name) DO NOTHING;

-- Inserir papéis (roles) padrão
INSERT INTO public.roles (name, description) VALUES 
('Administrador', 'Acesso total ao sistema'),
('Gerente', 'Gerenciar operações do estabelecimento'),
('Garçom', 'Atender mesas e gerenciar pedidos'),
('Cozinheiro', 'Gerenciar cozinha e preparo'),
('Caixa', 'Processar pagamentos e fechamento'),
('Bartender', 'Preparar bebidas e atender bar')
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões básicas
INSERT INTO public.permissions (name, description) VALUES 
('establishments.read', 'Visualizar dados do estabelecimento'),
('establishments.write', 'Editar dados do estabelecimento'),
('users.read', 'Visualizar usuários'),
('users.write', 'Gerenciar usuários'),
('tables.read', 'Visualizar mesas'),
('tables.write', 'Gerenciar mesas'),
('orders.read', 'Visualizar pedidos'),
('orders.write', 'Criar e editar pedidos'),
('products.read', 'Visualizar produtos'),
('products.write', 'Gerenciar produtos'),
('customers.read', 'Visualizar clientes'),
('customers.write', 'Gerenciar clientes'),
('reports.read', 'Visualizar relatórios'),
('payments.process', 'Processar pagamentos'),
('kitchen.manage', 'Gerenciar cozinha')
ON CONFLICT (name) DO NOTHING;

-- Configurar permissões para papéis
-- Administrador - Todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Administrador'
ON CONFLICT DO NOTHING;

-- Gerente - Quase todas, exceto configurações críticas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Gerente'
AND p.name NOT IN ('establishments.write', 'users.write')
ON CONFLICT DO NOTHING;

-- Garçom - Pedidos, mesas, clientes
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Garçom'
AND p.name IN ('tables.read', 'tables.write', 'orders.read', 'orders.write', 'customers.read', 'customers.write', 'products.read')
ON CONFLICT DO NOTHING;

-- Cozinheiro - Cozinha e pedidos
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Cozinheiro'
AND p.name IN ('orders.read', 'orders.write', 'kitchen.manage', 'products.read')
ON CONFLICT DO NOTHING;

-- Caixa - Pagamentos e relatórios
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Caixa'
AND p.name IN ('orders.read', 'payments.process', 'reports.read', 'customers.read')
ON CONFLICT DO NOTHING;