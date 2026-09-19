/* ═══════════════════════════════════════════════════════════
   IMPORTACIONES ADRIEL · script.js
   Paleta cálida: #A6856A #E7E3E0 #A9A098 #9B8784 #9FA292
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════ 1. CONSTANTES ══════════ */
  const DB_KEY = 'importacionesadriel.db.v1';
  const ADMIN_SESSION = 'importacionesadriel.admin.ok';

  const CATS = {
    suplementos: { label: 'Salud & Suplementos', short: 'Suplementos', tag: 'tag-sup', ico: '💊' },
    perfumes: { label: 'Perfumes Importados', short: 'Perfumes', tag: 'tag-per', ico: '🌸' },
    gorras: { label: 'Gorras Exclusivas', short: 'Gorras', tag: 'tag-cap', ico: '🧢' }
  };

  const TONES = {
    olive: { a: '#6B7A09', b: '#99B83C', c: '#A9BF4C' },
    lilac: { a: '#5A3E5C', b: '#B2A4B8', c: '#C9BED0' },
    cream: { a: '#B9BB45', b: '#EFF099', c: '#F4F5BE' },
    purple: { a: '#7A5A80', b: '#B2A4B8', c: '#D2C7D8' },
    gold: { a: '#9C7A2C', b: '#E4CE8C', c: '#F0E2B6' },
    rose: { a: '#8E4A5E', b: '#D9A2B0', c: '#EBC8D1' },
    teal: { a: '#2C6A60', b: '#7FBDB0', c: '#A9D6CC' },
    slate: { a: '#3A3540', b: '#7C7484', c: '#9C95A5' },
    amber: { a: '#A96A15', b: '#E9B45C', c: '#F2CE8C' },
    navy: { a: '#28304F', b: '#5A6390', c: '#8289AE' },
    green: { a: '#2F6B2A', b: '#7FBF6A', c: '#A8D795' },
    wine: { a: '#6A2438', b: '#B0647C', c: '#D29BAA' }
  };

  const ORDER_STATUS = ['Pendiente por Confirmar', 'Pago Verificado', 'Enviado', 'Entregado'];

  const SUP_BULLETS = [
    'Alta biodisponibilidad y absorción rápida',
    'Sin gluten, sin lácteos y sin colorantes artificiales',
    'Pureza verificada por laboratorio independiente',
    'Apto para consumo diario continuo',
    'Fórmula importada y sellada de fábrica',
    'Resultados perceptibles en 3 a 4 semanas',
    'Dosis clínicamente respaldada por porción',
    'Fácil de tomar, sin sabor amargo'
  ];
  const PERF_BULLETS = [
    '100% original con código de lote y sello de autenticidad',
    'Fijación prolongada de 8 a 12 horas en piel',
    'Atomizador sellado: nunca usado ni probado',
    'Incluye caja, celofán y factura de importación',
    'Proyección elegante sin saturar el ambiente',
    'Importación directa de distribuidor autorizado'
  ];
  const CAP_BULLETS = [
    'Edición limitada de importación directa',
    'Bordado premium y costuras reforzadas',
    'Ajuste cómodo y transpirable para todo el día',
    'Etiquetas y tags originales de fábrica',
    'Materiales de alta durabilidad, no se deforma',
    'Pieza de colección con disponibilidad reducida'
  ];

  const BUYERS = ['Carlos E.', 'María F.', 'Andrés P.', 'Laura G.', 'Jhon R.', 'Valentina M.', 'Diego A.', 'Camila T.', 'Santiago V.', 'Daniela O.', 'Felipe C.', 'Ana Lucía R.', 'Sebastián H.', 'Paola N.'];
  const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena', 'Quito', 'Guayaquil', 'Lima', 'Panamá', 'Caracas', 'Valencia'];

  /* ══════════ 2. MOTOR DE ARTE SVG ══════════ */
  let artSeq = 0;
  const artCache = new Map();
  const nid = () => 'v' + (++artSeq);

  function hex2rgb(h) {
    const s = h.replace('#', '');
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  function shade(hex, amt) {
    const [r, g, b] = hex2rgb(hex);
    const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function frame(id, inner, defs, t) {
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="art" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F5F1EE"/><stop offset="55%" stop-color="#EDE8E4"/><stop offset="100%" stop-color="#E2DDD9"/>
        </linearGradient>
        <radialGradient id="gl${id}" cx="50%" cy="40%" r="58%">
          <stop offset="0%" stop-color="${t.b}" stop-opacity=".28"/><stop offset="100%" stop-color="${t.a}" stop-opacity="0"/>
        </radialGradient>
        ${defs}
      </defs>
      <rect width="400" height="400" fill="url(#bg${id})"/>
      <circle cx="200" cy="176" r="152" fill="url(#gl${id})"/>
      <circle cx="200" cy="200" r="126" fill="none" stroke="${t.b}" stroke-opacity=".12" stroke-width="1.5"/>
      ${inner}
    </svg>`;
  }

  function artBottle(t, id) {
    const defs = `
      <linearGradient id="bd${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#D9D4DD"/><stop offset="18%" stop-color="#FFFFFF"/><stop offset="58%" stop-color="#F2EFF4"/><stop offset="88%" stop-color="#C7C1CC"/><stop offset="100%" stop-color="#A79FB0"/>
      </linearGradient>
      <linearGradient id="cp${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(t.a, -22)}"/><stop offset="35%" stop-color="${t.b}"/><stop offset="100%" stop-color="${shade(t.a, -40)}"/>
      </linearGradient>`;
    let ridges = '';
    for (let i = 0; i < 9; i++) ridges += `<rect x="${155 + i * 11}" y="88" width="3.5" height="38" rx="1.8" fill="#000" opacity=".10"/>`;
    const body = `
      <ellipse cx="200" cy="352" rx="96" ry="14" fill="#000" opacity=".18"/>
      <rect x="150" y="82" width="100" height="50" rx="13" fill="url(#cp${id})"/>
      ${ridges}
      <rect x="160" y="126" width="80" height="24" fill="${shade(t.a, -45)}" opacity=".85"/>
      <rect x="116" y="140" width="168" height="208" rx="32" fill="url(#bd${id})"/>
      <rect x="128" y="182" width="144" height="128" rx="15" fill="#F9F7FB"/>
      <rect x="128" y="182" width="144" height="36" rx="15" fill="${t.a}"/>
      <rect x="128" y="204" width="144" height="14" fill="${t.a}"/>
      <circle cx="157" cy="256" r="15" fill="${t.b}" opacity=".9"/>
      <circle cx="157" cy="256" r="7" fill="#fff" opacity=".55"/>
      <rect x="180" y="242" width="74" height="10" rx="5" fill="#2C2534" opacity=".7"/>
      <rect x="180" y="258" width="52" height="8" rx="4" fill="#2C2534" opacity=".35"/>
      <rect x="142" y="282" width="116" height="7" rx="3.5" fill="#2C2534" opacity=".22"/>
      <rect x="142" y="294" width="86" height="7" rx="3.5" fill="#2C2534" opacity=".22"/>
      <rect x="124" y="150" width="17" height="188" rx="8.5" fill="#fff" opacity=".5"/>
      <rect x="258" y="152" width="20" height="186" rx="10" fill="#000" opacity=".07"/>`;
    return frame(id, body, defs, t);
  }

  function artSoftgel(t, id) {
    const defs = `
      <linearGradient id="am${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6B3F12"/><stop offset="22%" stop-color="#C4822C"/><stop offset="52%" stop-color="#9C5F1C"/><stop offset="100%" stop-color="#4E2C0C"/>
      </linearGradient>
      <linearGradient id="cp2${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(t.a, -30)}"/><stop offset="45%" stop-color="${t.b}"/><stop offset="100%" stop-color="${shade(t.a, -50)}"/>
      </linearGradient>
      <linearGradient id="gel${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F6D98A"/><stop offset="100%" stop-color="#C08A2A"/>
      </linearGradient>`;
    const body = `
      <ellipse cx="200" cy="352" rx="94" ry="14" fill="#000" opacity=".18"/>
      <rect x="152" y="84" width="96" height="48" rx="12" fill="url(#cp2${id})"/>
      <rect x="162" y="128" width="76" height="20" fill="${shade(t.a, -35)}"/>
      <rect x="126" y="142" width="148" height="206" rx="28" fill="url(#am${id})"/>
      <rect x="136" y="186" width="128" height="112" rx="12" fill="#F5EEDF"/>
      <rect x="136" y="186" width="128" height="30" rx="12" fill="${t.a}"/>
      <rect x="136" y="204" width="128" height="12" fill="${t.a}"/>
      <rect x="150" y="232" width="80" height="9" rx="4.5" fill="#33281A" opacity=".7"/>
      <rect x="150" y="248" width="56" height="7" rx="3.5" fill="#33281A" opacity=".35"/>
      <rect x="134" y="152" width="14" height="186" rx="7" fill="#fff" opacity=".22"/>
      <g transform="rotate(-14 132 336)"><ellipse cx="132" cy="336" rx="30" ry="18" fill="url(#gel${id})"/><ellipse cx="126" cy="330" rx="9" ry="5" fill="#fff" opacity=".5"/></g>
      <g transform="rotate(12 190 344)"><ellipse cx="190" cy="344" rx="27" ry="16" fill="url(#gel${id})"/><ellipse cx="184" cy="339" rx="8" ry="4.5" fill="#fff" opacity=".45"/></g>`;
    return frame(id, body, defs, t);
  }

  function artJar(t, id) {
    const defs = `
      <linearGradient id="jb${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#D6D0DA"/><stop offset="20%" stop-color="#FFFFFF"/><stop offset="60%" stop-color="#EFEAF2"/><stop offset="100%" stop-color="#ABA3B2"/>
      </linearGradient>
      <linearGradient id="jl${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(t.a, -25)}"/><stop offset="40%" stop-color="${t.b}"/><stop offset="100%" stop-color="${shade(t.a, -42)}"/>
      </linearGradient>`;
    const body = `
      <ellipse cx="200" cy="352" rx="100" ry="14" fill="#000" opacity=".18"/>
      <rect x="108" y="98" width="184" height="46" rx="15" fill="url(#jl${id})"/>
      <rect x="116" y="106" width="168" height="8" rx="4" fill="#fff" opacity=".3"/>
      <path d="M122 140 h156 l-8 206 a18 18 0 0 1 -18 17 h-104 a18 18 0 0 1 -18 -17 z" fill="url(#jb${id})"/>
      <rect x="126" y="186" width="148" height="104" rx="10" fill="${t.b}" opacity=".12"/>
      <rect x="126" y="186" width="148" height="26" fill="${t.a}"/>
      <rect x="142" y="228" width="86" height="10" rx="5" fill="#2C2534" opacity=".7"/>
      <rect x="142" y="246" width="116" height="7" rx="3.5" fill="#2C2534" opacity=".28"/>
      <rect x="132" y="152" width="16" height="196" rx="8" fill="#fff" opacity=".45"/>`;
    return frame(id, body, defs, t);
  }

  function artGummy(t, id, kids) {
    const colors = kids ? ['#E4574C', '#F2B33D', '#7CC36A', '#5FA8E8', '#C77DD6', '#F58FB0'] : ['#E0607A', '#F0A93C', '#9BC53D', '#E4574C', '#D9A2FF', '#F2C14E'];
    const defs = `
      <linearGradient id="gj${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${t.a}" stop-opacity=".25"/><stop offset="100%" stop-color="${t.b}" stop-opacity=".15"/>
      </linearGradient>
      <linearGradient id="glid${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(t.a, -20)}"/><stop offset="42%" stop-color="${t.b}"/><stop offset="100%" stop-color="${shade(t.a, -38)}"/>
      </linearGradient>`;
    let bears = '';
    const rnd = mulberry(hashStr(id + 'g'));
    const rows = [{ y: 306, n: 5 }, { y: 274, n: 5 }, { y: 242, n: 4 }, { y: 212, n: 4 }];
    rows.forEach((row, ri) => {
      const w = 116 - ri * 8;
      for (let i = 0; i < row.n; i++) {
        const x = 200 - w / 2 + (w / (row.n - 1 || 1)) * i + (rnd() * 8 - 4);
        const c = colors[Math.floor(rnd() * colors.length)];
        bears += `<g transform="translate(${x.toFixed(1)} ${row.y})">
            <ellipse cx="0" cy="12" rx="13" ry="10" fill="${c}"/>
            <circle cx="0" cy="-2" r="9.5" fill="${c}"/>
            <circle cx="-7.5" cy="-9" r="4.4" fill="${c}"/><circle cx="7.5" cy="-9" r="4.4" fill="${c}"/>
            <ellipse cx="-3" cy="6" rx="4" ry="5" fill="#fff" opacity=".28"/>
            <circle cx="0" cy="-3" r="3.4" fill="#fff" opacity=".3"/>
          </g>`;
      }
    });
    const body = `
      <ellipse cx="200" cy="352" rx="88" ry="13" fill="#000" opacity=".18"/>
      <path d="M138 168 h124 a14 14 0 0 1 14 14 v146 a24 24 0 0 1 -24 24 h-104 a24 24 0 0 1 -24 -24 v-146 a14 14 0 0 1 14 -14z" fill="url(#gj${id})" stroke="${t.b}" stroke-opacity=".35" stroke-width="2"/>
      ${bears}
      <rect x="130" y="128" width="140" height="44" rx="13" fill="url(#glid${id})"/>
      <rect x="140" y="136" width="120" height="7" rx="3.5" fill="#fff" opacity=".28"/>
      <rect x="150" y="196" width="100" height="34" rx="8" fill="#F9F7FB" opacity=".92"/>
      <rect x="160" y="206" width="62" height="7" rx="3.5" fill="${t.a}"/>
      <rect x="144" y="176" width="12" height="150" rx="6" fill="#fff" opacity=".28"/>`;
    return frame(id, body, defs, t);
  }

  function artPerfume(t, id) {
    const defs = `
      <linearGradient id="pg${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(t.a, -30)}" stop-opacity=".95"/>
        <stop offset="26%" stop-color="${t.c}" stop-opacity=".85"/>
        <stop offset="62%" stop-color="${t.a}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${shade(t.a, -55)}" stop-opacity=".95"/>
      </linearGradient>
      <linearGradient id="pgold${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8C6C22"/><stop offset="35%" stop-color="#F0DC9C"/><stop offset="65%" stop-color="#C6A44E"/><stop offset="100%" stop-color="#7A5C18"/>
      </linearGradient>`;
    const body = `
      <ellipse cx="200" cy="352" rx="92" ry="13" fill="#000" opacity=".28"/>
      <rect x="140" y="152" width="120" height="196" rx="20" fill="url(#pg${id})"/>
      <path d="M170 152 h60 v-26 h-60z" fill="${shade(t.a, -18)}" opacity=".9"/>
      <rect x="180" y="106" width="40" height="26" rx="5" fill="url(#pgold${id})"/>
      <rect x="164" y="58" width="72" height="54" rx="10" fill="url(#pgold${id})"/>
      <rect x="172" y="66" width="56" height="8" rx="4" fill="#fff" opacity=".35"/>
      <rect x="150" y="164" width="13" height="172" rx="6.5" fill="#fff" opacity=".28"/>
      <rect x="238" y="168" width="14" height="164" rx="7" fill="#000" opacity=".14"/>
      <rect x="160" y="212" width="80" height="80" rx="8" fill="rgba(230,220,210,.4)" stroke="${t.c}" stroke-opacity=".65" stroke-width="1.6"/>
      <rect x="172" y="232" width="56" height="7" rx="3.5" fill="${t.c}" opacity=".9"/>
      <rect x="178" y="246" width="44" height="5" rx="2.5" fill="#fff" opacity=".5"/>
      <rect x="184" y="262" width="32" height="5" rx="2.5" fill="#fff" opacity=".35"/>`;
    return frame(id, body, defs, t);
  }

  function artCap(t, id) {
    const defs = `
      <linearGradient id="cb${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${shade(t.b, 18)}"/><stop offset="45%" stop-color="${t.a}"/><stop offset="100%" stop-color="${shade(t.a, -42)}"/>
      </linearGradient>
      <linearGradient id="cv${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(t.a, -48)}"/><stop offset="55%" stop-color="${shade(t.a, -18)}"/><stop offset="100%" stop-color="${shade(t.a, -60)}"/>
      </linearGradient>`;
    const body = `
      <ellipse cx="200" cy="336" rx="118" ry="16" fill="#000" opacity=".22"/>
      <path d="M86 262 Q200 306 314 262 Q310 296 268 308 Q200 328 132 308 Q90 296 86 262Z" fill="url(#cv${id})"/>
      <path d="M96 264 Q200 302 304 264" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3"/>
      <path d="M104 264 Q100 148 200 140 Q300 148 296 264 Z" fill="url(#cb${id})"/>
      <path d="M200 140 Q200 202 200 264" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2.4"/>
      <path d="M200 140 Q152 168 128 264" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="2.2"/>
      <path d="M200 140 Q248 168 272 264" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="2.2"/>
      <circle cx="200" cy="140" r="10" fill="${shade(t.a, -30)}"/>
      <circle cx="200" cy="137" r="4" fill="#fff" opacity=".22"/>
      <rect x="164" y="216" width="72" height="40" rx="9" fill="${t.c}" opacity=".92"/>
      <rect x="174" y="228" width="52" height="7" rx="3.5" fill="${shade(t.a, -45)}" opacity=".85"/>
      <rect x="182" y="241" width="36" height="5" rx="2.5" fill="${shade(t.a, -45)}" opacity=".6"/>`;
    return frame(id, body, defs, t);
  }

  function artFor(p) {
    if (p.image && p.image.trim()) {
      return `<div class="art-img"><img src="${esc(p.image.trim())}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentNode.style.display='none'"></div>`;
    }
    const ck = p.id + '|' + p.visual + '|' + p.tone;
    if (artCache.has(ck)) return artCache.get(ck);
    const t = TONES[p.tone] || TONES.olive;
    const id = nid();
    let svg;
    switch (p.visual) {
      case 'softgel': svg = artSoftgel(t, id); break;
      case 'jar': svg = artJar(t, id); break;
      case 'gummy': svg = artGummy(t, id, false); break;
      case 'kids': svg = artGummy(t, id, true); break;
      case 'perfume': svg = artPerfume(t, id); break;
      case 'cap': svg = artCap(t, id); break;
      default: svg = artBottle(t, id);
    }
    artCache.set(ck, svg);
    return svg;
  }

  /* ══════════ 3. UTILIDADES ══════════ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
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

  /* ══════════ 4. CATÁLOGO SEMILLA ══════════ */
  const SEED_SUP = [
    ['Chewable C 500 mg', 'Spring Valley', '60 Tabletas masticables', 10, 13, 'bottle', 'cream', 'Blinda tus defensas cada día y siente la energía sin tragar cápsulas.'],
    ['Rapid-Release Magnesium Citrate 100 mg', 'Spring Valley', '100 Cápsulas', 15, 19, 'softgel', 'lilac', 'Relaja cuerpo y mente: duerme profundamente y despierta sin tensión.'],
    ['Adult Gummy Melatonin 5 mg', 'Spring Valley', '60 Gomitas vegetarianas', 15, 18, 'gummy', 'purple', 'Concilia el sueño en minutos y recupera un descanso reparador real.'],
    ['Biotin 1,000 mcg', 'Spring Valley', '150 Cápsulas blandas', 10, 14, 'softgel', 'rose', 'Cabello más fuerte, piel luminosa y uñas que dejan de quebrarse.'],
    ['Apple Cider Vinegar 450 mg', 'Spring Valley', '100 Cápsulas', 15, 19, 'bottle', 'green', 'Acelera tu metabolismo y controla antojos sin el sabor del vinagre.'],
    ['Extra Strength D3 125 mcg (5,000 UI)', 'Spring Valley', '100 Cápsulas blandas', 15, 20, 'softgel', 'amber', 'Huesos sólidos, ánimo arriba y defensas listas para todo el año.'],
    ['High Absorption Magnesium 200 mg', 'Spring Valley', '60 Cápsulas vegetarianas', 10, 13, 'bottle', 'teal', 'Adiós calambres y fatiga: recuperación muscular real cada noche.'],
    ['Zero Sugar Kids Melatonin 1 mg', 'Spring Valley', '60 Gomitas vegetarianas', 15, 18, 'kids', 'lilac', 'Rutina de sueño tranquila para tus hijos, sin azúcar y con sabor delicioso.'],
    ['Acetyl L-Carnitine 400 mg + Alpha Lipoic Acid 200 mg', 'Spring Valley', '50 Cápsulas', 20, 26, 'bottle', 'olive', 'Enfócate al máximo y protege tu energía mental durante todo el día.'],
    ['Ashwagandha Root Powder 500 mg', 'Spring Valley', '60 Cápsulas vegetarianas', 15, 21, 'bottle', 'green', 'Baja el estrés, equilibra tu ánimo y rinde más sin agotarte.'],
    ['Glucosamine Sulfate Potassium Chloride 1,000 mg', 'Spring Valley', '200 Tabletas', 30, 38, 'bottle', 'teal', 'Muévete sin dolor: articulaciones flexibles y pasos seguros otra vez.'],
    ['Collagen Peptides Type 1 & 3', 'Spring Valley', 'Polvo 9 oz (255 g)', 25, 33, 'jar', 'rose', 'Piel firme, cabello abundante y articulaciones jóvenes desde adentro.'],
    ['Extra Strength Biotin 10,000 mcg Plus Keratin', 'Spring Valley', '60 Tabletas', 12, 17, 'bottle', 'cream', 'Transformación visible de tu cabello y uñas en pocas semanas.'],
    ['Turmeric Curcumin with Ginger Powder 500 mg', 'Spring Valley', '180 Cápsulas vegetarianas', 20, 27, 'bottle', 'amber', 'Desinflama tu cuerpo y recupera movilidad sin molestias diarias.'],
    ['Milk Thistle Standardized Extract 175 mg', 'Spring Valley', '90 Cápsulas', 16, 21, 'bottle', 'olive', 'Depura tu hígado y siente más ligereza, energía y digestión estable.'],
    ['Green Tea Standardized Extract 500 mg', 'Spring Valley', '60 Cápsulas vegetarianas', 15, 19, 'bottle', 'green', 'Antioxidantes potentes para quemar grasa y proteger tus células.'],
    ["Men's Multi with Fruits & Vegetables", 'Spring Valley', '150 Tabletas', 23, 29, 'bottle', 'navy', 'Energía masculina todo el día: músculo, foco y vitalidad sin bajones.'],
    ["Women's Multi with Fruits & Vegetables", 'Spring Valley', '150 Tabletas', 23, 29, 'bottle', 'wine', 'Nutrición completa que se nota en tu energía, piel y bienestar hormonal.'],
    ["Zero Sugar Women's Multi", 'Spring Valley', '150 Gomitas', 23, 28, 'gummy', 'rose', 'Tu multivitamínico diario en gomitas, sin azúcar y sin excusas.'],
    ['Glucosamine 500 mg', "People's Choice", '20 Tabletas', 5, 8, 'bottle', 'teal', 'Alivio articular accesible para volver a moverte con confianza.'],
    ['Super B-Complex', "People's Choice", '30 Tabletas', 5, 8, 'bottle', 'amber', 'Convierte tu comida en energía real y despídete del cansancio.'],
    ['Vitamin C 500 mg', "People's Choice", '30 Tabletas', 5, 8, 'bottle', 'cream', 'Defensas fuertes todo el año para no perder ni un día.'],
    ['Melatonin', "People's Choice", '30 Tabletas', 5, 8, 'bottle', 'purple', 'Duerme de corrido y despierta realmente descansado.'],
    ['Ginseng 500 mg', "People's Choice", '30 Tabletas', 5, 8, 'bottle', 'olive', 'Vigor físico y claridad mental cuando más lo necesitas.'],
    ['Hair, Skin & Nails Gummies (2,500 mcg Biotin)', "Nature's Bounty", '230 Gomitas', 35, 45, 'gummy', 'rose', 'El ritual de belleza más vendido: brillo y fuerza que se nota.'],
    ['Hair, Skin & Nails Gummies (Collagen & Biotin)', "Nature's Bounty", '90 Gomitas', 20, 27, 'gummy', 'wine', 'Colágeno + biotina para una piel radiante y uñas irrompibles.'],
    ["Women's Multi Vitamin Gummies with Collagen", "Nature's Bounty", '140 Gomitas', 25, 32, 'gummy', 'lilac', 'Bienestar femenino completo en gomitas que sí vas a querer tomar.'],
    ['Daily Multivitamin (Paw Patrol)', "L'il Critters / vitafusion", '190 Gomitas', 25, 31, 'kids', 'cream', 'Nutrición diaria divertida que tus hijos pedirán solos.'],
    ['Resveratrol Extra Strength Blend', "Dr. Martin's Nutrition", '180 Cápsulas', 30, 42, 'softgel', 'wine', 'Protege tu corazón y frena el envejecimiento celular desde adentro.'],
    ['Resveratrolprueba Extra Strength Blend', "Dr. Martin's NutritionPRUEBA", '560 Cápsulas', 100, 42, 'softgel', 'wine', 'Protege tu corazón y frena el envejecimiento celular desde adentro']
  ];

  const SEED_PERF = [
    ['Armaf Club de Nuit Intense Man EDP 105 ml', 'Armaf', 'Eau de Parfum · 105 ml', 65, 89, 'perfume', 'slate', 'Proyecta elegancia y presencia inolvidable desde el primer minuto.'],
    ['Dior Sauvage EDP 100 ml', 'Dior', 'Eau de Parfum · 100 ml', 145, 179, 'perfume', 'navy', 'Frescura magnética que convierte cada entrada en un momento memorable.'],
    ['Creed Aventus EDP 100 ml', 'Creed', 'Eau de Parfum · 100 ml', 320, 389, 'perfume', 'gold', 'El aroma del éxito: distinción absoluta que deja huella donde pasas.'],
    ['Carolina Herrera Good Girl EDP 80 ml', 'Carolina Herrera', 'Eau de Parfum · 80 ml', 110, 139, 'perfume', 'wine', 'Seducción sofisticada que despierta miradas y recuerdos imborrables.'],
    ['Versace Eros EDP 100 ml', 'Versace', 'Eau de Parfum · 100 ml', 95, 124, 'perfume', 'teal', 'Energía masculina intensa: frescura y poder en una sola aplicación.'],
    ['Bleu de Chanel EDP 100 ml', 'Chanel', 'Eau de Parfum · 100 ml', 165, 199, 'perfume', 'slate', 'Elegancia atemporal que habla de ti antes de que digas una palabra.'],
    ['Jean Paul Gaultier Scandal EDP 80 ml', 'Jean Paul Gaultier', 'Eau de Parfum · 80 ml', 105, 132, 'perfume', 'gold', 'Dulzura adictiva que convierte la noche en tu mejor escenario.'],
    ['Paco Rabanne 1 Million Elixir EDP 100 ml', 'Paco Rabanne', 'Eau de Parfum · 100 ml', 115, 145, 'perfume', 'cream', 'Magnetismo puro: la fragancia de quien nunca pasa desapercibido.'],
    ['Yves Saint Laurent Libre EDP 90 ml', 'Yves Saint Laurent', 'Eau de Parfum · 90 ml', 125, 158, 'perfume', 'lilac', 'Libertad y carácter femenino en un aroma floral luminoso y elegante.']
  ];

  const SEED_CAPS = [
    ['New Era 59FIFTY NY Yankees Fitted', 'New Era', 'Fitted · Edición Limitada', 55, 72, 'cap', 'navy', 'Eleva tu estilo urbano al instante con un clásico imposible de ignorar.'],
    ['Nike Heritage86 Swoosh Cap', 'Nike', 'Curved brim · Ajustable', 35, 45, 'cap', 'slate', 'Comodidad deportiva y actitud: el básico que combina con todo.'],
    ['Adidas Originals Trefoil Snapback', 'Adidas', 'Snapback · Importada', 38, 49, 'cap', 'olive', 'Estilo retro auténtico que completa cualquier outfit streetwear.'],
    ['Mitchell & Ness Vintage NBA Snapback', 'Mitchell & Ness', 'Snapback · Retro NBA', 60, 79, 'cap', 'wine', 'Pieza de colección que te hace destacar entre todos los demás.'],
    ['Puma Essentials Curved Cap', 'Puma', 'Curved brim · Unisex', 30, 39, 'cap', 'lilac', 'Ligera, versátil y lista para acompañarte todo el día.'],
    ['The North Face Trail Cap', 'The North Face', 'Técnica · Outdoor', 42, 55, 'cap', 'teal', 'Protección y resistencia premium para aventura y ciudad.'],
    ['Carhartt Odessa Cap', 'Carhartt', 'Workwear · Resistente', 40, 52, 'cap', 'cream', 'Durabilidad legendaria con un look rudo que nunca pasa de moda.'],
    ['Ralph Lauren Polo Chino Ball Cap', 'Ralph Lauren', 'Ball cap · Premium', 45, 59, 'cap', 'gold', 'Sofisticación casual que eleva tu imagen al instante.']
  ];

  function buildSeed() {
    const out = [];
    let n = 0;
    const push = (row, cat) => {
      const [name, brand, pres, price, oldPrice, visual, tone, benefit] = row;
      n++;
      const id = 'p' + n + '-' + slug(name).slice(0, 26);
      const rnd = mulberry(hashStr(id));
      const rating = Math.round((4.55 + rnd() * 0.45) * 10) / 10;
      let stock = 4 + Math.floor(rnd() * 26);
      if (rnd() < 0.14) stock = 2 + Math.floor(rnd() * 3);
      if (rnd() < 0.05) stock = 0;
      const pool = cat === 'suplementos' ? SUP_BULLETS : (cat === 'perfumes' ? PERF_BULLETS : CAP_BULLETS);
      const bullets = [];
      let guard = 0;
      while (bullets.length < 3 && guard++ < 40) { const b = pool[Math.floor(rnd() * pool.length)]; if (!bullets.includes(b)) bullets.push(b); }
      const desc = benefit + ' Producto ' + brand + ' importado, sellado de fábrica y verificado unidad por unidad antes del envío. Presentación: ' + pres + '.';
      out.push({
        id, name, brand, cat, pres,
        price: Number(price), oldPrice: Number(oldPrice) || 0,
        stock, rating,
        reviews: 24 + Math.floor(rnd() * 940),
        sold: 3 + Math.floor(rnd() * 260),
        benefit, desc, bullets, visual, tone,
        image: '', active: true,
        featured: rnd() > 0.72,
        createdAt: Date.now() - Math.floor(rnd() * 90) * 86400000
      });
    };
    SEED_SUP.forEach(r => push(r, 'suplementos'));
    SEED_PERF.forEach(r => push(r, 'perfumes'));
    SEED_CAPS.forEach(r => push(r, 'gorras'));
    return out;
  }

  /* ══════════ 5. ESTADO GLOBAL ══════════ */
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

  let state = {
    products: [], cart: [], orders: [], encargos: [],
    settings: Object.assign({}, DEFAULT_SETTINGS),
    filters: { q: '', cat: 'all', min: 0, max: 400, sort: 'relevance' },
    ui: { adminTab: 'dash', editing: null },
    flashEnd: 0, seq: 1
  };

  function persist() {
    try { localStorage.setItem(DB_KEY, JSON.stringify({ products: state.products, cart: state.cart, orders: state.orders, encargos: state.encargos, settings: state.settings, seq: state.seq, flashEnd: state.flashEnd })); } catch (e) { }
  }

  function restore() {
    let raw = null;
    try { raw = localStorage.getItem(DB_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const d = JSON.parse(raw);
        state.products = Array.isArray(d.products) && d.products.length ? d.products : buildSeed();
        state.cart = Array.isArray(d.cart) ? d.cart.filter(i => i && i.id && i.qty > 0) : [];
        state.orders = Array.isArray(d.orders) ? d.orders : [];
        state.encargos = Array.isArray(d.encargos) ? d.encargos : [];
        state.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
        state.seq = Number(d.seq) || (state.products.length + 1);
        state.flashEnd = Number(d.flashEnd) || 0;
        return;
      } catch (e) { }
    }
    state.products = buildSeed();
    state.orders = demoOrders();
    state.seq = state.products.length + 1;
  }

  function demoOrders() {
    const prods = state.products.length ? state.products : buildSeed();
    const mk = (idx, mins, status, name, city) => {
      const items = idx.map(i => { const p = prods[i % prods.length]; return { id: p.id, name: p.name, brand: p.brand, price: p.price, qty: 1 + (i % 2), cat: p.cat, visual: p.visual, tone: p.tone }; });
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      return { code: 'TS-' + String(1000 + idx[0] * 7 + mins).slice(-4), ts: Date.now() - mins * 60000, client: { name, phone: '3' + (10 + idx[0]) + '555' + (100 + idx[0]), address: 'Calle ' + (10 + idx[0]) + ' # ' + (20 + idx[0]) + '-' + idx[0] + ', ' + city, notes: '' }, items, subtotal, combo: 0, shipping: subtotal >= 100 ? 0 : 8, total: subtotal + (subtotal >= 100 ? 0 : 8), status };
    };
    return [
      mk([0, 3], 26, 'Entregado', 'Carlos Espinosa', 'Bogotá'),
      mk([20, 11], 95, 'Enviado', 'María Fernanda R.', 'Medellín'),
      mk([25, 15], 240, 'Pago Verificado', 'Andrés Palacios', 'Cali'),
      mk([10, 19, 22], 640, 'Pendiente por Confirmar', 'Laura Gutiérrez', 'Barranquilla')
    ];
  }

  /* ══════════ 6. HELPERS DE NEGOCIO ══════════ */
  const getProduct = id => state.products.find(p => p.id === id);

  function totals() {
    let units = 0, subtotal = 0, supUnits = 0, supSub = 0;
    state.cart.forEach(i => {
      const p = getProduct(i.id); if (!p) return;
      const line = p.price * i.qty;
      units += i.qty; subtotal += line;
      if (p.cat === state.settings.comboCat) { supUnits += i.qty; supSub += line; }
    });
    // Descuento por cantidad desactivado temporalmente. Conservar para uso futuro:
    let combo = 0, comboLabel = '';
    /*
    if (supUnits >= state.settings.comboQty) {
      combo = Math.round(supSub * state.settings.comboDiscount) / 100;
      comboLabel = '🎁 Combo activo: ' + supUnits + ' ' + CATS[state.settings.comboCat].short.toLowerCase() + ' → ' + state.settings.comboDiscount + '% OFF';
    }
    */
    const after = subtotal - combo;
    // Envío gratis permanente. Conservar el cálculo anterior para uso futuro:
    const shipping = 0;
    /*
    const shipping = (after <= 0 || after >= state.settings.freeShipping) ? 0 : state.settings.shipCost;
    const remaining = Math.max(0, state.settings.freeShipping - after);
    const pct = state.settings.freeShipping > 0 ? Math.min(100, (after / state.settings.freeShipping) * 100) : 0;
    */
    const remaining = 0;
    const pct = 100;
    return { units, subtotal, combo, comboLabel, after, shipping, total: after + shipping, remaining, pct, supUnits };
  }

  function filtered() {
    const f = state.filters;
    const q = f.q.trim().toLowerCase();
    let list = state.products.filter(p => p.active !== false);
    if (f.cat !== 'all') list = list.filter(p => p.cat === f.cat);
    if (q) { list = list.filter(p => { const hay = (p.name + ' ' + p.brand + ' ' + p.benefit + ' ' + p.pres + ' ' + CATS[p.cat].label).toLowerCase(); return q.split(/\s+/).every(tok => hay.includes(tok)); }); }
    list = list.filter(p => p.price >= f.min && p.price <= f.max);
    const s = f.sort;
    if (s === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (s === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (s === 'rating') list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (s === 'sold') list.sort((a, b) => b.sold - a.sold);
    else if (s === 'discount') list.sort((a, b) => discountPct(b) - discountPct(a));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.sold - a.sold);
    return list;
  }

  /* ══════════ 7. RENDER CATÁLOGO ══════════ */
  const gridEl = $('#productGrid');
  const emptyEl = $('#emptyState');
  let io = null;

  function cardHTML(p) {
    const off = discountPct(p);
    const out = p.stock <= 0;
    const low = !out && p.stock <= 5;
    ///pendiente "mas vendido" si es destacado y no tiene descuento ESTA DESACTIVADO TEMPORALMENTE debe ser = 0
    return `
    <article class="product-card" data-id="${p.id}" role="listitem">
      <div class="pc-media">
        <div class="art">${artFor(p)}</div>
        <div class="pc-badges">
          ${off > 0 ? `<span class="badge badge-off">-${off}%</span>` : ''}
          ${p.cat === 'gorras' ? '<span class="badge badge-limited">Edición limitada</span>' : ''}
          ${p.cat === 'perfumes' ? '<span class="badge badge-new">100% Original</span>' : ''}
          ${p.featured && off === 1 ? '<span class="badge badge-hot">Más vendido</span>' : ''}
          ${out ? '<span class="badge badge-out">Agotado</span>' : ''}
        </div>
        <button class="pc-fav" data-fav="${p.id}" aria-label="Guardar en favoritos">🤍</button>
        <button class="pc-quick" data-quick="${p.id}">👁 Vista rápida</button>
      </div>
      <div class="pc-body">
        <div class="pc-top">
          <span class="pc-brand">${esc(p.brand)}</span>
          <span class="pc-rating">${starsHTML(p.rating)} ${p.rating.toFixed(1)} <span style="opacity:.6">(${p.reviews})</span></span>
        </div>
        <h3 class="pc-name">${esc(p.name)}</h3>
        <p class="pc-benefit">"${esc(p.benefit)}"</p>
        <p class="pc-pres">${esc(p.pres)}</p>
        ${out ? '<span class="pc-stock out">Sin stock disponible</span>' : (low ? `<span class="pc-stock">🔥 ¡Últimas ${p.stock} unidades!</span>` : '')}
        <div class="pc-foot">
          <div class="pc-price-wrap">
            ${p.oldPrice > p.price ? `<span class="pc-old">${money(p.oldPrice)}</span>` : ''}
            <span class="pc-price">${money(p.price)}</span>
          </div>
          <button class="btn-add" data-add="${p.id}" ${out ? 'disabled' : ''} aria-label="Agregar ${esc(p.name)} al carrito">${out ? 'Agotado' : 'Agregar'}</button>
        </div>
      </div>
    </article>`;
  }

  function renderCatalog() {
    const list = filtered();
    gridEl.innerHTML = list.map(cardHTML).join('');
    emptyEl.classList.toggle('hidden', list.length > 0);
    $('#resultCount').textContent = list.length
      ? `${list.length} producto${list.length === 1 ? '' : 's'} · envío gratis en todos los pedidos`
      : 'Sin resultados para tu búsqueda';

    const counts = { all: 0, suplementos: 0, perfumes: 0, gorras: 0 };
    state.products.filter(p => p.active !== false).forEach(p => { counts.all++; counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $$('[data-count]').forEach(el => { el.textContent = counts[el.dataset.count] || 0; });

    // combo discount label
    const cl = $('#comboDiscLabel');
    if (cl) cl.textContent = state.settings.comboDiscount + '%';

    if (io) io.disconnect();
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en, i) => {
          if (en.isIntersecting) { en.target.style.transitionDelay = (Math.min(i, 6) * 45) + 'ms'; en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '60px' });
      $$('.product-card', gridEl).forEach(c => io.observe(c));
    } else {
      $$('.product-card', gridEl).forEach(c => c.classList.add('in'));
    }
  }

  function renderHeroArt() {
    const box = $('#heroArt');
    if (!box) return;
    const picks = [
      state.products.find(p => p.cat === 'suplementos' && p.featured) || state.products.find(p => p.cat === 'suplementos'),
      state.products.find(p => p.cat === 'perfumes'),
      state.products.find(p => p.cat === 'gorras')
    ].filter(Boolean);
    box.innerHTML = picks.map((p, i) => `<div class="float-card fc${i + 1}"><div class="art">${artFor(p)}</div></div>`)/* .join('') +
      `<span class="hero-badge">⭐ ${(picks[0] ? picks[0].rating : 4.9).toFixed(1)}/5 · +2.400 clientes felices</span>` */;
  }

  /* ══════════ 8. CARRITO ══════════ */
  function addToCart(id, qty, srcEl) {
    const p = getProduct(id); if (!p) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const line = state.cart.find(i => i.id === id);
    const current = line ? line.qty : 0;
    if (p.stock <= 0) { toast('Producto agotado 😔', 'err'); return; }
    if (current + qty > p.stock) { qty = p.stock - current; if (qty <= 0) { toast('Stock máximo alcanzado (' + p.stock + ' u.)', 'err'); return; } toast('Ajustamos la cantidad al stock disponible (' + p.stock + ' u.)', 'info'); }
    if (line) line.qty += qty; else state.cart.push({ id, qty });
    persist(); renderCart(); updateBadge(true);
    toast(`✓ ${p.name} agregado al carrito`, 'ok');
    if (srcEl) flyToCart(srcEl);
    const t = totals();
    if (t.units >= state.settings.comboQty && t.combo > 0) { setTimeout(() => toast(t.comboLabel.replace('🎁 ', '🎁 ¡') + '! aplicado', 'ok'), 700); }
  }

  function setQty(id, qty) {
    const p = getProduct(id); const line = state.cart.find(i => i.id === id); if (!line) return;
    qty = parseInt(qty, 10) || 0;
    if (qty <= 0) { removeItem(id); return; }
    if (p && qty > p.stock) { qty = p.stock; toast('Solo hay ' + p.stock + ' unidades en stock', 'info'); }
    line.qty = qty; persist(); renderCart(); updateBadge();
  }

  function removeItem(id) { state.cart = state.cart.filter(i => i.id !== id); persist(); renderCart(); updateBadge(); toast('Producto eliminado del carrito', 'info'); }

  function updateBadge(bump) {
    const t = totals(); const b = $('#cartBadge');
    b.textContent = t.units; b.style.display = t.units ? 'grid' : 'none';
    if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }

  function renderCart() {
    const t = totals(); const box = $('#cartItems'); const empty = state.cart.length === 0;
    $('#cartEmpty').classList.toggle('hidden', !empty);
    $('#cartFoot').classList.toggle('hidden', empty);
    box.classList.toggle('hidden', empty);
    $('#drawerCount').textContent = t.units + (t.units === 1 ? ' producto' : ' productos');

    box.innerHTML = state.cart.map(i => {
      const p = getProduct(i.id); if (!p) return '';
      return `<div class="cart-item" data-id="${p.id}">
        <div class="ci-art">${artFor(p)}</div>
        <div class="ci-info">
          <span class="ci-brand">${esc(p.brand)}</span>
          <span class="ci-name">${esc(p.name)}</span>
          <span style="font-size:.7rem;color:var(--stone)">${money(p.price)} c/u</span>
          <div class="ci-bottom">
            <div class="qty">
              <button data-minus="${p.id}" aria-label="Restar">−</button>
              <span>${i.qty}</span>
              <button data-plus="${p.id}" aria-label="Sumar">+</button>
            </div>
            <span class="ci-price">${money(p.price * i.qty)}</span>
          </div>
          <button class="ci-del" data-del="${p.id}">Eliminar</button>
        </div>
      </div>`;
    }).join('');

    const bar = $('#shipBar');
    bar.style.width = Math.min(100, t.pct).toFixed(1) + '%';
    $('#shipProgress').classList.toggle('done', t.remaining <= 0);
    $('#shipMsg').innerHTML = `🎉 <strong>ENVÍO GRATIS</strong> aplicado a todos los pedidos`;

    const note = $('#comboNote');
    note.classList.toggle('hidden', t.combo <= 0);
    if (t.combo > 0) note.textContent = t.comboLabel;

    $('#sumSubtotal').textContent = money(t.subtotal);
    const rowCombo = $('#rowCombo');
    rowCombo.style.display = t.combo > 0 ? 'flex' : 'none';
    $('#sumCombo').textContent = '-' + money(t.combo);
    $('#sumShip').textContent = t.shipping === 0 ? 'GRATIS' : money(t.shipping);
    $('#sumShip').style.color = t.shipping === 0 ? 'var(--sage-2)' : 'var(--ink)';
    $('#sumTotal').textContent = money(t.total);
  }

  function flyToCart(el) {
    const cart = $('#cartBtn'); if (!el || !cart || !el.getBoundingClientRect) return;
    const a = el.getBoundingClientRect(), b = cart.getBoundingClientRect();
    const clone = el.cloneNode(true);
    clone.style.cssText += `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;z-index:9999;pointer-events:none;border-radius:20px;overflow:hidden;margin:0;transition:transform .78s cubic-bezier(.5,-.15,.35,1),opacity .78s`;
    document.body.appendChild(clone);
    requestAnimationFrame(() => { clone.style.transform = `translate(${b.left - a.left + b.width / 2 - a.width / 2}px,${b.top - a.top + b.height / 2 - a.height / 2}px) scale(.1)`; clone.style.opacity = '.15'; });
    setTimeout(() => clone.remove(), 820);
  }

  /* ══════════ 9. VISTA RÁPIDA ══════════ */
  function openQuick(id) {
    const p = getProduct(id); if (!p) return;
    const off = discountPct(p); const out = p.stock <= 0;
    $('#quickBody').innerHTML = `
      <div class="qv">
        <div class="qv-media">
          <div class="art" id="qvArt">${artFor(p)}</div>
          <div class="pc-badges">
            ${off > 0 ? `<span class="badge badge-off">-${off}% OFF</span>` : ''}
            ${p.cat === 'perfumes' ? '<span class="badge badge-new">Sellado original</span>' : ''}
            ${p.cat === 'gorras' ? '<span class="badge badge-limited">Edición limitada</span>' : ''}
          </div>
        </div>
        <div class="qv-info">
          <span class="qv-brand">${esc(p.brand)} · ${CATS[p.cat].ico} ${CATS[p.cat].short}</span>
          <h3 class="qv-name">${esc(p.name)}</h3>
          <div class="qv-meta">
            <span>${starsHTML(p.rating)} <strong style="color:var(--sand-2)">${p.rating.toFixed(1)}</strong></span>
            <span>· ${p.reviews} reseñas</span>
            <span>· ${p.sold} vendidos</span>
          </div>
          <p class="qv-benefit">"${esc(p.benefit)}"</p>
          <ul class="qv-bullets">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
          <p style="font-size:.8rem;color:var(--clay);margin:0 0 1rem"><strong style="color:var(--ink)">Presentación:</strong> ${esc(p.pres)}</p>
          <div class="qv-price">
            <span class="now">${money(p.price)}</span>
            ${p.oldPrice > p.price ? `<span class="was">${money(p.oldPrice)}</span><span class="off">Ahorras ${money(p.oldPrice - p.price)}</span>` : ''}
          </div>
          ${out ? '<p class="pc-stock out" style="display:inline-block;margin-bottom:.8rem">Sin stock disponible</p>'
        : (p.stock <= 5 ? `<p class="qv-urgency">⚠️ ¡Últimas ${p.stock} unidades!</p>` : `<p class="qv-urgency" style="color:var(--sage-2)">✓ En stock · ${p.stock} unidades listas para envío</p>`)}
          <div class="qv-actions">
            ${out ? '' : `<div class="qty" style="transform:scale(1.15)">
                <button data-qminus aria-label="Restar">−</button><span id="qvQty">1</span><button data-qplus aria-label="Sumar">+</button>
              </div>
              <button class="btn btn-primary" data-qadd="${p.id}">🛒 Agregar al carrito</button>`}
            <button class="btn btn-ghost btn-sm" data-wa-product="${p.id}">💬 Consultar por WhatsApp</button>
          </div>
        </div>
      </div>`;
    openModal('quickModal');
  }

  /* ══════════ 10. CHECKOUT + WHATSAPP ══════════ */
  function openCheckout() {
    if (!state.cart.length) { toast('Tu carrito está vacío 🛒', 'err'); return; }
    const t = totals();
    const rows = state.cart.map(i => { const p = getProduct(i.id); if (!p) return ''; return `<div class="co-line"><span>${i.qty}x ${esc(p.name)}</span><span>${money(p.price * i.qty)}</span></div>`; }).join('');
    $('#checkoutBody').innerHTML = `
      <div class="co">
        <form class="co-form" id="coForm" novalidate>
          <h3 class="co-title">Datos de envío</h3>
          <p class="co-sub">Confirmaremos tu pedido por WhatsApp. Sin pasarelas de pago complicadas.</p>
          <div class="co-grid">
            <div class="field"><label for="coName">Nombre completo *</label><input class="input" id="coName" name="name" placeholder="Ej. Carlos Eduardo Pérez" autocomplete="name"/><span class="err-msg hidden" data-err="name">Ingresa tu nombre (mín. 3 caracteres).</span></div>
            <div class="field"><label for="coPhone">Teléfono de contacto *</label><input class="input" id="coPhone" name="phone" inputmode="tel" placeholder="Ej. +58 412-000-0000" autocomplete="tel"/><span class="err-msg hidden" data-err="phone">Teléfono inválido (mín. 7 dígitos).</span></div>
            <div class="field"><label for="coAddr">Dirección de entrega *</label><textarea class="textarea" id="coAddr" name="address" placeholder="Calle, número, barrio, ciudad y referencia" autocomplete="street-address"></textarea><span class="err-msg hidden" data-err="address">Necesitamos una dirección detallada (mín. 8 caracteres).</span></div>
            <div class="field"><label for="coNotes">Notas adicionales (opcional)</label><textarea class="textarea" id="coNotes" name="notes" placeholder="Horario preferido, referencias…"></textarea></div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1.2rem">
            <svg viewBox="0 0 32 32" style="width:19px;height:19px;fill:currentColor"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.5.7 4.8 2 6.8L3 29l6.9-2.4c1.8 1 3.9 1.6 6.1 1.6 7 0 12.5-5.5 12.5-12.5S23 3 16 3z"/></svg>
            Confirmar Pedido por WhatsApp
          </button>
          <p class="secure-note">🔒 Tus datos solo se usan para gestionar este pedido. Verificamos autenticidad y stock antes de confirmar.</p>
        </form>
        <aside class="co-side">
          <h4 style="margin:0 0 .8rem;font-size:.95rem;font-weight:800;color:var(--ink)">Resumen del pedido</h4>
          ${rows}
          <div class="co-line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          ${t.combo > 0 ? `<div class="co-line" style="color:var(--sage-2)"><span>Descuento combo (${state.settings.comboDiscount}%)</span><span>-${money(t.combo)}</span></div>` : ''}
          <div class="co-line"><span>Envío</span><span>${t.shipping === 0 ? 'GRATIS' : money(t.shipping)}</span></div>
          <div class="co-line" style="border:0;padding-top:.8rem"><span style="font-size:1rem;font-weight:800;color:var(--ink)">Total a pagar</span><span style="font-size:1.35rem;font-weight:900;color:var(--sand-2)">${money(t.total)}</span></div>
          <div style="margin-top:1.2rem;display:grid;gap:.45rem">
            <span style="font-size:.74rem;color:var(--clay)">🛡️ 100% Original Garantizado</span>
            <span style="font-size:.74rem;color:var(--clay)">🚚 Envío seguro a todo el país</span>
            <span style="font-size:.74rem;color:var(--clay)">✅ Garantía de satisfacción</span>
          </div>
        </aside>
      </div>`;
    openModal('checkoutModal');
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

  function waLink(text) { const num = String(state.settings.whatsapp || '').replace(/[^\d]/g, ''); return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text); }

  function submitOrder(e) {
    e.preventDefault(); const form = e.target;
    const data = { name: $('#coName', form).value.trim(), phone: $('#coPhone', form).value.trim(), address: $('#coAddr', form).value.trim(), notes: $('#coNotes', form).value.trim() };
    let ok = true;
    const rules = { name: v => v.length >= 3 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(v), phone: v => v.replace(/\D/g, '').length >= 7, address: v => v.length >= 8 };
    Object.keys(rules).forEach(k => {
      const input = form.querySelector('[name="' + k + '"]'); const err = form.querySelector('[data-err="' + k + '"]');
      const valid = rules[k](data[k]);
      input.classList.toggle('is-invalid', !valid); if (err) err.classList.toggle('hidden', valid); if (!valid) ok = false;
    });
    if (!state.cart.length) { toast('El carrito está vacío', 'err'); ok = false; }
    if (!ok) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); toast('Revisa los campos marcados ✍️', 'err'); return; }

    const t = totals();
    const items = state.cart.map(i => { const p = getProduct(i.id); return { id: p.id, name: p.name, brand: p.brand, price: p.price, qty: i.qty, cat: p.cat, visual: p.visual, tone: p.tone, image: p.image }; });
    const order = { code: 'TS-' + String(Date.now()).slice(-6), ts: Date.now(), client: data, items, subtotal: t.subtotal, combo: t.combo, shipping: t.shipping, total: t.total, status: ORDER_STATUS[0] };
    items.forEach(i => { const p = getProduct(i.id); if (p) { p.stock = Math.max(0, p.stock - i.qty); p.sold = (p.sold || 0) + i.qty; } });
    state.orders.unshift(order); state.cart = []; persist();
    const url = waLink(buildMessage(order)); $('#waFloat').href = url; window.open(url, '_blank', 'noopener');
    renderCart(); updateBadge(); renderCatalog();
    $('#checkoutBody').innerHTML = `
      <div class="success-box">
        <div class="success-ico">✓</div>
        <h3 style="font-size:1.45rem;font-weight:900;margin:.2rem 0 .5rem;color:var(--ink)">¡Pedido registrado!</h3>
        <p style="color:var(--clay);font-size:.9rem;max-width:44ch;margin:0 auto 1rem">Abrimos WhatsApp con tu pedido. Si no se abrió, usa el botón abajo.</p>
        <p style="margin:0 0 1.2rem;color:var(--ink)">Código: <span class="order-code">${order.code}</span></p>
        <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">
          <a class="btn btn-primary" href="${url}" target="_blank" rel="noopener">💬 Enviar por WhatsApp</a>
          <button class="btn btn-ghost" data-close="checkoutModal">Seguir comprando</button>
        </div>
      </div>`;
    toast('✓ Pedido ' + order.code + ' registrado correctamente', 'ok');
  }

  function submitEncargo(e) {
    e.preventDefault(); const form = e.target;
    const enc = { nombre: $('#encNombre', form).value.trim(), telefono: $('#encTelefono', form).value.trim(), link: $('#encLink', form).value.trim(), plataforma: $('#encPlataforma', form).value, cantidad: $('#encCantidad', form).value || 1, notas: $('#encNotas', form).value.trim() };
    let ok = true;
    const rules = { nombre: v => v.length >= 3, telefono: v => v.replace(/\D/g, '').length >= 7, link: v => v.length > 10 };
    Object.keys(rules).forEach(k => {
      const el = form.querySelector('#enc' + k.charAt(0).toUpperCase() + k.slice(1));
      const err = form.querySelector('[data-err-enc="' + k + '"]');
      const valid = rules[k](enc[k]);
      if (el) el.classList.toggle('is-invalid', !valid); if (err) err.classList.toggle('hidden', valid); if (!valid) ok = false;
    });
    if (!ok) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); toast('Completa todos los campos requeridos', 'err'); return; }
    enc.id = 'ENC-' + String(Date.now()).slice(-6); enc.ts = Date.now(); enc.status = 'Pendiente';
    state.encargos.unshift(enc); persist();
    const url = waLink(buildEncargoMessage(enc)); $('#waFloat').href = url; window.open(url, '_blank', 'noopener');
    form.reset();
    toast('✓ Solicitud de encargo enviada por WhatsApp', 'ok');
  }

  /* ══════════ 11. MODALES / DRAWER ══════════ */
  const OVERLAY = $('#overlay'); let openStack = [];

  function openModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.add('open'); document.body.classList.add('no-scroll'); OVERLAY.classList.add('show'); if (!openStack.includes(id)) openStack.push(id); const f = m.querySelector('input,select,textarea,button'); if (f && window.innerWidth > 700) setTimeout(() => f.focus(), 250); }
  function closeModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.remove('open'); openStack = openStack.filter(x => x !== id); if (!openStack.length) { document.body.classList.remove('no-scroll'); OVERLAY.classList.remove('show'); } }
  function openDrawer() { $('#cartDrawer').classList.add('open'); OVERLAY.classList.add('show'); document.body.classList.add('no-scroll'); openStack.push('cartDrawer'); }
  function closeDrawer() { $('#cartDrawer').classList.remove('open'); openStack = openStack.filter(x => x !== 'cartDrawer'); if (!openStack.length) { OVERLAY.classList.remove('show'); document.body.classList.remove('no-scroll'); } }

  /* ══════════ 12. TOASTS ══════════ */
  function toast(msg, type) {
    type = type || 'info';
    const box = $('#toastBox'); const el = document.createElement('div');
    el.className = 'toast ' + type;
    const ico = type === 'ok' ? '✅' : type === 'err' ? '⛔' : 'ℹ️';
    el.innerHTML = `<span class="t-ico">${ico}</span><span>${esc(msg)}</span>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 380); }, 3200);
  }

  /* ══════════ 13. COUNTDOWN + PRUEBA SOCIAL ══════════ */
  function startCountdown() {
    const dur = (state.settings.flashHours * 60 + state.settings.flashMins) * 60000;
    if (!state.flashEnd || state.flashEnd < Date.now()) { state.flashEnd = Date.now() + dur; persist(); }
    const el = $('#flashTimer');
    const tick = () => {
      let ms = state.flashEnd - Date.now();
      if (ms <= 0) { state.flashEnd = Date.now() + dur; persist(); ms = dur; }
      const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
      const txt = String(h).padStart(2, '0') + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
      if (el) el.textContent = txt;
    };
    tick(); setInterval(tick, 1000);
  }

  function socialProof() {
    const box = $('#proofBox'); if (!box) return;
    const show = () => {
      if (document.hidden) return;
      const pool = state.products.filter(p => p.active !== false && p.stock > 0); if (!pool.length) return;
      const p = pool[Math.floor(Math.random() * pool.length)];
      const who = BUYERS[Math.floor(Math.random() * BUYERS.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const mins = 1 + Math.floor(Math.random() * 42);
      const card = document.createElement('div');
      card.className = 'proof-card';
      card.innerHTML = `<div class="proof-thumb">${artFor(p)}</div><p class="proof-txt"><strong>${esc(who)}</strong> en ${esc(city)} acaba de adquirir<br><em>${esc(p.name)}</em><br><span style="opacity:.7">hace ${mins} min · compra verificada ✓</span></p><button class="proof-close" aria-label="Cerrar">✕</button>`;
      box.appendChild(card);
      const kill = () => { card.classList.add('out'); setTimeout(() => card.remove(), 420); };
      card.querySelector('.proof-close').addEventListener('click', kill);
      while (box.children.length > 2) box.firstChild.remove();
      setTimeout(kill, 7000);
    };
    setTimeout(show, 6000); setInterval(show, 15000);
  }

  /* ══════════ 14. PANEL ADMIN ══════════ */
  function metrics() {
    const sales = state.orders.reduce((s, o) => s + o.total, 0);
    const unitsByProduct = {};
    state.orders.forEach(o => o.items.forEach(i => { unitsByProduct[i.name] = (unitsByProduct[i.name] || 0) + i.qty; }));
    const top = Object.entries(unitsByProduct).sort((a, b) => b[1] - a[1])[0];
    const byCat = { suplementos: 0, perfumes: 0, gorras: 0 };
    state.orders.forEach(o => o.items.forEach(i => { byCat[i.cat] = (byCat[i.cat] || 0) + i.price * i.qty; }));
    return { sales, orders: state.orders.length, top: top ? { name: top[0], qty: top[1] } : { name: '—', qty: 0 }, avg: state.orders.length ? sales / state.orders.length : 0, byCat, unitsByProduct, encargos: state.encargos.length };
  }

  function renderAdmin() {
    const m = metrics(); const tab = state.ui.adminTab;
    const tabs = [['dash', '📊 Métricas'], ['prods', '📦 Productos'], ['orders', '🧾 Pedidos'], ['encargos', '📬 Encargos'], ['set', '⚙️ Ajustes']];
    $('#adminBody').innerHTML = `
      <div class="adm-head">
        <div><h3>Panel Administrativo · ${esc(state.settings.store)}</h3><p>Control total del catálogo, pedidos, encargos y métricas.</p></div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <span class="badge badge-limited">${state.products.length} productos</span>
          <span class="badge badge-off">${state.orders.length} pedidos</span>
          <span class="badge badge-new">${state.encargos.length} encargos</span>
        </div>
      </div>
      <div class="adm-tabs">${tabs.map(t => `<button class="adm-tab ${tab === t[0] ? 'is-active' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
      <div class="adm-body">${tab === 'dash' ? tabDash(m) : tab === 'prods' ? tabProducts() : tab === 'orders' ? tabOrders() : tab === 'encargos' ? tabEncargos() : tabSettings()}</div>`;
  }

  function tabDash(m) {
    const catTotal = Math.max(1, m.byCat.suplementos + m.byCat.perfumes + m.byCat.gorras);
    const lowStock = state.products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 6);
    return `
      <div class="metrics">
        <div class="metric"><span class="m-ico">💰</span><div class="m-val">${money(m.sales)}</div><span class="m-lab">Total ventas</span></div>
        <div class="metric"><span class="m-ico">🧾</span><div class="m-val">${m.orders}</div><span class="m-lab">Pedidos</span></div>
        <div class="metric"><span class="m-ico">📬</span><div class="m-val">${m.encargos}</div><span class="m-lab">Encargos</span></div>
        <div class="metric"><span class="m-ico">📈</span><div class="m-val">${money(m.avg)}</div><span class="m-lab">Ticket promedio</span></div>
      </div>
      <div class="adm-grid" style="margin-top:1.3rem;grid-template-columns:1fr">
        <div class="panel"><h4>📂 Ventas por categoría</h4><div class="bar-list">
          ${Object.keys(m.byCat).map(k => `<div class="bar-item"><small><span>${CATS[k].ico} ${CATS[k].label}</span><span>${money(m.byCat[k])}</span></small><div class="bar-track"><i style="width:${((m.byCat[k] / catTotal) * 100).toFixed(1)}%"></i></div></div>`).join('')}
        </div></div>
      </div>
      <div class="panel" style="margin-top:1.3rem"><h4>⚠️ Stock crítico</h4>
        ${lowStock.length ? `<div class="table-wrap"><table class="adm-table" style="min-width:auto"><tbody>${lowStock.map(p => `<tr><td><span class="t-name" style="font-size:.78rem">${esc(p.name.length > 32 ? p.name.slice(0, 32) + '…' : p.name)}</span></td><td style="text-align:right"><span class="badge ${p.stock === 0 ? 'badge-out' : 'badge-hot'}">${p.stock} u.</span></td></tr>`).join('')}</tbody></table></div>` : '<p style="color:var(--sage-2);font-size:.84rem;margin:0">✓ Todo el inventario está saludable.</p>'}
      </div>`;
  }

  function tabProducts() {
    const e = state.ui.editing ? getProduct(state.ui.editing) : null;
    const v = e || { name: '', brand: '', cat: 'suplementos', pres: '', price: '', oldPrice: '', stock: 10, benefit: '', desc: '', visual: 'bottle', tone: 'olive', image: '' };
    return `
      <div class="adm-grid">
        <div class="panel">
          <h4>${e ? '✏️ Editar producto' : '➕ Nuevo producto'}</h4>
          <form id="prodForm" class="form-grid" novalidate>
            <div class="field"><label>Nombre del producto *</label><input class="input" name="name" value="${esc(v.name)}" placeholder="Ej. Vitamin D3 5,000 UI" required></div>
            <div class="form-2">
              <div class="field"><label>Marca *</label><input class="input" name="brand" value="${esc(v.brand)}" placeholder="Spring Valley"></div>
              <div class="field"><label>Categoría *</label><select class="select" name="cat">${Object.keys(CATS).map(k => `<option value="${k}" ${v.cat === k ? 'selected' : ''}>${CATS[k].label}</option>`).join('')}</select></div>
            </div>
            <div class="field"><label>Presentación</label><input class="input" name="pres" value="${esc(v.pres)}" placeholder="60 Cápsulas"></div>
            <div class="form-2">
              <div class="field"><label>Precio (USD) *</label><input class="input" name="price" type="number" step="0.01" min="0" value="${v.price}" placeholder="15.00"></div>
              <div class="field"><label>Precio anterior</label><input class="input" name="oldPrice" type="number" step="0.01" min="0" value="${v.oldPrice || ''}" placeholder="19.00"></div>
            </div>
            <div class="form-2">
              <div class="field"><label>Stock *</label><input class="input" name="stock" type="number" min="0" step="1" value="${v.stock}"></div>
              <div class="field"><label>Ilustración</label><select class="select" name="visual">${[['bottle', 'Frasco blanco'], ['softgel', 'Frasco ámbar'], ['jar', 'Tarro polvo'], ['gummy', 'Gomitas'], ['kids', 'Gomitas infantil'], ['perfume', 'Perfume'], ['cap', 'Gorra']].map(o => `<option value="${o[0]}" ${v.visual === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
            </div>
            <div class="form-2">
              <div class="field"><label>Tono color</label><select class="select" name="tone">${Object.keys(TONES).map(k => `<option value="${k}" ${v.tone === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
              <div class="field"><label>Imagen URL o ruta (opcional)</label><input class="input" name="image" value="${esc(v.image || '')}" placeholder="ej: img/producto.jpg o https://..."></div>
            </div>
            <div class="field"><label>Beneficio (copy) *</label><textarea class="textarea" name="benefit" placeholder="Recupera tu vitalidad…">${esc(v.benefit)}</textarea></div>
            <div class="field"><label>Descripción</label><textarea class="textarea" name="desc">${esc(v.desc || '')}</textarea></div>
            <div style="display:flex;gap:.55rem;flex-wrap:wrap">
              <button type="submit" class="btn btn-primary">${e ? 'Guardar cambios' : 'Crear producto'}</button>
              ${e ? '<button type="button" class="btn btn-ghost" id="cancelEdit">Cancelar</button>' : ''}
            </div>
          </form>
        </div>
        <div class="panel">
          <h4>📦 Inventario (${state.products.length})</h4>
          <input class="input" id="admSearch" placeholder="Filtrar por nombre o marca…" style="margin-bottom:.8rem">
          <div class="table-wrap scroll-slim" style="max-height:60vh;overflow-y:auto">
            <table class="adm-table" id="prodTable">
              <thead><tr><th>Producto</th><th>Cat.</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead>
              <tbody>${state.products.map(rowProduct).join('')}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  function rowProduct(p) {
    return `<tr data-row="${p.id}" ${p.active === false ? 'style="opacity:.5"' : ''}>
      <td><div style="display:flex;gap:.55rem;align-items:center">
        <span class="t-thumb">${artFor(p)}</span>
        <span><span class="t-name">${esc(p.name)}</span><br><span class="t-brand">${esc(p.brand)} · ${esc(p.pres)}</span></span>
      </div></td>
      <td><span class="tag ${CATS[p.cat].tag}">${CATS[p.cat].short}</span></td>
      <td><input class="inline-inp" type="number" step="0.01" min="0" value="${p.price}" data-field="price" data-id="${p.id}"></td>
      <td><input class="inline-inp" type="number" step="1" min="0" value="${p.stock}" data-field="stock" data-id="${p.id}" style="width:64px"></td>
      <td><button class="icon-mini" data-toggle="${p.id}" title="Activar/desactivar">${p.active === false ? '⛔' : '✅'}</button></td>
      <td><div style="display:flex;gap:.35rem">
        <button class="icon-mini" data-edit="${p.id}" title="Editar">✏️</button>
        <button class="icon-mini del" data-remove="${p.id}" title="Eliminar">🗑️</button>
      </div></td>
    </tr>`;
  }

  function tabOrders() {
    if (!state.orders.length) return `<div class="panel"><h4>🧾 Pedidos</h4><p style="color:var(--clay);font-size:.86rem;margin:0">Todavía no hay pedidos registrados.</p><button class="btn btn-ghost btn-sm" id="seedOrders" style="margin-top:.9rem">Cargar pedidos demo</button></div>`;
    return `<div class="panel"><h4>🧾 Historial de pedidos (${state.orders.length})</h4>
      <div class="table-wrap scroll-slim" style="max-height:64vh;overflow-y:auto">
        <table class="adm-table"><thead><tr><th>Código / Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
        <tbody>${state.orders.map(o => `
          <tr>
            <td><strong>${o.code}</strong><br><span class="t-brand">${fmtDate(o.ts)}</span></td>
            <td><span class="t-name">${esc(o.client.name)}</span><br><span class="t-brand">📞 ${esc(o.client.phone)}</span><br><span class="t-brand">📍 ${esc(o.client.address)}</span></td>
            <td style="max-width:240px"><span class="t-brand" style="line-height:1.5">${o.items.map(i => `${i.qty}x ${esc(i.name)}`).join('<br>')}</span></td>
            <td><strong style="color:var(--sand-2)">${money(o.total)}</strong><br><span class="t-brand">${o.shipping === 0 ? '· envío gratis' : '· envío ' + money(o.shipping)}</span></td>
            <td><select class="status-sel" data-order="${o.code}">${ORDER_STATUS.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
            <td><div style="display:flex;gap:.35rem">
              <a class="icon-mini" href="${waLink(buildMessage(o))}" target="_blank" rel="noopener" title="WhatsApp">💬</a>
              <button class="icon-mini del" data-delorder="${o.code}" title="Eliminar">🗑️</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>
      </div></div>`;
  }

  function tabEncargos() {
    if (!state.encargos.length) return `<div class="panel"><h4>📬 Encargos</h4><p style="color:var(--clay);font-size:.86rem;margin:0">Aún no hay solicitudes de encargo registradas. Las solicitudes enviadas por el formulario aparecerán aquí.</p></div>`;
    return `<div class="panel"><h4>📬 Solicitudes de encargo (${state.encargos.length})</h4>
      <div class="table-wrap scroll-slim" style="max-height:64vh;overflow-y:auto">
        <table class="adm-table"><thead><tr><th>ID / Fecha</th><th>Cliente</th><th>Plataforma</th><th>Link</th><th>Detalles</th><th>Estado</th><th></th></tr></thead>
        <tbody>${state.encargos.map(enc => `
          <tr>
            <td><strong>${enc.id}</strong><br><span class="t-brand">${fmtDate(enc.ts)}</span></td>
            <td><span class="t-name">${esc(enc.nombre)}</span><br><span class="t-brand">📞 ${esc(enc.telefono)}</span></td>
            <td><span class="badge badge-new">${esc(enc.plataforma)}</span></td>
            <td style="max-width:200px"><a href="${esc(enc.link)}" target="_blank" rel="noopener" style="color:var(--sand-2);text-decoration:underline;font-size:.74rem;word-break:break-all">${esc(enc.link.length > 40 ? enc.link.slice(0, 40) + '…' : enc.link)}</a></td>
            <td><span class="t-brand">Cant: ${enc.cantidad}</span>${enc.notas ? `<br><span class="t-brand">${esc(enc.notas)}</span>` : ''}</td>
            <td><select class="status-sel" data-encargo="${enc.id}"><option ${enc.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option><option ${enc.status === 'Cotizado' ? 'selected' : ''}>Cotizado</option><option ${enc.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option><option ${enc.status === 'Entregado' ? 'selected' : ''}>Entregado</option></select></td>
            <td><div style="display:flex;gap:.35rem">
              <a class="icon-mini" href="${waLink(buildEncargoMessage(enc))}" target="_blank" rel="noopener" title="WhatsApp">💬</a>
              <button class="icon-mini del" data-delencargo="${enc.id}" title="Eliminar">🗑️</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>
      </div></div>`;
  }

  function tabSettings() {
    const s = state.settings;
    return `<div class="adm-grid" style="grid-template-columns:1fr">
      <div class="panel"><h4>⚙️ Configuración de la tienda</h4>
        <form id="setForm" class="form-grid">
          <div class="form-2">
            <div class="field"><label>Nombre de la tienda</label><input class="input" name="store" value="${esc(s.store)}"></div>
            <div class="field"><label>WhatsApp (con código país)</label><input class="input" name="whatsapp" value="${esc(s.whatsapp)}" placeholder="584120000000"></div>
          </div>
          <!-- Configuración de envío desactivada; conservar para uso futuro.
          <div class="form-2">
            <div class="field"><label>Envío gratis desde (USD)</label><input class="input" type="number" step="1" min="0" name="freeShipping" value="${s.freeShipping}"></div>
            <div class="field"><label>Costo de envío (USD)</label><input class="input" type="number" step="0.5" min="0" name="shipCost" value="${s.shipCost}"></div>
          </div> -->
          <!-- Descuento por cantidad desactivado; conservar para uso futuro.
          <div class="form-2">
            <div class="field"><label>Combo: unidades mínimas</label><input class="input" type="number" min="2" step="1" name="comboQty" value="${s.comboQty}"></div>
            <div class="field"><label>Combo: % de descuento</label><input class="input" type="number" min="0" max="90" step="1" name="comboDiscount" value="${s.comboDiscount}"></div>
          </div> -->
          <div class="form-2">
            <div class="field"><label>Combo: categoría</label><select class="select" name="comboCat">${Object.keys(CATS).map(k => `<option value="${k}" ${s.comboCat === k ? 'selected' : ''}>${CATS[k].label}</option>`).join('')}</select></div>
            <div class="field"><label>PIN administrador</label><input class="input" name="pin" value="${esc(s.pin)}" maxlength="8"></div>
          </div>
          <!-- Oferta relámpago desactivada; conservar para uso futuro.
          <div class="form-2">
            <div class="field"><label>Oferta relámpago (horas)</label><input class="input" type="number" min="0" max="72" name="flashHours" value="${s.flashHours}"></div>
            <div class="field"><label>Oferta relámpago (minutos)</label><input class="input" type="number" min="0" max="59" name="flashMins" value="${s.flashMins}"></div>
          </div> -->
          <div><button class="btn btn-primary" type="submit">Guardar ajustes</button></div>
        </form>
      </div>
      <div class="panel"><h4>🧰 Mantenimiento</h4>
        <div class="switch-row"><span>Restaurar catálogo original</span><button class="btn btn-ghost btn-sm" id="resetCatalog">Restaurar</button></div>
        <div class="switch-row"><span>Generar pedidos de demostración</span><button class="btn btn-ghost btn-sm" id="seedOrders2">Generar</button></div>
        <div class="switch-row"><span>Exportar pedidos en JSON</span><button class="btn btn-ghost btn-sm" id="exportOrders">Exportar</button></div>
        <div class="switch-row" style="border:0"><span>Eliminar todos los pedidos</span><button class="btn btn-danger btn-sm" id="clearOrders">Eliminar</button></div>
      </div>
    </div>`;
  }

  function openAdmin() {
    if (sessionStorage.getItem(ADMIN_SESSION) === '1') { renderAdmin(); openAdminView(); return; }
    $('#pinInput').value = ''; $('#pinError').classList.add('hidden');
    openModal('pinModal'); setTimeout(() => $('#pinInput').focus(), 260);
  }

  function tryPin() {
    const val = $('#pinInput').value.trim();
    if (val === String(state.settings.pin)) {
      sessionStorage.setItem(ADMIN_SESSION, '1'); closeModal('pinModal'); renderAdmin(); openAdminView(); toast('Bienvenido al panel administrativo', 'ok');
    } else {
      const c = $('#pinModal .modal-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); $('#pinError').classList.remove('hidden');
    }
  }

  function openAdminView() {
    $('#adminView').classList.remove('hidden');
    document.body.classList.add('no-scroll');
    window.scrollTo(0, 0);
  }

  function saveProduct(form) {
    const fd = new FormData(form); const get = k => String(fd.get(k) || '').trim();
    const name = get('name'), brand = get('brand'), benefit = get('benefit');
    const price = parseFloat(get('price')); const stock = parseInt(get('stock'), 10);
    if (!name || !brand || !(price >= 0) || isNaN(stock) || !benefit) { toast('Completa nombre, marca, precio, stock y beneficio', 'err'); form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
    const data = { name, brand, cat: get('cat'), pres: get('pres') || '—', price: Math.round(price * 100) / 100, oldPrice: Math.round((parseFloat(get('oldPrice')) || 0) * 100) / 100, stock: Math.max(0, stock), benefit, desc: get('desc') || (benefit + ' Producto importado y sellado de fábrica.'), visual: get('visual'), tone: get('tone'), image: get('image') };
    const editing = state.ui.editing;
    if (editing) { const p = getProduct(editing); Object.assign(p, data); toast('Producto actualizado ✓', 'ok'); }
    else {
      state.seq++; const id = 'p' + state.seq + '-' + slug(name).slice(0, 24); const cat = data.cat;
      const pool = cat === 'suplementos' ? SUP_BULLETS : cat === 'perfumes' ? PERF_BULLETS : CAP_BULLETS;
      state.products.unshift(Object.assign({ id, rating: 4.8, reviews: 12, sold: 0, bullets: pool.slice(0, 3), active: true, featured: false, createdAt: Date.now() }, data));
      toast('Producto creado ✓', 'ok');
    }
    state.ui.editing = null; persist(); renderAdmin(); renderCatalog(); renderHeroArt();
  }

  /* ══════════ 15. EVENTOS GLOBALES ══════════ */
  function bind() {
    const hdr = $('#siteHeader');
    const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    $('#menuBtn').addEventListener('click', () => {
      const n = $('#mobileNav'); const open = n.style.display === 'flex';
      n.style.display = open ? 'none' : 'flex'; $('#menuBtn').setAttribute('aria-expanded', String(!open));
    });

    document.addEventListener('click', ev => {
      const catBtn = ev.target.closest('[data-cat]');
      if (catBtn && catBtn.tagName !== 'A') {
        const cat = catBtn.dataset.cat; setCategory(cat);
        if (catBtn.closest('.mobile-nav')) { $('#mobileNav').style.display = 'none'; }
        if (catBtn.closest('.footer-inner')) { document.getElementById('tienda').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
      const closeBtn = ev.target.closest('[data-close]');
      if (closeBtn) { const id = closeBtn.dataset.close; if (id === 'cartDrawer') closeDrawer(); else closeModal(id); }
      const closeAdmin = ev.target.closest('[data-close-admin]');
      if (closeAdmin) { $('#adminView').classList.add('hidden'); document.body.classList.remove('no-scroll'); }
      const add = ev.target.closest('[data-add]');
      if (add) { const card = add.closest('.product-card'); const art = card ? card.querySelector('.pc-media .art') : null; addToCart(add.dataset.add, 1, art); }
      const qk = ev.target.closest('[data-quick]'); if (qk) openQuick(qk.dataset.quick);
      const fav = ev.target.closest('[data-fav]');
      if (fav) { const on = fav.textContent.trim() === '❤️'; fav.textContent = on ? '🤍' : '❤️'; toast(on ? 'Quitado de favoritos' : '❤️ Guardado en favoritos', 'info'); }
      const minus = ev.target.closest('[data-minus]'); if (minus) { const i = state.cart.find(x => x.id === minus.dataset.minus); setQty(minus.dataset.minus, (i ? i.qty : 1) - 1); }
      const plus = ev.target.closest('[data-plus]'); if (plus) { const i = state.cart.find(x => x.id === plus.dataset.plus); setQty(plus.dataset.plus, (i ? i.qty : 0) + 1); }
      const del = ev.target.closest('[data-del]'); if (del) removeItem(del.dataset.del);
      const qm = ev.target.closest('[data-qplus],[data-qminus],[data-qadd],[data-wa-product]');
      if (qm) {
        const qtyEl = $('#qvQty');
        if (qm.hasAttribute('data-qplus') && qtyEl) qtyEl.textContent = Math.min(99, parseInt(qtyEl.textContent, 10) + 1);
        if (qm.hasAttribute('data-qminus') && qtyEl) qtyEl.textContent = Math.max(1, parseInt(qtyEl.textContent, 10) - 1);
        if (qm.hasAttribute('data-qadd')) { const id = qm.dataset.qadd; const q = qtyEl ? parseInt(qtyEl.textContent, 10) : 1; addToCart(id, q, $('#qvArt')); closeModal('quickModal'); openDrawer(); }
        if (qm.hasAttribute('data-wa-product')) { const p = getProduct(qm.dataset.waProduct); const txt = `*¡Hola Importaciones Adriel!* 👋\nEstoy interesado(a) en:\n\n• *${esc(p.name)}* (${esc(p.brand)})\n• Precio: ${money(p.price)}\n• Presentación: ${esc(p.pres)}\n\n¿Me confirman disponibilidad y tiempo de entrega? ¡Gracias!`; window.open(waLink(txt), '_blank', 'noopener'); }
      }
      const tab = ev.target.closest('[data-tab]'); if (tab) { state.ui.adminTab = tab.dataset.tab; renderAdmin(); }
      const ed = ev.target.closest('[data-edit]'); if (ed) { state.ui.editing = ed.dataset.edit; state.ui.adminTab = 'prods'; renderAdmin(); $('#prodForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      const ce = ev.target.closest('#cancelEdit'); if (ce) { state.ui.editing = null; renderAdmin(); }
      const rm = ev.target.closest('[data-remove]');
      if (rm) { const p = getProduct(rm.dataset.remove); if (confirm('¿Eliminar "' + p.name + '" del catálogo?')) { state.products = state.products.filter(x => x.id !== p.id); state.cart = state.cart.filter(x => x.id !== p.id); persist(); renderAdmin(); renderCatalog(); updateBadge(); renderCart(); toast('Producto eliminado', 'info'); } }
      const tg = ev.target.closest('[data-toggle]'); if (tg) { const p = getProduct(tg.dataset.toggle); p.active = p.active === false; persist(); renderAdmin(); renderCatalog(); }
      const dso = ev.target.closest('#seedOrders,#seedOrders2'); if (dso) { state.orders = demoOrders().concat(state.orders); persist(); renderAdmin(); toast('Pedidos de demostración cargados', 'ok'); }
      const dord = ev.target.closest('[data-delorder]'); if (dord && confirm('¿Eliminar este pedido?')) { state.orders = state.orders.filter(o => o.code !== dord.dataset.delorder); persist(); renderAdmin(); toast('Pedido eliminado', 'info'); }
      const denc = ev.target.closest('[data-delencargo]'); if (denc && confirm('¿Eliminar esta solicitud de encargo?')) { state.encargos = state.encargos.filter(e => e.id !== denc.dataset.delencargo); persist(); renderAdmin(); toast('Encargo eliminado', 'info'); }
      const exp = ev.target.closest('#exportOrders'); if (exp) { const blob = new Blob([JSON.stringify(state.orders, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'importaciones-adriel-pedidos.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); toast('Pedidos exportados ✓', 'ok'); }
      const clr = ev.target.closest('#clearOrders'); if (clr && confirm('¿Eliminar TODOS los pedidos?')) { state.orders = []; persist(); renderAdmin(); toast('Historial borrado', 'info'); }
      const rst = ev.target.closest('#resetCatalog'); if (rst && confirm('Se restaurará el catálogo original. ¿Continuar?')) { state.products = buildSeed(); state.ui.editing = null; persist(); renderAdmin(); renderCatalog(); renderHeroArt(); toast('Catálogo restaurado ✓', 'ok'); }
    });

    document.addEventListener('change', ev => {
      const st = ev.target.closest('[data-order]'); if (st) { const o = state.orders.find(x => x.code === st.dataset.order); if (o) { o.status = st.value; persist(); toast('Pedido ' + o.code + ' → ' + o.status, 'ok'); renderAdmin(); } }
      const se = ev.target.closest('[data-encargo]'); if (se) { const enc = state.encargos.find(x => x.id === se.dataset.encargo); if (enc) { enc.status = se.value; persist(); toast('Encargo actualizado: ' + enc.status, 'ok'); } }
      const inline = ev.target.closest('[data-field]'); if (inline) { const p = getProduct(inline.dataset.id); if (!p) return; const val = parseFloat(inline.value); if (isNaN(val) || val < 0) { inline.value = p[inline.dataset.field]; return; } p[inline.dataset.field] = inline.dataset.field === 'stock' ? Math.round(val) : Math.round(val * 100) / 100; persist(); renderCatalog(); renderCart(); toast(p.name.slice(0, 28) + '… actualizado', 'ok'); }
    });

    document.addEventListener('submit', ev => {
      if (ev.target.id === 'coForm') { submitOrder(ev); return; }
      if (ev.target.id === 'encargoForm') { ev.preventDefault(); submitEncargo(ev); return; }
      if (ev.target.id === 'prodForm') { ev.preventDefault(); saveProduct(ev.target); return; }
      if (ev.target.id === 'setForm') {
        ev.preventDefault(); const fd = new FormData(ev.target); const s = state.settings;
        s.store = String(fd.get('store') || 'Importaciones Adriel').trim();
        s.whatsapp = String(fd.get('whatsapp') || '').replace(/[^\d]/g, '');
        s.freeShipping = Math.max(0, parseFloat(fd.get('freeShipping')) || 0);
        s.shipCost = Math.max(0, parseFloat(fd.get('shipCost')) || 0);
        s.comboQty = Math.max(2, parseInt(fd.get('comboQty'), 10) || 2);
        s.comboDiscount = Math.max(0, Math.min(90, parseInt(fd.get('comboDiscount'), 10) || 0));
        s.comboCat = String(fd.get('comboCat') || 'suplementos');
        s.pin = String(fd.get('pin') || '1234').trim();
        s.flashHours = Math.max(0, parseInt(fd.get('flashHours'), 10) || 0);
        s.flashMins = Math.max(0, parseInt(fd.get('flashMins'), 10) || 0);
        state.flashEnd = Date.now() + (s.flashHours * 60 + s.flashMins) * 60000;
        persist(); syncSettingsUI(); renderCart(); renderAdmin(); renderCatalog(); toast('Ajustes guardados ✓', 'ok');
      }
    });

    document.addEventListener('input', debounce(e => {
      if (e.target.id === 'admSearch') { const q = e.target.value.toLowerCase(); $$('#prodTable tbody tr').forEach(tr => { tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : ' none'; }); }
    }, 120));

    $('#cartBtn').addEventListener('click', openDrawer);
    $('#adminBtn').addEventListener('click', openAdmin);
    $('#adminBtnFooter').addEventListener('click', openAdmin);
    $('#goCheckout').addEventListener('click', () => { closeDrawer(); openCheckout(); });
    OVERLAY.addEventListener('click', () => { closeDrawer();['quickModal', 'checkoutModal', 'adminModal', 'pinModal'].forEach(closeModal); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer();['quickModal', 'checkoutModal', 'adminModal', 'pinModal'].forEach(closeModal); } });
    $('#pinSubmit').addEventListener('click', tryPin);
    $('#pinInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryPin(); });

    const doSearch = debounce(val => { state.filters.q = val; $$('#searchDesktop,#searchMobile').forEach(i => { if (i.value !== val) i.value = val; }); renderCatalog(); }, 180);
    ['#searchDesktop', '#searchMobile'].forEach(sel => { const el = $(sel); if (!el) return; el.addEventListener('input', () => doSearch(el.value)); el.addEventListener('search', () => doSearch(el.value)); });

    $('#sortSelect').addEventListener('change', e => { state.filters.sort = e.target.value; renderCatalog(); });

    const minR = $('#priceMin'), maxR = $('#priceMax');
    const syncPrice = () => {
      let a = parseInt(minR.value, 10), b = parseInt(maxR.value, 10);
      if (a > b) { const t = a; a = b; b = t; minR.value = a; maxR.value = b; }
      state.filters.min = a; state.filters.max = b;
      $('#priceLabel').textContent = money(a) + ' — ' + money(b);
      $$('#quickRanges .mini-chip').forEach(c => c.classList.toggle('is-active', +c.dataset.min === a && +c.dataset.max === b));
      renderCatalog();
    };
    minR.addEventListener('input', syncPrice); maxR.addEventListener('input', syncPrice);
    $('#quickRanges').addEventListener('click', e => {
      const c = e.target.closest('.mini-chip'); if (!c || !c.dataset.min) return;
      minR.value = c.dataset.min; maxR.value = c.dataset.max; syncPrice();
    });
    $('#clearFilters').addEventListener('click', resetFilters);
    $('#emptyReset').addEventListener('click', resetFilters);

    // Footer cat links
    $$('.footer-link[data-cat]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); setCategory(a.dataset.cat); document.getElementById('tienda').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    });
  }

  function resetFilters() {
    state.filters = { q: '', cat: 'all', min: 0, max: 400, sort: 'relevance' };
    const sd = $('#searchDesktop'), sm = $('#searchMobile'); if (sd) sd.value = ''; if (sm) sm.value = '';
    $('#priceMin').value = 0; $('#priceMax').value = 400; $('#sortSelect').value = 'relevance';
    $('#priceLabel').textContent = '$0.00 — $400.00';
    syncCatUI(); renderCatalog();
  }

  function setCategory(cat) { state.filters.cat = cat; syncCatUI(); renderCatalog(); }

  function syncCatUI() {
    $$('[data-cat]').forEach(b => { const on = b.dataset.cat === state.filters.cat; b.classList.toggle('is-active', on); });
  }

  function syncSettingsUI() {
    $$('[data-freeship]').forEach(el => el.textContent = money(state.settings.freeShipping));
    const waBase = `*¡Hola ${state.settings.store}!* 👋 Quiero información sobre sus productos.`;
    $('#waFloat').href = waLink(waBase); $('#footerWhats').href = waLink(waBase);
  }

  /* ══════════ 16. INIT ══════════ */
  function init() {
    restore();
    state.cart = state.cart.filter(i => getProduct(i.id));
    $('#year').textContent = new Date().getFullYear();
    syncSettingsUI();
    renderHeroArt();
    renderCatalog();
    renderCart();
    updateBadge(false);
    // startCountdown(); // Oferta relámpago desactivada; conservar para uso futuro.
    socialProof();
    bind();
    syncCatUI();
    setInterval(() => { persist(); }, 20000);
    console.log('%c IMPORTACIONES ADRIEL · tienda lista ', 'background:#A6856A;color:#FDFCFB;font-weight:bold;padding:4px 8px;border-radius:6px');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
