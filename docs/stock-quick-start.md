# Guia Rápido - Sistema de Estoque

## 🚀 Início Rápido

### 1. Aplicar Migração do Banco de Dados

Execute a migração para criar as tabelas de estoque:

```bash
# Se estiver usando Supabase CLI local
supabase db push

# Ou aplique manualmente no SQL Editor do Supabase
# Copie e execute: supabase/migrations/20250105000004_create_stock_management.sql
```

### 2. Popular Dados Iniciais (Opcional)

Para facilitar os testes, execute o script de seed:

```bash
# No SQL Editor do Supabase, execute:
# supabase/seed-stock-data.sql
```

Isso criará:
- 10 categorias padrão
- 4 fornecedores de exemplo
- 20 produtos de exemplo
- Movimentações iniciais de estoque

### 3. Acessar o Módulo

1. Faça login no sistema
2. No menu lateral, clique em **"Estoque"** (📦)
3. Você verá o dashboard com:
   - Total de produtos
   - Produtos com estoque baixo
   - Produtos sem estoque
   - Valor total do estoque

## 📋 Primeiros Passos

### Passo 1: Criar Categorias

1. Vá para a aba **"Categorias"**
2. Clique em **"Nova Categoria"**
3. Preencha:
   - Nome (ex: "Refrigerantes")
   - Descrição (opcional)
   - Ícone (emoji, ex: 🥤)
   - Cor (hexadecimal, ex: #3B82F6)
4. Clique em **"Salvar"**

**Categorias Sugeridas:**
- 🥤 Refrigerantes
- 🍺 Cervejas
- 💧 Águas e Sucos
- 🍷 Vinhos e Destilados
- ⚡ Energéticos
- 🍿 Salgadinhos
- 🥟 Salgados Congelados
- 🍫 Doces e Sobremesas

### Passo 2: Cadastrar Fornecedores

1. Vá para a aba **"Fornecedores"**
2. Clique em **"Novo Fornecedor"**
3. Preencha os dados:
   - **Básico**: Nome, Nome Fantasia, CNPJ
   - **Contato**: Email, Telefone, WhatsApp
   - **Endereço**: Rua, Número, Cidade, Estado
   - **Pessoa de Contato**: Nome do representante
4. Clique em **"Salvar"**

### Passo 3: Cadastrar Produtos

1. Vá para a aba **"Produtos"**
2. Clique em **"Novo Produto"**
3. Preencha as informações:

**Informações Básicas:**
- Nome do produto (ex: "Coca-Cola 2L")
- Categoria (selecione da lista)
- Fornecedor principal
- Marca (ex: "Coca-Cola")
- Descrição (opcional)

**Controle de Estoque:**
- Unidade de medida (un, cx, pct, etc.)
- Estoque atual (quantidade inicial)
- Estoque mínimo (para alertas)
- Estoque máximo (opcional)

**Preços:**
- Preço de custo (quanto você paga)
- Preço de venda (quanto você cobra)

**Códigos:**
- SKU (código interno, ex: "REF-001")
- Código de barras (opcional)

**Embalagem (opcional):**
- Quantidade por embalagem (ex: 12 para caixa com 12 unidades)
- Unidade da embalagem (ex: "cx")

**Produtos Perecíveis:**
- Marque se o produto tem validade
- Defina dias para alertar antes do vencimento

4. Clique em **"Salvar"**

### Passo 4: Registrar Estoque Inicial

Após cadastrar os produtos, registre o estoque inicial:

1. Na lista de produtos, clique em **"Entrada"**
2. Preencha:
   - Quantidade recebida
   - Custo unitário
   - Fornecedor
   - Número da nota fiscal (opcional)
   - Data de validade (se perecível)
3. Clique em **"Confirmar"**

O sistema automaticamente:
- Atualiza o estoque do produto
- Registra a movimentação
- Calcula o valor total

## 🔄 Operações do Dia a Dia

### Entrada de Mercadorias

Quando receber produtos do fornecedor:

1. Vá para **"Movimentações"** > **"Nova Entrada"**
2. Selecione o produto
3. Informe:
   - Quantidade recebida
   - Custo unitário (pode ser diferente do cadastrado)
   - Fornecedor
   - Número da nota fiscal
   - Data de validade (produtos perecíveis)
4. Confirme

### Saída Manual

Para registrar vendas ou consumo manual:

1. Vá para **"Movimentações"** > **"Nova Saída"**
2. Selecione o produto
3. Informe a quantidade
4. Adicione observações se necessário
5. Confirme

**Nota:** Vendas através do sistema de pedidos geram saída automática!

### Ajuste de Estoque

Após contagem física, se houver diferença:

1. Vá para **"Movimentações"** > **"Ajuste"**
2. Selecione o produto
3. Informe:
   - Quantidade real (após contagem)
   - Motivo do ajuste
4. Confirme

O sistema calcula automaticamente a diferença.

### Registrar Perdas

Para quebras, vencimentos ou perdas:

1. Vá para **"Movimentações"** > **"Perda"**
2. Selecione o produto
3. Informe:
   - Quantidade perdida
   - Motivo (quebra, vencimento, etc.)
4. Confirme

## 📊 Monitoramento

### Dashboard

O dashboard mostra em tempo real:
- **Total de Produtos**: Quantidade de itens cadastrados
- **Estoque Baixo**: Produtos abaixo do mínimo (amarelo)
- **Sem Estoque**: Produtos zerados (vermelho)
- **Valor Total**: Valor do estoque (custo × quantidade)

### Alertas

O sistema gera alertas automaticamente:
- 🟡 **Estoque Baixo**: Quando atinge o mínimo
- 🔴 **Sem Estoque**: Quando zera
- ⏰ **Vencimento Próximo**: X dias antes de vencer
- ❌ **Vencido**: Produtos com validade expirada

### Filtros e Busca

Use os filtros para encontrar produtos:
- Busca por nome
- Filtro por categoria
- Filtro por fornecedor
- Filtro por status (ok, baixo, sem estoque)

## 💡 Dicas Importantes

### 1. Estoque Mínimo
Configure o estoque mínimo baseado em:
- Tempo de entrega do fornecedor
- Velocidade de venda
- Margem de segurança

**Exemplo:** Se vende 10 unidades/dia e o fornecedor demora 3 dias, configure mínimo de 30-40 unidades.

### 2. Preço de Custo
Inclua no preço de custo:
- Valor do produto
- Frete proporcional
- Impostos
- Outras despesas

### 3. Organização
- Use SKUs padronizados (REF-001, CER-001, etc.)
- Mantenha categorias organizadas
- Atualize informações regularmente

### 4. Contagem Física
Faça contagens periódicas:
- Semanal: Produtos de alto giro
- Mensal: Todos os produtos
- Registre ajustes encontrados

### 5. Fornecedores
- Cadastre múltiplos fornecedores
- Compare preços
- Mantenha contatos atualizados

## ❓ Perguntas Frequentes

### Como funciona a saída automática?
Quando um pedido é criado no sistema e contém produtos de estoque, a saída é registrada automaticamente.

### Posso ter o mesmo produto de fornecedores diferentes?
Sim! Cadastre o produto uma vez e registre entradas de diferentes fornecedores nas movimentações.

### Como funciona o alerta de validade?
Configure "dias para alertar" no produto. O sistema alertará X dias antes do vencimento.

### Posso editar movimentações antigas?
Não. Movimentações são imutáveis para manter histórico. Faça um ajuste se necessário.

### Como calcular margem de lucro?
```
Margem = ((Preço Venda - Preço Custo) / Preço Venda) × 100
```

Exemplo:
- Custo: R$ 6,50
- Venda: R$ 12,00
- Margem: ((12 - 6,50) / 12) × 100 = 45,8%

### Posso importar produtos de uma planilha?
Funcionalidade em desenvolvimento. Por enquanto, cadastre manualmente ou use o seed data como base.

## 🆘 Problemas Comuns

### Estoque negativo
Se o estoque ficar negativo:
1. Verifique as movimentações
2. Faça um ajuste para corrigir
3. Investigue a causa (venda sem estoque, erro de registro, etc.)

### Alerta não aparece
Verifique se:
- Estoque mínimo está configurado
- Produto está ativo
- Estoque está realmente abaixo do mínimo

### Não consigo cadastrar produto
Verifique:
- Categoria existe e está ativa
- SKU não está duplicado
- Todos os campos obrigatórios estão preenchidos

## 📞 Suporte

Precisa de ajuda?
- Consulte a documentação completa: `docs/stock-management.md`
- Verifique os logs de movimentação
- Entre em contato com o suporte técnico

---

**Pronto!** Agora você está preparado para usar o sistema de gestão de estoque. 🎉
