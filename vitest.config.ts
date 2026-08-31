import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    // Node environment: no jsdom, no Testing Library (decisión 6 de la sesión).
    // Los tests unitarios NO tocan componentes React.
    environment: "node",

    // Encuentra todos los tests sin restricciones de nombre. El patrón es flexible
    // pero convención: archivo.test.ts vive al lado del archivo.test.ts.
    include: ["**/*.test.ts"],

    // Excluye las zonas de alto riesgo: dependencias, infraestructura de E2E,
    // caché de Next, MCP (Fase 5), y docs/ (contiene ejemplos/ab-tests, no código de producción).
    exclude: ["node_modules", "mcp", "e2e", ".next", "docs"],

    // Coverage con v8 (instalado en Prompt 0). Reporteros:
    // - `text`: tabla en la terminal tras `npm run test:coverage`.
    // - `html`: reporte visual en `coverage/index.html` (17 líneas = ~2min de lectura).
    // Limitar a lib/ y services/: son donde vive la lógica pura y de negocio.
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**", "services/**"],
      exclude: ["node_modules"],
    },
  },

  // Resolver: replica el tsconfig.json de la app.
  // `@/*` resuelve a la raíz, igual que en Next.js.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
