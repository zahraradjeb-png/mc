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
    
    // Group the items by order ID for better presentation
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.id_commande]) grouped[item.id_commande] = { ...item, produits: [], total: 0 };
      grouped[item.id_commande].produits.push(item);
      grouped[item.id_commande].total += (item.prix_unitaire * item.quantite);
      // Status shown is based on the first item for simplicity, but we can do per-item dropdowns
    });

    const ordersArr = Object.values(grouped);

    container.innerHTML = ordersArr.map(order => `
      <article class="studio-card order-card" data-order="${order.id_commande}">
        <div class="o-header">
          <div>
            <div class="o-id">Commande #ORD-${order.id_commande}</div>
            <div class="o-date">Passée le ${new Date(order.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
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
          <div class="o-total">${order.total.toLocaleString('fr-FR')} €</div>
        </div>
      </article>
    `).join('');
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
