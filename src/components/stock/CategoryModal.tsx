import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Label } from '../ui';
import type { StockCategory } from '../../hooks/useStock';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<StockCategory>) => Promise<void>;
  category?: StockCategory;
}

const EMOJI_OPTIONS = ['🥤', '🍺', '💧', '🍷', '⚡', '🍿', '🥟', '🍫', '🧂', '🥤'];
const COLOR_OPTIONS = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#8B5CF6', // purple
  '#EF4444', // red
  '#F97316', // orange
  '#10B981', // green
  '#EC4899', // pink
  '#6B7280', // gray
  '#64748B'  // slate
];

const initialFormData = {
  name: '',
  description: '',
  icon: '📦',
  color: '#3B82F6'
};

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetar formulário quando o modal abre/fecha ou quando a categoria muda
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Modo edição - preencher com dados da categoria
        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '📦',
          color: category.color || '#3B82F6'
        });
      } else {
        // Modo criação - limpar formulário
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campo obrigatório
      if (!formData.name) {
        setError('O nome da categoria é obrigatório');
        setLoading(false);
        return;
      }

      console.log('Salvando categoria:', formData);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao salvar categoria. Tente novamente.';
      
      if (err?.message?.includes('unique_category_name_per_establishment')) {
        errorMessage = 'Já existe uma categoria com este nome. Use um nome diferente.';
      } else if (err?.message?.includes('duplicate key')) {
        errorMessage = 'Já existe uma categoria com este nome.';
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <Label htmlFor="name">Nome da Categoria *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Refrigerantes"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição opcional da categoria"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Ícone */}
          <div>
            <Label>Ícone</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`h-12 w-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-all ${
                    formData.icon === emoji
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <Label>Cor</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-12 w-12 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-slate-800 scale-110'
                      : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{formData.name || 'Nome da Categoria'}</p>
                <p className="text-sm text-slate-500">{formData.description || 'Descrição'}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
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
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
