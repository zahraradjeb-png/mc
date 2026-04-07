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
    const id          = p.id_produit || p.id;
    const isAvailable = p.est_disponible == 1 && p.quantite > 0;
    const imgSrc      = ProductService.resolveImage(p);
    const price       = parseFloat(p.prix || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
    const rarity      = (p.rarete || 'COMMUN').replace(/_/g, ' ');
    const etat        = p.etat || 'BON';

    return `
      <div class="management-card animate-slide" style="animation-delay:${idx * 0.04}s">
        <div class="m-card-img-wrap">
          <span class="m-card-badge ${isAvailable ? 'badge-available' : 'badge-indisponible'}">
            ${isAvailable ? 'Disponible' : 'Indisponible'}
          </span>
          ${imgSrc
            ? `<img src="${imgSrc}" class="m-card-img" alt="${p.titre || ''}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''}
          <div class="m-card-placeholder" ${imgSrc ? 'style="display:none"' : ''}>
            <i class="fas fa-music"></i>
          </div>
        </div>

        <div class="m-card-content">
          <h3 class="m-card-title">${p.titre || p.nom || '—'}</h3>
          <span class="m-card-subtitle">${p.artiste || 'Artiste inconnu'} · ${p.categorie || 'Article'}</span>

          <div class="m-card-tags">
            <span class="m-tag">${rarity}</span>
            <span class="m-tag">${etat}</span>
          </div>

          <div class="m-card-stats">
            <span class="m-price">${price} €</span>
            <span class="m-stock">Stock : <b style="color:${p.quantite > 3 ? '#4ade80' : '#f87171'}">${p.quantite || 0}</b></span>
          </div>

          <div class="m-card-actions">
            <a href="product-details.html?id=${id}" class="m-btn-icon" title="Voir détails">
              <i class="fas fa-eye"></i>
            </a>
            <a href="edit-product.html?id=${id}" class="m-btn-icon" title="Modifier">
              <i class="fas fa-edit"></i>
            </a>
            <button class="m-btn-icon delete" title="Supprimer"
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
