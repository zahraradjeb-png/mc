/* ── globals ── */
if (typeof window.API_BASE === 'undefined') { window.API_BASE = 'http://127.0.0.1:8000/api'; }
const API_BASE = window.API_BASE;

const GoldAuth = {
  getUser()  { try { return JSON.parse(localStorage.getItem('gold_user')); } catch { return null; } },
  setUser(u) { localStorage.setItem('gold_user', JSON.stringify(u)); },
  logout()   { 
    localStorage.removeItem('gold_user'); 
    localStorage.removeItem('gold_cart'); // On vide aussi le panier au logout pour la sécurité
    window.location.href = _root() + 'index.html'; 
  },
  isLoggedIn(){ return !!this.getUser(); },
  isBuyer()  { const u=this.getUser(); return u?.role==='ACHETEUR'; },
  isSeller() { const u=this.getUser(); return u?.role==='VENDEUR' || u?.role==='ADMIN'; },
  isAdmin()  { const u=this.getUser(); return u?.role==='ADMIN'; },
  
  getCatalogueUrl() {
    return this.isLoggedIn() ? 'catalogue.html' : 'catalogue-visiteur.html';
  },
  
  /* CART LOGIC */
  getCart()  { try { return JSON.parse(localStorage.getItem('gold_cart'))||[]; } catch { return []; } },
  saveCart(c){ localStorage.setItem('gold_cart', JSON.stringify(c)); updateCartBadges(); },
  
  getCartCount() {
    const cart = this.getCart();
    // On compte simplement le nombre de lignes pour éviter les "2" bizarres
    return cart.length;
  },

  async syncCartFromServer() {
    const user = this.getUser();
    if (!user || !this.isBuyer()) return;
    const buyerId = user.id_user || user.id;

    // 1. D'abord, on vérifie si on a des produits locaux à envoyer (Fusion)
    const localItems = this.getCart();
    if (localItems.length > 0) {
      for (const item of localItems) {
        try {
          await fetch(`${API_BASE}/panier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_acheteur: buyerId,
              id_produit: item.id,
              prix_unitaire: item.price,
              quantite: item.qty || 1,
              action: 'set'
            })
          });
        } catch (e) { console.warn("Merge error for item", item.id, e); }
      }
    }

    // 2. Maintenant, on récupère l'état global du serveur
    try {
      const res = await fetch(`${API_BASE}/panier/${buyerId}`);
      if (!res.ok) return;
      const data = await res.json();
      const simplified = data.map(item => ({
        id: item.id_produit,
        name: item.titre,
        price: parseFloat(item.prix_unitaire),
        qty: item.quantite,
        image: item.photo ? (API_BASE.replace('/api','') + '/' + item.photo) : null
      }));
      this.saveCart(simplified);
    } catch (e) { console.warn("Sync error", e); }
  },

  async addToCart(prod) {
    const id = String(prod.id);
    const cart = this.getCart();
    
    // Si déjà là, on ne fait rien (simulation simple)
    if (cart.find(i => String(i.id) === id)) {
       showToast('Déjà dans le panier', 'info');
       return true;
    }

    const newItem = { id, name: prod.name, price: prod.price, qty: 1, image: prod.image, meta: prod.meta };
    cart.push(newItem);
    this.saveCart(cart);

    // Si Acheteur, on envoie AU SERVEUR en plus
    const user = this.getUser();
    if (user && (user.role === 'ACHETEUR' || user.role === 'ADMIN')) {
      const bId = user.id_user || user.id;
      if (bId) {
        try {
          const res = await fetch(`${API_BASE}/panier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_acheteur: bId,
              id_produit: id,
              prix_unitaire: prod.price,
              quantite: 1
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error("Erreur Serveur Panier:", res.status, errData);
          } else {
            console.log("Panier synchronisé avec succès pour l'ID:", bId);
          }
        } catch (e) { 
          console.error("Erreur réseau Panier:", e); 
        }
      }
    }

    showToast('Ajouté au panier !');
    return true;
  },

  async removeFromCart(id) {
    const cart = this.getCart().filter(i => String(i.id) !== String(id));
    this.saveCart(cart);

    const user = this.getUser();
    if (user && this.isBuyer()) {
      try {
        await fetch(`${API_BASE}/panier/ligne/user/${user.id_user || user.id}/${id}`, { method: 'DELETE' });
      } catch (e) { console.error("Server remove error", e); }
    }
  },

  async clearCart() {
    this.saveCart([]);
    const user = this.getUser();
    if (user && this.isBuyer()) {
      try { await fetch(`${API_BASE}/panier/clear/${user.id_user || user.id}`, { method: 'DELETE' }); }
      catch (e) { console.error(e); }
    }
  },

  /* FAVORITES */
  getFavs() { try { return JSON.parse(localStorage.getItem('gold_favs'))||[]; } catch { return []; } },
  isFav(id) { return this.getFavs().includes(String(id)); },
  toggleFav(id) {
    let f = this.getFavs();
    const idx = f.indexOf(String(id));
    if (idx > -1) f.splice(idx, 1); else f.push(String(id));
    localStorage.setItem('gold_favs', JSON.stringify(f));
    return idx === -1;
  },

  renderStars(n) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }
};

function updateCartBadges() {
  const count = GoldAuth.getCartCount();
  document.querySelectorAll('.cbadge, #cBadge, .cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function _root() {
  const p = window.location.pathname;
  if (p.includes('/seller/') || p.includes('/acheteur/') || p.includes('/admin/')) return '../';
  return '';
}

function showToast(msg, type='ok') {
  const t = document.getElementById('toast') || document.getElementById('gold-toast');
  if (t) {
    const msgEl = document.getElementById('tmsg') || t.querySelector('span') || t;
    msgEl.textContent = msg;
    t.classList.add('show');
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    
    setTimeout(() => {
      t.classList.remove('show');
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(100px)';
    }, 3000);
  } else {
    console.log("Toast:", msg);
  }
}