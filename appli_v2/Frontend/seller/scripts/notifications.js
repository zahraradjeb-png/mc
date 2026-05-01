const NotificationsController = {
  userId: null,

  async init() {
    const user = await SellerLayout.init({
      title: '',
      pageId: 'notifications'
    });
    if (!user) return;

    this.userId = user.id_user || user.id;
    await this.renderNotifications();
    this.bindEvents();
  },

  bindEvents() {
    const btnMarkAll = document.getElementById('btn-mark-all-read');
    if (btnMarkAll) {
      btnMarkAll.addEventListener('click', async () => {
        await NotificationService.markAllAsRead(this.userId);
        // Animate all items
        document.querySelectorAll('.notif-item.ni-new').forEach(el => {
          el.classList.remove('ni-new');
          el.style.transition = 'all 0.4s ease';
        });
        btnMarkAll.innerHTML = '<i class="fas fa-check-double" style="margin-right:6px;"></i>Tout est à jour !';
        btnMarkAll.style.color = 'var(--studio-success, #22C55E)';
        setTimeout(() => {
          btnMarkAll.innerHTML = '<i class="fas fa-check-double" style="margin-right:6px;"></i>Tout marquer comme lu';
          btnMarkAll.style.color = '#fff';
        }, 2500);
        // Update sidebar badge
        this.updateBadge(0);
      });
    }
  },

  async renderNotifications() {
    const container = document.getElementById('notif-list');
    if (!container) return;

    try {
      const notifs = await NotificationService.getNotifications(this.userId);
      
      if (notifs && notifs.length > 0) {
        this.renderList(notifs, container);
        const unread = notifs.filter(n => !n.est_lue).length;
        this.updateBadge(unread);
      } else {
        this.renderEmpty(container);
        this.updateBadge(0);
      }
    } catch (e) {
      console.warn('Could not load notifications.', e);
      container.innerHTML = `<p style="padding:40px; text-align:center; opacity:0.5;">Erreur de chargement des notifications.</p>`;
    }
  },

  renderList(notifs, container) {
    container.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.est_lue ? '' : 'ni-new'}" data-id="${n.id}" style="border-bottom: 1px solid var(--studio-border); cursor:pointer;">
        <div class="ni-icon" style="${this.getIconStyle(n.type)}">
          <i class="${this.getIcon(n.type)}"></i>
        </div>
        <div class="ni-content">
          <div class="ni-title" style="font-weight:700; color:var(--studio-white);">${n.titre}</div>
          <p class="ni-text" style="color:var(--studio-muted); font-size:0.9rem; margin-top:4px;">${n.contenu}</p>
          <div class="ni-time" style="font-size:0.75rem; opacity:0.5; margin-top:8px;">${this.formatTime(n.created_at)}</div>
        </div>
        ${!n.est_lue ? '<div class="ni-unread-dot"></div>' : ''}
      </div>
    `).join('');

    // Click to mark as read
    container.querySelectorAll('.notif-item.ni-new').forEach(el => {
      el.addEventListener('click', async () => {
        const notifId = el.dataset.id;
        await NotificationService.markAsRead(this.userId, notifId);
        el.classList.remove('ni-new');
        const dot = el.querySelector('.ni-unread-dot');
        if (dot) dot.remove();
        // Update badge count
        const remaining = container.querySelectorAll('.ni-new').length;
        this.updateBadge(remaining);
      });
    });
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
      case 'payment': return 'background:rgba(46,204,113,0.1); color:var(--studio-success, #22C55E);';
      case 'alert': return 'background:rgba(239,68,68,0.1); color:#EF4444;';
      default: return 'background:rgba(255,255,255,0.05); color:#fff;';
    }
  },

  formatTime(dateStr) {
    if (!dateStr) return 'Récemment';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMs / 3600000);
      const diffD = Math.floor(diffMs / 86400000);

      if (diffMin < 1) return "À l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffH < 24) return `Il y a ${diffH}h`;
      if (diffD === 1) return 'Hier, ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      if (diffD < 7) return `Il y a ${diffD} jours`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Récemment';
    }
  },

  updateBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => NotificationsController.init());
