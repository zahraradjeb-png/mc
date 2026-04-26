/**
 * acheteur Navbar — Shared component for all acheteur pages.
 * Generates a consistent navbar with links, cart badge, favs badge, etc.
 */
const acheteurNav = {
  /** Render the navbar into the page */
  init(activePage = '') {
    const navbar = document.getElementById('v-navbar');
    if (!navbar) return;

    const isSubDir = window.location.pathname.includes('/acheteur/');
    const root = isSubDir ? '../' : '';
    const acheteurRoot = isSubDir ? '' : 'acheteur/';

    navbar.innerHTML = `
      <div class="v-nav-wrap">
        <a href="${acheteurRoot}index.html" class="v-logo">Retro<span>Market</span></a>
        <div class="v-nav-links">
          <a href="${acheteurRoot}catalogue.html" class="v-nav-link ${activePage === 'catalogue' ? 'active' : ''}">Catalogue</a>
          <a href="${acheteurRoot}index.html#comment-ca-marche" class="v-nav-link ${activePage === 'hiw' ? 'active' : ''}">Comment ça marche ?</a>
          <a href="${acheteurRoot}activite.html" class="v-nav-link ${activePage === 'activite' ? 'active' : ''}">Activité</a>
        </div>
        <div class="v-nav-spacer"></div>
        <div class="v-nav-actions">
          <a href="${acheteurRoot}panier.html" class="v-nav-icon" title="Panier">
            <i class="fas fa-shopping-bag"></i>
            <span class="badge" id="vCartBadge">0</span>
          </a>
          <a href="${acheteurRoot}favoris.html" class="v-nav-icon" title="Favoris">
            <i class="fas fa-heart"></i>
            <span class="badge" id="vFavBadge">0</span>
          </a>
          <a href="${acheteurRoot}activite.html" class="v-nav-icon" title="Activité">
            <i class="fas fa-bell"></i>
          </a>
          <a href="${acheteurRoot}profile.html" class="v-nav-icon v-nav-avatar" title="Profil">
            <i class="fas fa-user"></i>
          </a>
        </div>
      </div>
    `;

    this.updateBadges();
  },

  updateBadges() {
    // Cart badge
    const cart = acheteurStore.getCart();
    const cartBadge = document.getElementById('vCartBadge');
    if (cartBadge) {
      cartBadge.textContent = cart.length;
      cartBadge.style.display = cart.length > 0 ? 'flex' : 'none';
    }

    // Fav badge
    const favs = acheteurStore.getFavs();
    const favBadge = document.getElementById('vFavBadge');
    if (favBadge) {
      favBadge.textContent = favs.length;
      favBadge.style.display = favs.length > 0 ? 'flex' : 'none';
    }
  }
};
