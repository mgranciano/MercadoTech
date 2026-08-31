# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: buyer-negative.spec.ts >> Buyer Negative Cases >> anonymous cart page redirect testids
- Location: e2e/tests/buyer-negative.spec.ts:68:7

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
  2  | import { HomePage } from '@/e2e/pages/HomePage'
  3  | import { CartPage } from '@/e2e/pages/CartPage'
  4  | 
  5  | test.describe('Buyer Negative Cases', () => {
  6  |   test('product with stock 0 shows correct testids', async ({ page }) => {
  7  |     // Caso 1: Find product with stock 0 and verify UI state
  8  |     await test.step('Caso 1: Verify product with stock 0 testids', async () => {
  9  |       await page.goto('http://localhost:3000/')
  10 | 
  11 |       const products = page.locator('[data-testid^="shop-product-card-"]')
  12 |       const productCount = await products.count()
  13 | 
  14 |       // Navigate through products to find one with stock 0
  15 |       for (let i = 0; i < Math.min(productCount, 5); i++) {
  16 |         const product = products.nth(i)
  17 |         const productId = await product.getAttribute('data-testid')
  18 | 
  19 |         if (productId) {
  20 |           await product.click()
  21 | 
  22 |           // Check for stock information
  23 |           const stockElement = page.getByTestId('product-stock')
  24 |           const stockZeroMsg = page.getByTestId('product-stock-zero-msg')
  25 |           const addToCartBtn = page.getByTestId('product-add-to-cart-btn')
  26 | 
  27 |           try {
  28 |             await stockElement.waitFor({ timeout: 1000 })
  29 |             const stockText = await stockElement.textContent()
  30 | 
  31 |             if (stockText?.includes('Sin stock')) {
  32 |               // Found product with no stock
  33 |               const isZeroMsgVisible = await stockZeroMsg.isVisible({ timeout: 1000 }).catch(() => false)
  34 |               const isBtnDisabled = await addToCartBtn.isDisabled({ timeout: 1000 }).catch(() => false)
  35 | 
  36 |               expect(isZeroMsgVisible || isBtnDisabled).toBe(true)
  37 |               break
  38 |             }
  39 |           } catch {
  40 |             // Element not found, go back
  41 |           }
  42 | 
  43 |           await page.goBack()
  44 |         }
  45 |       }
  46 |     })
  47 |   })
  48 | 
  49 |   test('empty cart checkout prevention', async ({ page }) => {
  50 |     // Caso 2: Verify empty cart prevents checkout
  51 |     await test.step('Caso 2: Verify empty cart testids', async () => {
  52 |       const cartPage = new CartPage(page)
  53 |       await cartPage.navigate()
  54 | 
  55 |       // Check if cart is empty
  56 |       const emptyMsg = page.getByTestId('cart-empty-message')
  57 |       const checkoutBtn = page.getByTestId('cart-checkout-btn')
  58 | 
  59 |       const isEmpty = await emptyMsg.isVisible({ timeout: 2000 }).catch(() => false)
  60 |       const btnExists = await checkoutBtn.isVisible({ timeout: 1000 }).catch(() => false)
  61 |       const btnDisabled = await checkoutBtn.isDisabled({ timeout: 1000 }).catch(() => false)
  62 | 
  63 |       // Either cart is empty OR checkout button is disabled
  64 |       expect(isEmpty || btnDisabled || !btnExists).toBe(true)
  65 |     })
  66 |   })
  67 | 
  68 |   test('anonymous cart page redirect testids', async ({ page }) => {
  69 |     // Caso 3: Anonymous user navigation
  70 |     await test.step('Caso 3: Verify navigation testids visible to anonymous', async () => {
  71 |       await page.goto('http://localhost:3000/')
  72 | 
  73 |       // Verify navbar testids are present for all users
  74 |       const navHome = page.getByTestId('nav-home-link')
  75 |       const navCart = page.getByTestId('nav-cart-link')
  76 | 
  77 |       await expect(navHome).toBeVisible()
> 78 |       await expect(navCart).toBeVisible()
     |                             ^ Error: expect(locator).toBeVisible() failed
  79 | 
  80 |       // Navigate to cart
  81 |       await navCart.click()
  82 | 
  83 |       // Should either show empty cart or redirect
  84 |       const cartEmpty = page.getByTestId('cart-empty-message')
  85 |       const cartContainer = page.getByTestId('cart-container')
  86 |       const loginForm = page.getByTestId('auth-email')
  87 | 
  88 |       const isCartEmpty = await cartEmpty.isVisible({ timeout: 2000 }).catch(() => false)
  89 |       const isCartContainer = await cartContainer.isVisible({ timeout: 2000 }).catch(() => false)
  90 |       const isLoginForm = await loginForm.isVisible({ timeout: 2000 }).catch(() => false)
  91 | 
  92 |       expect(isCartEmpty || isCartContainer || isLoginForm).toBe(true)
  93 |     })
  94 |   })
  95 | })
  96 | 
```