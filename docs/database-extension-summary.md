# Resumo da Extensão do Schema do Banco de Dados

## Data de Implementação
05/01/2025

## Migration Aplicada
`20250105000003_extend_schema_tabs_cash_devices.sql`

## Objetivo
Estender o schema do banco de dados para suportar os novos módulos do sistema:
- Sistema de comandas (tabs)
- Módulo de caixa completo (cash_sessions, cash_movements, payments)
- Push notifications (user_devices)

## Tabelas Criadas

### 1. `tabs` - Comandas
Gerencia comandas vinculadas a mesas, permitindo múltiplas comandas por mesa e controle de consumo individual.

**Colunas principais:**
- `id`: Identificador único
- `establishment_id`: Vínculo com estabelecimento
- `tab_number`: Número único da comanda
- `table_id`: Mesa vinculada (opcional)
- `customer_name`: Nome do cliente
- `waiter_id`: Garçom responsável
- `status`: Status da comanda (open, closed, paid)
- `subtotal`, `service_fee_amount`, `discount_amount`, `total_amount`: Valores financeiros
- `opened_at`, `closed_at`: Timestamps de abertura e fechamento

**Índices criados:**
- `idx_tabs_establishment_id`
- `idx_tabs_table_id`
- `idx_tabs_status`
- `idx_tabs_waiter_id`

### 2. `cash_sessions` - Sessões de Caixa
Controla abertura e fechamento de caixa diário.

**Colunas principais:**
- `id`: Identificador único
- `establishment_id`: Vínculo com estabelecimento
- `operator_id`: Operador responsável
- `opening_amount`: Valor inicial
- `closing_amount`: Valor final
- `expected_amount`: Valor esperado
- `difference_amount`: Diferença (sobra/falta)
- `status`: Status da sessão (open, closed)
- `opened_at`, `closed_at`: Timestamps

**Índices criados:**
- `idx_cash_sessions_establishment_id`
- `idx_cash_sessions_operator_id`
- `idx_cash_sessions_status`
- `idx_cash_sessions_opened_at`

### 3. `cash_movements` - Movimentações de Caixa
Registra todas as movimentações financeiras do caixa.

**Colunas principais:**
- `id`: Identificador único
- `cash_session_id`: Sessão de caixa vinculada
- `establishment_id`: Vínculo com estabelecimento
- `type`: Tipo de movimentação (sale, withdrawal, reinforcement, cancellation, expense)
- `amount`: Valor da movimentação
- `description`: Descrição
- `payment_method`: Forma de pagamento
- `reference_type`: Tipo de referência (order, expense, withdrawal, payment)
- `reference_id`: ID da referência
- `created_by`: Usuário que criou

**Índices criados:**
- `idx_cash_movements_cash_session_id`
- `idx_cash_movements_establishment_id`
- `idx_cash_movements_type`
- `idx_cash_movements_created_at`

### 4. `payments` - Pagamentos
Registra pagamentos de pedidos e comandas com suporte a múltiplas formas de pagamento.

**Colunas principais:**
- `id`: Identificador único
- `establishment_id`: Vínculo com estabelecimento
- `order_id`: Pedido vinculado (opcional)
- `tab_id`: Comanda vinculada (opcional)
- `cash_session_id`: Sessão de caixa vinculada
- `total_amount`: Valor total
- `paid_amount`: Valor pago
- `change_amount`: Troco
- `cpf_cnpj`: CPF/CNPJ para nota fiscal
- `payment_methods`: JSON com métodos de pagamento
- `created_by`: Usuário que criou

**Formato do JSON payment_methods:**
```json
[
  {
    "type": "cash",
    "amount": 50.00,
    "installments": null
  },
  {
    "type": "credit_card",
    "amount": 30.00,
    "installments": 3
  }
]
```

**Índices criados:**
- `idx_payments_establishment_id`
- `idx_payments_order_id`
- `idx_payments_tab_id`
- `idx_payments_cash_session_id`
- `idx_payments_created_at`

### 5. `user_devices` - Dispositivos de Usuários
Armazena tokens de push notification para dispositivos móveis.

**Colunas principais:**
- `id`: Identificador único
- `user_id`: Usuário vinculado
- `push_token`: Token do Expo Push Notification ou FCM
- `platform`: Plataforma (ios, android, web)
- `device_name`: Nome do dispositivo
- `is_active`: Se o dispositivo está ativo
- `last_used_at`: Último uso

**Índices criados:**
- `idx_user_devices_user_id`
- `idx_user_devices_is_active`

## Alterações em Tabelas Existentes

### `orders`
- **Nova coluna:** `tab_id` (INT, nullable)
- **Propósito:** Vincular pedidos a comandas específicas
- **Índice criado:** `idx_orders_tab_id`

## Funções Auxiliares SQL Criadas

### 1. `calculate_tab_total(tab_id_param INT)`
Calcula os totais de uma comanda (subtotal, taxa de serviço, desconto, total).

**Retorna:**
```sql
TABLE (
    subtotal DECIMAL(10, 2),
    service_fee DECIMAL(10, 2),
    discount DECIMAL(10, 2),
    total DECIMAL(10, 2)
)
```

### 2. `update_tab_totals()` (Trigger Function)
Atualiza automaticamente os totais da comanda quando um pedido é inserido ou atualizado.

### 3. `has_open_tabs(table_id_param INT)`
Verifica se há comandas abertas em uma mesa específica.

**Retorna:** `BOOLEAN`

### 4. `has_open_cash_session(establishment_id_param INT)`
Verifica se há sessão de caixa aberta no estabelecimento.

**Retorna:** `BOOLEAN`

### 5. `register_payment_cash_movement()` (Trigger Function)
Registra automaticamente movimentações de caixa ao criar um pagamento.

## Triggers Criados

### 1. `trigger_update_tab_totals`
- **Tabela:** `orders`
- **Evento:** AFTER INSERT OR UPDATE OF subtotal, tab_id
- **Função:** `update_tab_totals()`
- **Propósito:** Atualizar totais da comanda automaticamente

### 2. `trigger_register_payment_cash_movement`
- **Tabela:** `payments`
- **Evento:** AFTER INSERT
- **Função:** `register_payment_cash_movement()`
- **Propósito:** Registrar movimentações de caixa automaticamente

## Políticas RLS (Row Level Security)

Todas as novas tabelas têm RLS habilitado com as seguintes políticas:

### `tabs`, `cash_sessions`, `cash_movements`, `payments`
- **Política:** "Enable access for users of the same establishment"
- **Regra:** `establishment_id = public.get_current_establishment_id()`
- **Comandos:** ALL (SELECT, INSERT, UPDATE, DELETE)

### `user_devices`
- **Política 1:** "Users can manage their own devices"
  - **Regra:** `user_id = auth.uid()`
  - **Comandos:** ALL
  
- **Política 2:** "Admins can view establishment devices"
  - **Regra:** Usuário pertence ao mesmo estabelecimento
  - **Comandos:** SELECT

## Constraints e Validações

### `tabs`
- Unique constraint: `(establishment_id, tab_number)`
- Check constraint: `status IN ('open', 'closed', 'paid')`

### `cash_sessions`
- Check constraint: Validação de valores de fechamento baseado no status

### `cash_movements`
- Check constraint: `amount >= 0`

### `payments`
- Check constraint: `paid_amount >= total_amount`
- Check constraint: Deve ter `order_id` OU `tab_id`, mas não ambos

### `user_devices`
- Unique constraint: `(user_id, push_token)`
- Check constraint: `platform IN ('ios', 'android', 'web')`

## Grants de Permissões

Funções auxiliares foram concedidas permissão de execução para usuários autenticados:
- `calculate_tab_total(INT)`
- `has_open_tabs(INT)`
- `has_open_cash_session(INT)`

## Verificação da Implementação

### Tabelas Criadas ✅
- `tabs` - 0 rows
- `cash_sessions` - 0 rows
- `cash_movements` - 0 rows
- `payments` - 0 rows
- `user_devices` - 0 rows

### Coluna Adicionada ✅
- `orders.tab_id` - integer, nullable

### Funções Criadas ✅
- `calculate_tab_total` - FUNCTION (returns record)
- `update_tab_totals` - FUNCTION (returns trigger)
- `has_open_tabs` - FUNCTION (returns boolean)
- `has_open_cash_session` - FUNCTION (returns boolean)
- `register_payment_cash_movement` - FUNCTION (returns trigger)

### Triggers Criados ✅
- `trigger_update_tab_totals` on `orders` (AFTER INSERT/UPDATE)
- `trigger_register_payment_cash_movement` on `payments` (AFTER INSERT)

### Políticas RLS ✅
- 6 políticas criadas para as 5 novas tabelas

## Próximos Passos

Com o schema estendido, os próximos passos são:

1. **Task 3:** Implementar Sistema de Permissões no Frontend
2. **Task 4:** Módulo de Atendimento no Balcão
3. **Task 5:** Módulo de Gestão de Mesas
4. **Task 6:** Sistema de Comandas
5. **Task 9:** Módulo de Caixa - Abertura e Fechamento

## Observações Importantes

1. **Integridade Referencial:** Todas as foreign keys estão configuradas com `ON DELETE CASCADE` ou `ON DELETE SET NULL` apropriadamente.

2. **Performance:** Índices foram criados em todas as colunas frequentemente consultadas para otimizar queries.

3. **Segurança:** RLS está habilitado em todas as tabelas para garantir isolamento multi-tenant.

4. **Automação:** Triggers garantem que totais e movimentações sejam atualizados automaticamente, reduzindo erros manuais.

5. **Flexibilidade:** A estrutura suporta múltiplas formas de pagamento e divisão de conta através do campo JSONB.

## Requisitos Atendidos

Esta implementação atende aos seguintes requisitos do documento de requirements:

- **Requisito 2:** Gestão de Mesas e Comandas
- **Requisito 3:** Criação e Gestão de Comandas
- **Requisito 6:** Módulo de Caixa - Abertura e Fechamento
- **Requisito 7:** Módulo de Caixa - Gestão de Recebimentos
- **Requisito 8:** Módulo de Caixa - Gestão de Pagamentos
- **Requisito 9:** Aplicativo Mobile para Garçons (estrutura para push notifications)
