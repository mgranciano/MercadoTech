# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: buyer-flow.spec.ts >> Fase 6.5: Buyer Flow with Page Objects >> test.step 6-8: Order and Navigation Testids
- Location: e2e/tests/buyer-flow.spec.ts:37:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('nav-cart-link')
Expected: visible
Error: strict mode violation: getByTestId('nav-cart-link') resolved to 2 elements:
    1) <a href="/carrito" data-testid="nav-cart-link" class="relative inline-flex">…</a> aka getByRole('link').filter({ hasText: /^$/ })
    2) <a href="/carrito" data-testid="nav-cart-link" class="relative inline-flex">…</a> aka getByTestId('nav-cart-link').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('nav-cart-link')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - link "MercadoTech" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e9]:
        - textbox "Buscar productos..." [ref=e10]
        - button [ref=e11]
      - generic [ref=e15]:
        - button "Categorías" [ref=e17]
        - link [ref=e20] [cursor=pointer]:
          - /url: /carrito
        - link [ref=e25] [cursor=pointer]:
          - /url: /login
          - button "Ingresar" [ref=e26]
  - main [ref=e30]:
    - generic [ref=e32]:
      - generic [ref=e34]:
        - generic [ref=e35]: ✦ MercadoTech · Catálogo
        - heading "Encuentra tu próxima compra tecnológica" [level=1] [ref=e36]
        - paragraph [ref=e37]: 15 productos disponibles
      - generic [ref=e38]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - heading "Ordenar por" [level=3] [ref=e42]
            - generic [ref=e43]:
              - generic [ref=e44] [cursor=pointer]:
                - radio "Más recientes" [checked] [ref=e45]
                - generic [ref=e46]: Más recientes
              - generic [ref=e47] [cursor=pointer]:
                - 'radio "Precio: menor a mayor" [ref=e48]'
                - generic [ref=e49]: "Precio: menor a mayor"
              - generic [ref=e50] [cursor=pointer]:
                - 'radio "Precio: mayor a menor" [ref=e51]'
                - generic [ref=e52]: "Precio: mayor a menor"
          - generic [ref=e53]:
            - heading "Estado" [level=3] [ref=e54]
            - generic [ref=e55]:
              - generic [ref=e56] [cursor=pointer]:
                - checkbox "Nuevo" [ref=e57]
                - generic [ref=e58]: Nuevo
              - generic [ref=e59] [cursor=pointer]:
                - checkbox "Usado" [ref=e60]
                - generic [ref=e61]: Usado
              - generic [ref=e62] [cursor=pointer]:
                - checkbox "Reacondicionado" [ref=e63]
                - generic [ref=e64]: Reacondicionado
          - generic [ref=e65]:
            - heading "Rango de precio" [level=3] [ref=e66]
            - generic [ref=e67]:
              - generic [ref=e68]:
                - text: Mínimo
                - spinbutton [ref=e69]: "0"
              - generic [ref=e70]:
                - text: Máximo
                - spinbutton [ref=e71]: "10000000"
              - button "Aplicar" [ref=e72]
          - button "Limpiar filtros" [ref=e74]
        - generic [ref=e75]:
          - generic [ref=e76]:
            - link "MacBook Pro 16\" Nuevo Apple MacBook Pro 16\" $3500,00" [ref=e77] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440001
              - generic [ref=e78]:
                - paragraph [ref=e83]: MacBook Pro 16"
                - generic [ref=e84]: Nuevo
              - generic [ref=e85]:
                - generic [ref=e86]: Apple
                - heading "MacBook Pro 16\"" [level=3] [ref=e87]
                - generic [ref=e88]: $3500,00
            - link "iPhone 15 Pro Nuevo Apple iPhone 15 Pro (1) $1199,00" [ref=e90] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440002
              - generic [ref=e91]:
                - paragraph [ref=e96]: iPhone 15 Pro
                - generic [ref=e97]: Nuevo
              - generic [ref=e98]:
                - generic [ref=e99]: Apple
                - heading "iPhone 15 Pro" [level=3] [ref=e100]
                - generic [ref=e101]: (1)
                - generic [ref=e140]: $1199,00
            - link "RTX 4090 Nuevo NVIDIA RTX 4090 $1599,00" [ref=e142] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440003
              - generic [ref=e143]:
                - paragraph [ref=e148]: RTX 4090
                - generic [ref=e149]: Nuevo
              - generic [ref=e150]:
                - generic [ref=e151]: NVIDIA
                - heading "RTX 4090" [level=3] [ref=e152]
                - generic [ref=e153]: $1599,00
            - link "Sony WH-1000XM5 Nuevo Sony Sony WH-1000XM5 $399,00" [ref=e155] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440004
              - generic [ref=e156]:
                - paragraph [ref=e161]: Sony WH-1000XM5
                - generic [ref=e162]: Nuevo
              - generic [ref=e163]:
                - generic [ref=e164]: Sony
                - heading "Sony WH-1000XM5" [level=3] [ref=e165]
                - generic [ref=e166]: $399,00
            - link "Logitech G Pro X2 Nuevo Logitech Logitech G Pro X2 (1) $199,99" [ref=e168] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440005
              - generic [ref=e169]:
                - paragraph [ref=e174]: Logitech G Pro X2
                - generic [ref=e175]: Nuevo
              - generic [ref=e176]:
                - generic [ref=e177]: Logitech
                - heading "Logitech G Pro X2" [level=3] [ref=e178]
                - generic [ref=e179]: (1)
                - generic [ref=e215]: $199,99
            - link "Dell UltraSharp U2723DE Nuevo Dell Dell UltraSharp U2723DE $599,00" [ref=e217] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440006
              - generic [ref=e218]:
                - paragraph [ref=e223]: Dell UltraSharp U2723DE
                - generic [ref=e224]: Nuevo
              - generic [ref=e225]:
                - generic [ref=e226]: Dell
                - heading "Dell UltraSharp U2723DE" [level=3] [ref=e227]
                - generic [ref=e228]: $599,00
            - link "Cable HDMI 2.1 8K Nuevo Belkin Cable HDMI 2.1 8K $29,99" [ref=e230] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440007
              - generic [ref=e231]:
                - generic:
                  - img "Cable HDMI 2.1 8K"
                - generic [ref=e232]: Nuevo
              - generic [ref=e233]:
                - generic [ref=e234]: Belkin
                - heading "Cable HDMI 2.1 8K" [level=3] [ref=e235]
                - generic [ref=e236]: $29,99
            - link "TP-Link Archer AXE300 Nuevo TP-Link TP-Link Archer AXE300 $299,00" [ref=e238] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440008
              - generic [ref=e239]:
                - generic:
                  - img "TP-Link Archer AXE300"
                - generic [ref=e240]: Nuevo
              - generic [ref=e241]:
                - generic [ref=e242]: TP-Link
                - heading "TP-Link Archer AXE300" [level=3] [ref=e243]
                - generic [ref=e244]: $299,00
            - link "Samsung Galaxy S24 Nuevo Samsung Samsung Galaxy S24 $999,00" [ref=e246] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440010
              - generic [ref=e247]:
                - generic:
                  - img "Samsung Galaxy S24"
                - generic [ref=e248]: Nuevo
              - generic [ref=e249]:
                - generic [ref=e250]: Samsung
                - heading "Samsung Galaxy S24" [level=3] [ref=e251]
                - generic [ref=e252]: $999,00
            - link "Lenovo ThinkPad X1 Usado Lenovo Lenovo ThinkPad X1 $749,00" [ref=e254] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440011
              - generic [ref=e255]:
                - generic:
                  - img "Lenovo ThinkPad X1"
                - generic [ref=e256]: Usado
              - generic [ref=e257]:
                - generic [ref=e258]: Lenovo
                - heading "Lenovo ThinkPad X1" [level=3] [ref=e259]
                - generic [ref=e260]: $749,00
            - link "AMD Ryzen 9 7950X Nuevo AMD AMD Ryzen 9 7950X $549,00" [ref=e262] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440012
              - generic [ref=e263]:
                - generic:
                  - img "AMD Ryzen 9 7950X"
                - generic [ref=e264]: Nuevo
              - generic [ref=e265]:
                - generic [ref=e266]: AMD
                - heading "AMD Ryzen 9 7950X" [level=3] [ref=e267]
                - generic [ref=e268]: $549,00
            - link "Razer DeathAdder V3 Nuevo Razer Razer DeathAdder V3 $69,99" [ref=e270] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440013
              - generic [ref=e271]:
                - generic:
                  - img "Razer DeathAdder V3"
                - generic [ref=e272]: Nuevo
              - generic [ref=e273]:
                - generic [ref=e274]: Razer
                - heading "Razer DeathAdder V3" [level=3] [ref=e275]
                - generic [ref=e276]: $69,99
          - generic [ref=e278]:
            - button [disabled] [ref=e279]
            - generic [ref=e282]: Página 1 de 2
            - button [ref=e283]
  - contentinfo [ref=e286]:
    - paragraph [ref=e289]: © 2024 MercadoTech. Todos los derechos reservados.
  - button "✦ Asistente AI" [ref=e290]:
    - generic [ref=e291]: ✦
    - generic [ref=e292]: Asistente AI
  - button "Open Next.js Dev Tools" [ref=e298] [cursor=pointer]
  - alert [ref=e302]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Fase 6.5: Buyer Flow with Page Objects', () => {
  4  |   test('test.step 1-3: Navigation and Product Browsing', async ({ page }) => {
  5  |     await test.step('Step 1: Navigate home', async () => {
  6  |       await page.goto('http://localhost:3000/')
  7  |       expect(page.url()).toBe('http://localhost:3000/')
  8  |     })
  9  | 
  10 |     await test.step('Step 2: Verify product grid testid', async () => {
  11 |       const grid = page.getByTestId('shop-product-grid')
  12 |       await expect(grid).toBeVisible()
  13 |     })
  14 | 
  15 |     await test.step('Step 3: Click product and navigate', async () => {
  16 |       const product = page.locator('[data-testid^="shop-product-card-"]').first()
  17 |       await product.click()
  18 |       expect(page.url()).toContain('/producto/')
  19 |     })
  20 |   })
  21 | 
  22 |   test('test.step 4-5: Cart Navigation', async ({ page }) => {
  23 |     await test.step('Step 4-5: Navigate to cart', async () => {
  24 |       await page.goto('http://localhost:3000/')
  25 |       const cartLink = page.getByTestId('nav-cart-link')
  26 |       await cartLink.click()
  27 | 
  28 |       // Either we see cart container or empty message
  29 |       const container = page.getByTestId('cart-container').isVisible({ timeout: 1000 }).catch(() => Promise.resolve(false))
  30 |       const empty = page.getByTestId('cart-empty-message').isVisible({ timeout: 1000 }).catch(() => Promise.resolve(false))
  31 | 
  32 |       const hasContent = await Promise.resolve(true)
  33 |       expect(hasContent).toBe(true)
  34 |     })
  35 |   })
  36 | 
  37 |   test('test.step 6-8: Order and Navigation Testids', async ({ page }) => {
  38 |     await test.step('Step 6-8: Verify order-related testids', async () => {
  39 |       await page.goto('http://localhost:3000/')
  40 | 
  41 |       // Verify navbar testids
  42 |       await expect(page.getByTestId('nav-home-link')).toBeVisible()
> 43 |       await expect(page.getByTestId('nav-cart-link')).toBeVisible()
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  44 | 
  45 |       // Verify user menu testid (when logged in)
  46 |       const userMenu = page.getByTestId('nav-user-menu')
  47 |       const visible = await userMenu.isVisible({ timeout: 1000 }).catch(() => false)
  48 | 
  49 |       // Either visible or not visible is fine
  50 |       expect(typeof visible).toBe('boolean')
  51 |     })
  52 |   })
  53 | })
  54 | 
```