/* ══ Gold Studio — Seller Layout Component ══
   Orchestrates: auth check, sidebar, header, mobile nav, toasts
*/
const SellerLayout = {

  async init(options = {}) {
    const { title = 'Dashboard', subtitle = '', pageId = 'dashboard' } = options;

    // 1. Auth guard
    const user = SellerAuth.checkSession();
    if (!user) return null;

    // 2. Sidebar
    if (typeof SellerSidebar !== 'undefined') SellerSidebar.render(pageId);

    // 3. Header
    if (typeof SellerHeader !== 'undefined') SellerHeader.render(title, subtitle || `Bonjour, ${user.prenom || user.nom_boutique || 'Vendeur'}`);

    // 4. Mobile sidebar toggle
    this._initMobileNav();

    // 5. Global name placeholders
    const nameEl = document.getElementById('layout-user-name');
    if (nameEl) nameEl.textContent = user.nom_boutique || user.prenom || '';

    // 6. Load notification badge count
    this._loadNotifBadge(user.id_user || user.id);

    return user;
  },

  async _loadNotifBadge(userId) {
    try {
      if (typeof NotificationService !== 'undefined') {
        const count = await NotificationService.getUnreadCount(userId);
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
    } catch (e) {
      // Silently fail if service unavailable
    }
  },

  _initMobileNav() {
    const toggle  = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.studio-sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!toggle || !sidebar) return;

    const open  = () => { sidebar.classList.add('open'); if (overlay) overlay.style.display='block'; };
    const close = () => { sidebar.classList.remove('open'); if (overlay) overlay.style.display='none'; };

    toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
    if (overlay) overlay.addEventListener('click', close);
  }
};

/* ══ Global Toast Utility ══ */
const StudioToast = {
  show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('studio-toast');
    if (!container) {
      container = document.createElement('div');
      container.id = 'studio-toast';
      document.body.appendChild(container);
    }

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 320);
    }, duration);
  },
  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur)   { this.show(msg, 'error',   dur); },
  warning(msg, dur) { this.show(msg, 'warning',  dur); },
  info(msg, dur)    { this.show(msg, 'info',     dur); }
};

/* ══ Global Confirm Modal ══ */
const StudioConfirm = {
  show(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay animate-fade';
    overlay.innerHTML = `
      <div class="confirm-box animate-slide">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="confirm-actions">
          <button class="btn-ghost-studio" id="confirm-cancel">Annuler</button>
          <button class="btn-danger-studio" id="confirm-ok"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }
};
