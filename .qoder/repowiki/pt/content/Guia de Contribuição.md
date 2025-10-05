# Guia de Contribuição

<cite>
**Arquivos Referenciados neste Documento**  
- [README.md](file://README.md)
- [package.json](file://package.json)
- [src/App.tsx](file://src/App.tsx)
- [src/lib/supabase.ts](file://src/lib/supabase.ts)
- [supabase/migrations/20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql)
- [supabase/migrations/20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql)
- [src/main.tsx](file://src/main.tsx)
</cite>

## Sumário
1. [Configuração Inicial](#configuração-inicial)
2. [Adicionando Novas Funcionalidades](#adicionando-novas-funcionalidades)
3. [Gerenciamento de Banco de Dados](#gerenciamento-de-banco-de-dados)
4. [Padrão Multi-Inquilino e Segurança](#padrão-multi-inquilino-e-segurança)
5. [Testes e Validação](#testes-e-validação)

## Configuração Inicial

Para começar a contribuir com o projeto easyComand, siga os passos essenciais descritos no arquivo README.md. Este processo prepara o ambiente de desenvolvimento local.

**Passos para configuração:**
1. Extraia o arquivo zip do repositório.
2. Execute `npm install` para instalar todas as dependências listadas no arquivo package.json.
3. Inicie o servidor de desenvolvimento com `npm run dev`.

Após a execução desses comandos, o aplicativo estará disponível localmente, permitindo o desenvolvimento e testes imediatos.

**Section sources**
- [README.md](file://README.md#L1-L8)
- [package.json](file://package.json#L1-L47)

## Adicionando Novas Funcionalidades

Para expandir as capacidades do sistema, siga as práticas recomendadas para integração de novos componentes e rotas.

### Criação de Componentes

Novos componentes da interface devem ser criados no diretório `src/`. Este diretório é a raiz para todos os componentes React, garantindo organização e facilidade de manutenção.

### Atualização de Rotas

O roteamento da aplicação é gerenciado pelo componente `App.tsx`, que utiliza `react-router-dom` para definir as rotas disponíveis. Para adicionar uma nova rota:

1. Importe o novo componente no `App.tsx`.
2. Adicione uma nova rota dentro do componente `Routes`, especificando o caminho e o componente associado.

Este processo centraliza o controle de navegação, facilitando a manutenção e a compreensão do fluxo da aplicação.

### Gerenciamento de Estado e Dados

O projeto utiliza **React Query** para gerenciar dados assíncronos, como chamadas à API. A instância do `QueryClient` é configurada em `main.tsx` e fornecida a toda a aplicação através do `QueryClientProvider`.

Para buscar ou atualizar dados:
- Utilize os hooks `useQuery` e `useMutation` fornecidos pelo `@tanstack/react-query`.
- Configure as consultas para buscar dados do Supabase via a instância `supabase` exportada de `supabase.ts`.

**Section sources**
- [src/App.tsx](file://src/App.tsx#L20-L27)
- [src/main.tsx](file://src/main.tsx#L10-L17)
- [src/lib/supabase.ts](file://src/lib/supabase.ts#L9-L9)

## Gerenciamento de Banco de Dados

O banco de dados é gerenciado usando o Supabase, com migrações armazenadas no diretório `supabase/migrations/`. Este sistema garante que todas as alterações no esquema sejam versionadas e aplicadas de forma consistente.

### Criação de Novas Migrações

Para criar uma nova migração SQL:

1. Utilize o CLI do Supabase com o comando:
   ```bash
   supabase migration new nome_da_migracao
   ```
2. Isso gera um novo arquivo SQL no diretório `supabase/migrations/` com um carimbo de data e hora.
3. Edite o arquivo SQL gerado para incluir as instruções DDL (CREATE, ALTER, DROP) necessárias.
4. Aplique a migração localmente com:
   ```bash
   supabase db push
   ```

Este fluxo garante que o esquema do banco de dados esteja sempre sincronizado com o código da aplicação.

**Section sources**
- [supabase/migrations/20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L1-L506)

## Padrão Multi-Inquilino e Segurança

O sistema easyComand é projetado com um padrão **multi-inquilino**, onde múltiplos estabelecimentos (inquilinos) compartilham a mesma instância da aplicação, mas seus dados são isolados.

### Isolamento de Dados com RLS

O **Row Level Security (RLS)** do Supabase é fundamental para garantir que os dados de um estabelecimento não sejam acessíveis por outro. As políticas de RLS estão definidas nas migrações SQL, como demonstrado nos arquivos de migração.

Principais características:
- Uma função auxiliar (por exemplo, `requesting_user_establishment_id()`) determina o estabelecimento do usuário autenticado.
- Políticas de RLS são aplicadas a todas as tabelas específicas do inquilino, usando a cláusula `USING (establishment_id = public.requesting_user_establishment_id())`.
- Isso garante que operações SELECT, INSERT, UPDATE e DELETE sejam automaticamente filtradas pelo `establishment_id`.

**Importância da Consistência:**
- Todas as novas tabelas específicas do inquilino devem ter a coluna `establishment_id`.
- O RLS deve ser habilitado e políticas apropriadas devem ser criadas para cada nova tabela.
- Nunca remova ou altere políticas de RLS existentes sem uma análise de segurança rigorosa.

```mermaid
graph TD
A[Usuário Autenticado] --> B{Função requesting_user_establishment_id()}
B --> C[Obtém establishment_id do usuário]
C --> D[Consulta SQL com RLS]
D --> E{Política RLS Verifica establishment_id}
E --> |Corresponde| F[Retorna Dados]
E --> |Não Corresponde| G[Nega Acesso]
```

**Diagram sources**
- [supabase/migrations/20250101000001_rls_security_fix.sql](file://supabase/migrations/20250101000001_rls_security_fix.sql#L1-L357)
- [supabase/migrations/20250101000000_initial_schema.sql](file://supabase/migrations/20250101000000_initial_schema.sql#L447-L504)

## Testes e Validação

Para garantir a qualidade e a segurança das contribuições:

1. **Testes Locais:** Execute a aplicação localmente (`npm run dev`) e teste todas as novas funcionalidades manualmente.
2. **Validação de Migrações:** Após criar uma nova migração, use `supabase db push` para aplicá-la ao banco de dados local e verifique se as tabelas e políticas são criadas corretamente.
3. **Verificação de Segurança:** Confirme que o RLS está habilitado e que as políticas estão corretamente configuradas para prevenir acesso cruzado entre inquilinos.
4. **Revisão de Código:** Antes de submeter um pull request, revise o código para garantir conformidade com os padrões do projeto e a integridade do padrão multi-inquilino.

Seguindo este guia, novos colaboradores poderão contribuir de forma eficiente e segura para o projeto easyComand.