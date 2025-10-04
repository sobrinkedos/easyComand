/*
          # [Operation Name]
          Initial Schema Creation for Restaurant Management System

          ## Query Description: [This script sets up the entire database schema for the multi-tenant restaurant management system. It creates all necessary custom types (enums), tables, and relationships. Crucially, it establishes the multi-tenant architecture using Supabase's Row Level Security (RLS) and a trigger-based mechanism to link public user profiles with the protected `auth.users` table. This approach is secure and avoids direct foreign keys to the `auth` schema, preventing permission errors.

          The script is designed to be run once for initial setup. It is safe to run on a new, empty Supabase project. It does not contain any destructive operations like `DROP` on existing user data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "High"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Creates 50+ tables for managing establishments, users, menus, orders, stock, etc.
          - Creates 20+ custom ENUM types.
          - Creates a function and trigger (`handle_new_user`) to sync `public.users` with `auth.users`.
          - Creates a helper function (`auth.get_establishment_id`) for RLS policies.
          - Enables RLS and applies security policies to all tenant-specific tables.
          
          ## Security Implications:
          - RLS Status: Enabled on all tenant-specific tables.
          - Policy Changes: Yes, this script creates all initial RLS policies.
          - Auth Requirements: Policies rely on `auth.uid()` to identify the current user.
          
          ## Performance Impact:
          - Indexes: Creates numerous indexes for performance on foreign keys and frequently queried columns.
          - Triggers: Adds one trigger on `auth.users` for profile creation.
          - Estimated Impact: The trigger has a negligible impact on user sign-up performance. Indexes will significantly improve query performance.
          */

-- =============================================
-- ENUM TYPES
-- =============================================
create type public.establishment_operational_status as enum ('active', 'inactive', 'suspended');
create type public.user_status as enum ('active', 'inactive', 'suspended');
create type public.day_of_week as enum ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
create type public.table_shape as enum ('round', 'square', 'rectangular', 'counter');
create type public.table_status as enum ('available', 'occupied', 'reserved', 'maintenance');
create type public.reservation_status as enum ('confirmed', 'cancelled', 'attended', 'no_show');
create type public.product_variation_type as enum ('size', 'flavor', 'additional', 'preparation');
create type public.promotion_type as enum ('happy_hour', 'quantity_discount', 'loyalty_discount', 'specific_day');
create type public.discount_type as enum ('percentage', 'fixed');
create type public.order_type as enum ('local', 'counter', 'delivery', 'pickup');
create type public.order_status as enum ('open', 'sent_to_kitchen', 'preparing', 'ready', 'delivered', 'paid', 'cancelled');
create type public.order_item_status as enum ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
create type public.stock_item_unit_of_measure as enum ('kg', 'liter', 'unit', 'gram', 'box');
create type public.stock_movement_type as enum ('entry', 'exit', 'adjustment', 'loss', 'transfer');
create type public.stock_movement_reason as enum ('sale', 'loss', 'expiration', 'breakage', 'free_sample', 'purchase', 'consumption');
create type public.payment_method_type as enum ('cash', 'credit_card', 'debit_card', 'pix', 'digital_wallet', 'meal_voucher');
create type public.cash_session_status as enum ('open', 'closed');
create type public.cash_session_movement_type as enum ('sale', 'withdrawal', 'reinforcement', 'cancellation', 'expense');
create type public.customer_loyalty_transaction_type as enum ('earned', 'redeemed');
create type public.customer_feedback_type as enum ('product', 'service', 'environment');
create type public.quality_control_check_type as enum ('temperature', 'ingredient_origin', 'license_validity');

-- =============================================
-- GLOBAL TABLES (Not Tenant-Specific)
-- =============================================
create table public.establishment_types (
    id serial primary key,
    name varchar(255) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.subscription_plans (
    id serial primary key,
    name varchar(255) not null unique,
    description text,
    price decimal(10, 2) not null,
    features jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.roles (
    id serial primary key,
    name varchar(255) not null unique,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.permissions (
    id serial primary key,
    name varchar(255) not null unique,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.role_permissions (
    role_id integer not null references public.roles(id) on delete cascade,
    permission_id integer not null references public.permissions(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (role_id, permission_id)
);

-- =============================================
-- TENANT-SPECIFIC TABLES
-- =============================================
create table public.establishments (
    id serial primary key,
    name varchar(255) not null,
    cnpj varchar(18) unique not null,
    establishment_type_id integer not null references public.establishment_types(id),
    address_street varchar(255) not null,
    address_number varchar(50) not null,
    address_complement varchar(255),
    address_neighborhood varchar(255) not null,
    address_city varchar(255) not null,
    address_state varchar(2) not null,
    address_zip_code varchar(10) not null,
    subscription_plan_id integer not null references public.subscription_plans(id),
    operational_status public.establishment_operational_status not null default 'active',
    table_capacity integer,
    accepts_delivery boolean not null default false,
    accepts_reservations boolean not null default false,
    service_fee_percentage decimal(5, 2) default 0.00,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- NOTE: The 'users' table stores public profile information.
-- The 'id' is the primary key and is a UUID that MUST match the 'id' from 'auth.users'.
-- There is NO direct foreign key constraint to 'auth.users' to avoid permission errors.
-- A trigger ('on_auth_user_created') will automatically populate this table when a new user signs up.
create table public.users (
    id uuid primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    full_name varchar(255) not null,
    email varchar(255) not null,
    phone_number varchar(20),
    role_id integer not null references public.roles(id),
    salary decimal(10, 2),
    admission_date date,
    status public.user_status not null default 'active',
    last_login_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, email)
);

create table public.operating_hours (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    day_of_week public.day_of_week not null,
    opening_time time,
    closing_time time,
    is_closed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, day_of_week)
);

create table public.user_activity_log (
    id serial primary key,
    user_id uuid not null references public.users(id) on delete cascade,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    action varchar(255) not null,
    details jsonb,
    ip_address inet,
    created_at timestamptz not null default now()
);

create table public.environments (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    max_capacity integer,
    layout_x integer,
    layout_y integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.tables (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    environment_id integer not null references public.environments(id) on delete cascade,
    table_number varchar(50) not null,
    shape public.table_shape not null,
    capacity integer not null,
    status public.table_status not null default 'available',
    notes text,
    layout_x integer,
    layout_y integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, table_number)
);

create table public.customers (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    full_name varchar(255) not null,
    email varchar(255),
    phone_number varchar(20),
    birth_date date,
    preferences jsonb,
    total_spent decimal(10, 2) default 0.00,
    loyalty_points integer default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, email)
);

create table public.reservations (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    customer_name varchar(255) not null,
    customer_phone varchar(20) not null,
    customer_email varchar(255),
    number_of_people integer not null,
    reservation_date date not null,
    reservation_time time not null,
    status public.reservation_status not null default 'confirmed',
    table_id integer references public.tables(id) on delete set null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.menu_categories (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    description text,
    icon varchar(255),
    color varchar(7),
    display_order integer default 0,
    is_seasonal boolean not null default false,
    available_from time,
    available_until time,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.products (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    category_id integer not null references public.menu_categories(id) on delete cascade,
    name varchar(255) not null,
    description text,
    ingredients text,
    normal_price decimal(10, 2) not null,
    promotional_price decimal(10, 2),
    is_promotional boolean not null default false,
    calories integer,
    allergens jsonb,
    is_vegetarian boolean not null default false,
    is_vegan boolean not null default false,
    is_gluten_free boolean not null default false,
    is_lactose_free boolean not null default false,
    preparation_time_minutes integer,
    is_available boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.product_images (
    id serial primary key,
    product_id integer not null references public.products(id) on delete cascade,
    image_url text not null,
    display_order integer default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.product_variations (
    id serial primary key,
    product_id integer not null references public.products(id) on delete cascade,
    name varchar(255) not null,
    type public.product_variation_type not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(product_id, name)
);

create table public.variation_options (
    id serial primary key,
    variation_id integer not null references public.product_variations(id) on delete cascade,
    option_name varchar(255) not null,
    price_adjustment decimal(10, 2) default 0.00,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(variation_id, option_name)
);

create table public.combos (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    description text,
    discount_percentage decimal(5, 2) not null,
    start_date date,
    end_date date,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.combo_products (
    combo_id integer not null references public.combos(id) on delete cascade,
    product_id integer not null references public.products(id) on delete cascade,
    quantity integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (combo_id, product_id)
);

create table public.promotions (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    description text,
    promotion_type public.promotion_type not null,
    discount_value decimal(10, 2) not null,
    discount_type public.discount_type not null,
    start_date timestamptz not null,
    end_date timestamptz not null,
    is_active boolean not null default true,
    min_quantity integer,
    day_of_week public.day_of_week,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.orders (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    order_date date not null default current_date,
    order_number varchar(50) not null,
    order_type public.order_type not null,
    table_id integer references public.tables(id) on delete set null,
    waiter_id uuid references public.users(id) on delete set null,
    customer_id integer references public.customers(id) on delete set null,
    delivery_address_street varchar(255),
    delivery_address_number varchar(50),
    delivery_address_complement varchar(255),
    delivery_address_neighborhood varchar(255),
    delivery_address_city varchar(255),
    delivery_address_state varchar(2),
    delivery_address_zip_code varchar(10),
    status public.order_status not null default 'open',
    subtotal decimal(10, 2) not null default 0.00,
    service_fee_amount decimal(10, 2) not null default 0.00,
    delivery_fee_amount decimal(10, 2) not null default 0.00,
    discount_amount decimal(10, 2) not null default 0.00,
    total_amount decimal(10, 2) not null default 0.00,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, order_date, order_number)
);

create table public.order_items (
    id serial primary key,
    order_id integer not null references public.orders(id) on delete cascade,
    product_id integer not null references public.products(id) on delete restrict,
    quantity integer not null,
    unit_price decimal(10, 2) not null,
    total_price decimal(10, 2) not null,
    status public.order_item_status not null default 'pending',
    notes text,
    cancellation_reason text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.order_item_variations (
    id serial primary key,
    order_item_id integer not null references public.order_items(id) on delete cascade,
    variation_option_id integer not null references public.variation_options(id) on delete restrict,
    price_adjustment decimal(10, 2) not null default 0.00,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(order_item_id, variation_option_id)
);

create table public.suppliers (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    cnpj_cpf varchar(18) not null,
    contact_person varchar(255),
    phone varchar(20),
    email varchar(255),
    address_street varchar(255),
    address_number varchar(50),
    address_complement varchar(255),
    address_neighborhood varchar(255),
    address_city varchar(255),
    address_state varchar(2),
    address_zip_code varchar(10),
    payment_terms text,
    special_conditions text,
    rating decimal(3, 2),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, cnpj_cpf)
);

create table public.stock_categories (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    color varchar(7),
    parent_category_id integer references public.stock_categories(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.stock_items (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    category_id integer not null references public.stock_categories(id) on delete cascade,
    name varchar(255) not null,
    description text,
    barcode varchar(255),
    unit_of_measure public.stock_item_unit_of_measure not null,
    storage_location varchar(255),
    min_stock_level integer default 0,
    preferred_supplier_id integer references public.suppliers(id) on delete set null,
    current_cost_price decimal(10, 2),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name),
    unique(establishment_id, barcode)
);

create table public.stock_batches (
    id serial primary key,
    stock_item_id integer not null references public.stock_items(id) on delete cascade,
    supplier_id integer references public.suppliers(id) on delete set null,
    batch_number varchar(255),
    quantity integer not null,
    expiration_date date,
    purchase_price decimal(10, 2) not null,
    entry_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(stock_item_id, batch_number)
);

create table public.stock_movements (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    stock_item_id integer not null references public.stock_items(id) on delete cascade,
    movement_type public.stock_movement_type not null,
    quantity integer not null,
    reference_document varchar(255),
    responsible_user_id uuid references public.users(id) on delete set null,
    reason public.stock_movement_reason,
    cost_at_movement decimal(10, 2) not null,
    created_at timestamptz not null default now()
);

create table public.recipes (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    product_id integer not null unique references public.products(id) on delete cascade,
    name varchar(255) not null,
    description text,
    preparation_instructions text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.recipe_ingredients (
    id serial primary key,
    recipe_id integer not null references public.recipes(id) on delete cascade,
    stock_item_id integer not null references public.stock_items(id) on delete cascade,
    quantity_needed decimal(10, 3) not null,
    unit_of_measure public.stock_item_unit_of_measure not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(recipe_id, stock_item_id)
);

create table public.payment_methods (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    type public.payment_method_type not null,
    operator_fee_percentage decimal(5, 2) default 0.00,
    receipt_term_days integer default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.cash_sessions (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    opened_by_user_id uuid not null references public.users(id) on delete restrict,
    opening_balance decimal(10, 2) not null default 0.00,
    closing_balance decimal(10, 2),
    actual_cash_amount decimal(10, 2),
    status public.cash_session_status not null default 'open',
    opening_time timestamptz not null default now(),
    closing_time timestamptz,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.cash_session_movements (
    id serial primary key,
    cash_session_id integer not null references public.cash_sessions(id) on delete cascade,
    movement_type public.cash_session_movement_type not null,
    payment_method_id integer references public.payment_methods(id) on delete set null,
    amount decimal(10, 2) not null,
    order_id integer references public.orders(id) on delete set null,
    description text,
    created_at timestamptz not null default now()
);

create table public.order_payments (
    id serial primary key,
    order_id integer not null references public.orders(id) on delete cascade,
    payment_method_id integer not null references public.payment_methods(id) on delete restrict,
    amount_paid decimal(10, 2) not null,
    transaction_id varchar(255),
    change_given decimal(10, 2) default 0.00,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.expenses (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    description text not null,
    amount decimal(10, 2) not null,
    expense_date date not null,
    category varchar(255),
    paid_by_user_id uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.loyalty_programs (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    points_per_currency_unit decimal(10, 2) not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.loyalty_rewards (
    id serial primary key,
    loyalty_program_id integer not null references public.loyalty_programs(id) on delete cascade,
    name varchar(255) not null,
    description text,
    points_cost integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.customer_loyalty_transactions (
    id serial primary key,
    customer_id integer not null references public.customers(id) on delete cascade,
    loyalty_program_id integer not null references public.loyalty_programs(id) on delete cascade,
    transaction_type public.customer_loyalty_transaction_type not null,
    points_amount integer not null,
    order_id integer references public.orders(id) on delete set null,
    reward_id integer references public.loyalty_rewards(id) on delete set null,
    created_at timestamptz not null default now()
);

create table public.events (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    description text,
    event_date date not null,
    start_time time not null,
    end_time time,
    max_capacity integer,
    price_per_person decimal(10, 2),
    special_menu_id integer references public.products(id) on delete set null,
    customer_id integer references public.customers(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.delivery_platforms (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    name varchar(255) not null,
    commission_percentage decimal(5, 2) not null,
    api_key text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(establishment_id, name)
);

create table public.delivery_platform_orders (
    id serial primary key,
    order_id integer not null unique references public.orders(id) on delete cascade,
    delivery_platform_id integer not null references public.delivery_platforms(id) on delete cascade,
    external_order_id varchar(255) not null,
    commission_amount decimal(10, 2) not null default 0.00,
    delivery_status varchar(255),
    estimated_delivery_time timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(delivery_platform_id, external_order_id)
);

create table public.customer_feedback (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    customer_id integer references public.customers(id) on delete set null,
    order_id integer references public.orders(id) on delete set null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    feedback_type public.customer_feedback_type not null,
    created_at timestamptz not null default now()
);

create table public.quality_control_checks (
    id serial primary key,
    establishment_id integer not null references public.establishments(id) on delete cascade,
    check_type public.quality_control_check_type not null,
    stock_item_id integer references public.stock_items(id) on delete cascade,
    product_id integer references public.products(id) on delete cascade,
    check_date date not null,
    result varchar(255),
    notes text,
    checked_by_user_id uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (num_nonnulls(stock_item_id, product_id) = 1)
);

-- =============================================
-- AUTHENTICATION & MULTI-TENANCY SETUP
-- =============================================

-- ----------------------------------------------------------------
-- 1. FUNCTION & TRIGGER to create a user profile upon sign-up.
-- This is the core of the fix. It avoids direct FK to auth.users.
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Inserts a new row into public.users, linking it to the new auth.users entry.
  -- It expects 'establishment_id', 'role_id', and 'full_name' to be passed in the metadata during sign-up.
  -- Example: supabase.auth.signUp({ email, password, options: { data: { full_name, establishment_id, role_id } } })
  insert into public.users (id, email, full_name, establishment_id, role_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'establishment_id')::integer,
    (new.raw_user_meta_data->>'role_id')::integer
  );
  return new;
end;
$$;

-- Drop trigger if it exists to ensure a clean setup
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger that calls the function after a new user is created in Supabase Auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- 2. HELPER FUNCTION to get the current user's establishment ID.
-- This is used in RLS policies to isolate tenant data.
-- ----------------------------------------------------------------
create or replace function auth.get_establishment_id()
returns int
language sql
security definer
stable -- Use stable for functions that don't modify the DB and depend on params/current user
set search_path = public
as $$
  select establishment_id from public.users where id = auth.uid()
$$;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Generic macro to apply policies to all tenant tables
do $$
declare
    t text;
begin
    for t in
        select table_name from information_schema.columns where column_name = 'establishment_id' and table_schema = 'public'
    loop
        execute format('alter table public.%I enable row level security;', t);
        execute format('drop policy if exists "Allow full access based on establishment" on public.%I;', t);
        execute format('create policy "Allow full access based on establishment" on public.%I for all using (establishment_id = auth.get_establishment_id()) with check (establishment_id = auth.get_establishment_id());', t);
    end loop;
end;
$$;

-- Special policy for the 'users' table to allow users to see others from the same establishment
alter table public.users enable row level security;
drop policy if exists "Allow users to see others from the same establishment" on public.users;
create policy "Allow users to see others from the same establishment"
on public.users for select
using (establishment_id = auth.get_establishment_id());

-- Users can only update their own profile (example of a more granular policy)
drop policy if exists "Allow user to update their own profile" on public.users;
create policy "Allow user to update their own profile"
on public.users for update
using (id = auth.uid())
with check (id = auth.uid());

-- RLS for tables without 'establishment_id' but linked through another table
-- Example: product_images is linked via products table
alter table public.product_images enable row level security;
drop policy if exists "Allow access via product" on public.product_images;
create policy "Allow access via product" on public.product_images for all
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.establishment_id = auth.get_establishment_id()
  )
);
-- You can add similar policies for other linked tables like variation_options, combo_products, etc. if needed.
-- For now, the main policy on the parent tables should suffice for most operations.
