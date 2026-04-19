const ProfileController = {
  user: null,
  userId: null,

  async init() {
    this.user = await SellerLayout.init({
      title: '', // Transparent header for profile page
      pageId: 'profile'
    });
    if (!this.user) return;

    this.userId = this.user.id_vendeur || this.user.vendeur?.id || this.user.id;
    
    // Header CTA
    SellerHeader.addAction(``);

    this.renderStoreInfo();
    this.initTabs();
    this.loadFeed();
  },

  renderStoreInfo() {
    const name = this.user.nom_boutique || this.user.prenom || 'Boutique Sans Nom';
    const cleanHandle = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    document.getElementById('p-name').textContent = name;
    document.getElementById('p-handle').textContent = `@${cleanHandle}`;
    document.getElementById('p-bio').textContent = this.user.description || '';
    document.getElementById('p-full-bio').textContent = this.user.description || 'Aucune description disponible.';

    if (this.user.localisation) {
        document.querySelector('#p-location .txt').textContent = this.user.localisation;
    }
    if (this.user.categorie_principale) {
        document.querySelector('#p-category .txt').textContent = this.user.categorie_principale;
    }

    // Avatar Logic
    const avatar = document.getElementById('p-avatar');
    if (this.user.photo_profil && this.user.photo_profil !== 'default.png') {
        const base = ProductService.baseUrl ? ProductService.baseUrl.replace('/api', '') : 'http://localhost:8000';
        const imgUrl = `${base}/${this.user.photo_profil.replace(/^\//, '')}`;
        avatar.innerHTML = `<img src="${imgUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
        avatar.textContent = name.charAt(0).toUpperCase();
        avatar.style.background = 'rgba(229,166,87,0.1)';
        avatar.style.color = 'var(--studio-honey)';
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';
    }
  },

  initTabs() {
    const tabs = document.querySelectorAll('.tab-nav-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.getAttribute('data-tab');
            document.querySelectorAll('.feed-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
  },

  async loadFeed() {
    const feed = document.getElementById('products-feed');
    try {
        const products = await ProductService.getProducts(this.userId);
        
        if (products && products.length > 0) {
            feed.innerHTML = products.map((p, i) => {
                const isAvailable = p.est_disponible == 1 && p.quantite > 0;
                const imgSrc = ProductService.resolveImage(p);
                const price = parseFloat(p.prix || 0).toLocaleString('fr-FR', {minimumFractionDigits:2});
                
                return `
                    <div class="product-post-card animate-slide ${!isAvailable ? 'item-out' : ''}" style="animation-delay:${i*0.05}s">
                        <div class="p-post-img-container">
                             ${!isAvailable ? '<span class="p-out-ribbon">Indisponible</span>' : ''}
                             ${imgSrc 
                               ? `<img src="${imgSrc}" class="p-post-img" alt="${p.titre}" onerror="this.style.display='none'">` 
                               : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(229,166,87,0.1);color:var(--studio-honey);font-size:2rem"><i class="fas fa-music"></i></div>`}
                        </div>
                        <div class="p-post-content">
                            <h3 class="p-post-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${p.titre || p.nom}">${p.titre || p.nom}</h3>
                            <div class="p-post-price">${price} €</div>
                            <div class="p-post-footer">
                                <span class="p-post-meta">
                                    <i class="fas fa-music" style="margin-right:4px"></i> ${p.artiste || p.categorie || 'Article'}
                                </span>
                                <a href="../product.html?id=${p.id_produit || p.id}" class="btn-profile-outline">Aperçu <i class="fas fa-external-link-alt" style="margin-left:4px"></i></a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            feed.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1; padding: 60px 20px;">
                    <i class="fas fa-plus-circle" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.1;"></i>
                    <h2 style="font-family: 'Cormorant Garamond', serif;">Aucun article publié</h2>
                    <p style="opacity: 0.5;">La galerie est actuellement vide.</p>
                </div>
            `;
        }
    } catch (e) {
        feed.innerHTML = `<p style="text-align:center; padding:40px; opacity:0.5;">Erreur de chargement de la galerie.</p>`;
    }
  },

  shareProfile() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        StudioToast.success("Lien de la boutique copié !");
    });
  }
};

document.addEventListener('DOMContentLoaded', () => ProfileController.init());
