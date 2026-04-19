const NotificationsController = {
  async init() {
    const user = await SellerLayout.init({
      title: '', // Custom header defined locally
      pageId: 'notifications'
    });
    if (!user) return;

    this.userId = user.id_user || user.id;
    this.renderNotifications();
  },

  async renderNotifications() {
    const container = document.getElementById('notif-list');
    if (!container) return;

    try {
      // Use the correct service name: NotificationService
      const notifs = await NotificationService.getNotifications(this.userId);
      
      if (notifs && notifs.length > 0) {
        this.renderList(notifs, container);
      } else {
        this.renderEmpty(container);
      }
    } catch (e) {
      console.warn('Could not load notifications.', e);
      container.innerHTML = `<p style="padding:40px; text-align:center; opacity:0.5;">Erreur de chargement des notifications.</p>`;
    }
  },

  renderList(notifs, container) {
    container.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.est_lue ? '' : 'ni-new'}" style="border-bottom: 1px solid var(--studio-border);">
        <div class="ni-icon" style="${this.getIconStyle(n.type)}">
          <i class="${this.getIcon(n.type)}"></i>
        </div>
        <div class="ni-content">
          <div class="ni-title" style="font-weight:700; color:var(--studio-white);">${n.titre}</div>
          <p class="ni-text" style="color:var(--studio-muted); font-size:0.9rem; margin-top:4px;">${n.contenu}</p>
          <div class="ni-time" style="font-size:0.75rem; opacity:0.5; margin-top:8px;">${this.formatTime(n.created_at)}</div>
        </div>
      </div>
    `).join('');
  },

  renderEmpty(container) {
    container.innerHTML = `
      <div class="empty-state" style="padding:80px 40px; text-align:center;">
        <i class="fas fa-bell-slash" style="font-size:3rem; opacity:0.1; margin-bottom:20px; display:block;"></i>
        <h2 style="font-family:'Cormorant Garamond',serif; font-size:1.8rem;">Aucune notification</h2>
        <p style="color:var(--studio-muted);">Vous êtes à jour ! Toutes les nouvelles alertes apparaîtront ici.</p>
      </div>`;
  },

  getIcon(type) {
    switch (type) {
      case 'order': return 'fas fa-shopping-cart';
      case 'payment': return 'fas fa-wallet';
      case 'alert': return 'fas fa-exclamation-triangle';
      case 'success': return 'fas fa-check-circle';
      default: return 'fas fa-bell';
    }
  },

  getIconStyle(type) {
    switch (type) {
      case 'order': return 'background:rgba(229,166,87,0.1); color:var(--studio-honey);';
      case 'success': 
      case 'payment': return 'background:rgba(46,204,113,0.1); color:var(--studio-success);';
      case 'alert': return 'background:rgba(181, 51, 36, 0.1); color:var(--studio-crimson);';
      default: return 'background:rgba(255,255,255,0.05); color:#fff;';
    }
  },

  formatTime(dateStr) {
    if (!dateStr) return 'Récemment';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Récemment';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => NotificationsController.init());
