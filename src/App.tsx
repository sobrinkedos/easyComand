import { Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Sistema de Gestão para Restaurantes e Bares
        </h1>
        <p className="text-lg text-gray-600">
          Estrutura do projeto configurada com sucesso!
        </p>
        <p className="mt-8 text-sm text-gray-500">
          Próximo passo: Construir a tela de Login e o Dashboard.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Outras rotas serão adicionadas aqui */}
    </Routes>
  );
}

export default App;
