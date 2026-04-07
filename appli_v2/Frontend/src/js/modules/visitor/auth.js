/* ═══════════════════════════════════════
   AUTH.JS — Gold v2
   Login & Register interactivity
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Password visibility toggle ── */
  document.querySelectorAll('.auth-input-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.innerHTML = isText
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
    });
  });

  /* ── Password strength ── */
  const pwInput = document.getElementById('password');
  const strengthEl = document.getElementById('password-strength');
  const strengthBars = document.querySelectorAll('.strength-bar');
  const strengthLabel = document.getElementById('strength-label');

  pwInput?.addEventListener('input', () => {
    const val = pwInput.value;
    if (!val) { strengthEl?.classList.remove('show'); return; }
    strengthEl?.classList.add('show');

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = ['', 'weak', 'medium', 'medium', 'strong'];
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort 💪'];
    const colors = ['', 'var(--rust)', 'var(--gold)', 'var(--gold)', '#16a34a'];

    strengthBars?.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < score) bar.classList.add(levels[score]);
    });
    if (strengthLabel) {
      strengthLabel.textContent = labels[score];
      strengthLabel.style.color = colors[score];
    }
  });

  /* ── Confirm password match ── */
  const confirmPw = document.getElementById('confirm-password');
  confirmPw?.addEventListener('input', () => {
    const match = pwInput?.value === confirmPw.value;
    confirmPw.classList.toggle('error', !match && confirmPw.value.length > 0);
    confirmPw.classList.toggle('valid', match && confirmPw.value.length > 0);
    const errEl = document.getElementById('pw-match-error');
    if (errEl) errEl.style.display = (!match && confirmPw.value.length > 0) ? 'flex' : 'none';
  });

  /* ── Account type selector (register) ── */
  document.querySelectorAll('.account-type-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.account-type-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      const sellerExtras = document.getElementById('seller-extras');
      const isSeller = opt.dataset.type === 'seller';
      if (sellerExtras) sellerExtras.classList.toggle('show', isSeller);
    });
  });

  /* ── Login mode toggle (buyer / seller) ── */
  document.querySelectorAll('.auth-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.auth-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      const titleEl = document.getElementById('auth-title');
      const subtitleEl = document.getElementById('auth-subtitle');
      if (titleEl && mode === 'seller') {
        titleEl.innerHTML = 'Espace <em>Vendeur</em>';
        if (subtitleEl) subtitleEl.innerHTML = 'Accédez à votre dashboard vendeur. <a href="register.html">Créer un compte</a>';
      } else if (titleEl) {
        titleEl.innerHTML = 'Bon retour <em>parmi nous</em>';
        if (subtitleEl) subtitleEl.innerHTML = 'Pas encore inscrit ? <a href="register.html">Créer un compte</a>';
      }
    });
  });

  /* ── Real-time validation ── */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  document.querySelectorAll('.auth-input').forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        if (input.required) {
          input.classList.add('error');
          input.classList.remove('valid');
        }
        return;
      }
      if (input.type === 'email' && !validateEmail(input.value)) {
        input.classList.add('error');
        input.classList.remove('valid');
      } else {
        input.classList.remove('error');
        input.classList.add('valid');
      }
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error') && input.value.trim()) {
        input.classList.remove('error');
      }
    });
  });

  /* ── Login form submit ── */
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
      showAuthToast('Veuillez remplir tous les champs', 'warn');
      return;
    }
    if (!validateEmail(email)) {
      document.getElementById('email')?.classList.add('error');
      showAuthToast('Adresse email invalide', 'warn');
      return;
    }

    // Loading state
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion…';
      btn.disabled = true;
    }

    setTimeout(() => {
      const isSeller = document.querySelector('.auth-mode-btn[data-mode="seller"].active');
      // Save user in localStorage
      const emailVal = document.getElementById('email')?.value || '';
      const nameParts = emailVal.split('@')[0].split('.');
      const user = {
        role: isSeller ? 'seller' : 'buyer',
        firstName: nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Utilisateur',
        lastName: nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '',
        email: emailVal,
        shopName: isSeller ? (emailVal.split('@')[0] + ' Shop') : null,
        joinDate: new Date().toISOString()
      };
      localStorage.setItem('gold_user', JSON.stringify(user));
      window.location.href = 'index.html';
    }, 1800);
  });

  /* ── Register form submit ── */
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    const termsCheck = document.getElementById('terms-check');

    if (!termsCheck?.checked) {
      showAuthToast('Veuillez accepter les conditions d\'utilisation', 'warn');
      termsCheck?.parentElement.querySelector('input')?.focus();
      return;
    }

    let valid = true;
    document.querySelectorAll('#register-form .auth-input[required]').forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('error');
        valid = false;
      }
    });

    // Check password match
    if (pwInput && confirmPw && pwInput.value !== confirmPw.value) {
      confirmPw.classList.add('error');
      showAuthToast('Les mots de passe ne correspondent pas', 'warn');
      return;
    }

    if (!valid) {
      showAuthToast('Veuillez remplir tous les champs obligatoires', 'warn');
      return;
    }

    // Loading
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création du compte…';
      btn.disabled = true;
    }

    setTimeout(() => {
      const formEl = document.getElementById('register-form');
      const successEl = document.getElementById('register-success');
      const isSeller = document.querySelector('.account-type-opt[data-type="seller"].active');

      if (formEl) formEl.style.display = 'none';
      if (successEl) {
        successEl.classList.add('show');
        const titleEl = successEl.querySelector('.success-title');
        const descEl = successEl.querySelector('.success-desc');
        if (isSeller) {
          if (titleEl) titleEl.textContent = 'Boutique créée !';
          if (descEl) descEl.textContent = 'Votre profil vendeur est prêt. Accédez à votre dashboard pour publier vos premiers produits.';
        }
      }

      // Redirect after delay
      setTimeout(() => {
        const isSeller = document.querySelector('.account-type-opt[data-type="seller"].active');
        const firstName = document.getElementById('first-name')?.value || 'Utilisateur';
        const lastName = document.getElementById('last-name')?.value || '';
        const email = document.getElementById('reg-email')?.value || '';
        const shopName = document.getElementById('shop-name')?.value || '';
        const user = {
          role: isSeller ? 'seller' : 'buyer',
          firstName, lastName, email,
          shopName: isSeller ? shopName : null,
          joinDate: new Date().toISOString()
        };
        localStorage.setItem('gold_user', JSON.stringify(user));
        window.location.href = 'index.html';
      }, 2500);
    }, 2000);
  });

  /* ── Toast ── */
  function showAuthToast(msg, type = 'default') {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    const icon = type === 'warn' ? '⚠' : '✦';
    t.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3500);
  }
});