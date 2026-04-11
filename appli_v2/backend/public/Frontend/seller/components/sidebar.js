/* ══ SellerSidebar Component ══ */
const SellerSidebar = {
  render(activePage = 'dashboard') {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    const mainNav = [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-th-large',      url: 'dashboard.html' },
      { id: 'products',  label: 'Mes Produits',    icon: 'fas fa-boxes',           url: 'products.html' },
      { id: 'orders',    label: 'Commandes',        icon: 'fas fa-shopping-bag',    url: 'orders.html' },
      { id: 'finance',   label: 'Finances',         icon: 'fas fa-wallet',          url: 'finance.html' },
    ];
    const shopNav = [
      { id: 'profile',   label: 'Aperçu Boutique',  icon: 'fas fa-store',           url: 'profile.html' },
      { id: 'reviews',   label: 'Avis Clients',      icon: 'fas fa-star',            url: 'reviews.html' },
      { id: 'settings',  label: 'Paramètres',        icon: 'fas fa-cog',             url: 'settings.html' },
    ];

    const navItem = (item) => `
      <a href="${item.url}" class="nav-item ${activePage === item.id ? 'active' : ''}" id="nav-${item.id}">
        <i class="${item.icon}"></i>
        <span>${item.label}</span>
      </a>`;

    container.innerHTML = `
      <aside class="studio-sidebar glass-card" id="studio-sidebar" style="background: hsla(28, 25%, 10%, 0.8); backdrop-filter: blur(25px); border-right: 1px solid var(--studio-border);">
        <div class="sidebar-logo">
          <span class="gold-logo-txt" style="font-family:'Cormorant Garamond',serif; font-size:1.7rem; letter-spacing: 0.05em;">GOLD <em style="font-style:normal; color:var(--studio-honey)">STUDIO</em></span>
          <span class="gold-logo-badge" style="background: var(--studio-gold-gradient); color: #000; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px; font-weight: 700;">Vendeur</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group-label">Principal</div>
          ${mainNav.map(navItem).join('')}

          <a href="create-product.html" class="nav-item" style="margin-top:12px;
            background:hsla(38, 70%, 55%, 0.1); border:1px solid hsla(38, 70%, 55%, 0.25); border-radius: 12px;">
            <i class="fas fa-plus" style="color:var(--studio-honey); opacity:1"></i>
            <span style="color:var(--studio-honey); font-weight:700; letter-spacing:0.3px;">Nouvel Article</span>
          </a>

          <div class="nav-group-label" style="margin-top:20px">Ma Boutique</div>
          ${shopNav.map(navItem).join('')}
        </nav>

        <div class="sidebar-footer">
          <a href="../index.html" class="nav-item back-site">
            <i class="fas fa-arrow-left"></i>
            <span>Retour au site</span>
          </a>
          <button class="nav-item logout-btn" onclick="SellerAuth.logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>`;
  }
};
