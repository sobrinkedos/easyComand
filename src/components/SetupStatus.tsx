import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface StatusItem {
  label: string;
  status: 'success' | 'warning' | 'info';
  value?: string | number;
}

export function SetupStatus() {
  const databaseStatus: StatusItem[] = [
    { label: 'Tabelas criadas', status: 'success', value: 26 },
    { label: 'Funções de segurança', status: 'success', value: 5 },
    { label: 'Políticas RLS', status: 'success', value: 37 },
    { label: 'Tipos Enum', status: 'success', value: 21 },
  ];

  const seedData: StatusItem[] = [
    { label: 'Tipos de estabelecimento', status: 'success', value: 8 },
    { label: 'Planos de assinatura', status: 'success', value: 3 },
    { label: 'Papéis (roles)', status: 'success', value: 6 },
    { label: 'Permissões', status: 'success', value: 15 },
  ];

  const securityStatus: StatusItem[] = [
    { label: 'Row Level Security', status: 'success', value: 'Habilitado' },
    { label: 'Multi-tenancy', status: 'success', value: 'Configurado' },
    { label: 'Avisos de segurança', status: 'warning', value: 2 },
  ];

  const getIcon = (status: StatusItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const StatusSection = ({ title, items }: { title: string; items: StatusItem[] }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(item.status)}
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
            {item.value && (
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ✅ Configuração Completa
        </h2>
        <p className="text-gray-600">
          O ambiente está configurado e pronto para desenvolvimento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusSection title="Banco de Dados" items={databaseStatus} />
        <StatusSection title="Dados Iniciais" items={seedData} />
        <StatusSection title="Segurança" items={securityStatus} />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 Próximos Passos
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Implementar interface de cadastro e login</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Criar dashboard principal do sistema</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Implementar gestão de estabelecimentos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Configurar proteção contra senhas vazadas no Supabase Auth</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Consulte o arquivo <code className="bg-gray-100 px-2 py-1 rounded">SETUP.md</code> para mais detalhes
        </p>
      </div>
    </div>
  );
}
