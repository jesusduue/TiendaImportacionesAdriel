/* ═══════════════════════════════════════════════════════════
   IMPORTACIONES ADRIEL · js/admin.js
   Panel administrativo (admin.html — enlace privado del dueño).

   Funciones:
   - Acceso con PIN (sesión por pestaña)
   - Métricas de ventas, pedidos, encargos y stock crítico
   - CRUD de productos (crear, editar, duplicar, activar, borrar,
     edición rápida de precio/stock)
   - Gestión de pedidos y encargos (estado, WhatsApp, exportar)
   - Ajustes de la tienda (WhatsApp, PIN…)
   - Catálogo como BD JSON: exportar / importar / restaurar desde
     data/productos.json

   Depende de js/art-engine.js y js/common.js.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const { CATS, ORDER_STATUS, ENCARGO_STATUS, BULLETS, esc, money, slug, fmtDate, $, $$, toast } = TA;
  const S = () => TA.state;
  const artFor = p => ArtEngine.artFor(p);
  const getProduct = TA.getProduct;

  let uiTab = 'dash';     // pestaña activa
  let editing = null;     // id de producto en edición

  /* ══════════ 1. LOGIN / SESIÓN ══════════ */
  function showLogin() {
    $('#admLogin').classList.remove('hidden');
    $('#admPanel').classList.add('hidden');
    $('#pinInput').value = ''; $('#pinError').classList.add('hidden');
    setTimeout(() => $('#pinInput').focus(), 120);
  }

  function showPanel() {
    $('#admLogin').classList.add('hidden');
    $('#admPanel').classList.remove('hidden');
    $('#admStoreName').textContent = S().settings.store;
    renderAdmin();
  }

  function tryPin() {
    if (TA.tryPin($('#pinInput').value)) {
      showPanel();
      toast('Bienvenido al panel administrativo', 'ok');
    } else {
      const card = $('#admLogin .adm-login-card');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      $('#pinError').classList.remove('hidden');
    }
  }

  /* ══════════ 2. MÉTRICAS ══════════ */
  function metrics() {
    const st = S();
    const sales = st.orders.reduce((s, o) => s + o.total, 0);
    const unitsByProduct = {};
    st.orders.forEach(o => o.items.forEach(i => { unitsByProduct[i.name] = (unitsByProduct[i.name] || 0) + i.qty; }));
    const top = Object.entries(unitsByProduct).sort((a, b) => b[1] - a[1])[0];
    const byCat = { suplementos: 0, perfumes: 0, gorras: 0 };
    st.orders.forEach(o => o.items.forEach(i => { byCat[i.cat] = (byCat[i.cat] || 0) + i.price * i.qty; }));
    return {
      sales, orders: st.orders.length,
      top: top ? { name: top[0], qty: top[1] } : { name: '—', qty: 0 },
      avg: st.orders.length ? sales / st.orders.length : 0,
      byCat, unitsByProduct, encargos: st.encargos.length
    };
  }

  /* ══════════ 3. RENDER PRINCIPAL ══════════ */
  function renderAdmin() {
    const m = metrics();
    const tabs = [['dash', '📊 Métricas'], ['prods', '📦 Productos'], ['orders', '🧾 Pedidos'], ['encargos', '📬 Encargos'], ['set', '⚙️ Ajustes']];
    $('#adminBody').innerHTML = `
      <div class="adm-head">
        <div><h3>Panel Administrativo · ${esc(S().settings.store)}</h3><p>Control total del catálogo, pedidos, encargos y métricas.</p></div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <span class="badge badge-limited">${S().products.length} productos</span>
          <span class="badge badge-off">${S().orders.length} pedidos</span>
          <span class="badge badge-new">${S().encargos.length} encargos</span>
        </div>
      </div>
      <div class="adm-tabs">${tabs.map(t => `<button class="adm-tab ${uiTab === t[0] ? 'is-active' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
      <div class="adm-body">${uiTab === 'dash' ? tabDash(m) : uiTab === 'prods' ? tabProducts() : uiTab === 'orders' ? tabOrders() : uiTab === 'encargos' ? tabEncargos() : tabSettings()}</div>`;
  }

  function tabDash(m) {
    const catTotal = Math.max(1, m.byCat.suplementos + m.byCat.perfumes + m.byCat.gorras);
    const lowStock = S().products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 6);
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

  /* ══════════ 4. PRODUCTOS ══════════ */
  function tabProducts() {
    const e = editing ? getProduct(editing) : null;
    const v = e || { name: '', brand: '', cat: 'suplementos', pres: '', price: '', oldPrice: '', stock: 10, benefit: '', desc: '', visual: 'bottle', tone: 'olive', image: '', featured: false };
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
              <div class="field"><label>Ilustración</label><select class="select" name="visual">${ArtEngine.VISUALS.map(o => `<option value="${o[0]}" ${v.visual === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
            </div>
            <div class="form-2">
              <div class="field"><label>Tono color</label><select class="select" name="tone">${Object.keys(ArtEngine.TONES).map(k => `<option value="${k}" ${v.tone === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
              <div class="field"><label>Imagen URL o ruta (opcional)</label><input class="input" name="image" value="${esc(v.image || '')}" placeholder="ej: imgProductos/producto.jpg o https://..."></div>
            </div>
            <div class="field"><label>Beneficio (copy) *</label><textarea class="textarea" name="benefit" placeholder="Recupera tu vitalidad…">${esc(v.benefit)}</textarea></div>
            <div class="field"><label>Descripción</label><textarea class="textarea" name="desc">${esc(v.desc || '')}</textarea></div>
            <label style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;color:var(--clay-2);font-weight:600">
              <input type="checkbox" name="featured" ${v.featured ? 'checked' : ''} style="width:16px;height:16px">⭐ Producto destacado (aparece primero)
            </label>
            <div style="display:flex;gap:.55rem;flex-wrap:wrap">
              <button type="submit" class="btn btn-primary">${e ? 'Guardar cambios' : 'Crear producto'}</button>
              ${e ? '<button type="button" class="btn btn-ghost" id="cancelEdit">Cancelar</button>' : ''}
            </div>
          </form>
        </div>
        <div class="panel">
          <h4>📦 Inventario (${S().products.length})</h4>
          <input class="input" id="admSearch" placeholder="Filtrar por nombre o marca…" style="margin-bottom:.8rem">
          <div class="table-wrap scroll-slim" style="max-height:60vh;overflow-y:auto">
            <table class="adm-table" id="prodTable">
              <thead><tr><th>Producto</th><th>Cat.</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead>
              <tbody>${S().products.map(rowProduct).join('')}</tbody>
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
        <button class="icon-mini" data-dup="${p.id}" title="Duplicar">⧉</button>
        <button class="icon-mini del" data-remove="${p.id}" title="Eliminar">🗑️</button>
      </div></td>
    </tr>`;
  }

  function saveProduct(form) {
    const fd = new FormData(form); const get = k => String(fd.get(k) || '').trim();
    const name = get('name'), brand = get('brand'), benefit = get('benefit');
    const price = parseFloat(get('price')); const stock = parseInt(get('stock'), 10);
    if (!name || !brand || !(price >= 0) || isNaN(stock) || !benefit) { toast('Completa nombre, marca, precio, stock y beneficio', 'err'); form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
    const data = {
      name, brand, cat: get('cat'), pres: get('pres') || '—',
      price: Math.round(price * 100) / 100, oldPrice: Math.round((parseFloat(get('oldPrice')) || 0) * 100) / 100,
      stock: Math.max(0, stock), benefit,
      desc: get('desc') || (benefit + ' Producto importado y sellado de fábrica.'),
      visual: get('visual'), tone: get('tone'), image: get('image'),
      featured: fd.get('featured') === 'on'
    };
    if (editing) {
      const p = getProduct(editing); Object.assign(p, data); toast('Producto actualizado ✓', 'ok');
    } else {
      const id = 'p' + TA.nextSeq() + '-' + slug(name).slice(0, 24);
      const pool = BULLETS[data.cat] || BULLETS.suplementos;
      S().products.unshift(Object.assign({ id, rating: 4.8, reviews: 12, sold: 0, bullets: pool.slice(0, 3), active: true, createdAt: Date.now() }, data));
      toast('Producto creado ✓', 'ok');
    }
    editing = null; TA.saveProducts(); renderAdmin();
  }

  function duplicateProduct(id) {
    const p = getProduct(id); if (!p) return;
    const copy = Object.assign({}, p, {
      id: 'p' + TA.nextSeq() + '-' + slug(p.name).slice(0, 24),
      name: p.name + ' (copia)',
      sold: 0, reviews: 12, createdAt: Date.now(), active: false
    });
    S().products.unshift(copy); TA.saveProducts(); renderAdmin();
    toast('Producto duplicado (queda desactivado hasta que lo edites) ✓', 'ok');
  }

  /* ══════════ 5. PEDIDOS ══════════ */
  function tabOrders() {
    const st = S();
    if (!st.orders.length) return `<div class="panel"><h4>🧾 Pedidos</h4><p style="color:var(--clay);font-size:.86rem;margin:0">Todavía no hay pedidos registrados en este dispositivo.</p><p style="font-size:.76rem;color:var(--stone);margin:.6rem 0 0">Nota: los pedidos de clientes se confirman por WhatsApp; aquí se registran los generados en este navegador.</p></div>`;
    return `<div class="panel"><h4>🧾 Historial de pedidos (${st.orders.length})
      <span style="margin-left:auto;display:flex;gap:.4rem">
        <button class="btn btn-ghost btn-sm" id="exportOrdersCsv">⬇ CSV</button>
        <button class="btn btn-ghost btn-sm" id="exportOrders">⬇ JSON</button>
      </span></h4>
      <div class="table-wrap scroll-slim" style="max-height:64vh;overflow-y:auto">
        <table class="adm-table"><thead><tr><th>Código / Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead>
        <tbody>${st.orders.map(o => `
          <tr>
            <td><strong>${o.code}</strong><br><span class="t-brand">${fmtDate(o.ts)}</span></td>
            <td><span class="t-name">${esc(o.client.name)}</span><br><span class="t-brand">📞 ${esc(o.client.phone)}</span><br><span class="t-brand">📍 ${esc(o.client.address)}</span></td>
            <td style="max-width:240px"><span class="t-brand" style="line-height:1.5">${o.items.map(i => `${i.qty}x ${esc(i.name)}`).join('<br>')}</span></td>
            <td><strong style="color:var(--sand-2)">${money(o.total)}</strong><br><span class="t-brand">${o.shipping === 0 ? '· envío gratis' : '· envío ' + money(o.shipping)}</span></td>
            <td><select class="status-sel" data-order="${o.code}">${ORDER_STATUS.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
            <td><div style="display:flex;gap:.35rem">
              <a class="icon-mini" href="${TA.waLink(TA.buildMessage(o))}" target="_blank" rel="noopener" title="WhatsApp">💬</a>
              <button class="icon-mini del" data-delorder="${o.code}" title="Eliminar">🗑️</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>
      </div></div>`;
  }

  function ordersCSV() {
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = [['Código', 'Fecha', 'Cliente', 'Teléfono', 'Dirección', 'Productos', 'Subtotal', 'Envío', 'Total', 'Estado']];
    S().orders.forEach(o => {
      rows.push([
        o.code, new Date(o.ts).toLocaleString('es-ES'), o.client.name, o.client.phone, o.client.address,
        o.items.map(i => `${i.qty}x ${i.name}`).join(' | '),
        o.subtotal.toFixed(2), o.shipping.toFixed(2), o.total.toFixed(2), o.status
      ]);
    });
    return rows.map(r => r.map(q).join(',')).join('\n');
  }

  /* ══════════ 6. ENCARGOS ══════════ */
  function tabEncargos() {
    const st = S();
    if (!st.encargos.length) return `<div class="panel"><h4>📬 Encargos</h4><p style="color:var(--clay);font-size:.86rem;margin:0">Aún no hay solicitudes de encargo registradas. Las solicitudes enviadas por el formulario aparecerán aquí.</p></div>`;
    return `<div class="panel"><h4>📬 Solicitudes de encargo (${st.encargos.length})</h4>
      <div class="table-wrap scroll-slim" style="max-height:64vh;overflow-y:auto">
        <table class="adm-table"><thead><tr><th>ID / Fecha</th><th>Cliente</th><th>Plataforma</th><th>Link</th><th>Detalles</th><th>Estado</th><th></th></tr></thead>
        <tbody>${st.encargos.map(enc => `
          <tr>
            <td><strong>${enc.id}</strong><br><span class="t-brand">${fmtDate(enc.ts)}</span></td>
            <td><span class="t-name">${esc(enc.nombre)}</span><br><span class="t-brand">📞 ${esc(enc.telefono)}</span></td>
            <td><span class="badge badge-new">${esc(enc.plataforma)}</span></td>
            <td style="max-width:200px"><a href="${esc(enc.link)}" target="_blank" rel="noopener" style="color:var(--sand-2);text-decoration:underline;font-size:.74rem;word-break:break-all">${esc(enc.link.length > 40 ? enc.link.slice(0, 40) + '…' : enc.link)}</a></td>
            <td><span class="t-brand">Cant: ${enc.cantidad}</span>${enc.notas ? `<br><span class="t-brand">${esc(enc.notas)}</span>` : ''}</td>
            <td><select class="status-sel" data-encargo="${enc.id}">${ENCARGO_STATUS.map(s => `<option ${enc.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
            <td><div style="display:flex;gap:.35rem">
              <a class="icon-mini" href="${TA.waLink(TA.buildEncargoMessage(enc))}" target="_blank" rel="noopener" title="WhatsApp">💬</a>
              <button class="icon-mini del" data-delencargo="${enc.id}" title="Eliminar">🗑️</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>
      </div></div>`;
  }

  /* ══════════ 7. AJUSTES + MANTENIMIENTO ══════════ */
  function catalogStatusHTML() {
    const st = S();
    const src = { json: '📄 data/productos.json', local: '💾 copia local', legacy: '🗄️ versión anterior' }[st.catalogSource] || '—';
    return `<div class="adm-cat-status">
      <span><strong>Origen del catálogo:</strong> ${src}</span>
      <span><strong>Versión:</strong> ${esc(st.catalogVersion || '—')}</span>
      ${st.catalogDirty
        ? '<span class="badge badge-hot">✏️ Cambios locales sin publicar</span>'
        : '<span class="badge badge-new">✓ Publicado</span>'}
    </div>`;
  }

  function tabSettings() {
    const s = S().settings;
    return `<div class="adm-grid" style="grid-template-columns:1fr">
      <div class="panel"><h4>⚙️ Configuración de la tienda</h4>
        ${catalogStatusHTML()}
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
      <div class="panel"><h4>🗂️ Catálogo (BD JSON)</h4>
        ${catalogStatusHTML()}
        <div class="switch-row"><span>Exportar catálogo a <strong>productos.json</strong> (para publicar en la web)</span><button class="btn btn-ghost btn-sm" id="exportCatalog">⬇ Exportar</button></div>
        <div class="switch-row"><span>Importar catálogo desde un archivo JSON (reemplaza el actual)</span><button class="btn btn-ghost btn-sm" id="importCatalog">⬆ Importar</button></div>
        <div class="switch-row" style="border:0"><span>Descartar cambios locales y restaurar desde <strong>data/productos.json</strong></span><button class="btn btn-ghost btn-sm" id="resetCatalog">Restaurar</button></div>
        <p style="font-size:.74rem;color:var(--stone);margin:.8rem 0 0">Flujo de publicación: edita aquí → <em>Exportar</em> → reemplaza <code>data/productos.json</code> en tu hosting → todos los visitantes reciben la nueva versión automáticamente.</p>
      </div>
      <div class="panel"><h4>🧰 Mantenimiento</h4>
        <div class="switch-row"><span>Generar pedidos de demostración</span><button class="btn btn-ghost btn-sm" id="seedOrders2">Generar</button></div>
        <div class="switch-row"><span>Exportar pedidos en JSON</span><button class="btn btn-ghost btn-sm" id="exportOrders">Exportar</button></div>
        <div class="switch-row" style="border:0"><span>Eliminar todos los pedidos</span><button class="btn btn-danger btn-sm" id="clearOrders">Eliminar</button></div>
      </div>
    </div>`;
  }

  /* ══════════ 8. ACCIONES DE CATÁLOGO ══════════ */
  function exportCatalog() {
    TA.downloadFile('productos.json', TA.exportCatalogJSON(), 'application/json');
    toast('Catálogo exportado ✓ — reemplaza data/productos.json para publicar', 'ok');
  }

  function importCatalog(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = TA.importCatalogJSON(String(reader.result));
      if (!res.ok) { toast(res.error, 'err'); return; }
      if (!confirm('Se reemplazarán los ' + S().products.length + ' productos actuales por ' + res.products.length + ' del archivo. ¿Continuar?')) return;
      S().products = res.products;
      TA.saveProducts(); renderAdmin();
      toast('✓ Catálogo importado: ' + res.products.length + ' productos', 'ok');
    };
    reader.onerror = () => toast('No se pudo leer el archivo', 'err');
    reader.readAsText(file);
  }

  async function resetCatalog() {
    if (!confirm('Se descartarán los cambios locales y se restaurará el catálogo desde data/productos.json. ¿Continuar?')) return;
    try {
      const res = await fetch(TA.CATALOG_URL + '?t=' + Date.now(), { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!json || !Array.isArray(json.products)) throw new Error('Formato inválido');
      TA.adoptCatalog(json.products, String((json.meta && json.meta.updatedAt) || ''), 'json');
      editing = null; renderAdmin();
      toast('Catálogo restaurado desde el archivo ✓', 'ok');
    } catch (e) {
      toast('No se pudo leer data/productos.json (' + e.message + ')', 'err');
    }
  }

  function demoOrders() {
    const prods = S().products;
    if (!prods.length) return [];
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

  /* ══════════ 9. EVENTOS ══════════ */
  function bind() {
    $('#pinSubmit').addEventListener('click', tryPin);
    $('#pinInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryPin(); });
    $('#admLogout').addEventListener('click', () => { TA.logoutAdmin(); showLogin(); toast('Sesión cerrada', 'info'); });
    $('#importFile').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (f) importCatalog(f);
      e.target.value = '';
    });

    document.addEventListener('click', ev => {
      const tab = ev.target.closest('[data-tab]'); if (tab) { uiTab = tab.dataset.tab; renderAdmin(); return; }
      const ed = ev.target.closest('[data-edit]'); if (ed) { editing = ed.dataset.edit; uiTab = 'prods'; renderAdmin(); $('#prodForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const ce = ev.target.closest('#cancelEdit'); if (ce) { editing = null; renderAdmin(); return; }
      const dp = ev.target.closest('[data-dup]'); if (dp) { duplicateProduct(dp.dataset.dup); return; }
      const rm = ev.target.closest('[data-remove]');
      if (rm) { const p = getProduct(rm.dataset.remove); if (p && confirm('¿Eliminar "' + p.name + '" del catálogo?')) { TA.state.products = TA.state.products.filter(x => x.id !== p.id); TA.saveProducts(); renderAdmin(); toast('Producto eliminado', 'info'); } return; }
      const tg = ev.target.closest('[data-toggle]'); if (tg) { const p = getProduct(tg.dataset.toggle); p.active = p.active === false; TA.saveProducts(); renderAdmin(); return; }
      const dso = ev.target.closest('#seedOrders2'); if (dso) { TA.state.orders = demoOrders().concat(TA.state.orders); TA.saveOrders(); renderAdmin(); toast('Pedidos de demostración cargados', 'ok'); return; }
      const dord = ev.target.closest('[data-delorder]'); if (dord && confirm('¿Eliminar este pedido?')) { TA.state.orders = TA.state.orders.filter(o => o.code !== dord.dataset.delorder); TA.saveOrders(); renderAdmin(); toast('Pedido eliminado', 'info'); return; }
      const denc = ev.target.closest('[data-delencargo]'); if (denc && confirm('¿Eliminar esta solicitud de encargo?')) { TA.state.encargos = TA.state.encargos.filter(e => e.id !== denc.dataset.delencargo); TA.saveEncargos(); renderAdmin(); toast('Encargo eliminado', 'info'); return; }
      const exp = ev.target.closest('#exportOrders'); if (exp) { TA.downloadFile('importaciones-adriel-pedidos.json', JSON.stringify(S().orders, null, 2)); toast('Pedidos exportados ✓', 'ok'); return; }
      const expCsv = ev.target.closest('#exportOrdersCsv'); if (expCsv) { TA.downloadFile('importaciones-adriel-pedidos.csv', ordersCSV(), 'text/csv'); toast('Pedidos exportados en CSV ✓', 'ok'); return; }
      const clr = ev.target.closest('#clearOrders'); if (clr && confirm('¿Eliminar TODOS los pedidos?')) { TA.state.orders = []; TA.saveOrders(); renderAdmin(); toast('Historial borrado', 'info'); return; }
      const rst = ev.target.closest('#resetCatalog'); if (rst) { resetCatalog(); return; }
      const exc = ev.target.closest('#exportCatalog'); if (exc) { exportCatalog(); return; }
      const imp = ev.target.closest('#importCatalog'); if (imp) { $('#importFile').click(); return; }
    });

    document.addEventListener('change', ev => {
      const st = ev.target.closest('[data-order]'); if (st) { const o = S().orders.find(x => x.code === st.dataset.order); if (o) { o.status = st.value; TA.saveOrders(); toast('Pedido ' + o.code + ' → ' + o.status, 'ok'); renderAdmin(); } return; }
      const se = ev.target.closest('[data-encargo]'); if (se) { const enc = S().encargos.find(x => x.id === se.dataset.encargo); if (enc) { enc.status = se.value; TA.saveEncargos(); toast('Encargo actualizado: ' + enc.status, 'ok'); } return; }
      const inline = ev.target.closest('[data-field]');
      if (inline) {
        const p = getProduct(inline.dataset.id); if (!p) return;
        const val = parseFloat(inline.value);
        if (isNaN(val) || val < 0) { inline.value = p[inline.dataset.field]; return; }
        p[inline.dataset.field] = inline.dataset.field === 'stock' ? Math.round(val) : Math.round(val * 100) / 100;
        TA.saveProducts(); renderAdmin();
        toast(p.name.slice(0, 28) + '… actualizado', 'ok');
      }
    });

    document.addEventListener('submit', ev => {
      if (ev.target.id === 'prodForm') { ev.preventDefault(); saveProduct(ev.target); return; }
      if (ev.target.id === 'setForm') {
        ev.preventDefault(); const fd = new FormData(ev.target); const s = S().settings;
        s.store = String(fd.get('store') || 'Importaciones Adriel').trim();
        s.whatsapp = String(fd.get('whatsapp') || '').replace(/[^\d]/g, '');
        s.comboCat = String(fd.get('comboCat') || 'suplementos');
        s.pin = String(fd.get('pin') || '1234').trim();
        TA.saveSettings();
        $('#admStoreName').textContent = s.store;
        renderAdmin(); toast('Ajustes guardados ✓', 'ok');
      }
    });

    document.addEventListener('input', TA.debounce(e => {
      if (e.target.id === 'admSearch') { const q = e.target.value.toLowerCase(); $$('#prodTable tbody tr').forEach(tr => { tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : ' none'; }); }
    }, 120));
  }

  /* ══════════ 10. INIT ══════════ */
  async function init() {
    await TA.init();
    bind();
    if (TA.isAdmin()) showPanel(); else showLogin();
    console.log('%c IMPORTACIONES ADRIEL · panel admin listo ', 'background:#3A3540;color:#FDFCFB;font-weight:bold;padding:4px 8px;border-radius:6px');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
