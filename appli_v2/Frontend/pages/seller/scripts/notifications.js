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
    try {
      if (typeof NotificationsService !== 'undefined') {
        const notifs = await NotificationsService.getNotifications(this.userId);
        if (notifs && notifs.length > 0) {
          this.renderList(notifs);
        }
      }
    } catch (e) {
      console.warn('Could not load notifications.');
    }
  },

  renderList(notifs) {
    const container = document.querySelector('.studio-card');
    if (!container) return;

    container.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.est_lue ? '' : 'ni-new'}">
        <div class="ni-icon" style="${this.getIconStyle(n.type)}">
          <i class="${this.getIcon(n.type)}"></i>
        </div>
        <div class="ni-content">
          <div class="ni-title">${n.titre}</div>
          <p class="ni-text">${n.contenu}</p>
          <div class="ni-time">${this.formatTime(n.date_ajout || n.created_at)}</div>
        </div>
      </div>
    `).join('');
  },

  getIcon(type) {
    switch (type) {
      case 'order': return 'fas fa-shopping-cart';
      case 'payment': return 'fas fa-check-circle';
      case 'alert': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-bell';
    }
  },

  getIconStyle(type) {
    switch (type) {
      case 'order': return 'background:rgba(229,166,87,0.1); color:var(--studio-honey);';
      case 'payment': return 'background:rgba(34,197,94,0.1); color:#22C55E;';
      case 'alert': return 'background:rgba(239,68,68,0.1); color:#EF4444;';
      default: return 'background:rgba(255,255,255,0.05); color:#fff;';
    }
  },

  formatTime(date) {
    // Simple mock formatter
    return 'Récemment';
  }
};

document.addEventListener('DOMContentLoaded', () => NotificationsController.init());
