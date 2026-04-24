const fs = require('fs');

const products = [{"id_produit":12,"id_categorie":2,"id_vendeur":3,"titre":"DFIUE","description":"KJDHFIU","prix":"30000.00","quantite":4,"decennie":null,"annee":null,"artiste":null,"rarete":"RARE","etat":"BON","statut":"VALIDEE","est_disponible":1,"date_ajout":"2026-04-12 08:45:53","categorie_nom":"CASSETTE"}];

const API_BASE = "http://127.0.0.1:8000/api";

try {
    const html = products.map((it) => {
      const idProd = it.id_produit || it.id;
      const p = parseFloat(it.prix_unitaire || it.prix || 0);
      const imgPath = it.photo ? (API_BASE.replace('/api','') + '/' + it.photo) : null;
      const titreProduit = it.titre || it.nom || 'Produit sans nom';
      const catProduit = it.categorie_nom || it.nom_categorie || 'Catégorie inconnue';
      
      const descProduit = it.description ? (it.description.length > 90 ? it.description.substring(0,90) + '...' : it.description) : 'Aucune description fournie pour cet article.';

      const prodJson = encodeURIComponent(JSON.stringify({
        id: idProd,
        name: titreProduit,
        price: p,
        image: imgPath,
        qty: 1
      })).replace(/'/g, "%27");

      return `
        <div class="fav-item" id="fav-item-${idProd}">
          <a href="product.html?id=${idProd}" class="product-link" style="flex-shrink:0;">
            <div class="fav-thumb">
              ${imgPath ? '<img src="' + imgPath + '">' : '<span style="color:#666"><i class="fas fa-image"></i></span>'}
            </div>
          </a>
          <div class="fav-details">
            <a href="product.html?id=${idProd}" class="product-link">
              <div style="color:var(--muted); font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">${catProduit}</div>
              <div style="font-size:1.4rem; font-weight:600; color:#fff; font-family:'Cormorant Garamond',serif; margin-bottom:4px;">${titreProduit}</div>
              <div style="font-size:0.9rem; color:#aaa; line-height:1.4; margin-bottom:10px;">${descProduit}</div>
            </a>
            <div class="fav-price">${p.toFixed(2).replace('.',',')} €</div>
          </div>
          <div class="fav-actions">
            <button class="btn btn-cart" onclick="addLocalToCart('${prodJson}')">
              <i class="fas fa-cart-plus"></i> Ajouter au panier
            </button>
            <button class="btn btn-remove" onclick="removeLocalFav('${idProd}')">
              <i class="fas fa-trash-alt"></i> Retirer
            </button>
          </div>
        </div>
      `;
    }).join('');

    console.log("SUCCESS:", html.substring(0, 100));
} catch(e) {
    console.error("ERROR", e);
}
