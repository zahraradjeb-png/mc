/* ═══════════════════════════════════════
   PRODUCT.JS — RetroWave v2
   Fiche produit : gallery, tabs, qty, cart
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Shared: navbar / mobile / search / toast / scroll ── */
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
    } else { spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; }); }
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

  /* ticker clone */
  const ti = document.querySelector('.ticker-inner');
  if (ti) ti.appendChild(ti.cloneNode(true));

  function showToast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = `<span class="toast-icon">✦</span>${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ── GALLERY THUMBNAILS ── */
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainImg = document.querySelector('.gallery-main-img');
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg) {
        mainImg.style.opacity = '0';
        mainImg.style.transform = 'scale(0.96)';
        setTimeout(() => {
          mainImg.textContent = thumb.textContent;
          mainImg.style.opacity = '1';
          mainImg.style.transform = 'scale(1)';
        }, 200);
      }
    });
  });

  /* ── LIGHTBOX ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.querySelector('.lightbox-content');
  document.querySelector('.gallery-main')?.addEventListener('click', () => {
    if (lightboxContent && mainImg) lightboxContent.textContent = mainImg.textContent;
    lightbox?.classList.add('open');
  });
  document.querySelector('.lightbox-close')?.addEventListener('click', () =>
    lightbox?.classList.remove('open')
  );
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });

  /* ── WISHLIST ── */
  let cartCount = typeof GoldAuth !== 'undefined' ? GoldAuth.getCartCount() : 0;
  const cartBadge = document.querySelector('.cart-badge, .cbadge, #cBadge');

  document.querySelectorAll('.btn-wishlist-full, .gal-action-btn[data-action="wish"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof GoldAuth !== 'undefined' && !GoldAuth.isLoggedIn()) {
        requireLogin('ajouter aux favoris');
        return;
      }
      btn.classList.toggle('liked');
      const liked = btn.classList.contains('liked');
      if (btn.querySelector('i')) btn.querySelector('i').className = liked ? 'fas fa-heart' : 'far fa-heart';
      showToast(liked ? '♥ Ajouté aux favoris' : 'Retiré des favoris');
    });
  });

  /* ── QUANTITY ── */
  let qty = 1;
  const qtyVal = document.querySelector('.qty-val');
  document.querySelector('.qty-minus')?.addEventListener('click', () => {
    if (qty > 1) { qty--; if (qtyVal) qtyVal.textContent = qty; }
  });
  document.querySelector('.qty-plus')?.addEventListener('click', () => {
    if (qty < 3) { qty++; if (qtyVal) qtyVal.textContent = qty; }
    else showToast('⚠️ Stock limité à 3 exemplaires');
  });

  /* ── ADD TO CART ── */
  document.querySelector('.btn-add-to-cart')?.addEventListener('click', () => {
    if (typeof GoldAuth !== 'undefined' && !GoldAuth.isLoggedIn()) {
      requireLogin('ajouter ce produit au panier');
      return;
    }
    // Get product info from page
    const pname = document.querySelector('.product-title, .prod-name, h1')?.textContent?.trim() || 'Produit';
    const priceTxt = document.querySelector('.price-main, .prod-price, .price')?.textContent?.replace(/[^0-9.,]/g,'').replace(',','.') || '0';
    const pid = new URLSearchParams(window.location.search).get('id') || 'product';
    if (typeof GoldAuth !== 'undefined') {
      for(let i=0;i<qty;i++) GoldAuth.addToCart({id:pid, name:pname, price:parseFloat(priceTxt)||0, emoji:'🎵'});
      if(typeof updateCartBadges==='function') updateCartBadges();
    }
    cartCount += qty;
    if (cartBadge) cartBadge.textContent = cartCount;
    showToast(`🎵 ${qty} article${qty > 1 ? 's' : ''} ajouté${qty > 1 ? 's' : ''} au panier !`);

    // Visual feedback
    const btn = document.querySelector('.btn-add-to-cart');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
    btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
    }, 2000);
  });

  /* ── BUY NOW ── */
  document.querySelector('.btn-buy-now')?.addEventListener('click', () => {
    if (typeof GoldAuth !== 'undefined' && !GoldAuth.isLoggedIn()) {
      requireLogin('acheter ce produit');
      return;
    }
    cartCount += qty;
    if (cartBadge) cartBadge.textContent = cartCount;
    window.location.href = 'cart.html';
  });

  /* ── TABS ── */
  const tabs = document.querySelectorAll('.prod-tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('panel-' + target)?.classList.add('active');
    });
  });

  /* ── SHARE ── */
  document.querySelector('[data-action="share"]')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'Led Zeppelin IV — RetroWave', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Lien copié dans le presse-papier !');
    }
  });

  /* ── REVIEW BARS ANIMATION ── */
  const rbarObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.rbar-fill').forEach(bar => {
          const w = bar.dataset.width;
          bar.style.width = '0%';
          setTimeout(() => { bar.style.transition = 'width 0.8s ease'; bar.style.width = w; }, 100);
        });
        rbarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.review-bars').forEach(el => rbarObserver.observe(el));

  /* ── RELATED CARDS REVEAL ── */
  const relObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.related-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
      });
      relObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.related-grid').forEach(el => relObserver.observe(el));

  /* ── STICKY ADD TO CART (mobile) ── */
  const stickyBar = document.getElementById('sticky-bar');
  const productCta = document.querySelector('.product-cta');
  if (stickyBar && productCta) {
    const obs = new IntersectionObserver(entries => {
      stickyBar.style.transform = entries[0].isIntersecting ? 'translateY(100%)' : 'translateY(0)';
    }, { threshold: 0 });
    obs.observe(productCta);
  }
  document.querySelector('.sticky-add-btn')?.addEventListener('click', () => {
    document.querySelector('.btn-add-to-cart')?.click();
  });

});