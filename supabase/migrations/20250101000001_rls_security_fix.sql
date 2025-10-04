/*
# [SECURITY MIGRATION] Enable RLS and Create Multi-Tenant Policies
This script addresses critical security vulnerabilities by enabling Row Level Security (RLS)
and creating policies to enforce data isolation in the multi-tenant architecture.

## Query Description:
This operation is CRITICAL for the security of your application. It will:
1. Create a helper function to identify the establishment of the current user.
2. Enable Row Level Security on all tenant-specific tables.
3. Create security policies on each of those tables to ensure users can only
   access data belonging to their own establishment.
This prevents data leakage between different tenants (restaurants).

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true (by disabling RLS and dropping policies)

## Security Implications:
- RLS Status: Enabled on all tenant-specific tables.
- Policy Changes: Yes, adds `FOR ALL` policies to tenant tables.
- Auth Requirements: Policies rely on `auth.uid()` to identify the user.
*/

-- STEP 1: Create a helper function to get the current user's establishment ID.
-- This function is essential for all RLS policies.
CREATE OR REPLACE FUNCTION public.requesting_user_establishment_id()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT establishment_id
  FROM public.users
  WHERE id = auth.uid();
$$;

-- STEP 2: Update the handle_new_user function to be more secure by setting the search_path.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;


-- STEP 3: Enable RLS and create policies for all tenant-specific tables.

-- Table: establishments
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment" ON public.establishments;
CREATE POLICY "Allow access to own establishment" ON public.establishments FOR ALL
USING (id = public.requesting_user_establishment_id());

-- Table: operating_hours
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.operating_hours;
CREATE POLICY "Allow access to own establishment data" ON public.operating_hours FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.users;
CREATE POLICY "Allow access to own establishment data" ON public.users FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: user_activity_log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.user_activity_log;
CREATE POLICY "Allow access to own establishment data" ON public.user_activity_log FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: environments
ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.environments;
CREATE POLICY "Allow access to own establishment data" ON public.environments FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: tables
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.tables;
CREATE POLICY "Allow access to own establishment data" ON public.tables FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.reservations;
CREATE POLICY "Allow access to own establishment data" ON public.reservations FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: menu_categories
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.menu_categories;
CREATE POLICY "Allow access to own establishment data" ON public.menu_categories FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.products;
CREATE POLICY "Allow access to own establishment data" ON public.products FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: product_images (indirect link)
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent product" ON public.product_images;
CREATE POLICY "Allow access via parent product" ON public.product_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND p.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: product_variations (indirect link)
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent product" ON public.product_variations;
CREATE POLICY "Allow access via parent product" ON public.product_variations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variations.product_id AND p.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: variation_options (indirect link)
ALTER TABLE public.variation_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent variation" ON public.variation_options;
CREATE POLICY "Allow access via parent variation" ON public.variation_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.product_variations pv
    JOIN public.products p ON pv.product_id = p.id
    WHERE pv.id = variation_options.variation_id AND p.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: combos
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.combos;
CREATE POLICY "Allow access to own establishment data" ON public.combos FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: combo_products (indirect link)
ALTER TABLE public.combo_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent combo" ON public.combo_products;
CREATE POLICY "Allow access via parent combo" ON public.combo_products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.combos c
    WHERE c.id = combo_products.combo_id AND c.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.promotions;
CREATE POLICY "Allow access to own establishment data" ON public.promotions FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.orders;
CREATE POLICY "Allow access to own establishment data" ON public.orders FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: order_items (indirect link)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent order" ON public.order_items;
CREATE POLICY "Allow access via parent order" ON public.order_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: order_item_variations (indirect link)
ALTER TABLE public.order_item_variations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent order item" ON public.order_item_variations;
CREATE POLICY "Allow access via parent order item" ON public.order_item_variations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.id = order_item_variations.order_item_id AND o.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.suppliers;
CREATE POLICY "Allow access to own establishment data" ON public.suppliers FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: stock_categories
ALTER TABLE public.stock_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.stock_categories;
CREATE POLICY "Allow access to own establishment data" ON public.stock_categories FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: stock_items
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.stock_items;
CREATE POLICY "Allow access to own establishment data" ON public.stock_items FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: stock_batches (indirect link)
ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent stock item" ON public.stock_batches;
CREATE POLICY "Allow access via parent stock item" ON public.stock_batches FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.stock_items si
    WHERE si.id = stock_batches.stock_item_id AND si.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.stock_movements;
CREATE POLICY "Allow access to own establishment data" ON public.stock_movements FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.recipes;
CREATE POLICY "Allow access to own establishment data" ON public.recipes FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: recipe_ingredients (indirect link)
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent recipe" ON public.recipe_ingredients;
CREATE POLICY "Allow access via parent recipe" ON public.recipe_ingredients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_ingredients.recipe_id AND r.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.payment_methods;
CREATE POLICY "Allow access to own establishment data" ON public.payment_methods FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: cash_sessions
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.cash_sessions;
CREATE POLICY "Allow access to own establishment data" ON public.cash_sessions FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: cash_session_movements (indirect link)
ALTER TABLE public.cash_session_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent cash session" ON public.cash_session_movements;
CREATE POLICY "Allow access via parent cash session" ON public.cash_session_movements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cash_sessions cs
    WHERE cs.id = cash_session_movements.cash_session_id AND cs.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: order_payments (indirect link)
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent order" ON public.order_payments;
CREATE POLICY "Allow access via parent order" ON public.order_payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_payments.order_id AND o.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.expenses;
CREATE POLICY "Allow access to own establishment data" ON public.expenses FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.customers;
CREATE POLICY "Allow access to own establishment data" ON public.customers FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: loyalty_programs
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.loyalty_programs;
CREATE POLICY "Allow access to own establishment data" ON public.loyalty_programs FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: loyalty_rewards (indirect link)
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent loyalty program" ON public.loyalty_rewards;
CREATE POLICY "Allow access via parent loyalty program" ON public.loyalty_rewards FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.loyalty_programs lp
    WHERE lp.id = loyalty_rewards.loyalty_program_id AND lp.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: customer_loyalty_transactions (indirect link)
ALTER TABLE public.customer_loyalty_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent customer" ON public.customer_loyalty_transactions;
CREATE POLICY "Allow access via parent customer" ON public.customer_loyalty_transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_loyalty_transactions.customer_id AND c.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.events;
CREATE POLICY "Allow access to own establishment data" ON public.events FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: delivery_platforms
ALTER TABLE public.delivery_platforms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.delivery_platforms;
CREATE POLICY "Allow access to own establishment data" ON public.delivery_platforms FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: delivery_platform_orders (indirect link)
ALTER TABLE public.delivery_platform_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access via parent order" ON public.delivery_platform_orders;
CREATE POLICY "Allow access via parent order" ON public.delivery_platform_orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = delivery_platform_orders.order_id AND o.establishment_id = public.requesting_user_establishment_id()
  )
);

-- Table: customer_feedback
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.customer_feedback;
CREATE POLICY "Allow access to own establishment data" ON public.customer_feedback FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());

-- Table: quality_control_checks
ALTER TABLE public.quality_control_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.quality_control_checks;
CREATE POLICY "Allow access to own establishment data" ON public.quality_control_checks FOR ALL
USING (establishment_id = public.requesting_user_establishment_id());
