/* ═══════════════════════════════════════
   GOLD — main.js v4
   Minimal Vintage · Clean & Fluid
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll state ── */
  const navbar = document.getElementById('navbar');
  const upBtn  = document.getElementById('upBtn');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
    upBtn?.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  upBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Mobile menu ── */
  const hbg    = document.getElementById('hbg');
  const mobNav = document.getElementById('mobNav');

  hbg?.addEventListener('click', () => {
    const open = mobNav?.classList.toggle('open');
    const spans = hbg.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(4.5px, 4.5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4.5px, -4.5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  document.addEventListener('click', (e) => {
    if (mobNav?.classList.contains('open')
      && !mobNav.contains(e.target)
      && !hbg?.contains(e.target)) {
      mobNav.classList.remove('open');
      hbg?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  /* ── Search overlay ── */
  const searchOverlay = document.getElementById('searchOverlay');

  document.querySelectorAll('.search-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      searchOverlay?.classList.add('open');
      setTimeout(() => searchOverlay?.querySelector('input')?.focus(), 120);
    });
  });

  document.querySelector('.search-close')?.addEventListener('click', () => {
    searchOverlay?.classList.remove('open');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchOverlay?.classList.remove('open');
  });

  /* ── Search : filtrage live des produits et catégories ── */
  const searchInput = searchOverlay?.querySelector('input');
  const searchHints = searchOverlay?.querySelector('.search-hints');

  // Résultats dynamiques dans l'overlay
  let resultsBox = document.createElement('div');
  resultsBox.className = 'search-results-box';
  resultsBox.style.cssText = `
    margin-top:20px;display:flex;flex-direction:column;gap:10px;
    max-height:340px;overflow-y:auto;width:100%;max-width:580px;
  `;
  searchOverlay?.querySelector('.search-box')?.insertAdjacentElement('afterend', resultsBox);

  // Catégories disponibles
  const CATEGORIES = [
    { label: 'Vinyles',      icon: '🎵', href: 'catalogue.html?cat=vinyles' },
    { label: 'Cassettes',    icon: '📼', href: 'catalogue.html?cat=cassettes' },
    { label: 'Instruments',  icon: '🎸', href: 'catalogue.html?cat=instruments' },
    { label: 'Posters',      icon: '🖼️', href: 'catalogue.html?cat=posters' },
    { label: 'Électronique', icon: '🔌', href: 'catalogue.html?cat=electronique' },
    { label: 'CDs',          icon: '💿', href: 'catalogue.html?cat=cd' },
  ];

  function getProducts() {
    return Array.from(document.querySelectorAll('.pcard')).map(card => ({
      name:  card.querySelector('.pname')?.textContent?.trim() || '',
      meta:  card.querySelector('.pmeta')?.textContent?.trim() || '',
      price: card.querySelector('.pprice')?.textContent?.trim() || '',
      href:  card.querySelector('.pcard-link')?.getAttribute('href') || '#',
      emoji: card.querySelector('.pemoji')?.textContent?.trim() || '🎵',
    })).filter(p => p.name);
  }

  function renderResults(q) {
    resultsBox.innerHTML = '';
    if (!q) {
      searchHints && (searchHints.style.display = '');
      return;
    }
    searchHints && (searchHints.style.display = 'none');

    const ql = q.toLowerCase();

    // Catégories correspondantes
    const cats = CATEGORIES.filter(c => c.label.toLowerCase().includes(ql));
    cats.forEach(c => {
      resultsBox.insertAdjacentHTML('beforeend', `
        <a href="${c.href}" style="
          display:flex;align-items:center;gap:12px;
          padding:10px 16px;border-radius:10px;
          background:rgba(255,255,255,.06);
          text-decoration:none;transition:background .2s;
        " onmouseover="this.style.background='rgba(255,255,255,.1)'"
           onmouseout="this.style.background='rgba(255,255,255,.06)'">
          <span style="font-size:1.3rem">${c.icon}</span>
          <div>
            <div style="font-size:.82rem;color:rgba(245,226,206,.9);font-family:'Jost',sans-serif">Catégorie · ${c.label}</div>
            <div style="font-size:.7rem;color:rgba(229,166,87,.7)">Voir tous les produits →</div>
          </div>
        </a>
      `);
    });

    // Produits correspondants
    const prods = getProducts().filter(p =>
      p.name.toLowerCase().includes(ql) || p.meta.toLowerCase().includes(ql)
    );
    prods.slice(0, 5).forEach(p => {
      resultsBox.insertAdjacentHTML('beforeend', `
        <a href="${p.href}" style="
          display:flex;align-items:center;gap:12px;
          padding:10px 16px;border-radius:10px;
          background:rgba(255,255,255,.04);
          text-decoration:none;transition:background .2s;
        " onmouseover="this.style.background='rgba(255,255,255,.09)'"
           onmouseout="this.style.background='rgba(255,255,255,.04)'">
          <span style="font-size:1.4rem;flex-shrink:0">${p.emoji}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:.85rem;color:rgba(245,226,206,.95);font-family:'Jost',sans-serif;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
            <div style="font-size:.7rem;color:rgba(245,226,206,.45);margin-top:2px">${p.meta}</div>
          </div>
          <span style="font-size:.8rem;color:#E5A657;font-weight:500;flex-shrink:0">${p.price}</span>
        </a>
      `);
    });

    // Lien "Chercher dans le catalogue"
    if (q.length >= 2) {
      resultsBox.insertAdjacentHTML('beforeend', `
        <a href="catalogue.html?search=${encodeURIComponent(q)}" style="
          display:flex;align-items:center;justify-content:center;gap:8px;
          padding:11px;border-radius:10px;margin-top:4px;
          border:1px solid rgba(229,166,87,.2);
          font-size:.8rem;color:#E5A657;font-family:'Jost',sans-serif;
          text-decoration:none;transition:background .2s;
        " onmouseover="this.style.background='rgba(229,166,87,.06)'"
           onmouseout="this.style.background='transparent'">
          <i class="fas fa-search" style="font-size:.72rem"></i>
          Chercher "<strong>${q}</strong>" dans tout le catalogue →
        </a>
      `);
    }

    if (!cats.length && !prods.length && q.length >= 2) {
      resultsBox.innerHTML = `
        <div style="text-align:center;padding:20px;color:rgba(245,226,206,.4);font-size:.82rem;font-family:'Jost',sans-serif">
          Aucun résultat pour "<em style="color:rgba(229,166,87,.6)">${q}</em>"
          <br><a href="catalogue.html?search=${encodeURIComponent(q)}" style="color:#E5A657;display:inline-block;margin-top:8px">
            Chercher dans tout le catalogue →
          </a>
        </div>
      `;
    }
  }

  searchInput?.addEventListener('input', () => renderResults(searchInput.value.trim()));

  // Clic sur les hints → lance la recherche
  searchHints?.querySelectorAll('span').forEach(span => {
    span.style.cursor = 'pointer';
    span.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = span.textContent;
        renderResults(span.textContent);
      }
    });
  });

  /* ── HERO SLIDESHOW ── */
  const slides   = document.querySelectorAll('.hslide');
  const dots     = document.querySelectorAll('.sdot');
  const progBar  = document.getElementById('progBar');
  const counter  = document.getElementById('slideCounter');

  let current  = 0;
  let progVal  = 0;
  let progInt  = null;
  const DURATION = 4500;
  const TICK     = 50;

  function goSlide(n) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
    if (counter) counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    resetProgress();
  }

  function resetProgress() {
    progVal = 0;
    if (progBar) progBar.style.width = '0%';
    clearInterval(progInt);
    progInt = setInterval(() => {
      progVal += (TICK / DURATION) * 100;
      if (progBar) progBar.style.width = progVal + '%';
      if (progVal >= 100) goSlide(current + 1);
    }, TICK);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goSlide(i)));
  if (slides.length) resetProgress();

  /* ── Smooth scroll for hero "Explorer" btn ── */
  document.querySelector('.js-scroll-cats')?.addEventListener('click', e => {
    const target = document.getElementById('categories');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  /* ── Filter tabs ── */
  document.querySelectorAll('.fb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── HIW Tabs ── */
  const hiwSteps = document.getElementById('hiwSteps');
  const buy = [
    { n: '01', icon: 'fa-search',    t: 'Découvrez',        d: 'Parcourez des milliers de vinyles, cassettes, instruments et posters sélectionnés par nos vendeurs experts.' },
    { n: '02', icon: 'fa-shield-alt',t: 'Achetez en confiance', d: 'Chaque produit est authentifié et certifié. Paiement sécurisé, protection acheteur garantie.' },
    { n: '03', icon: 'fa-box-open',  t: 'Recevez & Profitez',d: 'Livraison soigneuse avec emballage protecteur. Retours gratuits sous 30 jours.' }
  ];
  const sell = [
    { n: '01', icon: 'fa-user-plus',       t: 'Créez votre profil',     d: 'Inscrivez-vous gratuitement en quelques minutes. Ajoutez votre bio et votre expertise musicale.' },
    { n: '02', icon: 'fa-camera',           t: 'Publiez vos produits',   d: 'Photographiez, décrivez et fixez vos prix. Nos outils vous aident à estimer la valeur de chaque pièce.' },
    { n: '03', icon: 'fa-money-bill-wave',  t: 'Encaissez vos gains',    d: 'Recevez vos paiements directement. Commission 8% seulement, retraits instantanés.' }
  ];

  function renderHIW(steps) {
    if (!hiwSteps) return;
    hiwSteps.innerHTML = '';
    steps.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'hiw-step reveal';
      el.innerHTML = `
        <div class="step-num">${s.n}</div>
        <div class="step-icon"><i class="fas ${s.icon}"></i></div>
        <div class="step-title">${s.t}</div>
        <p class="step-desc">${s.d}</p>
      `;
      hiwSteps.appendChild(el);
      setTimeout(() => el.classList.add('in'), 60 + i * 100);
    });
  }
  renderHIW(buy);

  document.querySelectorAll('.ht').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ht').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderHIW(tab.dataset.m === 'sell' ? sell : buy);
    });
  });

  /* ── Stats counter ── */
  function animStat(el, to) {
    let cur = 0;
    const step = to / 65;
    const sfx = el.dataset.sfx || '';
    const span = el.querySelector('.cv');
    if (!span) return;
    const t = setInterval(() => {
      cur = Math.min(cur + step, to);
      span.textContent = Math.round(cur).toLocaleString('fr-FR');
      if (cur >= to) clearInterval(t);
    }, 20);
  }

  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-to]').forEach(el => animStat(el, +el.dataset.to));
      statsObs.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stats-row').forEach(el => statsObs.observe(el));

  /* ── Scroll reveal ── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.pcard, .ccard, .tcard, .scard').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.07 + 's';
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(() => el.classList.add('in'), 100 + (i % 4) * 70);
    } else {
      revObs.observe(el);
    }
  });

  /* ── Ticker clone ── */
  const ticker = document.getElementById('tickerInner');
  if (ticker) ticker.appendChild(ticker.cloneNode(true));

  /* ── Toast ── */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    const tmsg  = document.getElementById('tmsg');
    if (!toast || !tmsg) return;
    tmsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ── Product Modal ── */

  // Histoires par produit (id → texte)
  const PRODUCT_STORIES = {
    'led-zeppelin-iv':  "Enregistré en 1970 dans le mythique Headley Grange, Led Zeppelin IV est l'un des albums les plus vendus de l'histoire du rock. Immortalisé par \"Stairway to Heaven\", ce pressage original dégage une chaleur sonore incomparable. La pochette sans titre, délibérément mystérieuse, reste l'une des plus énigmatiques du rock.",
    'the-wall':         "Double album concept sorti en 1979, The Wall est l'œuvre la plus ambitieuse de Pink Floyd. Ce pressage UK original capte toute la richesse orchestrale de l'album, de \"Another Brick in the Wall\" à \"Comfortably Numb\". Une pièce de collection pour tout amateur de rock progressif.",
    'thriller':         "Cassette originale de l'album le plus vendu de tous les temps. Thriller de Michael Jackson a révolutionné la pop et le R&B en 1982. Cette cassette en excellent état conserve toute l'énergie des productions légendaires de Quincy Jones. Un artefact de la culture pop mondiale.",
    'fender-65':        "La Fender Stratocaster de 1965 représente l'âge d'or de la lutherie américaine. Fabriquée à Fullerton, Californie, avant le rachat par CBS, elle possède un son cristallin et une playabilité exceptionnelle. Jouée par les plus grands, cette guitare est un investissement autant qu'un instrument.",
    'kind-of-blue':     "Enregistré en deux sessions en 1959, Kind of Blue de Miles Davis est le disque de jazz le plus vendu de l'histoire. Ce pressage rare capture la naissance du jazz modal avec une clarté saisissante. Avec Coltrane, Evans et Chambers, cette session reste un sommet absolu de l'improvisation.",
    'abbey-road':       "Dernier album enregistré par les Beatles, Abbey Road (1969) est une œuvre testamentaire d'une beauté intemporelle. La face B enchaîne des médleys d'une cohérence rare. Ce pressage UK Parlophone original, avec son étiquette apple verte, est l'un des plus recherchés par les collectionneurs.",
    'dark-side':        "Resté 741 semaines dans le Billboard 200, The Dark Side of the Moon est un monument. Ce pressage 1973 UK Harvest, avec ses deux posters et l'affiche pyramide inclus, est la version la plus complète. Roger Waters, David Gilmour et Nick Mason au sommet de leur art.",
    'rumours':          "Enregistré dans la douleur d'une séparation collective, Rumours de Fleetwood Mac (1977) est un chef-d'œuvre de pop rock. Ce pressage original conserve toute la chaleur des arrangements acoustiques et électriques. \"Go Your Own Way\", \"The Chain\", \"Dreams\" — chaque titre est un classique.",
  };

  // Injection des styles de la modal (une seule fois)
  if (!document.getElementById('gold-modal-styles')) {
    const ms = document.createElement('style');
    ms.id = 'gold-modal-styles';
    ms.textContent = `
      .gmodal-backdrop {
        position:fixed;inset:0;z-index:9000;
        background:rgba(15,7,2,.82);
        backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
        display:flex;align-items:center;justify-content:center;
        padding:20px;opacity:0;transition:opacity .35s ease;
      }
      .gmodal-backdrop.open { opacity:1; }
      .gmodal {
        position:relative;
        width:100%;max-width:780px;max-height:90vh;overflow-y:auto;
        background:#1c0f07;
        border:1px solid rgba(229,166,87,.18);
        border-radius:20px;
        box-shadow:0 40px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(229,166,87,.08);
        transform:translateY(28px) scale(.97);
        transition:transform .38s cubic-bezier(.22,1,.36,1);
        display:grid;
        grid-template-columns:1fr 1fr;
      }
      .gmodal-backdrop.open .gmodal { transform:translateY(0) scale(1); }
      @media(max-width:620px){
        .gmodal { grid-template-columns:1fr; }
        .gmodal-img { height:220px; border-radius:20px 20px 0 0 !important; }
      }
      .gmodal-img {
        position:relative;overflow:hidden;
        border-radius:20px 0 0 20px;min-height:340px;
        background:#2a1408;
        display:flex;align-items:center;justify-content:center;
      }
      .gmodal-img img {
        width:100%;height:100%;object-fit:cover;
        transition:transform .5s ease;
      }
      .gmodal-img:hover img { transform:scale(1.04); }
      .gmodal-img-emoji {
        font-size:5rem;line-height:1;
        filter:drop-shadow(0 8px 24px rgba(0,0,0,.5));
      }
      .gmodal-badge {
        position:absolute;top:14px;left:14px;
        padding:4px 12px;border-radius:100px;
        font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
        background:rgba(181,51,36,.9);color:#fff;
      }
      .gmodal-badge.new    { background:rgba(80,140,80,.9); }
      .gmodal-badge.sale   { background:rgba(181,51,36,.9); }
      .gmodal-badge.rare   { background:rgba(120,80,20,.95);color:#E5A657; }
      .gmodal-body {
        padding:32px 30px 28px;
        display:flex;flex-direction:column;gap:14px;
      }
      .gmodal-close {
        position:absolute;top:14px;right:14px;
        width:34px;height:34px;border-radius:50%;
        background:rgba(245,226,206,.08);border:none;
        color:rgba(245,226,206,.6);font-size:1.1rem;
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background .2s,color .2s;z-index:2;
      }
      .gmodal-close:hover { background:rgba(181,51,36,.25);color:#fff; }
      .gmodal-meta {
        font-family:'Jost',sans-serif;font-size:.68rem;font-weight:400;
        color:#E5A657;letter-spacing:.1em;text-transform:uppercase;
        opacity:.8;
      }
      .gmodal-title {
        font-family:'Cormorant',serif;font-size:1.9rem;font-weight:600;
        color:#F5E2CE;line-height:1.15;margin:0;
      }
      .gmodal-stars { color:#E5A657;font-size:.85rem;letter-spacing:2px; }
      .gmodal-price-row {
        display:flex;align-items:baseline;gap:10px;
      }
      .gmodal-price {
        font-family:'Cormorant',serif;font-size:2rem;font-weight:600;color:#E5A657;
      }
      .gmodal-old {
        font-size:.85rem;color:rgba(245,226,206,.3);text-decoration:line-through;
      }
      .gmodal-divider {
        height:1px;background:rgba(229,166,87,.1);margin:2px 0;
      }
      .gmodal-story-label {
        font-family:'Jost',sans-serif;font-size:.65rem;letter-spacing:.12em;
        text-transform:uppercase;color:rgba(229,166,87,.5);margin-bottom:4px;
      }
      .gmodal-story {
        font-family:'Cormorant',serif;font-size:.97rem;font-weight:300;
        color:rgba(245,226,206,.72);line-height:1.75;
        font-style:italic;
      }
      .gmodal-tags {
        display:flex;flex-wrap:wrap;gap:7px;
      }
      .gmodal-tag {
        padding:4px 12px;border-radius:100px;
        border:1px solid rgba(229,166,87,.18);
        font-family:'Jost',sans-serif;font-size:.68rem;
        color:rgba(245,226,206,.55);
      }
      .gmodal-actions {
        display:flex;gap:10px;margin-top:6px;
      }
      .gmodal-btn-cart {
        flex:1;padding:13px;border-radius:10px;
        background:linear-gradient(135deg,#B53324,#8a2018);
        color:#fff;border:none;cursor:pointer;
        font-family:'Jost',sans-serif;font-size:.85rem;font-weight:500;
        display:flex;align-items:center;justify-content:center;gap:8px;
        transition:opacity .2s,transform .15s;
      }
      .gmodal-btn-cart:hover { opacity:.88;transform:translateY(-1px); }
      .gmodal-btn-fav {
        width:48px;height:48px;border-radius:10px;
        border:1px solid rgba(229,166,87,.2);
        background:transparent;color:rgba(245,226,206,.5);
        font-size:1.1rem;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        transition:background .2s,color .2s,border-color .2s;
      }
      .gmodal-btn-fav:hover { background:rgba(181,51,36,.15);color:#B53324;border-color:rgba(181,51,36,.3); }
      .gmodal-btn-detail {
        width:48px;height:48px;border-radius:10px;
        border:1px solid rgba(229,166,87,.2);
        background:transparent;color:rgba(245,226,206,.5);
        font-size:.9rem;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        text-decoration:none;
        transition:background .2s,color .2s;
      }
      .gmodal-btn-detail:hover { background:rgba(229,166,87,.08);color:#E5A657; }
    `;
    document.head.appendChild(ms);
  }

  // Création du backdrop (une seule fois)
  let gModalBackdrop = document.getElementById('gModalBackdrop');
  if (!gModalBackdrop) {
    gModalBackdrop = document.createElement('div');
    gModalBackdrop.className = 'gmodal-backdrop';
    gModalBackdrop.id = 'gModalBackdrop';
    gModalBackdrop.innerHTML = '<div class="gmodal" id="gModal"></div>';
    document.body.appendChild(gModalBackdrop);
  }

  // Fermeture
  gModalBackdrop.addEventListener('click', e => {
    if (e.target === gModalBackdrop) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    gModalBackdrop.classList.remove('open');
    setTimeout(() => { gModalBackdrop.style.display = 'none'; }, 380);
  }

  function openModal(data) {
    const modal = document.getElementById('gModal');
    if (!modal) return;

    const story = PRODUCT_STORIES[data.pid] || 'Une pièce rare et authentique, soigneusement sélectionnée par nos vendeurs experts. Chaque article est certifié et inspecté avant mise en vente.';

    // Tags depuis meta (ex: "Vinyle · 1971" → ["Vinyle", "1971"])
    const tags = data.meta.split(/[·\-]/).map(t => t.trim()).filter(Boolean);

    const badgeClass = data.badge === 'Nouveau' ? 'new' : data.badge?.startsWith('-') ? 'sale' : 'rare';

    modal.innerHTML = `
      <button class="gmodal-close" id="gModalClose"><i class="fas fa-times"></i></button>

      <div class="gmodal-img">
        ${data.img
          ? `<img src="${data.img}" alt="${data.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="gmodal-img-emoji" ${data.img ? 'style="display:none"' : ''}>${data.emoji}</div>
        ${data.badge ? `<span class="gmodal-badge ${badgeClass}">${data.badge}</span>` : ''}
      </div>

      <div class="gmodal-body">
        <div>
          <div class="gmodal-meta">${data.meta}</div>
          <h2 class="gmodal-title">${data.name}</h2>
        </div>
        <div class="gmodal-stars">${data.stars || '★★★★★'}</div>
        <div class="gmodal-price-row">
          <span class="gmodal-price">${data.price}</span>
          ${data.oldPrice ? `<span class="gmodal-old">${data.oldPrice}</span>` : ''}
        </div>
        <div class="gmodal-divider"></div>
        <div>
          <div class="gmodal-story-label">Histoire &amp; provenance</div>
          <p class="gmodal-story">${story}</p>
        </div>
        <div class="gmodal-tags">
          ${tags.map(t => `<span class="gmodal-tag">${t}</span>`).join('')}
          <span class="gmodal-tag"><i class="fas fa-certificate" style="color:#E5A657;margin-right:4px"></i>Certifié</span>
          <span class="gmodal-tag"><i class="fas fa-undo" style="margin-right:4px"></i>Retour 30j</span>
        </div>
        <div class="gmodal-actions">
          <button class="gmodal-btn-cart padd"
            data-p="${data.name}" data-pid="${data.pid}" data-price="${data.rawPrice}">
            <i class="fas fa-shopping-bag"></i> Ajouter au panier
          </button>
          <button class="gmodal-btn-fav pfav" data-pid="${data.pid}">♡</button>
          <a href="${data.href}" class="gmodal-btn-detail" title="Voir la fiche complète">
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    // Close button inside modal
    document.getElementById('gModalClose')?.addEventListener('click', closeModal);

    // Panier — auth obligatoire
    modal.querySelector('.gmodal-btn-cart')?.addEventListener('click', () => {
      if (typeof GoldAuth !== 'undefined' && !GoldAuth.isLoggedIn()) {
        closeModal();
        requireLogin('ajouter des produits au panier');
        return;
      }
      if (typeof GoldAuth !== 'undefined') {
        GoldAuth.addToCart({ id: data.pid, name: data.name, price: parseFloat(data.rawPrice), emoji: data.emoji });
        document.querySelectorAll('.cbadge, #cartBadge').forEach(b => {
          const c = GoldAuth.getCartCount();
          b.textContent = c;
          b.style.display = c > 0 ? 'flex' : 'none';
        });
      }
      showToast(`🎵 "${data.name}" ajouté au panier !`);
    });

    // Favoris — auth obligatoire
    const favBtn = modal.querySelector('.gmodal-btn-fav');
    if (favBtn) {
      // Restaurer état favori
      if (typeof GoldAuth !== 'undefined' && GoldAuth.isLoggedIn() && GoldAuth.isFav(data.pid)) {
        favBtn.textContent = '♥';
        favBtn.style.color = '#B53324';
      }
      favBtn.addEventListener('click', () => {
        if (typeof GoldAuth !== 'undefined' && !GoldAuth.isLoggedIn()) {
          closeModal();
          requireLogin('ajouter aux favoris');
          return;
        }
        if (typeof GoldAuth !== 'undefined') {
          const added = GoldAuth.toggleFav(data.pid);
          favBtn.textContent = added ? '♥' : '♡';
          favBtn.style.color = added ? '#B53324' : '';
          showToast(added ? '♥ Ajouté aux favoris' : 'Retiré des favoris');
        }
      });
    }

    gModalBackdrop.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => gModalBackdrop.classList.add('open'));
    });
  }

  // Délégation : clic sur .pcard (mais pas sur les boutons d'action)
  document.addEventListener('click', e => {
    const card = e.target.closest('.pcard');
    if (!card) return;

    // Ne pas ouvrir si on clique sur padd, pfav ou pcard-link
    if (e.target.closest('.padd') || e.target.closest('.pfav') || e.target.closest('.pcard-link')) return;

    // Lire les données depuis la carte
    const data = {
      name:     card.querySelector('.pname')?.textContent?.trim() || '',
      meta:     card.querySelector('.pmeta')?.textContent?.trim() || '',
      price:    card.querySelector('.pprice')?.textContent?.trim() || '',
      oldPrice: card.querySelector('.pold')?.textContent?.trim() || '',
      stars:    card.querySelector('.pstars')?.textContent?.trim() || '★★★★★',
      badge:    card.querySelector('.pbadge')?.textContent?.trim() || '',
      emoji:    card.querySelector('.pemoji')?.textContent?.trim() || '🎵',
      img:      card.querySelector('img')?.getAttribute('src') || '',
      href:     card.querySelector('.pcard-link')?.getAttribute('href') || '#',
      pid:      card.querySelector('[data-pid]')?.dataset.pid || '',
      rawPrice: card.querySelector('.padd')?.dataset.price || '0',
    };

    if (data.name) openModal(data);
  });

});