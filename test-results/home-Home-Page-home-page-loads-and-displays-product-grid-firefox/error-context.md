# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page >> home page loads and displays product grid
- Location: e2e/tests/home.spec.ts:5:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
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
                - paragraph [ref=e85]: MacBook Pro 16"
                - generic [ref=e86]: Nuevo
              - generic [ref=e87]:
                - generic [ref=e88]: Apple
                - heading "MacBook Pro 16\"" [level=3] [ref=e89]
                - generic [ref=e90]: $3500,00
            - link "iPhone 15 Pro Nuevo Apple iPhone 15 Pro (1) $1199,00" [ref=e92] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440002
              - generic [ref=e93]:
                - paragraph [ref=e100]: iPhone 15 Pro
                - generic [ref=e101]: Nuevo
              - generic [ref=e102]:
                - generic [ref=e103]: Apple
                - heading "iPhone 15 Pro" [level=3] [ref=e104]
                - generic [ref=e105]: (1)
                - generic [ref=e144]: $1199,00
            - link "RTX 4090 Nuevo NVIDIA RTX 4090 $1599,00" [ref=e146] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440003
              - generic [ref=e147]:
                - paragraph [ref=e154]: RTX 4090
                - generic [ref=e155]: Nuevo
              - generic [ref=e156]:
                - generic [ref=e157]: NVIDIA
                - heading "RTX 4090" [level=3] [ref=e158]
                - generic [ref=e159]: $1599,00
            - link "Sony WH-1000XM5 Nuevo Sony Sony WH-1000XM5 $399,00" [ref=e161] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440004
              - generic [ref=e162]:
                - paragraph [ref=e169]: Sony WH-1000XM5
                - generic [ref=e170]: Nuevo
              - generic [ref=e171]:
                - generic [ref=e172]: Sony
                - heading "Sony WH-1000XM5" [level=3] [ref=e173]
                - generic [ref=e174]: $399,00
            - link "Logitech G Pro X2 Nuevo Logitech Logitech G Pro X2 (1) $199,99" [ref=e176] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440005
              - generic [ref=e177]:
                - paragraph [ref=e184]: Logitech G Pro X2
                - generic [ref=e185]: Nuevo
              - generic [ref=e186]:
                - generic [ref=e187]: Logitech
                - heading "Logitech G Pro X2" [level=3] [ref=e188]
                - generic [ref=e189]: (1)
                - generic [ref=e225]: $199,99
            - link "Dell UltraSharp U2723DE Nuevo Dell Dell UltraSharp U2723DE $599,00" [ref=e227] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440006
              - generic [ref=e228]:
                - paragraph [ref=e235]: Dell UltraSharp U2723DE
                - generic [ref=e236]: Nuevo
              - generic [ref=e237]:
                - generic [ref=e238]: Dell
                - heading "Dell UltraSharp U2723DE" [level=3] [ref=e239]
                - generic [ref=e240]: $599,00
            - link "Cable HDMI 2.1 8K Nuevo Belkin Cable HDMI 2.1 8K $29,99" [ref=e242] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440007
              - generic [ref=e243]:
                - paragraph [ref=e250]: Cable HDMI 2.1 8K
                - generic [ref=e251]: Nuevo
              - generic [ref=e252]:
                - generic [ref=e253]: Belkin
                - heading "Cable HDMI 2.1 8K" [level=3] [ref=e254]
                - generic [ref=e255]: $29,99
            - link "TP-Link Archer AXE300 Nuevo TP-Link TP-Link Archer AXE300 $299,00" [ref=e257] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440008
              - generic [ref=e258]:
                - paragraph [ref=e265]: TP-Link Archer AXE300
                - generic [ref=e266]: Nuevo
              - generic [ref=e267]:
                - generic [ref=e268]: TP-Link
                - heading "TP-Link Archer AXE300" [level=3] [ref=e269]
                - generic [ref=e270]: $299,00
            - link "Samsung Galaxy S24 Nuevo Samsung Samsung Galaxy S24 $999,00" [ref=e272] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440010
              - generic [ref=e273]:
                - paragraph [ref=e280]: Samsung Galaxy S24
                - generic [ref=e281]: Nuevo
              - generic [ref=e282]:
                - generic [ref=e283]: Samsung
                - heading "Samsung Galaxy S24" [level=3] [ref=e284]
                - generic [ref=e285]: $999,00
            - link "Lenovo ThinkPad X1 Usado Lenovo Lenovo ThinkPad X1 $749,00" [ref=e287] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440011
              - generic [ref=e288]:
                - paragraph [ref=e295]: Lenovo ThinkPad X1
                - generic [ref=e296]: Usado
              - generic [ref=e297]:
                - generic [ref=e298]: Lenovo
                - heading "Lenovo ThinkPad X1" [level=3] [ref=e299]
                - generic [ref=e300]: $749,00
            - link "AMD Ryzen 9 7950X Nuevo AMD AMD Ryzen 9 7950X $549,00" [ref=e302] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440012
              - generic [ref=e303]:
                - paragraph [ref=e310]: AMD Ryzen 9 7950X
                - generic [ref=e311]: Nuevo
              - generic [ref=e312]:
                - generic [ref=e313]: AMD
                - heading "AMD Ryzen 9 7950X" [level=3] [ref=e314]
                - generic [ref=e315]: $549,00
            - link "Razer DeathAdder V3 Nuevo Razer Razer DeathAdder V3 $69,99" [ref=e317] [cursor=pointer]:
              - /url: /producto/770e8400-e29b-41d4-a716-446655440013
              - generic [ref=e318]:
                - paragraph [ref=e325]: Razer DeathAdder V3
                - generic [ref=e326]: Nuevo
              - generic [ref=e327]:
                - generic [ref=e328]: Razer
                - heading "Razer DeathAdder V3" [level=3] [ref=e329]
                - generic [ref=e330]: $69,99
          - generic [ref=e332]:
            - button [disabled] [ref=e333]
            - generic [ref=e336]: Página 1 de 2
            - button [ref=e337]
  - contentinfo [ref=e340]:
    - paragraph [ref=e343]: © 2024 MercadoTech. Todos los derechos reservados.
  - button "✦ Asistente AI" [ref=e344]:
    - generic [ref=e345]: ✦
    - generic [ref=e346]: Asistente AI
  - button "Open Next.js Dev Tools" [ref=e352] [cursor=pointer]
  - alert [ref=e357]
```

# Test source

```ts
  1  | import { test, expect } from '../fixtures/test'
  2  | import { HomePage } from '../pages/HomePage'
  3  | 
  4  | test.describe('Home Page', () => {
  5  |   test('home page loads and displays product grid', async ({ page }) => {
  6  |     const homePage = new HomePage(page)
  7  |     await homePage.navigate()
  8  |     await homePage.isLoaded()
  9  | 
  10 |     // Verify grid is visible
  11 |     const productGrid = page.getByTestId('shop-product-grid')
  12 |     await expect(productGrid).toBeVisible()
  13 | 
  14 |     // Verify at least one product is displayed
  15 |     const productCount = await homePage.getProductCount()
> 16 |     expect(productCount).toBeGreaterThan(0)
     |                          ^ Error: expect(received).toBeGreaterThan(expected)
  17 |   })
  18 | 
  19 |   test('product count is correct', async ({ page }) => {
  20 |     const homePage = new HomePage(page)
  21 |     await homePage.navigate()
  22 |     await homePage.isLoaded()
  23 | 
  24 |     const count = await homePage.getProductCount()
  25 |     expect(count).toBeGreaterThanOrEqual(1)
  26 |   })
  27 | 
  28 |   test('navigation menu is visible', async ({ page }) => {
  29 |     const homePage = new HomePage(page)
  30 |     await homePage.navigate()
  31 |     await homePage.isLoaded()
  32 | 
  33 |     // Check for navigation elements
  34 |     const homeLink = page.getByTestId('nav-home-link')
  35 |     await expect(homeLink).toBeVisible()
  36 |   })
  37 | })
  38 | 
```