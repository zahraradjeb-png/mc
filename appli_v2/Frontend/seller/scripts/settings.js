const SettingsController = {
  user: null,

  async init() {
    this.user = await SellerLayout.init({
      title: '', 
      pageId: 'settings'
    });
    if (!this.user) return;
    
    this.populateForm();
    this.initAvatarUpload();
    this.initFormSubmit();
  },

  populateForm() {
    document.getElementById('set-shop-name').value = this.user.nom_boutique || this.user.prenom || '';
    document.getElementById('set-shop-bio').value = this.user.description || '';
    document.getElementById('set-shop-loc').value = this.user.localisation || '';
    document.getElementById('set-shop-cat').value = this.user.categorie_principale || '';

    const avatar = document.getElementById('settings-avatar-preview');
    if (this.user.photo_profil && this.user.photo_profil !== 'default.png') {
        const base = 'http://localhost:8000';
        avatar.style.backgroundImage = `url(${base}/${this.user.photo_profil.replace(/^\//, '')})`;
        avatar.textContent = '';
    } else {
        avatar.textContent = (this.user.nom_boutique || this.user.prenom || 'S').charAt(0).toUpperCase();
        avatar.style.backgroundImage = 'none';
        avatar.style.background = 'rgba(229,166,87,0.1)';
        avatar.style.color = 'var(--studio-honey)';
    }
  },

  initAvatarUpload() {
    const input = document.getElementById('avatar-upload');
    const preview = document.getElementById('settings-avatar-preview');

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview locally immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.textContent = '';
        };
        reader.readAsDataURL(file);

        // Upload to backend
        const formData = new FormData();
        formData.append('photo_profil', file);

        try {
            const vId = this.user.id_vendeur || this.user.id;
            const res = await fetch(`http://localhost:8000/api/vendeurs/${vId}/photo`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Upload error:", data);
                throw new Error("Erreur serveur lors de l'upload.");
            }
            
            StudioToast.success('Photo de profil mise à jour !');
            
            // Update local user object
            this.user.photo_profil = data.photo_url;
            localStorage.setItem('gold_user', JSON.stringify(this.user));
            
            // Reload page to reflect changes
            setTimeout(() => location.reload(), 600);

        } catch(err) {
            console.error(err);
            StudioToast.error('Erreur lors du téléchargement de la photo');
            // reset file input
            input.value = '';
        }
    });
  },

  initFormSubmit() {
    const btn = document.getElementById('save-settings-btn');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const ogText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        btn.disabled = true;

        const payload = {
            nom_boutique: document.getElementById('set-shop-name').value,
            description: document.getElementById('set-shop-bio').value,
            localisation: document.getElementById('set-shop-loc').value,
            categorie_principale: document.getElementById('set-shop-cat').value
        };

        try {
            const vId = this.user.id_vendeur || this.user.id;
            const res = await fetch(`http://localhost:8000/api/vendeurs/${vId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            
            if (!res.ok) {
                console.error("Profile update error:", data);
                throw new Error('Update failed');
            }

            StudioToast.success('Profil mis à jour avec succès !');
            
            // Update local user object
            this.user.nom_boutique = payload.nom_boutique;
            this.user.description = payload.description;
            this.user.localisation = payload.localisation;
            this.user.categorie_principale = payload.categorie_principale;
            localStorage.setItem('gold_user', JSON.stringify(this.user));

            setTimeout(() => location.reload(), 600);
        } catch(err) {
            StudioToast.error('Erreur lors de la mise à jour');
        } finally {
            btn.innerHTML = ogText;
            btn.disabled = false;
        }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => SettingsController.init());
