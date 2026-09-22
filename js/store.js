/* ═══════════════════════════════════════════════════════════
   IMPORTACIONES ADRIEL · js/store.js
   Lógica de la tienda pública (index.html): catálogo, filtros,
   carrito, vista rápida, checkout por WhatsApp y prueba social.

   Depende de:
     - js/art-engine.js  (ilustraciones → ArtEngine.artFor)
     - js/common.js      (datos y utilidades → TA)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const { CATS, esc, money, slug, debounce, starsHTML, discountPct, $, $$, toast } = TA;

  /* ══════════ 1. ESTADO DE UI (solo vista) ══════════ */
  let filters = { q: '', cat: 'all', min: 0, max: 400, sort: 'relevance' };

  /* Prueba social (nombres y ciudades aleatorias de las notificaciones) */
  const BUYERS = ['Carlos E.', 'María F.', 'Andrés P.', 'Laura G.', 'Jhon R.', 'Valentina M.', 'Diego A.', 'Camila T.', 'Santiago V.', 'Daniela O.', 'Felipe C.', 'Ana Lucía R.', 'Sebastián H.', 'Paola N.'];
  const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena', 'Quito', 'Guayaquil', 'Lima', 'Panamá', 'Caracas', 'Valencia'];

  const S = () => TA.state; // acceso directo al estado compartido
  const artFor = p => ArtEngine.artFor(p);
  const getProduct = TA.getProduct;

  /* ══════════ 2. TOTALES DEL CARRITO ══════════ */
  function totals() {
    const st = S();
    let units = 0, subtotal = 0, supUnits = 0, supSub = 0;
    st.cart.forEach(i => {
      const p = getProduct(i.id); if (!p) return;
      const line = p.price * i.qty;
      units += i.qty; subtotal += line;
      if (p.cat === st.settings.comboCat) { supUnits += i.qty; supSub += line; }
    });
    // Descuento por cantidad desactivado temporalmente. Conservar para uso futuro:
    let combo = 0, comboLabel = '';
    /*
    if (supUnits >= st.settings.comboQty) {
      combo = Math.round(supSub * st.settings.comboDiscount) / 100;
      comboLabel = '🎁 Combo activo: ' + supUnits + ' ' + CATS[st.settings.comboCat].short.toLowerCase() + ' → ' + st.settings.comboDiscount + '% OFF';
    }
    */
    const after = subtotal - combo;
    // Envío gratis permanente. Conservar el cálculo anterior para uso futuro:
    const shipping = 0;
    /*
    const shipping = (after <= 0 || after >= st.settings.freeShipping) ? 0 : st.settings.shipCost;
    const remaining = Math.max(0, st.settings.freeShipping - after);
    const pct = st.settings.freeShipping > 0 ? Math.min(100, (after / st.settings.freeShipping) * 100) : 0;
    */
    const remaining = 0;
    const pct = 100;
    return { units, subtotal, combo, comboLabel, after, shipping, total: after + shipping, remaining, pct, supUnits };
  }

  function filtered() {
    const st = S();
    const q = filters.q.trim().toLowerCase();
    let list = st.products.filter(p => p.active !== false);
    if (filters.cat !== 'all') list = list.filter(p => p.cat === filters.cat);
    if (q) { list = list.filter(p => { const hay = (p.name + ' ' + p.brand + ' ' + p.benefit + ' ' + p.pres + ' ' + (CATS[p.cat] ? CATS[p.cat].label : '')).toLowerCase(); return q.split(/\s+/).every(tok => hay.includes(tok)); }); }
    list = list.filter(p => p.price >= filters.min && p.price <= filters.max);
    const s = filters.sort;
    if (s === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (s === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (s === 'rating') list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (s === 'sold') list.sort((a, b) => b.sold - a.sold);
    else if (s === 'discount') list.sort((a, b) => discountPct(b) - discountPct(a));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.sold - a.sold);
    return list;
  }

  /* ══════════ 3. RENDER CATÁLOGO ══════════ */
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
    if (S().catalogError && !S().products.length) {
      gridEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      $('#resultCount').textContent = 'Catálogo no disponible';
      emptyEl.querySelector('p').textContent = S().catalogError;
      return;
    }
    const list = filtered();
    gridEl.innerHTML = list.map(cardHTML).join('');
    emptyEl.classList.toggle('hidden', list.length > 0);
    $('#resultCount').textContent = list.length
      ? `${list.length} producto${list.length === 1 ? '' : 's'} · envío gratis en todos los pedidos`
      : 'Sin resultados para tu búsqueda';

    const counts = { all: 0 };
    Object.keys(CATS).forEach(k => counts[k] = 0);
    S().products.filter(p => p.active !== false).forEach(p => { counts.all++; counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $$('[data-count]').forEach(el => { el.textContent = counts[el.dataset.count] || 0; });

    // combo discount label
    const cl = $('#comboDiscLabel');
    if (cl) cl.textContent = S().settings.comboDiscount + '%';

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
    const prods = S().products;
    const picks = [
      prods.find(p => p.cat === 'suplementos' && p.featured) || prods.find(p => p.cat === 'suplementos'),
      prods.find(p => p.cat === 'perfumes'),
      prods.find(p => p.cat === 'gorras')
    ].filter(Boolean);
    box.innerHTML = picks.map((p, i) => `<div class="float-card fc${i + 1}"><div class="art">${artFor(p)}</div></div>`)
    /* .join('') + `<span class="hero-badge">⭐ ${(picks[0] ? picks[0].rating : 4.9).toFixed(1)}/5 · +2.400 clientes felices</span>` */;
  }

  /* ══════════ 4. CARRITO ══════════ */
  function addToCart(id, qty, srcEl) {
    const p = getProduct(id); if (!p) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const st = S();
    const line = st.cart.find(i => i.id === id);
    const current = line ? line.qty : 0;
    if (p.stock <= 0) { toast('Producto agotado 😔', 'err'); return; }
    if (current + qty > p.stock) { qty = p.stock - current; if (qty <= 0) { toast('Stock máximo alcanzado (' + p.stock + ' u.)', 'err'); return; } toast('Ajustamos la cantidad al stock disponible (' + p.stock + ' u.)', 'info'); }
    if (line) line.qty += qty; else st.cart.push({ id, qty });
    TA.saveCart(); renderCart(); updateBadge(true);
    toast(`✓ ${p.name} agregado al carrito`, 'ok');
    if (srcEl) flyToCart(srcEl);
    const t = totals();
    if (t.units >= st.settings.comboQty && t.combo > 0) { setTimeout(() => toast(t.comboLabel.replace('🎁 ', '🎁 ¡') + '! aplicado', 'ok'), 700); }
  }

  function setQty(id, qty) {
    const p = getProduct(id); const line = S().cart.find(i => i.id === id); if (!line) return;
    qty = parseInt(qty, 10) || 0;
    if (qty <= 0) { removeItem(id); return; }
    if (p && qty > p.stock) { qty = p.stock; toast('Solo hay ' + p.stock + ' unidades en stock', 'info'); }
    line.qty = qty; TA.saveCart(); renderCart(); updateBadge();
  }

  function removeItem(id) { TA.state.cart = TA.state.cart.filter(i => i.id !== id); TA.saveCart(); renderCart(); updateBadge(); toast('Producto eliminado del carrito', 'info'); }

  function updateBadge(bump) {
    const t = totals(); const b = $('#cartBadge');
    b.textContent = t.units; b.style.display = t.units ? 'grid' : 'none';
    if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  }

  function renderCart() {
    const st = S();
    const t = totals(); const box = $('#cartItems'); const empty = st.cart.length === 0;
    $('#cartEmpty').classList.toggle('hidden', !empty);
    $('#cartFoot').classList.toggle('hidden', empty);
    box.classList.toggle('hidden', empty);
    $('#drawerCount').textContent = t.units + (t.units === 1 ? ' producto' : ' productos');

    box.innerHTML = st.cart.map(i => {
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

  /* ══════════ 5. VISTA RÁPIDA ══════════ */
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

  /* ══════════ 6. CHECKOUT + WHATSAPP ══════════ */
  function openCheckout() {
    const st = S();
    if (!st.cart.length) { toast('Tu carrito está vacío 🛒', 'err'); return; }
    const t = totals();
    const rows = st.cart.map(i => { const p = getProduct(i.id); if (!p) return ''; return `<div class="co-line"><span>${i.qty}x ${esc(p.name)}</span><span>${money(p.price * i.qty)}</span></div>`; }).join('');
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
          ${t.combo > 0 ? `<div class="co-line" style="color:var(--sage-2)"><span>Descuento combo (${st.settings.comboDiscount}%)</span><span>-${money(t.combo)}</span></div>` : ''}
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
    if (!S().cart.length) { toast('El carrito está vacío', 'err'); ok = false; }
    if (!ok) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); toast('Revisa los campos marcados ✍️', 'err'); return; }

    const st = S();
    const t = totals();
    const items = st.cart.map(i => { const p = getProduct(i.id); return { id: p.id, name: p.name, brand: p.brand, price: p.price, qty: i.qty, cat: p.cat, visual: p.visual, tone: p.tone, image: p.image }; });
    const order = { code: 'TS-' + String(Date.now()).slice(-6), ts: Date.now(), client: data, items, subtotal: t.subtotal, combo: t.combo, shipping: t.shipping, total: t.total, status: TA.ORDER_STATUS[0] };
    items.forEach(i => { const p = getProduct(i.id); if (p) { p.stock = Math.max(0, p.stock - i.qty); p.sold = (p.sold || 0) + i.qty; } });
    st.orders.unshift(order);
    TA.registerClient(data, order); // alta/actualización del cliente en el registro
    st.cart = [];
    TA.saveProducts(); TA.saveOrders(); TA.saveCart();
    const url = TA.waLink(TA.buildMessage(order)); $('#waFloat').href = url; window.open(url, '_blank', 'noopener');
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
    const st = S();
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
    st.encargos.unshift(enc); TA.saveEncargos();
    const url = TA.waLink(TA.buildEncargoMessage(enc)); $('#waFloat').href = url; window.open(url, '_blank', 'noopener');
    form.reset();
    toast('✓ Solicitud de encargo enviada por WhatsApp', 'ok');
  }

  /* ══════════ 7. MODALES / DRAWER ══════════ */
  const OVERLAY = $('#overlay'); let openStack = [];

  function openModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.add('open'); document.body.classList.add('no-scroll'); OVERLAY.classList.add('show'); if (!openStack.includes(id)) openStack.push(id); const f = m.querySelector('input,select,textarea,button'); if (f && window.innerWidth > 700) setTimeout(() => f.focus(), 250); }
  function closeModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.remove('open'); openStack = openStack.filter(x => x !== id); if (!openStack.length) { document.body.classList.remove('no-scroll'); OVERLAY.classList.remove('show'); } }
  function openDrawer() { $('#cartDrawer').classList.add('open'); OVERLAY.classList.add('show'); document.body.classList.add('no-scroll'); openStack.push('cartDrawer'); }
  function closeDrawer() { $('#cartDrawer').classList.remove('open'); openStack = openStack.filter(x => x !== 'cartDrawer'); if (!openStack.length) { OVERLAY.classList.remove('show'); document.body.classList.remove('no-scroll'); } }

  /* ══════════ 8. COUNTDOWN + PRUEBA SOCIAL ══════════ */
  function startCountdown() {
    const st = S();
    const dur = (st.settings.flashHours * 60 + st.settings.flashMins) * 60000;
    if (!st.flashEnd || st.flashEnd < Date.now()) { st.flashEnd = Date.now() + dur; TA.persist(); }
    const el = $('#flashTimer');
    const tick = () => {
      let ms = st.flashEnd - Date.now();
      if (ms <= 0) { st.flashEnd = Date.now() + dur; TA.persist(); ms = dur; }
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
      const pool = S().products.filter(p => p.active !== false && p.stock > 0); if (!pool.length) return;
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

  /* ══════════ 9. EVENTOS ══════════ */
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
      const add = ev.target.closest('[data-add]');
      if (add) { const card = add.closest('.product-card'); const art = card ? card.querySelector('.pc-media .art') : null; addToCart(add.dataset.add, 1, art); }
      const qk = ev.target.closest('[data-quick]'); if (qk) openQuick(qk.dataset.quick);
      const fav = ev.target.closest('[data-fav]');
      if (fav) { const on = fav.textContent.trim() === '❤️'; fav.textContent = on ? '🤍' : '❤️'; toast(on ? 'Quitado de favoritos' : '❤️ Guardado en favoritos', 'info'); }
      const minus = ev.target.closest('[data-minus]'); if (minus) { const i = S().cart.find(x => x.id === minus.dataset.minus); setQty(minus.dataset.minus, (i ? i.qty : 1) - 1); }
      const plus = ev.target.closest('[data-plus]'); if (plus) { const i = S().cart.find(x => x.id === plus.dataset.plus); setQty(plus.dataset.plus, (i ? i.qty : 0) + 1); }
      const del = ev.target.closest('[data-del]'); if (del) removeItem(del.dataset.del);
      const qm = ev.target.closest('[data-qplus],[data-qminus],[data-qadd],[data-wa-product]');
      if (qm) {
        const qtyEl = $('#qvQty');
        if (qm.hasAttribute('data-qplus') && qtyEl) qtyEl.textContent = Math.min(99, parseInt(qtyEl.textContent, 10) + 1);
        if (qm.hasAttribute('data-qminus') && qtyEl) qtyEl.textContent = Math.max(1, parseInt(qtyEl.textContent, 10) - 1);
        if (qm.hasAttribute('data-qadd')) { const id = qm.dataset.qadd; const q = qtyEl ? parseInt(qtyEl.textContent, 10) : 1; addToCart(id, q, $('#qvArt')); closeModal('quickModal'); openDrawer(); }
        if (qm.hasAttribute('data-wa-product')) { const p = getProduct(qm.dataset.waProduct); const txt = `*¡Hola Importaciones Adriel!* 👋\nEstoy interesado(a) en:\n\n• *${esc(p.name)}* (${esc(p.brand)})\n• Precio: ${money(p.price)}\n• Presentación: ${esc(p.pres)}\n\n¿Me confirman disponibilidad y tiempo de entrega? ¡Gracias!`; window.open(TA.waLink(txt), '_blank', 'noopener'); }
      }
    });

    document.addEventListener('submit', ev => {
      if (ev.target.id === 'coForm') { submitOrder(ev); return; }
      if (ev.target.id === 'encargoForm') { ev.preventDefault(); submitEncargo(ev); return; }
    });

    $('#cartBtn').addEventListener('click', openDrawer);
    $('#goCheckout').addEventListener('click', () => { closeDrawer(); openCheckout(); });
    OVERLAY.addEventListener('click', () => { closeDrawer(); ['quickModal', 'checkoutModal'].forEach(closeModal); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); ['quickModal', 'checkoutModal'].forEach(closeModal); } });

    const doSearch = debounce(val => { filters.q = val; $$('#searchDesktop,#searchMobile').forEach(i => { if (i.value !== val) i.value = val; }); renderCatalog(); }, 180);
    ['#searchDesktop', '#searchMobile'].forEach(sel => { const el = $(sel); if (!el) return; el.addEventListener('input', () => doSearch(el.value)); el.addEventListener('search', () => doSearch(el.value)); });

    $('#sortSelect').addEventListener('change', e => { filters.sort = e.target.value; renderCatalog(); });

    const minR = $('#priceMin'), maxR = $('#priceMax');
    const syncPrice = () => {
      let a = parseInt(minR.value, 10), b = parseInt(maxR.value, 10);
      if (a > b) { const t = a; a = b; b = t; minR.value = a; maxR.value = b; }
      filters.min = a; filters.max = b;
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
    filters = { q: '', cat: 'all', min: 0, max: 400, sort: 'relevance' };
    const sd = $('#searchDesktop'), sm = $('#searchMobile'); if (sd) sd.value = ''; if (sm) sm.value = '';
    $('#priceMin').value = 0; $('#priceMax').value = 400; $('#sortSelect').value = 'relevance';
    $('#priceLabel').textContent = '$0.00 — $400.00';
    syncCatUI(); renderCatalog();
  }

  function setCategory(cat) { filters.cat = cat; syncCatUI(); renderCatalog(); }

  function syncCatUI() {
    $$('[data-cat]').forEach(b => { const on = b.dataset.cat === filters.cat; b.classList.toggle('is-active', on); });
  }

  function syncSettingsUI() {
    $$('[data-freeship]').forEach(el => el.textContent = money(S().settings.freeShipping));
    const waBase = `*¡Hola ${S().settings.store}!* 👋 Quiero información sobre sus productos.`;
    $('#waFloat').href = TA.waLink(waBase); $('#footerWhats').href = TA.waLink(waBase);
  }

  /* ══════════ 10. INIT ══════════ */
  async function init() {
    await TA.init();
    S().cart = S().cart.filter(i => getProduct(i.id));
    $('#year').textContent = new Date().getFullYear();
    if (S().catalogError && !S().products.length) {
      console.warn(S().catalogError);
      toast('No se pudo cargar el catálogo (data/productos.json)', 'err');
    }
    syncSettingsUI();
    renderHeroArt();
    renderCatalog();
    renderCart();
    updateBadge(false);
    // startCountdown(); // Oferta relámpago desactivada; conservar para uso futuro.
    socialProof();
    bind();
    syncCatUI();
    setInterval(() => { TA.saveCart(); }, 20000);
    console.log('%c IMPORTACIONES ADRIEL · tienda lista ', 'background:#A6856A;color:#FDFCFB;font-weight:bold;padding:4px 8px;border-radius:6px');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
