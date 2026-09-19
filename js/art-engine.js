/* ═══════════════════════════════════════════════════════════
   IMPORTACIONES ADRIEL · js/art-engine.js
   Motor de ilustración SVG de productos.

   Genera la ilustración (frasco, gomitas, perfume, gorra…)
   de cada producto a partir de su `visual` y `tone`. Si el
   producto tiene campo `image`, devuelve esa imagen en su lugar.

   Uso:  ArtEngine.artFor(producto)  →  string HTML (<svg> o <div>)
   API pública:
     ArtEngine.artFor(p)   → HTML de la ilustración
     ArtEngine.TONES       → paleta de tonos disponibles
     ArtEngine.VISUALS     → tipos de ilustración (para el admin)
   ═══════════════════════════════════════════════════════════ */
window.ArtEngine = (function () {
  'use strict';

  /* ══════════ PALETA DE TONOS ══════════ */
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

  /* Tipos de ilustración disponibles (clave → etiqueta para el admin) */
  const VISUALS = [
    ['bottle', 'Frasco blanco'],
    ['softgel', 'Frasco ámbar'],
    ['jar', 'Tarro polvo'],
    ['gummy', 'Gomitas'],
    ['kids', 'Gomitas infantil'],
    ['perfume', 'Perfume'],
    ['cap', 'Gorra']
  ];

  /* ══════════ INTERNOS ══════════ */
  let artSeq = 0;
  const artCache = new Map();
  const nid = () => 'v' + (++artSeq);

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
  function hex2rgb(h) {
    const s = h.replace('#', '');
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  function shade(hex, amt) {
    const [r, g, b] = hex2rgb(hex);
    const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  /* Marco común: fondo, halo y aro decorativo */
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

  /* ══════════ ILUSTRACIONES ══════════ */
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

  /* ══════════ PUNTO DE ENTRADA ══════════
     Devuelve el HTML de la ilustración del producto:
     - Si `p.image` tiene valor → <div> con la imagen real.
     - Si no → SVG generado según `p.visual` con el tono `p.tone`. */
  function artFor(p) {
    if (!p) return '';
    if (p.image && String(p.image).trim()) {
      return `<div class="art-img"><img src="${esc(String(p.image).trim())}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentNode.style.display='none'"></div>`;
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

  return { artFor, TONES, VISUALS, shade };
})();
