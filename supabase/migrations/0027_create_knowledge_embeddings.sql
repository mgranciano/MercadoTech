-- "Fichero" del bibliotecario (Fase 4, RAG): una ficha por producto o
-- artículo de soporte, vectorizada para búsqueda semántica.
--
-- Supuesto: UNA tabla discriminada por source_type, no dos tablas gemelas
-- (una para productos, otra para artículos), porque match_knowledge necesita
-- poder buscar en ambas fuentes a la vez (el chat de soporte puede citar
-- cualquiera) o filtrar a una sola (la búsqueda del catálogo solo quiere
-- productos) sin un UNION entre tablas ni dos índices HNSW que mantener.
--
-- Supuesto: source_id es uuid SIN foreign key porque apunta a dos tablas
-- origen distintas (products o support_articles) según source_type —
-- Postgres no soporta una FK condicional. Consecuencia: si se borra el
-- producto o artículo de origen, la ficha queda huérfana (sin error, sin
-- cascada). El service de búsqueda (Fase 4.4) descarta huérfanos al
-- hidratar contra la tabla real, y la indexación (Fase 4.3) los limpia al
-- reindexar.
create table public.knowledge_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('producto', 'articulo_soporte')),
  source_id uuid not null,
  chunk_index integer not null default 0,
  content text not null,
  embedding extensions.vector(384) not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (source_type, source_id, chunk_index)
);

-- Supuesto: 384 es la dimensión del modelo de embeddings vigente
-- (sentence-transformers/all-MiniLM-L6-v2, decisión cerrada de la Fase 4.2).
-- Cambiar a un modelo con otra dimensión NO es solo cambiar una variable de
-- entorno: exige "alter column embedding type vector(N)" + recrear el
-- índice HNSW y la función match_knowledge (ambos quedan grabados con 384
-- en su firma).
comment on column public.knowledge_embeddings.embedding is
  'vector(384) fijo para sentence-transformers/all-MiniLM-L6-v2. Cambiar de modelo con otra dimensión exige ALTER COLUMN ... TYPE vector(N) + recrear el índice HNSW y la función match_knowledge.';

create index idx_knowledge_embeddings_hnsw
  on public.knowledge_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.knowledge_embeddings enable row level security;
