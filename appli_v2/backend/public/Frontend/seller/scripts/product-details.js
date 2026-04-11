const ProductDetailsController = {
  async init() {
    const userOrAuth = await SellerLayout.init({
      title: '', // Title is in custom header
      pageId: 'products'
    });

    if (!userOrAuth) return;

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
      this.loadProductDetails(productId);
    }
  },

  async loadProductDetails(id) {
    try {
      const p = await ProductService.getProduct(id);
      if (p) {
        this.renderProduct(p);
      }
    } catch (e) {
      console.warn('Could not load product details.');
    }
  },

  renderProduct(p) {
    document.getElementById('p-cat-mini').textContent = p.categorie || 'Produit';
    document.getElementById('p-title-header').textContent = p.titre || p.nom;
    document.getElementById('p-main-img').src = p.photo_principale || '../assets/img/placeholder-vinyl.png';
    
    // Update elements in the cards (using classes or IDs)
    const titles = document.querySelectorAll('.p-title');
    titles.forEach(el => el.textContent = p.titre || p.nom);

    // Update pricing
    const priceEl = document.querySelector('.p-header div:last-child');
    if (priceEl) priceEl.textContent = `${(p.prix || 0).toLocaleString()} €`;

    // Update description
    const descEl = document.querySelector('.p-info-card p');
    if (descEl) descEl.textContent = p.description || 'Pas de description.';

    // Update stats
    const statsVals = document.querySelectorAll('.p-ms-val');
    if (statsVals.length >= 3) {
      statsVals[0].textContent = p.ventes || 0;
      statsVals[1].textContent = p.vues || 0;
      statsVals[2].textContent = p.stock || 0;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => ProductDetailsController.init());
