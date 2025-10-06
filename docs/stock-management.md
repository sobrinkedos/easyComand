# Sistema de Gestão de Estoque

## Visão Geral

O sistema de gestão de estoque foi desenvolvido especificamente para bares e restaurantes que trabalham com produtos de revenda sem manipulação na cozinha, como:

- 🥤 Refrigerantes
- 🍺 Cervejas
- 💧 Águas e sucos
- 🍿 Salgadinhos
- 🥟 Salgados congelados
- 🍫 Doces e sobremesas
- E outros produtos prontos para venda

## Funcionalidades Principais

### 1. Gestão de Categorias
- Criação de categorias personalizadas
- Ícones e cores para identificação visual
- Organização hierárquica de produtos

### 2. Cadastro de Produtos
- Informações completas do produto (nome, descrição, marca)
- Código de barras e SKU
- Unidades de medida flexíveis
- Controle de estoque mínimo e máximo
- Preços de custo e venda
- Informações de embalagem
- Produtos perecíveis com alerta de validade
- Imagem do produto

### 3. Controle de Fornecedores
- Cadastro completo de fornecedores
- Dados de contato (telefone, WhatsApp, email)
- Endereço completo
- CNPJ/CPF
- Pessoa de contato
- Observações

### 4. Movimentações de Estoque
- **Entrada**: Compras de fornecedores
- **Saída**: Vendas e consumo
- **Ajuste**: Correções manuais
- **Perda**: Quebras e vencimentos
- **Transferência**: Entre estabelecimentos
- **Devolução**: Devoluções a fornecedores

### 5. Alertas Inteligentes
- Estoque baixo (abaixo do mínimo)
- Produto sem estoque
- Produtos próximos ao vencimento
- Produtos vencidos

### 6. Relatórios e Análises
- Valor total do estoque
- Produtos com estoque baixo
- Histórico de movimentações
- Análise de custos
- Produtos mais vendidos

## Estrutura do Banco de Dados

### Tabelas Principais

#### `stock_units` - Unidades de Medida
```sql
- id: Identificador único
- name: Nome da unidade (ex: "Unidade", "Caixa")
- abbreviation: Abreviação (ex: "un", "cx")
```

Unidades padrão:
- Unidade (un)
- Caixa (cx)
- Fardo (fd)
- Pacote (pct)
- Litro (L)
- Mililitro (ml)
- Quilograma (kg)
- Grama (g)
- Dúzia (dz)
- Garrafa (grf)
- Lata (lt)

#### `stock_categories` - Categorias de Produtos
```sql
- id: Identificador único
- establishment_id: Estabelecimento
- name: Nome da categoria
- description: Descrição
- icon: Emoji ou ícone
- color: Cor em hexadecimal
- is_active: Status ativo/inativo
```

#### `suppliers` - Fornecedores
```sql
- id: Identificador único
- establishment_id: Estabelecimento
- name: Razão social
- trade_name: Nome fantasia
- cnpj/cpf: Documentos
- email, phone, whatsapp: Contatos
- address_*: Endereço completo
- contact_person: Pessoa de contato
- notes: Observações
- is_active: Status ativo/inativo
```

#### `stock_products` - Produtos de Estoque
```sql
- id: Identificador único
- establishment_id: Estabelecimento
- category_id: Categoria
- supplier_id: Fornecedor principal
- name: Nome do produto
- description: Descrição
- barcode: Código de barras
- sku: SKU interno
- unit_id: Unidade de medida
- current_stock: Estoque atual
- minimum_stock: Estoque mínimo
- maximum_stock: Estoque máximo
- cost_price: Preço de custo
- sale_price: Preço de venda
- brand: Marca
- package_quantity: Qtd por embalagem
- package_unit_id: Unidade da embalagem
- is_active: Status ativo/inativo
- is_perishable: Produto perecível
- expiration_alert_days: Dias para alertar vencimento
- image_url: URL da imagem
```

#### `stock_movements` - Movimentações
```sql
- id: Identificador único
- establishment_id: Estabelecimento
- product_id: Produto
- type: Tipo de movimentação (entry, exit, adjustment, loss, transfer, return)
- quantity: Quantidade movimentada
- unit_cost: Custo unitário
- total_cost: Custo total
- stock_before: Estoque antes
- stock_after: Estoque depois
- supplier_id: Fornecedor (para entradas)
- order_id: Pedido (para saídas)
- invoice_number: Número da nota fiscal
- reason: Motivo da movimentação
- notes: Observações
- expiration_date: Data de validade
- created_by: Usuário que criou
- created_at: Data/hora da movimentação
```

#### `stock_alerts` - Alertas
```sql
- id: Identificador único
- establishment_id: Estabelecimento
- product_id: Produto
- alert_type: Tipo de alerta (low_stock, out_of_stock, expiring_soon, expired)
- message: Mensagem do alerta
- is_resolved: Alerta resolvido
- resolved_at: Data de resolução
- resolved_by: Usuário que resolveu
- created_at: Data de criação
```

## Funções SQL Auxiliares

### `update_product_stock()`
Atualiza automaticamente o estoque do produto após cada movimentação e cria alertas quando necessário.

### `get_low_stock_products(establishment_id)`
Retorna lista de produtos com estoque abaixo do mínimo.

### `get_stock_value(establishment_id)`
Calcula o valor total do estoque do estabelecimento.

### `register_stock_exit_on_order()`
Registra automaticamente a saída de estoque quando um pedido é criado (para produtos de estoque).

## Fluxos de Trabalho

### 1. Cadastro Inicial
1. Criar categorias de produtos
2. Cadastrar fornecedores
3. Cadastrar produtos
4. Registrar estoque inicial (entrada)

### 2. Entrada de Mercadorias
1. Receber mercadoria do fornecedor
2. Registrar movimentação de entrada
3. Informar quantidade, custo e nota fiscal
4. Sistema atualiza estoque automaticamente
5. Para produtos perecíveis, informar data de validade

### 3. Saída por Venda
1. Cliente faz pedido no sistema
2. Sistema identifica produtos de estoque
3. Registra saída automaticamente
4. Atualiza estoque
5. Gera alerta se estoque ficar baixo

### 4. Ajustes e Perdas
1. Realizar contagem física
2. Identificar diferenças
3. Registrar ajuste ou perda
4. Informar motivo
5. Sistema atualiza estoque

### 5. Gestão de Alertas
1. Sistema gera alertas automaticamente
2. Usuário visualiza alertas no dashboard
3. Toma ação (comprar mais, ajustar mínimo, etc.)
4. Marca alerta como resolvido

## Integração com Outros Módulos

### Cardápio
- Produtos de estoque podem ser adicionados ao cardápio
- Preço de venda sincronizado
- Disponibilidade baseada no estoque

### Pedidos
- Saída automática de estoque ao criar pedido
- Validação de disponibilidade
- Histórico de vendas por produto

### Caixa
- Registro de custos nas movimentações
- Relatórios de margem de lucro
- Análise de rentabilidade

### Relatórios
- Produtos mais vendidos
- Análise de giro de estoque
- Previsão de compras
- Análise de fornecedores

## Permissões

O sistema de estoque respeita as permissões configuradas:

- `manage_stock`: Acesso completo ao módulo de estoque
- `view_stock`: Visualização apenas (sem edição)
- `manage_suppliers`: Gestão de fornecedores
- `view_reports`: Acesso a relatórios de estoque

## Boas Práticas

### 1. Organização
- Use categorias claras e objetivas
- Mantenha SKUs padronizados
- Cadastre todos os fornecedores

### 2. Controle
- Defina estoques mínimos realistas
- Faça contagens periódicas
- Registre todas as movimentações

### 3. Custos
- Atualize preços de custo regularmente
- Considere frete e impostos no custo
- Monitore margem de lucro

### 4. Validade
- Marque produtos perecíveis corretamente
- Configure alertas de vencimento
- Implemente FIFO (First In, First Out)

### 5. Fornecedores
- Mantenha múltiplos fornecedores
- Compare preços regularmente
- Avalie qualidade e prazo de entrega

## Próximos Passos

### Funcionalidades Futuras
- [ ] Código de barras com leitor
- [ ] Importação de XML de nota fiscal
- [ ] Integração com balanças
- [ ] Previsão de demanda com IA
- [ ] Pedidos automáticos para fornecedores
- [ ] App mobile para contagem de estoque
- [ ] Etiquetas de preço personalizadas
- [ ] Análise de curva ABC
- [ ] Gestão de lotes e validades
- [ ] Transferência entre estabelecimentos

## Suporte

Para dúvidas ou problemas com o sistema de estoque:
1. Consulte esta documentação
2. Verifique os logs de movimentação
3. Entre em contato com o suporte técnico

## Changelog

### Versão 1.0.0 (Janeiro 2025)
- ✅ Estrutura inicial do banco de dados
- ✅ Cadastro de categorias
- ✅ Cadastro de produtos
- ✅ Cadastro de fornecedores
- ✅ Movimentações de estoque
- ✅ Alertas automáticos
- ✅ Interface web básica
- ✅ Funções auxiliares SQL
- ✅ Políticas RLS
- ✅ Seed data para testes
