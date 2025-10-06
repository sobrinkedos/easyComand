# Requirements Document

## Introduction

Este documento define os requisitos para transformar o EasyComand em um sistema completo de gestão de atendimento para bares e restaurantes. O sistema incluirá fluxos completos para atendimento no balcão, gestão de mesas e comandas, interfaces especializadas para cozinha e bar, módulo de caixa, aplicativo mobile para garçons (Expo/React Native) e aplicativo web para pedidos dos clientes via QR Code. A interface será moderna e profissional, com menu lateral esquerdo, cores e fontes adequadas ao segmento gastronômico.

## Requirements

### Requirement 1: Sistema de Atendimento no Balcão

**User Story:** Como atendente do balcão, quero registrar pedidos para pagamento imediato, para que clientes possam fazer pedidos rápidos sem ocupar mesas.

#### Critérios de Aceitação

1. QUANDO o atendente acessa o módulo de balcão ENTÃO o sistema DEVE exibir interface simplificada para criação rápida de pedidos
2. QUANDO o atendente adiciona produtos ao pedido ENTÃO o sistema DEVE calcular automaticamente o total com impostos e taxas
3. QUANDO o pedido é finalizado ENTÃO o sistema DEVE direcionar imediatamente para tela de pagamento
4. QUANDO o pagamento é confirmado ENTÃO o sistema DEVE enviar o pedido para cozinha/bar e imprimir comprovante
5. SE o cliente solicitar nota fiscal ENTÃO o sistema DEVE permitir inclusão de CPF/CNPJ antes do pagamento

### Requirement 2: Gestão de Mesas e Comandas

**User Story:** Como gerente, quero gerenciar mesas e suas comandas associadas, para que possa controlar a ocupação e os pedidos de cada mesa.

#### Critérios de Aceitação

1. QUANDO o usuário acessa o módulo de mesas ENTÃO o sistema DEVE exibir layout visual com status de cada mesa (disponível, ocupada, reservada)
2. QUANDO uma mesa é selecionada ENTÃO o sistema DEVE exibir todas as comandas vinculadas a ela
3. QUANDO o garçom abre uma comanda ENTÃO o sistema DEVE permitir vincular a uma mesa específica
4. QUANDO múltiplas comandas estão vinculadas a uma mesa ENTÃO o sistema DEVE permitir visualizar e gerenciar cada comanda independentemente
5. QUANDO uma mesa é liberada ENTÃO o sistema DEVE verificar se todas as comandas foram fechadas e pagas
6. SE existem comandas abertas ENTÃO o sistema DEVE alertar antes de liberar a mesa

### Requirement 3: Criação e Gestão de Comandas

**User Story:** Como garçom, quero criar e gerenciar comandas vinculadas a mesas, para que possa organizar os pedidos de cada grupo de clientes.

#### Critérios de Aceitação

1. QUANDO o garçom cria uma nova comanda ENTÃO o sistema DEVE solicitar número da mesa e nome/identificação do cliente
2. QUANDO a comanda é criada ENTÃO o sistema DEVE gerar número único de identificação
3. QUANDO produtos são adicionados à comanda ENTÃO o sistema DEVE atualizar o total em tempo real
4. QUANDO o garçom visualiza uma comanda ENTÃO o sistema DEVE exibir todos os itens, status de preparo e total acumulado
5. SE a comanda pertence a uma mesa com múltiplas comandas ENTÃO o sistema DEVE permitir transferir itens entre comandas
6. QUANDO a comanda é fechada ENTÃO o sistema DEVE calcular total final com taxas de serviço aplicáveis

### Requirement 4: Interface de Visualização de Pedidos - Bar

**User Story:** Como bartender, quero visualizar pedidos de bebidas em tempo real, para que possa preparar as bebidas na ordem correta e atualizar o status.

#### Critérios de Aceitação

1. QUANDO um pedido com bebidas é criado ENTÃO o sistema DEVE exibir automaticamente na interface do bar
2. QUANDO o bartender acessa a interface ENTÃO o sistema DEVE exibir pedidos ordenados por prioridade (tempo de espera, tipo de pedido)
3. QUANDO o bartender inicia preparo de um item ENTÃO o sistema DEVE permitir marcar como "em preparo"
4. QUANDO o item está pronto ENTÃO o sistema DEVE permitir marcar como "pronto" e notificar o garçom
5. SE um pedido é urgente ENTÃO o sistema DEVE destacar visualmente com cor diferenciada
6. QUANDO o bartender visualiza um item ENTÃO o sistema DEVE exibir mesa/comanda, observações especiais e tempo decorrido

### Requirement 5: Interface de Visualização de Pedidos - Cozinha

**User Story:** Como cozinheiro, quero visualizar pedidos de alimentos em tempo real, para que possa preparar os pratos na ordem correta e gerenciar o fluxo da cozinha.

#### Critérios de Aceitação

1. QUANDO um pedido com alimentos é criado ENTÃO o sistema DEVE exibir automaticamente na interface da cozinha
2. QUANDO o cozinheiro acessa a interface ENTÃO o sistema DEVE exibir pedidos agrupados por categoria (entrada, prato principal, sobremesa)
3. QUANDO o cozinheiro inicia preparo de um item ENTÃO o sistema DEVE permitir marcar como "em preparo" com timestamp
4. QUANDO o prato está pronto ENTÃO o sistema DEVE permitir marcar como "pronto" e notificar o garçom
5. SE um pedido ultrapassa tempo estimado ENTÃO o sistema DEVE alertar visualmente
6. QUANDO múltiplos itens da mesma mesa estão prontos ENTÃO o sistema DEVE agrupar para saída simultânea

### Requirement 6: Módulo de Caixa - Abertura e Fechamento

**User Story:** Como operador de caixa, quero abrir e fechar o caixa diariamente, para que possa controlar o fluxo de dinheiro e gerar relatórios de fechamento.

#### Critérios de Aceitação

1. QUANDO o operador inicia o turno ENTÃO o sistema DEVE solicitar abertura de caixa com valor inicial
2. QUANDO o caixa é aberto ENTÃO o sistema DEVE registrar data/hora, operador e valor inicial
3. QUANDO o operador encerra o turno ENTÃO o sistema DEVE exibir resumo de todas as transações do período
4. QUANDO o fechamento é solicitado ENTÃO o sistema DEVE calcular valor esperado vs valor informado
5. SE houver diferença entre valores ENTÃO o sistema DEVE registrar como sangria ou sobra
6. QUANDO o caixa é fechado ENTÃO o sistema DEVE gerar relatório detalhado com todas as movimentações
7. SE existem comandas abertas ENTÃO o sistema DEVE alertar antes de permitir fechamento

### Requirement 7: Módulo de Caixa - Gestão de Recebimentos

**User Story:** Como operador de caixa, quero registrar todos os recebimentos de pagamentos, para que possa controlar as formas de pagamento e valores recebidos.

#### Critérios de Aceitação

1. QUANDO um pagamento é processado ENTÃO o sistema DEVE registrar forma de pagamento (dinheiro, cartão, PIX, etc.)
2. QUANDO o pagamento é em dinheiro ENTÃO o sistema DEVE calcular troco automaticamente
3. QUANDO o pagamento é parcelado ENTÃO o sistema DEVE registrar número de parcelas e valores
4. QUANDO múltiplas formas de pagamento são usadas ENTÃO o sistema DEVE permitir divisão do valor total
5. SE o pagamento é cancelado ENTÃO o sistema DEVE registrar estorno com justificativa
6. QUANDO um recebimento é registrado ENTÃO o sistema DEVE atualizar saldo do caixa em tempo real

### Requirement 8: Módulo de Caixa - Gestão de Pagamentos

**User Story:** Como operador de caixa, quero registrar pagamentos a fornecedores e despesas, para que possa controlar saídas de dinheiro do caixa.

#### Critérios de Aceitação

1. QUANDO uma despesa é registrada ENTÃO o sistema DEVE solicitar categoria, valor, descrição e forma de pagamento
2. QUANDO um pagamento a fornecedor é feito ENTÃO o sistema DEVE vincular ao fornecedor cadastrado
3. QUANDO uma sangria é realizada ENTÃO o sistema DEVE registrar valor, motivo e responsável
4. QUANDO um pagamento é registrado ENTÃO o sistema DEVE deduzir do saldo do caixa
5. SE o saldo é insuficiente ENTÃO o sistema DEVE alertar antes de permitir o pagamento
6. QUANDO pagamentos são listados ENTÃO o sistema DEVE permitir filtrar por período, categoria e tipo

### Requirement 9: Aplicativo Mobile para Garçons (Expo/React Native)

**User Story:** Como garçom, quero usar um aplicativo mobile para registrar pedidos nas mesas, para que possa atender clientes de forma ágil sem precisar ir até o computador.

#### Critérios de Aceitação

1. QUANDO o garçom faz login no app ENTÃO o sistema DEVE autenticar e carregar dados do estabelecimento
2. QUANDO o garçom seleciona uma mesa ENTÃO o sistema DEVE exibir comandas abertas ou permitir criar nova
3. QUANDO o garçom adiciona itens ao pedido ENTÃO o sistema DEVE permitir buscar produtos, adicionar observações e quantidades
4. QUANDO o pedido é enviado ENTÃO o sistema DEVE sincronizar em tempo real com cozinha/bar
5. QUANDO o garçom visualiza suas mesas ENTÃO o sistema DEVE exibir status de cada pedido (aguardando, em preparo, pronto)
6. SE um item está pronto ENTÃO o sistema DEVE notificar o garçom via push notification
7. QUANDO o app está offline ENTÃO o sistema DEVE armazenar pedidos localmente e sincronizar quando reconectar

### Requirement 10: Aplicativo Web para Clientes (QR Code)

**User Story:** Como cliente, quero acessar o cardápio e fazer pedidos pelo meu celular através de QR Code na mesa, para que possa pedir sem esperar o garçom.

#### Critérios de Aceitação

1. QUANDO o cliente escaneia o QR Code ENTÃO o sistema DEVE abrir aplicação web com cardápio do estabelecimento
2. QUANDO o cliente acessa o cardápio ENTÃO o sistema DEVE identificar automaticamente a mesa pelo QR Code
3. QUANDO o cliente seleciona produtos ENTÃO o sistema DEVE permitir adicionar ao carrinho com observações
4. QUANDO o cliente finaliza o pedido ENTÃO o sistema DEVE vincular automaticamente à comanda da mesa
5. SE a mesa não tem comanda aberta ENTÃO o sistema DEVE criar automaticamente uma nova comanda
6. QUANDO o pedido é enviado ENTÃO o sistema DEVE notificar o garçom e enviar para cozinha/bar
7. QUANDO o cliente visualiza o pedido ENTÃO o sistema DEVE exibir status de preparo em tempo real
8. SE o estabelecimento permite ENTÃO o sistema DEVE permitir solicitar a conta pelo app

### Requirement 11: Interface Moderna e Profissional

**User Story:** Como usuário do sistema, quero uma interface moderna e atraente, para que a experiência de uso seja agradável e profissional.

#### Critérios de Aceitação

1. QUANDO o usuário acessa qualquer tela ENTÃO o sistema DEVE exibir menu lateral esquerdo fixo com navegação
2. QUANDO o usuário visualiza a interface ENTÃO o sistema DEVE usar paleta de cores adequada ao segmento gastronômico (tons terrosos, verdes, laranjas)
3. QUANDO o usuário interage com elementos ENTÃO o sistema DEVE fornecer feedback visual (hover, loading, transições suaves)
4. QUANDO o usuário acessa em diferentes dispositivos ENTÃO o sistema DEVE adaptar layout responsivamente
5. SE o usuário está em tela pequena ENTÃO o sistema DEVE colapsar menu lateral em hamburguer
6. QUANDO o usuário visualiza dados ENTÃO o sistema DEVE usar tipografia clara e hierarquia visual adequada
7. QUANDO o usuário realiza ações ENTÃO o sistema DEVE exibir confirmações e mensagens de sucesso/erro de forma não intrusiva

### Requirement 12: Menu Lateral de Navegação

**User Story:** Como usuário do sistema, quero navegar facilmente entre os módulos através de menu lateral, para que possa acessar rapidamente as funcionalidades.

#### Critérios de Aceitação

1. QUANDO o usuário acessa o sistema ENTÃO o sistema DEVE exibir menu lateral esquerdo com todos os módulos disponíveis
2. QUANDO o usuário visualiza o menu ENTÃO o sistema DEVE destacar o módulo ativo
3. QUANDO o usuário clica em um item do menu ENTÃO o sistema DEVE navegar para o módulo correspondente
4. QUANDO o usuário tem permissões limitadas ENTÃO o sistema DEVE exibir apenas módulos autorizados
5. SE o usuário está em tela pequena ENTÃO o sistema DEVE permitir expandir/colapsar menu
6. QUANDO o menu está colapsado ENTÃO o sistema DEVE exibir apenas ícones com tooltips
7. QUANDO o usuário passa mouse sobre item ENTÃO o sistema DEVE exibir descrição do módulo

### Requirement 13: Sincronização em Tempo Real

**User Story:** Como usuário do sistema, quero que todas as atualizações sejam refletidas em tempo real, para que todos os dispositivos estejam sempre sincronizados.

#### Critérios de Aceitação

1. QUANDO um pedido é criado em qualquer dispositivo ENTÃO o sistema DEVE atualizar automaticamente todas as interfaces conectadas
2. QUANDO o status de um item muda ENTÃO o sistema DEVE notificar todos os usuários relevantes em tempo real
3. QUANDO uma mesa é ocupada/liberada ENTÃO o sistema DEVE atualizar layout de mesas em todos os dispositivos
4. QUANDO um pagamento é processado ENTÃO o sistema DEVE atualizar saldo do caixa instantaneamente
5. SE a conexão é perdida ENTÃO o sistema DEVE indicar status offline e tentar reconectar automaticamente
6. QUANDO a conexão é restabelecida ENTÃO o sistema DEVE sincronizar todas as alterações pendentes

### Requirement 14: Controle de Permissões por Módulo

**User Story:** Como gerente, quero controlar quais módulos cada funcionário pode acessar, para que cada um tenha acesso apenas às funcionalidades necessárias para seu trabalho.

#### Critérios de Aceitação

1. QUANDO um usuário faz login ENTÃO o sistema DEVE carregar permissões baseadas em seu papel (role)
2. QUANDO o usuário tenta acessar um módulo ENTÃO o sistema DEVE verificar se possui permissão
3. SE o usuário não tem permissão ENTÃO o sistema DEVE exibir mensagem de acesso negado
4. QUANDO o gerente configura permissões ENTÃO o sistema DEVE permitir habilitar/desabilitar módulos por papel
5. QUANDO permissões são alteradas ENTÃO o sistema DEVE aplicar mudanças imediatamente para usuários online
6. QUANDO o usuário visualiza menu ENTÃO o sistema DEVE exibir apenas módulos para os quais tem permissão

### Requirement 15: Relatórios e Dashboard Analítico

**User Story:** Como gerente, quero visualizar relatórios e métricas do estabelecimento, para que possa tomar decisões baseadas em dados.

#### Critérios de Aceitação

1. QUANDO o gerente acessa o dashboard ENTÃO o sistema DEVE exibir métricas principais (vendas do dia, mesas ocupadas, ticket médio)
2. QUANDO o gerente visualiza relatórios ENTÃO o sistema DEVE permitir filtrar por período (dia, semana, mês, customizado)
3. QUANDO o gerente analisa vendas ENTÃO o sistema DEVE exibir gráficos de vendas por período, categoria e produto
4. QUANDO o gerente verifica desempenho ENTÃO o sistema DEVE exibir produtos mais vendidos e horários de pico
5. SE o gerente solicita relatório financeiro ENTÃO o sistema DEVE gerar com receitas, despesas e lucro líquido
6. QUANDO o gerente exporta relatório ENTÃO o sistema DEVE permitir download em PDF e Excel
