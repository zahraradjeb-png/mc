/* ═══════════════════════════════════════
   CATALOGUE.JS — Gold v3
   Filter · Sort · Modal · Auth · Search
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── CAT ICON MAP (FontAwesome — no emoji) ─── */
  const catIcon = c => ({
    vinyles:     '<i class="fas fa-record-vinyl"></i>',
    cassettes:   '<i class="fas fa-tape"></i>',
    instruments: '<i class="fas fa-guitar"></i>',
    posters:     '<i class="fas fa-image"></i>',
    electronique:'<i class="fas fa-plug"></i>',
    cd:          '<i class="fas fa-compact-disc"></i>',
  }[c] || '<i class="fas fa-music"></i>');

  /* ─── PRODUCTS ─── */
  let products = [];
  let filtered = [];

  async function fetchProducts() {
    try {
      const response = await fetch(`${API_BASE}/produits`);
      const data = await response.json();
      
      products = data.map(p => ({
        id: p.id_produit,
        name: p.titre,
        artist: p.artiste || 'Artiste inconnu',
        cat: p.categorie_nom?.toLowerCase() || 'autres',
        price: parseFloat(p.prix),
        oldPrice: null,
        year: p.annee || p.decennie || 'N/A',
        badge: p.rarete?.toLowerCase() === 'rare' ? 'rare' : null,
        rarete: p.rarete?.toLowerCase() || 'commun',
        condition: p.etat?.toLowerCase() || 'bon',
        rating: 5,
        seller: {
          init: (p.vendeur_nom || 'V')[0],
          name: p.vendeur_nom || 'Vendeur Indépendant',
          rating: 4.8
        },
        desc: p.description || 'Aucune description disponible pour ce produit.',
        photo: p.photo_principale || null
      }));

      filtered = [...products];
      renderProducts();
      updateCategoryCounts();
    } catch (err) {
      console.error('Erreur fetch produits:', err);
      showToast('Impossible de charger les produits', 'error');
    }
  }

  fetchProducts();
  let currentView = 'grid';
  let currentPage = 1;
  const perPage = 9;
  let activeFilters = { cats:[], conditions:[], raretes:[], minPrice:0, maxPrice:5000, minRating:0, search:'' };

  /* ─── AUTH ─── */
  const isLoggedIn = () => typeof GoldAuth !== 'undefined' && GoldAuth.isLoggedIn();
  const askLogin   = a => typeof requireLogin !== 'undefined' ? requireLogin(a) : (window.location.href='login.html?redirect=catalogue.html');
  const updateCartBadges = () => {
    if (typeof GoldAuth === 'undefined') return;
    const c = GoldAuth.getCartCount();
    document.querySelectorAll('.cbadge,#cartBadge,.cart-badge,#cBadge').forEach(b => { 
      if(b) { b.textContent=c; b.style.display=c>0?'flex':'none'; }
    });
  };

  /* ─── TOAST ─── */
  const showToast = msg => {
    const t=document.getElementById('toast'), tm=document.getElementById('tmsg');
    if (!t||!tm) return;
    tm.textContent=msg; t.classList.add('show');
    t.style.opacity = '1';
    clearTimeout(t._t); t._t=setTimeout(()=>t.style.opacity='0',3000);
  };

  const catLabel = c => ({vinyles:'Vinyle',cassettes:'Cassette',instruments:'Instrument',electronique:'Électronique',cd:'CD',posters:'Poster'}[c]||c);

  /* ═══════════════════════════════
     MODAL PRODUIT
  ═══════════════════════════════ */
  if (!document.getElementById('rw-modal-styles')) {
    const s = document.createElement('style');
    s.id = 'rw-modal-styles';
    s.textContent = `
      #rwModalBackdrop {
        position:fixed;inset:0;z-index:9000;
        background:rgba(8,3,1,.9);
        backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        display:flex;align-items:center;justify-content:center;
        padding:16px;opacity:0;pointer-events:none;
        transition:opacity .3s ease;
      }
      #rwModalBackdrop.open { opacity:1;pointer-events:all; }
      .rw-modal {
        position:relative;width:100%;max-width:840px;
        max-height:92vh;overflow-y:auto;
        border-radius:24px;
        background:linear-gradient(160deg,#1f1008 0%,#130804 100%);
        border:1px solid rgba(229,166,87,.16);
        box-shadow:0 60px 150px rgba(0,0,0,.85),inset 0 1px 0 rgba(229,166,87,.07);
        display:grid;grid-template-columns:280px 1fr;
        transform:translateY(36px) scale(.94);
        transition:transform .42s cubic-bezier(.22,1,.36,1);
        scrollbar-width:thin;scrollbar-color:rgba(229,166,87,.15) transparent;
      }
      #rwModalBackdrop.open .rw-modal { transform:none; }
      @media(max-width:620px){
        .rw-modal { grid-template-columns:1fr; max-height:95vh; }
        .rw-modal-left { height:180px;min-height:unset!important;border-radius:24px 24px 0 0!important; }
      }
      .rw-modal-left {
        position:relative;overflow:hidden;
        border-radius:24px 0 0 24px;min-height:380px;
        background:linear-gradient(160deg,#2e1608 0%,#110601 100%);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:32px 20px;
      }
      .rw-modal-left::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,rgba(229,166,87,.12) 0%,transparent 65%); }
      .rw-modal-left::after  { content:'';position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top,rgba(17,6,1,.95),transparent); }
      .rw-modal-cat-icon {
        position:relative;z-index:1;
        width:88px;height:88px;border-radius:50%;
        background:linear-gradient(135deg,rgba(229,166,87,.15),rgba(181,51,36,.1));
        border:1px solid rgba(229,166,87,.2);
        display:flex;align-items:center;justify-content:center;
        font-size:2.2rem;color:rgba(229,166,87,.7);
        transition:transform .5s cubic-bezier(.22,1,.36,1);
      }
      #rwModalBackdrop.open .rw-modal-cat-icon { transform:scale(1.06) translateY(-3px); }
      .rw-modal-seller {
        position:relative;z-index:1;display:flex;align-items:center;gap:9px;
        background:rgba(0,0,0,.45);border:1px solid rgba(229,166,87,.1);
        border-radius:100px;padding:7px 16px;backdrop-filter:blur(6px);
      }
      .rw-modal-seller-av { width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#B53324,#E5A657);display:flex;align-items:center;justify-content:center;font-size:.64rem;font-weight:700;color:#fff;flex-shrink:0; }
      .rw-modal-seller-nm { font-size:.74rem;color:rgba(245,226,206,.82);font-family:'Outfit',sans-serif;display:block; }
      .rw-modal-right { padding:28px 26px 24px;display:flex;flex-direction:column;gap:13px; }
      .rw-modal-close { position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:rgba(245,226,206,.07);border:1px solid rgba(245,226,206,.09);color:rgba(245,226,206,.45);font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .22s;z-index:10; }
      .rw-modal-close:hover { background:rgba(181,51,36,.3);color:#fff;border-color:rgba(181,51,36,.5); }
      .rw-modal-cat { font-family:'Outfit',sans-serif;font-size:.63rem;letter-spacing:.15em;text-transform:uppercase;color:#E5A657;opacity:.7; }
      .rw-modal-title { font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:600;color:#F5E2CE;line-height:1.18;margin:3px 0 0; }
      .rw-modal-artist { font-family:'Outfit',sans-serif;font-size:.8rem;color:rgba(245,226,206,.36);margin-top:3px; }
      .rw-modal-price-row { display:flex;align-items:baseline;gap:12px; }
      .rw-modal-price { font-family:'Cormorant Garamond',serif;font-size:2.1rem;font-weight:600;color:#E5A657;line-height:1; }
      .rw-modal-div { height:1px;background:linear-gradient(to right,rgba(229,166,87,.16),transparent); }
      .rw-modal-story-lbl { font-family:'Outfit',sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(229,166,87,.42);margin-bottom:7px; }
      .rw-modal-story { font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:300;color:rgba(245,226,206,.65);line-height:1.6;margin:0; }
      .rw-modal-tags { display:flex;flex-wrap:wrap;gap:6px; }
      .rw-modal-tag { padding:4px 12px;border-radius:100px;border:1px solid rgba(229,166,87,.13);font-family:'Outfit',sans-serif;font-size:.66rem;color:rgba(245,226,206,.38); }
      .rw-modal-actions { display:flex;gap:9px;margin-top:4px; }
      .rw-modal-btn-cart { flex:1;padding:13px;border-radius:11px;background:linear-gradient(135deg,#B53324,#8a1f14);color:#fff;border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-size:.84rem;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .22s;box-shadow:0 4px 20px rgba(181,51,36,.28); }
      .rw-modal-btn-cart:hover { opacity:.88;transform:translateY(-1px);box-shadow:0 8px 28px rgba(181,51,36,.42); }
      .rw-modal-btn-fav { width:48px;height:48px;border-radius:11px;border:1px solid rgba(229,166,87,.16);background:transparent;color:rgba(245,226,206,.42);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .22s; }
      .rw-modal-btn-fav:hover,.rw-modal-btn-fav.liked { background:rgba(181,51,36,.14);color:#e05040;border-color:rgba(181,51,36,.34); }
      .rw-modal-secondary-actions { display:flex; gap:10px; margin-top:15px; border-top:1px solid rgba(229,166,87,.1); padding-top:15px; }
      .rw-modal-btn-outline { flex:1; padding:8px; border-radius:8px; background:transparent; border:1px solid rgba(245,226,206,.2); color:rgba(245,226,206,.7); font-family:'Outfit',sans-serif; font-size:0.8rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px; }
      .rw-modal-btn-outline:hover { background:rgba(245,226,206,.05); color:#fff; border-color:rgba(245,226,206,.4); }
      .rw-modal-btn-report:hover { background:rgba(181,51,36,.1); color:#e05040; border-color:rgba(181,51,36,.3); }
      .rw-modal-comments { margin-top:15px; display:none; border-top:1px dashed rgba(229,166,87,.2); padding-top:15px; z-index:100; position:relative; }
      .rw-modal-comment-input { width:100%; padding:10px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(229,166,87,.2); color:#fff; font-family:'Outfit',sans-serif; margin-bottom:10px; resize:none; font-size:0.85rem; }
    `;
    document.head.appendChild(s);
  }

  let backdrop = document.getElementById('rwModalBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'rwModalBackdrop';
    backdrop.innerHTML = '<div class="rw-modal" id="rwModal"></div>';
    document.body.appendChild(backdrop);
  }
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

  function closeModal() { backdrop.classList.remove('open'); }

  function openModal(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById('rwModal');
    if (!modal) return;
    const cl    = catLabel(p.cat);
    const favOn = isLoggedIn() && GoldAuth.isFav(String(id));

    modal.innerHTML = `
      <button class="rw-modal-close" id="rwClose"><i class="fas fa-times"></i></button>
      <div class="rw-modal-left">
        <div class="rw-modal-cat-icon">${p.photo ? `<img src="${API_BASE.replace('/api','')}/${p.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : catIcon(p.cat)}</div>
        <div class="rw-modal-seller">
          <div class="rw-modal-seller-av">${p.seller.init}</div>
          <div><span class="rw-modal-seller-nm">${p.seller.name}</span></div>
        </div>
      </div>
      <div class="rw-modal-right">
        <div>
          <div class="rw-modal-cat">${cl} · ${p.year} · ${p.condition.toUpperCase()} · ${p.rarete.toUpperCase().replace('_',' ')}</div>
          <h2 class="rw-modal-title">${p.name}</h2>
          <div class="rw-modal-artist">${p.artist}</div>
        </div>
        <div class="rw-modal-price-row">
          <span class="rw-modal-price">${p.price.toFixed(2).replace('.',',')} €</span>
        </div>
        <div class="rw-modal-div"></div>
        <div>
          <div class="rw-modal-story-lbl">Détails du produit</div>
          <p class="rw-modal-story">${p.desc}</p>
        </div>
        <div class="rw-modal-tags">
          <span class="rw-modal-tag">${cl}</span>
          <span class="rw-modal-tag">${p.year}</span>
          <span class="rw-modal-tag">${p.condition}</span>
          <span class="rw-modal-tag"><i class="fas fa-certificate" style="color:#E5A657;margin-right:3px;font-size:.58rem"></i>Authentique</span>
        </div>
        <div class="rw-modal-actions">
          <button class="rw-modal-btn-cart" id="rwCart"><i class="fas fa-shopping-bag"></i> Ajouter au panier</button>
          <button class="rw-modal-btn-fav ${favOn?'liked':''}" id="rwFav"><i class="${favOn?'fas':'far'} fa-heart"></i></button>
        </div>
        <div class="rw-modal-secondary-actions">
          <button class="rw-modal-btn-outline" id="rwBtnComment" onclick="rwToggleArea('comment')"><i class="far fa-comment"></i> Commenter</button>
          <button class="rw-modal-btn-outline rw-modal-btn-report" id="rwBtnReport" onclick="rwToggleArea('report')"><i class="far fa-flag"></i> Signaler</button>
        </div>
        <div class="rw-modal-comments" id="rwCommentsArea" style="display:none !important;">
          <textarea class="rw-modal-comment-input" id="rwCommentText" rows="3" placeholder="Laissez un commentaire sur ce produit..."></textarea>
          <button class="rw-modal-btn-outline" id="rwSubmitComment" style="border-color:var(--honey); color:var(--honey); margin-left:auto;">Publier</button>
          <div id="rwCommentsList" style="margin-top:15px; max-height:100px; overflow-y:auto; font-size:0.8rem; color:rgba(245,226,206,.6);">
            <!-- Liste des commentaires -->
          </div>
        </div>
        <div class="rw-modal-comments" id="rwReportArea" style="display:none !important;">
          <div style="color:var(--paprika); font-weight:600; margin-bottom:8px;"><i class="fas fa-exclamation-triangle"></i> Signaler ce produit</div>
          <textarea class="rw-modal-comment-input" id="rwReportText" rows="3" placeholder="Pourquoi voulez-vous signaler ce produit ?"></textarea>
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="rw-modal-btn-outline" id="rwCancelReport" style="border-color:var(--muted); color:var(--muted);">Annuler</button>
            <button class="rw-modal-btn-outline" id="rwSubmitReport" style="border-color:var(--paprika); color:var(--paprika);">Envoyer</button>
          </div>
        </div>
      </div>`;

    document.getElementById('rwClose')?.addEventListener('click', closeModal);

    // Load existing comments from localStorage
    const guestComments = JSON.parse(localStorage.getItem('guest_comments') || '[]');
    const productComments = guestComments.filter(c => c.productId === String(p.id));
    let commentsHtml = '';
    productComments.forEach(c => {
      commentsHtml += `
        <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
          <div style="font-weight:600; color:var(--honey); margin-bottom:4px;">${c.userName} <span style="font-size:0.65rem;color:var(--muted);font-weight:normal;margin-left:5px;">${c.date}</span></div>
          <div>${c.text}</div>
        </div>
      `;
    });
    const commentsListEl = document.getElementById('rwCommentsList');
    if (commentsListEl) commentsListEl.innerHTML = commentsHtml;

    document.getElementById('rwCart')?.addEventListener('click', async () => {
      // Visiteur peut ajouter au panier grace à auth-system.js
      await GoldAuth.addToCart({ id: String(p.id), name: p.name, price: p.price, emoji: '' });
      updateCartBadges();
      closeModal();
    });

    const favBtn = document.getElementById('rwFav');
    favBtn?.addEventListener('click', () => {
      if (!isLoggedIn()) { askLogin('ajouter aux favoris'); return; }
      const added = GoldAuth.toggleFav(String(p.id));
      favBtn.classList.toggle('liked', added);
      favBtn.innerHTML = `<i class="${added?'fas':'far'} fa-heart"></i>`;
      showToast(added ? 'Ajouté aux favoris' : 'Retiré des favoris');
      document.querySelectorAll(`.heart-btn[data-id="${p.id}"]`).forEach(b => {
        b.classList.toggle('liked', added);
        b.innerHTML = `<i class="${added?'fas':'far'} fa-heart"></i>`;
      });
    });

    // Global toggle function to avoid listener issues
    window.rwToggleArea = (type) => {
      const cArea = document.getElementById('rwCommentsArea');
      const rArea = document.getElementById('rwReportArea');
      if (!cArea || !rArea) return;
      
      if (type === 'comment') {
        rArea.style.setProperty('display', 'none', 'important');
        const isHidden = cArea.style.display === 'none' || cArea.style.display === '';
        cArea.style.setProperty('display', isHidden ? 'block' : 'none', 'important');
      } else {
        // On autorise l'ouverture même si déjà signalé pour que l'utilisateur voit le formulaire
        cArea.style.setProperty('display', 'none', 'important');
        const isHidden = rArea.style.display === 'none' || rArea.style.display === '';
        rArea.style.setProperty('display', isHidden ? 'block' : 'none', 'important');
      }
    };

    document.getElementById('rwCancelReport')?.addEventListener('click', () => {
      document.getElementById('rwReportArea').style.setProperty('display', 'none', 'important');
      document.getElementById('rwReportText').value = '';
    });

    document.getElementById('rwSubmitReport')?.addEventListener('click', () => {
      const reason = document.getElementById('rwReportText').value.trim();
      if (!reason) {
        showToast('Veuillez indiquer une raison pour le signalement.', 'error');
        return;
      }
      
      const guestReports = JSON.parse(localStorage.getItem('guest_reports') || '[]');
      guestReports.push({
        productId: String(p.id),
        productName: p.name || 'Produit sans titre',
        reason: reason,
        date: new Date().toLocaleDateString('fr-FR')
      });
      localStorage.setItem('guest_reports', JSON.stringify(guestReports));
      
      document.getElementById('rwReportArea').style.display = 'none';
      document.getElementById('rwReportText').value = '';
      showToast('⚠️ Produit signalé à nos équipes de modération.');
    });

    document.getElementById('rwSubmitComment')?.addEventListener('click', () => {
      const text = document.getElementById('rwCommentText').value.trim();
      if (!text) return;
      document.getElementById('rwCommentText').value = '';
      
      const userName = (typeof GoldAuth !== 'undefined' && GoldAuth.isLoggedIn()) ? (GoldAuth.getUser().prenom || GoldAuth.getUser().firstName) : 'Visiteur';
      const dateStr = new Date().toLocaleDateString('fr-FR');
      
      const commentHtml = `
        <div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
          <div style="font-weight:600; color:var(--honey); margin-bottom:4px;">${userName} <span style="font-size:0.65rem;color:var(--muted);font-weight:normal;margin-left:5px;">${dateStr}</span></div>
          <div>${text}</div>
        </div>
      `;
      document.getElementById('rwCommentsList').insertAdjacentHTML('afterbegin', commentHtml);
      
      // Save to localStorage
      const guestComments = JSON.parse(localStorage.getItem('guest_comments') || '[]');
      guestComments.push({
        productId: String(p.id),
        productName: p.name || 'Produit sans titre',
        userName: userName,
        text: text,
        date: dateStr
      });
      localStorage.setItem('guest_comments', JSON.stringify(guestComments));
      
      showToast('Commentaire publié avec succès');
    });

    backdrop.classList.add('open');
  }

  /* ═══════════════════════════════
     UPDATE CATEGORY COUNTS
  ═══════════════════════════════ */
  function updateCategoryCounts() {
    const counts = { all: products.length, vinyles: 0, cassettes: 0, instruments: 0, posters: 0, cd: 0 };
    products.forEach(p => {
      if (counts[p.cat] !== undefined) counts[p.cat]++;
    });
    
    document.getElementById('count-all') && (document.getElementById('count-all').textContent = counts.all);
    document.getElementById('count-vinyles') && (document.getElementById('count-vinyles').textContent = counts.vinyles);
    document.getElementById('count-cassettes') && (document.getElementById('count-cassettes').textContent = counts.cassettes);
    document.getElementById('count-instruments') && (document.getElementById('count-instruments').textContent = counts.instruments);
    document.getElementById('count-posters') && (document.getElementById('count-posters').textContent = counts.posters);
    document.getElementById('count-cd') && (document.getElementById('count-cd').textContent = counts.cd);
  }

  /* ═══════════════════════════════
     RENDER PRODUCTS
  ═══════════════════════════════ */
  function renderProducts() {
    const grid    = document.getElementById('products-grid');
    const list    = document.getElementById('products-list');
    const noRes   = document.getElementById('no-results');
    const countEl = document.getElementById('result-count');
    if (!grid) return;

    const items = filtered.slice((currentPage-1)*perPage, currentPage*perPage);
    if (countEl) countEl.innerHTML = `<strong>${filtered.length}</strong> produits trouvés`;

    if (filtered.length === 0) {
      grid.innerHTML = ''; if(list) list.innerHTML = '';
      noRes?.classList.add('show'); 
      noRes.style.display = 'block';
      return;
    }
    noRes?.classList.remove('show');
    if (noRes) noRes.style.display = 'none';

    grid.innerHTML = items.map((p,i) => `
      <article class="prod-card-catalogue" data-id="${p.id}" style="animation-delay:${i*0.06}s;cursor:pointer">
          <div class="pcc-thumb">
            ${p.photo ? `<img src="${API_BASE.replace('/api','')}/${p.photo}" class="prod-thumb-img" style="object-fit:cover" />` : `<div class="prod-thumb-img">${catIcon(p.cat)}</div>`}
          <button class="pcc-heart heart-btn" data-id="${p.id}" aria-label="Favoris"><i class="far fa-heart"></i></button>
          <button class="quick-add-cat add-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" style="background:var(--paprika);color:#fff;">
            <i class="fas fa-plus"></i> Ajouter au panier
          </button>
        </div>
        <div class="pcc-info">
          <div class="pcc-seller">
            <span class="pcc-seller-name"><i class="fas fa-store" style="color:var(--honey);margin-right:5px;"></i>${p.seller.name}</span>
          </div>
          <div class="pcc-meta">${catLabel(p.cat)} · ${p.year} · ${p.condition.toUpperCase()}</div>
          <div class="pcc-name">${p.name}</div>
          <div class="pcc-artist">${p.artist}</div>
          <div class="pcc-footer">
            <div>
              <span class="pcc-price">${p.price.toFixed(2).replace('.',',')} €</span>
            </div>
            <div style="font-size:0.7rem; color:var(--muted);">${p.rarete.toUpperCase().replace('_', ' ')}</div>
          </div>
        </div>
      </article>`).join('');

    if (list) {
      list.innerHTML = items.map(p => `
        <article class="prod-card-list" data-id="${p.id}" style="cursor:pointer">
          <div class="pcl-thumb">${p.photo ? `<img src="${API_BASE.replace('/api','')}/${p.photo}" style="width:100%;height:100%;object-fit:cover;" />` : catIcon(p.cat)}</div>
          <div class="pcl-body">
            <div class="pcl-meta">${p.cat} · ${p.year} · ${p.condition.toUpperCase()} · ${p.rarete.toUpperCase().replace('_', ' ')}</div>
            <div class="pcl-name">${p.name}</div>
            <div class="pcl-artist">${p.artist}</div>
            <div class="pcl-desc" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.desc}</div>
            <div class="pcl-seller">
              <span><i class="fas fa-store" style="color:var(--honey);margin-right:5px;"></i>${p.seller.name}</span>
            </div>
          </div>
          <div class="pcl-action">
            <div>
              <div class="pcl-price">${p.price.toFixed(2).replace('.',',')} €</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="pcl-heart heart-btn" data-id="${p.id}"><i class="far fa-heart"></i></button>
              <button class="pcl-btn add-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
                <i class="fas fa-plus"></i> Panier
              </button>
            </div>
          </div>
        </article>`).join('');
    }

    renderPagination();
    bindCardEvents();
    revealCards();
    updateCartBadges();
  }

  /* ─── CARD EVENTS ─── */
  function bindCardEvents() {
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        await GoldAuth.addToCart({
          id: String(btn.dataset.id),
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price || 0),
          emoji: ''
        });
        updateCartBadges();
      });
    });

    document.querySelectorAll('.heart-btn').forEach(btn => {
      const pid = String(btn.dataset.id||'');
      if (isLoggedIn() && pid && GoldAuth.isFav(pid)) {
        btn.classList.add('liked');
        btn.innerHTML='<i class="fas fa-heart"></i>';
      }
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!isLoggedIn()) { askLogin('ajouter aux favoris'); return; }
        const added = GoldAuth.toggleFav(pid);
        btn.classList.toggle('liked', added);
        btn.innerHTML = `<i class="${added?'fas':'far'} fa-heart"></i>`;
        showToast(added ? 'Ajouté aux favoris' : 'Retiré des favoris');
      });
    });

    document.querySelectorAll('.prod-card-catalogue,.prod-card-list').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        openModal(parseInt(card.dataset.id));
      });
    });
  }

  /* ─── SEARCH OVERLAY ─── */
  const searchOverlay = document.getElementById('searchOverlay');
  document.querySelectorAll('.search-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      searchOverlay?.classList.add('open');
      setTimeout(() => searchOverlay?.querySelector('input')?.focus(), 120);
    });
  });
  document.querySelector('.search-close')?.addEventListener('click', () => searchOverlay?.classList.remove('open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchOverlay?.classList.remove('open'); closeModal(); }
  });
  searchOverlay?.addEventListener('click', e => { if(e.target===searchOverlay) searchOverlay.classList.remove('open'); });

  const overlayInput = searchOverlay?.querySelector('input');
  overlayInput?.addEventListener('input', () => {
    const q = overlayInput.value.trim().toLowerCase();
    activeFilters.search = q;
    const el = document.getElementById('filter-search');
    if (el) el.value = overlayInput.value.trim();
    applyFilters();
  });

  /* ─── APPLY FILTERS ─── */
  function applyFilters() {
    filtered = products.filter(p => {
      const catOk    = activeFilters.cats.length===0 || activeFilters.cats.includes(p.cat);
      const condOk   = activeFilters.conditions.length===0 || activeFilters.conditions.includes(p.condition);
      const rareOk   = activeFilters.raretes.length===0 || activeFilters.raretes.includes(p.rarete);
      const priceOk  = p.price>=activeFilters.minPrice && p.price<=activeFilters.maxPrice;
      const searchOk = activeFilters.search==='' ||
        p.name.toLowerCase().includes(activeFilters.search) ||
        p.artist.toLowerCase().includes(activeFilters.search);
      return catOk && condOk && rareOk && priceOk && searchOk;
    });
    currentPage=1; renderProducts(); renderActiveFilterTags();
  }

  /* ─── SORT ─── */
  document.getElementById('sort-select')?.addEventListener('change', e => {
    const v=e.target.value;
    if(v==='price-asc')       filtered.sort((a,b)=>a.price-b.price);
    else if(v==='price-desc') filtered.sort((a,b)=>b.price-a.price);
    else if(v==='newest')     filtered.sort((a,b)=>b.year-a.year);
    else filtered=[...products].filter(p=>filtered.some(f=>f.id===p.id));
    currentPage=1; renderProducts();
  });

  /* ─── CATEGORY TABS ─── */
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const cat=tab.dataset.cat;
      activeFilters.cats = cat==='all' ? [] : [cat];
      document.querySelectorAll('.cat-checkbox').forEach(cb => {
        cb.checked=cb.value===cat;
        const c=cb.closest('.filter-option')?.querySelector('.custom-check'); if(c) c.textContent=cb.checked?'✓':'';
      });
      applyFilters();
    });
  });

  /* ─── SIDEBAR CHECKBOXES ─── */
  document.querySelectorAll('.cat-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const c=cb.closest('.filter-option')?.querySelector('.custom-check'); if(c) c.textContent=cb.checked?'✓':'';
      activeFilters.cats=[...document.querySelectorAll('.cat-checkbox:checked')].map(x=>x.value);
      applyFilters();
    });
  });

  // ETAT
  document.querySelectorAll('.condition-btn:not(.rarete-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      btn.style.color = btn.classList.contains('active') ? '#111' : 'var(--muted)';
      btn.style.background = btn.classList.contains('active') ? 'var(--honey)' : 'transparent';
      btn.style.borderColor = btn.classList.contains('active') ? 'var(--honey)' : 'var(--biscuit)';
      activeFilters.conditions=[...document.querySelectorAll('.condition-btn.active:not(.rarete-btn)')].map(b=>b.dataset.val);
      applyFilters();
    });
  });

  // RARETE
  document.querySelectorAll('.rarete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      btn.style.color = btn.classList.contains('active') ? '#111' : 'var(--muted)';
      btn.style.background = btn.classList.contains('active') ? 'var(--honey)' : 'transparent';
      btn.style.borderColor = btn.classList.contains('active') ? 'var(--honey)' : 'var(--biscuit)';
      activeFilters.raretes=[...document.querySelectorAll('.rarete-btn.active')].map(b=>b.dataset.val);
      applyFilters();
    });
  });

  document.getElementById('filter-search')?.addEventListener('input', e => {
    activeFilters.search=e.target.value.toLowerCase().trim(); applyFilters();
  });

  const priceSlider=document.getElementById('price-max'), priceDisplay=document.getElementById('price-max-display');
  priceSlider?.addEventListener('input', () => {
    const v=parseInt(priceSlider.value); activeFilters.maxPrice=v;
    if(priceDisplay) priceDisplay.textContent=v.toLocaleString('fr-FR')+' €';
    const fill=document.querySelector('.range-fill'); if(fill) fill.style.right=(100-(v/5000)*100)+'%';
    applyFilters();
  });

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    activeFilters={cats:[],conditions:[],raretes:[],minPrice:0,maxPrice:5000,minRating:0,search:''};
    document.querySelectorAll('.cat-checkbox').forEach(cb=>{cb.checked=false;const c=cb.closest('.filter-option')?.querySelector('.custom-check');if(c)c.textContent='';});
    document.querySelectorAll('.condition-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.color = 'var(--muted)';
      btn.style.background = 'transparent';
      btn.style.borderColor = 'var(--biscuit)';
    });
    document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));
    document.querySelector('.cat-tab[data-cat="all"]')?.classList.add('active');
    if(priceSlider) priceSlider.value=5000;
    if(priceDisplay) priceDisplay.textContent='5 000 €';
    const fill=document.querySelector('.range-fill'); if(fill) fill.style.right='0%';
    const searchEl=document.getElementById('filter-search'); if(searchEl) searchEl.value='';
    filtered=[...products]; currentPage=1; renderProducts(); renderActiveFilterTags();
  });

  /* ─── ACTIVE FILTER TAGS ─── */
  function renderActiveFilterTags() {
    const container=document.getElementById('active-filters-row'), card=document.getElementById('active-filters-card');
    if(!container) return;
    const tags=[];
    activeFilters.cats.forEach(c=>tags.push({label:c,key:'cat',val:c}));
    activeFilters.conditions.forEach(c=>tags.push({label:'État: '+c,key:'cond',val:c}));
    activeFilters.raretes.forEach(c=>tags.push({label:'Rareté: '+c.replace('_',' '),key:'rare',val:c}));
    if(activeFilters.maxPrice<5000) tags.push({label:'max '+activeFilters.maxPrice+' €',key:'price',val:activeFilters.maxPrice});
    if(activeFilters.search) tags.push({label:'"'+activeFilters.search+'"',key:'search',val:''});
    if(card) card.style.display=tags.length?'block':'none';
    container.innerHTML=tags.length>0
      ? tags.map(t=>`<span class="active-filter-tag" style="background:var(--ink2);border:1px solid var(--biscuit);color:var(--honey);border-radius:20px;padding:4px 12px;font-size:0.8rem;display:inline-flex;align-items:center;gap:6px;">${t.label} <button style="background:none;border:none;color:var(--honey);cursor:pointer;font-size:1rem;line-height:1;" onclick="removeFilter('${t.key}','${t.val}')">×</button></span>`).join('')
        +'<button class="clear-all-btn" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.8rem;margin-left:auto;" onclick="clearAllFilters()">Tout effacer</button>'
      : '';
  }
  window.removeFilter=(key,val)=>{
    if(key==='cat') activeFilters.cats=activeFilters.cats.filter(c=>c!==val);
    if(key==='cond') activeFilters.conditions=activeFilters.conditions.filter(c=>c!==val);
    if(key==='rare') activeFilters.raretes=activeFilters.raretes.filter(c=>c!==val);
    if(key==='price') activeFilters.maxPrice=5000;
    if(key==='search'){activeFilters.search='';const s=document.getElementById('filter-search');if(s)s.value='';}
    applyFilters();
    // Also visual updates
    document.querySelectorAll('.condition-btn').forEach(btn => {
      if ((btn.dataset.val === val && key==='cond') || (btn.dataset.val === val && key==='rare')) {
         btn.classList.remove('active');
         btn.style.color = 'var(--muted)';
         btn.style.background = 'transparent';
         btn.style.borderColor = 'var(--biscuit)';
      }
    });
    if(key==='cat') {
      document.querySelectorAll('.cat-checkbox').forEach(cb => {
        if(cb.value===val) { cb.checked=false; const c=cb.closest('.filter-option')?.querySelector('.custom-check'); if(c) c.textContent=''; }
      });
    }
  };
  window.clearAllFilters=()=>document.getElementById('clear-filters')?.click();

  /* ─── VIEW TOGGLE ─── */
  const gridView=document.getElementById('products-grid'), listView=document.getElementById('products-list');
  document.getElementById('btn-grid')?.addEventListener('click',()=>{
    currentView='grid';
    document.getElementById('btn-grid').style.color='var(--ink)';
    document.getElementById('btn-list').style.color='var(--muted)';
    if(listView)listView.style.display='none';
    gridView?.style.removeProperty('display');
  });
  document.getElementById('btn-list')?.addEventListener('click',()=>{
    currentView='list';
    document.getElementById('btn-list').style.color='var(--ink)';
    document.getElementById('btn-grid').style.color='var(--muted)';
    if(gridView)gridView.style.display='none';
    if(listView)listView.style.display='flex';
  });

  /* ─── PAGINATION ─── */
  function renderPagination() {
    const c=document.getElementById('pagination'); if(!c) return;
    const tp=Math.ceil(filtered.length/perPage); if(tp<=1){c.innerHTML='';return;}
    let h=`<button class="page-btn nav-page" style="background:var(--ink2);border:1px solid var(--biscuit);color:var(--muted);width:35px;height:35px;border-radius:8px;cursor:pointer;" ${currentPage===1?'disabled':''} onclick="goPage(${currentPage-1})"><i class="fas fa-chevron-left"></i></button>`;
    for(let i=1;i<=tp;i++){
      if(i===1||i===tp||Math.abs(i-currentPage)<=1) h+=`<button class="page-btn" style="background:${i===currentPage?'var(--honey)':'var(--ink2)'};border:1px solid ${i===currentPage?'var(--honey)':'var(--biscuit)'};color:${i===currentPage?'#111':'var(--muted)'};width:35px;height:35px;border-radius:8px;cursor:pointer;" onclick="goPage(${i})">${i}</button>`;
      else if(i===currentPage-2||i===currentPage+2) h+=`<span class="page-dots" style="color:var(--muted);margin:0 5px;">…</span>`;
    }
    h+=`<button class="page-btn nav-page" style="background:var(--ink2);border:1px solid var(--biscuit);color:var(--muted);width:35px;height:35px;border-radius:8px;cursor:pointer;" ${currentPage===tp?'disabled':''} onclick="goPage(${currentPage+1})"><i class="fas fa-chevron-right"></i></button>`;
    c.innerHTML=h;
  }
  window.goPage=p=>{currentPage=p;renderProducts();window.scrollTo({top:200,behavior:'smooth'});};

  /* ─── SIDEBAR COLLAPSE ─── */
  document.querySelectorAll('.sidebar-header').forEach(h=>{
    const t=h.querySelector('.sidebar-toggle'),b=h.nextElementSibling;
    t?.addEventListener('click',e=>{
      e.stopPropagation();
      b?.classList.toggle('collapsed');
      t.classList.toggle('open');
      t.innerHTML=b?.classList.contains('collapsed')?'<i class="fas fa-plus"></i>':'<i class="fas fa-minus"></i>';
    });
  });

  /* ─── REVEAL ─── */
  function revealCards() {
    document.querySelectorAll('.prod-card-catalogue').forEach((card,i)=>{
      card.style.opacity='0'; card.style.transform='translateY(18px)';
      card.style.transition=`opacity .38s ease ${i*.055}s,transform .38s ease ${i*.055}s`;
      setTimeout(()=>{card.style.opacity='1';card.style.transform='translateY(0)';},50);
    });
  }

  const navbar=document.querySelector('.navbar');
  window.addEventListener('scroll',()=>navbar?.classList.toggle('scrolled',window.scrollY>40),{passive:true});

});