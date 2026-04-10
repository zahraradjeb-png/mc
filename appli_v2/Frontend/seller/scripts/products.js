/* ══ Products Controller — Inventory Management ══ */
const ProductsController = {
  allProducts: [],
  userId: null,
  viewMode: 'grid',

  async init() {
    const user = await SellerLayout.init({
      title: 'Mes Produits',
      subtitle: "Gestion d'inventaire",
      pageId: 'products'
    });
    if (!user) return;

    this.userId = user.id_vendeur || user.vendeur?.id || user.id;

    SellerHeader.addAction(`
      <a href="create-product.html" class="btn-gold-studio">
        <i class="fas fa-plus"></i> Nouvel Article
      </a>
    `);

    await this.loadProducts();
    this._initFilters();
    this._initViewToggle();
  },

  /* ── Load & render products ── */
  async loadProducts() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    try {
      this.allProducts = await ProductService.getProducts(this.userId);
      this._renderFiltered();
    } catch (e) {
      console.error('[ProductsController] loadProducts:', e);
      this.allProducts = [];
      this._renderEmpty();
    }
  },

  /* ── Apply current filters and render ── */
  _renderFiltered() {
    const search = (document.getElementById('p-search')?.value || '').toLowerCase();
    const status = document.getElementById('filter-status')?.value || 'all';
    const cat    = document.getElementById('filter-cat')?.value || 'all';

    let filtered = this.allProducts;

    if (search) {
      filtered = filtered.filter(p =>
        (p.titre || p.nom || '').toLowerCase().includes(search) ||
        (p.artiste || '').toLowerCase().includes(search) ||
        String(p.id_produit || p.id).includes(search)
      );
    }

    if (status === 'available') filtered = filtered.filter(p => p.est_disponible == 1 && p.quantite > 0);
    if (status === 'out')       filtered = filtered.filter(p => p.est_disponible != 1 || p.quantite == 0);

    if (cat !== 'all') {
      filtered = filtered.filter(p => {
        const catName = (p.categorie || p.type || '').toUpperCase();
        return catName.includes(cat) || String(p.id_categorie) === this._catIdFromType(cat);
      });
    }

    this._updateMeta(filtered.length);
    filtered.length > 0 ? this._renderProducts(filtered) : this._renderEmpty();
  },

  _catIdFromType(type) {
    const map = { 'VINYLE': '1', 'CD': '2', 'CASSETTE': '3', 'POSTER': '4', 'INSTRUMENT': '5' };
    return map[type] || '';
  },

  /* ── Product cards ── */
  _renderProducts(products) {
    const grid = document.getElementById('inventory-grid');
    grid.className = `inventory-grid${this.viewMode === 'list' ? ' list-view' : ''}`;
    grid.innerHTML = products.map((p, i) => this._productCard(p, i)).join('');
  },

  _productCard(p, idx) {
    const isValidated = p.real_statut === 'VALIDEE';
    const isPending   = p.real_statut === 'EN_ATTENTE';
    const isRefused   = p.real_statut === 'REFUSEE';
    const id      = p.id_produit || p.id;
    const imgSrc  = ProductService.resolveImage(p);
    const price   = parseFloat(p.prix || 0).toFixed(2);
    const rarity  = (p.rarete || 'COMMUN').replace('_', ' ');
    const etat    = (p.etat || 'BON').replace('_', ' ');
    
    // Un produit n'est "Disponible" (affiché aux clients) que s'il est validé ET disponible ET en stock
    const isActuallyLive = isValidated && p.est_disponible == 1 && p.quantite > 0;

    return `
      <div class="management-card animate-slide glass-card" style="animation-delay:${idx * 0.04}s; background: var(--studio-panel); border: 1px solid var(--studio-border);">
        <div class="m-card-img-wrap" style="background: hsla(38, 70%, 55%, 0.05);">
          <div style="position:absolute; top:10px; left:10px; z-index:5; display:flex; flex-direction:column; gap:6px">
            <span class="m-card-badge ${isActuallyLive ? 'badge-available' : 'badge-indisponible'}" style="font-weight:700; letter-spacing:0.5px;">
              ${isActuallyLive ? 'Catalogué (Live)' : (p.quantite == 0 ? 'Stock épuisé' : 'Non visible')}
            </span>
            <span class="m-card-badge" style="background:${isValidated ? 'hsla(140, 70%, 50%, 0.2)' : (isRefused ? 'hsla(0, 80%, 50%, 0.2)' : 'hsla(38, 70%, 55%, 0.2)')}; color:${isValidated ? '#4ade80' : (isRefused ? '#f87171' : '#fbbf24')}; border: 1px solid currentColor; font-weight:800; font-size:0.6rem; letter-spacing:1px; text-transform:uppercase;">
              ${isValidated ? 'Validé' : (isRefused ? 'Refusé' : 'En attente')}
            </span>
          </div>
          ${imgSrc
            ? `<img src="${imgSrc}" class="m-card-img" alt="${p.titre || ''}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''}
          <div class="m-card-placeholder" ${imgSrc ? 'style="display:none"' : ''}>
            <i class="fas fa-music"></i>
          </div>
        </div>

        <div class="m-card-content" style="padding:18px;">
          <h3 class="m-card-title" style="font-family:'Cormorant Garamond',serif; font-size:1.2rem; color:var(--studio-white); margin-bottom:4px;">${p.titre || p.nom || '—'}</h3>
          <span class="m-card-subtitle" style="font-family:'Outfit',sans-serif; color:var(--studio-muted); font-size:0.8rem; margin-bottom:12px; display:block;">${p.artiste || 'Artiste inconnu'} · <span style="color:var(--studio-honey)">${p.categorie || 'Article'}</span></span>

          <div class="m-card-tags" style="margin-bottom:16px;">
            <span class="m-tag" style="background:hsla(38, 70%, 55%, 0.1); border: 1px solid hsla(38, 70%, 55%, 0.2); color:var(--studio-honey);">${rarity}</span>
            <span class="m-tag" style="background:hsla(35, 40%, 20%, 0.2); border: 1px solid var(--studio-border); color:var(--studio-muted);">${etat}</span>
          </div>

          <div class="m-card-stats" style="border-top: 1px solid var(--studio-border); padding-top:14px; margin-top:14px;">
            <span class="m-price" style="font-family:'Cormorant Garamond',serif; font-size:1.3rem; font-weight:700; color:var(--studio-white);">${price} €</span>
            <span class="m-stock" style="font-size:0.8rem; color:var(--studio-muted);">Stock : <b style="color:${p.quantite > 3 ? 'var(--studio-success)' : 'var(--studio-error)'}">${p.quantite || 0}</b></span>
          </div>

          <div class="m-card-actions" style="margin-top:16px; gap:8px;">
            <a href="product-details.html?id=${id}" class="m-btn-icon glass-card" title="Voir détails" style="background:hsla(35, 40%, 20%, 0.2); border:1px solid var(--studio-border); color:var(--studio-honey);">
              <i class="fas fa-eye"></i> Details
            </a>
            <a href="edit-product.html?id=${id}" class="m-btn-icon glass-card" title="Modifier" style="background:hsla(35, 40%, 20%, 0.2); border:1px solid var(--studio-border); color:var(--studio-honey);">
              <i class="fas fa-edit"></i> Editer
            </a>
            <button class="m-btn-icon delete glass-card" title="Supprimer" style="background:hsla(0, 80%, 50%, 0.1); border:1px solid hsla(0, 80%, 50%, 0.2); color:var(--studio-error);"
               onclick="ProductsController.confirmDelete(${id}, '${(p.titre||'').replace(/'/g,"\\'")}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>`;
  },

  /* ── Empty state ── */
  _renderEmpty() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = `
      <div class="empty-state animate-fade">
        <i class="fas fa-box-open"></i>
        <h2>Votre inventaire est vide</h2>
        <p>Commencez par publier votre premier article de collection.</p>
        <a href="create-product.html" class="btn-gold-studio" style="margin:0 auto">
          <i class="fas fa-plus"></i> Ajouter un article
        </a>
      </div>`;
  },

  /* ── Meta bar ── */
  _updateMeta(count) {
    const meta = document.getElementById('products-meta');
    const label = document.getElementById('products-count-label');
    if (!meta || !label) return;
    meta.style.display = 'flex';
    label.textContent = `${count} article${count !== 1 ? 's' : ''} trouvé${count !== 1 ? 's' : ''}`;
  },

  /* ── Filters ── */
  _initFilters() {
    const search = document.getElementById('p-search');
    const status = document.getElementById('filter-status');
    const cat    = document.getElementById('filter-cat');

    let searchTimer;
    search?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => this._renderFiltered(), 220);
    });
    status?.addEventListener('change', () => this._renderFiltered());
    cat?.addEventListener('change', () => this._renderFiltered());
  },

  /* ── View toggle (grid / list) ── */
  _initViewToggle() {
    const btnGrid = document.getElementById('view-grid');
    const btnList = document.getElementById('view-list');
    btnGrid?.addEventListener('click', () => {
      this.viewMode = 'grid';
      btnGrid.classList.add('active'); btnList?.classList.remove('active');
      this._renderFiltered();
    });
    btnList?.addEventListener('click', () => {
      this.viewMode = 'list';
      btnList.classList.add('active'); btnGrid?.classList.remove('active');
      this._renderFiltered();
    });
  },

  /* ── Delete with confirmation ── */
  confirmDelete(id, titre) {
    StudioConfirm.show(
      'Supprimer l\'article',
      `Êtes-vous sûr de vouloir supprimer <strong>"${titre}"</strong> ? Cette action est irréversible.`,
      () => this.handleDelete(id)
    );
  },

  async handleDelete(id) {
    try {
      await ProductService.deleteProduct(id);
      this.allProducts = this.allProducts.filter(p => (p.id_produit || p.id) != id);
      this._renderFiltered();
      StudioToast.success('Article supprimé avec succès.', 3000);
    } catch (e) {
      StudioToast.error('Erreur lors de la suppression. Réessayez.', 4000);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => ProductsController.init());
