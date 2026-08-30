-- RPC de matching semántico: dado el embedding de una pregunta, devuelve las
-- fichas de knowledge_embeddings más parecidas.
--
-- Supuesto: SECURITY INVOKER, a diferencia de create_order_from_cart (0016,
-- SECURITY DEFINER). create_order_from_cart necesita saltarse RLS a
-- propósito: orquesta inserts/updates en tablas donde el comprador no tiene
-- permiso directo (orders, order_items, products.stock) dentro de una sola
-- transacción atómica. match_knowledge solo hace SELECT sobre
-- knowledge_embeddings: debe respetar la visibilidad del caller tal como lo
-- haría una query directa — no hay ninguna razón de negocio para saltarse
-- RLS aquí, y hacerlo expondría fichas a quien no debería verlas.
create function public.match_knowledge(
  query_embedding extensions.vector(384),
  p_source_type text default null,
  match_count int default 5,
  similarity_threshold float default 0.3
)
returns table (
  source_type text,
  source_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security invoker
set search_path = public, extensions
as $$
begin
  return query
  select
    ke.source_type,
    ke.source_id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from public.knowledge_embeddings ke
  where (p_source_type is null or ke.source_type = p_source_type)
    and 1 - (ke.embedding <=> query_embedding) >= similarity_threshold
  order by ke.embedding <=> query_embedding
  limit match_count;
end;
$$;
