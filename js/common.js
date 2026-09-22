/* ═══════════════════════════════════════════════════════════
   IMPORTACIONES ADRIEL · js/common.js
   Capa compartida entre la tienda (store.js) y el panel
   administrativo (admin.js):

   - Constantes del negocio (categorías, estados, textos)
   - Utilidades de formato y helpers DOM
   - Capa de datos "NoSQL sobre JSON":
       * data/productos.json es la fuente de verdad del catálogo.
       * Cada navegador guarda una copia de trabajo en
         localStorage (db v2) + carrito, pedidos, encargos y ajustes.
       * Cuando el JSON cambia su meta.updatedAt, la tienda adopta
         la nueva versión automáticamente, salvo que existan ediciones
         locales sin publicar (catalogDirty).
   Requiere js/art-engine.js cargado antes (usa ArtEngine en validaciones).
   ═══════════════════════════════════════════════════════════ */
window.TA = (function () {
  'use strict';

  /* ══════════ 1. CONSTANTES ══════════ */
  const DB_KEY = 'importacionesadriel.db.v2';
  const LEGACY_KEY = 'importacionesadriel.db.v1';
  const ADMIN_SESSION = 'importacionesadriel.admin.ok';
  const CATALOG_URL = 'data/productos.json';
  const CLIENTES_URL = 'data/clientes.json';

  const CATS = {
    suplementos: { label: 'Salud & Suplementos', short: 'Suplementos', tag: 'tag-sup', ico: '💊' },
    perfumes: { label: 'Perfumes Importados', short: 'Perfumes', tag: 'tag-per', ico: '🌸' },
    gorras: { label: 'Gorras Exclusivas', short: 'Gorras', tag: 'tag-cap', ico: '🧢' }
  };

  const ORDER_STATUS = ['Pendiente por Confirmar', 'Pago Verificado', 'Enviado', 'Entregado'];
  const ENCARGO_STATUS = ['Pendiente', 'Cotizado', 'Confirmado', 'Entregado'];

  /* Textos de venta por categoría (para productos nuevos) */
  const BULLETS = {
    suplementos: [
      'Alta biodisponibilidad y absorción rápida',
      'Sin gluten, sin lácteos y sin colorantes artificiales',
      'Pureza verificada por laboratorio independiente',
      'Apto para consumo diario continuo',
      'Fórmula importada y sellada de fábrica',
      'Resultados perceptibles en 3 a 4 semanas',
      'Dosis clínicamente respaldada por porción',
      'Fácil de tomar, sin sabor amargo'
    ],
    perfumes: [
      '100% original con código de lote y sello de autenticidad',
      'Fijación prolongada de 8 a 12 horas en piel',
      'Atomizador sellado: nunca usado ni probado',
      'Incluye caja, celofán y factura de importación',
      'Proyección elegante sin saturar el ambiente',
      'Importación directa de distribuidor autorizado'
    ],
    gorras: [
      'Edición limitada de importación directa',
      'Bordado premium y costuras reforzadas',
      'Ajuste cómodo y transpirable para todo el día',
      'Etiquetas y tags originales de fábrica',
      'Materiales de alta durabilidad, no se deforma',
      'Pieza de colección con disponibilidad reducida'
    ]
  };

  const DEFAULT_SETTINGS = {
    store: 'Importaciones Adriel',
    whatsapp: '584247777965',
    freeShipping: 100,
    shipCost: 8,
    comboQty: 2,
    comboCat: 'suplementos',
    comboDiscount: 15,
    pin: '1596',
    flashHours: 4,
    flashMins: 12
  };

  /* ══════════ 2. UTILIDADES ══════════ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const money = n => '$' + (Math.round(Number(n) * 100) / 100).toFixed(2);
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  function debounce(fn, ms) { let t; return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }
  function fmtDate(ts) { return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function starsHTML(r) { const pct = Math.max(0, Math.min(100, (r / 5) * 100)); return `<span class="stars" style="--pct:${pct.toFixed(0)}%"><span class="stars-bg">★★★★★</span><span class="stars-fg">★★★★★</span></span>`; }
  // Descuentos desactivados temporalmente. Conservar el cálculo para reactivarlo en el futuro:
  function discountPct(p) {
    /*
    if (!p.oldPrice || p.oldPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.oldPrice) * 100);
    */
    return 0;
  }
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* Toasts (requiere #toastBox en la página) */
  function toast(msg, type) {
    type = type || 'info';
    const box = $('#toastBox');
    if (!box) { console.log('[toast]', type, msg); return; }
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const ico = type === 'ok' ? '✅' : type === 'err' ? '⛔' : 'ℹ️';
    el.innerHTML = `<span class="t-ico">${ico}</span><span>${esc(msg)}</span>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 380); }, 3200);
  }

  /* ══════════ 3. CAPA DE DATOS ══════════ */
  const state = {
    products: [],
    cart: [],
    orders: [],
    encargos: [],
    clients: [],
    settings: Object.assign({}, DEFAULT_SETTINGS),
    seq: 1,
    flashEnd: 0,
    catalogVersion: null,   // versión del JSON adoptada
    catalogDirty: false,    // true si hay ediciones locales sin publicar
    catalogSource: null,    // 'json' | 'local' | 'legacy' | null
    clientesVersion: null,  // versión del clientes.json ya incorporada
    catalogError: null,     // mensaje si no se pudo cargar nada
    ready: false
  };

  function readRecord(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeRecord() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify({
        products: state.products, cart: state.cart, orders: state.orders,
        encargos: state.encargos, clients: state.clients, settings: state.settings,
        seq: state.seq, flashEnd: state.flashEnd, catalogVersion: state.catalogVersion,
        catalogDirty: state.catalogDirty, clientesVersion: state.clientesVersion
      }));
    } catch (e) { /* almacenamiento lleno o bloqueado */ }
  }

  /* Valida/normaliza un producto crudo (del JSON o importado).
     Devuelve null si el registro no es aprovechable. */
  function normalizeProduct(raw, i) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || '').trim();
    if (!name) return null;
    const cat = CATS[raw.cat] ? raw.cat : 'suplementos';
    const num = (v, d) => { const n = Number(v); return isFinite(n) && n >= 0 ? n : d; };
    const price = num(raw.price, 0);
    const benefit = String(raw.benefit || '').trim() || 'Producto importado 100% original.';
    const pres = String(raw.pres || '').trim() || '—';
    const bullets = Array.isArray(raw.bullets) ? raw.bullets.map(b => String(b)).filter(Boolean).slice(0, 6) : BULLETS[cat].slice(0, 3);
    return {
      id: String(raw.id || '').trim() || ('p' + (i + 1) + '-' + slug(name).slice(0, 24)),
      name, brand: String(raw.brand || '').trim() || 'Importado',
      cat, pres,
      price: Math.round(price * 100) / 100,
      oldPrice: Math.round(num(raw.oldPrice, 0) * 100) / 100,
      stock: Math.round(num(raw.stock, 0)),
      rating: Math.max(0, Math.min(5, Math.round(Number(raw.rating) * 10) / 10 || 4.8)),
      reviews: Math.round(num(raw.reviews, 0)),
      sold: Math.round(num(raw.sold, 0)),
      benefit,
      desc: String(raw.desc || '').trim() || (benefit + ' Producto importado, sellado de fábrica. Presentación: ' + pres + '.'),
      bullets,
      visual: String(raw.visual || 'bottle'),
      tone: (window.ArtEngine && ArtEngine.TONES[raw.tone]) ? raw.tone : 'olive',
      image: String(raw.image || ''),
      active: raw.active !== false,
      featured: !!raw.featured,
      createdAt: raw.createdAt || Date.now()
    };
  }

  function adoptCatalog(products, version, source) {
    const ok = (products || []).map(normalizeProduct).filter(Boolean);
    state.products = ok;
    state.catalogVersion = version;
    state.catalogDirty = false;
    state.catalogSource = source;
    // El carrito puede referenciar productos que ya no existen
    state.cart = state.cart.filter(i => i && i.id && ok.some(p => p.id === i.id));
    writeRecord();
  }

  /* ════ CLIENTES ════
     data/clientes.json es la fuente de verdad publicada. Cada pedido
     registra/actualiza al cliente en localStorage; el dueño publica la
     lista con "Exportar clientes" y los visitantes la incorporan. */

  function normalizeClient(raw, i) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || '').trim();
    const phone = String(raw.phone || '').trim();
    if (!name || !phone) return null;
    const num = (v, d) => { const n = Number(v); return isFinite(n) && n >= 0 ? n : d; };
    return {
      id: String(raw.id || '').trim() || ('c' + (i + 1) + '-' + slug(name).slice(0, 24)),
      name, phone,
      address: String(raw.address || '').trim(),
      notes: String(raw.notes || '').trim(),
      pedidos: Math.round(num(raw.pedidos, 0)),
      totalGastado: Math.round(num(raw.totalGastado, 0) * 100) / 100,
      firstOrderAt: num(raw.firstOrderAt, 0),
      lastOrderAt: num(raw.lastOrderAt, 0),
      lastOrderCode: String(raw.lastOrderCode || '').trim()
    };
  }

  const clientPhone = c => String(c && c.phone || '').replace(/[^\d]/g, '');

  /* Registra o actualiza al cliente a partir de un pedido confirmado */
  function registerClient(data, order) {
    const name = String(data && data.name || '').trim();
    const phone = clientPhone(data);
    if (!name || !phone) return null;
    let c = state.clients.find(x => clientPhone(x) === phone);
    if (!c) {
      c = {
        id: 'c' + Date.now().toString(36) + '-' + slug(name).slice(0, 24),
        name, phone, address: '', notes: '',
        pedidos: 0, totalGastado: 0, firstOrderAt: 0, lastOrderAt: 0, lastOrderCode: ''
      };
      state.clients.push(c);
    }
    c.name = name;
    if (data.address) c.address = String(data.address).trim();
    if (data.notes) c.notes = String(data.notes).trim();
    c.pedidos += 1;
    c.totalGastado = Math.round((c.totalGastado + ((order && order.total) || 0)) * 100) / 100;
    const ts = (order && order.ts) || Date.now();
    if (!c.firstOrderAt) c.firstOrderAt = ts;
    c.lastOrderAt = ts;
    c.lastOrderCode = (order && order.code) || '';
    writeRecord();
    return c;
  }

  /* Incorpora clientes publicados en data/clientes.json sin perder
     los ya registrados localmente (se detectan por teléfono). */
  function mergeClientes(jsonClients, version) {
    let added = 0;
    (jsonClients || []).map(normalizeClient).filter(Boolean).forEach(c => {
      if (!state.clients.some(x => clientPhone(x) === clientPhone(c))) { state.clients.push(c); added++; }
    });
    state.clientesVersion = version;
    if (added) writeRecord();
    return added;
  }

  /* Migración desde la versión anterior del sitio (db v1):
     se conservan carrito, pedidos, encargos y ajustes. El catálogo
     ahora vive en data/productos.json. */
  function migrateLegacy() {
    const old = readRecord(LEGACY_KEY);
    if (!old) return null;
    return {
      cart: Array.isArray(old.cart) ? old.cart.filter(i => i && i.id && i.qty > 0) : [],
      orders: Array.isArray(old.orders) ? old.orders : [],
      encargos: Array.isArray(old.encargos) ? old.encargos : [],
      settings: Object.assign({}, DEFAULT_SETTINGS, old.settings || {}),
      seq: Number(old.seq) || 1,
      flashEnd: Number(old.flashEnd) || 0
    };
  }

  /* Inicialización: carga localStorage → fetch del JSON → adopción */
  async function init() {
    let rec = readRecord(DB_KEY);
    if (!rec) rec = migrateLegacy();

    if (rec) {
      state.products = Array.isArray(rec.products) ? rec.products : [];
      state.cart = Array.isArray(rec.cart) ? rec.cart.filter(i => i && i.id && i.qty > 0) : [];
      state.orders = Array.isArray(rec.orders) ? rec.orders : [];
      state.encargos = Array.isArray(rec.encargos) ? rec.encargos : [];
      state.clients = Array.isArray(rec.clients) ? rec.clients : [];
      state.settings = Object.assign({}, DEFAULT_SETTINGS, rec.settings || {});
      state.seq = Number(rec.seq) || 1;
      state.flashEnd = Number(rec.flashEnd) || 0;
      state.catalogVersion = rec.catalogVersion || null;
      state.catalogDirty = !!rec.catalogDirty;
      state.clientesVersion = rec.clientesVersion || null;
      if (state.products.length) state.catalogSource = 'local';
    }

    /* Intentar cargar/refrescar desde el archivo JSON (fuente de verdad) */
    try {
      const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.products)) {
          const version = String((json.meta && json.meta.updatedAt) || '');
          if (!state.catalogDirty && state.catalogVersion !== version) {
            adoptCatalog(json.products, version, 'json');
          } else {
            state.catalogSource = state.products.length ? state.catalogSource : 'json';
          }
        }
      } else {
        throw new Error('HTTP ' + res.status);
      }
    } catch (e) {
      /* Sin servidor (file://) o sin conexión: usar copia local */
      if (!state.products.length) {
        const legacy = readRecord(LEGACY_KEY);
        if (legacy && Array.isArray(legacy.products) && legacy.products.length) {
          adoptCatalog(legacy.products, 'legacy', 'legacy');
        } else {
          state.catalogError = 'No se pudo cargar data/productos.json. Abre la tienda con un servidor local o publica la web en hosting (ver README).';
        }
      }
    }

    /* Incorporar clientes publicados en data/clientes.json */
    try {
      const resC = await fetch(CLIENTES_URL, { cache: 'no-cache' });
      if (resC.ok) {
        const jsonC = await resC.json();
        if (jsonC && Array.isArray(jsonC.clients)) {
          const versionC = String((jsonC.meta && jsonC.meta.updatedAt) || '');
          if (state.clientesVersion !== versionC) mergeClientes(jsonC.clients, versionC);
        }
      }
    } catch (e) { /* sin servidor (file://): usar copia local */ }

    state.ready = true;
    return state;
  }

  /* ══════════ 4. PERSISTENCIA GRANULAR ══════════ */
  function persist() { writeRecord(); }
  function saveCart() { writeRecord(); }
  function saveOrders() { writeRecord(); }
  function saveEncargos() { writeRecord(); }
  function saveClients() { writeRecord(); }
  function saveSettings() { writeRecord(); }
  /* Edición del catálogo desde el admin: queda marcada como local (dirty)
     hasta que se publica con "Exportar catálogo JSON" y se reemplaza el archivo. */
  function saveProducts() { state.catalogDirty = true; state.catalogSource = 'local'; writeRecord(); }
  function nextSeq() { state.seq++; writeRecord(); return state.seq; }

  /* ══════════ 5. HELPERS DE NEGOCIO ══════════ */
  const getProduct = id => state.products.find(p => p.id === id);

  function waLink(text) {
    const num = String(state.settings.whatsapp || '').replace(/[^\d]/g, '');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text);
  }

  function buildMessage(order) {
    const c = order.client;
    const lines = order.items.map(i => `- ${i.qty}x ${i.name} (${money(i.price)} c/u)`).join('\n');
    let msg = '*¡Hola! Quisiera confirmar mi pedido en Importaciones Adriel:*\n\n';
    msg += '*👤 Datos del Cliente:*\n';
    msg += `• Nombre: ${c.name}\n• Teléfono: ${c.phone}\n• Dirección: ${c.address}\n• Notas: ${c.notes || 'Sin notas'}\n\n`;
    msg += '*🛒 Detalle del Pedido:*\n' + lines + '\n\n';
    if (order.combo > 0) { msg += `*🎁 Descuento combo (${state.settings.comboDiscount}%):* -${money(order.combo)}\n`; }
    msg += `*🚚 Envío:* ${order.shipping === 0 ? 'Envío Gratis' : '$' + order.shipping}\n`;
    msg += `*💰 Total a Pagar: ${money(order.total)} USD*\n\n`;
    msg += `*N° de pedido:* ${order.code}\n`;
    msg += 'Quedo atento a las instrucciones para efectuar el pago. ¡Muchas gracias!';
    return msg;
  }

  function buildEncargoMessage(enc) {
    let msg = `*¡Hola Importaciones Adriel! Quiero hacer un pedido por encargo 📦*\n\n`;
    msg += `*👤 Mis datos:*\n• Nombre: ${enc.nombre}\n• Teléfono: ${enc.telefono}\n\n`;
    msg += `*🛍️ Producto a encargar:*\n• Plataforma: ${enc.plataforma}\n• Link: ${enc.link}\n• Cantidad: ${enc.cantidad}\n`;
    if (enc.notas) msg += `• Detalles: ${enc.notas}\n`;
    msg += `\n¿Me pueden dar el precio final con envío incluido? ¡Gracias!`;
    return msg;
  }

  /* ══════════ 6. SESIÓN ADMIN ══════════ */
  const isAdmin = () => { try { return sessionStorage.getItem(ADMIN_SESSION) === '1'; } catch (e) { return false; } };
  function tryPin(val) {
    if (String(val || '').trim() === String(state.settings.pin)) {
      try { sessionStorage.setItem(ADMIN_SESSION, '1'); } catch (e) { }
      return true;
    }
    return false;
  }
  function logoutAdmin() { try { sessionStorage.removeItem(ADMIN_SESSION); } catch (e) { } }

  /* ══════════ 7. IMPORTAR / EXPORTAR CATÁLOGO ══════════ */
  /* Genera el contenido listo para data/productos.json */
  function exportCatalogJSON() {
    return JSON.stringify({
      meta: {
        store: state.settings.store,
        currency: 'USD',
        version: 1,
        updatedAt: new Date().toISOString(),
        notes: 'Base de datos del catálogo (fuente de verdad). Gestiónala desde admin.html y publica cambios con "Exportar catálogo JSON", reemplazando este archivo. Al cambiar "updatedAt" la tienda adopta la nueva versión en cada visitante.'
      },
      products: state.products
    }, null, 2);
  }

  /* Valida un JSON importado. Devuelve {ok, products, error} */
  function importCatalogJSON(text) {
    let json;
    try { json = JSON.parse(text); } catch (e) { return { ok: false, error: 'JSON inválido: ' + e.message }; }
    const raw = Array.isArray(json) ? json : (json && Array.isArray(json.products) ? json.products : null);
    if (!raw) return { ok: false, error: 'El archivo debe contener un array "products".' };
    const products = raw.map(normalizeProduct).filter(Boolean);
    if (!products.length) return { ok: false, error: 'No se encontró ningún producto válido en el archivo.' };
    const ids = new Set(products.map(p => p.id));
    if (ids.size !== products.length) return { ok: false, error: 'Hay IDs de producto duplicados en el archivo.' };
    return { ok: true, products };
  }

  /* Genera el contenido listo para data/clientes.json */
  function exportClientesJSON() {
    return JSON.stringify({
      meta: {
        store: state.settings.store,
        version: 1,
        updatedAt: new Date().toISOString(),
        notes: 'Registro de clientes de la tienda. Se llena automáticamente con cada pedido. Gestiónalo desde admin.html (pestaña Clientes) y publica cambios reemplazando este archivo.'
      },
      clients: state.clients
    }, null, 2);
  }

  /* Valida un JSON de clientes importado. Devuelve {ok, clients, error} */
  function importClientesJSON(text) {
    let json;
    try { json = JSON.parse(text); } catch (e) { return { ok: false, error: 'JSON inválido: ' + e.message }; }
    const raw = Array.isArray(json) ? json : (json && Array.isArray(json.clients) ? json.clients : null);
    if (!raw) return { ok: false, error: 'El archivo debe contener un array "clients".' };
    const clients = raw.map(normalizeClient).filter(Boolean);
    if (!clients.length) return { ok: false, error: 'No se encontró ningún cliente válido en el archivo.' };
    const phones = new Set(clients.map(clientPhone));
    if (phones.size !== clients.length) return { ok: false, error: 'Hay teléfonos duplicados en el archivo.' };
    return { ok: true, clients };
  }

  /* Descarga un archivo de texto (exportaciones) */
  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  /* ══════════ API PÚBLICA ══════════ */
  return {
    CATS, ORDER_STATUS, ENCARGO_STATUS, BULLETS, DEFAULT_SETTINGS, CATALOG_URL, CLIENTES_URL,
    esc, money, slug, debounce, fmtDate, starsHTML, discountPct, $, $$, toast,
    state, init, persist, saveCart, saveOrders, saveEncargos, saveClients, saveSettings,
    saveProducts, nextSeq, getProduct, waLink, buildMessage, buildEncargoMessage,
    isAdmin, tryPin, logoutAdmin, exportCatalogJSON, importCatalogJSON, downloadFile,
    normalizeProduct, adoptCatalog, normalizeClient, registerClient, mergeClientes,
    exportClientesJSON, importClientesJSON
  };
})();
