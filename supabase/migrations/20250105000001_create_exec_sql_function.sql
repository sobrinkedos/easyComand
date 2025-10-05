-- Função RPC para executar comandos SQL (apenas para administradores)
-- Esta função permite executar migrações através de chamadas RPC

CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário é administrador (service role)
  -- Esta verificação é importante para segurança
  IF current_user != 'postgres' THEN
    RAISE EXCEPTION 'Apenas administradores podem executar esta função';
  END IF;
  
  -- Executar o SQL fornecido
  EXECUTE sql;
  
  -- Retornar sucesso
  RETURN json_build_object('success', true, 'message', 'SQL executado com sucesso');
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Conceder permissão apenas para o serviço (não para usuários finais)
REVOKE ALL ON FUNCTION public.execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO postgres;