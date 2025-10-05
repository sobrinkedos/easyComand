-- Função RPC para executar comandos SQL através do MCP
-- Esta função permite executar migrações através de chamadas RPC com segurança

CREATE OR REPLACE FUNCTION public.mcp_execute_sql(sql_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se o usuário tem permissão (apenas service role)
  -- Esta é uma verificação básica de segurança
  IF current_setting('role', true) != 'postgres' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Apenas administradores podem executar esta função'
    );
  END IF;
  
  -- Executar o SQL fornecido
  EXECUTE sql_text;
  
  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'SQL executado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Conceder permissão apenas para o serviço
REVOKE ALL ON FUNCTION public.mcp_execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mcp_execute_sql(text) TO postgres;

-- Comentário para documentação
COMMENT ON FUNCTION public.mcp_execute_sql(text) IS 
'Função MCP para executar comandos SQL diretamente no banco de dados. Usada para aplicar migrações através do Model Context Protocol.';