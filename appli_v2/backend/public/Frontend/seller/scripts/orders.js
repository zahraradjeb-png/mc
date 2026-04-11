const OrdersController = {
  async init() {
    const user = await SellerLayout.init({
      title: '', // Title is in custom header
      pageId: 'orders'
    });
    if (!user) return;
    
    this.userId = user.id_vendeur || user.id;
    this.loadOrders();
  },

  async loadOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    try {
      const items = await ProductService.getOrders(this.userId);
      if (items && items.length > 0) {
         this.renderOrders(items, this.userId);
      } else {
         this.renderEmpty();
      }
    } catch (e) {
      console.warn('Could not load orders.');
    }
  },

  renderOrders(items, vendeurId) {
    const container = document.getElementById('orders-list');

    const grouped = {};
    items.forEach(item => {
      const cid = item.id_commande;
      if (!grouped[cid]) {
        grouped[cid] = {
          id_commande: cid,
          date_commande: item.date_commande,
          statut_commande: item.statut_commande,
          montant_total: item.montant_total,
          acheteur_prenom: item.acheteur_prenom,
          acheteur_nom: item.acheteur_nom,
          acheteur_adresse: item.acheteur_adresse,
          acheteur_tel: item.acheteur_tel,
          produits: [],
          total: 0
        };
      }
      grouped[cid].produits.push(item);
      grouped[cid].total += Number(item.prix_unitaire) * Number(item.quantite);
    });

    const ordersArr = Object.values(grouped);
    const labelCommande = (s) => ({
      EN_ATTENTE: 'En attente de validation',
      CONFIRMEE: 'Confirmée',
      EXPEDIEE: 'Expédiée',
      LIVREE: 'Livrée',
      ANNULEE: 'Annulée',
      REMBOURSEE: 'Remboursée'
    }[s] || s || '—');

    container.innerHTML = ordersArr.map(order => `
      <article class="studio-card order-card" data-order="${order.id_commande}">
        <div class="o-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <div>
            <div class="o-id">Commande #ORD-${order.id_commande}</div>
            <div class="o-date">Passée le ${new Date(order.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
          </div>
          <div style="text-align:right">
            <span style="display:inline-block;font-size:0.72rem;font-weight:700;padding:6px 12px;border-radius:50px;background:rgba(229,166,87,0.15);color:var(--studio-honey);border:1px solid rgba(229,166,87,0.25)">${labelCommande(order.statut_commande)}</span>
            ${order.statut_commande === 'EN_ATTENTE' ? `<button type="button" class="btn-gold-studio" style="margin-top:8px;display:block;width:100%;padding:10px 14px;font-size:0.82rem;cursor:pointer" onclick="OrdersController.validerCommande(${vendeurId}, ${order.id_commande})">Valider la commande</button>` : ''}
          </div>
        </div>

        <ul class="o-products">
          ${order.produits.map(p => `
            <li class="o-item" style="display:flex; justify-content:space-between; align-items:center;">
              <span>${p.quantite}x ${p.titre}</span>
              <div style="display:flex; align-items:center; gap:12px;">
                <span>${(p.prix_unitaire * p.quantite).toLocaleString('fr-FR')} €</span>
                <select class="btn-gold-studio" style="padding:6px 10px; font-size:0.8rem;" onchange="OrdersController.updateStatus(${vendeurId}, ${order.id_commande}, ${p.id_produit}, this.value)">
                  <option value="EN_PREPARATION" ${p.statut_item === 'EN_PREPARATION' ? 'selected' : ''}>En préparation</option>
                  <option value="EXPEDIE" ${p.statut_item === 'EXPEDIE' ? 'selected' : ''}>Expédié</option>
                  <option value="LIVRE" ${p.statut_item === 'LIVRE' ? 'selected' : ''}>Livré</option>
                  <option value="ANNULE" ${p.statut_item === 'ANNULE' ? 'selected' : ''}>Annulé</option>
                </select>
              </div>
            </li>
          `).join('')}
        </ul>

        <div class="o-footer">
          <div>
            <span style="font-size:0.8rem; color:var(--studio-muted);">Client :</span>
            <span style="font-size:0.9rem; color:#fff;"> ${order.acheteur_prenom} ${order.acheteur_nom}</span>
            <div style="font-size:0.8rem; color:var(--studio-muted); margin-top:4px;"><i class="fas fa-map-marker-alt"></i> ${order.acheteur_adresse || 'Adresse non renseignée'}</div>
            <div style="font-size:0.8rem; color:var(--studio-muted);"><i class="fas fa-phone"></i> ${order.acheteur_tel || 'Tel non renseigné'}</div>
          </div>
          <div class="o-total">${(order.montant_total != null ? Number(order.montant_total) : order.total).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
      </article>
    `).join('');
  },

  async validerCommande(vId, oId) {
    try {
      const res = await fetch(`${ProductService.baseUrl}/vendeurs/${vId}/commandes/${oId}/valider`, {
        method: 'PUT',
        headers: { Accept: 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        StudioToast.success(data.message || 'Commande validée', 2500);
        this.loadOrders();
      } else {
        StudioToast.error(data.message || 'Erreur validation', 3500);
      }
    } catch (e) {
      console.error(e);
      StudioToast.error('Erreur réseau', 3000);
    }
  },

  async updateStatus(vId, oId, pId, newStatus) {
    try {
      const res = await fetch(`${ProductService.baseUrl}/vendeurs/${vId}/commandes/${oId}/produit/${pId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ statut: newStatus })
      });
      if (res.ok) {
        StudioToast.success('Statut de l\'article mis à jour', 2000);
      } else {
        StudioToast.error('Erreur lors de la mise à jour', 3000);
      }
    } catch(e) {
      console.error(e);
      StudioToast.error('Erreur réseau', 3000);
    }
  },

  renderEmpty() {
    const container = document.getElementById('orders-list');
    container.innerHTML = `
      <div style="text-align:center; padding:80px 0; opacity:0.4;">
        <i class="fas fa-shopping-basket" style="font-size:3rem; margin-bottom:20px; display:block;"></i>
        Aucune commande reçue pour le moment.
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => OrdersController.init());
