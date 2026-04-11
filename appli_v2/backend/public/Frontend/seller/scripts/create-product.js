/* ══ Create Product Controller ══ */
const CreateProductController = {
  selectedFiles: [],
  userId: null,

  async init() {
    const user = await SellerLayout.init({
      title: "Créer un Article",
      subtitle: 'Nouveau produit',
      pageId: 'products'
    });
    if (!user) return;

    this.userId = user.id_vendeur || user.vendeur?.id || user.id;

    this._initCategoryToggle();
    this._initImageUpload();
    this._initQtyStepper();
    this._initFormSubmit();
    this._initDragDrop();
  },

  /* ── Category → show music fields ── */
  _initCategoryToggle() {
    const sel         = document.getElementById('cat-select');
    const musicFields = document.getElementById('music-fields');
    const baseFields  = document.getElementById('music-base-fields');
    const cdFields    = document.getElementById('cd-fields');
    const casFields   = document.getElementById('cassette-fields');

    if (!sel || !musicFields) return;

    sel.addEventListener('change', () => {
      const type = sel.options[sel.selectedIndex].getAttribute('data-type');
      const isMusic = ['VINYLE', 'CD', 'CASSETTE'].includes(type);
      
      musicFields.style.display = isMusic ? 'block' : 'none';
      if (isMusic) {
        musicFields.classList.add('animate-slide');
        if (baseFields) baseFields.style.display = 'block';
      } else {
        if (baseFields) baseFields.style.display = 'none';
      }

      if (cdFields) cdFields.style.display = (type === 'CD') ? 'block' : 'none';
      if (casFields) casFields.style.display = (type === 'CASSETTE') ? 'block' : 'none';
    });
  },

  /* ── Image upload & preview ── */
  _initImageUpload() {
    const inp     = document.getElementById('p-img');
    const grid    = document.getElementById('preview-grid');
    const preview = document.getElementById('preview-container');
    if (!inp) return;

    inp.addEventListener('change', () => {
      const newFiles = Array.from(inp.files);
      if (this.selectedFiles.length + newFiles.length > 4) {
        StudioToast.warning('Maximum 4 photos autorisées.');
        inp.value = '';
        return;
      }
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this._renderPreviews(grid, preview);
      inp.value = '';
    });
  },

  /* ── Drag & drop on dropzone ── */
  _initDragDrop() {
    const dropzone = document.getElementById('dropzone');
    if (!dropzone) return;

    ['dragenter','dragover'].forEach(ev => {
      dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    });
    ['dragleave','drop'].forEach(ev => {
      dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.remove('drag-over'); });
    });
    dropzone.addEventListener('drop', e => {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (this.selectedFiles.length + files.length > 4) {
        StudioToast.warning('Maximum 4 photos autorisées.'); return;
      }
      this.selectedFiles = [...this.selectedFiles, ...files];
      const grid = document.getElementById('preview-grid');
      const pv   = document.getElementById('preview-container');
      this._renderPreviews(grid, pv);
    });
  },

  /* ── Render photo thumbnails ── */
  _renderPreviews(grid, container) {
    if (!grid) return;
    grid.innerHTML = '';
    if (this.selectedFiles.length === 0) {
      if (container) container.classList.remove('visible');
      return;
    }
    if (container) container.classList.add('visible');

    this.selectedFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'preview-item animate-fade';
        div.innerHTML = `
          ${idx === 0 ? '<span class="preview-badge">Principale</span>' : ''}
          <button type="button" class="preview-remove" data-idx="${idx}" title="Supprimer">×</button>
          <img src="${e.target.result}" alt="Photo ${idx+1}">`;
        div.querySelector('.preview-remove').onclick = () => {
          this.selectedFiles.splice(idx, 1);
          this._renderPreviews(grid, container);
        };
        grid.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  },

  /* ── Quantity stepper ── */
  _initQtyStepper() {
    const input = document.getElementById('p-quantite');
    const minus = document.getElementById('qty-minus');
    const plus  = document.getElementById('qty-plus');
    if (!input) return;

    minus?.addEventListener('click', () => {
      const v = parseInt(input.value) || 1;
      if (v > 1) input.value = v - 1;
    });
    plus?.addEventListener('click', () => {
      input.value = (parseInt(input.value) || 0) + 1;
    });
  },

  /* ── Form validation ── */
  _validate(form) {
    const errors = [];
    const titre = form.querySelector('[name="titre"]');
    const desc  = form.querySelector('[name="description"]');
    const cat   = form.querySelector('[name="id_categorie"]');
    const prix  = form.querySelector('[name="prix"]');

    if (!titre?.value.trim())        errors.push('Le titre est obligatoire.');
    if (!desc?.value.trim())         errors.push('La description est obligatoire.');
    if (!cat?.value)                 errors.push('Veuillez choisir une catégorie.');
    if (!prix?.value || parseFloat(prix.value) <= 0) errors.push('Le prix doit être supérieur à 0.');
    if (this.selectedFiles.length === 0) errors.push('Veuillez ajouter au moins une photo.');

    // Highlight fields
    [titre, desc, cat, prix].forEach(el => {
      if (el) el.classList.toggle('error', !el.value.trim());
    });

    return errors;
  },

  /* ── Form submit ── */
  _initFormSubmit() {
    const form = document.getElementById('create-product-form');
    const btn  = document.getElementById('pub-btn');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const errors = this._validate(form);
      if (errors.length > 0) {
        errors.forEach(msg => StudioToast.error(msg, 4000));
        return;
      }

      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publication…';
      btn.disabled  = true;

      const formData = new FormData(form);
      formData.set('id_vendeur', this.userId);

      // Replace auto-added empty file entry with real files
      formData.delete('photos[]');
      this.selectedFiles.forEach(f => formData.append('photos[]', f));

      // Handle unchecked checkbox
      if (!form.querySelector('[name="est_disponible"]').checked) {
        formData.set('est_disponible', '0');
      }

      try {
        await ProductService.createProduct(formData);
        btn.innerHTML = '<i class="fas fa-check"></i> Publié !';
        btn.style.background = '#22C55E';
        StudioToast.success('Article publié avec succès ! Redirecting…', 2500);
        setTimeout(() => window.location.href = 'products.html', 2000);
      } catch (err) {
        btn.innerHTML = originalHTML;
        btn.disabled  = false;
        StudioToast.error(err.message || 'Erreur lors de la publication. Vérifiez la connexion au serveur.', 5000);
        console.error('[CreateProduct] Submit error:', err);
      }
    });

    // Draft button
    document.getElementById('draft-btn')?.addEventListener('click', () => {
      StudioToast.info('Fonctionnalité brouillon bientôt disponible.', 3000);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => CreateProductController.init());
