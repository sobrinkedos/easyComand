# Políticas Indiretas de RLS

<cite>
**Arquivos Referenciados neste Documento**  
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
- [20250101000000_initial_schema_corrected.sql](file://supabase/migrations/20250101000000_initial_schema_corrected.sql)
</cite>

## Tabela de Conteúdos
1. [Introdução](#introdução)
2. [Função de Apoio para Isolamento de Dados](#função-de-apoio-para-isolamento-de-dados)
3. [Políticas Indiretas de RLS com EXISTS](#políticas-indiretas-de-rls-com-exists)
4. [Impacto de Desempenho e Otimização](#impacto-de-desempenho-e-otimização)
5. [Diretrizes para Criação de Novas Políticas](#diretrizes-para-criação-de-novas-políticas)
6. [Testes de Eficácia das Políticas](#testes-de-eficácia-das-políticas)

## Introdução

Este documento detalha as políticas de Segurança em Nível de Linha (RLS) que utilizam subconsultas `EXISTS` para garantir o isolamento de dados em um ambiente multi-inquilino. Especificamente, foca-se em tabelas que não possuem diretamente o campo `establishment_id`, mas que estão logicamente ligadas a tabelas que o possuem. Essas políticas são fundamentais para proteger dados sensíveis e prevenir vazamentos entre diferentes estabelecimentos (inquilinos) no sistema. Tabelas como `product_images`, `order_items`, `variation_options` e `cash_session_movements` são exemplos críticos onde essa abordagem indireta é necessária e eficaz.

## Função de Apoio para Isolamento de Dados

A implementação de políticas de RLS indiretas depende de uma função de apoio que determina o contexto de segurança do usuário atual. No sistema, a função `public.requesting_user_establishment_id()` é responsável por retornar o `establishment_id` do usuário autenticado.

Essa função consulta a tabela `public.users`, utilizando `auth.uid()` para identificar o usuário logado, e recupera seu `establishment_id` associado. Essa função é chamada dentro das condições `USING` das políticas RLS e é o mecanismo central que permite o isolamento de dados por inquilino.

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L27-L37)

## Políticas Indiretas de RLS com EXISTS

As políticas indiretas são aplicadas a tabelas filhas que não contêm o campo `establishment_id`. A cláusula `EXISTS` é usada para verificar se existe uma linha na tabela pai (que possui `establishment_id`) que esteja associada à linha da tabela filha e que pertença ao mesmo estabelecimento do usuário solicitante.

A estrutura geral de uma política indireta é a seguinte:
```sql
CREATE POLICY "Nome da Política" ON tabela_filha FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tabela_pai
    WHERE tabela_pai.id = tabela_filha.fk_id
    AND tabela_pai.establishment_id = public.requesting_user_establishment_id()
  )
);
```

### Exemplos de Políticas Indiretas

#### Tabela `product_images`
A tabela `product_images` é ligada à tabela `products` através da chave estrangeira `product_id`. Como `products` possui `establishment_id`, a política para `product_images` verifica se o produto pai pertence ao estabelecimento do usuário.

```sql
CREATE POLICY "Allow access via parent product" ON public.product_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
    AND p.establishment_id = public.requesting_user_establishment_id()
  )
);
```

#### Tabela `variation_options`
A tabela `variation_options` está ligada à `product_variations`, que por sua vez está ligada à `products`. A política precisa fazer um `JOIN` para alcançar o `establishment_id`.

```sql
CREATE POLICY "Allow access via parent variation" ON public.variation_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.product_variations pv
    JOIN public.products p ON pv.product_id = p.id
    WHERE pv.id = variation_options.variation_id
    AND p.establishment_id = public.requesting_user_establishment_id()
  )
);
```

#### Tabela `cash_session_movements`
A tabela `cash_session_movements` é ligada à `cash_sessions`, que possui o campo `establishment_id`. A política verifica a sessão de caixa pai.

```sql
CREATE POLICY "Allow access via parent cash session" ON public.cash_session_movements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cash_sessions cs
    WHERE cs.id = cash_session_movements.cash_session_id
    AND cs.establishment_id = public.requesting_user_establishment_id()
  )
);
```

**Section sources**
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L98-L119)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L121-L148)
- [20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L260-L286)

## Impacto de Desempenho e Otimização

O uso de subconsultas `EXISTS` pode ter um impacto no desempenho das consultas, especialmente se forem aninhadas ou envolverem grandes volumes de dados. O otimizador de consultas do PostgreSQL geralmente trata `EXISTS` de forma eficiente, mas o desempenho depende fortemente da existência de índices apropriados.

### Mitigação com Índices
Para garantir um desempenho ideal, é crucial que os campos envolvidos nas condições `WHERE` e nos `JOIN`s estejam indexados. Os seguintes índices são essenciais:

1.  **Índices nas Chaves Estrangeiras:** Um índice no campo `product_id` da tabela `product_images` permite que a subconsulta `EXISTS` localize rapidamente o produto pai.
2.  **Índices no `establishment_id`:** Um índice no campo `establishment_id` da tabela `products` permite que a condição de filtragem por inquilino seja executada rapidamente.

Sem esses índices, a subconsulta `EXISTS` pode exigir uma varredura sequencial completa da tabela pai para cada linha da tabela filha, resultando em um desempenho muito lento (complexidade O(n*m)). Com os índices adequados, a operação pode ser reduzida a pesquisas rápidas (complexidade O(log n)), tornando a política de RLS praticamente transparente em termos de desempenho.

## Diretrizes para Criação de Novas Políticas

Ao adicionar novas tabelas de relacionamento ao esquema, siga estas diretrizes para implementar políticas de RLS indiretas:

1.  **Identifique a Tabela Pai:** Determine qual tabela na cadeia de relacionamento possui o campo `establishment_id`.
2.  **Trace o Caminho de Relacionamento:** Mapeie as chaves estrangeiras que conectam a nova tabela à tabela pai.
3.  **Construa a Subconsulta EXISTS:** Escreva uma subconsulta que siga o caminho de relacionamento, verificando o `establishment_id` na tabela pai.
4.  **Habilite a RLS e Crie a Política:** Execute `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` e `CREATE POLICY` com a cláusula `USING` contendo a subconsulta `EXISTS`.
5.  **Crie Índices Necessários:** Garanta que todos os campos usados nas condições `WHERE` e `JOIN`s da subconsulta estejam indexados.

## Testes de Eficácia das Políticas

É fundamental testar rigorosamente as políticas de RLS para garantir que não haja vazamentos de dados. Os testes devem incluir:

1.  **Testes de Acesso Válido:** Verifique se um usuário pode acessar dados do seu próprio estabelecimento.
2.  **Testes de Bloqueio de Acesso:** Simule um usuário de um estabelecimento diferente e confirme que ele não consegue ver ou modificar dados do estabelecimento original.
3.  **Testes de Operações CRUD:** Teste não apenas leitura (`SELECT`), mas também inserção (`INSERT`), atualização (`UPDATE`) e exclusão (`DELETE`) para garantir que todas as operações estão corretamente restringidas.
4.  **Testes com Dados de Produção (em ambiente de teste):** Use um conjunto de dados realista com múltiplos estabelecimentos para validar o comportamento em um cenário completo.

A execução desses testes é a única maneira de garantir com confiança que a arquitetura de isolamento de dados está funcionando corretamente.