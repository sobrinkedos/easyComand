import { useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '../ui';
import { MainLayout } from '../layout';
import { useStock } from '../../hooks/useStock';
import { CategoryModal } from '../stock/CategoryModal';
import { ProductModal } from '../stock/ProductModal';

export function Estoque() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'movements' | 'suppliers'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const {
    products,
    categories,
    suppliers,
    units,
    loading,
    error,
    stats,
    createProduct,
    createCategory
  } = useStock();

  const getProductStatus = (product: typeof products[0]) => {
    if (product.current_stock === 0) return { status: 'out', text: 'Sem Estoque', color: 'bg-red-100 text-red-800 border-red-200' };
    if (product.current_stock <= product.minimum_stock) return { status: 'low', text: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { status: 'ok', text: 'Normal', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">Carregando...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestão de Estoque</h1>
            <p className="text-slate-600 mt-1">
              Controle completo de produtos para revenda
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowAddProduct(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.lowStock}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.outOfStock}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'products'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Produtos
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'categories'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Categorias
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'movements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Movimentações
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'suppliers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Fornecedores
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Produto</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-600">Categoria</th>
                      <th className="text-center p-4 text-sm font-medium text-slate-600">Estoque</th>
                      <th className="text-center p-4 text-sm font-medium text-slate-600">Mínimo</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600">Custo</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-600">Venda</th>
                      <th className="text-center p-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-center p-4 text-sm font-medium text-slate-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const status = getProductStatus(product);
                        return (
                          <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-slate-800">{product.name}</p>
                                {product.supplier && (
                                  <p className="text-sm text-slate-500">{product.supplier.name}</p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-slate-600">{product.category?.name}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium text-slate-800">
                                {product.current_stock} {product.unit?.abbreviation}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm text-slate-600">
                                {product.minimum_stock} {product.unit?.abbreviation}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-sm text-slate-600">
                                R$ {product.cost_price.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-sm font-medium text-slate-800">
                                {product.sale_price ? `R$ ${product.sale_price.toFixed(2)}` : '-'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                  {status.text}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                <Button variant="ghost" size="sm">
                                  Editar
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Entrada
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-600">
              Gerencie as categorias dos seus produtos de estoque
            </p>
            <Button size="sm" onClick={() => setShowAddCategory(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500">
                Nenhuma categoria cadastrada
              </div>
            ) : (
              categories.map((category) => {
                const productCount = products.filter(p => p.category_id === category.id).length;
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{category.name}</h3>
                          <p className="text-sm text-slate-500">
                            {productCount} produtos
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <Card>
          <CardHeader>
            <CardTitle>Movimentações de Estoque</CardTitle>
            <CardDescription>
              Histórico completo de entradas, saídas e ajustes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-center py-8">
              Funcionalidade em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle>Fornecedores</CardTitle>
            <CardDescription>
              Gerencie seus fornecedores de produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-center py-8">
              Funcionalidade em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CategoryModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSave={createCategory}
      />

      <ProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSave={createProduct}
        categories={categories}
        suppliers={suppliers}
        units={units}
      />
      </div>
    </MainLayout>
  );
}
