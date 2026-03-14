/* ═══════════════════════════════════════════════════════════
   GOLD — auth-system.js  (moteur central)
   Gestion : auth, panier, favoris, navbar dynamique
═══════════════════════════════════════════════════════════ */

/* ── helpers localStorage ── */
const GoldAuth = {
  getUser()  { try { return JSON.parse(localStorage.getItem('gold_user')); } catch { return null; } },
  setUser(u) { localStorage.setItem('gold_user', JSON.stringify(u)); },
  logout()   { localStorage.removeItem('gold_user'); window.location.href = _root() + 'index.html'; },
  isLoggedIn(){ return !!this.getUser(); },
  isBuyer()  { const u=this.getUser(); return u?.role==='buyer'; },
  isSeller() { const u=this.getUser(); return u?.role==='seller'; },

  /* Cart */
  getCart()  { try { return JSON.parse(localStorage.getItem('gold_cart'))||[]; } catch { return []; } },
  saveCart(c){ localStorage.setItem('gold_cart', JSON.stringify(c)); },
  addToCart(prod) {
    if (!this.isLoggedIn()) return false;
    const cart = this.getCart();
    const ex = cart.find(i=>i.id===prod.id);
    if (ex) ex.qty = (ex.qty||1)+1;
    else cart.push({...prod, qty:1});
    this.saveCart(cart);
    return true;
  },
  getCartCount() { return this.getCart().reduce((s,i)=>s+(i.qty||1),0); },
  removeFromCart(id) { this.saveCart(this.getCart().filter(i=>i.id!==id)); },
  clearCart() { localStorage.removeItem('gold_cart'); },

  /* Favorites */
  getFavs()  { try { return JSON.parse(localStorage.getItem('gold_favs'))||[]; } catch { return []; } },
  isFav(id)  { return this.getFavs().includes(id); },
  toggleFav(id) {
    const f=this.getFavs(), i=f.indexOf(id);
    if(i>-1) f.splice(i,1); else f.push(id);
    localStorage.setItem('gold_favs', JSON.stringify(f));
    return i===-1;
  }
};

/* ── root path helper (works from subfolders like /Vendeur/) ── */
function _root() {
  const p = window.location.pathname;
  if (p.includes('/Vendeur/') || p.includes('/admin/')) return '../';
  return '';
}

/* ── Toast notification ── */
function showToast(msg, type='ok') {
  let t = document.getElementById('gold-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'gold-toast';
    t.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(20px);
      background:#1c0f07; color:#F5E2CE; padding:13px 22px;
      border-radius:10px; font-size:.87rem; z-index:99999;
      display:flex; align-items:center; gap:10px;
      box-shadow:0 8px 32px rgba(28,15,7,0.3);
      border:1px solid rgba(229,166,87,0.2);
      opacity:0; transition:all 0.3s ease;
      white-space:nowrap; max-width:90vw;
    `;
    document.body.appendChild(t);
  }
  const icons = {ok:'✓', warn:'⚠', error:'✕', info:'ℹ'};
  const colors = {ok:'#16a34a', warn:'#E5A657', error:'#B53324', info:'#E5A657'};
  t.innerHTML = `<span style="color:${colors[type]||colors.ok};font-size:1rem">${icons[type]||icons.ok}</span> ${msg}`;
  t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; }, 3200);
}

/* ── Modal "connexion requise" ── */
function requireLogin(action='effectuer cette action') {
  const root = _root();
  const existing = document.getElementById('gold-login-modal');
  if (existing) existing.remove();
  const m = document.createElement('div');
  m.id = 'gold-login-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(28,15,7,0.75);backdrop-filter:blur(6px);animation:gFadeIn .2s ease';
  m.innerHTML = `
    <style>@keyframes gFadeIn{from{opacity:0}to{opacity:1}} @keyframes gSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}</style>
    <div style="background:#F5E2CE;border-radius:18px;padding:44px 48px;max-width:420px;width:92%;text-align:center;position:relative;animation:gSlideUp .25s ease;border:1px solid rgba(181,51,36,0.12);box-shadow:0 28px 80px rgba(28,15,7,0.25)">
      <button onclick="document.getElementById('gold-login-modal').remove()" style="position:absolute;top:14px;right:18px;font-size:1.5rem;color:#8a6a50;background:none;border:none;cursor:pointer;line-height:1">&times;</button>
      <div style="font-size:2.8rem;margin-bottom:14px">🔐</div>
      <h3 style="font-family:'Cormorant',serif;font-size:1.7rem;color:#1c0f07;margin-bottom:8px">Connexion requise</h3>
      <p style="font-size:.87rem;color:#8a6a50;margin-bottom:28px;line-height:1.65">Vous devez être connecté pour ${action}.<br>Rejoignez la communauté Gold gratuitement !</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="${root}login.html" style="padding:12px 26px;background:linear-gradient(135deg,#B53324,#8a2419);color:white;border-radius:8px;font-size:.88rem;font-weight:500;text-decoration:none">Se connecter</a>
        <a href="${root}register.html" style="padding:12px 26px;border:1.5px solid #B53324;color:#B53324;border-radius:8px;font-size:.88rem;font-weight:500;text-decoration:none">S'inscrire</a>
      </div>
    </div>`;
  m.addEventListener('click', e=>{ if(e.target===m) m.remove(); });
  document.body.appendChild(m);
}

/* ── Update cart badge everywhere ── */
function updateCartBadges() {
  const count = GoldAuth.getCartCount();
  document.querySelectorAll('.cbadge, #cBadge, .cart-badge').forEach(b=>{
    b.textContent = count;
    b.style.display = count > 0 ? '' : 'none';
  });
}

/* ══════════════════════════════════════════════════════
   SELLER PROFILE DRAWER
══════════════════════════════════════════════════════ */
function buildSellerDrawer(user, root) {
  const existing = document.getElementById('gold-seller-drawer');
  if (existing) existing.remove();
  const backdrop = document.getElementById('gold-seller-drawer-backdrop');
  if (backdrop) backdrop.remove();

  const initials = (user.firstName||'V')[0].toUpperCase() + ((user.lastName||'')[0]||'').toUpperCase();
  const displayName = user.shopName || user.firstName || 'Ma boutique';

  /* Inject styles once */
  if (!document.getElementById('gold-drawer-styles')) {
    const s = document.createElement('style');
    s.id = 'gold-drawer-styles';
    s.textContent = `
      #gold-seller-drawer-backdrop {
        position:fixed;inset:0;z-index:9998;
        background:rgba(15,7,2,.55);
        backdrop-filter:blur(4px);
        opacity:0;transition:opacity .3s ease;
      }
      #gold-seller-drawer-backdrop.open { opacity:1; }

      #gold-seller-drawer {
        position:fixed;top:0;right:0;bottom:0;
        width:320px;max-width:92vw;
        background:#1c0f07;
        border-left:1px solid rgba(229,166,87,.18);
        z-index:9999;
        display:flex;flex-direction:column;
        transform:translateX(100%);
        transition:transform .35s cubic-bezier(.22,1,.36,1);
        box-shadow:-20px 0 60px rgba(0,0,0,.5);
      }
      #gold-seller-drawer.open { transform:translateX(0); }

      .gsd-header {
        padding:24px 22px 20px;
        border-bottom:1px solid rgba(229,166,87,.12);
        display:flex;align-items:center;gap:14px;position:relative;
      }
      .gsd-av {
        width:48px;height:48px;border-radius:50%;flex-shrink:0;
        background:linear-gradient(135deg,#E5A657,#c07d30);
        display:flex;align-items:center;justify-content:center;
        font-size:.9rem;font-weight:700;color:#1c0f07;
      }
      .gsd-name {
        font-family:'Cormorant',serif;font-size:1.15rem;
        color:#F5E2CE;font-weight:600;line-height:1.2;
      }
      .gsd-role {
        font-size:.68rem;color:#E5A657;letter-spacing:.08em;
        text-transform:uppercase;margin-top:2px;
        font-family:'Jost',sans-serif;
      }
      .gsd-close {
        position:absolute;top:16px;right:16px;
        width:30px;height:30px;border-radius:50%;
        background:rgba(245,226,206,.07);border:none;
        color:rgba(245,226,206,.5);font-size:1rem;
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background .2s;
      }
      .gsd-close:hover { background:rgba(181,51,36,.2);color:#fff; }

      .gsd-section-label {
        font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;
        color:rgba(229,166,87,.4);font-family:'Jost',sans-serif;
        padding:18px 22px 6px;
      }

      .gsd-link {
        display:flex;align-items:center;gap:13px;
        padding:13px 22px;
        color:rgba(245,226,206,.8);
        font-family:'Jost',sans-serif;font-size:.88rem;font-weight:300;
        text-decoration:none;transition:background .15s,color .15s;
        border-left:2px solid transparent;
      }
      .gsd-link:hover {
        background:rgba(229,166,87,.07);
        color:#E5A657;
        border-left-color:rgba(229,166,87,.4);
      }
      .gsd-link i {
        width:18px;text-align:center;
        color:#E5A657;opacity:.7;font-size:.85rem;
        flex-shrink:0;
      }
      .gsd-link:hover i { opacity:1; }

      .gsd-sep {
        height:1px;background:rgba(229,166,87,.1);
        margin:8px 22px;
      }

      .gsd-logout {
        display:flex;align-items:center;gap:13px;
        padding:13px 22px;margin-top:auto;
        color:rgba(181,51,36,.8);
        font-family:'Jost',sans-serif;font-size:.88rem;
        text-decoration:none;cursor:pointer;
        background:none;border:none;width:100%;text-align:left;
        border-top:1px solid rgba(229,166,87,.1);
        transition:background .15s,color .15s;
      }
      .gsd-logout:hover { background:rgba(181,51,36,.08);color:#B53324; }
      .gsd-logout i { width:18px;text-align:center;font-size:.85rem;flex-shrink:0; }

      .gsd-body { flex:1;overflow-y:auto; }
    `;
    document.head.appendChild(s);
  }

  /* Backdrop */
  const bd = document.createElement('div');
  bd.id = 'gold-seller-drawer-backdrop';
  document.body.appendChild(bd);

  /* Drawer */
  const drawer = document.createElement('div');
  drawer.id = 'gold-seller-drawer';
  drawer.innerHTML = `
    <div class="gsd-header">
      <div class="gsd-av">${initials}</div>
      <div>
        <div class="gsd-name">${displayName}</div>
        <div class="gsd-role"><i class="fas fa-star" style="font-size:.55rem;margin-right:4px"></i>Vendeur</div>
      </div>
      <button class="gsd-close" id="gsdClose"><i class="fas fa-times"></i></button>
    </div>

    <div class="gsd-body">
      <div class="gsd-section-label">Gestion</div>
      <a href="${root}Vendeur/orders.html"       class="gsd-link"><i class="fas fa-shopping-bag"></i> Mes commandes</a>
      <a href="${root}Vendeur/dashboard.html"    class="gsd-link"><i class="fas fa-store"></i> Ma boutique</a>
      <a href="${root}Vendeur/add-product.html"  class="gsd-link"><i class="fas fa-plus-circle"></i> Ajouter un produit</a>
      <a href="${root}Vendeur/reviews.html"      class="gsd-link"><i class="fas fa-star"></i> Avis clients</a>

      <div class="gsd-sep"></div>
      <div class="gsd-section-label">Compte</div>
      <a href="${root}Vendeur/dashboard.html"   class="gsd-link"><i class="fas fa-chart-line"></i> Tableau de bord</a>
      <a href="${root}Vendeur/settings.html"    class="gsd-link"><i class="fas fa-user-cog"></i> Paramètres</a>
    </div>

    <button class="gsd-logout" id="gsdLogout">
      <i class="fas fa-sign-out-alt"></i> Se déconnecter
    </button>
  `;
  document.body.appendChild(drawer);

  /* Open with animation */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bd.classList.add('open');
      drawer.classList.add('open');
    });
  });

  /* Close handlers */
  function closeDrawer() {
    bd.classList.remove('open');
    drawer.classList.remove('open');
    setTimeout(() => { bd.remove(); drawer.remove(); }, 360);
  }

  document.getElementById('gsdClose')?.addEventListener('click', closeDrawer);
  bd.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closeDrawer(); document.removeEventListener('keydown', esc); }
  });
  document.getElementById('gsdLogout')?.addEventListener('click', () => GoldAuth.logout());
}

/* ══════════════════════════════════════════════════════
   NAVBAR BUILDER
══════════════════════════════════════════════════════ */
function buildNavbar(active='home') {
  const user = GoldAuth.getUser();
  const root = _root();
  const count = GoldAuth.getCartCount();
  const badge = `<span class="cbadge" id="cBadge" ${count===0?'style="display:none"':''}>${count}</span>`;
  const initials = user ? (user.firstName||'U')[0].toUpperCase() + ((user.lastName||'')[0]||'').toUpperCase() : '';
  const displayName = user?.role==='seller' ? (user.shopName || user.firstName) : user?.firstName;

  /* ─ Catalogue dropdown ─ */
  const catDrop = `
    <div class="nd">
      <a href="${root}catalogue.html" class="nl ${active==='catalogue'?'active':''}">Catalogue <i class="fas fa-chevron-down" style="font-size:.45rem;opacity:.5;margin-left:3px"></i></a>
      <div class="drop">
        <a href="${root}catalogue.html?cat=vinyles"><i class="fas fa-record-vinyl"></i> Vinyles</a>
        <a href="${root}catalogue.html?cat=cassettes"><i class="fas fa-tape"></i> Cassettes</a>
        <a href="${root}catalogue.html?cat=instruments"><i class="fas fa-guitar"></i> Instruments</a>
        <a href="${root}catalogue.html?cat=posters"><i class="fas fa-image"></i> Posters & Art</a>
        <a href="${root}catalogue.html?cat=electronique"><i class="fas fa-plug"></i> Électronique</a>
        <a href="${root}catalogue.html?cat=cd"><i class="fas fa-compact-disc"></i> CDs</a>
        <div class="dd"></div>
        <a href="${root}catalogue.html?rare=1"><i class="fas fa-gem"></i> Éditions rares</a>
      </div>
    </div>`;

  /* ─ Nav middle ─ */
  const navMid = `
    <nav class="nav-mid">
      <a href="${root}index.html" class="nl ${active==='home'?'active':''}">Accueil</a>
      ${catDrop}
      <a href="${root}index.html#how" class="nl">Comment ça marche</a>
    </nav>`;

  /* ─ Right side by role ─ */
  let navR = '';

  if (!user) {
    navR = `
      <div class="nav-r">
        <button class="ni search-trigger" aria-label="Recherche"><i class="fas fa-search"></i></button>
        <div class="nsep"></div>
        <a href="${root}login.html" class="ntxt">Connexion</a>
        <a href="${root}register.html" class="nbtn">S'inscrire</a>
        <a href="${root}register.html?role=seller" class="nsell">Vendre <i class="fas fa-store"></i></a>
        <button class="hamburger" id="hbg"><span></span><span></span><span></span></button>
      </div>`;

  } else if (user.role === 'buyer') {
    navR = `
      <div class="nav-r">
        <button class="ni search-trigger"><i class="fas fa-search"></i></button>
        <a href="${root}cart.html" class="ni cart-icon" style="position:relative">
          <i class="fas fa-shopping-bag"></i>${badge}
        </a>
        <div class="nsep"></div>
        <div class="nd gold-profile-dd">
          <button class="gold-profile-btn">
            <div class="gold-av">${initials}</div>
            <span class="gold-uname">${displayName||'Mon compte'}</span>
            <i class="fas fa-chevron-down" style="font-size:.42rem;opacity:.5;margin-left:4px"></i>
          </button>
          <div class="drop gold-drop-profile">
            <a href="${root}profile.html"><i class="fas fa-user"></i> Mon profil</a>
            <a href="${root}cart.html"><i class="fas fa-shopping-bag"></i> Panier (${count})</a>
            <a href="${root}profile.html#orders"><i class="fas fa-box"></i> Commandes</a>
            <a href="${root}profile.html#favorites"><i class="fas fa-heart"></i> Favoris</a>
            <div class="dd"></div>
            <a href="${root}register.html?role=seller" style="color:#E5A657"><i class="fas fa-store"></i> Devenir vendeur</a>
            <div class="dd"></div>
            <a href="#" class="gold-logout" style="color:#B53324"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
          </div>
        </div>
        <button class="hamburger" id="hbg"><span></span><span></span><span></span></button>
      </div>`;

  } else if (user.role === 'seller') {
    /* ── VENDEUR : pas de bouton Ajouter, juste Mon profil → drawer ── */
    navR = `
      <div class="nav-r">
        <button class="ni search-trigger"><i class="fas fa-search"></i></button>
        <div class="nsep"></div>
        <button class="gold-profile-btn gold-seller-profile-trigger" id="sellerProfileTrigger">
          <div class="gold-av gold-av-seller">${initials}</div>
          <span class="gold-uname">${displayName||'Ma boutique'}</span>
          <i class="fas fa-chevron-down" style="font-size:.42rem;opacity:.5;margin-left:4px"></i>
        </button>
        <button class="hamburger" id="hbg"><span></span><span></span><span></span></button>
      </div>`;
  }

  return navMid + navR;
}

/* ── Build mobile nav ── */
function buildMobileNav() {
  const user = GoldAuth.getUser();
  const root = _root();
  const initials = user ? (user.firstName||'U')[0].toUpperCase() + ((user.lastName||'')[0]||'').toUpperCase() : '';

  if (!user) {
    return `
      <a href="${root}index.html">Accueil</a>
      <a href="${root}catalogue.html">Catalogue</a>
      <a href="${root}catalogue.html?cat=vinyles">→ Vinyles</a>
      <a href="${root}catalogue.html?cat=cassettes">→ Cassettes</a>
      <a href="${root}catalogue.html?cat=instruments">→ Instruments</a>
      <a href="${root}catalogue.html?cat=posters">→ Posters & Art</a>
      <a href="${root}catalogue.html?cat=electronique">→ Électronique</a>
      <a href="${root}catalogue.html?cat=cd">→ CDs</a>
      <a href="${root}index.html#how">Comment ça marche</a>
      <div class="mb-btns">
        <a href="${root}login.html">Connexion</a>
        <a href="${root}register.html?role=seller" class="mb-sell">Vendre</a>
      </div>`;
  }

  const dispName = user.role==='seller' ? (user.shopName||user.firstName) : user.firstName;
  const avStyle = user.role==='seller' ? 'background:linear-gradient(135deg,#E5A657,#c07d30);color:#1c0f07' : 'background:linear-gradient(135deg,#B53324,#E5A657)';

  let links = user.role==='seller' ? `
    <a href="${root}index.html">Accueil</a>
    <a href="${root}catalogue.html">Catalogue</a>
    <a href="${root}Vendeur/orders.html">Mes commandes</a>
    <a href="${root}Vendeur/dashboard.html">Ma boutique</a>
    <a href="${root}Vendeur/add-product.html">+ Ajouter un produit</a>
    <a href="${root}Vendeur/reviews.html">Avis clients</a>` : `
    <a href="${root}index.html">Accueil</a>
    <a href="${root}catalogue.html">Catalogue</a>
    <a href="${root}cart.html">Mon panier</a>
    <a href="${root}profile.html">Mon profil</a>
    <a href="${root}profile.html#orders">Mes commandes</a>`;

  return `
    <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid rgba(229,166,87,0.15)">
      <div style="width:36px;height:36px;border-radius:50%;${avStyle};display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:white;flex-shrink:0">${initials}</div>
      <div>
        <div style="font-size:.88rem;color:rgba(245,226,206,0.9)">${dispName}</div>
        <div style="font-size:.72rem;color:#E5A657">${user.role==='seller'?'Vendeur':'Acheteur'}</div>
      </div>
    </div>
    ${links}
    <div class="mb-btns">
      <a href="#" class="gold-logout" style="color:#B53324">Déconnexion</a>
    </div>`;
}

/* ══════════════════════════════════════════════════════
   INJECT NAVBAR — call this on every page
══════════════════════════════════════════════════════ */
function initGoldNavbar(active='home') {
  const navWrap = document.querySelector('.nav-wrap');
  if (navWrap) {
    navWrap.querySelectorAll('.nav-mid, .nav-r').forEach(e=>e.remove());
    navWrap.insertAdjacentHTML('beforeend', buildNavbar(active));
  }

  const mob = document.getElementById('mobNav');
  if (mob) mob.innerHTML = buildMobileNav();

  /* Style injection (once) */
  if (!document.getElementById('gold-nav-styles')) {
    const s = document.createElement('style');
    s.id = 'gold-nav-styles';
    s.textContent = `
      .gold-profile-btn {
        display:flex;align-items:center;gap:8px;
        background:none;border:none;cursor:pointer;
        color:rgba(245,226,206,0.85);font-family:'Jost',sans-serif;
        font-size:.83rem;font-weight:300;padding:6px 10px;
        border-radius:8px;transition:background .2s;
      }
      .gold-profile-btn:hover { background:rgba(245,226,206,.1); }
      .navbar.scrolled .gold-profile-btn { color:rgba(28,15,7,0.65); }
      .navbar.scrolled .gold-profile-btn:hover { background:rgba(181,51,36,.06); color:#1c0f07; }
      .gold-av {
        width:28px;height:28px;border-radius:50%;
        background:linear-gradient(135deg,#B53324,#E5A657);
        display:flex;align-items:center;justify-content:center;
        font-size:.68rem;font-weight:700;color:white;flex-shrink:0;
      }
      .gold-av-seller { background:linear-gradient(135deg,#E5A657,#c07d30); color:#1c0f07; }
      .gold-uname { max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
      .gold-profile-dd { position:relative; }
      .gold-drop-profile { min-width:205px !important; left:50%; transform:translateX(-50%) translateY(10px) !important; }
      .nd:hover > .gold-drop-profile { transform:translateX(-50%) translateY(0) !important; opacity:1;visibility:visible; }
      .cart-icon { position:relative !important; }

      /* Seller profile trigger hover */
      .gold-seller-profile-trigger:hover { background:rgba(229,166,87,.1); }
      .navbar.scrolled .gold-seller-profile-trigger { color:rgba(28,15,7,0.65); }
    `;
    document.head.appendChild(s);
  }

  _attachNavEvents();
}

function _attachNavEvents() {
  const overlay = document.getElementById('searchOverlay');
  document.querySelectorAll('.search-trigger').forEach(b=>{
    b.addEventListener('click', ()=>{
      overlay?.classList.add('open');
      setTimeout(()=>overlay?.querySelector('input')?.focus(), 120);
    });
  });
  document.querySelector('.search-close')?.addEventListener('click', ()=>overlay?.classList.remove('open'));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') overlay?.classList.remove('open'); });

  /* Hamburger */
  const hbg = document.getElementById('hbg');
  const mob = document.getElementById('mobNav');
  hbg?.addEventListener('click', ()=>{
    const open = mob?.classList.toggle('open');
    const spans = hbg.querySelectorAll('span');
    if (open) {
      spans[0].style.transform='rotate(45deg) translate(4.5px,4.5px)';
      spans[1].style.opacity='0';
      spans[2].style.transform='rotate(-45deg) translate(4.5px,-4.5px)';
    } else {
      spans.forEach(s=>{ s.style.transform=''; s.style.opacity=''; });
    }
  });
  document.addEventListener('click', e=>{
    if (mob?.classList.contains('open') && !mob.contains(e.target) && !hbg?.contains(e.target)) {
      mob.classList.remove('open');
      hbg?.querySelectorAll('span').forEach(s=>{ s.style.transform=''; s.style.opacity=''; });
    }
  });

  /* Logout links */
  document.querySelectorAll('.gold-logout').forEach(a=>{
    a.addEventListener('click', e=>{ e.preventDefault(); GoldAuth.logout(); });
  });

  /* Buyer profile dropdown hover fix on mobile (touch) */
  document.querySelectorAll('.gold-profile-dd').forEach(dd=>{
    const btn = dd.querySelector('.gold-profile-btn');
    const drop = dd.querySelector('.gold-drop-profile');
    if (!btn || !drop) return;
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      const vis = drop.style.opacity==='1';
      drop.style.opacity = vis ? '0' : '1';
      drop.style.visibility = vis ? 'hidden' : 'visible';
    });
    document.addEventListener('click', ()=>{ drop.style.opacity='0'; drop.style.visibility='hidden'; });
  });

  /* ── SELLER : clic sur profil → ouvre le drawer ── */
  document.getElementById('sellerProfileTrigger')?.addEventListener('click', e => {
    e.stopPropagation();
    const user = GoldAuth.getUser();
    if (user && user.role === 'seller') {
      buildSellerDrawer(user, _root());
    }
  });
}

/* ══════════════════════════════════════════════════════
   CART & FAV BUTTONS — protects on any page
══════════════════════════════════════════════════════ */
function initCartAndFavButtons() {
  /* Add to cart buttons */
  document.querySelectorAll('.padd, .btn-add-to-cart, .sticky-add-btn').forEach(btn=>{
    const fresh = btn.cloneNode(true);
    btn.parentNode?.replaceChild(fresh, btn);
    fresh.addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation();
      if (!GoldAuth.isLoggedIn()) { requireLogin('ajouter des produits au panier'); return; }
      const card = fresh.closest('.pcard');
      const id   = fresh.dataset.pid || fresh.dataset.p || (card ? card.querySelector('.pcard-link')?.href?.split('id=')[1] : null) || 'prod';
      const name = fresh.dataset.p || card?.querySelector('.pname')?.textContent || 'Produit';
      const price= parseFloat(fresh.dataset.price||0);
      GoldAuth.addToCart({id, name, price});
      updateCartBadges();
      showToast(`${name} ajouté au panier`);
      if (fresh.classList.contains('padd')) {
        const orig = fresh.innerHTML;
        fresh.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
        setTimeout(()=>fresh.innerHTML=orig, 1800);
      }
    });
  });

  /* Buy now button */
  document.querySelector('.btn-buy-now')?.addEventListener('click', e=>{
    e.preventDefault();
    if (!GoldAuth.isLoggedIn()) { requireLogin('acheter ce produit'); return; }
    const root = _root();
    window.location.href = root + 'cart.html';
  });

  /* Fav buttons */
  document.querySelectorAll('.pfav').forEach(btn=>{
    const pid = btn.dataset.pid || btn.closest('.pcard')?.querySelector('.pcard-link')?.href?.split('id=')[1] || 'unknown';
    if (pid && GoldAuth.isFav(pid)) { btn.innerHTML='♥'; btn.classList.add('liked'); }
    const fresh = btn.cloneNode(true);
    btn.parentNode?.replaceChild(fresh, btn);
    if (pid && GoldAuth.isFav(pid)) { fresh.innerHTML='♥'; fresh.classList.add('liked'); }
    fresh.addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation();
      if (!GoldAuth.isLoggedIn()) { requireLogin('ajouter aux favoris'); return; }
      const added = GoldAuth.toggleFav(pid);
      fresh.innerHTML = added ? '♥' : '♡';
      fresh.classList.toggle('liked', added);
      showToast(added ? '♥ Ajouté aux favoris' : 'Retiré des favoris');
    });
  });
}

/* ══════════════════════════════════════════════════════
   AUTO-INIT on DOMContentLoaded
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  const path = window.location.pathname;
  let active = 'home';
  if (path.includes('catalogue')) active='catalogue';
  else if (path.includes('product')) active='product';

  initGoldNavbar(active);
  initCartAndFavButtons();
  updateCartBadges();
});