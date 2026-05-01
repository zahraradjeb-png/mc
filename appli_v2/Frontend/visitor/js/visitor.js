/* ══════════════════════════════════════
   VISITOR JS — Shared Module
   Navbar, Cart, Favs, Activity, Toast
══════════════════════════════════════ */

// ── API Base (always points to Laravel backend) ──
window.API_BASE = window.API_BASE || 'http://127.0.0.1:8000/api';

// ── Visitor ID (persistent UUID in localStorage) ──
const VisitorSystem = {
  getVisitorId() {
    let id = localStorage.getItem('visitor_uuid');
    if (!id) {
      id = 'v_' + crypto.randomUUID();
      localStorage.setItem('visitor_uuid', id);
    }
    return id;
  },

  // ── CART (localStorage only) ──
  getCart() { try { return JSON.parse(localStorage.getItem('visitor_cart')) || []; } catch { return []; } },
  saveCart(c) { localStorage.setItem('visitor_cart', JSON.stringify(c)); this.updateCartBadge(); },
  getCartCount() { return this.getCart().length; },
  isInCart(id) { return this.getCart().some(i => String(i.id) === String(id)); },

  addToCart(product) {
    const cart = this.getCart();
    if (cart.find(i => String(i.id) === String(product.id))) {
      VisitorToast.show('Déjà dans le panier', 'info');
      return false;
    }
    cart.push({
      id: String(product.id),
      name: product.name,
      price: parseFloat(product.price),
      image: product.image || '',
      meta: product.meta || '',
      qty: 1,
      addedAt: new Date().toISOString()
    });
    this.saveCart(cart);
    this.logActivity('cart_add', `Ajouté au panier : ${product.name}`, product.id);
    VisitorToast.show('Ajouté au panier !');
    return true;
  },

  removeFromCart(id) {
    const cart = this.getCart().filter(i => String(i.id) !== String(id));
    this.saveCart(cart);
    VisitorToast.show('Retiré du panier');
  },

  clearCart() { this.saveCart([]); },

  updateCartBadge() {
    const count = this.getCartCount();
    document.querySelectorAll('.v-cart-count').forEach(b => {
      b.textContent = count;
      b.classList.toggle('show', count > 0);
    });
  },

  // ── FAVORITES (localStorage) ──
  getFavs() { try { return JSON.parse(localStorage.getItem('visitor_favs')) || []; } catch { return []; } },
  saveFavs(f) { localStorage.setItem('visitor_favs', JSON.stringify(f)); this.updateFavBadge(); },
  isFav(id) { return this.getFavs().some(f => String(f.id) === String(id)); },

  toggleFav(product) {
    let favs = this.getFavs();
    const idx = favs.findIndex(f => String(f.id) === String(product.id));
    if (idx > -1) {
      favs.splice(idx, 1);
      this.saveFavs(favs);
      this.logActivity('fav_remove', `Retiré des favoris : ${product.name}`, product.id);
      VisitorToast.show('Retiré des favoris');
      return false;
    } else {
      favs.push({
        id: String(product.id),
        name: product.name,
        price: parseFloat(product.price),
        image: product.image || '',
        meta: product.meta || '',
        addedAt: new Date().toISOString()
      });
      this.saveFavs(favs);
      this.logActivity('fav_add', `Ajouté aux favoris : ${product.name}`, product.id);
      VisitorToast.show('Ajouté aux favoris ♥');
      return true;
    }
  },

  removeFav(id) {
    const favs = this.getFavs().filter(f => String(f.id) !== String(id));
    this.saveFavs(favs);
    VisitorToast.show('Retiré des favoris');
  },

  updateFavBadge() {
    const count = this.getFavs().length;
    document.querySelectorAll('.v-fav-count').forEach(b => {
      b.textContent = count;
      b.classList.toggle('show', count > 0);
    });
  },

  // ── ACTIVITY LOG ──
  logActivity(type, label, productId) {
    // Save locally
    const activities = this.getActivities();
    activities.unshift({
      type, label, id_produit: productId,
      date: new Date().toISOString()
    });
    // Keep max 200
    localStorage.setItem('visitor_activities', JSON.stringify(activities.slice(0, 200)));

    // Also send to backend
    fetch(`${window.API_BASE}/visitor/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: this.getVisitorId(),
        type, label, id_produit: productId
      })
    }).catch(e => console.warn('Activity log error:', e));
  },

  getActivities() {
    try { return JSON.parse(localStorage.getItem('visitor_activities')) || []; }
    catch { return []; }
  },

  getActivityIcon(type) {
    const icons = {
      'cart_add': 'fa-shopping-bag',
      'fav_add': 'fa-heart',
      'fav_remove': 'fa-heart-broken',
      'review': 'fa-star',
      'view': 'fa-eye'
    };
    return icons[type] || 'fa-clock';
  },

  getActivityColor(type) {
    const colors = {
      'cart_add': '#e5a657',
      'fav_add': '#b53324',
      'fav_remove': '#666',
      'review': '#e5a657',
      'view': '#a1bec7'
    };
    return colors[type] || '#888';
  }
};

// ── Toast System ──
const VisitorToast = {
  show(msg, type = 'ok') {
    let toast = document.getElementById('v-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'v-toast';
      toast.className = 'v-toast';
      toast.innerHTML = '<i class="fas fa-check-circle"></i><span></span>';
      document.body.appendChild(toast);
    }
    const icon = toast.querySelector('i');
    const span = toast.querySelector('span');
    span.textContent = msg;
    if (type === 'info') icon.className = 'fas fa-info-circle';
    else if (type === 'error') icon.className = 'fas fa-exclamation-circle';
    else icon.className = 'fas fa-check-circle';
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
  }
};

// ── Navbar Renderer ──
function renderVisitorNavbar(activePage) {
  const pathPrefix = '';
  const cartCount = VisitorSystem.getCartCount();
  const favCount = VisitorSystem.getFavs().length;
  const user = JSON.parse(localStorage.getItem('gold_user') || 'null');

  let authSection = `
    <a href="${pathPrefix}profile.html" class="v-nav-avatar" title="Mon Profil">
      <i class="fas fa-user"></i>
    </a>
  `;

  if (user) {
    authSection = `
      <a href="../acheteur/index.html" class="v-btn v-btn-primary v-btn-sm" style="font-size:0.7rem; padding: 6px 12px;">
        <i class="fas fa-user-circle"></i> Espace Acheteur
      </a>
    `;
  }

  return `
  <header class="v-navbar" id="vNavbar">
    <div class="v-nav-wrap">
      <div class="v-nav-left">
        <a href="${pathPrefix}index.html" class="v-logo">Retro<span>Market</span></a>
        <a href="${pathPrefix}catalogue.html" class="v-nav-link ${activePage==='catalogue'?'active':''}">Catalogue</a>
        <a href="${pathPrefix}index.html#how-it-works" class="v-nav-link">Comment ça marche ?</a>
      </div>
      <div class="v-nav-right">
        <a href="${pathPrefix}panier.html" class="v-nav-icon" title="Panier">
          <i class="fas fa-shopping-bag"></i>
          <span class="v-badge-count v-cart-count ${cartCount>0?'show':''}">${cartCount}</span>
        </a>
        <a href="${pathPrefix}favoris.html" class="v-nav-icon" title="Favoris">
          <i class="fas fa-heart"></i>
          <span class="v-badge-count v-fav-count ${favCount>0?'show':''}">${favCount}</span>
        </a>
        <a href="${pathPrefix}activite.html" class="v-nav-icon" title="Activité Visiteur">
          <i class="fas fa-history"></i>
        </a>
        <span class="v-nav-sep"></span>
        ${authSection}
      </div>
    </div>
  </header>`;
}

// ── Footer Renderer ──
function renderVisitorFooter() {
  return `
  <footer class="v-footer">
    <div class="wrap" style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:40px;">
      <div style="max-width:300px;">
        <div class="v-flogo">Retro<span>Market</span></div>
        <p style="font-size:0.85rem; line-height:1.6;">La marketplace de référence pour la musique vintage. Achetez et vendez avec confiance.</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="font-weight:600; color:var(--ink); margin-bottom:8px;">Navigation</div>
        <a href="index.html">Accueil</a>
        <a href="catalogue.html">Catalogue</a>
        <a href="favoris.html">Favoris</a>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="font-weight:600; color:var(--ink); margin-bottom:8px;">Compte</div>
        <a href="../authentification/sign-in.html">Se connecter</a>
        <a href="../authentification/sign-up.html">S'inscrire</a>
      </div>
    </div>
    <div class="wrap" style="margin-top:40px; padding-top:20px; border-top:1px solid var(--biscuit); font-size:0.8rem; text-align:center;">
      © 2026 RetroMarket. Tous droits réservés.
    </div>
  </footer>`;
}

// ── Login Required Modal ──
function showLoginRequired(action) {
  let backdrop = document.getElementById('v-login-modal');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'v-login-modal';
    backdrop.className = 'v-modal-backdrop';
    backdrop.innerHTML = `
      <div class="v-modal">
        <i class="fas fa-lock" style="font-size:2.5rem; color:var(--honey); margin-bottom:16px;"></i>
        <h3 style="font-size:1.5rem; color:var(--ink); margin-bottom:10px;">Connexion requise</h3>
        <p id="v-login-msg" style="color:var(--muted); margin-bottom:24px;"></p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <a href="../authentification/sign-in.html" class="v-btn v-btn-primary">Se connecter</a>
          <a href="../authentification/sign-up.html" class="v-btn v-btn-secondary">S'inscrire</a>
        </div>
        <button onclick="document.getElementById('v-login-modal').classList.remove('open')"
          style="margin-top:18px; color:var(--muted); font-size:0.82rem; text-decoration:underline; cursor:pointer; background:none; border:none;">
          Continuer en tant que visiteur
        </button>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('open'); });
  }
  document.getElementById('v-login-msg').textContent =
    `Veuillez vous connecter pour ${action || 'effectuer cette action'}.`;
  backdrop.classList.add('open');
}

// ── Product Card HTML Builder ──
function buildVisitorProductCard(p) {
  const img = p.photo_principale ? `${window.API_BASE.replace('/api','/')}${p.photo_principale}` : '';
  const emojis = { 'Vinyle': '🎵', 'Cassette Audio': '📼', 'Instrument': '🎸', 'Poster': '🖼️', 'CD': '💿', 'VINYLE': '🎵', 'CASSETTE': '📼', 'INSTRUMENT': '🎸', 'POSTER': '🖼️' };
  const emoji = emojis[p.categorie_nom] || '🎵';
  const price = parseFloat(p.prix).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
  const isFav = VisitorSystem.isFav(p.id_produit);
  const inCart = VisitorSystem.isInCart(p.id_produit);
  const avgNote = p.avg_note ? parseFloat(p.avg_note) : 0;
  const starsStr = '★'.repeat(Math.round(avgNote)) + '☆'.repeat(5 - Math.round(avgNote));
  const reviewCountStr = p.review_count > 0 ? ` <span style="font-size:0.75rem; color:var(--muted)">(${p.review_count})</span>` : '';

  return `
  <div class="v-prod-card" data-id="${p.id_produit}">
    <div class="v-prod-thumb">
      ${img ? `<img src="${img}" alt="${p.titre}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
      <div class="v-prod-emoji" style="${img ? 'display:none' : 'display:flex'}">${emoji}</div>
      <span class="v-prod-badge ${p.rarete === 'RARE' || p.rarete === 'TRES_RARE' || p.rarete === 'COLLECTOR' ? 'rare' : 'new'}">
        ${p.rarete === 'COMMUN' ? 'Nouveau' : p.rarete.replace('_',' ')}
      </span>
      <button class="v-prod-heart ${isFav ? 'liked' : ''}"
        onclick="event.stopPropagation(); handleFavClick(this, ${p.id_produit}, '${p.titre.replace(/'/g,"\\'")}', ${p.prix}, '${img}')"
        title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
        ${isFav ? '♥' : '♡'}
      </button>
      <button class="v-prod-cart-btn ${inCart ? 'added' : ''}"
        onclick="event.stopPropagation(); handleCartClick(this, ${p.id_produit}, '${p.titre.replace(/'/g,"\\'")}', ${p.prix}, '${img}', '${(p.categorie_nom||'').replace(/'/g,"\\'")} · ${(p.etat||'').replace(/'/g,"\\'")}')"
        ${inCart ? 'disabled' : ''}>
        <i class="fas ${inCart ? 'fa-check' : 'fa-shopping-bag'}"></i>
        ${inCart ? 'Déjà ajouté' : 'Ajouter au panier'}
      </button>
    </div>
    <a href="product-details.html?id=${p.id_produit}" class="v-prod-info" style="display:block;">
      <div class="v-prod-meta">${p.categorie_nom || 'Produit'} · ${p.etat || 'Occasion'}</div>
      <div class="v-prod-name">${p.titre}</div>
      <div class="v-prod-footer">
        <span class="v-prod-price">${price}</span>
        <span class="v-prod-stars" style="color:var(--honey); font-size:0.85rem;">${starsStr}${reviewCountStr}</span>
      </div>
    </a>
  </div>`;
}

// ── Global Click Handlers ──
function handleFavClick(btn, id, name, price, image) {
  const added = VisitorSystem.toggleFav({ id, name, price, image });
  btn.classList.toggle('liked', added);
  btn.innerHTML = added ? '♥' : '♡';
}

function handleCartClick(btn, id, name, price, image, meta) {
  const ok = VisitorSystem.addToCart({ id, name, price, image, meta });
  if (ok) {
    btn.classList.add('added');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-check"></i> Déjà ajouté';
  }
}

// ── Init on DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', () => {
  // Scroll effect on navbar
  const navbar = document.getElementById('vNavbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Update badges
  VisitorSystem.updateCartBadge();
  VisitorSystem.updateFavBadge();
});
