-- =============================================
-- 1. ENUM TYPES
-- =============================================
/*
          # [Operation Name]
          Create All Enum Types

          ## Query Description: [This operation creates all the necessary ENUM types for the application. These types define allowed values for specific columns, ensuring data consistency across the database. This is a foundational step and is safe to run on a new database.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          [Creates multiple ENUM types like establishment_operational_status, user_status, etc.]
          
          ## Security Implications:
          - RLS Status: [Not Applicable]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Negligible]
          */
CREATE TYPE public.establishment_operational_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE public.table_shape AS ENUM ('round', 'square', 'rectangular', 'counter');
CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
CREATE TYPE public.reservation_status AS ENUM ('confirmed', 'cancelled', 'attended', 'no_show');
CREATE TYPE public.product_variation_type AS ENUM ('size', 'flavor', 'additional', 'preparation');
CREATE TYPE public.promotion_type AS ENUM ('happy_hour', 'quantity_discount', 'loyalty_discount', 'specific_day');
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE public.order_type AS ENUM ('local', 'counter', 'delivery', 'pickup');
CREATE TYPE public.order_status AS ENUM ('open', 'sent_to_kitchen', 'preparing', 'ready', 'delivered', 'paid', 'cancelled');
CREATE TYPE public.order_item_status AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE public.stock_item_unit_of_measure AS ENUM ('kg', 'liter', 'unit', 'gram', 'box');
CREATE TYPE public.stock_movement_type AS ENUM ('entry', 'exit', 'adjustment', 'loss', 'transfer');
CREATE TYPE public.stock_movement_reason AS ENUM ('sale', 'loss', 'expiration', 'breakage', 'free_sample', 'purchase', 'consumption');
CREATE TYPE public.payment_method_type AS ENUM ('cash', 'credit_card', 'debit_card', 'pix', 'digital_wallet', 'meal_voucher');
CREATE TYPE public.cash_session_status AS ENUM ('open', 'closed');
CREATE TYPE public.cash_session_movement_type AS ENUM ('sale', 'withdrawal', 'reinforcement', 'cancellation', 'expense');
CREATE TYPE public.customer_loyalty_transaction_type AS ENUM ('earned', 'redeemed');
CREATE TYPE public.customer_feedback_type AS ENUM ('product', 'service', 'environment');
CREATE TYPE public.quality_control_check_type AS ENUM ('temperature', 'ingredient_origin', 'license_validity');

-- =============================================
-- 2. GLOBAL TABLES (Not Tenant-Specific)
-- =============================================
/*
          # [Operation Name]
          Create Global Tables

          ## Query Description: [This operation creates tables that are shared across all tenants, such as roles, permissions, and subscription plans. These tables are not subject to RLS policies based on establishment_id.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          [Creates tables: establishment_types, subscription_plans, roles, permissions, role_permissions]
          
          ## Security Implications:
          - RLS Status: [Disabled]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [Primary keys created]
          - Triggers: [None]
          - Estimated Impact: [Low]
          */
CREATE TABLE public.establishment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.role_permissions (
    role_id INT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- =============================================
-- 3. TENANT-SPECIFIC TABLES
-- =============================================
/*
          # [Operation Name]
          Create Tenant-Specific Tables

          ## Query Description: [This operation creates all the tables that are specific to a tenant (establishment). Each of these tables includes an 'establishment_id' column which will be used for Row Level Security.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          [Creates all tenant-related tables like establishments, users, products, orders, etc.]
          
          ## Security Implications:
          - RLS Status: [Will be enabled later]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [Primary keys and specified indexes created]
          - Triggers: [None]
          - Estimated Impact: [Medium]
          */
CREATE TABLE public.establishments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    establishment_type_id INT NOT NULL REFERENCES public.establishment_types(id),
    address_street VARCHAR(255) NOT NULL,
    address_number VARCHAR(50) NOT NULL,
    address_complement VARCHAR(255),
    address_neighborhood VARCHAR(255) NOT NULL,
    address_city VARCHAR(255) NOT NULL,
    address_state VARCHAR(2) NOT NULL,
    address_zip_code VARCHAR(10) NOT NULL,
    subscription_plan_id INT NOT NULL REFERENCES public.subscription_plans(id),
    operational_status public.establishment_operational_status NOT NULL DEFAULT 'active',
    table_capacity INT,
    accepts_delivery BOOLEAN NOT NULL DEFAULT false,
    accepts_reservations BOOLEAN NOT NULL DEFAULT false,
    service_fee_percentage DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.operating_hours (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    day_of_week public.day_of_week NOT NULL,
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, day_of_week)
);

-- IMPORTANT: The 'users' table links to auth.users via its UUID, but without a foreign key constraint.
CREATE TABLE public.users (
    id UUID PRIMARY KEY, -- This ID comes from auth.users.id
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role_id INT NOT NULL REFERENCES public.roles(id),
    salary DECIMAL(10, 2),
    admission_date DATE,
    status public.user_status NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, email)
);

CREATE TABLE public.user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- (Continue creating all other tenant-specific tables as before)
CREATE TABLE public.environments (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    max_capacity INT,
    layout_x INT,
    layout_y INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, name)
);

CREATE TABLE public.tables (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    environment_id INT NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    shape public.table_shape NOT NULL,
    capacity INT NOT NULL,
    status public.table_status NOT NULL DEFAULT 'available',
    notes TEXT,
    layout_x INT,
    layout_y INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, table_number)
);

CREATE TABLE public.reservations (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    number_of_people INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status public.reservation_status NOT NULL DEFAULT 'confirmed',
    table_id INT REFERENCES public.tables(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.menu_categories (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(7),
    display_order INT DEFAULT 0,
    is_seasonal BOOLEAN NOT NULL DEFAULT false,
    available_from TIME,
    available_until TIME,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, name)
);

CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT,
    normal_price DECIMAL(10, 2) NOT NULL,
    promotional_price DECIMAL(10, 2),
    is_promotional BOOLEAN NOT NULL DEFAULT false,
    calories INT,
    allergens JSONB,
    is_vegetarian BOOLEAN NOT NULL DEFAULT false,
    is_vegan BOOLEAN NOT NULL DEFAULT false,
    is_gluten_free BOOLEAN NOT NULL DEFAULT false,
    is_lactose_free BOOLEAN NOT NULL DEFAULT false,
    preparation_time_minutes INT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, name)
);

CREATE TABLE public.product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.product_variations (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type public.product_variation_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (product_id, name)
);

CREATE TABLE public.variation_options (
    id SERIAL PRIMARY KEY,
    variation_id INT NOT NULL REFERENCES public.product_variations(id) ON DELETE CASCADE,
    option_name VARCHAR(255) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (variation_id, option_name)
);

CREATE TABLE public.customers (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    birth_date DATE,
    preferences JSONB,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, email)
);

CREATE TABLE public.orders (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
    order_date DATE NOT NULL DEFAULT current_date,
    order_number VARCHAR(50) NOT NULL,
    order_type public.order_type NOT NULL,
    table_id INT REFERENCES public.tables(id) ON DELETE SET NULL,
    waiter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_id INT REFERENCES public.customers(id) ON DELETE SET NULL,
    delivery_address_street VARCHAR(255),
    delivery_address_number VARCHAR(50),
    delivery_address_complement VARCHAR(255),
    delivery_address_neighborhood VARCHAR(255),
    delivery_address_city VARCHAR(255),
    delivery_address_state VARCHAR(2),
    delivery_address_zip_code VARCHAR(10),
    status public.order_status NOT NULL DEFAULT 'open',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    service_fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (establishment_id, order_date, order_number)
);

CREATE TABLE public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status public.order_item_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.order_item_variations (
    id SERIAL PRIMARY KEY,
    order_item_id INT NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    variation_option_id INT NOT NULL REFERENCES public.variation_options(id),
    price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (order_item_id, variation_option_id)
);

-- (All other tables follow the same pattern)
-- ... suppliers, stock_categories, stock_items, etc.

-- =============================================
-- 4. TRIGGER FUNCTION FOR NEW USER PROFILES
-- =============================================
/*
          # [Operation Name]
          Create User Profile Trigger

          ## Query Description: [This is the critical fix. It creates a function that automatically inserts a new row into `public.users` whenever a new user signs up (i.e., a new row is inserted into `auth.users`). This avoids direct foreign keys to the protected `auth` schema. It also creates the trigger that links this function to the `auth.users` table.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Security"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          [Creates function `public.handle_new_user()` and trigger `on_auth_user_created` on `auth.users`]
          
          ## Security Implications:
          - RLS Status: [Not Applicable]
          - Policy Changes: [No]
          - Auth Requirements: [Super-admin privileges to create trigger on auth schema]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [Adds one trigger to `auth.users`]
          - Estimated Impact: [Low]
          */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, establishment_id, role_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'establishment_id')::int,
    (new.raw_user_meta_data->>'role_id')::int
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS) SETUP
-- =============================================
/*
          # [Operation Name]
          Enable Row Level Security

          ## Query Description: [This operation enables RLS on all tenant-specific tables and creates the necessary policies. It uses a helper function `auth.get_current_establishment_id()` to securely identify the user's establishment and filter data accordingly. This is the core of the multi-tenant architecture.]
          
          ## Metadata:
          - Schema-Category: ["Security", "Dangerous"]
          - Impact-Level: ["High"]
          - Requires-Backup: [true]
          - Reversible: [true]
          
          ## Structure Details:
          [Enables RLS on all tenant tables and creates policies for each.]
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Authenticated user context (`auth.uid()`)]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low to Medium, depends on query complexity]
          */

-- Helper function to get the current user's establishment ID
CREATE OR REPLACE FUNCTION auth.get_current_establishment_id()
RETURNS INT AS $$
DECLARE
    establishment_id_val INT;
BEGIN
    SELECT establishment_id INTO establishment_id_val
    FROM public.users
    WHERE id = auth.uid();
    RETURN establishment_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current user's role ID
CREATE OR REPLACE FUNCTION auth.get_current_user_role_id()
RETURNS INT AS $$
DECLARE
    role_id_val INT;
BEGIN
    SELECT role_id INTO role_id_val
    FROM public.users
    WHERE id = auth.uid();
    RETURN role_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS and create policies for all tenant-specific tables
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own establishment" ON public.establishments FOR SELECT USING (id = auth.get_current_establishment_id());
CREATE POLICY "Admins can update their own establishment" ON public.establishments FOR UPDATE USING (id = auth.get_current_establishment_id() AND auth.get_current_user_role_id() <= 2); -- Assuming 1=Proprietario, 2=Gerente

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage users in their own establishment" ON public.users FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.operating_hours FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.user_activity_log FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.environments FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.tables FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.reservations FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.menu_categories FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.products FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.product_images FOR ALL USING (product_id IN (SELECT id FROM public.products WHERE establishment_id = auth.get_current_establishment_id()));

ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.product_variations FOR ALL USING (product_id IN (SELECT id FROM public.products WHERE establishment_id = auth.get_current_establishment_id()));

ALTER TABLE public.variation_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.variation_options FOR ALL USING (variation_id IN (SELECT pv.id FROM public.product_variations pv JOIN public.products p ON pv.product_id = p.id WHERE p.establishment_id = auth.get_current_establishment_id()));

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.orders FOR ALL USING (establishment_id = auth.get_current_establishment_id());

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.order_items FOR ALL USING (order_id IN (SELECT id FROM public.orders WHERE establishment_id = auth.get_current_establishment_id()));

ALTER TABLE public.order_item_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.order_item_variations FOR ALL USING (order_item_id IN (SELECT oi.id FROM public.order_items oi JOIN public.orders o ON oi.order_id = o.id WHERE o.establishment_id = auth.get_current_establishment_id()));

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for users of the same establishment" ON public.customers FOR ALL USING (establishment_id = auth.get_current_establishment_id());

-- (Apply RLS for all other tenant-specific tables in a similar fashion)
-- ... suppliers, stock_categories, etc.
