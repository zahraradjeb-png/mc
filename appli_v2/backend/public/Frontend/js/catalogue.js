/* ═══════════════════════════════════════
   CATALOGUE.JS — Gold v3
   Filter · Sort · Modal · Auth · Search
═══════════════════════════════════════ */

/* API_BASE : api-config.js + auth-system.js (chargés avant ce fichier) */

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
      
      // Adapt backend data to frontend format
      products = data.map(p => ({
        id: p.id_produit,
        name: p.titre,
        artist: p.artiste || 'Artiste inconnu',
        cat: p.categorie_nom?.toLowerCase() || 'autres',
        price: parseFloat(p.prix),
        oldPrice: null, // Backend doesn't have this yet
        year: p.annee || p.decennie || 'N/A',
        badge: p.rarete?.toLowerCase() === 'rare' ? 'rare' : null,
        condition: p.etat?.toLowerCase() || 'bon',
        rating: 5, // Mock rating as backend doesn't have it
        seller: {
          init: (p.vendeur_nom || 'V')[0],
          name: p.vendeur_nom || 'Vendeur Gold',
          rating: 4.8
        },
        desc: p.description,
        photo: p.photo_principale || null
      }));

      filtered = [...products];
      renderProducts();
    } catch (err) {
      console.error('Erreur fetch produits:', err);
      showToast('Impossible de charger les produits', 'error');
    }
  }

  /* Initial call */
  fetchProducts();
  let currentView = 'grid';
  let currentPage = 1;
  const perPage = 9;
  let activeFilters = { cats:[], conditions:[], minPrice:0, maxPrice:5000, minRating:0, search:'' };

  /* ─── AUTH ─── */
  const isLoggedIn = () => typeof GoldAuth !== 'undefined' && GoldAuth.isLoggedIn();
  const askLogin   = a => typeof requireLogin !== 'undefined' ? requireLogin(a) : (window.location.href='login.html?redirect=catalogue.html');
  const updateCartBadges = () => {
    if (typeof GoldAuth === 'undefined') return;
    const c = GoldAuth.getCartCount();
    document.querySelectorAll('.cbadge,#cartBadge,.cart-badge').forEach(b => { b.textContent=c; b.style.display=c>0?'flex':'none'; });
  };

  /* ─── TOAST ─── */
  const showToast = msg => {
    const t=document.getElementById('toast'), tm=document.getElementById('tmsg');
    if (!t||!tm) return;
    tm.textContent=msg; t.classList.add('show');
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3000);
  };

  const catLabel = c => ({vinyles:'Vinyle',cassettes:'Cassette',instruments:'Instrument',electronique:'Électronique',cd:'CD',posters:'Poster'}[c]||c);

  /* ═══════════════════════════════
     MODAL PRODUIT
  ═══════════════════════════════ */
  const STORIES = {
    1:  "Enregistré en 1970 dans le mythique Headley Grange, Led Zeppelin IV est l'un des albums les plus vendus de l'histoire du rock. Immortalisé par Stairway to Heaven, ce pressage original dégage une chaleur sonore incomparable. La pochette sans titre reste l'une des plus énigmatiques du rock.",
    2:  "Double album concept sorti en 1979, The Wall est l'œuvre la plus ambitieuse de Pink Floyd. Ce pressage UK original capte toute la richesse orchestrale, de Another Brick in the Wall à Comfortably Numb. Une pièce de collection absolue pour tout amateur de rock progressif.",
    3:  "Cassette originale de l'album le plus vendu de tous les temps. Thriller de Michael Jackson a révolutionné la pop et le R&B en 1982. Cette cassette conserve toute l'énergie des productions légendaires de Quincy Jones.",
    4:  "La Fender Stratocaster de 1965 représente l'âge d'or de la lutherie américaine. Fabriquée à Fullerton avant le rachat par CBS, elle possède un son cristallin et une playabilité exceptionnelle. Un investissement autant qu'un instrument.",
    5:  "Enregistré en deux sessions en 1959, Kind of Blue est le disque de jazz le plus vendu de l'histoire. Ce pressage rare capture la naissance du jazz modal avec une clarté saisissante. Avec Coltrane, Evans et Chambers — une session au sommet absolu.",
    6:  "Dernier album enregistré par les Beatles, Abbey Road (1969) est une œuvre testamentaire d'une beauté intemporelle. Ce pressage UK Parlophone original, avec son étiquette apple, est l'un des plus recherchés par les collectionneurs.",
    7:  "Nevermind a explosé en 1991 et changé la face du rock mondial. Ce pressage DGC Records conserve toute l'énergie brute de Kurt Cobain. La révolution grunge sur vinyle dans un état remarquable.",
    8:  "Magnétophone à cassette portatif Grundig des années 70, entièrement fonctionnel. Il témoigne d'une époque où la qualité de fabrication primait. Une pièce rare pour collection ou usage audiophile authentique.",
    9:  "Lot de cassettes vierges TDK SA 90, le nec plus ultra de l'enregistrement analogique. Jamais utilisées, dans leur packaging d'origine scellé. Pour les puristes du son analogique.",
    10: "Affiche de concert originale du Wall Tour 1980 de Pink Floyd. Document historique rare en format 60x90cm. Une pièce de collection pour tout fan de la pochette emblématique.",
    11: "Pressage MFSL Ultradisc du Dark Side of the Moon. Resté 741 semaines dans le Billboard 200, cet album est un monument absolu. Roger Waters, David Gilmour et Nick Mason au sommet de leur art.",
    12: "Reproduction lithographique sur papier 300g de la légendaire performance de Woodstock 1969. Format 50x70cm. Jimi Hendrix à l'apogée de son art, immortalisé pour toujours.",
    13: "Gibson Les Paul Standard 1968 avec corps en acajou d'origine et micros PAF. Un investissement autant qu'un instrument. Certificat d'authenticité et expertise inclus.",
    14: "Cassette Epic originale de Bad (1987). La suite de Thriller avec des productions légendaires de Quincy Jones. Jaquette parfaitement conservée, son d'époque intact.",
    15: "Affiche de tournée américaine des Rolling Stones en 1971. Document historique d'une époque iconique, témoin de l'âge d'or du rock. Pièce rare pour tout collectionneur sérieux.",
    16: "Enregistré dans la douleur d'une séparation collective, Rumours de Fleetwood Mac (1977) est un chef-d'œuvre absolu. Go Your Own Way, The Chain, Dreams — chaque titre est un classique éternel.",
    17: "Le Sony Walkman WM-2, sorti en 1982, a révolutionné l'écoute nomade. Cet exemplaire fonctionne parfaitement et conserve son charme rétro incomparable, livré avec ses écouteurs d'origine.",
    18: "L'ampli Marantz 2270 est une légende de la haute-fidélité des années 70. Révisé et calibré par un technicien certifié, il délivre un son chaud et précis que les audiophiles s'arrachent.",
    19: "Premier pressage CD de Dark Side of the Moon par EMI en 1992. La transition analogique-numérique de l'album le plus iconique du rock progressif, avec livret complet en état parfait.",
    20: "Édition spéciale de Thriller en CD avec bonus tracks exclusifs et livret enrichi de 32 pages. Michael Jackson au sommet de son art, dans un packaging soigneusement préservé.",
  };

  /* Injection styles modal */
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
      .rw-modal-badge-wrap { position:absolute;top:16px;left:16px;z-index:2; }
      .rw-modal-badge { padding:5px 13px;border-radius:100px;font-size:.58rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase; }
      .rw-modal-badge.rare { background:rgba(110,72,12,.95);color:#E5A657;border:1px solid rgba(229,166,87,.28); }
      .rw-modal-badge.new  { background:rgba(35,105,55,.95);color:#8fdba8; }
      .rw-modal-badge.sale { background:rgba(181,51,36,.95);color:#fff; }
      .rw-modal-seller {
        position:relative;z-index:1;display:flex;align-items:center;gap:9px;
        background:rgba(0,0,0,.45);border:1px solid rgba(229,166,87,.1);
        border-radius:100px;padding:7px 16px;backdrop-filter:blur(6px);
      }
      .rw-modal-seller-av { width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#B53324,#E5A657);display:flex;align-items:center;justify-content:center;font-size:.64rem;font-weight:700;color:#fff;flex-shrink:0; }
      .rw-modal-seller-nm { font-size:.74rem;color:rgba(245,226,206,.82);font-family:'Jost',sans-serif;display:block; }
      .rw-modal-seller-rt { font-size:.63rem;color:#E5A657;display:block; }
      .rw-modal-right { padding:28px 26px 24px;display:flex;flex-direction:column;gap:13px; }
      .rw-modal-close { position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:rgba(245,226,206,.07);border:1px solid rgba(245,226,206,.09);color:rgba(245,226,206,.45);font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .22s;z-index:10; }
      .rw-modal-close:hover { background:rgba(181,51,36,.3);color:#fff;border-color:rgba(181,51,36,.5); }
      .rw-modal-cat { font-family:'Jost',sans-serif;font-size:.63rem;letter-spacing:.15em;text-transform:uppercase;color:#E5A657;opacity:.7; }
      .rw-modal-title { font-family:'Cormorant',serif;font-size:1.9rem;font-weight:600;color:#F5E2CE;line-height:1.18;margin:3px 0 0; }
      .rw-modal-artist { font-family:'Jost',sans-serif;font-size:.8rem;color:rgba(245,226,206,.36);margin-top:3px; }
      .rw-modal-rating { font-family:'Jost',sans-serif;font-size:.78rem;color:#E5A657;display:flex;align-items:center;gap:6px; }
      .rw-modal-rating i { font-size:.65rem; }
      .rw-modal-price-row { display:flex;align-items:baseline;gap:12px; }
      .rw-modal-price { font-family:'Cormorant',serif;font-size:2.1rem;font-weight:600;color:#E5A657;line-height:1; }
      .rw-modal-old { font-size:.8rem;color:rgba(245,226,206,.2);text-decoration:line-through; }
      .rw-modal-div { height:1px;background:linear-gradient(to right,rgba(229,166,87,.16),transparent); }
      .rw-modal-story-lbl { font-family:'Jost',sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(229,166,87,.42);margin-bottom:7px; }
      .rw-modal-story { font-family:'Cormorant',serif;font-size:1rem;font-weight:300;color:rgba(245,226,206,.65);line-height:1.85;font-style:italic;margin:0; }
      .rw-modal-tags { display:flex;flex-wrap:wrap;gap:6px; }
      .rw-modal-tag { padding:4px 12px;border-radius:100px;border:1px solid rgba(229,166,87,.13);font-family:'Jost',sans-serif;font-size:.66rem;color:rgba(245,226,206,.38); }
      .rw-modal-actions { display:flex;gap:9px;margin-top:4px; }
      .rw-modal-btn-cart { flex:1;padding:13px;border-radius:11px;background:linear-gradient(135deg,#B53324,#8a1f14);color:#fff;border:none;cursor:pointer;font-family:'Jost',sans-serif;font-size:.84rem;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .22s;box-shadow:0 4px 20px rgba(181,51,36,.28); }
      .rw-modal-btn-cart:hover { opacity:.88;transform:translateY(-1px);box-shadow:0 8px 28px rgba(181,51,36,.42); }
      .rw-modal-btn-fav { width:48px;height:48px;border-radius:11px;border:1px solid rgba(229,166,87,.16);background:transparent;color:rgba(245,226,206,.42);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .22s; }
      .rw-modal-btn-fav:hover,.rw-modal-btn-fav.liked { background:rgba(181,51,36,.14);color:#e05040;border-color:rgba(181,51,36,.34); }
      .rw-modal-btn-link { width:48px;height:48px;border-radius:11px;border:1px solid rgba(229,166,87,.16);background:transparent;color:rgba(245,226,206,.38);font-size:.9rem;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:all .22s; }
      .rw-modal-btn-link:hover { background:rgba(229,166,87,.07);color:#E5A657;border-color:rgba(229,166,87,.3); }
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
    const story = STORIES[id] || 'Une pièce rare et authentique, soigneusement sélectionnée et certifiée par nos experts.';
    const cl    = catLabel(p.cat);
    const favOn = isLoggedIn() && GoldAuth.isFav(String(id));

    modal.innerHTML = `
      <button class="rw-modal-close" id="rwClose"><i class="fas fa-times"></i></button>
      <div class="rw-modal-left">
        <div class="rw-modal-badge-wrap">
          ${p.badge ? `<span class="rw-modal-badge ${p.badge}">${p.badge==='rare'?'Rare':p.badge==='new'?'Nouveau':'Promo'}</span>` : ''}
        </div>
        <div class="rw-modal-cat-icon">${catIcon(p.cat)}</div>
        <div class="rw-modal-seller">
          <div class="rw-modal-seller-av">${p.seller.init}</div>
          <div><span class="rw-modal-seller-nm">${p.seller.name}</span><span class="rw-modal-seller-rt">${p.seller.rating}/5</span></div>
        </div>
      </div>
      <div class="rw-modal-right">
        <div>
          <div class="rw-modal-cat">${cl} · ${p.year} · ${p.condition}</div>
          <h2 class="rw-modal-title">${p.name}</h2>
          <div class="rw-modal-artist">${p.artist}</div>
        </div>
        <div class="rw-modal-rating">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          <i class="${p.rating>=4?'fas':'far'} fa-star"></i>
          <i class="${p.rating>=5?'fas':'far'} fa-star"></i>
          <span style="color:rgba(245,226,206,.4);font-size:.72rem;margin-left:2px">${p.rating}/5</span>
        </div>
        <div class="rw-modal-price-row">
          <span class="rw-modal-price">${p.price.toFixed(2).replace('.',',')} €</span>
          ${p.oldPrice ? `<span class="rw-modal-old">${p.oldPrice} €</span>` : ''}
        </div>
        <div class="rw-modal-div"></div>
        <div>
          <div class="rw-modal-story-lbl">Histoire &amp; provenance</div>
          <p class="rw-modal-story">${story}</p>
        </div>
        <div class="rw-modal-tags">
          <span class="rw-modal-tag">${cl}</span>
          <span class="rw-modal-tag">${p.year}</span>
          <span class="rw-modal-tag">${p.condition}</span>
          <span class="rw-modal-tag"><i class="fas fa-certificate" style="color:#E5A657;margin-right:3px;font-size:.58rem"></i>Certifié</span>
          <span class="rw-modal-tag"><i class="fas fa-undo" style="margin-right:3px;font-size:.58rem"></i>Retour 30j</span>
        </div>
        <div class="rw-modal-actions">
          <button class="rw-modal-btn-cart" id="rwCart"><i class="fas fa-shopping-bag"></i> Ajouter au panier</button>
          <button class="rw-modal-btn-fav ${favOn?'liked':''}" id="rwFav"><i class="${favOn?'fas':'far'} fa-heart"></i></button>
          <a href="product.html?id=${p.id}" class="rw-modal-btn-link" title="Fiche complète" onclick="event.stopPropagation()"><i class="fas fa-arrow-right"></i></a>
        </div>
      </div>`;

    document.getElementById('rwClose')?.addEventListener('click', closeModal);

    document.getElementById('rwCart')?.addEventListener('click', async () => {
      if (!isLoggedIn()) { askLogin('ajouter des produits au panier'); return; }
      await GoldAuth.addToCart({ id: String(p.id), name: p.name, price: p.price, emoji: '' });
      updateCartBadges();
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

    backdrop.classList.add('open');
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
      noRes?.classList.add('show'); return;
    }
    noRes?.classList.remove('show');

    grid.innerHTML = items.map((p,i) => `
      <article class="prod-card-catalogue" data-id="${p.id}" style="animation-delay:${i*0.06}s;cursor:pointer">
          <div class="pcc-thumb">
            ${p.photo ? `<img src="${API_BASE.replace('/api','')}/${p.photo}" class="prod-thumb-img" style="object-fit:cover" />` : `<div class="prod-thumb-img">${catIcon(p.cat)}</div>`}
          <div class="pcc-badges">
            ${p.badge==='rare'?'<span class="prod-badge b-rare">Rare</span>':''}
            ${p.badge==='new'?'<span class="prod-badge b-new">Nouveau</span>':''}
            ${p.badge==='sale'?'<span class="prod-badge b-sale">Promo</span>':''}
          </div>
          <button class="pcc-heart heart-btn" data-id="${p.id}" aria-label="Favoris"><i class="far fa-heart"></i></button>
          <button class="quick-add-cat add-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
            <i class="fas fa-plus"></i> Ajouter au panier
          </button>
        </div>
        <div class="pcc-info">
          <div class="pcc-seller">
            <div class="pcc-seller-dot">${p.seller.init}</div>
            <span class="pcc-seller-name">${p.seller.name}</span>
            <span class="pcc-seller-rating"><i class="fas fa-star" style="font-size:.55rem"></i> ${p.seller.rating}</span>
          </div>
          <div class="pcc-meta">${catLabel(p.cat)} · ${p.year}</div>
          <div class="pcc-name">${p.name}</div>
          <div class="pcc-artist">${p.artist}</div>
          <div class="pcc-footer">
            <div>
              <span class="pcc-price">${p.price.toFixed(2).replace('.',',')} €</span>
              ${p.oldPrice?`<span class="pcc-old">${p.oldPrice} €</span>`:''}
            </div>
            <div class="pcc-stars">${p.rating}/5</div>
          </div>
        </div>
      </article>`).join('');

    if (list) {
      list.innerHTML = items.map(p => `
        <article class="prod-card-list" data-id="${p.id}" style="cursor:pointer">
          <div class="pcl-thumb">${catIcon(p.cat)}</div>
          <div class="pcl-body">
            <div class="pcl-badges">
              ${p.badge==='rare'?'<span class="prod-badge b-rare">Rare</span>':''}
              ${p.badge==='new'?'<span class="prod-badge b-new">Nouveau</span>':''}
              ${p.badge==='sale'?'<span class="prod-badge b-sale">Promo</span>':''}
            </div>
            <div class="pcl-meta">${p.cat} · ${p.year} · ${p.condition}</div>
            <div class="pcl-name">${p.name}</div>
            <div class="pcl-artist">${p.artist}</div>
            <div class="pcl-desc">${p.desc}</div>
            <div class="pcl-seller">
              <div class="pcl-seller-dot">${p.seller.init}</div>
              <span>${p.seller.name} · ${p.seller.rating}/5</span>
            </div>
          </div>
          <div class="pcl-action">
            <div>
              <div class="pcl-price">${p.price.toFixed(2).replace('.',',')} €</div>
              ${p.oldPrice?`<div class="pcl-old">${p.oldPrice} €</div>`:''}
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="pcl-heart heart-btn" data-id="${p.id}"><i class="far fa-heart"></i></button>
              <button class="pcl-btn add-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
                <i class="fas fa-plus"></i> Panier
              </button>
            </div>
            <a href="product.html?id=${p.id}" style="font-size:.75rem;color:var(--amber);text-align:center" onclick="event.stopPropagation()">Voir détails →</a>
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
        if (!isLoggedIn()) { askLogin('ajouter des produits au panier'); return; }
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
  searchOverlay?.querySelectorAll('.search-hints span').forEach(span => {
    span.style.cursor='pointer';
    span.addEventListener('click', () => {
      activeFilters.search = span.textContent.toLowerCase();
      const el=document.getElementById('filter-search'); if(el) el.value=span.textContent;
      searchOverlay.classList.remove('open');
      applyFilters();
    });
  });

  /* ─── APPLY FILTERS ─── */
  function applyFilters() {
    filtered = products.filter(p => {
      const catOk    = activeFilters.cats.length===0 || activeFilters.cats.includes(p.cat);
      const condOk   = activeFilters.conditions.length===0 || activeFilters.conditions.includes(p.condition);
      const priceOk  = p.price>=activeFilters.minPrice && p.price<=activeFilters.maxPrice;
      const ratingOk = p.rating>=activeFilters.minRating;
      const searchOk = activeFilters.search==='' ||
        p.name.toLowerCase().includes(activeFilters.search) ||
        p.artist.toLowerCase().includes(activeFilters.search);
      return catOk && condOk && priceOk && ratingOk && searchOk;
    });
    currentPage=1; renderProducts(); renderActiveFilterTags();
  }

  /* ─── SORT ─── */
  document.getElementById('sort-select')?.addEventListener('change', e => {
    const v=e.target.value;
    if(v==='price-asc')       filtered.sort((a,b)=>a.price-b.price);
    else if(v==='price-desc') filtered.sort((a,b)=>b.price-a.price);
    else if(v==='newest')     filtered.sort((a,b)=>b.year-a.year);
    else if(v==='oldest')     filtered.sort((a,b)=>a.year-b.year);
    else if(v==='rating')     filtered.sort((a,b)=>b.rating-a.rating);
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

  document.querySelectorAll('.condition-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      activeFilters.conditions=[...document.querySelectorAll('.condition-btn.active')].map(b=>b.dataset.val);
      applyFilters();
    });
  });

  document.querySelectorAll('.rating-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.rating-opt').forEach(o=>o.style.background='');
      opt.style.background='var(--parchment)';
      activeFilters.minRating=parseInt(opt.dataset.rating); applyFilters();
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
    activeFilters={cats:[],conditions:[],minPrice:0,maxPrice:5000,minRating:0,search:''};
    document.querySelectorAll('.cat-checkbox').forEach(cb=>{cb.checked=false;const c=cb.closest('.filter-option')?.querySelector('.custom-check');if(c)c.textContent='';});
    document.querySelectorAll('.condition-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.rating-opt').forEach(o=>o.style.background='');
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
    if(activeFilters.minRating>0) tags.push({label:activeFilters.minRating+'/5+',key:'rating',val:activeFilters.minRating});
    if(activeFilters.maxPrice<5000) tags.push({label:'max '+activeFilters.maxPrice+' €',key:'price',val:activeFilters.maxPrice});
    if(activeFilters.search) tags.push({label:'"'+activeFilters.search+'"',key:'search',val:''});
    if(card) card.style.display=tags.length?'block':'none';
    container.innerHTML=tags.length>0
      ? tags.map(t=>`<span class="active-filter-tag">${t.label} <button onclick="removeFilter('${t.key}','${t.val}')">×</button></span>`).join('')
        +'<button class="clear-all-btn" onclick="clearAllFilters()"><i class="fas fa-times"></i> Tout effacer</button>'
      : '';
  }
  window.removeFilter=(key,val)=>{
    if(key==='cat') activeFilters.cats=activeFilters.cats.filter(c=>c!==val);
    if(key==='cond') activeFilters.conditions=activeFilters.conditions.filter(c=>c!==val);
    if(key==='rating') activeFilters.minRating=0;
    if(key==='price') activeFilters.maxPrice=5000;
    if(key==='search'){activeFilters.search='';const s=document.getElementById('filter-search');if(s)s.value='';}
    applyFilters();
  };
  window.clearAllFilters=()=>document.getElementById('clear-filters')?.click();

  /* ─── VIEW TOGGLE ─── */
  const gridView=document.getElementById('products-grid'), listView=document.getElementById('products-list');
  document.getElementById('btn-grid')?.addEventListener('click',()=>{
    currentView='grid';
    document.getElementById('btn-grid').classList.add('active');
    document.getElementById('btn-list')?.classList.remove('active');
    if(listView)listView.style.display='none';
    gridView?.style.removeProperty('display');
  });
  document.getElementById('btn-list')?.addEventListener('click',()=>{
    currentView='list';
    document.getElementById('btn-list').classList.add('active');
    document.getElementById('btn-grid')?.classList.remove('active');
    if(gridView)gridView.style.display='none';
    if(listView)listView.style.display='flex';
  });

  /* ─── PAGINATION ─── */
  function renderPagination() {
    const c=document.getElementById('pagination'); if(!c) return;
    const tp=Math.ceil(filtered.length/perPage); if(tp<=1){c.innerHTML='';return;}
    let h=`<button class="page-btn nav-page" ${currentPage===1?'disabled':''} onclick="goPage(${currentPage-1})"><i class="fas fa-chevron-left"></i></button>`;
    for(let i=1;i<=tp;i++){
      if(i===1||i===tp||Math.abs(i-currentPage)<=1) h+=`<button class="page-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
      else if(i===currentPage-2||i===currentPage+2) h+=`<span class="page-dots">…</span>`;
    }
    h+=`<button class="page-btn nav-page" ${currentPage===tp?'disabled':''} onclick="goPage(${currentPage+1})"><i class="fas fa-chevron-right"></i></button>`;
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

  /* ─── NAVBAR / SCROLL ─── */
  const navbar=document.querySelector('.navbar');
  window.addEventListener('scroll',()=>navbar?.classList.toggle('scrolled',window.scrollY>40),{passive:true});
  document.getElementById('upBtn')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  window.addEventListener('scroll',()=>document.getElementById('upBtn')?.classList.toggle('show',window.scrollY>500),{passive:true});

  /* ─── HAMBURGER ─── */
  const hbg=document.getElementById('hbg'), mobNav=document.getElementById('mobNav');
  hbg?.addEventListener('click',()=>{
    const open=mobNav?.classList.toggle('open');
    const spans=hbg.querySelectorAll('span');
    if(open){spans[0].style.transform='rotate(45deg) translate(4.5px,4.5px)';spans[1].style.opacity='0';spans[2].style.transform='rotate(-45deg) translate(4.5px,-4.5px)';}
    else{spans.forEach(s=>{s.style.transform='';s.style.opacity='';});}
  });

  /* ─── TICKER ─── */
  const ti=document.querySelector('.ticker-inner'); if(ti) ti.appendChild(ti.cloneNode(true));

  /* ─── INIT ─── */
  renderProducts(); updateCartBadges();
  const urlCat=new URLSearchParams(window.location.search).get('cat');
  if(urlCat){ const tab=document.querySelector(`.cat-tab[data-cat="${urlCat}"]`); if(tab) tab.click(); }
  const urlSearch=new URLSearchParams(window.location.search).get('search');
  if(urlSearch){ activeFilters.search=urlSearch.toLowerCase(); const el=document.getElementById('filter-search'); if(el) el.value=urlSearch; applyFilters(); }

});