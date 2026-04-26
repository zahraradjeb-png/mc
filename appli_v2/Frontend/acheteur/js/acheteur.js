/* ══════════════════════════════════════
   acheteur JS — Shared Module
   Navbar, Cart, Favs, Activity, Toast
══════════════════════════════════════ */

// ── API Base (always points to Laravel backend) ──
window.API_BASE = 'http://127.0.0.1:8000/api';

// ── acheteur ID (persistent UUID in localStorage) ──
// ── acheteur ID (persistent UUID in localStorage) ──
const acheteurSystem = {
  getacheteurId() {
    let id = localStorage.getItem('acheteur_uuid');
    if (!id) {
      id = 'v_' + crypto.randomUUID();
      localStorage.setItem('acheteur_uuid', id);
    }
    return id;
  },

  // ── CART (Synced with Backend if logged in) ──
  getCart() { try { return JSON.parse(localStorage.getItem('gold_cart')) || []; } catch { return []; } },
  saveCart(c) { localStorage.setItem('gold_cart', JSON.stringify(c)); this.updateCartBadge(); },
  getCartCount() { return this.getCart().length; },
  isInCart(id) { return this.getCart().some(i => String(i.id) === String(id)); },

  async addToCart(product) {
    const cart = this.getCart();
    const id = String(product.id || product.id_produit);
    if (cart.find(i => String(i.id) === id)) {
      acheteurToast.show('Déjà dans le panier', 'info');
      return false;
    }
    
    const newItem = {
      id: id,
      name: product.name || product.titre,
      price: parseFloat(product.price || product.prix),
      image: product.image || product.photo || '',
      meta: product.meta || '',
      qty: 1,
      addedAt: new Date().toISOString()
    };
    
    cart.push(newItem);
    this.saveCart(cart);
    this.logActivity('cart_add', `Ajouté au panier : ${newItem.name}`, id);

    // Backend Sync
    const user = JSON.parse(localStorage.getItem('gold_user') || 'null');
    if (user) {
      const userId = user.id_user || user.id;
      try {
        await fetch(`${window.API_BASE}/panier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_acheteur: userId,
            id_produit: id,
            prix_unitaire: newItem.price,
            quantite: 1
          })
        });
      } catch (e) { console.error('Cart sync error:', e); }
    }

    acheteurToast.show('Ajouté au panier !');
    return true;
  },

  async removeFromCart(id) {
    const cart = this.getCart().filter(i => String(i.id) !== String(id));
    this.saveCart(cart);

    const user = JSON.parse(localStorage.getItem('gold_user') || 'null');
    if (user) {
      const userId = user.id_user || user.id;
      try {
        await fetch(`${window.API_BASE}/panier/ligne/user/${userId}/${id}`, { method: 'DELETE' });
      } catch (e) { console.error('Cart remove error:', e); }
    }

    acheteurToast.show('Retiré du panier');
  },

  async clearCart() {
    this.saveCart([]);
    const user = JSON.parse(localStorage.getItem('gold_user') || 'null');
    if (user) {
      const userId = user.id_user || user.id;
      try { await fetch(`${window.API_BASE}/panier/clear/${userId}`, { method: 'DELETE' }); } catch (e) {}
    }
  },

  updateCartBadge() {
    const count = this.getCartCount();
    document.querySelectorAll('.v-cart-count, .cbadge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ── FAVORITES (Synced with Backend) ──
  getFavs() { try { return JSON.parse(localStorage.getItem('gold_favs')) || []; } catch { return []; } },
  saveFavs(f) { localStorage.setItem('gold_favs', JSON.stringify(f)); this.updateFavBadge(); },
  isFav(id) { 
    const favs = this.getFavs();
    return favs.includes(String(id)); 
  },

  async toggleFav(product) {
    const id = String(product.id || product.id_produit);
    let favs = this.getFavs();
    const idx = favs.indexOf(id);
    
    let isAdded = false;
    if (idx > -1) {
      favs.splice(idx, 1);
      this.logActivity('fav_remove', `Retiré des favoris : ${product.name || product.titre}`, id);
      acheteurToast.show('Retiré des favoris');
    } else {
      favs.push(id);
      isAdded = true;
      this.logActivity('fav_add', `Ajouté aux favoris : ${product.name || product.titre}`, id);
      acheteurToast.show('Ajouté aux favoris ♥');
    }
    
    this.saveFavs(favs);

    // Backend Sync
    const user = JSON.parse(localStorage.getItem('gold_user') || 'null');
    if (user) {
      const userId = user.id_user || user.id;
      try {
        await fetch(`${window.API_BASE}/acheteurs/${userId}/favoris`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_produit: id })
        });
      } catch (e) { console.error('Fav sync error:', e); }
    }
    
    return isAdded;
  },

  updateFavBadge() {
    const count = this.getFavs().length;
    document.querySelectorAll('.v-fav-count, .fbadge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ── ACTIVITY LOG ──
  logActivity(type, label, productId) {
    // 1. Save locally (Always, for fallback/visitor)
    const activities = this.getActivities();
    activities.unshift({
      type, label, id_produit: productId,
      date: new Date().toISOString()
    });
    localStorage.setItem('acheteur_activities', JSON.stringify(activities.slice(0, 200)));

    // 2. Send to backend if logged in
    const user = JSON.parse(localStorage.getItem('gold_user') || 'null');
    if (user) {
      const userId = user.id_user || user.id;
      fetch(`${window.API_BASE}/activities_log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type: type,
          description: label
        })
      }).catch(e => console.warn('Backend activity log error:', e));
    }
  },

  getActivities() {
    try { return JSON.parse(localStorage.getItem('acheteur_activities')) || []; }
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
const acheteurToast = {
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
function renderacheteurNavbar(activePage) {
  const pathPrefix = '';
  const cartCount = acheteurSystem.getCartCount();
  const favCount = acheteurSystem.getFavs().length;
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('gold_user')) || {};

  // Role switching logic
  window.switchRoleSeller = function() {
    const u = JSON.parse(localStorage.getItem('gold_user')) || {};
    if (u.role === 'BOTH' || u.role === 'VENDEUR') {
      window.location.href = '../seller/dashboard.html';
    } else {
      showBecomeSellerPopup();
    }
  };

  function showBecomeSellerPopup() {
    // Create Modal if not exists
    let modal = document.getElementById('v-seller-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'v-seller-modal';
      modal.className = 'v-modal';
      modal.innerHTML = `
        <div class="v-modal-content">
          <div class="v-modal-header">
            <h3><i class="fas fa-store"></i> Devenir Vendeur</h3>
            <button onclick="document.getElementById('v-seller-modal').classList.remove('show')">&times;</button>
          </div>
          <div class="v-modal-body">
            <p style="margin-bottom:20px; font-size:0.9rem; color:var(--muted);">Parlez-nous un peu de votre future boutique pour commencer à vendre vos pépites vintage.</p>
            <div class="v-form-group">
              <label>Nom de la boutique *</label>
              <input type="text" id="seller-shop-name" placeholder="Ex: Ma Boutique Vintage">
            </div>
            <div class="v-form-group">
              <label>Description *</label>
              <textarea id="seller-description" placeholder="Que vendez-vous ?"></textarea>
            </div>
            <div class="v-form-group">
              <label>Catégories principales *</label>
              <input type="text" id="seller-categories" placeholder="Ex: Vinyles, Cassettes, Posters">
            </div>
            <div class="v-form-group">
              <label>Localisation *</label>
              <input type="text" id="seller-address" placeholder="Ville, Pays">
            </div>
            <button class="v-btn v-btn-primary" style="width:100%; margin-top:10px;" onclick="submitBecomeSeller()">
              <i class="fas fa-check"></i> Activer mon profil vendeur
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('show');
  }

  window.submitBecomeSeller = async function() {
    const u = JSON.parse(localStorage.getItem('gold_user')) || {};
    const shopName = document.getElementById('seller-shop-name').value.trim();
    const desc = document.getElementById('seller-description').value.trim();
    const cats = document.getElementById('seller-categories').value.trim();
    const addr = document.getElementById('seller-address').value.trim();

    if (!shopName || !desc || !cats || !addr) {
      acheteurToast.show('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    try {
      const res = await fetch(`${window.API_BASE}/become-seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: u.id_user || u.id,
          shop_name: shopName,
          description: desc,
          categories: cats,
          address: addr
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update local user role
        u.role = 'BOTH';
        localStorage.setItem('gold_user', JSON.stringify(u));
        
        acheteurToast.show('Profil vendeur activé ! Redirection...');
        setTimeout(() => {
          window.location.href = '../seller/dashboard.html';
        }, 2000);
      } else {
        acheteurToast.show(data.message || 'Erreur lors de l\'activation', 'error');
      }
    } catch (e) {
      acheteurToast.show('Erreur de connexion', 'error');
    }
  };

  return `
  <header class="v-navbar" id="vNavbar">
    <div class="v-nav-wrap">
      <div class="v-nav-left">
        <a href="${pathPrefix}index.html" class="v-logo">Retro<span>Market</span></a>
        <a href="${pathPrefix}catalogue.html" class="v-nav-link ${activePage==='catalogue'?'active':''}">Catalogue</a>
        <a href="${pathPrefix}index.html#how-it-works" class="v-nav-link">Comment ça marche ?</a>
      </div>
      <div class="v-nav-right">
        <a href="${pathPrefix}notifications.html" class="v-nav-icon" title="Notifications">
          <i class="fas fa-bell"></i>
          <span class="v-badge-count v-notif-count" style="display:none;">0</span>
        </a>
        <a href="${pathPrefix}commandes.html" class="v-nav-icon" title="Mes Commandes">
          <i class="fas fa-box"></i>
        </a>
        <a href="${pathPrefix}panier.html" class="v-nav-icon" title="Panier">
          <i class="fas fa-shopping-bag"></i>
          <span class="v-badge-count v-cart-count ${cartCount>0?'show':''}">${cartCount}</span>
        </a>
        <a href="${pathPrefix}favoris.html" class="v-nav-icon" title="Favoris">
          <i class="fas fa-heart"></i>
          <span class="v-badge-count v-fav-count ${favCount>0?'show':''}">${favCount}</span>
        </a>
        <a href="${pathPrefix}activite.html" class="v-nav-icon" title="Activité">
          <i class="fas fa-history"></i>
        </a>
        <a href="${pathPrefix}profile.html" class="v-nav-avatar" title="Mon Profil">
          <i class="fas fa-user"></i>
        </a>
        <button onclick="window.switchRoleSeller()" class="v-btn" style="background:var(--honey);color:#111;padding:6px 12px;font-size:0.8rem;border:none;border-radius:4px;cursor:pointer;margin-left:10px;">
          <i class="fas fa-sync-alt"></i> Switch Vendeur
        </button>
      </div>
    </div>
  </header>`;
}

function updateAcheteurJsAuthKeys() {} // Dummy to remove the previous mistake if needed, or just leave it

// ── Footer Renderer ──
function renderacheteurFooter() {
  return `
  <footer class="v-footer">
    <div class="wrap" style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:40px;">
      <div style="max-width:300px;">
        <div class="v-flogo">Retro<span>Market</span></div>
        <p style="font-size:0.85rem; line-height:1.6;">La marketplace de référence pour la musique vintage. Achetez et vendez avec confiance.</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="font-weight:600; color:var(--ink); margin-bottom:8px;">Navigation</div>
        <a href="../index.html">Accueil Principal</a>
        <a href="index.html">Mon Espace</a>
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
function buildacheteurProductCard(p) {
  const img = p.photo_principale ? `${window.API_BASE.replace('/api','/')}${p.photo_principale}` : '';
  const emojis = { 'Vinyle': '🎵', 'Cassette Audio': '📼', 'Instrument': '🎸', 'Poster': '🖼️', 'CD': '💿', 'VINYLE': '🎵', 'CASSETTE': '📼', 'INSTRUMENT': '🎸', 'POSTER': '🖼️' };
  const emoji = emojis[p.categorie_nom] || '🎵';
  const price = parseFloat(p.prix).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
  const isFav = acheteurSystem.isFav(p.id_produit);
  const inCart = acheteurSystem.isInCart(p.id_produit);
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
  const added = acheteurSystem.toggleFav({ id, name, price, image });
  btn.classList.toggle('liked', added);
  btn.innerHTML = added ? '♥' : '♡';
}

function handleCartClick(btn, id, name, price, image, meta) {
  const ok = acheteurSystem.addToCart({ id, name, price, image, meta });
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
  acheteurSystem.updateCartBadge();
  acheteurSystem.updateFavBadge();
});

// ── Switch Vendeur ──
window.switchRoleSeller = function() {
  const user = JSON.parse(localStorage.getItem('gold_user'));
  if (!user) {
    showLoginRequired('devenir vendeur');
    return;
  }
  if (user.role === 'VENDEUR' || user.role === 'BOTH') {
    // Redirection directe vers dashboard vendeur
    window.location.href = '../seller/dashboard.html';
    return;
  }

  // CAS 1: N'est pas vendeur -> Afficher POPUP
  let popup = document.getElementById('v-become-seller-modal');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'v-become-seller-modal';
    popup.className = 'v-modal-backdrop';
    popup.innerHTML = `
      <div class="v-modal" style="text-align:left; max-width:450px;">
        <h3 style="font-size:1.5rem; color:var(--ink); margin-bottom:15px; text-align:center;">Devenir Vendeur</h3>
        <p style="color:var(--muted); margin-bottom:20px; font-size:0.9rem; text-align:center;">Ouvrez votre boutique en quelques secondes.</p>
        <form id="become-seller-form">
          <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--ink);">Nom de la boutique</label>
            <input type="text" id="bs-shop-name" required style="width:100%; padding:10px; border:1px solid var(--biscuit); border-radius:6px; background:var(--ink2); color:var(--ink);">
          </div>
          <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--ink);">Catégories (ex: Vinyles, CDs)</label>
            <input type="text" id="bs-categories" style="width:100%; padding:10px; border:1px solid var(--biscuit); border-radius:6px; background:var(--ink2); color:var(--ink);">
          </div>
          <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--ink);">Adresse</label>
            <input type="text" id="bs-address" style="width:100%; padding:10px; border:1px solid var(--biscuit); border-radius:6px; background:var(--ink2); color:var(--ink);">
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--ink);">Description</label>
            <textarea id="bs-description" rows="3" style="width:100%; padding:10px; border:1px solid var(--biscuit); border-radius:6px; background:var(--ink2); color:var(--ink);"></textarea>
          </div>
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" onclick="document.getElementById('v-become-seller-modal').classList.remove('open')" style="padding:10px 20px; border:none; background:transparent; color:var(--muted); cursor:pointer;">Annuler</button>
            <button type="submit" style="padding:10px 20px; border:none; background:var(--honey); color:#111; border-radius:6px; font-weight:600; cursor:pointer;">Confirmer</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(popup);
    
    popup.addEventListener('click', e => { if (e.target === popup) popup.classList.remove('open'); });
    
    document.getElementById('become-seller-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        user_id: user.id,
        shop_name: document.getElementById('bs-shop-name').value,
        categories: document.getElementById('bs-categories').value,
        address: document.getElementById('bs-address').value,
        description: document.getElementById('bs-description').value
      };
      
      try {
        const res = await fetch(`${window.API_BASE}/become-seller`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          user.role = data.role || 'BOTH';
          localStorage.setItem('gold_user', JSON.stringify(user));
          acheteurToast.show('Félicitations ! Vous êtes vendeur.');
          setTimeout(() => window.location.href = '../seller/dashboard.html', 1500);
        } else {
          acheteurToast.show(data.message || 'Erreur', 'error');
        }
      } catch (err) {
        acheteurToast.show('Erreur de connexion', 'error');
      }
    });
  }
  popup.classList.add('open');
};
