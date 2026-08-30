-- SELECT solo para authenticated (decisión 1 de la spec: la IA exige
-- sesión — protege la cuota gratuita de Hugging Face y evita una pestaña de
-- búsqueda IA "muerta" para anónimos en vez de mostrarla rota).
--
-- Supuesto: la política compara auth.uid() is not null (equivalente a
-- "hay sesión"), NO "using (true)". Postgres local de Supabase otorga por
-- defecto SELECT/INSERT/UPDATE/DELETE a anon Y a authenticated en toda
-- tabla nueva de public (ALTER DEFAULT PRIVILEGES del bootstrap, verificado
-- contra information_schema.role_table_grants) — el GRANT explícito de
-- abajo es documentación, no la barrera real. Con "using (true)" un
-- anónimo vería todas las fichas en cuanto hubiera filas: la única
-- protección real contra anon es el USING, igual que en profiles/cart_items
-- con auth.uid() = owner.
--
-- Sin política ni GRANT de INSERT/UPDATE/DELETE: solo el service role
-- escribe (indexación vía Route Handler y scripts, Fase 4.3), que se salta
-- RLS por defecto y no necesita política — el default-grant a anon no
-- importa aquí porque no hay política que permita esas operaciones (RLS
-- deniega por defecto sin política, sin importar el GRANT).
create policy "knowledge_embeddings_select_policy"
  on public.knowledge_embeddings for select
  using (auth.uid() is not null);

grant select on public.knowledge_embeddings to authenticated;
revoke select on public.knowledge_embeddings from anon;

revoke execute on function public.match_knowledge(extensions.vector, text, int, float) from public, anon;
grant execute on function public.match_knowledge(extensions.vector, text, int, float) to authenticated;
