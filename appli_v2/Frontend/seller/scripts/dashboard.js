/* ══ Dashboard Controller ══ */
const DashboardController = {
  user: null,

  async init() {
    this.user = await SellerLayout.init({
      title: 'Tableau de bord',
      pageId: 'dashboard'
    });
    if (!this.user) return;

    // Header CTA
    SellerHeader.addAction(`
      <a href="create-product.html" class="btn-gold-studio">
        <i class="fas fa-plus"></i> Nouvel Article
      </a>
    `);

    const sellerId = this.user.id_vendeur || this.user.vendeur?.id || this.user.id;

    // Load only KPIs and Recent Products
    await Promise.all([
      this.loadKPIs(sellerId),
      this.loadRecentProducts(sellerId)
    ]);
  },

  /* ── KPI Cards ── */
  async loadKPIs(vendeurId) {
    const row = document.getElementById('kpi-row');
    if (!row) return;

    let stats = { total: 0, active: 0, low_stock: 0, out_stock: 0, rating: 0, revenue: 0, orders: 0 };

    try {
      const data = await ProductService.getSellerStats(vendeurId);
      if (data) stats = { ...stats, ...data };
    } catch (_) {}

    // Fallback for active/low stock if not provided explicitly by backend
    if (stats.active === 0 && stats.total_products > 0 && typeof stats.active === 'undefined') {
       stats.active = stats.total_products; // simplistic fallback
       stats.low_stock = 0;
    }

    const activePercent  = stats.total_products > 0 ? Math.round(((stats.active||0) / stats.total_products) * 100) : 0;
    const sparkData      = []; // no fake data

    row.innerHTML = `
      ${this._kpiCard({
        icon: 'fas fa-check-circle', iconClass: 'green',
        value: stats.validated_ads || 0,
        label: 'Annonces Validées',
        trend: 'Visibles en ligne', trendClass: 'up',
        barPct: stats.total_products > 0 ? Math.round(((stats.validated_ads||0) / stats.total_products) * 100) : 0, barColor: 'green'
      })}
      ${this._kpiCard({
        icon: 'fas fa-hourglass-half', iconClass: 'amber',
        value: stats.pending_validation || 0,
        label: 'En attente',
        trend: 'Modération en cours', trendClass: 'neutral',
        barPct: stats.total_products > 0 ? Math.round(((stats.pending_validation||0) / stats.total_products) * 100) : 0, barColor: 'amber'
      })}
      ${this._kpiCard({
        icon: 'fas fa-times-circle', iconClass: 'red',
        value: stats.refused_ads || 0,
        label: 'Annonces Refusées',
        trend: 'À corriger', trendClass: 'down',
        barPct: stats.total_products > 0 ? Math.round(((stats.refused_ads||0) / stats.total_products) * 100) : 0, barColor: 'red'
      })}
      ${this._kpiCard({
        icon: 'fas fa-shopping-cart', iconClass: 'gold',
        value: stats.total_orders || 0,
        label: 'Commandes',
        trend: stats.pending_orders > 0 ? `${stats.pending_orders} à préparer` : 'Tout est prêt', 
        trendClass: stats.pending_orders > 0 ? 'down' : 'up',
        barPct: 100, barColor: 'gold'
      })}
    `;

    // Animate bars after render
    requestAnimationFrame(() => {
      row.querySelectorAll('.kpi-bar-fill').forEach(b => {
        b.style.width = b.dataset.width + '%';
      });
    });
  },

  _kpiCard({ icon, iconClass, value, label, trend, trendClass, barPct, barColor, sparkData }) {
    const bars = sparkData
      ? `<div class="sparkline">${sparkData.map((v, i) =>
          `<div class="spark-bar ${i === sparkData.length - 1 ? 'peak' : ''}"
                style="height:${Math.round((v / 100) * 32)}px"></div>`
        ).join('')}</div>`
      : `<div class="kpi-bar"><div class="kpi-bar-fill ${barColor}" data-width="${barPct}" style="width:0%"></div></div>`;

    return `
      <div class="kpi-card animate-fade glass-card" style="background: var(--studio-panel); border: 1px solid var(--studio-border);">
        <div class="kpi-top">
          <div class="kpi-icon ${iconClass}" style="border: 1px solid var(--studio-border);"><i class="${icon}"></i></div>
          <span class="kpi-trend ${trendClass}" style="backdrop-filter: blur(5px); border: 1px solid var(--studio-border);">
            <i class="fas fa-arrow-${trendClass === 'up' ? 'up' : trendClass === 'down' ? 'down' : 'right'}"></i>
            ${trend}
          </span>
        </div>
        <div class="kpi-value" style="font-family:'Cormorant Garamond',serif; color:var(--studio-white);">${value}</div>
        <div class="kpi-label" style="color:var(--studio-muted); font-weight:600; letter-spacing:1px;">${label}</div>
        <div class="kpi-bar-row">${bars}</div>
      </div>`;
  },


  /* ── Recent Products ── */
  async loadRecentProducts(vendeurId) {
    const el = document.getElementById('recent-products-list');
    if (!el) return;
    try {
      const products = await ProductService.getProducts(vendeurId);
      const recent = products.slice(0, 4);
      if (recent.length === 0) {
        el.innerHTML = `<p style="color:var(--studio-muted);font-size:0.85rem;text-align:center;padding:20px 0;">
          Aucun produit pour l'instant. <a href="create-product.html" style="color:var(--studio-honey)">Ajouter le premier →</a></p>`;
        return;
      }
      el.innerHTML = recent.map(p => {
        const img = ProductService.resolveImage(p);
        const isValidated = p.real_statut === 'VALIDEE';
        const isPending = p.real_statut === 'EN_ATTENTE';
        const isAvailable = isValidated && p.est_disponible == 1 && p.quantite > 0;
        
        let statusText = isAvailable ? 'En ligne' : (isPending ? 'En attente' : (isValidated ? 'Stock épuisé' : (p.real_statut === 'REFUSEE' ? 'Refusé' : 'Hors ligne')));
        let statusColor = isAvailable ? 'var(--studio-success)' : (isPending ? 'var(--studio-warning)' : 'var(--studio-error)');
        let statusBg = isAvailable ? 'hsla(140, 70%, 50%, 0.12)' : (isPending ? 'hsla(38, 70%, 55%, 0.12)' : 'hsla(0, 80%, 50%, 0.12)');

        return `
          <div class="glass-card" style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:hsla(35, 40%, 15%, 0.3); border:1px solid var(--studio-border); border-radius:12px; margin-bottom:8px; transition:all 0.3s ease;"
               onmouseenter="this.style.borderColor='var(--studio-honey)'; this.style.transform='translateX(4px)';" onmouseleave="this.style.borderColor='var(--studio-border)'; this.style.transform='translateX(0)';">
            <div style="width:48px; height:48px; border-radius:10px; overflow:hidden; flex-shrink:0; background:var(--accent-glow); border:1px solid var(--studio-border);">
              ${img ? `<img src="${img}" style="width:100%; height:100%; object-fit:cover" alt="${p.titre}">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--studio-honey); font-size:1.2rem;">♪</div>`}
            </div>
            <div style="flex:1; min-width:0">
              <div style="font-size:0.9rem; font-weight:700; color:var(--studio-white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'Outfit',sans-serif;">${p.titre || p.nom}</div>
              <div style="font-size:0.75rem; color:var(--studio-muted); font-family:'Outfit',sans-serif;">${p.artiste || 'Artiste'} • <span style="color:var(--studio-honey); font-weight:600;">${parseFloat(p.prix || 0).toFixed(2)} €</span></div>
            </div>
            <span style="font-size:0.65rem; font-weight:700; padding:4px 10px; border-radius:50px; background:${statusBg}; color:${statusColor}; border:1px solid ${statusBg}; text-transform:uppercase; letter-spacing:0.5px;">
              ${statusText}
            </span>
          </div>`;
      }).join('');
    } catch (_) {
      el.innerHTML = `<p style="color:var(--studio-muted);font-size:0.85rem;">Impossible de charger les produits.</p>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => DashboardController.init());
