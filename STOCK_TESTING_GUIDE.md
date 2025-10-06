# 🧪 Guia de Testes - Sistema de Estoque

## Pré-requisitos

Antes de testar, certifique-se de que:

- [ ] A migração do banco de dados foi aplicada
- [ ] O seed data foi executado (opcional, mas recomendado)
- [ ] O sistema está rodando (`npm run dev`)
- [ ] Você está logado no sistema
- [ ] Seu usuário tem permissão `manage_stock`

## 📋 Roteiro de Testes

### 1. Teste de Acesso

**Objetivo:** Verificar se a página carrega corretamente

1. Acesse `/estoque` no navegador
2. Verifique se a sidebar aparece
3. Verifique se o header "Gestão de Estoque" está visível
4. Verifique se os 4 cards de estatísticas aparecem

**Resultado Esperado:**
- ✅ Página carrega sem erros
- ✅ Sidebar visível
- ✅ Estatísticas mostram valores (mesmo que zeros)
- ✅ Sem erros no console

---

### 2. Teste de Carregamento de Dados

**Objetivo:** Verificar se os dados do Supabase são carregados

**Se executou o seed data:**

1. Verifique se os cards mostram:
   - Total de Produtos: > 0
   - Estoque Baixo: número
   - Sem Estoque: número
   - Valor Total: > R$ 0,00

2. Vá para a aba "Categorias"
3. Verifique se aparecem categorias com ícones

4. Vá para a aba "Produtos"
5. Verifique se aparecem produtos na tabela

**Resultado Esperado:**
- ✅ Dados aparecem corretamente
- ✅ Categorias com ícones e cores
- ✅ Produtos com todas as informações
- ✅ Status coloridos (verde, amarelo, vermelho)

**Se NÃO executou o seed data:**

1. Verifique se aparece "Nenhum produto cadastrado"
2. Verifique se aparece "Nenhuma categoria cadastrada"

**Resultado Esperado:**
- ✅ Mensagens de empty state aparecem
- ✅ Sem erros no console

---

### 3. Teste de Cadastro de Categoria

**Objetivo:** Criar uma nova categoria

1. Vá para a aba "Categorias"
2. Clique em "Nova Categoria"
3. Verifique se o modal abre

**No modal:**

4. Deixe o nome vazio e tente salvar
   - **Esperado:** Validação impede o envio

5. Preencha:
   - Nome: "Teste Categoria"
   - Descrição: "Categoria de teste"
   - Selecione um ícone (ex: 🧪)
   - Selecione uma cor

6. Verifique o preview
   - **Esperado:** Preview mostra ícone, nome e descrição

7. Clique em "Salvar"
   - **Esperado:** Modal fecha e categoria aparece na lista

8. Verifique se a nova categoria aparece nos cards

**Resultado Esperado:**
- ✅ Modal abre e fecha corretamente
- ✅ Validação funciona
- ✅ Preview atualiza em tempo real
- ✅ Categoria é salva no banco
- ✅ Categoria aparece na lista
- ✅ Sem erros no console

---

### 4. Teste de Cadastro de Produto

**Objetivo:** Criar um novo produto

**Pré-requisito:** Ter pelo menos uma categoria cadastrada

1. Vá para a aba "Produtos"
2. Clique em "Novo Produto"
3. Verifique se o modal abre

**No modal:**

4. Tente salvar sem preencher nada
   - **Esperado:** Validação impede o envio

5. Preencha apenas os campos obrigatórios:
   - Nome: "Produto Teste"
   - Categoria: Selecione uma
   - Unidade: Selecione "Unidade (un)"
   - Estoque Atual: 10
   - Estoque Mínimo: 5
   - Preço de Custo: 5.00

6. Clique em "Salvar Produto"
   - **Esperado:** Modal fecha e produto aparece na tabela

7. Verifique o produto na tabela:
   - Nome correto
   - Categoria correta
   - Estoque: 10 un
   - Mínimo: 5 un
   - Custo: R$ 5.00
   - Status: Verde (Normal)

**Resultado Esperado:**
- ✅ Modal abre e fecha corretamente
- ✅ Validação funciona
- ✅ Produto é salvo no banco
- ✅ Produto aparece na tabela
- ✅ Estatísticas atualizam
- ✅ Sem erros no console

---

### 5. Teste de Produto Completo

**Objetivo:** Criar um produto com todos os campos

1. Clique em "Novo Produto"
2. Preencha TODOS os campos:

**Informações Básicas:**
- Nome: "Coca-Cola 2L Teste"
- Descrição: "Refrigerante de cola"
- Categoria: Refrigerantes (ou outra)
- Fornecedor: Selecione um (se houver)
- Marca: "Coca-Cola"
- Unidade: Unidade (un)

**Códigos:**
- SKU: "TEST-001"
- Código de Barras: "1234567890123"

**Estoque:**
- Estoque Atual: 24
- Estoque Mínimo: 12
- Estoque Máximo: 100

**Preços:**
- Preço de Custo: 6.50
- Preço de Venda: 12.00

**Embalagem:**
- Quantidade por Embalagem: 6
- Unidade da Embalagem: Caixa (cx)

**Validade:**
- Marque "Este produto é perecível"
- Alertar quantos dias antes: 7

3. Clique em "Salvar Produto"

4. Verifique o produto na tabela

**Resultado Esperado:**
- ✅ Todos os campos são salvos
- ✅ Produto aparece corretamente
- ✅ Sem erros no console

---

### 6. Teste de Busca

**Objetivo:** Verificar se a busca funciona

**Pré-requisito:** Ter produtos cadastrados

1. Na aba "Produtos", digite no campo de busca:
   - Nome de um produto existente
   - **Esperado:** Apenas produtos com esse nome aparecem

2. Limpe a busca
   - **Esperado:** Todos os produtos voltam

3. Digite parte de um nome
   - **Esperado:** Busca parcial funciona

4. Digite uma categoria
   - **Esperado:** Produtos dessa categoria aparecem

5. Digite um SKU
   - **Esperado:** Produto com esse SKU aparece

6. Digite algo que não existe
   - **Esperado:** "Nenhum produto encontrado"

**Resultado Esperado:**
- ✅ Busca funciona em tempo real
- ✅ Busca por nome funciona
- ✅ Busca por categoria funciona
- ✅ Busca por SKU funciona
- ✅ Empty state aparece quando não há resultados

---

### 7. Teste de Status de Estoque

**Objetivo:** Verificar se os status são calculados corretamente

**Criar produtos com diferentes status:**

1. Produto com estoque normal:
   - Estoque Atual: 50
   - Estoque Mínimo: 10
   - **Esperado:** Status verde "Normal"

2. Produto com estoque baixo:
   - Estoque Atual: 10
   - Estoque Mínimo: 10
   - **Esperado:** Status amarelo "Estoque Baixo"

3. Produto sem estoque:
   - Estoque Atual: 0
   - Estoque Mínimo: 10
   - **Esperado:** Status vermelho "Sem Estoque"

4. Verifique os cards de estatísticas:
   - Estoque Baixo deve contar produtos amarelos
   - Sem Estoque deve contar produtos vermelhos

**Resultado Esperado:**
- ✅ Status verde para estoque normal
- ✅ Status amarelo para estoque baixo
- ✅ Status vermelho para sem estoque
- ✅ Estatísticas corretas nos cards

---

### 8. Teste de Cálculo de Valor

**Objetivo:** Verificar se o valor total é calculado corretamente

1. Anote os produtos e seus valores:
   - Produto A: 10 un × R$ 5,00 = R$ 50,00
   - Produto B: 20 un × R$ 3,00 = R$ 60,00
   - Total esperado: R$ 110,00

2. Verifique o card "Valor Total"
   - **Esperado:** R$ 110,00

3. Crie um novo produto:
   - Estoque: 5
   - Custo: R$ 10,00

4. Verifique se o valor total atualizou:
   - **Esperado:** R$ 160,00 (110 + 50)

**Resultado Esperado:**
- ✅ Valor total calculado corretamente
- ✅ Valor atualiza ao adicionar produtos
- ✅ Formatação em Real (R$)

---

### 9. Teste de Navegação entre Abas

**Objetivo:** Verificar se as abas funcionam

1. Clique em cada aba:
   - Produtos
   - Categorias
   - Movimentações
   - Fornecedores

2. Verifique se:
   - Aba ativa fica azul
   - Conteúdo muda
   - Sem erros ao trocar

**Resultado Esperado:**
- ✅ Abas trocam corretamente
- ✅ Indicador visual funciona
- ✅ Conteúdo correto em cada aba

---

### 10. Teste de Responsividade

**Objetivo:** Verificar se funciona em diferentes tamanhos

1. Redimensione a janela do navegador
2. Teste em diferentes tamanhos:
   - Desktop (> 1024px)
   - Tablet (768px - 1024px)
   - Mobile (< 768px)

3. Verifique:
   - Cards se reorganizam
   - Tabela tem scroll horizontal
   - Modais são scrolláveis
   - Sidebar funciona

**Resultado Esperado:**
- ✅ Layout adapta ao tamanho
- ✅ Tudo acessível em mobile
- ✅ Sem elementos cortados

---

### 11. Teste de Erros

**Objetivo:** Verificar tratamento de erros

**Simular erro de rede:**

1. Abra DevTools (F12)
2. Vá para Network
3. Selecione "Offline"
4. Tente criar uma categoria
   - **Esperado:** Mensagem de erro aparece

5. Volte para "Online"
6. Tente novamente
   - **Esperado:** Funciona normalmente

**Resultado Esperado:**
- ✅ Erros são capturados
- ✅ Mensagens amigáveis
- ✅ Sistema não quebra

---

### 12. Teste de Performance

**Objetivo:** Verificar se o sistema é rápido

1. Abra DevTools (F12)
2. Vá para Console
3. Recarregue a página
4. Observe os logs de carregamento

5. Verifique:
   - Tempo de carregamento < 2s
   - Sem múltiplas requisições desnecessárias
   - Sem warnings no console

**Resultado Esperado:**
- ✅ Carregamento rápido
- ✅ Requisições otimizadas
- ✅ Sem warnings

---

## 🐛 Problemas Comuns e Soluções

### Problema: "Nenhum produto cadastrado" mesmo com seed data

**Solução:**
1. Verifique se o seed data foi executado
2. Verifique se você está logado
3. Verifique se seu usuário tem establishment_id
4. Verifique o console para erros

### Problema: Modal não abre

**Solução:**
1. Verifique o console para erros
2. Verifique se o estado está sendo atualizado
3. Tente recarregar a página

### Problema: Dados não salvam

**Solução:**
1. Verifique o console para erros
2. Verifique se a migração foi aplicada
3. Verifique as políticas RLS
4. Verifique se o establishment_id está correto

### Problema: Estatísticas mostram zero

**Solução:**
1. Verifique se há produtos cadastrados
2. Verifique se os produtos têm establishment_id correto
3. Recarregue a página

---

## ✅ Checklist Final

Após completar todos os testes, verifique:

- [ ] Página carrega sem erros
- [ ] Dados do Supabase são carregados
- [ ] Categorias podem ser criadas
- [ ] Produtos podem ser criados
- [ ] Busca funciona
- [ ] Status de estoque corretos
- [ ] Valor total calculado corretamente
- [ ] Navegação entre abas funciona
- [ ] Responsivo em diferentes tamanhos
- [ ] Erros são tratados
- [ ] Performance adequada
- [ ] Sem erros no console

---

## 📊 Relatório de Testes

Após completar os testes, preencha:

**Data:** ___/___/___  
**Testador:** _______________  
**Ambiente:** [ ] Dev [ ] Staging [ ] Prod

**Resultados:**
- Testes Passados: ___/12
- Testes Falhados: ___/12
- Bugs Encontrados: ___

**Observações:**
_________________________________
_________________________________
_________________________________

---

**Próximo passo:** Se todos os testes passaram, o sistema está pronto para uso! 🎉
