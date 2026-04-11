/* ═══════════════════════════════════════
   ADMIN.JS — Gold v2
   Admin Dashboard · Full interactivity
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ─── Toast ─── */
  function showToast(msg, type = 'default') {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    const icon = type === 'error' ? '✖' : type === 'success' ? '✔' : '✦';
    t.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ─── Mobile sidebar ─── */
  const sidebar = document.querySelector('.admin-sidebar');
  document.querySelector('.admin-mobile-toggle')?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('.admin-mobile-toggle'))
      sidebar.classList.remove('open');
  });

  /* ─── Date ─── */
  const dateEl = document.getElementById('admin-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ─── KPI counters ─── */
  function animCount(el, target, decimals = 0) {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      const val = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString('fr-FR');
      el.textContent = prefix + val + suffix;
      if (current >= target) clearInterval(timer);
    }, 20);
  }

  const kpiObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.akpi-value[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        animCount(el, target, decimals);
      });
      kpiObs.disconnect();
    });
  }, { threshold: 0.2 });
  const kpiGrid = document.querySelector('.admin-kpi-grid');
  if (kpiGrid) kpiObs.observe(kpiGrid);

  /* ─── MINI CHART BARS ─── */
  const miniData = [28, 45, 32, 67, 54, 89, 72, 95, 81, 110, 98, 145, 120, 135];
  const miniContainer = document.getElementById('mini-bars');
  if (miniContainer) {
    miniContainer.innerHTML = miniData.map((v, i) => {
      const pct = (v / Math.max(...miniData)) * 90;
      const isLast = i === miniData.length - 1;
      return `<div class="mini-bar${isLast ? ' highlight' : ''}" style="height:0" data-target="${pct}%" data-val="${v}k€" title="${v}k€"></div>`;
    }).join('');
    setTimeout(() => {
      miniContainer.querySelectorAll('.mini-bar').forEach(bar => {
        bar.style.height = bar.dataset.target;
      });
    }, 200);
  }

  /* ─── HEALTH BARS animate ─── */
  document.querySelectorAll('.health-bar-fill[data-width]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.width; }, 400);
  });

  /* ─── SYS STAT BARS ─── */
  document.querySelectorAll('.ss-bar-fill[data-width]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.width; }, 500);
  });

  /* ─── ALERT CLOSE ─── */
  document.querySelector('.alert-close')?.addEventListener('click', function () {
    this.closest('.admin-alert')?.remove();
  });

  /* ─── REPORT actions ─── */
  document.querySelectorAll('.rap-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.report-item');
      const title = item?.querySelector('.report-title')?.textContent;
      if (btn.classList.contains('resolve')) {
        item?.style.setProperty('opacity', '0');
        item?.style.setProperty('transition', 'opacity 0.4s');
        setTimeout(() => item?.remove(), 400);
        showToast(`✅ Signalement résolu : "${title}"`, 'success');
      } else if (btn.classList.contains('dismiss')) {
        item?.style.setProperty('opacity', '0.3');
        showToast(`🚫 Signalement ignoré`, 'default');
      } else if (btn.classList.contains('ban')) {
        if (confirm(`Bannir cet utilisateur ? Cette action est irréversible.`)) {
          item?.style.setProperty('opacity', '0');
          item?.style.setProperty('transition', 'opacity 0.4s');
          setTimeout(() => item?.remove(), 400);
          showToast(`🔨 Utilisateur banni`, 'error');
        }
      }
    });
  });

  /* ─── USER ROW actions ─── */
  document.querySelectorAll('.at-action-btn.view').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.at-data-row');
      const name = row?.querySelector('.at-user-name')?.textContent;
      showToast(`👤 Profil de ${name} — module détail (bientôt)`);
    });
  });
  document.querySelectorAll('.at-action-btn.del').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.at-data-row');
      const name = row?.querySelector('.at-user-name, .at-prod-name')?.textContent;
      if (confirm(`Supprimer "${name}" ?`)) {
        row.style.opacity = '0';
        row.style.transition = 'opacity .3s';
        setTimeout(() => row.remove(), 300);
        showToast(`🗑️ "${name}" supprimé`, 'error');
      }
    });
  });

  /* ─── Period switching (mini chart) ─── */
  document.querySelectorAll('.admin-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Re-randomize bars for demo
      miniContainer?.querySelectorAll('.mini-bar').forEach(bar => {
        const h = Math.random() * 85 + 10;
        bar.style.height = h + '%';
      });
    });
  });

  /* ─── Topbar notifications ─── */
  document.querySelector('.at-notif-btn')?.addEventListener('click', () => {
    showToast('🔔 2 alertes système · 1 signalement critique');
  });

  /* ─── Row hover tooltips ─── */
  document.querySelectorAll('.at-data-row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('.at-action-btn') || e.target.tagName === 'BUTTON') return;
      const name = row.querySelector('.at-user-name, .at-prod-name')?.textContent;
      if (name) showToast(`📋 Détail : ${name} — panneau complet (bientôt)`);
    });
  });

  /* ─── Logout ─── */
  document.querySelector('.as-logout')?.addEventListener('click', e => {
    e.preventDefault();
    showToast('👋 Déconnexion admin…');
    setTimeout(() => window.location.href = '../login.html', 1200);
  });

  /* ─── Live clock ─── */
  const clockEl = document.getElementById('admin-clock');
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ─── Search ─── */
  document.getElementById('admin-search')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      showToast(`🔍 Recherche admin : "${e.target.value.trim()}"`);
    }
  });

});