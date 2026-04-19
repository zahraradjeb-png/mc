/* ══ SellerHeader Component ══ */
const SellerHeader = {
  render(title = 'Dashboard', subtitle = 'Bienvenue') {
    const container = document.getElementById('header-container');
    if (!container) return;

    container.innerHTML = `
      <header class="studio-header" style="margin-bottom:48px;">
        <div class="welcome-msg">
          <p style="text-transform:uppercase; letter-spacing:2px; font-size:0.7rem; color:var(--studio-muted); margin-bottom:6px;">${subtitle}</p>
          <h1 class="vintage-title" style="font-family:'Cormorant Garamond',serif; font-size:3.2rem; background: var(--studio-gold-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${title}</h1>
        </div>
        <div class="header-right">
          <div class="header-actions" id="header-actions"></div>
          <div class="header-utilities" style="background: rgba(255,255,255,0.03); border: 1px solid var(--studio-border); padding: 8px; border-radius: 40px; backdrop-filter: blur(20px);">
            <a href="notifications.html" class="util-icon" title="Notifications">
              <i class="fas fa-bell"></i>
              <span class="util-dot" style="background:var(--studio-error); border: 2px solid var(--studio-bg);"></span>
            </a>
            <a href="profile.html" class="util-icon" title="Mon profil" style="
              background: hsla(38, 70%, 55%, 0.15); color: var(--studio-honey); border-radius: 50%; border: 1px solid var(--studio-border);">
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
