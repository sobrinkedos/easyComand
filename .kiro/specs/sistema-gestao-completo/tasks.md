# Plano de Implementação - Sistema de Gestão Completo

## Visão Geral

Este plano divide a implementação em tarefas incrementais, priorizando funcionalidades core e construindo sobre a base existente. Cada tarefa é independente e testável.

## Tasks

- [x] 1. Configurar Design System e Layout Base





  - Implementar paleta de cores gastronômica no Tailwind config
  - Criar componente de Menu Lateral com navegação
  - Implementar layout responsivo com menu colapsável
  - Adicionar fontes Poppins e Inter ao projeto
  - Criar componentes base do design system (Cards, Badges, Status indicators)
  - _Requisitos: 11, 12_

- [ ] 2. Estender Schema do Banco de Dados
  - Criar migration para tabela `tabs` (comandas)
  - Criar migration para tabelas de caixa (`cash_sessions`, `cash_movements`, `payments`)
  - Criar migration para tabela `user_devices` (push notifications)
  - Adicionar coluna `tab_id` na tabela `orders`
  - Configurar políticas RLS para novas tabelas
  - Criar funções auxiliares SQL necessárias
  - _Requisitos: 2, 3, 6, 7, 8_

- [ ] 3. Implementar Sistema de Permissões no Frontend
  - Criar hook `usePermission` para verificar permissões do usuário
  - Criar componente `ProtectedRoute` baseado em permissões
  - Criar componente `ProtectedComponent` para elementos condicionais
  - Implementar filtro de menu baseado em permissões
  - Adicionar indicadores visuais de permissões negadas
  - _Requisitos: 14_

- [ ] 4. Módulo de Atendimento no Balcão
  - Criar página principal do módulo balcão
  - Implementar grid de produtos com busca e filtros
  - Criar componente de resumo do pedido (carrinho)
  - Implementar lógica de cálculo de totais (subtotal, taxas, descontos)
  - Criar modal de pagamento com múltiplas formas
  - Implementar fluxo completo: criar pedido → adicionar itens → pagar → enviar para cozinha
  - Adicionar opção de incluir CPF/CNPJ para nota fiscal
  - Integrar com impressora (opcional)
  - _Requisitos: 1_

- [ ] 5. Módulo de Gestão de Mesas
  - Criar visualização de layout do salão (floor plan)
  - Implementar componente de card de mesa com status visual
  - Criar modal de detalhes da mesa
  - Implementar ações: ocupar mesa, liberar mesa, marcar manutenção
  - Adicionar filtros por ambiente e status
  - Implementar atualização em tempo real do status das mesas
  - _Requisitos: 2_

- [ ] 6. Sistema de Comandas
  - Criar interface para abrir nova comanda vinculada a mesa
  - Implementar listagem de comandas de uma mesa
  - Criar tela de detalhes da comanda com todos os pedidos
  - Implementar adição de itens à comanda
  - Criar funcionalidade de transferir itens entre comandas
  - Implementar fechamento de comanda com cálculo de totais
  - Adicionar validação: não permitir liberar mesa com comandas abertas
  - Integrar sincronização em tempo real
  - _Requisitos: 3_

- [ ] 7. Interface de Visualização - Cozinha
  - Criar página da interface da cozinha
  - Implementar layout Kanban (Pendente, Preparando, Pronto)
  - Criar card de pedido com informações (mesa, comanda, tempo decorrido)
  - Implementar ações: iniciar preparo, marcar como pronto
  - Adicionar indicador visual de prioridade (pedidos urgentes)
  - Implementar alertas visuais para pedidos atrasados
  - Adicionar agrupamento de itens da mesma mesa
  - Configurar alertas sonoros para novos pedidos
  - Integrar atualização em tempo real via Supabase Realtime
  - _Requisitos: 5_

- [ ] 8. Interface de Visualização - Bar
  - Criar página da interface do bar (similar à cozinha)
  - Implementar fila de pedidos de bebidas
  - Criar card de bebida com detalhes e status
  - Implementar ações: iniciar preparo, marcar como pronto
  - Adicionar filtro por tipo de bebida
  - Implementar notificação para garçom quando pronto
  - Integrar atualização em tempo real
  - _Requisitos: 4_

- [ ] 9. Módulo de Caixa - Abertura e Fechamento
  - Criar página principal do módulo caixa
  - Implementar formulário de abertura de caixa com valor inicial
  - Criar dashboard de sessão ativa (saldo atual, movimentações)
  - Implementar tela de fechamento com resumo de transações
  - Criar cálculo de diferença (esperado vs informado)
  - Implementar registro de sangrias e sobras
  - Gerar relatório de fechamento em PDF
  - Adicionar validação: alertar se existem comandas abertas
  - _Requisitos: 6_

- [ ] 10. Módulo de Caixa - Gestão de Recebimentos
  - Criar interface de processamento de pagamentos
  - Implementar seleção de múltiplas formas de pagamento
  - Criar cálculo automático de troco para dinheiro
  - Implementar registro de pagamentos parcelados
  - Adicionar funcionalidade de divisão de conta
  - Criar fluxo de estorno com justificativa
  - Atualizar saldo do caixa em tempo real
  - Vincular pagamentos à sessão de caixa ativa
  - _Requisitos: 7_

- [ ] 11. Módulo de Caixa - Gestão de Pagamentos e Despesas
  - Criar formulário de registro de despesas
  - Implementar cadastro de pagamento a fornecedores
  - Criar funcionalidade de sangria com motivo e responsável
  - Implementar validação de saldo antes de permitir pagamento
  - Adicionar filtros de movimentações (período, categoria, tipo)
  - Criar listagem de todas as movimentações da sessão
  - Deduzir automaticamente do saldo do caixa
  - _Requisitos: 8_

- [ ] 12. Dashboard e Relatórios
  - Criar página de dashboard com métricas principais
  - Implementar cards de KPIs (vendas do dia, mesas ocupadas, ticket médio)
  - Criar gráficos de vendas por período usando Recharts
  - Implementar filtros de período (dia, semana, mês, customizado)
  - Criar relatório de produtos mais vendidos
  - Implementar análise de horários de pico
  - Criar relatório financeiro (receitas, despesas, lucro)
  - Adicionar funcionalidade de exportação (PDF, Excel)
  - _Requisitos: 15_

- [ ] 13. Configurar Projeto Mobile - App Garçom
  - Inicializar projeto Expo com TypeScript
  - Configurar navegação com React Navigation
  - Instalar e configurar dependências (Supabase, NativeWind, etc)
  - Configurar variáveis de ambiente
  - Criar estrutura de pastas do projeto
  - Configurar ESLint e Prettier
  - Implementar tela de splash e ícone do app
  - _Requisitos: 9_

- [ ] 14. App Garçom - Autenticação e Setup
  - Criar tela de login
  - Implementar autenticação com Supabase
  - Criar hook de autenticação
  - Implementar persistência de sessão
  - Criar tela inicial (home) com resumo
  - Adicionar logout
  - _Requisitos: 9_

- [ ] 15. App Garçom - Visualização de Mesas
  - Criar tela de listagem de mesas
  - Implementar filtros por status e ambiente
  - Criar card de mesa com informações resumidas
  - Adicionar navegação para detalhes da mesa
  - Implementar atualização em tempo real
  - _Requisitos: 9_

- [ ] 16. App Garçom - Gestão de Comandas
  - Criar tela de detalhes da mesa com comandas
  - Implementar criação de nova comanda
  - Criar tela de detalhes da comanda
  - Adicionar visualização de itens e status
  - Implementar navegação para adicionar pedido
  - _Requisitos: 9_

- [ ] 17. App Garçom - Criação de Pedidos
  - Criar tela de busca de produtos
  - Implementar filtros por categoria
  - Criar card de produto com detalhes
  - Implementar seleção de variações
  - Criar carrinho de pedido
  - Adicionar campo de observações
  - Implementar envio do pedido
  - _Requisitos: 9_

- [ ] 18. App Garçom - Notificações e Sincronização
  - Configurar Expo Notifications
  - Implementar solicitação de permissões
  - Criar listener de notificações
  - Implementar notificação quando pedido está pronto
  - Configurar detecção de conectividade
  - Implementar fila de sincronização offline
  - Criar indicador visual de status online/offline
  - Sincronizar dados pendentes ao reconectar
  - _Requisitos: 9, 13_

- [ ] 19. Configurar App Web Cliente (PWA)
  - Criar projeto React separado para cliente
  - Configurar PWA com service workers
  - Implementar manifest.json
  - Configurar cache offline
  - Criar estrutura de rotas
  - Implementar extração de parâmetros do QR Code
  - _Requisitos: 10_

- [ ] 20. App Cliente - Visualização de Cardápio
  - Criar página de cardápio
  - Implementar listagem de produtos por categoria
  - Criar card de produto com imagem e detalhes
  - Adicionar filtros (vegetariano, vegano, sem glúten, etc)
  - Implementar busca de produtos
  - Criar modal de detalhes do produto
  - _Requisitos: 10_

- [ ] 21. App Cliente - Carrinho e Pedido
  - Criar componente de carrinho
  - Implementar adição/remoção de itens
  - Criar seleção de variações
  - Adicionar campo de observações
  - Implementar cálculo de total
  - Criar botão de finalizar pedido
  - Vincular pedido automaticamente à mesa
  - Criar comanda automaticamente se não existir
  - _Requisitos: 10_

- [ ] 22. App Cliente - Acompanhamento de Pedido
  - Criar tela de acompanhamento
  - Implementar visualização de status em tempo real
  - Adicionar indicador de tempo estimado
  - Criar botão de chamar garçom
  - Implementar notificações de mudança de status
  - Adicionar opção de solicitar conta (se habilitado)
  - _Requisitos: 10_

- [ ] 23. Sistema de Geração de QR Codes
  - Criar página de gerenciamento de QR Codes
  - Implementar geração de QR Code por mesa
  - Criar URL única com establishment_id e table_id
  - Adicionar funcionalidade de download do QR Code
  - Criar opção de impressão em lote
  - Implementar regeneração de QR Codes
  - _Requisitos: 10_

- [ ] 24. Integração de Tempo Real - Supabase Realtime
  - Configurar channels do Supabase Realtime
  - Implementar subscription para tabela `orders`
  - Criar subscription para tabela `order_items`
  - Implementar subscription para tabela `tables`
  - Criar subscription para tabela `tabs`
  - Adicionar invalidação de cache do React Query
  - Implementar reconexão automática
  - Adicionar indicador de status de conexão
  - _Requisitos: 13_

- [ ] 25. Sistema de Notificações Push
  - Configurar servidor de notificações (Expo Push)
  - Criar função para enviar notificação quando pedido está pronto
  - Implementar notificação para novo pedido (cozinha/bar)
  - Criar notificação para garçom quando cliente chama
  - Adicionar notificação de comanda fechada
  - Implementar gerenciamento de tokens de dispositivos
  - _Requisitos: 9, 13_

- [ ] 26. Otimizações de Performance
  - Implementar code splitting por rota
  - Configurar lazy loading de componentes
  - Otimizar queries do Supabase (select específico)
  - Implementar paginação em listagens grandes
  - Configurar cache do React Query
  - Adicionar debounce em buscas
  - Otimizar renderização de listas (virtualization)
  - Comprimir imagens de produtos
  - _Requisitos: Todos_

- [ ] 27. Testes e Validações
  - Criar testes unitários para componentes críticos
  - Implementar testes de hooks customizados
  - Criar testes de integração para fluxos principais
  - Adicionar validações com Zod em todos os formulários
  - Implementar sanitização de inputs
  - Criar testes E2E para fluxos críticos
  - Testar sincronização em tempo real
  - Validar funcionamento offline do app mobile
  - _Requisitos: Todos_

- [ ] 28. Documentação e Deploy
  - Criar documentação de uso do sistema
  - Documentar APIs e hooks
  - Criar guia de instalação do app mobile
  - Documentar processo de geração de QR Codes
  - Configurar CI/CD no GitHub Actions
  - Configurar deploy do web app (Netlify/Vercel)
  - Publicar app mobile nas stores (opcional)
  - Criar guia de troubleshooting
  - _Requisitos: Todos_
