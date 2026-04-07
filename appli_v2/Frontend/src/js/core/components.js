/**
 * GOLD — components.js
 * Centralizes UI components for the Vanilla JS stack.
 */

const GoldComponents = {
    /**
     * Injects the Seller Sidebar into a container.
     */
    injectSellerSidebar(activePage = 'dashboard') {
        const root = _root();
        const container = document.getElementById('seller-sidebar-container');
        if (!container) return;

        const menuItems = [
            { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-chart-line', link: 'dashboard.html' },
            { id: 'products', label: 'Mes Produits', icon: 'fas fa-box', link: 'products.html' },
            { id: 'orders', label: 'Commandes', icon: 'fas fa-shopping-bag', link: 'orders.html' },
            { id: 'finance', label: 'Finance & Revenus', icon: 'fas fa-wallet', link: 'finance.html' },
            { id: 'profile', label: 'Profil Boutique', icon: 'fas fa-store', link: 'profile.html' },
            { id: 'reviews', label: 'Avis Clients', icon: 'fas fa-star', link: 'reviews.html' },
            { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell', link: 'notifications.html' },
            { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog', link: 'settings.html' },
        ];

        let html = `
            <div class="seller-sidebar">
                <div class="sidebar-brand">
                    <a href="${root}src/pages/visitor/index.html" class="logo">G<span>old</span> Studio</a>
                </div>
                <nav class="sidebar-nav">
                    <div class="nav-group">
                        <span class="nav-label">Menu Principal</span>
                        ${menuItems.slice(0, 4).map(item => `
                            <a href="${item.link}" class="nav-link ${activePage === item.id ? 'active' : ''}">
                                <i class="${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>
                    <div class="nav-group">
                        <span class="nav-label">Boutique & Clients</span>
                        ${menuItems.slice(4, 7).map(item => `
                            <a href="${item.link}" class="nav-link ${activePage === item.id ? 'active' : ''}">
                                <i class="${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>
                    <div class="nav-group f-mt-auto">
                        <span class="nav-label">Compte</span>
                        <a href="settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
                            <i class="fas fa-cog"></i>
                            <span>Paramètres</span>
                        </a>
                        <button class="nav-link logout-btn gold-logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </nav>
            </div>
        `;
        container.innerHTML = html;
        
        // Re-attach logout events
        document.querySelectorAll('.gold-logout').forEach(btn => {
            btn.addEventListener('click', () => GoldAuth.logout());
        });
    },

    /**
     * Injects the Seller Topbar into a container.
     */
    injectSellerTopbar(title = 'Dashboard') {
        const user = GoldAuth.getUser();
        const container = document.getElementById('seller-topbar-container');
        if (!container) return;

        const initials = user ? (user.nom || 'V')[0].toUpperCase() + (user.prenom || '')[0].toUpperCase() : 'V';
        
        container.innerHTML = `
            <div class="seller-topbar">
                <div class="topbar-left">
                    <button class="sidebar-toggle" id="sidebar-toggle"><i class="fas fa-bars"></i></button>
                    <h1 class="page-title">${title}</h1>
                </div>
                <div class="topbar-right">
                    <div class="topbar-search">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Rechercher...">
                    </div>
                    <button class="topbar-icon-btn" aria-label="Notifications">
                        <i class="fas fa-bell"></i>
                        <span class="notif-dot"></span>
                    </button>
                    <div class="topbar-user">
                        <div class="user-info">
                            <span class="user-name">${user?.nom_boutique || user?.nom || 'Vendeur'}</span>
                            <span class="user-role">Seller Premium</span>
                        </div>
                        <div class="user-avatar">${initials}</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
            document.querySelector('.seller-sidebar')?.classList.toggle('collapsed');
            document.querySelector('.seller-main')?.classList.toggle('expanded');
        });
    }
};
