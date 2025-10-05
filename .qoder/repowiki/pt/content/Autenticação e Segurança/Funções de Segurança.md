# Funções de Segurança

<cite>
**Arquivos Referenciados neste Documento**  
- [src/lib/supabase.ts](file://src/lib/supabase.ts)
- [supabase/migrations/20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
</cite>

## Sumário
1. [Introdução](#introdução)
2. [Função de Segurança `requesting_user_establishment_id`](#função-de-segurança-requesting_user_establishment_id)
3. [Políticas RLS para Isolamento de Dados](#políticas-rls-para-isolamento-de-dados)
4. [Configuração do Cliente Supabase](#configuração-do-cliente-supabase)
5. [Uso do Cliente em Componentes](#uso-do-cliente-em-componentes)
6. [Riscos e Mitigações de Segurança](#riscos-e-mitigações-de-segurança)

## Introdução

Este documento detalha as funções de segurança centrais no sistema **easyComand**, com foco na proteção de dados em um ambiente multi-inquilino. O sistema utiliza o Supabase como backend, aproveitando sua funcionalidade de **Row Level Security (RLS)** para garantir que cada usuário acesse apenas dados do seu próprio estabelecimento. A segurança é implementada em dois níveis principais: uma função SQL que identifica o inquilino do usuário autenticado e políticas RLS que aplicam automaticamente esse contexto em todas as operações de banco de dados. Este modelo permite o uso seguro da chave anônima no frontend, eliminando a necessidade de um backend intermediário apenas para controle de acesso.

## Função de Segurança `requesting_user_establishment_id`

A função SQL `public.requesting_user_establishment_id()` é o pilar da segurança multi-inquilino no sistema. Ela retorna o `establishment_id` do usuário autenticado atual, consultando a tabela `public.users` com base no `auth.uid()` fornecido pelo sistema de autenticação do Supabase.

A função é definida com `SECURITY DEFINER`, o que significa que ela é executada com os privilégios do seu proprietário (geralmente um superusuário), permitindo que ela acesse informações sensíveis como o `auth.uid()`. O uso de `SET search_path = public` garante que a função sempre consulte o esquema público, evitando ataques de injeção de caminho de busca.

Essa função é chamada por todas as políticas RLS para determinar se uma operação de leitura ou escrita é permitida para o usuário atual. Ela atua como uma camada de abstração, centralizando a lógica de identificação do inquilino em um único ponto, o que simplifica a manutenção e reduz o risco de erros em políticas individuais.

**Section sources**
- [supabase/migrations/20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L17-L24)

## Políticas RLS para Isolamento de Dados

As políticas de **Row Level Security (RLS)** são aplicadas a todas as tabelas que contêm dados específicos de um estabelecimento. Cada política utiliza a função `public.requesting_user_establishment_id()` em sua cláusula `USING` para garantir que apenas linhas pertencentes ao `establishment_id` do usuário autenticado possam ser acessadas.

Existem dois padrões principais de política:

1.  **Acesso Direto:** Para tabelas com uma coluna `establishment_id` (como `products`, `orders`, `reservations`), a política é simples:
    ```sql
    USING (establishment_id = public.requesting_user_establishment_id())
    ```
    Isso garante que o usuário só possa ver e modificar produtos, pedidos ou reservas do seu próprio estabelecimento.

2.  **Acesso Indireto (via Relacionamento):** Para tabelas filhas que não possuem `establishment_id` diretamente (como `product_images`, `order_items`), a política usa uma subconsulta `EXISTS` para verificar o `establishment_id` da tabela pai:
    ```sql
    USING (
      EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_images.product_id AND p.establishment_id = public.requesting_user_establishment_id()
      )
    )
    ```
    Isso garante que uma imagem de produto só seja acessível se o produto pai pertencer ao estabelecimento do usuário.

Todas as políticas são do tipo `FOR ALL`, o que significa que aplicam restrições tanto para `SELECT`, `INSERT`, `UPDATE` quanto `DELETE`. Isso garante que um usuário não possa apenas ler, mas também inserir, atualizar ou excluir dados de outros estabelecimentos.

**Section sources**
- [supabase/migrations/20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L30-L356)

## Configuração do Cliente Supabase

O cliente Supabase é configurado no arquivo `src/lib/supabase.ts`. Ele é inicializado com duas variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

O uso da **chave anônima (`anon`)** no frontend é geralmente considerado um risco de segurança, pois qualquer pessoa pode ver essa chave no código do navegador. No entanto, no easyComand, esse risco é **mitigado completamente pelo uso do RLS**.

Como todas as tabelas têm políticas RLS ativadas, a chave anônima, por si só, não concede acesso a nenhum dado. O acesso só é permitido após um usuário se autenticar (o que fornece um `auth.uid()` válido) e quando as políticas RLS são satisfeitas. A chave anônima é usada principalmente para operações de autenticação (login, cadastro) e para acessar dados públicos (como imagens de produtos, que podem ter políticas específicas).

**Section sources**
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L1-L11)

## Uso do Cliente em Componentes

Os componentes frontend importam o cliente Supabase já configurado e o utilizam para interagir diretamente com o banco de dados. Por exemplo, para buscar os produtos do estabelecimento do usuário autenticado:

```typescript
import { supabase } from '$lib/supabase';

const { data: products, error } = await supabase
  .from('products')
  .select('*');
```

Apesar de a consulta não conter explicitamente uma cláusula `WHERE establishment_id = ...`, o RLS aplica automaticamente essa restrição no banco de dados. O Supabase injeta a política `USING` na consulta, tornando-a efetivamente:

```sql
SELECT * FROM products WHERE establishment_id = (SELECT requesting_user_establishment_id());
```

Isso permite que os desenvolvedores escrevam consultas simples e diretas no frontend, enquanto a segurança é garantida no nível do banco de dados.

## Riscos e Mitigações de Segurança

### Risco: Vazamento de Chaves
O principal risco é o vazamento da `VITE_SUPABASE_ANON_KEY`. Como ela está no código frontend, qualquer usuário pode inspecionar a página e obtê-la.

**Mitigação:** O RLS é a principal linha de defesa. Mesmo com a chave anônima, um atacante não pode acessar dados sensíveis sem um `auth.uid()` válido. Além disso, o Supabase permite revogar chaves anônimas e criar chaves com escopos mais restritos.

### Risco: Políticas RLS Incompletas ou Erradas
Se uma política RLS for esquecida em uma tabela ou mal configurada, ela pode criar uma brecha de segurança.

**Mitigação:** A função `requesting_user_establishment_id()` centraliza a lógica de acesso. A migração de segurança aplica políticas a todas as tabelas relevantes de uma vez, reduzindo o risco de omissões. É essencial revisar cuidadosamente cada política durante o desenvolvimento.

### Risco: Ataques de Injeção de Caminho de Busca
Um atacante poderia tentar manipular o `search_path` para redirecionar a função `requesting_user_establishment_id()` para uma versão maliciosa.

**Mitigação:** A função é definida com `SET search_path = public`, garantindo que ela sempre use a função do esquema público, independentemente do `search_path` do usuário.

Em resumo, a combinação de uma função de segurança bem definida, políticas RLS abrangentes e a configuração correta do cliente Supabase cria um modelo de segurança robusto e escalável para o easyComand, permitindo um frontend direto e seguro.