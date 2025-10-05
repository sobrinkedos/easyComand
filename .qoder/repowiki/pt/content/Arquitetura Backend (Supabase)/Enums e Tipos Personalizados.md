# Enums e Tipos Personalizados

<cite>
**Arquivos Referenciados neste Documento**   
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql)
</cite>

## Sumário

1. [Introdução](#introdução)
2. [Tipos ENUM Definidos](#tipos-enum-definidos)
3. [Impacto na Lógica de Negócios](#impacto-na-lógica-de-negócios)
4. [Diretrizes para Desenvolvedores](#diretrizes-para-desenvolvedores)
5. [Conclusão](#conclusão)

## Introdução

Este documento detalha os tipos ENUM e personalizados definidos no banco de dados PostgreSQL do sistema easyComand. Esses tipos são fundamentais para garantir a consistência e integridade dos dados ao longo de todo o sistema. Ao restringir os valores aceitos em colunas específicas, os ENUMs previnem erros de digitação, garantem uniformidade nos dados e facilitam a manutenção da lógica de negócios. A definição centralizada desses tipos permite que toda a equipe de desenvolvimento utilize valores padronizados ao interagir com o banco de dados.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L26-L47)

## Tipos ENUM Definidos

A seguir estão todos os tipos ENUM criados no esquema do banco de dados, juntamente com seus valores possíveis e a tabela onde são utilizados.

### Status Operacional do Estabelecimento
- **Tipo:** `establishment_operational_status`
- **Valores:** `'active'`, `'inactive'`, `'suspended'`
- **Utilizado em:** Coluna `operational_status` da tabela `establishments`
- **Descrição:** Define o estado atual do estabelecimento em relação à sua operação.

### Status do Usuário
- **Tipo:** `user_status`
- **Valores:** `'active'`, `'inactive'`, `'suspended'`
- **Utilizado em:** Coluna `status` da tabela `users`
- **Descrição:** Indica se um usuário do sistema está ativo, inativo ou suspenso.

### Dias da Semana
- **Tipo:** `day_of_week`
- **Valores:** `'monday'`, `'tuesday'`, `'wednesday'`, `'thursday'`, `'friday'`, `'saturday'`, `'sunday'`
- **Utilizado em:** Coluna `day_of_week` da tabela `operating_hours`
- **Descrição:** Utilizado para definir os horários de funcionamento por dia da semana.

### Formato da Mesa
- **Tipo:** `table_shape`
- **Valores:** `'round'`, `'square'`, `'rectangular'`, `'counter'`
- **Utilizado em:** Coluna `shape` da tabela `tables`
- **Descrição:** Define a forma física da mesa no ambiente do estabelecimento.

### Status da Mesa
- **Tipo:** `table_status`
- **Valores:** `'available'`, `'occupied'`, `'reserved'`, `'maintenance'`
- **Utilizado em:** Coluna `status` da tabela `tables`
- **Descrição:** Indica a disponibilidade atual da mesa para atendimento.

### Status da Reserva
- **Tipo:** `reservation_status`
- **Valores:** `'confirmed'`, `'cancelled'`, `'attended'`, `'no_show'`
- **Utilizado em:** Coluna `status` da tabela `reservations`
- **Descrição:** Define o estado atual de uma reserva feita por um cliente.

### Tipo de Variação do Produto
- **Tipo:** `product_variation_type`
- **Valores:** `'size'`, `'flavor'`, `'additional'`, `'preparation'`
- **Utilizado em:** Coluna `type` da tabela `product_variations`
- **Descrição:** Classifica o tipo de variação que um produto pode ter (tamanho, sabor, etc.).

### Tipo de Promoção
- **Tipo:** `promotion_type`
- **Valores:** `'happy_hour'`, `'quantity_discount'`, `'loyalty_discount'`, `'specific_day'`
- **Utilizado em:** Coluna `promotion_type` da tabela `promotions`
- **Descrição:** Define a categoria da promoção aplicada.

### Tipo de Desconto
- **Tipo:** `discount_type`
- **Valores:** `'percentage'`, `'fixed'`
- **Utilizado em:** Coluna `discount_type` da tabela `promotions`
- **Descrição:** Indica se o desconto é aplicado como porcentagem ou valor fixo.

### Tipo de Pedido
- **Tipo:** `order_type`
- **Valores:** `'local'`, `'counter'`, `'delivery'`, `'pickup'`
- **Utilizado em:** Coluna `order_type` da tabela `orders`
- **Descrição:** Define como o pedido foi realizado.

### Status do Pedido
- **Tipo:** `order_status`
- **Valores:** `'open'`, `'sent_to_kitchen'`, `'preparing'`, `'ready'`, `'delivered'`, `'paid'`, `'cancelled'`
- **Utilizado em:** Coluna `status` da tabela `orders`
- **Descrição:** Representa o fluxo de vida de um pedido, desde sua abertura até o pagamento ou cancelamento.

### Status do Item do Pedido
- **Tipo:** `order_item_status`
- **Valores:** `'pending'`, `'preparing'`, `'ready'`, `'delivered'`, `'cancelled'`
- **Utilizado em:** Coluna `status` da tabela `order_items`
- **Descrição:** Define o estado de processamento de um item específico dentro de um pedido.

### Unidade de Medida do Item de Estoque
- **Tipo:** `stock_item_unit_of_measure`
- **Valores:** `'kg'`, `'liter'`, `'unit'`, `'gram'`, `'box'`
- **Utilizado em:** Coluna `unit_of_measure` da tabela `stock_items`
- **Descrição:** Define a unidade de medida para itens de controle de estoque.

### Tipo de Movimentação de Estoque
- **Tipo:** `stock_movement_type`
- **Valores:** `'entry'`, `'exit'`, `'adjustment'`, `'loss'`, `'transfer'`
- **Utilizado em:** Coluna `movement_type` da tabela `stock_movements`
- **Descrição:** Classifica o tipo de movimentação realizada no estoque.

### Motivo da Movimentação de Estoque
- **Tipo:** `stock_movement_reason`
- **Valores:** `'sale'`, `'loss'`, `'expiration'`, `'breakage'`, `'free_sample'`, `'purchase'`, `'consumption'`
- **Utilizado em:** Coluna `reason` da tabela `stock_movements`
- **Descrição:** Especifica a razão para uma movimentação de estoque.

### Tipo de Método de Pagamento
- **Tipo:** `payment_method_type`
- **Valores:** `'cash'`, `'credit_card'`, `'debit_card'`, `'pix'`, `'digital_wallet'`, `'meal_voucher'`
- **Utilizado em:** Coluna `type` da tabela `payment_methods`
- **Descrição:** Define a categoria do método de pagamento aceito.

### Status da Sessão de Caixa
- **Tipo:** `cash_session_status`
- **Valores:** `'open'`, `'closed'`
- **Utilizado em:** Coluna `status` da tabela `cash_sessions`
- **Descrição:** Indica se uma sessão de caixa está aberta ou fechada.

### Tipo de Movimentação de Caixa
- **Tipo:** `cash_session_movement_type`
- **Valores:** `'sale'`, `'withdrawal'`, `'reinforcement'`, `'cancellation'`, `'expense'`
- **Utilizado em:** Coluna `movement_type` da tabela `cash_session_movements`
- **Descrição:** Define o tipo de movimentação financeira registrada em uma sessão de caixa.

### Tipo de Transação de Fidelidade
- **Tipo:** `customer_loyalty_transaction_type`
- **Valores:** `'earned'`, `'redeemed'`
- **Utilizado em:** Coluna `transaction_type` da tabela `customer_loyalty_transactions`
- **Descrição:** Indica se pontos de fidelidade foram ganhos ou resgatados.

### Tipo de Feedback do Cliente
- **Tipo:** `customer_feedback_type`
- **Valores:** `'product'`, `'service'`, `'environment'`
- **Utilizado em:** Coluna `feedback_type` da tabela `customer_feedback`
- **Descrição:** Classifica a natureza do feedback fornecido pelo cliente.

### Tipo de Checagem de Controle de Qualidade
- **Tipo:** `quality_control_check_type`
- **Valores:** `'temperature'`, `'ingredient_origin'`, `'license_validity'`
- **Utilizado em:** Coluna `check_type` da tabela `quality_control_checks`
- **Descrição:** Define o tipo de verificação de qualidade realizada.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L27-L47)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L32-L47)
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L28-L32)

## Impacto na Lógica de Negócios

Os tipos ENUM desempenham um papel crucial na lógica de negócios do easyComand, pois garantem que apenas valores válidos e esperados sejam inseridos nas colunas correspondentes. Isso elimina a possibilidade de dados inconsistentes, como um status de pedido escrito como `'pronto'` em vez de `'ready'`, ou um tipo de pagamento como `'dinheiro'` em vez de `'cash'`.

Por exemplo, o ENUM `order_status` define um fluxo de trabalho claro para os pedidos:
1. Um pedido começa com status `'open'`.
2. Quando enviado para a cozinha, muda para `'sent_to_kitchen'`.
3. Durante o preparo, o status é `'preparing'`.
4. Quando finalizado, torna-se `'ready'`.
5. Após a entrega, muda para `'delivered'`.
6. O pagamento é registrado com status `'paid'`.
7. Em caso de problemas, pode ser `'cancelled'`.

Essa sequência padronizada permite que a interface do usuário mostre o progresso do pedido de forma clara e que os relatórios de desempenho sejam gerados com precisão. Além disso, as regras de negócio podem ser implementadas com base nesses estados, como impedir que um pedido em status `'paid'` seja modificado.

A utilização de ENUMs também facilita a internacionalização, pois os valores no banco de dados permanecem em inglês (padrão técnico), enquanto a interface pode traduzir esses valores para o idioma do usuário.

**Section sources**
- [20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L37)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql#L42)

## Diretrizes para Desenvolvedores

Ao trabalhar com os tipos ENUM no banco de dados easyComand, siga estas diretrizes:

1. **Sempre utilize os valores definidos:** Nunca invente novos valores diretamente no código. Consulte sempre este documento ou o arquivo de migração para verificar os valores válidos.

2. **Adicionar novos valores:** Para adicionar um novo valor a um ENUM existente, crie uma nova migração SQL utilizando o comando `ALTER TYPE ... ADD VALUE`. Por exemplo:
```sql
ALTER TYPE public.order_status ADD VALUE 'being_delivered';
```
Sempre documente a mudança e coordene com a equipe, pois isso pode afetar a lógica de negócios existente.

3. **Ordem dos valores:** A ordem em que os valores são definidos no ENUM pode ser significativa em algumas consultas. Ao adicionar novos valores, considere a posição adequada.

4. **Compatibilidade com aplicações:** Após modificar um ENUM no banco de dados, atualize todos os lugares na aplicação (frontend, backend, APIs) que dependem desses valores.

5. **Testes:** Sempre escreva testes unitários e de integração para verificar o comportamento com os novos valores ENUM.

6. **Migrações:** Todas as alterações nos tipos ENUM devem ser feitas através de scripts de migração versionados, nunca diretamente no banco de dados de produção.

**Section sources**
- [20250101000001_initial_schema_fixed.sql](file://supabase/migrations/20250101000001_initial_schema_fixed.sql#L28-L32)

## Conclusão

Os tipos ENUM e personalizados são componentes essenciais da arquitetura de dados do easyComand, proporcionando consistência, integridade e clareza na modelagem do domínio do negócio. Sua utilização correta garante que o sistema opere com dados confiáveis e previsíveis. Todos os membros da equipe devem se familiarizar com esses tipos e seguir as diretrizes estabelecidas para manter a qualidade e a coesão do sistema.