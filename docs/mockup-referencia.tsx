// MercadoTechApp.tsx — mockup completo (catálogo, detalle, carrito, auth, kanban vendedor, perfil comprador + chatbot IA)
// Requiere: React 18+, Tailwind CSS. Fuentes: Manrope + IBM Plex Mono.
// Añade en tu index.html / layout:
// <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
// tailwind.config: theme.extend.fontFamily = { sans: ['Manrope','system-ui','sans-serif'], mono: ['"IBM Plex Mono"','monospace'] }

import React, { useMemo, useState } from "react";

/* ───────────────────────────── TIPOS ───────────────────────────── */

type View = "catalog" | "offers" | "detail" | "cart" | "auth" | "seller" | "orders";
type OrderStatus = "Pendiente" | "Pagado" | "Enviado" | "Entregado" | "Cancelado";

interface Product {
  id: number; name: string; brand: string; cat: string;
  price: number; old: number; rating: number; reviews: number;
  match: number; img: string; sold: number;
  desc: string; ai: string; tags: string[]; specs: [string, string][];
}
interface CartItem { id: number; qty: number }
interface SellerOrder {
  id: string; status: OrderStatus; pid: number; product: string; buyer: string;
  items: string; total: string; date: string; img: string; next: string; alert?: string;
}
interface Purchase {
  id: string; status: OrderStatus; pid: number; product: string;
  detail: string; total: string; date: string; img: string; action: string;
}
interface Message { from: "me" | "bot"; text: string; source?: string }

/* ───────────────────────────── DATOS MOCK ───────────────────────────── */

const PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop IA Vector 14 · Ryzen 9 / 32 GB / NPU', brand: 'Nova', cat: 'Laptops', price: 32999, old: 38999, rating: 4.8, reviews: 1284, match: 96, img: 'laptop 14" abierta', sold: 2410,
    desc: 'Ultrabook de 14" con procesador de 12 núcleos y NPU dedicada de 45 TOPS para inferencia local. Chasis de magnesio de 1.19 kg y pantalla OLED calibrada de fábrica.',
    ai: 'Este equipo es ideal para ti porque su NPU de 45 TOPS ejecuta modelos locales sin depender de la nube: buscaste equipos para desarrollo y edición, y aquí obtienes 32 GB de RAM con 11 h de batería real.',
    tags: ['NPU 45 TOPS', 'Mejor batería del rango', '32 GB multitarea'],
    specs: [['Procesador', 'Ryzen 9 8945HS · 12 núcleos'], ['NPU', '45 TOPS dedicados'], ['Memoria', '32 GB LPDDR5X 7500 MHz'], ['Almacenamiento', 'SSD NVMe 1 TB Gen4'], ['Pantalla', '14" OLED 2.8K · 120 Hz'], ['Batería', '75 Wh · 11 h de uso mixto'], ['Peso', '1.19 kg'], ['Garantía', '24 meses']] },
  { id: 2, name: 'Smartphone Orion X5 · 512 GB', brand: 'Orion', cat: 'Smartphones', price: 18499, old: 21999, rating: 4.6, reviews: 3902, match: 91, img: 'smartphone frontal', sold: 8120,
    desc: 'Gama alta con cámara computacional de 200 MP, procesamiento de imagen por IA en tiempo real y carga de 120 W.',
    ai: 'Es ideal para ti por su cámara con procesamiento IA: el 92% de las opiniones destacan la fotografía nocturna, y la carga de 120 W recupera 60% en 15 minutos.',
    tags: ['Cámara IA 200 MP', 'Carga 120 W', 'Top en opiniones'],
    specs: [['Pantalla', '6.7" AMOLED 144 Hz'], ['Chip', 'Orion Neural 9200'], ['Cámara', '200 MP + 50 MP UGA'], ['Memoria', '12 GB / 512 GB'], ['Batería', '5400 mAh · 120 W'], ['Resistencia', 'IP68']] },
  { id: 3, name: 'Monitor UltraCurve 32" 4K 165 Hz', brand: 'Pixa', cat: 'Monitores', price: 12799, old: 14499, rating: 4.5, reviews: 741, match: 84, img: 'monitor curvo 32"', sold: 980,
    desc: 'Panel curvo 1000R con cobertura 98% DCI-P3, HDR600 y hub USB-C de 90 W.',
    ai: 'Recomendado si trabajas con laptop: un solo cable USB-C entrega imagen 4K y 90 W de carga, eliminando el dock adicional.',
    tags: ['USB-C 90 W', '98% DCI-P3', 'HDR600'],
    specs: [['Panel', 'VA curvo 1000R'], ['Resolución', '3840 × 2160 · 165 Hz'], ['Color', '98% DCI-P3 · ΔE < 2'], ['Conexiones', '2× HDMI 2.1, DP 1.4, USB-C 90 W'], ['Ergonomía', 'Altura, giro e inclinación']] },
  { id: 4, name: 'Audífonos NeuroBuds Pro · ANC adaptativo', brand: 'Nova', cat: 'Audio', price: 4299, old: 5499, rating: 4.7, reviews: 2210, match: 88, img: 'audífonos in-ear', sold: 5300,
    desc: 'Cancelación de ruido adaptativa por IA que analiza el entorno 600 veces por segundo, audio espacial y 38 h con estuche.',
    ai: 'Ideales para ti por el ANC adaptativo: se ajustan solos entre oficina y transporte, y sus 38 h cubren una semana de uso.',
    tags: ['ANC adaptativo', '38 h de batería', 'Audio espacial'],
    specs: [['Drivers', '11 mm doble cámara'], ['ANC', 'Adaptativo · 48 dB'], ['Batería', '9 h + 29 h estuche'], ['Códecs', 'LDAC · aptX Lossless'], ['Resistencia', 'IPX5']] },
  { id: 5, name: 'Tarjeta gráfica Titan 5080 · 16 GB GDDR7', brand: 'Kirin', cat: 'Componentes', price: 27499, old: 29999, rating: 4.9, reviews: 512, match: 94, img: 'GPU triple ventilador', sold: 640,
    desc: 'GPU con 16 GB GDDR7 y aceleradores tensoriales de 4ª generación para entrenamiento e inferencia local.',
    ai: 'Ideal por sus 16 GB GDDR7: corre modelos de difusión y LLM de 13B en local, con 2.1× el rendimiento de la generación anterior.',
    tags: ['16 GB GDDR7', 'LLM locales', '4K 144 fps'],
    specs: [['Memoria', '16 GB GDDR7 · 256 bit'], ['Núcleos IA', '4ª gen · 1400 TOPS'], ['Consumo', '285 W · 2× 8 pines'], ['Salidas', '3× DP 2.1 · HDMI 2.1b'], ['Tamaño', '304 mm · 2.5 slots']] },
  { id: 6, name: 'Tablet Slate Air 11 + lápiz activo', brand: 'Orion', cat: 'Tablets', price: 9899, old: 11499, rating: 4.3, reviews: 1105, match: 79, img: 'tablet con lápiz', sold: 2100,
    desc: 'Tablet de 11" a 120 Hz con lápiz activo incluido y transcripción de notas por IA.',
    ai: 'Buena opción si tomas notas: la transcripción por IA convierte escritura a mano en texto editable sin conexión.',
    tags: ['Lápiz incluido', 'Transcripción IA', '120 Hz'],
    specs: [['Pantalla', '11" LCD 120 Hz'], ['Chip', 'Orion N7'], ['Memoria', '8 GB / 256 GB'], ['Batería', '8000 mAh'], ['Extras', 'Lápiz 4096 niveles']] },
  { id: 7, name: 'Teclado mecánico Lumen TKL inalámbrico', brand: 'Pixa', cat: 'Accesorios', price: 2199, old: 2699, rating: 4.4, reviews: 860, match: 72, img: 'teclado TKL RGB', sold: 3400,
    desc: 'Switches lineales hot-swap, chasis de aluminio y triple conectividad con 200 h de batería.',
    ai: 'Complementa tu setup: switches hot-swap para cambiar el tacto sin soldar y conexión simultánea con laptop y tablet.',
    tags: ['Hot-swap', 'Triple conexión', 'Aluminio'],
    specs: [['Formato', 'TKL 87 teclas'], ['Switches', 'Lineales hot-swap 45 g'], ['Conexión', '2.4 GHz · BT 5.2 · USB-C'], ['Batería', '4000 mAh · 200 h']] },
  { id: 8, name: 'Smartwatch Pulse 3 · GPS doble banda', brand: 'Kirin', cat: 'Wearables', price: 3899, old: 4599, rating: 4.2, reviews: 1520, match: 68, img: 'smartwatch frontal', sold: 4200,
    desc: 'AMOLED de 1.43", GPS doble banda y análisis de sueño y carga de entrenamiento por IA.',
    ai: 'Para ti por el análisis de carga de entrenamiento: ajusta metas diarias según tu recuperación real.',
    tags: ['GPS doble banda', '14 días', 'Análisis IA de sueño'],
    specs: [['Pantalla', '1.43" AMOLED'], ['Batería', '14 días típicos'], ['Sensores', 'SpO₂ · HR · ECG'], ['Resistencia', '5 ATM']] },
  { id: 9, name: 'Router Wi-Fi 7 MeshCore · 2 nodos', brand: 'Kirin', cat: 'Redes', price: 5699, old: 0, rating: 4.1, reviews: 430, match: 65, img: 'router mesh 2 nodos', sold: 720,
    desc: 'Sistema mesh tri-banda Wi-Fi 7 con puertos 2.5 GbE y priorización de tráfico automática.',
    ai: 'Recomendado si trabajas en casa: prioriza automáticamente videollamadas cuando detecta congestión.',
    tags: ['Wi-Fi 7', '2.5 GbE', 'QoS automático'],
    specs: [['Estándar', 'Wi-Fi 7 BE11000'], ['Cobertura', 'Hasta 420 m²'], ['Puertos', '2× 2.5 GbE por nodo'], ['Dispositivos', '150+ simultáneos']] },
  { id: 10, name: 'SSD NVMe Flux 2 TB Gen4 con disipador', brand: 'Pixa', cat: 'Componentes', price: 2899, old: 3499, rating: 4.6, reviews: 1980, match: 74, img: 'SSD M.2 disipador', sold: 6100,
    desc: 'Lectura de 7400 MB/s, disipador de aluminio y 1200 TBW de resistencia.',
    ai: 'Complemento directo para tu equipo: duplica el espacio de modelos y datasets sin cuellos de botella.',
    tags: ['7400 MB/s', '1200 TBW', 'Disipador incluido'],
    specs: [['Capacidad', '2 TB'], ['Interfaz', 'PCIe 4.0 ×4'], ['Lectura', '7400 MB/s'], ['Escritura', '6600 MB/s'], ['Garantía', '5 años']] },
];

const STATUS: Record<OrderStatus, { dot: string; badge: string }> = {
  Pendiente: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800" },
  Pagado:    { dot: "bg-[#0b4fd6]", badge: "bg-blue-100 text-blue-900" },
  Enviado:   { dot: "bg-[#22d3ee]", badge: "bg-cyan-100 text-cyan-800" },
  Entregado: { dot: "bg-green-600", badge: "bg-green-100 text-green-700" },
  Cancelado: { dot: "bg-[#e8175d]", badge: "bg-rose-100 text-rose-800" },
};
const COLUMNS = Object.keys(STATUS) as OrderStatus[];

const SELLER_ORDERS: SellerOrder[] = [
  { id: '#MT-10482', status: 'Pendiente', pid: 1, product: 'Laptop IA Vector 14', buyer: 'L. Gómez', items: '1 art.', total: '$32,999', date: '28 ago', img: 'laptop', next: 'Confirmar pago', alert: 'Riesgo de cancelación: sin pago en 26 h' },
  { id: '#MT-10479', status: 'Pendiente', pid: 3, product: 'Monitor UltraCurve 32"', buyer: 'D. Salas', items: '1 art.', total: '$12,799', date: '28 ago', img: 'monitor', next: 'Confirmar pago' },
  { id: '#MT-10471', status: 'Pagado', pid: 5, product: 'Tarjeta gráfica Titan 5080', buyer: 'M. Ortiz', items: '1 art.', total: '$27,499', date: '27 ago', img: 'GPU', next: 'Generar guía', alert: 'Lleva 48 h sin guía de envío' },
  { id: '#MT-10468', status: 'Pagado', pid: 4, product: 'Audífonos NeuroBuds Pro', buyer: 'A. Prado', items: '2 art.', total: '$8,598', date: '27 ago', img: 'audio', next: 'Generar guía' },
  { id: '#MT-10455', status: 'Enviado', pid: 2, product: 'Smartphone Orion X5', buyer: 'C. Ibarra', items: '1 art.', total: '$18,499', date: '26 ago', img: 'phone', next: 'Ver rastreo' },
  { id: '#MT-10450', status: 'Enviado', pid: 10, product: 'SSD NVMe Flux 2 TB', buyer: 'R. Luna', items: '3 art.', total: '$8,697', date: '26 ago', img: 'SSD', next: 'Ver rastreo' },
  { id: '#MT-10442', status: 'Entregado', pid: 7, product: 'Teclado Lumen TKL', buyer: 'S. Vera', items: '1 art.', total: '$2,199', date: '24 ago', img: 'teclado', next: 'Ver reseña' },
  { id: '#MT-10437', status: 'Entregado', pid: 6, product: 'Tablet Slate Air 11', buyer: 'J. Peña', items: '1 art.', total: '$9,899', date: '23 ago', img: 'tablet', next: 'Ver reseña' },
  { id: '#MT-10429', status: 'Cancelado', pid: 9, product: 'Router MeshCore Wi-Fi 7', buyer: 'N. Ruiz', items: '1 art.', total: '$5,699', date: '22 ago', img: 'router', next: 'Ver motivo' },
];

const PURCHASES: Purchase[] = [
  { id: '#MT-10455', status: 'Enviado', pid: 2, product: 'Smartphone Orion X5 · 512 GB', detail: 'Llega mañana · guía DHL 7742-9931', total: '$18,499', date: '26 ago', img: 'smartphone', action: 'Rastrear envío' },
  { id: '#MT-10482', status: 'Pendiente', pid: 1, product: 'Laptop IA Vector 14', detail: 'Esperando confirmación de pago', total: '$32,999', date: '28 ago', img: 'laptop', action: 'Pagar ahora' },
  { id: '#MT-10442', status: 'Entregado', pid: 7, product: 'Teclado mecánico Lumen TKL', detail: 'Entregado el 24 ago · 30 días para devolver', total: '$2,199', date: '24 ago', img: 'teclado', action: 'Calificar producto' },
  { id: '#MT-10429', status: 'Cancelado', pid: 9, product: 'Router MeshCore Wi-Fi 7', detail: 'Reembolso aplicado a tu tarjeta', total: '$5,699', date: '22 ago', img: 'router', action: 'Ver detalle' },
];

const FAV_IDS = [5, 3, 4, 10, 6, 8];
const BRANDS = ["Nova", "Orion", "Pixa", "Kirin"];
const CATS = Array.from(new Set(PRODUCTS.map(p => p.cat)));
const FREE_SHIPPING = 9999;
const CHIPS = ["¿Dónde está mi pedido?", "Políticas de devolución", "Ayuda con métodos de pago", "Recomiéndame una laptop"];

/* ───────────────────────────── HELPERS ───────────────────────────── */

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const stars = (r: number) => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));
const hasDiscount = (p: Product) => p.old > 0;
const discount = (p: Product) => (p.old > 0 ? `-${Math.round((1 - p.price / p.old) * 100)}%` : "");
const byId = (id: number) => PRODUCTS.find(p => p.id === id)!;

function ragReply(q: string): { text: string; source: string } {
  const t = q.toLowerCase();
  if (t.includes("pedido") || t.includes("dónde") || t.includes("rastre"))
    return { text: "Tu pedido #MT-10455 (Smartphone Orion X5) salió del centro de distribución CDMX y se entrega mañana antes de las 20:00 h. El repartidor intentará una sola visita.", source: "rastreo en vivo · guía DHL 7742-9931" };
  if (t.includes("devoluc"))
    return { text: "Tienes 30 días naturales desde la entrega para devolver sin costo: Mis compras › Devolver, imprime la etiqueta y entrégala en sucursal. El reembolso llega en 3–5 días hábiles al método original.", source: "Política de Devoluciones · sección 4.2" };
  if (t.includes("pago") || t.includes("método") || t.includes("pagar"))
    return { text: "Aceptamos tarjetas, transferencia SPEI, efectivo en tiendas y hasta 12 meses sin intereses con bancos participantes. Si tu pago fue rechazado, suele ser el CVV o el límite diario del banco.", source: "Centro de Ayuda · Pagos y facturación" };
  if (t.includes("laptop") || t.includes("recomi"))
    return { text: "Por tu historial te recomiendo la Laptop IA Vector 14 — $32,999, NPU de 45 TOPS, 32 GB RAM y 11 h de batería. Alternativa económica: Tablet Slate Air 11 con lápiz, $9,899.", source: "catálogo + tu historial de navegación" };
  if (t.includes("guía") || t.includes("envío") || t.includes("vendedor"))
    return { text: "Tienes 2 pedidos pagados sin guía (#MT-10471 y #MT-10468). Puedo generarlas en lote con la paquetería sugerida y notificar a ambos compradores.", source: "Seller Center · reglas de despacho" };
  return { text: "Busqué en el centro de ayuda y en tu cuenta. ¿Te refieres a un pedido en curso, a facturación o a un producto en particular? Puedo escalar con un asesor humano.", source: "base de conocimiento MercadoTech" };
}

/* ─────────── piezas visuales reutilizables ─────────── */

const Placeholder: React.FC<{ label: string; className?: string }> = ({ label, className = "" }) => (
  <div className={`flex items-center justify-center bg-[repeating-linear-gradient(135deg,#e9edf6_0_10px,#dfe5f1_10px_20px)] px-1 text-center ${className}`}>
    <span className="font-mono text-[9px] leading-tight text-[#6d7789]">{label}</span>
  </div>
);

const Badge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${STATUS[status].badge}`}>{status}</span>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7b8399" strokeWidth={2} className="shrink-0">
    <circle cx="10.5" cy="10.5" r="6.5" /><line x1="15.5" y1="15.5" x2="21" y2="21" />
  </svg>
);
const CartIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 4h3l2.4 10.5h9.3L20 7H7" /><circle cx="10" cy="19" r="1.6" /><circle cx="18" cy="19" r="1.6" />
  </svg>
);

/* ───────────────────────────── APP ───────────────────────────── */

export default function MercadoTechApp() {
  /* --------- navegación por estado --------- */
  const [activeTab, setActiveTab] = useState<View>("catalog");
  const [detailId, setDetailId] = useState(1);
  const [gallery, setGallery] = useState(0);

  /* --------- carrito --------- */
  const [cart, setCart] = useState<CartItem[]>([{ id: 1, qty: 1 }, { id: 4, qty: 2 }]);

  /* --------- filtros catálogo --------- */
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(40000);
  const [brands, setBrands] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [minStars, setMinStars] = useState(0);
  const [aiOn, setAiOn] = useState(true);
  const [sort, setSort] = useState<"ia" | "precio" | "calif" | "desc">("ia");

  /* --------- auth / sesión --------- */
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [role, setRole] = useState<"buy" | "sell">("buy");
  const [user, setUser] = useState<string | null>("Luis Gómez");

  /* --------- vendedor / perfil --------- */
  const [kcol, setKcol] = useState<OrderStatus>("Pagado");
  const [ptab, setPtab] = useState<"orders" | "favs">("orders");
  const [unfav, setUnfav] = useState<number[]>([]);

  /* --------- UI móvil + chatbot --------- */
  const [sheet, setSheet] = useState(false);
  const [filtersSheet, setFiltersSheet] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([
    { from: "bot", text: "Hola. Soy el Asistente MercadoTech AI. Consulto tus pedidos, políticas y catálogo en tiempo real. ¿En qué te ayudo?" },
  ]);

  /* --------- acciones --------- */
  const go = (v: View) => { setActiveTab(v); setSheet(false); setFiltersSheet(false); window.scrollTo(0, 0); };
  const openDetail = (id: number) => { setDetailId(id); setGallery(0); go("detail"); };
  const addToCart = (id: number) =>
    setCart(c => (c.some(x => x.id === id) ? c.map(x => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { id, qty: 1 }]));
  const send = (q: string) => {
    const r = ragReply(q);
    setChatOpen(true); setDraft("");
    setMsgs(m => [...m, { from: "me", text: q }, { from: "bot", text: r.text, source: r.source }]);
  };
  const clearFilters = () => { setBrands([]); setCats([]); setMinStars(0); setMaxPrice(40000); setQuery(""); };
  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  /* --------- derivados --------- */
  const isCatalog = activeTab === "catalog" || activeTab === "offers";
  const detail = byId(detailId);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter(p =>
      p.price <= maxPrice &&
      (brands.length === 0 || brands.includes(p.brand)) &&
      (cats.length === 0 || cats.includes(p.cat)) &&
      p.rating >= minStars &&
      (!q || `${p.name} ${p.brand} ${p.cat}`.toLowerCase().includes(q)) &&
      (activeTab !== "offers" || hasDiscount(p)));
    if (sort === "precio") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "calif") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "desc") list = [...list].sort((a, b) => (b.old ? 1 - b.price / b.old : 0) - (a.old ? 1 - a.price / a.old : 0));
    else if (aiOn) list = [...list].sort((a, b) => b.match - a.match);
    return list;
  }, [query, maxPrice, brands, cats, minStars, sort, aiOn, activeTab]);

  const lines = cart.map(c => ({ ...byId(c.id), qty: c.qty }));
  const subtotal = lines.reduce((t, l) => t + l.price * l.qty, 0);
  const savings = lines.reduce((t, l) => t + (hasDiscount(l) ? (l.old - l.price) * l.qty : 0), 0);
  const ship = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : 199;
  const cartCount = cart.reduce((t, c) => t + c.qty, 0);
  const favorites = FAV_IDS.filter(id => !unfav.includes(id)).map(byId);
  const crossSell = [7, 10, 9].map(byId);
  const gNames = ["vista frontal", "vista lateral", "puertos / detalle", "en uso"];

  const NAV: [string, View][] = [["Catálogo", "catalog"], ["Ofertas", "offers"], ["Mis compras", "orders"], ["Panel Vendedor", "seller"]];

  /* ───────────────── clases compartidas ───────────────── */
  const card = "rounded-2xl border border-[#dde3ee] bg-white";
  const cta = "rounded-xl bg-gradient-to-r from-[#22d3ee] via-[#0b4fd6] to-[#7b2ff7] font-extrabold text-white shadow-[0_10px_26px_rgba(11,79,214,.3)] transition hover:-translate-y-0.5";
  const input = "h-12 w-full rounded-xl border border-[#dde3ee] bg-[#fbfcfe] px-4 text-sm outline-none focus:border-[#22d3ee] focus:bg-white";
  const chip = (active: boolean) =>
    `cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold ${active ? "border-[#0b4fd6] bg-[#eef4ff] text-[#0b4fd6]" : "border-[#dde3ee] bg-white text-[#4a5468]"}`;
  const label = "mb-2.5 text-xs font-bold uppercase tracking-wider text-[#7b8399]";

  /* ───────────────── PANEL DE FILTROS (compartido sidebar/bottom-sheet) ───────────────── */
  const Filters = () => (
    <>
      <div className="relative mb-5 overflow-hidden rounded-xl bg-gradient-to-br from-[#0d1b3e] to-[#1a1046] p-4">
        <div className="absolute -right-8 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.45),transparent_70%)] animate-pulse" />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-white">✦ Recomendaciones IA</div>
            <div className="mt-1 font-mono text-[10px] text-[#8fa3c8]">{aiOn ? "ordenando por afinidad · activo" : "desactivado · orden estándar"}</div>
          </div>
          <button onClick={() => setAiOn(v => !v)} aria-label="Recomendaciones IA"
            className={`h-7 w-[50px] shrink-0 rounded-full p-[3px] transition ${aiOn ? "bg-gradient-to-r from-[#22d3ee] to-[#7b2ff7]" : "bg-white/20"}`}>
            <span className={`block h-[22px] w-[22px] rounded-full bg-white transition-all ${aiOn ? "ml-[22px]" : "ml-0"}`} />
          </button>
        </div>
      </div>

      <div className="mb-5">
        <div className={label}>Rango de precio</div>
        <input type="range" min={1500} max={40000} step={500} value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          className="h-1 w-full appearance-none rounded bg-gradient-to-r from-[#0b4fd6] to-[#22d3ee] accent-[#0b4fd6]" />
        <div className="mt-2 flex justify-between font-mono text-[11.5px] text-[#4a5468]">
          <span>$1,500</span><span className="font-semibold text-[#0b4fd6]">hasta {fmt(maxPrice)}</span>
        </div>
      </div>

      <div className="mb-5">
        <div className={label}>Marca</div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map(b => (
            <button key={b} onClick={() => toggle(brands, b, setBrands)} className={chip(brands.includes(b))}>{b}</button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className={label}>Categoría</div>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
          {CATS.map(c => {
            const a = cats.includes(c);
            return (
              <button key={c} onClick={() => toggle(cats, c, setCats)}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] lg:w-full ${a ? "bg-[#eef4ff] font-bold text-[#0b4fd6]" : "text-[#4a5468] hover:bg-[#f4f6fb]"} border border-[#dde3ee] lg:border-0`}>
                <span>{c}</span>
                <span className="font-mono text-[11px] text-[#9aa3b5]">{PRODUCTS.filter(p => p.cat === c).length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className={label}>Calificación</div>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {[4.5, 4, 3.5, 0].map(v => (
            <button key={v} onClick={() => setMinStars(v)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${minStars === v ? "bg-[#eef4ff] font-bold" : "hover:bg-[#f4f6fb]"} border border-[#dde3ee] lg:border-0`}>
              <span className="tracking-widest text-[#f5a524]">{v === 0 ? "☆☆☆☆☆" : stars(v)}</span>
              <span className="text-[#4a5468]">{v === 0 ? "Todas" : `desde ${v.toFixed(1)}`}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  /* ───────────────── TARJETA DE PRODUCTO ───────────────── */
  const ProductCard: React.FC<{ p: Product }> = ({ p }) => (
    <article onClick={() => openDetail(p.id)}
      className={`${card} group relative flex cursor-pointer flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-[#22d3ee] hover:shadow-[0_16px_34px_rgba(12,26,56,.14)]`}>
      <div className="relative h-[120px] sm:h-[170px]">
        <Placeholder label={p.img} className="h-full w-full" />
        {hasDiscount(p) && <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-[#e8175d] px-2 py-1 text-[11px] font-extrabold text-white">{discount(p)}</span>}
        {aiOn && p.match >= 84 && (
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-gradient-to-r from-[#7b2ff7] to-[#22d3ee] px-2 py-1 text-[10.5px] font-extrabold text-white">✦ Match {p.match}%</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="font-mono text-[9.5px] uppercase tracking-[.12em] text-[#7b8399]">{p.brand} · {p.cat}</span>
        <h3 className="text-pretty text-[14.5px] font-bold leading-snug tracking-tight">{p.name}</h3>
        <div className="flex items-center gap-1.5 text-[11.5px] text-[#7b8399]">
          <span className="text-[#f5a524]">{stars(p.rating)}</span>{p.rating.toFixed(1)} ({p.reviews.toLocaleString("en-US")})
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-extrabold tracking-tight">{fmt(p.price)}</span>
          {hasDiscount(p) && <span className="text-[12.5px] text-[#9aa3b5] line-through">{fmt(p.old)}</span>}
        </div>
        <div className="text-[11.5px] font-bold text-green-600">{p.price >= FREE_SHIPPING ? "Envío gratis · Full" : "Envío $199"}</div>
        <div className="mt-1 flex gap-2">
          <button onClick={e => { e.stopPropagation(); openDetail(p.id); }}
            className="h-10 flex-1 rounded-xl bg-[#0b4fd6] text-[13px] font-bold text-white hover:bg-[#093fae]">Ver detalle</button>
          <button onClick={e => { e.stopPropagation(); addToCart(p.id); }} title="Agregar al carrito"
            className="h-10 w-11 rounded-xl border border-[#dde3ee] bg-[#f4f6fb] text-lg font-bold text-[#0b4fd6] hover:border-[#7b2ff7] hover:text-[#7b2ff7]">+</button>
        </div>
      </div>
    </article>
  );

  /* ───────────────── VISTAS ───────────────── */

  const CatalogView = () => (
    <main className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-6 px-4 pb-24 pt-4 lg:grid-cols-[282px_minmax(0,1fr)] lg:px-7 lg:pb-16 lg:pt-6">
      <aside className={`${card} sticky top-4 hidden p-5 lg:block`}>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-[15px] font-extrabold tracking-tight">Filtros</h3>
          <button onClick={clearFilters} className="text-[11.5px] font-semibold text-[#7b8399]">Limpiar</button>
        </div>
        <Filters />
      </aside>

      <section className="flex min-w-0 flex-col gap-5">
        <div className="relative grid grid-cols-1 items-center gap-6 overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#07173d_0%,#0b4fd6_48%,#5c1fd6_100%)] p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:p-10">
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.5),transparent_65%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-300/15 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-widest text-[#7deaff]">
              ✦ {activeTab === "offers" ? "Ofertas del día · stock limitado" : "Hot Sale IA · termina en 14 h"}
            </span>
            <h1 className="mt-3.5 text-pretty text-[26px] font-extrabold leading-[1.06] tracking-tighter text-white lg:text-[38px]">
              {activeTab === "offers" ? "Ofertas seleccionadas por la IA según tu perfil" : "Tu próxima máquina, elegida por inteligencia artificial"}
            </h1>
            <p className="mb-5 mt-2.5 max-w-[46ch] text-sm leading-relaxed text-[#bfd0ec]">
              {activeTab === "offers"
                ? `Solo productos con descuento activo, ordenados por afinidad y ahorro real. Envío gratis desde ${fmt(FREE_SHIPPING)}.`
                : `Hasta 35% de descuento en laptops, GPUs y audio. Envío gratis en compras mayores a ${fmt(FREE_SHIPPING)} y 12 meses sin intereses.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => go("offers")} className="h-12 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#7b2ff7] px-6 text-[14.5px] font-extrabold text-white shadow-[0_8px_26px_rgba(34,211,238,.4)] transition hover:-translate-y-0.5">Ver ofertas IA</button>
              <button onClick={() => setChatOpen(true)} className="h-12 rounded-xl border border-white/35 bg-white/5 px-5 text-[14.5px] font-bold text-white hover:bg-white/15">Preguntar al asistente</button>
            </div>
          </div>
          <Placeholder label="hero · foto laptop + GPU" className="relative hidden h-[200px] rounded-2xl border border-white/20 lg:flex" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13.5px] text-[#4a5468]">
            Mostrando <b className="text-[#0b1220]">{shown.length}</b> de {PRODUCTS.length} productos
            <span className="text-[#9aa3b5]"> · {[brands.join(", "), cats.join(", "), minStars ? `≥ ${minStars}★` : ""].filter(Boolean).join(" · ") || "sin filtros activos"}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {([["ia", "Relevancia IA"], ["precio", "Menor precio"], ["calif", "Mejor calificados"], ["desc", "Mayor descuento"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setSort(k)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${sort === k ? "border-[#0b4fd6] bg-[#0b4fd6] text-white" : "border-[#dde3ee] bg-white text-[#4a5468]"}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
          {shown.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
        {shown.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#c9d3e6] bg-white p-12 text-center text-sm text-[#7b8399]">
            Ningún producto coincide con esos filtros. <button onClick={clearFilters} className="font-bold text-[#0b4fd6]">Limpiar filtros ›</button>
          </div>
        )}
      </section>
    </main>
  );

  const DetailView = () => (
    <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-6">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-[13px] text-[#7b8399]">
        <button onClick={() => go("catalog")} className="font-semibold text-[#0b4fd6]">‹ Catálogo</button> / {detail.cat} / <span className="text-[#4a5468]">{detail.brand}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <div className={`${card} flex flex-col gap-3 p-4`}>
          <div className="relative overflow-hidden rounded-2xl">
            <Placeholder label={`${detail.img} · ${gNames[gallery]}`} className="h-[260px] w-full lg:h-[420px]" />
            {hasDiscount(detail) && <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-lg bg-[#e8175d] px-3 py-1.5 text-[12.5px] font-extrabold text-white">{discount(detail)}</span>}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {gNames.map((g, i) => (
              <button key={g} onClick={() => setGallery(i)} className={`overflow-hidden rounded-xl border-2 ${gallery === i ? "border-[#0b4fd6]" : "border-transparent"}`}>
                <Placeholder label={g} className="h-[62px] w-full lg:h-[84px]" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <header>
            <span className="font-mono text-[10.5px] uppercase tracking-[.13em] text-[#7b8399]">{detail.brand} · Nuevo · {detail.sold.toLocaleString("en-US")} vendidos</span>
            <h1 className="mb-2 mt-2 text-pretty text-[22px] font-extrabold leading-tight tracking-tighter lg:text-[32px]">{detail.name}</h1>
            <div className="flex items-center gap-2 text-[13.5px] text-[#7b8399]">
              <span className="text-[15px] tracking-widest text-[#f5a524]">{stars(detail.rating)}</span>
              <b className="text-[#0b1220]">{detail.rating.toFixed(1)}</b>({detail.reviews.toLocaleString("en-US")} opiniones)
            </div>
          </header>

          <div className={`${card} p-5`}>
            <div className="flex flex-wrap items-baseline gap-3">
              {hasDiscount(detail) && <span className="text-[15px] text-[#9aa3b5] line-through">{fmt(detail.old)}</span>}
              <span className="text-[31px] font-extrabold tracking-tighter lg:text-[39px]">{fmt(detail.price)}</span>
              {hasDiscount(detail) && <span className="rounded-lg bg-green-100 px-2.5 py-1 text-[12.5px] font-extrabold text-green-700">{discount(detail)}</span>}
            </div>
            <p className="mt-2 text-sm font-bold text-green-600">12 meses sin intereses de {fmt(detail.price / 12)}</p>
            <p className="mt-1 text-[13.5px] text-[#4a5468]">{detail.price >= FREE_SHIPPING ? "Envío gratis · Full" : "Envío $199"} · Llega el miércoles 2 de sep</p>
            <div className="mt-4 flex flex-col gap-2.5">
              <button onClick={() => { addToCart(detail.id); go("cart"); }} className={`${cta} h-[50px] text-base`}>Comprar ahora</button>
              <button onClick={() => addToCart(detail.id)} className="h-[50px] rounded-xl border-[1.5px] border-[#0b4fd6] bg-[#eef4ff] text-base font-extrabold text-[#0b4fd6] hover:bg-[#e0eaff]">Agregar al carrito</button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-[#0d1b3e] to-[#1a1046] p-5 shadow-[0_14px_34px_rgba(13,27,62,.28)]">
            <div className="absolute -left-10 -top-32 h-60 w-60 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(123,47,247,.5),transparent_68%)]" />
            <div className="relative">
              <div className="font-mono text-[10.5px] uppercase tracking-[.13em] text-[#7deaff]">✦ Resumen generado por IA</div>
              <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-[#e8eefb]">{detail.ai}</p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {detail.tags.map(t => (
                  <span key={t} className="rounded-full border border-cyan-300/40 bg-cyan-300/15 px-3 py-1 text-[11.5px] font-semibold text-[#a8ecff]">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <h3 className="mb-1.5 text-base font-extrabold">Descripción técnica</h3>
            <p className="mb-3.5 text-pretty text-[13.5px] leading-relaxed text-[#4a5468]">{detail.desc}</p>
            <dl className="flex flex-col">
              {detail.specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] gap-3 border-t border-[#eef1f7] py-2.5 text-[13px]">
                  <dt className="text-[#7b8399]">{k}</dt><dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </main>
  );

  const CartView = () => (
    <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-6">
      <h1 className="mb-4 text-xl font-extrabold tracking-tighter lg:text-[26px]">
        Carrito de compras <span className="text-[15px] font-semibold text-[#7b8399]">({cartCount} artículos)</span>
      </h1>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className={`${card} px-5 py-1`}>
            {lines.map(l => (
              <div key={l.id} className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-4 border-t border-[#eef1f7] py-4">
                <Placeholder label={l.img} className="h-[82px] rounded-xl" />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[.12em] text-[#7b8399]">{l.brand}</span>
                  <button onClick={() => openDetail(l.id)} className="text-left text-[15px] font-bold tracking-tight hover:text-[#0b4fd6]">{l.name}</button>
                  <span className="text-[12.5px] font-bold text-green-600">{l.price >= FREE_SHIPPING ? "Envío gratis" : "Envío $199"}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-xl border border-[#dde3ee]">
                      <button onClick={() => setCart(c => c.map(x => x.id === l.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="h-9 w-9 bg-[#f4f6fb] text-lg font-bold text-[#0b4fd6]">−</button>
                      <span className="w-9 text-center text-sm font-bold">{l.qty}</span>
                      <button onClick={() => addToCart(l.id)} className="h-9 w-9 bg-[#f4f6fb] text-lg font-bold text-[#0b4fd6]">+</button>
                    </div>
                    <span className="text-lg font-extrabold tracking-tight">{fmt(l.price * l.qty)}</span>
                    <button onClick={() => setCart(c => c.filter(x => x.id !== l.id))} className="text-[12.5px] font-bold text-[#e8175d]">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
            {lines.length === 0 && (
              <p className="py-10 text-center text-sm text-[#7b8399]">
                Tu carrito está vacío. <button onClick={() => go("catalog")} className="font-bold text-[#0b4fd6]">Explorar catálogo ›</button>
              </p>
            )}
          </div>

          <section className={`${card} p-5`}>
            <span className="rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#22d3ee] px-2.5 py-1 text-[10.5px] font-extrabold tracking-wide text-white">✦ CROSS-SELLING IA</span>
            <h3 className="mb-1 mt-3 text-[17px] font-extrabold tracking-tight">Basado en tu carrito, la IA te recomienda estos accesorios</h3>
            <p className="mb-4 text-[13px] text-[#7b8399]">Detectamos una laptop y audio en tu carrito: estos accesorios completan el setup y son compatibles al 100%.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
              {crossSell.map(x => (
                <div key={x.id} className="overflow-hidden rounded-2xl border border-[#dde3ee] bg-[#fbfcfe] transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(12,26,56,.12)]">
                  <button onClick={() => openDetail(x.id)} className="block w-full"><Placeholder label={x.img} className="h-[106px] w-full" /></button>
                  <div className="flex flex-col gap-1.5 p-3.5">
                    <span className="text-[13px] font-bold leading-snug">{x.name}</span>
                    <span className="text-[11.5px] font-semibold text-[#7b2ff7]">{x.tags[0]} · compatible</span>
                    <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[16.5px] font-extrabold tracking-tight">{fmt(x.price)}</span>
                      <button onClick={() => addToCart(x.id)} className="h-9 shrink-0 rounded-lg border border-[#0b4fd6] px-3 text-[12.5px] font-bold text-[#0b4fd6] hover:bg-[#0b4fd6] hover:text-white">Agregar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-3.5 lg:sticky lg:top-4">
          <div className={`${card} p-5`}>
            <h3 className="mb-4 text-[17px] font-extrabold tracking-tight">Resumen de compra</h3>
            <dl className="flex flex-col gap-2.5 text-[13.5px] text-[#4a5468]">
              <div className="flex justify-between"><dt>Subtotal ({cartCount} art.)</dt><dd className="font-bold text-[#0b1220]">{fmt(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Descuentos aplicados</dt><dd className="font-bold text-green-600">− {fmt(savings)}</dd></div>
              <div className="flex justify-between"><dt>Costos de envío</dt><dd className={`font-bold ${ship === 0 ? "text-green-600" : "text-[#0b1220]"}`}>{ship === 0 ? "Gratis" : fmt(ship)}</dd></div>
              <div className="flex justify-between"><dt>IVA incluido</dt><dd className="font-mono text-[12.5px]">16%</dd></div>
            </dl>
            <div className="mt-4 h-px bg-[#eef1f7]" />
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[15px] font-bold">Total</span>
              <span className="text-[29px] font-extrabold tracking-tighter">{fmt(subtotal + ship)}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-[#7b8399]">
              {subtotal > 0 ? `12 meses sin intereses de ${fmt((subtotal + ship) / 12)}` : "Agrega productos para ver tus mensualidades"}
            </p>
            <button onClick={() => send("Ayuda con métodos de pago")} className={`${cta} mt-4 h-[50px] w-full text-base`}>Continuar al pago</button>
            <button onClick={() => go("catalog")} className="mt-2.5 h-11 w-full rounded-xl border border-[#dde3ee] bg-white text-[13.5px] font-bold text-[#4a5468] hover:border-[#0b4fd6] hover:text-[#0b4fd6]">Seguir comprando</button>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1b3e] to-[#1a1046] p-4 text-[#e8eefb]">
            <div className="absolute -bottom-16 -right-8 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.4),transparent_68%)]" />
            <div className="relative font-mono text-[10px] uppercase tracking-[.13em] text-[#7deaff]">✦ Optimizador IA</div>
            <p className="relative mt-2 text-[13px] leading-relaxed text-[#c8d6ef]">
              {ship === 0
                ? "Ya tienes envío gratis. Si agregas el SSD Flux 2 TB alcanzas el nivel Full+ y recibes mañana antes de las 20:00 h."
                : `Te faltan ${fmt(FREE_SHIPPING - subtotal)} para envío gratis: el teclado Lumen TKL es la opción más cercana al umbral.`}
            </p>
          </div>

          <p className={`${card} p-4 text-[12.5px] leading-relaxed text-[#5b6478]`}>Compra Protegida · Devolución gratis 30 días · Pago seguro 3-D Secure</p>
        </aside>
      </div>
    </main>
  );

  const AuthView = () => (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#07173d,#0b4fd6_55%,#4c1bc4)] p-13 lg:flex lg:p-14">
        <div className="absolute -bottom-36 -right-20 h-96 w-96 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.45),transparent_66%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22d3ee] to-[#7b2ff7] text-2xl font-extrabold text-white">M</div>
          <div className="leading-tight">
            <div className="text-xl font-extrabold tracking-tight text-white">MercadoTech</div>
            <div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#8fb6ff]">marketplace · ia</div>
          </div>
        </div>
        <div className="relative max-w-[30ch]">
          <h2 className="mb-3.5 text-pretty text-4xl font-extrabold leading-tight tracking-tighter text-white">Compra y vende tecnología con un copiloto de IA.</h2>
          <p className="text-[15px] leading-relaxed text-[#c2d3f0]">Recomendaciones personalizadas, tablero de pedidos en tiempo real y soporte 24/7 con un agente entrenado en tu catálogo.</p>
        </div>
        <div className="relative flex gap-7">
          {[["+48k", "productos"], ["4.8★", "satisfacción"], ["24/7", "soporte IA"]].map(([a, b]) => (
            <div key={b}><div className="text-[22px] font-extrabold text-[#7deaff]">{a}</div><div className="text-xs text-[#9fb6dd]">{b}</div></div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-8 lg:px-10 lg:py-11">
        <div className="w-full max-w-[430px]">
          <div className="mb-6 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[19px] bg-gradient-to-br from-[#0b4fd6] via-[#7b2ff7] to-[#22d3ee] text-[28px] font-extrabold text-white shadow-[0_12px_30px_rgba(11,79,214,.35)]">M</div>
            <div className="text-center">
              <div className="text-xl font-extrabold tracking-tighter">MercadoTech</div>
              <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[.15em] text-[#7b8399]">marketplace · ia</div>
            </div>
          </div>

          <div className="mb-5 flex gap-1 rounded-xl bg-[#f1f4fa] p-1.5">
            {(["login", "register"] as const).map(k => (
              <button key={k} onClick={() => setAuthMode(k)}
                className={`flex-1 rounded-lg py-2.5 text-[13.5px] ${authMode === k ? "bg-white font-extrabold shadow-sm" : "font-semibold text-[#7b8399]"}`}>
                {k === "login" ? "Ingresar" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <h1 className="mb-1.5 text-[25px] font-extrabold tracking-tighter">{authMode === "register" ? "Crea tu cuenta" : "Bienvenido de vuelta"}</h1>
          <p className="mb-5 text-sm text-[#7b8399]">
            {authMode === "register" ? "Dos minutos y empiezas a comprar o vender con asistencia de IA." : "Ingresa para ver tus pedidos, favoritos y recomendaciones."}
          </p>

          {authMode === "register" && (
            <>
              <div className="mb-5">
                <div className={label}>¿Cómo quieres empezar?</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {([["buy", "◆", "Quiero comprar", "Recomendaciones IA, seguimiento y Compra Protegida."],
                     ["sell", "✦", "Quiero vender", "Tablero de pedidos, guías en lote y copiloto de ventas."]] as const).map(([k, icon, title, desc]) => {
                    const a = role === k;
                    return (
                      <button key={k} onClick={() => setRole(k)}
                        className={`relative rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 ${a ? "border-[#7b2ff7] bg-gradient-to-br from-[#f3f9ff] to-[#f7f1ff]" : "border-[#e2e7f2] bg-white"}`}>
                        <div className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl text-[17px] ${a ? "bg-gradient-to-br from-[#22d3ee] to-[#7b2ff7] text-white" : "bg-[#f1f4fa] text-[#4a5468]"}`}>{icon}</div>
                        <div className="text-[14.5px] font-extrabold tracking-tight">{title}</div>
                        <div className="mt-1 text-[11.5px] leading-snug text-[#6b7488]">{desc}</div>
                        {a && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#22d3ee] to-[#7b2ff7] text-xs text-white">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1.5 block text-[12.5px] font-bold">Nombre completo</span>
                <input className={input} placeholder="Ana Rivera" />
              </label>
            </>
          )}

          <label className="mb-3 block">
            <span className="mb-1.5 block text-[12.5px] font-bold">Correo electrónico</span>
            <input className={input} type="email" placeholder="tu@correo.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold">Contraseña</span>
            <input className={input} type="password" placeholder="••••••••" />
          </label>

          <div className="my-4 flex items-center justify-between gap-3 text-[12.5px] text-[#5b6478]">
            <span>{authMode === "register" ? "Mínimo 8 caracteres" : "Recordar este dispositivo"}</span>
            <a href="#" className="text-[#0b4fd6]">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            onClick={() => {
              const sell = authMode === "register" && role === "sell";
              setUser(sell ? "Ana Rivera" : "Luis Gómez");
              go(sell ? "seller" : "catalog");
            }}
            className={`${cta} h-[50px] w-full text-base`}>
            {authMode === "register" ? (role === "sell" ? "Crear cuenta de vendedor" : "Crear cuenta de comprador") : "Iniciar sesión"}
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-[#9aa3b5]">
            <span className="h-px flex-1 bg-[#e6eaf3]" />o continúa con<span className="h-px flex-1 bg-[#e6eaf3]" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {["Google", "Apple"].map(s => (
              <button key={s} className="h-12 rounded-xl border border-[#dde3ee] bg-white text-[13.5px] font-bold hover:border-[#0b4fd6] hover:text-[#0b4fd6]">{s}</button>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-[#9aa3b5]">
            Al continuar aceptas los Términos y el Aviso de Privacidad de MercadoTech.{" "}
            <button onClick={() => go("catalog")} className="font-bold text-[#0b4fd6]">Seguir como invitado ›</button>
          </p>
        </div>
      </div>
    </div>
  );

  const SellerView = () => {
    const kpis = [
      { label: "Ventas hoy", value: "$74,395", delta: "+18% vs ayer", tone: "text-green-600" },
      { label: "Por enviar", value: "4", delta: "2 urgentes", tone: "text-amber-600" },
      { label: "Reputación", value: "4.9★", delta: "Platino", tone: "text-[#0b4fd6]" },
      { label: "Cancelación", value: "1.2%", delta: "dentro de meta", tone: "text-[#7b8399]" },
    ];
    const SellerCard: React.FC<{ o: SellerOrder }> = ({ o }) => (
      <div className={`${card} cursor-grab rounded-2xl p-3.5 transition hover:-translate-y-1 hover:border-[#22d3ee] hover:shadow-[0_12px_26px_rgba(12,26,56,.14)]`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold text-[#0b4fd6]">{o.id}</span>
          <Badge status={o.status} />
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <Placeholder label={o.img} className="h-[42px] w-[42px] shrink-0 rounded-lg" />
          <div className="min-w-0">
            <div className="text-pretty text-[12.5px] font-bold leading-snug">{o.product}</div>
            <div className="mt-0.5 text-[11px] text-[#7b8399]">{o.buyer} · {o.items}</div>
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between border-t border-[#eef1f7] pt-2.5">
          <span className="text-[16.5px] font-extrabold tracking-tight">{o.total}</span>
          <span className="font-mono text-[10.5px] text-[#9aa3b5]">{o.date}</span>
        </div>
        {o.alert && <p className="mt-2 rounded-lg bg-gradient-to-r from-cyan-300/15 to-purple-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#4b1f8f]">✦ {o.alert}</p>}
      </div>
    );

    return (
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-5 bg-gradient-to-b from-[#0a1330] to-[#120a35] p-5 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#22d3ee] to-[#7b2ff7] font-extrabold text-white">M</div>
            <div className="leading-tight">
              <div className="text-[14.5px] font-extrabold text-white">MercadoTech</div>
              <div className="font-mono text-[9px] uppercase tracking-[.15em] text-[#22d3ee]">seller center</div>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            {["Tablero de pedidos", "Mis publicaciones", "Envíos y guías", "Métricas", "Preguntas", "Cobros"].map((l, i) => (
              <button key={l} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13.5px] ${i === 0 ? "bg-gradient-to-r from-cyan-300/20 to-purple-500/25 font-extrabold text-white ring-1 ring-inset ring-cyan-300/35" : "font-semibold text-[#93a2c4] hover:bg-white/5"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-[#22d3ee]" : "bg-white/25"}`} />{l}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/15 to-purple-500/20 p-4">
            <div className="font-mono text-[9.5px] uppercase tracking-[.13em] text-[#7deaff]">✦ Copiloto de ventas</div>
            <p className="mt-2 text-xs leading-relaxed text-[#d6e2f7">3 pedidos pagados llevan 48 h sin guía. Genéralas en lote para evitar penalización.</p>
            <button onClick={() => send("Ayuda con guías de envío")} className="mt-2.5 h-9 w-full rounded-lg bg-white text-xs font-extrabold text-[#0b1220]">Resolver ahora</button>
          </div>
          <div className="flex items-center gap-2.5 border-t border-white/10 pt-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22d3ee] text-[12.5px] font-extrabold text-[#06283d]">AR</div>
            <div className="leading-tight"><div className="text-[12.5px] font-bold text-white">Ana Rivera</div><div className="text-[10.5px] text-[#7f8db0]">Vendedor Platino</div></div>
          </div>
        </aside>

        <main className="min-w-0 bg-[#eef1f7] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-xl font-extrabold tracking-tighter lg:text-[26px]">Tablero de pedidos</h1>
              <p className="text-[13px] text-[#7b8399]">
                <span className="hidden lg:inline">Arrastra las tarjetas entre columnas para actualizar el estado</span>
                <span className="lg:hidden">Desliza entre estados</span> · {SELLER_ORDERS.length} pedidos activos
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button className="h-10 rounded-xl border border-[#dde3ee] bg-white px-4 text-[12.5px] font-bold">Exportar CSV</button>
              <button onClick={() => send("Ayuda con guías de envío")} className="h-10 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#7b2ff7] px-4 text-[12.5px] font-extrabold text-white">✦ Priorizar con IA</button>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(k => (
              <div key={k.label} className={`${card} p-4`}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#7b8399]">{k.label}</div>
                <div className="mt-1.5 text-[22px] font-extrabold tracking-tight">{k.value}</div>
                <div className={`mt-0.5 text-[11.5px] font-bold ${k.tone}`}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Desktop: 5 columnas kanban */}
          <div className="hidden items-start gap-3.5 overflow-x-auto pb-2.5 lg:flex">
            {COLUMNS.map(cn => {
              const list = SELLER_ORDERS.filter(o => o.status === cn);
              return (
                <div key={cn} className="w-[262px] shrink-0 rounded-2xl border border-[#d7deec] bg-[#e5eaf4] p-3">
                  <div className="flex items-center justify-between px-1.5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${STATUS[cn].dot}`} />
                      <span className="text-[13.5px] font-extrabold tracking-tight">{cn}</span>
                    </div>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-[#d7deec] bg-white px-1.5 text-[11.5px] font-extrabold">{list.length}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {list.map(o => <SellerCard key={o.id} o={o} />)}
                    <div className="cursor-pointer rounded-xl border-[1.5px] border-dashed border-[#c9d3e6] p-2.5 text-center text-xs text-[#8b95a8] hover:border-[#0b4fd6] hover:text-[#0b4fd6]">+ Mover pedido aquí</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Móvil: pestañas deslizables */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-3.5">
              {COLUMNS.map(cn => {
                const a = kcol === cn;
                return (
                  <button key={cn} onClick={() => setKcol(cn)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] ${a ? "border-[#0b1220] bg-[#0b1220] font-extrabold text-white" : "border-[#dde3ee] bg-white font-semibold text-[#4a5468]"}`}>
                    <span className={`h-2 w-2 rounded-full ${STATUS[cn].dot}`} />{cn}
                    <span className="font-mono text-[10.5px] opacity-75">{SELLER_ORDERS.filter(o => o.status === cn).length}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              {SELLER_ORDERS.filter(o => o.status === kcol).map(o => (
                <div key={o.id} className={`${card} p-3.5`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11.5px] font-semibold text-[#0b4fd6]">{o.id}</span>
                    <Badge status={o.status} />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Placeholder label={o.img} className="h-[52px] w-[52px] shrink-0 rounded-xl" />
                    <div className="min-w-0">
                      <div className="text-pretty text-sm font-bold leading-snug">{o.product}</div>
                      <div className="mt-0.5 text-[11.5px] text-[#7b8399]">{o.buyer} · {o.items} · {o.date}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#eef1f7] pt-3">
                    <span className="text-lg font-extrabold tracking-tight">{o.total}</span>
                    <button className="h-10 rounded-xl border border-[#0b4fd6] bg-[#eef4ff] px-4 text-[13px] font-bold text-[#0b4fd6]">{o.next}</button>
                  </div>
                  {o.alert && <p className="mt-2.5 rounded-xl bg-gradient-to-r from-cyan-300/15 to-purple-500/15 px-3 py-2 text-[11.5px] font-semibold text-[#4b1f8f]">✦ {o.alert}</p>}
                </div>
              ))}
              {SELLER_ORDERS.filter(o => o.status === kcol).length === 0 && (
                <p className={`${card} border-dashed p-8 text-center text-[13px] text-[#8b95a8]`}>No hay pedidos en este estado.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  };

  const ProfileView = () => (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-6 px-4 pb-24 pt-4 lg:grid-cols-[236px_minmax(0,1fr)] lg:px-7 lg:pb-16 lg:pt-6">
      <aside className={`${card} hidden p-4 lg:sticky lg:top-4 lg:block`}>
        <div className="flex items-center gap-3 border-b border-[#eef1f7] pb-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0b4fd6] to-[#7b2ff7] text-[15px] font-extrabold text-white">
            {(user ?? "??").split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="leading-tight"><div className="text-sm font-extrabold">{user}</div><div className="text-[11.5px] text-[#7b8399]">Comprador · nivel 3</div></div>
        </div>
        <nav className="mt-3 flex flex-col gap-0.5">
          {([["Mis pedidos", "orders"], ["Favoritos", "favs"], ["Direcciones", null], ["Métodos de pago", null], ["Notificaciones", null]] as const).map(([l, k]) => (
            <button key={l} onClick={() => k && setPtab(k)}
              className={`rounded-xl px-3 py-2.5 text-left text-[13.5px] ${k && ptab === k ? "bg-[#eef4ff] font-bold text-[#0b4fd6]" : "text-[#4a5468] hover:bg-[#f4f6fb]"}`}>{l}</button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0">
        <div className={`${card} mb-3.5 flex items-center gap-3 p-4 lg:hidden`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0b4fd6] to-[#7b2ff7] text-[15px] font-extrabold text-white">
            {(user ?? "??").split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[15.5px] font-extrabold tracking-tight">{user}</div>
            <div className="text-xs text-[#7b8399]">Comprador · nivel 3 · 14 compras</div>
          </div>
        </div>

        <h1 className="mb-1 hidden text-[26px] font-extrabold tracking-tighter lg:block">Mis compras</h1>
        <p className="mb-4 hidden text-[13.5px] text-[#7b8399] lg:block">Consulta el estado de tus pedidos y los productos que guardaste.</p>

        <div className="mb-4 flex w-full gap-1 rounded-xl bg-[#e2e7f2] p-1.5 lg:w-fit">
          {([["orders", "Mis pedidos"], ["favs", "Favoritos"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setPtab(k)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-[13.5px] lg:flex-none ${ptab === k ? "bg-white font-extrabold shadow-sm" : "font-semibold text-[#7b8399]"}`}>{l}</button>
          ))}
        </div>

        {ptab === "orders" ? (
          <div className="flex flex-col gap-3">
            {PURCHASES.map(o => (
              <article key={o.id} className={`${card} p-4 transition hover:shadow-[0_12px_28px_rgba(12,26,56,.1)]`}>
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[11px] font-semibold text-[#0b4fd6]">{o.id}</span>
                  <Badge status={o.status} />
                  <span className="text-[11.5px] text-[#9aa3b5]">{o.date}</span>
                </div>
                <div className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-3.5 lg:grid-cols-[78px_minmax(0,1fr)]">
                  <Placeholder label={o.img} className="h-[74px] rounded-xl" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <button onClick={() => openDetail(o.pid)} className="text-pretty text-left text-[15px] font-bold tracking-tight hover:text-[#0b4fd6]">{o.product}</button>
                    <span className="text-[12.5px] text-[#7b8399]">{o.detail}</span>
                    <span className="text-lg font-extrabold tracking-tight">{o.total}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button onClick={() => send(o.status === "Pendiente" ? "Ayuda con métodos de pago" : "¿Dónde está mi pedido?")}
                    className="h-11 min-w-[150px] flex-1 rounded-xl border border-[#0b4fd6] bg-[#eef4ff] text-[13px] font-bold text-[#0b4fd6] hover:bg-[#0b4fd6] hover:text-white">{o.action}</button>
                  <button onClick={() => openDetail(o.pid)} className="h-11 shrink-0 rounded-xl border border-[#dde3ee] bg-white px-4 text-[13px] font-bold text-[#4a5468]">Ver producto</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
            {favorites.map(f => (
              <article key={f.id} className={`${card} overflow-hidden transition hover:-translate-y-1 hover:border-[#22d3ee] hover:shadow-[0_14px_30px_rgba(12,26,56,.13)]`}>
                <div className="relative cursor-pointer" onClick={() => openDetail(f.id)}>
                  <Placeholder label={f.img} className="h-[108px] w-full lg:h-[134px]" />
                  <button onClick={e => { e.stopPropagation(); setUnfav(u => [...u, f.id]); }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[13px] text-[#e8175d] shadow">♥</button>
                  {hasDiscount(f) && <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-[#e8175d] px-2 py-1 text-[10.5px] font-extrabold text-white">Bajó de precio</span>}
                </div>
                <div className="flex flex-col gap-1.5 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[.12em] text-[#7b8399]">{f.brand}</span>
                  <span className="text-pretty text-[13px] font-bold leading-snug">{f.name}</span>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[17px] font-extrabold tracking-tight">{fmt(f.price)}</span>
                    {hasDiscount(f) && <span className="text-[11.5px] text-[#9aa3b5] line-through">{fmt(f.old)}</span>}
                  </div>
                  <button onClick={() => addToCart(f.id)} className="mt-1 h-9 rounded-xl bg-[#0b4fd6] text-[12.5px] font-bold text-white hover:bg-[#093fae]">Agregar al carrito</button>
                </div>
              </article>
            ))}
            {favorites.length === 0 && (
              <p className={`${card} border-dashed p-8 text-center text-[13.5px] text-[#7b8399]`}>
                Sin favoritos por ahora. <button onClick={() => go("catalog")} className="font-bold text-[#0b4fd6]">Explorar catálogo ›</button>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );

  /* ───────────────── CHATBOT IA (transversal) ───────────────── */
  const Chat = () => (
    <>
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-5 z-40 flex items-center gap-3 rounded-full bg-gradient-to-r from-[#0b4fd6] via-[#7b2ff7] to-[#22d3ee] px-4 py-0 text-white shadow-[0_10px_30px_rgba(123,47,247,.45)] ring-4 ring-cyan-300/30 transition hover:-translate-y-1 h-15 sm:pr-6"
          style={{ height: 58 }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[17px]">✦</span>
          <span className="hidden text-sm font-extrabold tracking-tight sm:inline">Asistente AI</span>
        </button>
      )}

      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} className="fixed inset-0 z-40 bg-[#060c1c]/50 sm:hidden" />
          <section className="fixed inset-x-0 bottom-0 z-50 flex h-[92vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-14px_40px_rgba(8,18,44,.3)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[594px] sm:max-h-[calc(100vh-120px)] sm:w-[392px] sm:rounded-2xl sm:border sm:border-cyan-300/40">
            <header className="relative shrink-0 overflow-hidden bg-[linear-gradient(120deg,#0a1330,#2a0f5c_70%,#0b4fd6)] px-4 pb-4 pt-3.5 sm:px-4.5 sm:py-4">
              <div className="absolute -left-10 -top-40 h-56 w-56 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.4),transparent_68%)]" />
              <div className="relative mx-auto mb-3.5 h-1.5 w-11 rounded-full bg-white/35 sm:hidden" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22d3ee] to-[#7b2ff7] text-lg text-white">✦</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-extrabold tracking-tight text-white">Asistente MercadoTech AI</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-green-400" />
                    <span className="text-[11.5px] text-[#a9c0e6]">En línea · responde en segundos</span>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-[15px] text-white hover:bg-white/25">✕</button>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f5f7fc] p-4">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[84%] text-pretty px-3.5 py-3 text-[13.5px] leading-relaxed sm:max-w-[80%] ${
                    m.from === "me"
                      ? "rounded-[16px_16px_5px_16px] bg-gradient-to-r from-[#0b4fd6] to-[#7b2ff7] text-white"
                      : "rounded-[16px_16px_16px_5px] border border-[#e3e9f5] bg-white text-[#26304a]"}`}>
                    {m.text}
                    {m.source && (
                      <div className="mt-2.5 border-t border-[#0b4fd6]/10 pt-2 font-mono text-[10px] text-[#7b2ff7]">✦ fuente: {m.source}</div>
                    )}
                  </div>
                </div>
              ))}

              {msgs.filter(m => m.from === "me").length < 2 && (
                <div>
                  <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[.12em] text-[#8b95a8]">tips frecuentes</div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {CHIPS.map(c => (
                      <button key={c} onClick={() => send(c)}
                        className="rounded-2xl border border-cyan-300/50 bg-white px-4 py-3 text-left text-[13.5px] font-semibold text-[#0b4fd6] hover:border-[#7b2ff7] hover:bg-gradient-to-r hover:from-[#eafbff] hover:to-[#f3ebff] sm:rounded-full sm:px-3.5 sm:py-2.5 sm:text-[12.5px]">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="flex shrink-0 items-end gap-2.5 border-t border-[#e6eaf3] bg-white p-3.5 pb-5 sm:pb-3.5">
              <textarea rows={1} value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (draft.trim()) send(draft.trim()); } }}
                placeholder="Escribe tu pregunta…"
                className="max-h-24 min-h-[46px] flex-1 resize-none rounded-2xl border border-[#dde3ee] bg-[#f8fafd] px-3.5 py-3 text-sm outline-none focus:border-[#22d3ee] focus:bg-white" />
              <button onClick={() => draft.trim() && send(draft.trim())} aria-label="Enviar"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#22d3ee] to-[#7b2ff7] text-lg text-white shadow-[0_6px_18px_rgba(123,47,247,.35)] transition hover:-translate-y-0.5">✦</button>
            </footer>
          </section>
        </>
      )}
    </>
  );

  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="min-h-screen bg-[#eef1f7] font-sans text-[#0b1220] antialiased">
      {activeTab !== "auth" && (
        <header className="sticky top-0 z-30 border-b border-[#dde3ee] bg-white shadow-[0_1px_10px_rgba(12,26,56,.05)]">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-2.5 lg:gap-4 lg:px-7 lg:py-3">
            <button onClick={() => setSheet(true)} aria-label="Menú"
              className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#f1f4fa] lg:hidden">
              {[0, 1, 2].map(i => <span key={i} className="h-0.5 w-[17px] rounded bg-[#0b1220]" />)}
            </button>

            <button onClick={() => go("catalog")} className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b4fd6] via-[#7b2ff7] to-[#22d3ee] text-lg font-extrabold text-white shadow-[0_4px_14px_rgba(11,79,214,.32)]">M</span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[17px] font-extrabold tracking-tight">MercadoTech</span>
                <span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#7b8399]">tech · ia</span>
              </span>
            </button>

            <nav className="hidden shrink-0 gap-0.5 lg:flex">
              {NAV.map(([l, v]) => {
                const a = activeTab === v || (v === "catalog" && activeTab === "detail");
                return (
                  <button key={v} onClick={() => go(v)}
                    className={`rounded-lg px-3.5 py-2.5 text-[13.5px] ${a ? "bg-[#eef4ff] font-extrabold text-[#0b4fd6]" : "font-semibold text-[#4a5468] hover:bg-[#f1f4fa]"}`}>{l}</button>
                );
              })}
            </nav>

            <div className="hidden h-11 min-w-[200px] flex-1 items-center gap-2.5 overflow-hidden rounded-xl border border-[#dde3ee] bg-[#f4f6fb] pl-3.5 pr-2.5 lg:flex">
              <SearchIcon />
              <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => isCatalog || go("catalog")}
                placeholder="Busca laptops, GPUs, audio… con IA"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              <button onClick={() => go("catalog")} className="shrink whitespace-nowrap rounded-lg bg-gradient-to-r from-[#7b2ff7] to-[#22d3ee] px-3 py-2 text-[12.5px] font-bold text-white">✦ IA</button>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2.5">
              <button onClick={() => go("cart")}
                className="flex h-10 items-center gap-2 rounded-xl border border-[#dde3ee] bg-white px-2.5 text-[13px] font-bold hover:border-[#0b4fd6] hover:text-[#0b4fd6] lg:px-4">
                <CartIcon /><span className="hidden lg:inline">Carrito</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0b4fd6] px-1.5 text-[11px] font-extrabold text-white">{cartCount}</span>
              </button>
              {user ? (
                <button onClick={() => { setPtab("orders"); go("orders"); }} className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0b4fd6] to-[#7b2ff7] text-[12.5px] font-extrabold text-white">
                    {user.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-[13px] font-bold lg:inline">{user}</span>
                </button>
              ) : (
                <button onClick={() => go("auth")} className={`${cta} h-10 px-4 text-[13px]`}>Ingresar</button>
              )}
            </div>
          </div>

          {/* barra móvil: búsqueda + filtros + rutas */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2.5 px-4 pb-3">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#dde3ee] bg-[#f4f6fb] px-3">
                <SearchIcon />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar con IA…" className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none" />
              </div>
              {isCatalog && (
                <button onClick={() => setFiltersSheet(true)} className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#22d3ee] px-3.5 text-[12.5px] font-bold text-white">Filtros</button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3">
              {NAV.map(([l, v]) => {
                const a = activeTab === v || (v === "catalog" && activeTab === "detail");
                return (
                  <button key={v} onClick={() => go(v)}
                    className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] ${a ? "border-[#0b4fd6] bg-[#0b4fd6] font-extrabold text-white" : "border-[#dde3ee] bg-white font-semibold text-[#4a5468]"}`}>{l}</button>
                );
              })}
            </div>
          </div>
        </header>
      )}

      {/* vistas */}
      {isCatalog && <CatalogView />}
      {activeTab === "detail" && <DetailView />}
      {activeTab === "cart" && <CartView />}
      {activeTab === "auth" && <AuthView />}
      {activeTab === "seller" && <SellerView />}
      {activeTab === "orders" && <ProfileView />}

      {/* sheet de navegación (móvil) */}
      {sheet && (
        <>
          <div onClick={() => setSheet(false)} className="fixed inset-0 z-40 bg-[#060c1c]/55 lg:hidden" />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-5 overflow-y-auto bg-gradient-to-b from-[#0a1330] to-[#150a3a] p-5 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#22d3ee] to-[#7b2ff7] font-extrabold text-white">M</span>
                <span className="text-[15px] font-extrabold text-white">MercadoTech</span>
              </div>
              <button onClick={() => setSheet(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">✕</button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {([["Catálogo", "catalog"], ["Ofertas", "offers"], ["Mis compras", "orders"], ["Favoritos", "orders"], ["Carrito", "cart"], ["Panel Vendedor", "seller"], ["Ingresar / registro", "auth"]] as [string, View][]).map(([l, v]) => (
                <button key={l} onClick={() => { if (l === "Favoritos") setPtab("favs"); if (l === "Mis compras") setPtab("orders"); go(v); }}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-left text-sm font-semibold text-[#93a2c4] hover:bg-white/5 hover:text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25" />{l}
                </button>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/15 to-purple-500/20 p-4">
              <div className="font-mono text-[9.5px] uppercase tracking-[.13em] text-[#7deaff]">✦ asistente ai</div>
              <p className="mb-2.5 mt-2 text-xs leading-relaxed text-[#d6e2f7]">Pregúntale por tus pedidos, devoluciones o recomendaciones.</p>
              <button onClick={() => { setSheet(false); setChatOpen(true); }} className="h-9 w-full rounded-lg bg-white text-[12.5px] font-extrabold text-[#0b1220]">Abrir chat</button>
            </div>
          </aside>
        </>
      )}

      {/* bottom sheet de filtros (móvil) */}
      {filtersSheet && isCatalog && (
        <>
          <div onClick={() => setFiltersSheet(false)} className="fixed inset-0 z-40 bg-[#060c1c]/50 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-7 lg:hidden">
            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#dde3ee]" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-extrabold">Filtros</h3>
              <button onClick={clearFilters} className="text-[12.5px] font-bold text-[#7b8399]">Limpiar</button>
            </div>
            <Filters />
            <button onClick={() => setFiltersSheet(false)} className={`${cta} mt-5 h-[50px] w-full text-[15px]`}>Ver {shown.length} productos</button>
          </div>
        </>
      )}

      <Chat />
    </div>
  );
}