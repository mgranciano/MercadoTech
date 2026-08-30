import { NextResponse } from "next/server"

// Respuesta de error consistente para los Route Handlers de app/api/v1/*
// (reindex, search/semantic, chat): mismo shape, código legible por máquina
// y mensaje legible por humano.
export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status })
}
