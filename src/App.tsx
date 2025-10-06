import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { testSupabaseConnection, checkMigrations } from './lib/test-connection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from './components/ui';
import { LoadingSpinner } from './components/ui/loading';
import { SupabaseMCPDemo } from './components/SupabaseMCPDemo';
import { AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './components/dashboard/Dashboard';
import { DesignSystemShowcase } from './components/design-system/DesignSystemShowcase';
import { ComingSoon } from './components/pages/ComingSoon';
import { CheckCircle, XCircle, AlertTriangle, Database, Globe, Settings, Zap } from 'lucide-react';

function Home() {
  const [connectionStatus, setConnectionStatus] = useState<{
    supabase: any;
    migrations: any;
    loading: boolean;
  }>({ supabase: null, migrations: null, loading: true });

  useEffect(() => {
    async function checkConnection() {
      console.log('🔍 Verificando status da aplicação...');
      
      const supabaseResult = await testSupabaseConnection();
      const migrationsResult = await checkMigrations();
      
      setConnectionStatus({
        supabase: supabaseResult,
        migrations: migrationsResult,
        loading: false
      });
    }
    
    checkConnection();
  }, []);

  // Verificar se Supabase está configurado corretamente
  // const isSupabaseConfigured = connectionStatus.supabase?.success || 
  //   (connectionStatus.supabase?.error && 
  //    !connectionStatus.supabase.error.includes('Invalid supabaseUrl'));

  // const needsSupabaseSetup = connectionStatus.supabase?.error && 
  //   connectionStatus.supabase.error.includes('Invalid supabaseUrl');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            🍽️ EasyComand
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Sistema de Gestão para Restaurantes e Bares
          </p>
          <p className="text-slate-500">
            Desenvolvido com React + TypeScript + Supabase + Tailwind CSS
          </p>
        </div>
        
        {/* Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Status da Aplicação */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Status da Aplicação
              </CardTitle>
              <CardDescription>
                Verificando configurações e conexões do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionStatus.loading ? (
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner size="lg" className="mr-2" />
                  <span className="text-lg">Verificando conexões...</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Status Supabase */}
                  <div className={`p-4 rounded-lg border-2 ${
                    connectionStatus.supabase?.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {connectionStatus.supabase?.success ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Conexão Supabase
                        </h3>
                        <p className={`text-sm mt-1 ${
                          connectionStatus.supabase?.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {connectionStatus.supabase?.message}
                        </p>
                        
                        {/* Instruções específicas se Supabase não estiver configurado */}
                        {connectionStatus.supabase?.error && 
                         connectionStatus.supabase.error.includes('Invalid supabaseUrl') && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <h4 className="font-medium text-yellow-800 mb-2">🔧 Configuração Necessária</h4>
                            <p className="text-sm text-yellow-700 mb-2">
                              Configure as variáveis de ambiente para conectar ao Supabase:
                            </p>
                            <ol className="text-xs text-yellow-700 space-y-1 ml-4 list-decimal">
                              <li>Copie <code className="bg-yellow-100 px-1 rounded">.env.example</code> para <code className="bg-yellow-100 px-1 rounded">.env</code></li>
                              <li>Edite <code className="bg-yellow-100 px-1 rounded">.env</code> com suas credenciais do Supabase</li>
                              <li>Veja <code className="bg-yellow-100 px-1 rounded">docs/supabase-configuration.md</code> para instruções</li>
                            </ol>
                            <div className="mt-2 flex gap-2">
                              <button 
                                onClick={() => {
                                  // Abrir documentação
                                  window.open('docs/supabase-configuration.md', '_blank');
                                }}
                                className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                              >
                                Ver Documentação
                              </button>
                              <button 
                                onClick={() => {
                                  // Tentar recarregar
                                  window.location.reload();
                                }}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Recarregar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Migrações */}
                  <div className={`p-4 rounded-lg border-2 ${
                    connectionStatus.migrations?.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {connectionStatus.migrations?.success ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Migrações do Banco
                        </h3>
                        <p className={`text-sm mt-1 ${
                          connectionStatus.migrations?.success ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {connectionStatus.migrations?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Card de Documentação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentação</CardTitle>
              <CardDescription>
                Guias e referências do projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📝 Guia de Configuração Supabase
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📦 Scripts de Desenvolvimento
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Planejamento do Projeto
              </Button>
            </CardContent>
          </Card>
          
          {/* Card de Próximos Passos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Próximos Passos</CardTitle>
              <CardDescription>
                Etapas do desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="line-through text-slate-500">Configurar ambiente</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded-full border-2 border-blue-500 bg-blue-100" />
                  <span className="font-medium">Sistema de autenticação</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  <span>Dashboard principal</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  <span>Gestão de estabelecimentos</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Tecnologias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚙️ Stack Tecnológica</CardTitle>
              <CardDescription>
                Tecnologias utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  React 18
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full" />
                  TypeScript
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  Vite
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-teal-500 rounded-full" />
                  Tailwind CSS
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Supabase
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full" />
                  React Query
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="px-8">
            🚀 Continuar Desenvolvimento
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <a href="/auth">
              🔐 Entrar / Cadastrar
            </a>
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <a href="/mcp-demo">
              <Zap className="mr-2 h-4 w-4" />
              Demo MCP Supabase
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function MCPDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <a href="/">← Voltar ao Início</a>
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Demonstração Supabase MCP
          </h1>
          <p className="text-slate-600">
            Interface padronizada para operações com Supabase usando Model Context Protocol
          </p>
        </div>
        <SupabaseMCPDemo />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } />
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordForm />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordForm />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/design-system" element={
          <ProtectedRoute>
            <DesignSystemShowcase />
          </ProtectedRoute>
        } />
        <Route path="/balcao" element={
          <ProtectedRoute>
            <ComingSoon title="Balcão" description="Sistema de atendimento rápido no balcão" icon="🛒" />
          </ProtectedRoute>
        } />
        <Route path="/mesas" element={
          <ProtectedRoute>
            <ComingSoon title="Mesas" description="Gestão de mesas e comandas" icon="🪑" />
          </ProtectedRoute>
        } />
        <Route path="/cozinha" element={
          <ProtectedRoute>
            <ComingSoon title="Cozinha" description="Interface de visualização para a cozinha" icon="👨‍🍳" />
          </ProtectedRoute>
        } />
        <Route path="/bar" element={
          <ProtectedRoute>
            <ComingSoon title="Bar" description="Interface de visualização para o bar" icon="🍹" />
          </ProtectedRoute>
        } />
        <Route path="/caixa" element={
          <ProtectedRoute>
            <ComingSoon title="Caixa" description="Gestão de caixa e pagamentos" icon="💰" />
          </ProtectedRoute>
        } />
        <Route path="/cardapio" element={
          <ProtectedRoute>
            <ComingSoon title="Cardápio" description="Gestão de produtos e categorias" icon="📋" />
          </ProtectedRoute>
        } />
        <Route path="/estoque" element={
          <ProtectedRoute>
            <ComingSoon title="Estoque" description="Controle de estoque e inventário" icon="📦" />
          </ProtectedRoute>
        } />
        <Route path="/clientes" element={
          <ProtectedRoute>
            <ComingSoon title="Clientes" description="Gestão de clientes e fidelidade" icon="👥" />
          </ProtectedRoute>
        } />
        <Route path="/relatorios" element={
          <ProtectedRoute>
            <ComingSoon title="Relatórios" description="Análises e métricas do negócio" icon="📊" />
          </ProtectedRoute>
        } />
        <Route path="/configuracoes" element={
          <ProtectedRoute>
            <ComingSoon title="Configurações" description="Configurações do sistema" icon="⚙️" />
          </ProtectedRoute>
        } />
        <Route path="/mcp-demo" element={<MCPDemoPage />} />
        {/* Outras rotas serão adicionadas aqui */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
