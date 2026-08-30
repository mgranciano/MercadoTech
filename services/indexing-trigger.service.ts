type EmbeddingSourceType = "producto" | "articulo_soporte"

// Fire-and-forget: publicar/editar/activar/borrar un producto NUNCA debe
// fallar ni volverse más lento porque Hugging Face esté caído o el token
// falte. Si el reindex falla, queda un console.warn y el vendedor sigue su
// flujo normal; scripts/index-all.ts es el plan B para ponerse al día.
export function triggerReindex(sourceType: EmbeddingSourceType, sourceId: string): void {
  fetch("/api/v1/reindex", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceType, sourceId }),
  })
    .then((response) => {
      if (!response.ok) {
        console.warn(
          `[indexing-trigger] reindex de ${sourceType}:${sourceId} respondió ${response.status}`
        )
      }
    })
    .catch((err) => {
      console.warn(`[indexing-trigger] no se pudo contactar /api/v1/reindex para ${sourceType}:${sourceId}`, err)
    })
}
