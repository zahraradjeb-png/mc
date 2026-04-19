/**
 * ProductCard Component
 * Consistent premium design with sync for favorites and cart
 */
const ProductCard = {
  render(p, options = {}) {
    const root = typeof _root === 'function' ? _root() : '';
    const isFav = typeof GoldAuth !== 'undefined' && GoldAuth.isFav(p.id_produit || p.id);
    const photo = p.photo_principale || p.photo || 'assets/images/placeholder.jpg';
    const price = parseFloat(p.prix || 0).toFixed(2);
    const category = p.categorie_nom || p.type || 'Vintage';
    const year = p.annee || '';
    
    return `
      <article class="pcard" data-id="${p.id_produit || p.id}">
        <a href="${root}product.html?id=${p.id_produit || p.id}" class="pcard-link" aria-label="Voir ${p.titre}"></a>
        <div class="pthumb">
          <img src="${root}${photo}" alt="${p.titre}" onerror="this.src='${root}assets/images/placeholder.jpg'">
          ${p.badge ? `<span class="pbadge ${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
          <button class="pfav ${isFav ? 'active' : ''}" data-pid="${p.id_produit || p.id}">
            ${isFav ? '♥' : '♡'}
          </button>
        </div>
        <div class="pbody">
          <div class="pmeta">${category} ${year ? '· ' + year : ''}</div>
          <div class="pname">${p.titre}</div>
          <div class="pfoot">
            <span class="pprice">${price} €</span>
            <button class="padd" data-pid="${p.id_produit || p.id}"><i class="fas fa-plus"></i></button>
          </div>
        </div>
      </article>
    `;
  },

  injectStyles() {
    if (document.getElementById('product-card-styles')) return;
    const s = document.createElement('style');
    s.id = 'product-card-styles';
    s.textContent = `
      .pcard {
        background: rgba(255,255,255,0.4); backdrop-filter: blur(10px);
        border: 1px solid var(--biscuit); border-radius: 18px;
        overflow: hidden; transition: all 0.4s var(--ease-spring);
        position: relative; height: 100%; display: flex; flex-direction: column;
      }
      .pcard:hover { transform: translateY(-8px); background: #fff; box-shadow: 0 15px 40px rgba(0,0,0,0.06); }
      .pthumb { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; }
      .pthumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
      .pcard:hover .pthumb img { transform: scale(1.08); }
      .pbody { padding: 18px; flex: 1; display: flex; flex-direction: column; }
      .pmeta { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 6px; }
      .pname { font-size: 1rem; font-weight: 600; color: var(--ink); margin-bottom: 15px; flex: 1; }
      .pfoot { display: flex; justify-content: space-between; align-items: center; }
      .pprice { font-family: 'Special Elite', cursive; font-size: 1.1rem; color: var(--paprika); }
      .padd { width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--ink); color: white; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
      .padd:hover { background: var(--honey); transform: scale(1.1); }
      .pfav { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,0.8); backdrop-filter: blur(5px); color: var(--muted); cursor: pointer; z-index: 5; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
      .pfav.active, .pfav:hover { background: #fff; color: var(--paprika); }
    `;
    document.head.appendChild(s);
  }
};
