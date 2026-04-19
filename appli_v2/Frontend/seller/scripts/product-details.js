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
    } else {
      StudioToast.error("ID du produit manquant");
    }
  },

  async loadProductDetails(id) {
    try {
      const response = await ProductService.getProduct(id);
      // Laravel returns { product: {}, photos: [], details: {} }
      if (response && response.product) {
        this.renderProduct(response);
      } else {
        StudioToast.error("Données du produit invalides");
      }
    } catch (e) {
      console.warn('Could not load product details.', e);
      StudioToast.error("Erreur lors de la récupération des détails");
    }
  },

  renderProduct(data) {
    const p = data.product;
    const photos = data.photos || [];
    const details = data.details || {};

    // Header & Tab title
    const catTxt = p.categorie_nom || 'Article';
    document.getElementById('p-cat-mini').textContent = catTxt;
    document.getElementById('p-title-header').textContent = p.titre;
    
    // Gallery
    const mainImg = document.getElementById('p-main-img');
    let resolvedImg = null;
    if (photos.length > 0) {
      resolvedImg = ProductService.resolveImage({ photo_principale: photos[0].chemin });
    } else {
      resolvedImg = ProductService.resolveImage(p); // Fallback to product.photo_principale if any
    }
    
    if (resolvedImg) {
      mainImg.src = resolvedImg;
    } else {
      mainImg.src = '../assets/img/placeholder-vinyl.png';
    }

    // Info Card
    document.getElementById('p-title').textContent = p.titre;
    document.getElementById('p-price').textContent = `${parseFloat(p.prix || 0).toFixed(2)} €`;
    document.getElementById('p-desc').textContent = p.description || 'Aucune description.';
    document.getElementById('p-stock').textContent = p.quantite || 0;
    document.getElementById('p-category').textContent = catTxt;

    // Status Badge Logic (using DB statut or compute)
    const badge = document.getElementById('p-status-badge');
    // We don't have real_statut in the show() method's select, but we can check product.statut
    const statut = p.statut || 'EN_ATTENTE';
    
    if (statut === 'VALIDEE' && p.est_disponible == 1 && p.quantite > 0) {
      badge.textContent = 'En ligne';
      badge.className = 'badge-status st-active';
    } else if (statut === 'EN_ATTENTE') {
      badge.textContent = 'En attente';
      badge.className = 'badge-status st-pending';
    } else {
      badge.textContent = 'Hors ligne';
      badge.className = 'badge-status st-inactive';
    }

    // Specialized details (Optional: could add more fields to HTML)
    if (p.artiste) {
        const artistMeta = document.createElement('div');
        artistMeta.style.fontSize = '0.9rem';
        artistMeta.style.color = 'var(--studio-honey)';
        artistMeta.style.marginBottom = '10px';
        artistMeta.innerHTML = `<i class="fas fa-microphone"></i> ${p.artiste}`;
        document.getElementById('p-title').after(artistMeta);
    }

    // Update Edit Link
    const editBtn = document.querySelector('.header-actions a');
    if (editBtn) editBtn.href = `edit-product.html?id=${p.id_produit}`;
  }
};

document.addEventListener('DOMContentLoaded', () => ProductDetailsController.init());
