/* ══ IA Predictions Controller ══ */
const IAPredictionsController = {
  user: null,
  data: null,
  predictionChart: null,
  categoryChart: null,

  async init() {
    this.user = await SellerLayout.init({
      title: 'IA Prédictions',
      pageId: 'ia-predictions'
    });
    if (!this.user) return;

    const sellerId = this.user.id_vendeur || this.user.vendeur?.id || this.user.id;

    // Load predictions
    await this.loadPredictions(sellerId);
  },

  /* ════════════════════════════════════════════════
   *  LOAD & RENDER ALL DATA
   * ════════════════════════════════════════════════ */
  async loadPredictions(vendeurId) {
    try {
      this.data = await PredictionService.getPredictions(vendeurId);
      if (!this.data) {
        this.showEmpty();
        return;
      }

      // Render everything
      this.renderKPIs();
      this.renderChart();
      this.renderRecommendations();
      this.renderTopProducts();
      this.renderCategoryChart();
      this.renderHotProducts();

    } catch (err) {
      console.error('[IA] Error loading predictions:', err);
      this.showEmpty();
    }
  },

  showEmpty() {
    const kpiRow = document.getElementById('ia-kpi-row');
    if (kpiRow) {
      kpiRow.innerHTML = `<div class="ia-empty-state">
        <i class="fas fa-chart-bar"></i>
        <p>Pas encore assez de données pour générer des prédictions.</p>
        <p style="font-size:0.8rem; opacity:0.6;">Commencez à vendre pour voir apparaître l'analyse IA.</p>
      </div>`;
    }
  },

  /* ════════════════════════════════════════════════
   *  KPI CARDS
   * ════════════════════════════════════════════════ */
  renderKPIs() {
    const d = this.data;
    const row = document.getElementById('ia-kpi-row');
    if (!row) return;

    const trendIcon = d.trend_percent >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    const trendClass = d.trend_percent >= 0 ? 'up' : 'down';
    const trendSign = d.trend_percent >= 0 ? '+' : '';

    row.innerHTML = `
      ${this._kpiCard({
        icon: 'fas fa-chart-line',
        gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
        borderColor: 'rgba(34,197,94,0.3)',
        iconColor: '#22C55E',
        value: `${trendSign}${d.trend_percent}%`,
        label: 'Tendance',
        sub: trendClass === 'up' ? 'Croissance' : 'Décroissance',
        subIcon: trendIcon,
        subClass: trendClass
      })}
      ${this._kpiCard({
        icon: 'fas fa-coins',
        gradient: 'linear-gradient(135deg, rgba(229,166,87,0.15), rgba(229,166,87,0.05))',
        borderColor: 'rgba(229,166,87,0.3)',
        iconColor: 'var(--studio-honey)',
        value: `${d.next_month_revenue} €`,
        label: 'Revenu Prédit',
        sub: 'Mois prochain',
        subIcon: 'fa-calendar-alt',
        subClass: 'neutral'
      })}
      ${this._kpiCard({
        icon: 'fas fa-bullseye',
        gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
        borderColor: 'rgba(59,130,246,0.3)',
        iconColor: '#3B82F6',
        value: `${d.confidence_score}%`,
        label: 'Score R²',
        sub: d.confidence_score >= 70 ? 'Fiable' : (d.confidence_score >= 40 ? 'Modéré' : 'Faible'),
        subIcon: d.confidence_score >= 70 ? 'fa-check-circle' : 'fa-info-circle',
        subClass: d.confidence_score >= 70 ? 'up' : (d.confidence_score >= 40 ? 'neutral' : 'down')
      })}
      ${this._kpiCard({
        icon: 'fas fa-box-open',
        gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
        borderColor: 'rgba(168,85,247,0.3)',
        iconColor: '#A855F7',
        value: d.top_products?.length || 0,
        label: 'Produits Analysés',
        sub: 'Dans le modèle',
        subIcon: 'fa-database',
        subClass: 'neutral'
      })}
    `;

    // Animate cards
    requestAnimationFrame(() => {
      row.querySelectorAll('.ia-kpi-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
      });
    });
  },

  _kpiCard({ icon, gradient, borderColor, iconColor, value, label, sub, subIcon, subClass }) {
    return `
      <div class="ia-kpi-card animate-fade" style="background:${gradient}; border:1px solid ${borderColor};">
        <div class="ia-kpi-icon" style="color:${iconColor}; background:${gradient}; border:1px solid ${borderColor};">
          <i class="${icon}"></i>
        </div>
        <div class="ia-kpi-value">${value}</div>
        <div class="ia-kpi-label">${label}</div>
        <div class="ia-kpi-sub ${subClass}">
          <i class="fas ${subIcon}"></i> ${sub}
        </div>
      </div>`;
  },

  /* ════════════════════════════════════════════════
   *  PREDICTION CHART (Chart.js)
   * ════════════════════════════════════════════════ */
  renderChart() {
    const ctx = document.getElementById('predictionChart');
    if (!ctx) return;

    const sales = this.data.monthly_sales || [];
    const predictions = this.data.predictions || [];

    // Labels
    const realLabels = sales.map(s => s.month_label);
    const predLabels = predictions.map(p => p.month_label);
    const allLabels = [...realLabels, ...predLabels];

    // Data — real sales
    const realData = sales.map(s => s.revenue);

    // Data — prediction line (starts from last real point)
    const predData = new Array(realData.length - 1).fill(null);
    predData.push(realData[realData.length - 1]); // connect at last real point
    predictions.forEach(p => predData.push(p.revenue));

    // Regression line across all real data
    const reg = this.data.regression;
    const regressionLine = [];
    for (let i = 0; i < sales.length; i++) {
      regressionLine.push(Math.max(0, reg.slope * (i + 1) + reg.intercept));
    }
    for (let i = 0; i < predictions.length; i++) {
      regressionLine.push(Math.max(0, reg.slope * (sales.length + i + 1) + reg.intercept));
    }

    if (this.predictionChart) this.predictionChart.destroy();

    this.predictionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Ventes réelles',
            data: [...realData, ...new Array(predictions.length).fill(null)],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Prédiction IA',
            data: predData,
            borderColor: '#E5A657',
            backgroundColor: 'rgba(229,166,87,0.08)',
            borderWidth: 3,
            borderDash: [8, 4],
            pointBackgroundColor: '#E5A657',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointStyle: 'rectRot',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Droite de régression',
            data: regressionLine,
            borderColor: 'rgba(168,85,247,0.5)',
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,9,15,0.95)',
            titleColor: '#E5A657',
            bodyColor: '#fff',
            borderColor: 'rgba(229,166,87,0.3)',
            borderWidth: 1,
            padding: 14,
            cornerRadius: 12,
            titleFont: { family: "'Outfit', sans-serif", size: 13, weight: '600' },
            bodyFont: { family: "'Outfit', sans-serif", size: 12 },
            callbacks: {
              label: function(ctx) {
                if (ctx.raw === null) return '';
                return `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} €`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { family: "'Outfit', sans-serif", size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { family: "'Outfit', sans-serif", size: 11 },
              callback: v => v + ' €'
            }
          }
        }
      }
    });
  },

  /* ════════════════════════════════════════════════
   *  RECOMMENDATIONS
   * ════════════════════════════════════════════════ */
  renderRecommendations() {
    const list = document.getElementById('ia-reco-list');
    if (!list) return;

    const recs = this.data.recommendations || [];
    if (recs.length === 0) {
      list.innerHTML = `<p style="color:var(--studio-muted); text-align:center; padding:20px;">Aucune recommandation disponible.</p>`;
      return;
    }

    list.innerHTML = recs.map((r, i) => {
      const colors = {
        success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: '#22C55E' },
        warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#F59E0B' },
        info:    { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: '#3B82F6' },
      };
      const c = colors[r.type] || colors.info;

      return `
        <div class="ia-reco-item animate-fade" style="animation-delay:${i * 0.08}s; background:${c.bg}; border:1px solid ${c.border};">
          <div class="ia-reco-icon" style="color:${c.icon}; background:${c.bg}; border:1px solid ${c.border};">
            <i class="${r.icon}"></i>
          </div>
          <div class="ia-reco-content">
            <div class="ia-reco-title">${r.title}</div>
            <div class="ia-reco-text">${r.text}</div>
          </div>
        </div>`;
    }).join('');
  },

  /* ════════════════════════════════════════════════
   *  TOP PRODUCTS
   * ════════════════════════════════════════════════ */
  renderTopProducts() {
    const el = document.getElementById('ia-top-products-list');
    if (!el) return;

    const products = this.data.top_products || [];
    if (products.length === 0) {
      el.innerHTML = `<p style="color:var(--studio-muted); text-align:center; padding:20px; font-size:0.85rem;">Aucune vente enregistrée.</p>`;
      return;
    }

    el.innerHTML = products.map((p, i) => {
      const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `#${i+1}`));
      const rareteColors = {
        'COMMUN': 'rgba(156,163,175,0.6)', 'RARE': 'rgba(59,130,246,0.8)',
        'TRES_RARE': 'rgba(168,85,247,0.8)', 'COLLECTOR': 'rgba(229,166,87,0.9)'
      };
      const rColor = rareteColors[p.rarete] || rareteColors['COMMUN'];

      return `
        <div class="ia-product-row animate-fade" style="animation-delay:${i * 0.06}s;">
          <div class="ia-product-rank">${medal}</div>
          <div class="ia-product-info">
            <div class="ia-product-name">${p.titre}</div>
            <div class="ia-product-meta">
              ${p.artiste || ''} · ${p.categorie || p.type_categorie}
              <span class="ia-rarete-tag" style="color:${rColor}; border-color:${rColor};">${p.rarete}</span>
            </div>
          </div>
          <div class="ia-product-stats">
            <div class="ia-product-sold">${p.total_sold} vendus</div>
            <div class="ia-product-revenue">${parseFloat(p.total_revenue).toFixed(2)} €</div>
          </div>
        </div>`;
    }).join('');
  },

  /* ════════════════════════════════════════════════
   *  CATEGORY CHART
   * ════════════════════════════════════════════════ */
  renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const cats = this.data.category_analysis || [];
    if (cats.length === 0) return;

    const labels = cats.map(c => c.type_categorie);
    const revenues = cats.map(c => parseFloat(c.total_revenue));
    const bgColors = [
      'rgba(229,166,87,0.7)', 'rgba(59,130,246,0.7)', 'rgba(168,85,247,0.7)',
      'rgba(34,197,94,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'
    ];
    const borderColors = [
      'rgba(229,166,87,1)', 'rgba(59,130,246,1)', 'rgba(168,85,247,1)',
      'rgba(34,197,94,1)', 'rgba(239,68,68,1)', 'rgba(245,158,11,1)'
    ];

    if (this.categoryChart) this.categoryChart.destroy();

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: revenues,
          backgroundColor: bgColors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255,255,255,0.7)',
              font: { family: "'Outfit', sans-serif", size: 12 },
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(13,9,15,0.95)',
            titleColor: '#E5A657',
            bodyColor: '#fff',
            borderColor: 'rgba(229,166,87,0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: function(ctx) {
                return ` ${ctx.label}: ${ctx.raw.toFixed(2)} €`;
              }
            }
          }
        }
      }
    });
  },

  /* ════════════════════════════════════════════════
   *  HOT PRODUCTS (Favoris)
   * ════════════════════════════════════════════════ */
  renderHotProducts() {
    const el = document.getElementById('ia-hot-products-list');
    if (!el) return;

    const products = this.data.hot_products || [];
    if (products.length === 0) {
      el.innerHTML = `<p style="color:var(--studio-muted); text-align:center; padding:20px; font-size:0.85rem;">Aucun produit en favoris pour l'instant.</p>`;
      return;
    }

    el.innerHTML = products.map((p, i) => {
      const stockWarning = p.stock <= 2;
      return `
        <div class="ia-hot-row animate-fade" style="animation-delay:${i * 0.06}s;">
          <div class="ia-hot-icon">
            <i class="fas fa-fire" style="color:#EF4444;"></i>
          </div>
          <div class="ia-hot-info">
            <div class="ia-hot-name">${p.titre}</div>
            <div class="ia-hot-meta">${p.artiste || 'Artiste'} · ${p.prix} €</div>
          </div>
          <div class="ia-hot-stats">
            <div class="ia-hot-favs"><i class="fas fa-heart" style="color:#EF4444;"></i> ${p.fav_count}</div>
            <div class="ia-hot-stock ${stockWarning ? 'warning' : ''}">
              <i class="fas fa-cube"></i> ${p.stock} en stock
            </div>
          </div>
        </div>`;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => IAPredictionsController.init());
