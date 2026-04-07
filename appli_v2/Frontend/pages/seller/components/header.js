/* ══ SellerHeader Component ══ */
const SellerHeader = {
  render(title = 'Dashboard', subtitle = 'Bienvenue') {
    const container = document.getElementById('header-container');
    if (!container) return;

    container.innerHTML = `
      <header class="studio-header">
        <div class="welcome-msg">
          <p>${subtitle}</p>
          <h1 class="vintage-title">${title}</h1>
        </div>
        <div class="header-right">
          <div class="header-actions" id="header-actions"></div>
          <div class="header-utilities">
            <a href="notifications.html" class="util-icon" title="Notifications">
              <i class="fas fa-bell"></i>
              <span class="util-dot"></span>
            </a>
            <a href="settings.html" class="util-icon" title="Paramètres">
              <i class="fas fa-cog"></i>
            </a>
            <a href="profile.html" class="util-icon" title="Mon profil" style="
              background:rgba(229,166,87,0.1);color:var(--studio-honey);border-radius:50%;">
              <i class="fas fa-user-circle"></i>
            </a>
          </div>
        </div>
      </header>`;
  },

  addAction(html) {
    const el = document.getElementById('header-actions');
    if (el) el.insertAdjacentHTML('beforeend', html);
  }
};
