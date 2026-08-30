-- Habilita pgvector para los embeddings de la Fase 4 (RAG). El nombre real
-- de la extensión en Postgres es "vector" (no "pgvector", como quedó escrito
-- por error en schema.sql antes de esta sesión, sin migración que lo
-- respalde). Se instala en extensions, no en public, como el resto.
create extension if not exists "vector" schema extensions;
