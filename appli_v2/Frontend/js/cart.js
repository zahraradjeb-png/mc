/* ═══════════════════════════════════════
   CART.JS — Gold v2
   Panier interactif complet
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Shared navbar/mobile/search/toast/scroll ── */
  const navbar = document.querySelector('.navbar');
  const scrollBtn = document.querySelector('.scroll-top-btn');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
    scrollBtn?.classList.toggle('show', window.scrollY > 400);
  });
  scrollBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileNav?.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
  document.querySelectorAll('.search-trigger').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelector('.search-overlay')?.classList.add('open');
      setTimeout(() => document.querySelector('.search-wrap input')?.focus(), 100);
    })
  );
  document.querySelector('.search-close-btn')?.addEventListener('click', () =>
    document.querySelector('.search-overlay')?.classList.remove('open')
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelector('.search-overlay')?.classList.remove('open');
  });

  const ti = document.querySelector('.ticker-inner');
  if (ti) ti.appendChild(ti.cloneNode(true));


  // Sync cart back to gold_cart localStorage
  function syncCartToStorage() {
    try {
      const simplified = cartItems.map(i => ({
        id: String(i.id), name: i.name, price: i.price, qty: i.qty,
        emoji: i.emoji, artist: i.artist, meta: i.meta
      }));
      localStorage.setItem('gold_cart', JSON.stringify(simplified));
      // Update badge in navbar
      const total = cartItems.reduce((s,i) => s+(i.qty||1), 0);
      document.querySelectorAll('.cbadge, #cBadge, .cart-badge').forEach(b => {
        b.textContent = total;
        b.style.display = total > 0 ? '' : 'none';
      });
    } catch(e){}
  }

  function showToast(msg, type = 'default') {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    const icon = type === 'success' ? '✓' : type === 'warn' ? '⚠' : '✦';
    t.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ════════════════════════════════════
     CART DATA & STATE
  ════════════════════════════════════ */
  let cartItems = (function(){
    try {
      const stored = JSON.parse(localStorage.getItem('gold_cart')) || [];
      if (stored.length > 0) {
        return stored.map((item, i) => ({
          id: item.id || i+1,
          emoji: item.emoji || '🎵',
          meta: item.meta || 'Vinyle',
          name: item.name || 'Produit',
          artist: item.artist || '',
          seller: item.seller || { init: 'GS', name: 'Gold Store' },
          condition: item.condition || 'Bon état',
          price: item.price || 0,
          oldPrice: item.oldPrice || null,
          qty: item.qty || 1,
          maxQty: 5
        }));
      }
    } catch(e){}
    // Default demo items if cart is empty
    return [
      { id: 1, emoji: '🎵', meta: 'Vinyle · 1971', name: 'Led Zeppelin IV', artist: 'Led Zeppelin', seller: { init: 'JP', name: 'Jean-Pierre' }, condition: 'Excellent', price: 89.99, oldPrice: 110, qty: 1, maxQty: 3 },
      { id: 2, emoji: '🌊', meta: 'Vinyle · 1979', name: 'The Wall', artist: 'Pink Floyd', seller: { init: 'ML', name: 'Marie-L.' }, condition: 'Parfait', price: 74.00, oldPrice: null, qty: 1, maxQty: 2 },
    ];
  })()

  let promoApplied = false;
  const PROMO_CODE = 'RETRO10';
  const PROMO_DISCOUNT = 0.10;
  const SHIPPING_FREE_THRESHOLD = 60;

  /* ── Render cart ── */
  function renderCart() {
    const list = document.getElementById('cart-items-list');
    const emptyEl = document.getElementById('empty-cart');
    const itemsPanel = document.getElementById('cart-items-panel');
    const countEl = document.getElementById('cart-items-count');
    const navBadge = document.querySelector('.cart-badge');

    const total = cartItems.length;
    if (countEl) countEl.innerHTML = `<strong>${total}</strong> article${total !== 1 ? 's' : ''}`;
    if (navBadge) navBadge.textContent = cartItems.reduce((s, i) => s + i.qty, 0);

    if (cartItems.length === 0) {
      if (emptyEl) emptyEl.classList.add('show');
      if (itemsPanel) itemsPanel.style.display = 'none';
      updateSummary();
      return;
    }
    if (emptyEl) emptyEl.classList.remove('show');
    if (itemsPanel) itemsPanel.style.display = '';

    if (!list) return;
    list.innerHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}" id="item-${item.id}">
        <!-- checkbox -->
        <div class="item-check">
          <div class="item-check-box checked" data-id="${item.id}" onclick="toggleCheck(${item.id}, this)">✓</div>
        </div>

        <!-- thumb -->
        <div class="item-thumb" onclick="window.location.href='product.html'">${item.emoji}</div>

        <!-- info -->
        <div class="item-info">
          <div class="item-meta">${item.meta}</div>
          <div class="item-name"><a href="product.html">${item.name}</a></div>
          <div class="item-artist">${item.artist}</div>
          <div class="item-seller">
            <div class="item-seller-dot">${item.seller.init}</div>
            ${item.seller.name}
            <span class="item-condition"><i class="fas fa-check-circle" style="font-size:.55rem"></i> ${item.condition}</span>
          </div>
        </div>

        <!-- right: price + qty + actions -->
        <div class="item-right">
          <div>
            <div class="item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
            ${item.oldPrice ? `<div class="item-old">${(item.oldPrice * item.qty).toFixed(2)} €</div>` : ''}
          </div>
          <div class="item-qty">
            <button class="iq-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <div class="iq-val">${item.qty}</div>
            <button class="iq-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <div class="item-actions">
            <button class="item-action-btn wish" title="Sauvegarder" onclick="saveForLater(${item.id})">
              <i class="far fa-heart"></i>
            </button>
            <button class="item-action-btn" title="Supprimer" onclick="removeItem(${item.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    renderSellerBreakdown();
    updateSummary();
  }

  /* ── Seller breakdown ── */
  function renderSellerBreakdown() {
    const sbEl = document.getElementById('seller-breakdown-rows');
    if (!sbEl) return;

    const bySeller = {};
    cartItems.forEach(item => {
      const key = item.seller.init;
      if (!bySeller[key]) bySeller[key] = { ...item.seller, items: 0, total: 0 };
      bySeller[key].items += item.qty;
      bySeller[key].total += item.price * item.qty;
    });

    sbEl.innerHTML = Object.values(bySeller).map(s => `
      <div class="sb-row">
        <div class="sb-dot">${s.init}</div>
        <div>
          <div class="sb-name">${s.name}</div>
          <div class="sb-items">${s.items} article${s.items !== 1 ? 's' : ''}</div>
        </div>
        <div class="sb-subtotal">${s.total.toFixed(2).replace('.', ',')} €</div>
      </div>
    `).join('');
  }

  /* ── Summary ── */
  function updateSummary() {
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : 4.90;
    const discount = promoApplied ? subtotal * PROMO_DISCOUNT : 0;
    const total = subtotal - discount + shipping;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('summary-subtotal', subtotal.toFixed(2).replace('.', ',') + ' €');
    set('summary-shipping', shipping === 0 ? 'Gratuite 🎉' : shipping.toFixed(2).replace('.', ',') + ' €');
    set('summary-discount', discount > 0 ? '−' + discount.toFixed(2).replace('.', ',') + ' €' : '—');
    set('summary-total', total.toFixed(2).replace('.', ',') + ' €');
    set('summary-item-count', cartItems.reduce((s, i) => s + i.qty, 0));

    const shippingEl = document.getElementById('summary-shipping');
    if (shippingEl) shippingEl.className = 'summary-line-val' + (shipping === 0 ? ' free' : '');
    const discountEl = document.getElementById('summary-discount');
    if (discountEl) discountEl.className = 'summary-line-val' + (discount > 0 ? ' discount' : '');

    // Shipping progress bar
    const progressEl = document.getElementById('free-shipping-progress');
    const progressTextEl = document.getElementById('free-shipping-text');
    if (progressEl) {
      if (shipping === 0) {
        progressEl.parentElement.style.display = 'none';
      } else {
        progressEl.parentElement.style.display = '';
        progressEl.style.width = Math.min((subtotal / SHIPPING_FREE_THRESHOLD) * 100, 100) + '%';
        const remaining = (SHIPPING_FREE_THRESHOLD - subtotal).toFixed(2);
        if (progressTextEl) progressTextEl.textContent = `Plus que ${remaining} € pour la livraison gratuite !`;
      }
    }

    // Checkout mini summary (checkout page)
    const miniLines = document.getElementById('co-summary-lines');
    if (miniLines) {
      miniLines.innerHTML = `
        <div class="csm-line"><span class="csm-line-key">Sous-total</span><span>${subtotal.toFixed(2)} €</span></div>
        <div class="csm-line"><span class="csm-line-key">Livraison</span><span style="color:${shipping === 0 ? '#16a34a' : 'inherit'}">${shipping === 0 ? 'Gratuite' : shipping.toFixed(2) + ' €'}</span></div>
        ${discount > 0 ? `<div class="csm-line"><span class="csm-line-key">Réduction</span><span style="color:var(--rust)">−${discount.toFixed(2)} €</span></div>` : ''}
      `;
    }
    const miniTotal = document.getElementById('co-total');
    if (miniTotal) miniTotal.textContent = total.toFixed(2).replace('.', ',') + ' €';
  }

  /* ── Qty change ── */
  window.changeQty = (id, delta) => {
    const item = cartItems.find(i => i.id === id || String(i.id) === String(id));
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty < 1) { removeItem(id); return; }
    if (newQty > (item.maxQty || 99)) { showToast(`⚠️ Maximum ${item.maxQty || 99} exemplaires`, 'warn'); return; }
    item.qty = newQty;
    renderCart(); syncCartToStorage();
    showToast('Quantité mise à jour', 'success');

    // Sync avec la BDD
    if (typeof GoldAuth !== 'undefined' && GoldAuth.isLoggedIn()) {
      const user = GoldAuth.getUser();
      const bId = user?.id_user || user?.id;
      if (bId) {
        fetch(`${typeof API_BASE !== 'undefined' ? API_BASE : 'http://127.0.0.1:8000/api'}/panier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_acheteur: bId,
            id_produit: id,
            prix_unitaire: item.price,
            quantite: newQty,
            action: 'set'
          })
        }).catch(e => console.warn('Sync qty error:', e));
      }
    }
  };

  /* ── Remove ── */
  window.removeItem = (id) => {
    const el = document.getElementById(`item-${id}`);
    if (el) {
      el.classList.add('removing');
      el.style.transition = 'all 0.4s ease';
      el.style.height = el.offsetHeight + 'px';
      setTimeout(() => {
        el.style.height = '0';
        el.style.padding = '0';
        el.style.margin = '0';
        el.style.border = 'none';
        setTimeout(() => {
          cartItems = cartItems.filter(i => i.id !== id);
          renderCart(); syncCartToStorage();
          showToast('Article retiré du panier');
        }, 300);
      }, 50);
    }
  };

  /* ── Save for later ── */
  window.saveForLater = (id) => {
    showToast('♥ Sauvegardé dans vos favoris');
    removeItem(id);
  };

  /* ── Checkbox ── */
  window.toggleCheck = (id, el) => {
    el.classList.toggle('checked');
    el.textContent = el.classList.contains('checked') ? '✓' : '';
  };

  /* Select all */
  document.getElementById('select-all')?.addEventListener('click', function() {
    this.classList.toggle('checked');
    this.textContent = this.classList.contains('checked') ? '✓' : '';
    document.querySelectorAll('.item-check-box').forEach(cb => {
      cb.classList.toggle('checked', this.classList.contains('checked'));
      cb.textContent = this.classList.contains('checked') ? '✓' : '';
    });
  });

  /* ── Promo code ── */
  document.getElementById('apply-promo')?.addEventListener('click', () => {
    const input = document.getElementById('promo-input');
    const code = input?.value.trim().toUpperCase();
    const successEl = document.getElementById('promo-success');

    if (code === PROMO_CODE) {
      promoApplied = true;
      if (successEl) successEl.classList.add('show');
      if (input) { input.disabled = true; input.style.borderColor = '#16a34a'; }
      document.getElementById('apply-promo').disabled = true;
      document.getElementById('apply-promo').textContent = 'Appliqué ✓';
      document.getElementById('apply-promo').style.background = '#16a34a';
      updateSummary();
      showToast('🎉 Code promo appliqué ! −10%', 'success');
    } else {
      if (input) input.style.borderColor = 'var(--rust)';
      showToast('❌ Code promo invalide', 'warn');
      setTimeout(() => { if (input) input.style.borderColor = ''; }, 2000);
    }
  });

  /* ── Enter key for promo ── */
  document.getElementById('promo-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('apply-promo')?.click();
  });

  /* ── Init ── */
  renderCart(); syncCartToStorage();
});

/* ═══════════════════════════════════════
   CHECKOUT.JS — inline for checkout page
═══════════════════════════════════════ */
function initCheckout() {

  /* Delivery option selection */
  document.querySelectorAll('.delivery-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.delivery-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  /* Payment option selection */
  document.querySelectorAll('.payment-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      // Show card fields only for card payment
      const cardFields = document.getElementById('card-fields');
      if (cardFields) {
        cardFields.classList.toggle('show', opt.dataset.method === 'card');
      }
    });
  });

  /* Card number formatting */
  document.getElementById('card-number')?.addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '').substring(0, 16);
    this.value = val.replace(/(.{4})/g, '$1 ').trim();
  });

  document.getElementById('card-expiry')?.addEventListener('input', function() {
    let val = this.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
    this.value = val;
  });

  document.getElementById('card-cvv')?.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').substring(0, 3);
  });

  /* Form validation */
  function validateField(input) {
    const val = input.value.trim();
    if (!val) {
      input.classList.add('error');
      input.classList.remove('valid');
      return false;
    }
    input.classList.remove('error');
    input.classList.add('valid');
    return true;
  }

  document.querySelectorAll('.form-input[required]').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  /* Place order */
  document.getElementById('place-order-btn')?.addEventListener('click', () => {
    const requiredFields = document.querySelectorAll('.form-input[required]');
    let valid = true;
    requiredFields.forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) {
      showCheckoutToast('⚠️ Veuillez remplir tous les champs obligatoires', 'warn');
      // Scroll to first error
      const firstError = document.querySelector('.form-input.error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate order placement
    const btn = document.getElementById('place-order-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement en cours…';
    btn.disabled = true;

    setTimeout(() => {
      document.getElementById('checkout-form')?.style.setProperty('display', 'none');
      document.getElementById('order-confirm')?.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2200);
  });

  function showCheckoutToast(msg, type = 'default') {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = `<span class="toast-icon">${type === 'warn' ? '⚠' : '✦'}</span>${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3500);
  }
}

if (document.getElementById('checkout-form')) {
  document.addEventListener('DOMContentLoaded', initCheckout);
}