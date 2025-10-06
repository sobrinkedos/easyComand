import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Label } from '../ui';
import type { StockProduct, StockCategory, Supplier, StockUnit } from '../../hooks/useStock';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<StockProduct>) => Promise<void>;
  product?: StockProduct;
  categories: StockCategory[];
  suppliers: Supplier[];
  units: StockUnit[];
}

const initialFormData = {
  name: '',
  description: '',
  category_id: '',
  supplier_id: '',
  unit_id: '',
  sku: '',
  barcode: '',
  brand: '',
  current_stock: 0,
  minimum_stock: 0,
  maximum_stock: '',
  cost_price: '',
  sale_price: '',
  package_quantity: '',
  package_unit_id: '',
  is_perishable: false,
  expiration_alert_days: ''
};

export function ProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  product,
  categories,
  suppliers,
  units
}: ProductModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetar formulário quando o modal abre/fecha ou quando o produto muda
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Modo edição - preencher com dados do produto
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category_id: product.category_id || '',
          supplier_id: product.supplier_id || '',
          unit_id: product.unit_id || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          brand: product.brand || '',
          current_stock: product.current_stock || 0,
          minimum_stock: product.minimum_stock || 0,
          maximum_stock: product.maximum_stock || '',
          cost_price: product.cost_price || '',
          sale_price: product.sale_price || '',
          package_quantity: product.package_quantity || '',
          package_unit_id: product.package_unit_id || '',
          is_perishable: product.is_perishable || false,
          expiration_alert_days: product.expiration_alert_days || ''
        });
      } else {
        // Modo criação - limpar formulário
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.category_id || !formData.unit_id || !formData.cost_price) {
        setError('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Converter valores vazios para null e garantir tipos corretos
      const dataToSave = {
        name: formData.name,
        description: formData.description || null,
        category_id: Number(formData.category_id),
        unit_id: Number(formData.unit_id),
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
        
        // Campos de texto - converter string vazia para null
        sku: formData.sku?.trim() || null,
        barcode: formData.barcode?.trim() || null,
        brand: formData.brand?.trim() || null,
        
        // Números
        cost_price: Number(formData.cost_price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        current_stock: Number(formData.current_stock),
        minimum_stock: Number(formData.minimum_stock),
        maximum_stock: formData.maximum_stock ? Number(formData.maximum_stock) : null,
        package_quantity: formData.package_quantity ? Number(formData.package_quantity) : null,
        package_unit_id: formData.package_unit_id ? Number(formData.package_unit_id) : null,
        
        // Booleano e outros
        is_perishable: formData.is_perishable,
        expiration_alert_days: formData.expiration_alert_days ? Number(formData.expiration_alert_days) : null
      };

      console.log('📤 Enviando dados para salvar:', dataToSave);
      
      const result = await onSave(dataToSave);
      
      console.log('✅ Produto salvo com sucesso:', result);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao salvar produto. Tente novamente.';
      
      if (err?.message?.includes('unique_sku_per_establishment')) {
        errorMessage = 'Já existe um produto com este SKU. Use um SKU diferente ou deixe em branco.';
      } else if (err?.message?.includes('duplicate key')) {
        errorMessage = 'Já existe um produto com estes dados. Verifique o SKU.';
      } else if (err?.message?.includes('foreign key')) {
        errorMessage = 'Categoria, fornecedor ou unidade inválidos. Verifique os dados.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Coca-Cola 2L"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="category_id">Categoria *</Label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="supplier_id">Fornecedor</Label>
                <select
                  id="supplier_id"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: Coca-Cola"
                />
              </div>

              <div>
                <Label htmlFor="unit_id">Unidade de Medida *</Label>
                <select
                  id="unit_id"
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbreviation})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Códigos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Códigos (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU (Código Interno)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Ex: REF-001 (deixe vazio se não usar)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Deve ser único. Deixe vazio se não usar SKU.
                </p>
              </div>

              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Ex: 7894900011517"
                />
              </div>
            </div>
          </div>

          {/* Estoque */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Controle de Estoque</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_stock">Estoque Atual *</Label>
                <Input
                  id="current_stock"
                  type="number"
                  step="0.001"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  step="0.001"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="maximum_stock">Estoque Máximo</Label>
                <Input
                  id="maximum_stock"
                  type="number"
                  step="0.001"
                  value={formData.maximum_stock}
                  onChange={(e) => setFormData({ ...formData, maximum_stock: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>

          {/* Preços */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Preços</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_price">Preço de Custo *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sale_price">Preço de Venda</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Embalagem */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Embalagem (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package_quantity">Quantidade por Embalagem</Label>
                <Input
                  id="package_quantity"
                  type="number"
                  step="0.001"
                  value={formData.package_quantity}
                  onChange={(e) => setFormData({ ...formData, package_quantity: e.target.value })}
                  placeholder="Ex: 12 (para caixa com 12 unidades)"
                />
              </div>

              <div>
                <Label htmlFor="package_unit_id">Unidade da Embalagem</Label>
                <select
                  id="package_unit_id"
                  value={formData.package_unit_id}
                  onChange={(e) => setFormData({ ...formData, package_unit_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbreviation})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Produto Perecível */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Validade</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_perishable"
                  checked={formData.is_perishable}
                  onChange={(e) => setFormData({ ...formData, is_perishable: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <Label htmlFor="is_perishable" className="mb-0">
                  Este produto é perecível (tem validade)
                </Label>
              </div>

              {formData.is_perishable && (
                <div>
                  <Label htmlFor="expiration_alert_days">Alertar quantos dias antes do vencimento?</Label>
                  <Input
                    id="expiration_alert_days"
                    type="number"
                    value={formData.expiration_alert_days}
                    onChange={(e) => setFormData({ ...formData, expiration_alert_days: e.target.value })}
                    placeholder="Ex: 7 (para alertar 7 dias antes)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
