-- =============================================
-- SISTEMA DE GESTÃO DE ESTOQUE
-- =============================================
/*
# Sistema de Gestão de Estoque

## Descrição:
Esta migration cria as tabelas necessárias para gestão completa de estoque
de produtos de revenda (bebidas, salgados, etc.) para bares e restaurantes.

## Funcionalidades:
- Categorias de produtos de estoque
- Cadastro de produtos com controle de estoque mínimo
- Fornecedores
- Movimentações de estoque (entrada, saída, ajuste, perda)
- Unidades de medida
- Alertas de estoque baixo
- Histórico completo de movimentações
*/

-- =============================================
-- 1. TABELA DE UNIDADES DE MEDIDA
-- =============================================
CREATE TABLE public.stock_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Unidade', 'Caixa', 'Fardo', 'Litro', 'Kg', etc.
    abbreviation VARCHAR(10) NOT NULL UNIQUE, -- 'un', 'cx', 'fd', 'L', 'kg', etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir unidades de medida padrão
INSERT INTO public.stock_units (name, abbreviation) VALUES
    ('Unidade', 'un'),
    ('Caixa', 'cx'),
    ('Fardo', 'fd'),
    ('Pacote', 'pct'),
    ('Litro', 'L'),
    ('Mililitro', 'ml'),
    ('Quilograma', 'kg'),
    ('Grama', 'g'),
    ('Dúzia', 'dz'),
    ('Garrafa', 'grf'),
    ('Lata', 'lt');

-- =============================================
-- 2. TABELA DE CATEGORIAS DE ESTOQUE
-- =============================================
CREATE TABLE public.stock_categories (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Emoji ou nome do ícone
    color VARCHAR(7), -- Cor em hexadecimal (#FF5733)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_category_name_per_establishment UNIQUE (establishment_id, name)
);

-- Índices
CREATE INDEX idx_stock_categories_establishment_id ON public.stock_categories(establishment_id);
CREATE INDEX idx_stock_categories_is_active ON public.stock_categories(is_active);

-- =============================================
-- 3. TABELA DE FORNECEDORES
-- =============================================
CREATE TABLE public.suppliers (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj VARCHAR(18),
    cpf VARCHAR(14),
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip_code VARCHAR(10),
    contact_person VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_suppliers_establishment_id ON public.suppliers(establishment_id);
CREATE INDEX idx_suppliers_is_active ON public.suppliers(is_active);
CREATE INDEX idx_suppliers_name ON public.suppliers(name);

-- =============================================
-- 4. TABELA DE PRODUTOS DE ESTOQUE
-- =============================================
CREATE TABLE public.stock_products (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES public.stock_categories(id) ON DELETE RESTRICT,
    supplier_id INT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    barcode VARCHAR(50), -- Código de barras
    sku VARCHAR(50), -- SKU interno
    unit_id INT NOT NULL REFERENCES public.stock_units(id) ON DELETE RESTRICT,
    
    -- Controle de estoque
    current_stock DECIMAL(10, 3) DEFAULT 0, -- Quantidade atual em estoque
    minimum_stock DECIMAL(10, 3) DEFAULT 0, -- Estoque mínimo (alerta)
    maximum_stock DECIMAL(10, 3), -- Estoque máximo (opcional)
    
    -- Preços
    cost_price DECIMAL(10, 2) NOT NULL, -- Preço de custo
    sale_price DECIMAL(10, 2), -- Preço de venda (opcional)
    
    -- Informações adicionais
    brand VARCHAR(100), -- Marca
    package_quantity DECIMAL(10, 3), -- Quantidade por embalagem (ex: caixa com 12 unidades)
    package_unit_id INT REFERENCES public.stock_units(id), -- Unidade da embalagem
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_perishable BOOLEAN DEFAULT false, -- Produto perecível
    expiration_alert_days INT, -- Dias antes do vencimento para alertar
    
    -- Imagem
    image_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_sku_per_establishment UNIQUE (establishment_id, sku)
);

-- Índices
CREATE INDEX idx_stock_products_establishment_id ON public.stock_products(establishment_id);
CREATE INDEX idx_stock_products_category_id ON public.stock_products(category_id);
CREATE INDEX idx_stock_products_supplier_id ON public.stock_products(supplier_id);
CREATE INDEX idx_stock_products_is_active ON public.stock_products(is_active);
CREATE INDEX idx_stock_products_barcode ON public.stock_products(barcode);
CREATE INDEX idx_stock_products_sku ON public.stock_products(sku);
CREATE INDEX idx_stock_products_current_stock ON public.stock_products(current_stock);

-- =============================================
-- 5. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- =============================================
CREATE TYPE public.stock_movement_type AS ENUM (
    'entry',      -- Entrada (compra)
    'exit',       -- Saída (venda/consumo)
    'adjustment', -- Ajuste manual
    'loss',       -- Perda/quebra
    'transfer',   -- Transferência entre estabelecimentos
    'return'      -- Devolução
);

CREATE TABLE public.stock_movements (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.stock_products(id) ON DELETE CASCADE,
    type public.stock_movement_type NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL, -- Quantidade movimentada (sempre positiva)
    unit_cost DECIMAL(10, 2), -- Custo unitário na movimentação
    total_cost DECIMAL(10, 2), -- Custo total da movimentação
    
    -- Estoque antes e depois
    stock_before DECIMAL(10, 3) NOT NULL,
    stock_after DECIMAL(10, 3) NOT NULL,
    
    -- Referências
    supplier_id INT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    order_id INT REFERENCES public.orders(id) ON DELETE SET NULL, -- Referência a pedido (saída)
    invoice_number VARCHAR(50), -- Número da nota fiscal
    
    -- Informações adicionais
    reason TEXT, -- Motivo da movimentação (ajuste, perda, etc.)
    notes TEXT, -- Observações
    expiration_date DATE, -- Data de validade (para produtos perecíveis)
    
    -- Auditoria
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT check_positive_quantity CHECK (quantity > 0)
);

-- Índices
CREATE INDEX idx_stock_movements_establishment_id ON public.stock_movements(establishment_id);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX idx_stock_movements_supplier_id ON public.stock_movements(supplier_id);
CREATE INDEX idx_stock_movements_expiration_date ON public.stock_movements(expiration_date);

-- =============================================
-- 6. TABELA DE ALERTAS DE ESTOQUE
-- =============================================
CREATE TABLE public.stock_alerts (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.stock_products(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'expiring_soon', 'expired'
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_stock_alerts_establishment_id ON public.stock_alerts(establishment_id);
CREATE INDEX idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_is_resolved ON public.stock_alerts(is_resolved);
CREATE INDEX idx_stock_alerts_alert_type ON public.stock_alerts(alert_type);

-- =============================================
-- 7. FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar estoque do produto
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    new_stock DECIMAL(10, 3);
    product_min_stock DECIMAL(10, 3);
    product_name VARCHAR(255);
BEGIN
    -- Calcular novo estoque baseado no tipo de movimentação
    IF NEW.type IN ('entry', 'return') THEN
        new_stock := NEW.stock_before + NEW.quantity;
    ELSIF NEW.type IN ('exit', 'loss') THEN
        new_stock := NEW.stock_before - NEW.quantity;
    ELSIF NEW.type = 'adjustment' THEN
        -- Para ajuste, a quantidade pode ser positiva ou negativa
        -- Mas como sempre armazenamos positivo, usamos o stock_after diretamente
        new_stock := NEW.stock_after;
    ELSE
        new_stock := NEW.stock_before;
    END IF;
    
    -- Atualizar estoque do produto
    UPDATE public.stock_products
    SET 
        current_stock = new_stock,
        updated_at = now()
    WHERE id = NEW.product_id;
    
    -- Verificar se precisa criar alerta de estoque baixo
    SELECT minimum_stock, name INTO product_min_stock, product_name
    FROM public.stock_products
    WHERE id = NEW.product_id;
    
    -- Criar alerta se estoque estiver abaixo do mínimo
    IF new_stock <= product_min_stock THEN
        INSERT INTO public.stock_alerts (
            establishment_id,
            product_id,
            alert_type,
            message
        ) VALUES (
            NEW.establishment_id,
            NEW.product_id,
            CASE 
                WHEN new_stock = 0 THEN 'out_of_stock'
                ELSE 'low_stock'
            END,
            CASE 
                WHEN new_stock = 0 THEN 'Produto "' || product_name || '" está sem estoque!'
                ELSE 'Produto "' || product_name || '" está com estoque baixo (' || new_stock || ' ' || 
                     (SELECT abbreviation FROM public.stock_units WHERE id = 
                      (SELECT unit_id FROM public.stock_products WHERE id = NEW.product_id)) || ')'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estoque
CREATE TRIGGER trigger_update_product_stock
AFTER INSERT ON public.stock_movements
FOR EACH ROW
EXECUTE FUNCTION public.update_product_stock();

-- Função para obter produtos com estoque baixo
CREATE OR REPLACE FUNCTION public.get_low_stock_products(establishment_id_param INT)
RETURNS TABLE (
    product_id INT,
    product_name VARCHAR(255),
    current_stock DECIMAL(10, 3),
    minimum_stock DECIMAL(10, 3),
    unit_abbreviation VARCHAR(10),
    category_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.name,
        sp.current_stock,
        sp.minimum_stock,
        su.abbreviation,
        sc.name
    FROM public.stock_products sp
    JOIN public.stock_units su ON sp.unit_id = su.id
    JOIN public.stock_categories sc ON sp.category_id = sc.id
    WHERE sp.establishment_id = establishment_id_param
    AND sp.is_active = true
    AND sp.current_stock <= sp.minimum_stock
    ORDER BY sp.current_stock ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter valor total do estoque
CREATE OR REPLACE FUNCTION public.get_stock_value(establishment_id_param INT)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_value DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(current_stock * cost_price), 0) INTO total_value
    FROM public.stock_products
    WHERE establishment_id = establishment_id_param
    AND is_active = true;
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar saída de estoque automática ao criar pedido
CREATE OR REPLACE FUNCTION public.register_stock_exit_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Para cada item do pedido que seja produto de estoque
    FOR item IN 
        SELECT oi.product_id, oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id
        AND EXISTS (
            SELECT 1 FROM public.stock_products sp 
            WHERE sp.id = oi.product_id
        )
    LOOP
        -- Registrar saída de estoque
        INSERT INTO public.stock_movements (
            establishment_id,
            product_id,
            type,
            quantity,
            stock_before,
            stock_after,
            order_id,
            reason,
            created_by
        )
        SELECT 
            NEW.establishment_id,
            item.product_id,
            'exit',
            item.quantity,
            sp.current_stock,
            sp.current_stock - item.quantity,
            NEW.id,
            'Saída automática por venda - Pedido #' || NEW.id,
            NEW.created_by
        FROM public.stock_products sp
        WHERE sp.id = item.product_id;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Unidades de medida (público para leitura)
ALTER TABLE public.stock_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON public.stock_units 
FOR SELECT USING (true);

-- Categorias de estoque
ALTER TABLE public.stock_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.stock_categories 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Fornecedores
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.suppliers 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Produtos de estoque
ALTER TABLE public.stock_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.stock_products 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Movimentações de estoque
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.stock_movements 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- Alertas de estoque
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.stock_alerts 
FOR ALL USING (establishment_id = public.get_current_establishment_id());

-- =============================================
-- 9. GRANTS DE PERMISSÕES
-- =============================================

GRANT EXECUTE ON FUNCTION public.get_low_stock_products(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stock_value(INT) TO authenticated;

-- =============================================
-- 10. COMENTÁRIOS NAS TABELAS
-- =============================================

COMMENT ON TABLE public.stock_units IS 'Unidades de medida para produtos de estoque';
COMMENT ON TABLE public.stock_categories IS 'Categorias de produtos de estoque (bebidas, salgados, etc.)';
COMMENT ON TABLE public.suppliers IS 'Fornecedores de produtos';
COMMENT ON TABLE public.stock_products IS 'Produtos de estoque para revenda (bebidas, salgados, etc.)';
COMMENT ON TABLE public.stock_movements IS 'Histórico de movimentações de estoque';
COMMENT ON TABLE public.stock_alerts IS 'Alertas de estoque baixo, vencimento, etc.';

COMMENT ON COLUMN public.stock_products.current_stock IS 'Quantidade atual em estoque';
COMMENT ON COLUMN public.stock_products.minimum_stock IS 'Estoque mínimo para gerar alerta';
COMMENT ON COLUMN public.stock_products.cost_price IS 'Preço de custo do produto';
COMMENT ON COLUMN public.stock_products.package_quantity IS 'Quantidade por embalagem (ex: caixa com 12 unidades)';
COMMENT ON COLUMN public.stock_movements.quantity IS 'Quantidade movimentada (sempre positiva)';
COMMENT ON COLUMN public.stock_movements.stock_before IS 'Estoque antes da movimentação';
COMMENT ON COLUMN public.stock_movements.stock_after IS 'Estoque após a movimentação';
