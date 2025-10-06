import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface StockProduct {
  id: number;
  establishment_id: number;
  category_id: number;
  supplier_id: number | null;
  name: string;
  description: string | null;
  barcode: string | null;
  sku: string | null;
  unit_id: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  cost_price: number;
  sale_price: number | null;
  brand: string | null;
  package_quantity: number | null;
  package_unit_id: number | null;
  is_active: boolean;
  is_perishable: boolean;
  expiration_alert_days: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  category?: StockCategory;
  supplier?: Supplier;
  unit?: StockUnit;
}

export interface StockCategory {
  id: number;
  establishment_id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  establishment_id: number;
  name: string;
  trade_name: string | null;
  cnpj: string | null;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  contact_person: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockUnit {
  id: number;
  name: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  establishment_id: number;
  product_id: number;
  type: 'entry' | 'exit' | 'adjustment' | 'loss' | 'transfer' | 'return';
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  stock_before: number;
  stock_after: number;
  supplier_id: number | null;
  order_id: number | null;
  invoice_number: string | null;
  reason: string | null;
  notes: string | null;
  expiration_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface StockAlert {
  id: number;
  establishment_id: number;
  product_id: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export function useStock() {
  const { establishmentId } = useAuth();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [units, setUnits] = useState<StockUnit[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos
  const loadProducts = async () => {
    if (!establishmentId) return;
    
    try {
      const { data, error } = await supabase
        .from('stock_products')
        .select(`
          *,
          category:stock_categories(*),
          supplier:suppliers(*),
          unit:stock_units!stock_products_unit_id_fkey(*)
        `)
        .eq('establishment_id', establishmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos');
    }
  };

  // Carregar categorias
  const loadCategories = async () => {
    if (!establishmentId) return;
    
    try {
      const { data, error } = await supabase
        .from('stock_categories')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
    }
  };

  // Carregar fornecedores
  const loadSuppliers = async () => {
    if (!establishmentId) return;
    
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
      setError('Erro ao carregar fornecedores');
    }
  };

  // Carregar unidades de medida
  const loadUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_units')
        .select('*')
        .order('name');

      if (error) throw error;
      setUnits(data || []);
    } catch (err) {
      console.error('Erro ao carregar unidades:', err);
      setError('Erro ao carregar unidades');
    }
  };

  // Carregar movimentações
  const loadMovements = async () => {
    if (!establishmentId) return;
    
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('establishment_id', establishmentId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data || []);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setError('Erro ao carregar movimentações');
    }
  };

  // Carregar alertas
  const loadAlerts = async () => {
    if (!establishmentId) return;
    
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
      setError('Erro ao carregar alertas');
    }
  };

  // Carregar todos os dados
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadProducts(),
      loadCategories(),
      loadSuppliers(),
      loadUnits(),
      loadMovements(),
      loadAlerts()
    ]);
    
    setLoading(false);
  };

  // Criar produto
  const createProduct = async (product: Partial<StockProduct>) => {
    console.log('🔵 createProduct chamado com:', product);
    
    if (!establishmentId) {
      console.error('❌ Estabelecimento não definido');
      throw new Error('Estabelecimento não definido');
    }
    
    console.log('🔵 Establishment ID:', establishmentId);
    
    const dataToInsert = {
      ...product,
      establishment_id: establishmentId
    };
    
    console.log('🔵 Dados para inserir:', dataToInsert);
    
    const { data, error } = await supabase
      .from('stock_products')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ Produto inserido:', data);
    console.log('🔄 Recarregando lista de produtos...');
    
    await loadProducts();
    
    console.log('✅ Lista recarregada');
    return data;
  };

  // Atualizar produto
  const updateProduct = async (id: number, product: Partial<StockProduct>) => {
    const { data, error } = await supabase
      .from('stock_products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await loadProducts();
    return data;
  };

  // Deletar produto (soft delete)
  const deleteProduct = async (id: number) => {
    const { error } = await supabase
      .from('stock_products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    await loadProducts();
  };

  // Criar categoria
  const createCategory = async (category: Partial<StockCategory>) => {
    if (!establishmentId) throw new Error('Estabelecimento não definido');
    
    const { data, error } = await supabase
      .from('stock_categories')
      .insert({
        ...category,
        establishment_id: establishmentId
      })
      .select()
      .single();

    if (error) throw error;
    await loadCategories();
    return data;
  };

  // Atualizar categoria
  const updateCategory = async (id: number, category: Partial<StockCategory>) => {
    const { data, error } = await supabase
      .from('stock_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await loadCategories();
    return data;
  };

  // Criar fornecedor
  const createSupplier = async (supplier: Partial<Supplier>) => {
    if (!establishmentId) throw new Error('Estabelecimento não definido');
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplier,
        establishment_id: establishmentId
      })
      .select()
      .single();

    if (error) throw error;
    await loadSuppliers();
    return data;
  };

  // Atualizar fornecedor
  const updateSupplier = async (id: number, supplier: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await loadSuppliers();
    return data;
  };

  // Registrar movimentação
  const createMovement = async (movement: Partial<StockMovement>) => {
    if (!establishmentId) throw new Error('Estabelecimento não definido');
    
    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        ...movement,
        establishment_id: establishmentId
      })
      .select()
      .single();

    if (error) throw error;
    await Promise.all([loadMovements(), loadProducts(), loadAlerts()]);
    return data;
  };

  // Calcular estatísticas
  const getStats = () => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0).length;
    const outOfStock = products.filter(p => p.current_stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);

    return {
      totalProducts,
      lowStock,
      outOfStock,
      totalValue
    };
  };

  // Carregar dados ao montar
  useEffect(() => {
    if (establishmentId) {
      loadAll();
    }
  }, [establishmentId]);

  return {
    products,
    categories,
    suppliers,
    units,
    movements,
    alerts,
    loading,
    error,
    stats: getStats(),
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    createSupplier,
    updateSupplier,
    createMovement,
    refresh: loadAll
  };
}
