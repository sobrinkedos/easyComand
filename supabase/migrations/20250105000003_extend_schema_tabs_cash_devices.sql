-- =============================================
-- EXTENSÃO DO SCHEMA - COMANDAS, CAIXA E DISPOSITIVOS
-- =============================================
/*
# Extensão do Schema do Banco de Dados

## Descrição:
Esta migration adiciona as tabelas necessárias para:
- Sistema de comandas (tabs)
- Módulo de caixa (cash_sessions, cash_movements, payments)
- Push notifications (user_devices)
- Vinculação de pedidos a comandas

## Requisitos: 2, 3, 6, 7, 8
*/

-- =============================================
-- 1. TABELA DE COMANDAS (TABS)
-- =============================================
/*
Tabela para gerenciar comandas vinculadas a mesas.
Permite múltiplas comandas por mesa e controle de consumo individual.
*/
CREATE TABLE public.tabs (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    tab_number VARCHAR(50) NOT NULL,
    table_id INT REFERENCES public.tables(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_id INT REFERENCES public.customers(id) ON DELETE SET NULL,
    waiter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid')),
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    service_fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    opened_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_tab_number_per_establishment UNIQUE (establishment_id, tab_number)
);

-- Índices para melhorar performance
CREATE INDEX idx_tabs_establishment_id ON public.tabs(establishment_id);
CREATE INDEX idx_tabs_table_id ON public.tabs(table_id);
CREATE INDEX idx_tabs_status ON public.tabs(status);
CREATE INDEX idx_tabs_waiter_id ON public.tabs(waiter_id);

-- =============================================
-- 2. ADICIONAR COLUNA tab_id NA TABELA ORDERS
-- =============================================
/*
Vincula pedidos a comandas específicas.
Permite rastrear todos os pedidos de uma comanda.
*/
ALTER TABLE public.orders 
ADD COLUMN tab_id INT REFERENCES public.tabs(id) ON DELETE SET NULL;

-- Índice para melhorar consultas de pedidos por comanda
CREATE INDEX idx_orders_tab_id ON public.orders(tab_id);

-- =============================================
-- 3. TABELA DE SESSÕES DE CAIXA
-- =============================================
/*
Controla abertura e fechamento de caixa diário.
Registra operador, valores inicial e final, e diferenças.
*/
CREATE TABLE public.cash_sessions (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    opening_amount DECIMAL(10, 2) NOT NULL,
    closing_amount DECIMAL(10, 2),
    expected_amount DECIMAL(10, 2),
    difference_amount DECIMAL(10, 2),
    status public.cash_session_status NOT NULL DEFAULT 'open',
    opened_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT check_closing_amounts CHECK (
        (status = 'open' AND closing_amount IS NULL) OR
        (status = 'closed' AND closing_amount IS NOT NULL)
    )
);

-- Índices para melhorar performance
CREATE INDEX idx_cash_sessions_establishment_id ON public.cash_sessions(establishment_id);
CREATE INDEX idx_cash_sessions_operator_id ON public.cash_sessions(operator_id);
CREATE INDEX idx_cash_sessions_status ON public.cash_sessions(status);
CREATE INDEX idx_cash_sessions_opened_at ON public.cash_sessions(opened_at);

-- =============================================
-- 4. TABELA DE MOVIMENTAÇÕES DE CAIXA
-- =============================================
/*
Registra todas as movimentações financeiras do caixa.
Inclui vendas, sangrias, reforços, despesas e cancelamentos.
*/
CREATE TABLE public.cash_movements (
    id SERIAL PRIMARY KEY,
    cash_session_id INT NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    type public.cash_session_movement_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    payment_method public.payment_method_type,
    reference_type VARCHAR(50), -- 'order', 'expense', 'withdrawal', 'payment'
    reference_id INT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT check_positive_amount CHECK (amount >= 0)
);

-- Índices para melhorar performance
CREATE INDEX idx_cash_movements_cash_session_id ON public.cash_movements(cash_session_id);
CREATE INDEX idx_cash_movements_establishment_id ON public.cash_movements(establishment_id);
CREATE INDEX idx_cash_movements_type ON public.cash_movements(type);
CREATE INDEX idx_cash_movements_created_at ON public.cash_movements(created_at);

-- =============================================
-- 5. TABELA DE PAGAMENTOS
-- =============================================
/*
Registra pagamentos de pedidos e comandas.
Suporta múltiplas formas de pagamento e divisão de conta.
*/
CREATE TABLE public.payments (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    order_id INT REFERENCES public.orders(id) ON DELETE CASCADE,
    tab_id INT REFERENCES public.tabs(id) ON DELETE CASCADE,
    cash_session_id INT REFERENCES public.cash_sessions(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL,
    change_amount DECIMAL(10, 2) DEFAULT 0.00,
    cpf_cnpj VARCHAR(18),
    payment_methods JSONB NOT NULL, -- Array de métodos: [{"type": "cash", "amount": 50.00, "installments": null}]
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT check_payment_amounts CHECK (paid_amount >= total_amount),
    CONSTRAINT check_order_or_tab CHECK (
        (order_id IS NOT NULL AND tab_id IS NULL) OR
        (order_id IS NULL AND tab_id IS NOT NULL)
    )
);

-- Índices para melhorar performance
CREATE INDEX idx_payments_establishment_id ON public.payments(establishment_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_tab_id ON public.payments(tab_id);
CREATE INDEX idx_payments_cash_session_id ON public.payments(cash_session_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- =============================================
-- 6. TABELA DE DISPOSITIVOS DE USUÁRIOS
-- =============================================
/*
Armazena tokens de push notification para dispositivos móveis.
Permite enviar notificações para garçons e outros usuários.
*/
CREATE TABLE public.user_devices (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    push_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_push_token UNIQUE (user_id, push_token)
);

-- Índices para melhorar performance
CREATE INDEX idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX idx_user_devices_is_active ON public.user_devices(is_active);

-- =============================================
-- 7. FUNÇÕES AUXILIARES SQL
-- =============================================

-- Função para calcular total de uma comanda
CREATE OR REPLACE FUNCTION public.calculate_tab_total(tab_id_param INT)
RETURNS TABLE (
    subtotal DECIMAL(10, 2),
    service_fee DECIMAL(10, 2),
    discount DECIMAL(10, 2),
    total DECIMAL(10, 2)
) AS $
DECLARE
    establishment_service_fee DECIMAL(5, 2);
    calculated_subtotal DECIMAL(10, 2);
    calculated_service_fee DECIMAL(10, 2);
    calculated_discount DECIMAL(10, 2);
    calculated_total DECIMAL(10, 2);
BEGIN
    -- Buscar taxa de serviço do estabelecimento
    SELECT e.service_fee_percentage INTO establishment_service_fee
    FROM public.tabs t
    JOIN public.establishments e ON t.establishment_id = e.id
    WHERE t.id = tab_id_param;
    
    -- Calcular subtotal de todos os pedidos da comanda
    SELECT COALESCE(SUM(o.subtotal), 0) INTO calculated_subtotal
    FROM public.orders o
    WHERE o.tab_id = tab_id_param;
    
    -- Calcular taxa de serviço
    calculated_service_fee := calculated_subtotal * (establishment_service_fee / 100);
    
    -- Buscar desconto aplicado
    SELECT COALESCE(t.discount_amount, 0) INTO calculated_discount
    FROM public.tabs t
    WHERE t.id = tab_id_param;
    
    -- Calcular total
    calculated_total := calculated_subtotal + calculated_service_fee - calculated_discount;
    
    RETURN QUERY SELECT 
        calculated_subtotal,
        calculated_service_fee,
        calculated_discount,
        calculated_total;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar totais da comanda
CREATE OR REPLACE FUNCTION public.update_tab_totals()
RETURNS TRIGGER AS $
DECLARE
    tab_totals RECORD;
BEGIN
    -- Se o pedido tem tab_id, atualizar totais da comanda
    IF NEW.tab_id IS NOT NULL THEN
        SELECT * INTO tab_totals FROM public.calculate_tab_total(NEW.tab_id);
        
        UPDATE public.tabs
        SET 
            subtotal = tab_totals.subtotal,
            service_fee_amount = tab_totals.service_fee,
            total_amount = tab_totals.total,
            updated_at = now()
        WHERE id = NEW.tab_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar totais da comanda quando pedido é inserido/atualizado
CREATE TRIGGER trigger_update_tab_totals
AFTER INSERT OR UPDATE OF subtotal, tab_id ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_tab_totals();

-- Função para verificar se há comandas abertas em uma mesa
CREATE OR REPLACE FUNCTION public.has_open_tabs(table_id_param INT)
RETURNS BOOLEAN AS $
DECLARE
    open_tabs_count INT;
BEGIN
    SELECT COUNT(*) INTO open_tabs_count
    FROM public.tabs
    WHERE table_id = table_id_param
    AND status = 'open';
    
    RETURN open_tabs_count > 0;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se há sessão de caixa aberta
CREATE OR REPLACE FUNCTION public.has_open_cash_session(establishment_id_param INT)
RETURNS BOOLEAN AS $
DECLARE
    open_sessions_count INT;
BEGIN
    SELECT COUNT(*) INTO open_sessions_count
    FROM public.cash_sessions
    WHERE establishment_id = establishment_id_param
    AND status = 'open';
    
    RETURN open_sessions_count > 0;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar movimentação de caixa automaticamente ao criar pagamento
CREATE OR REPLACE FUNCTION public.register_payment_cash_movement()
RETURNS TRIGGER AS $
DECLARE
    active_session_id INT;
    payment_method_item JSONB;
BEGIN
    -- Buscar sessão de caixa ativa
    SELECT id INTO active_session_id
    FROM public.cash_sessions
    WHERE establishment_id = NEW.establishment_id
    AND status = 'open'
    ORDER BY opened_at DESC
    LIMIT 1;
    
    -- Se não há sessão ativa, não registrar movimentação
    IF active_session_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Atualizar cash_session_id do pagamento
    UPDATE public.payments
    SET cash_session_id = active_session_id
    WHERE id = NEW.id;
    
    -- Registrar movimentação para cada método de pagamento
    FOR payment_method_item IN SELECT * FROM jsonb_array_elements(NEW.payment_methods)
    LOOP
        INSERT INTO public.cash_movements (
            cash_session_id,
            establishment_id,
            type,
            amount,
            description,
            payment_method,
            reference_type,
            reference_id,
            created_by
        ) VALUES (
            active_session_id,
            NEW.establishment_id,
            'sale',
            (payment_method_item->>'amount')::DECIMAL(10, 2),
            CASE 
                WHEN NEW.order_id IS NOT NULL THEN 'Pagamento de pedido #' || NEW.order_id
                WHEN NEW.tab_id IS NOT NULL THEN 'Pagamento de comanda #' || NEW.tab_id
                ELSE 'Pagamento'
            END,
            (payment_method_item->>'type')::public.payment_method_type,
            CASE 
                WHEN NEW.order_id IS NOT NULL THEN 'order'
                WHEN NEW.tab_id IS NOT NULL THEN 'tab'
                ELSE NULL
            END,
            COALESCE(NEW.order_id, NEW.tab_id),
            NEW.created_by
        );
    END LOOP;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar movimentação de caixa ao criar pagamento
CREATE TRIGGER trigger_register_payment_cash_movement
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.register_payment_cash_movement();

-- =============================================
-- 8. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS na tabela tabs
ALTER TABLE public.tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable access for users of the same establishment" ON public.tabs 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Habilitar RLS na tabela cash_sessions
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable access for users of the same establishment" ON public.cash_sessions 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Habilitar RLS na tabela cash_movements
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable access for users of the same establishment" ON public.cash_movements 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Habilitar RLS na tabela payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable access for users of the same establishment" ON public.payments 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Habilitar RLS na tabela user_devices
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own devices" ON public.user_devices 
FOR ALL USING (user_id = auth.uid());

-- Política adicional para administradores visualizarem dispositivos do estabelecimento
CREATE POLICY "Admins can view establishment devices" ON public.user_devices 
FOR SELECT USING (
    user_id IN (
        SELECT id FROM public.users 
        WHERE establishment_id = public.get_current_establishment_id()
    )
);

-- =============================================
-- 9. GRANTS DE PERMISSÕES
-- =============================================

-- Garantir que usuários autenticados possam executar as funções auxiliares
GRANT EXECUTE ON FUNCTION public.calculate_tab_total(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_open_tabs(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_open_cash_session(INT) TO authenticated;

-- =============================================
-- 10. COMENTÁRIOS NAS TABELAS
-- =============================================

COMMENT ON TABLE public.tabs IS 'Comandas vinculadas a mesas para controle de consumo individual';
COMMENT ON TABLE public.cash_sessions IS 'Sessões de caixa para controle de abertura e fechamento diário';
COMMENT ON TABLE public.cash_movements IS 'Movimentações financeiras do caixa (vendas, sangrias, despesas)';
COMMENT ON TABLE public.payments IS 'Pagamentos de pedidos e comandas com múltiplas formas de pagamento';
COMMENT ON TABLE public.user_devices IS 'Dispositivos móveis dos usuários para push notifications';

COMMENT ON COLUMN public.orders.tab_id IS 'Vincula o pedido a uma comanda específica';
COMMENT ON COLUMN public.tabs.tab_number IS 'Número único da comanda dentro do estabelecimento';
COMMENT ON COLUMN public.payments.payment_methods IS 'Array JSON com métodos de pagamento: [{"type": "cash", "amount": 50.00, "installments": null}]';
COMMENT ON COLUMN public.user_devices.push_token IS 'Token do Expo Push Notification ou FCM';
