# 🍽️ EasyComand - Sistema de Gestão para Restaurantes e Bares

**EasyComand** é uma aplicação full-stack multi-tenant para gestão completa de restaurantes e bares, construída com tecnologias modernas e foco em segurança, performance e escalabilidade.

## 🔐 **Sistema de Autenticação Implementado**

🎆 **Sistema completo de autenticação multi-tenant funcionando!**

### ✨ **Recursos de Autenticação**
- **Login/Cadastro**: Formulários completos com validação
- **Proteção de Rotas**: Acesso restrito a áreas privadas
- **Context Global**: Estado de autenticação reativo
- **Multi-tenant**: Isolamento por estabelecimento
- **Segurança**: Integração com Supabase Auth + RLS
- **UX Moderna**: Interface responsiva e acessível

### 📍 **Como Testar Autenticação**
1. Acesse http://localhost:5173
2. Clique em "🔐 Entrar / Cadastrar"
3. **Cadastre uma nova conta** ou faça login
4. Seja **redirecionado para o dashboard protegido**
5. Teste logout e verificação de proteção de rotas

### 📊 **Rotas Disponíveis**
- `/` - Página inicial (pública)
- `/auth` - Login/Cadastro (apenas não autenticados)
- `/dashboard` - Dashboard principal (🔒 protegido)
- `/mcp-demo` - Demo Supabase MCP (pública)

### 📄 **Documentação Técnica**
- Guia completo: `docs/authentication.md`
- Context: `src/contexts/AuthContext.tsx`
- Componentes: `src/components/auth/`

---

## 🔥 **Novidade: Supabase MCP**

🎆 **Model Context Protocol implementado!** O projeto agora possui uma camada de abstração avançada que padroniza todas as operações com o Supabase:

### ✨ **Recursos do MCP**
- **Interface Padronizada**: Operações CRUD simplificadas
- **Tratamento de Erros**: Respostas consistentes `{ success, data, error }`
- **Hooks React**: Integração nativa com React
- **TypeScript Completo**: Tipagem automática do banco
- **Multi-tenant Ready**: Preparado para isolamento de dados
- **Real-time**: Subscrições em tempo real simplificadas

### 📍 **Como Testar**
1. Acesse a aplicação em http://localhost:5173
2. Clique em "Demo MCP Supabase" na página inicial
3. Veja exemplos práticos de uso em ação

### 📄 **Documentação**
- Guia completo: `docs/supabase-mcp.md`
- Exemplos de código: `src/components/SupabaseMCPDemo.tsx`
- Hooks prontos: `src/hooks/useSupabaseMCP.ts`

---

## 🚀 Status do Projeto

### ✅ Concluído
- [x] Configuração do ambiente de desenvolvimento
- [x] Estrutura base do projeto com React + TypeScript + Vite
- [x] Configuração do Supabase e migrações do banco
- [x] **Supabase MCP (Model Context Protocol)** implementado
- [x] Biblioteca de componentes UI (Shadcn/ui)
- [x] Sistema de testes de conectividade
- [x] Interface inicial com dashboard de status
- [x] Hooks React para operações padronizadas
- [x] Demo prático do MCP funcionando
- [x] **🔐 Sistema de Autenticação Completo**
- [x] **🏠 Dashboard Principal Protegido**

### 🔄 Em Progresso
- [x] **🏠 Dashboard Principal** - Interface base implementada

### 📋 Próximas Etapas
- [ ] **🏢 Gestão de estabelecimentos** (cadastro, edição, configurações)
- [ ] Dashboard principal com navegação
- [ ] Sistema de usuários e permissões
- [ ] Gestão de mesas e ambientes
- [ ] Catálogo de produtos
- [ ] Sistema de pedidos
- [ ] Interface da cozinha
- [ ] Gestão de clientes
- [ ] Sistema de pagamentos
- [ ] Controle de estoque
- [ ] Relatórios e analytics

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** - Biblioteca para UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **React Router** - Navegação SPA
- **React Query** - Gerenciamento de estado server
- **React Hook Form** - Gerenciamento de formulários
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **Shadcn/ui** - Componentes UI

### Backend (Supabase)
- **PostgreSQL** - Banco de dados relacional
- **Supabase Auth** - Sistema de autenticação
- **Row Level Security** - Isolamento multi-tenant
- **Real-time** - Atualizações em tempo real

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **TypeScript** - Verificação de tipos
- **Netlify** - Deploy e CI/CD

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase
- Git

### Passos

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd easyComand
   ```

2. **Instale as dependências**
   
   **No Windows (recomendado):**
   ```cmd
   install-deps.bat
   ```
   
   **No terminal (pode requerer configuração adicional):**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env
   
   # Edite o arquivo .env com suas credenciais do Supabase
   # Veja docs/supabase-configuration.md para instruções detalhadas
   ```

4. **Configure o projeto Supabase**
   - Siga o guia em `docs/supabase-configuration.md`
   - Aplique as migrações em `supabase/migrations/`

5. **Inicie o servidor de desenvolvimento**
   
   **No Windows (recomendado):**
   ```cmd
   start-dev.bat
   ```
   
   **No terminal (pode requerer configuração adicional):**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**
   - Abra http://localhost:5175 no navegador
   - O dashboard mostrará o status das conexões

### 🛠️ Troubleshooting

Se encontrar o erro **"Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"**:

1. **Verifique o arquivo `.env`**:
   ```bash
   # Verifique se as variáveis estão configuradas
   cat .env
   ```

2. **Certifique-se de que a URL está correta**:
   ```env
   # ✅ CORRETO
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

3. **Use os scripts de verificação**:
   ```bash
   # Verificar configuração
   npm run check:env
   
   # Ou configure interativamente
   npm run setup:supabase
   ```

**Se os comandos `npm run dev` ou `npm install` não funcionarem no Windows:**

1. **Use os scripts batch fornecidos**:
   ```cmd
   # Para instalar dependências
   install-deps.bat
   
   # Para iniciar o servidor de desenvolvimento
   start-dev.bat
   ```

2. **Ou configure manualmente a política de execução**:
   ```powershell
   # Executar no PowerShell como administrador
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Consulte a documentação completa**:
   - `docs/supabase-configuration.md` - Configuração do Supabase
   - `docs/troubleshooting.md` - Solução de problemas

## 📁 Estrutura do Projeto

```
easyComand/
├── src/                          # Código-fonte
│   ├── components/               # Componentes React
│   │   └── ui/                  # Componentes UI reutilizáveis
│   ├── lib/                     # Utilitários e configurações
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── utils.ts             # Funções utilitárias
│   │   └── test-connection.ts   # Testes de conectividade
│   ├── App.tsx                  # Componente principal
│   └── main.tsx                 # Ponto de entrada
├── supabase/                    # Configurações do Supabase
│   ├── migrations/              # Scripts SQL de migração
│   ├── seed-data.sql           # Dados iniciais
│   └── verify-setup.sql        # Verificação da configuração
├── docs/                        # Documentação
│   ├── supabase-setup.md       # Guia de configuração
│   └── planejamento.md         # Planejamento detalhado
├── scripts/                     # Scripts auxiliares
│   └── setup.ps1               # Script de configuração PowerShell
└── package.json                # Dependências e scripts
```

## 🔐 Arquitetura de Segurança

### Multi-Tenant com Row Level Security (RLS)
- Cada estabelecimento possui dados isolados
- Políticas RLS garantem acesso apenas aos dados do próprio estabelecimento
- Autenticação via Supabase Auth
- Sistema de papéis e permissões granulares

### Fluxo de Autenticação
1. Usuário faz login via Supabase Auth
2. Trigger sincroniza dados com tabela `public.users`
3. RLS aplica automaticamente filtros por `establishment_id`
4. Frontend recebe apenas dados autorizados

## 📊 Funcionalidades Planejadas

### Gestão Operacional
- **Mesas e Ambientes**: Organização visual do estabelecimento
- **Pedidos**: Criação, edição e acompanhamento em tempo real
- **Cardápio**: Produtos, categorias, preços e variações
- **Cozinha**: Interface para preparo e controle de tempo

### Gestão Comercial
- **Clientes**: Cadastro, histórico e programa de fidelidade
- **Pagamentos**: Múltiplas formas, divisão de conta, descontos
- **Estoque**: Controle de ingredientes e movimentações
- **Relatórios**: Vendas, produtos, performance financeira

### Gestão Administrativa
- **Usuários**: Funcionários, papéis e permissões
- **Estabelecimento**: Configurações, horários, dados fiscais
- **Analytics**: Dashboard com métricas e insights

## 🤝 Contribuição

Este projeto segue um planejamento estruturado. Para contribuir:

1. Consulte o arquivo `docs/planejamento.md`
2. Verifique as tarefas em progresso
3. Siga os padrões de código estabelecidos
4. Mantenha a documentação atualizada

## 📜 Licença

Este projeto foi desenvolvido como parte de um sistema de gestão comercial.

---

**Desenvolvido com ❤️ por Rilton Oliveira de Souza**  
**E-mail**: riltons@bb.com.br