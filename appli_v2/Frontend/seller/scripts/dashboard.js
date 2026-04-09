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

    // Load all dashboard sections in parallel
    await Promise.all([
      this.loadKPIs(sellerId),
      this.loadRecentProducts(sellerId)
    ]);

    this.renderActivity(sellerId);
    this.renderReviews(sellerId);
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
        icon: 'fas fa-boxes', iconClass: 'gold',
        value: stats.total_products || 0,
        label: 'Total Articles',
        trend: '', trendClass: 'neutral',
        barPct: activePercent, barColor: 'gold',
        sparkData
      })}
      ${this._kpiCard({
        icon: 'fas fa-shopping-cart', iconClass: 'green',
        value: stats.total_orders || 0,
        label: 'Commandes',
        trend: stats.pending_orders > 0 ? `${stats.pending_orders} en attente` : 'Tout est expédié', 
        trendClass: stats.pending_orders > 0 ? 'down' : 'up',
        barPct: 100, barColor: 'green'
      })}
      ${this._kpiCard({
        icon: 'fas fa-euro-sign', iconClass: 'green',
        value: (stats.month_revenue || 0) + ' €',
        label: 'Revenus ce mois',
        trend: 'Ventes réelles', trendClass: 'neutral',
        barPct: 100, barColor: 'green'
      })}
      ${this._kpiCard({
        icon: 'fas fa-star', iconClass: 'gold',
        value: parseFloat(stats.avg_rating || 0).toFixed(1) + ' ★',
        label: 'Note Clients',
        trend: stats.avg_rating > 0 ? 'Avis réels calculés' : 'Aucun avis', trendClass: 'neutral',
        barPct: Math.round(((stats.avg_rating||0) / 5) * 100), barColor: 'gold'
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
      <div class="kpi-card animate-fade">
        <div class="kpi-top">
          <div class="kpi-icon ${iconClass}"><i class="${icon}"></i></div>
          <span class="kpi-trend ${trendClass}">
            <i class="fas fa-arrow-${trendClass === 'up' ? 'up' : trendClass === 'down' ? 'down' : 'right'}"></i>
            ${trend}
          </span>
        </div>
        <div class="kpi-value">${value}</div>
        <div class="kpi-label">${label}</div>
        <div class="kpi-bar-row">${bars}</div>
      </div>`;
  },

  /* ── Recent Activity ── */
  async renderActivity(vendeurId) {
    const list = document.getElementById('activity-list');
    if (!list) return;

    try {
       const orders = await ProductService.getOrders(vendeurId);
       if (!orders || orders.length === 0) {
          list.innerHTML = `<p style="color:var(--studio-muted); font-size:0.85rem; text-align:center; padding:10px 0;">Aucune activité récente.</p>`;
          return;
       }

       // Afficher seulement les 4 dernières commandes en tant qu'activité
       list.innerHTML = orders.slice(0, 4).map(o => `
          <div class="activity-item">
            <i class="fas fa-shopping-cart ai-icon" style="color:#22C55E"></i>
            <div class="ai-body">
              <b>Achat réel</b> : 1x ${o.titre || 'Produit'} par ${o.acheteur_prenom || 'Un client'}.
              <span class="ai-time">${o.date_commande || 'Récemment'}</span>
            </div>
          </div>
       `).join('');

    } catch (e) {
       list.innerHTML = `<p style="color:var(--studio-muted); font-size:0.85rem;">Impossible de charger l'activité.</p>`;
    }
  },

  /* ── Reviews Summary ── */
  async renderReviews(vendeurId) {
    const list = document.getElementById('reviews-mini');
    if (!list) return;

    try {
      const reviews = await ProductService.getReviews(vendeurId);
      if (!reviews || reviews.length === 0) {
        list.innerHTML = `<p style="color:var(--studio-muted); font-size:0.85rem; text-align:center; padding:10px 0;">Aucun avis reçu pour le moment.</p>`;
        return;
      }

      list.innerHTML = reviews.slice(0, 2).map(r => `
        <div class="mini-review">
          <div class="review-stars">${'★'.repeat(r.note || 5)}${'☆'.repeat(5 - (r.note || 5))}</div>
          <p>« ${r.commentaire || ''} »</p>
          <span class="review-author">— ${r.prenom || 'Client'}</span>
        </div>
      `).join('') + `
        <a href="reviews.html" style="display:block;text-align:center;margin-top:12px;font-size:0.8rem;color:var(--studio-honey);opacity:0.8;">
          Voir tous les avis →
        </a>`;
    } catch(e) {
       list.innerHTML = `<p style="color:var(--studio-muted); font-size:0.85rem;">Impossible de charger les avis.</p>`;
    }
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
        const isAvailable = p.est_disponible == 1 && p.quantite > 0;
        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--studio-border);border-radius:10px;margin-bottom:8px;transition:background 0.2s;"
               onmouseenter="this.style.background='rgba(229,166,87,0.04)'" onmouseleave="this.style.background='rgba(255,255,255,0.02)'">
            <div style="width:44px;height:44px;border-radius:8px;overflow:hidden;flex-shrink:0;background:rgba(229,166,87,0.08)">
              ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover" alt="${p.titre}">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--studio-honey);font-size:1.2rem;">♪</div>`}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:0.87rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.titre || p.nom}</div>
              <div style="font-size:0.72rem;color:var(--studio-muted)">${p.artiste || ''} • ${parseFloat(p.prix || 0).toFixed(2)} €</div>
            </div>
            <span style="font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:50px;${isAvailable ? 'background:rgba(34,197,94,0.12);color:#4ade80' : 'background:rgba(239,68,68,0.12);color:#f87171'}">
              ${isAvailable ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>`;
      }).join('');
    } catch (_) {
      el.innerHTML = `<p style="color:var(--studio-muted);font-size:0.85rem;">Impossible de charger les produits.</p>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => DashboardController.init());
