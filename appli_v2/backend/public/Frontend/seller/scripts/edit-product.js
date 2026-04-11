/* ══ Edit Product Controller ══ */
const EditProductController = {
  selectedFiles: [], // new selected photos
  existingPhotos: [], // existing photos from DB
  userId: null,
  productId: null,

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    this.productId = urlParams.get('id');

    if (!this.productId) {
      window.location.href = 'products.html';
      return;
    }

    const user = await SellerLayout.init({
      title: "Modifier l'Article",
      subtitle: 'Mise à jour du produit',
      pageId: 'products'
    });
    if (!user) return;

    this.userId = user.id_vendeur || user.vendeur?.id || user.id;

    this._initCategoryToggle();
    this._initImageUpload();
    this._initQtyStepper();
    this._initFormSubmit();
    this._initDragDrop();

    // Load data
    await this.loadProductData();
  },

  async loadProductData() {
    try {
      const data = await ProductService.getProduct(this.productId);
      if (!data || !data.product) {
        StudioToast.error('Produit introuvable.', 3000);
        setTimeout(() => window.location.href = 'products.html', 1500);
        return;
      }

      this._populateForm(data);
    } catch (e) {
      StudioToast.error('Erreur de chargement du produit.', 3000);
      console.error(e);
    }
  },

  _populateForm(data) {
    const p = data.product;
    const form = document.getElementById('create-product-form');
    if (!form) return;

    form.querySelector('[name="titre"]').value = p.titre || p.nom || '';
    form.querySelector('[name="artiste"]').value = p.artiste || '';
    form.querySelector('[name="description"]').value = p.description || '';
    form.querySelector('[name="prix"]').value = p.prix || '';
    form.querySelector('[name="quantite"]').value = p.quantite || 1;
    form.querySelector('[name="annee"]').value = p.annee || '';
    form.querySelector('[name="decennie"]').value = p.decennie || '';
    
    // Selects
    form.querySelector('[name="id_categorie"]').value = p.id_categorie || '';
    form.querySelector('[name="etat"]').value = p.etat || 'BON';
    form.querySelector('[name="rarete"]').value = p.rarete || 'COMMUN';

    // Toggle Checkbox
    form.querySelector('[name="est_disponible"]').checked = (p.est_disponible == 1);

    // Trigger category change to show/hide specialized fields
    const catSelect = form.querySelector('[name="id_categorie"]');
    catSelect.dispatchEvent(new Event('change'));

    // Specialized
    if (data.details) {
      const d = data.details;
      if (d.label) form.querySelector('[name="label"]').value = d.label;
      if (d.genre) form.querySelector('[name="genre"]').value = d.genre;
      if (d.nb_pistes) form.querySelector('[name="nb_pistes"]').value = d.nb_pistes;
      if (d.duree_min) form.querySelector('[name="duree_min"]').value = d.duree_min;
    }

    // Existing Photos
    if (data.photos && data.photos.length > 0) {
       this.existingPhotos = data.photos;
       this._renderPreviews(document.getElementById('preview-grid'), document.getElementById('preview-container'));
    }
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
      const type = sel.options[sel.selectedIndex]?.getAttribute('data-type') || '';
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
      if (this.existingPhotos.length + this.selectedFiles.length + newFiles.length > 4) {
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
      if (this.existingPhotos.length + this.selectedFiles.length + files.length > 4) {
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
    if (this.existingPhotos.length === 0 && this.selectedFiles.length === 0) {
      if (container) container.classList.remove('visible');
      return;
    }
    if (container) container.classList.add('visible');

    let totalIdx = 0;

    // Render exiting
    this.existingPhotos.forEach((photo, idx) => {
      const div = document.createElement('div');
      div.className = 'preview-item animate-fade';
      
      const src = ProductService.resolveImage({ photo_principale: photo.chemin });
      div.innerHTML = `
        ${totalIdx === 0 ? '<span class="preview-badge">Principale</span>' : ''}
        <button type="button" class="preview-remove" title="Supprimer">×</button>
        <img src="${src}" alt="Photo ${totalIdx+1}">`;
        
      div.querySelector('.preview-remove').onclick = async () => {
        StudioConfirm.show('Supprimer photo', 'Voulez-vous retirer cette photo définitivement ?', async () => {
           try {
              // Assuming ProductService.deletePhoto exist, or just logic
              const res = await fetch(`${ProductService.baseUrl}/produits/photo/${photo.id_photo}`, { method: 'DELETE' });
              if (res.ok) {
                 this.existingPhotos.splice(idx, 1);
                 this._renderPreviews(grid, container);
              } else {
                 StudioToast.error('Erreur API suppression photo.');
              }
           } catch(e) { console.error(e); }
        });
      };
      grid.appendChild(div);
      totalIdx++;
    });

    // Render new
    this.selectedFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'preview-item animate-fade';
        div.innerHTML = `
          ${totalIdx === 0 ? '<span class="preview-badge">Principale</span>' : ''}
          <button type="button" class="preview-remove" data-idx="${idx}" title="Retirer">×</button>
          <img src="${e.target.result}" alt="Nouvelle Photo">`;
        div.querySelector('.preview-remove').onclick = () => {
          this.selectedFiles.splice(idx, 1);
          this._renderPreviews(grid, container);
        };
        grid.appendChild(div);
        totalIdx++;
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
    
    if (this.existingPhotos.length === 0 && this.selectedFiles.length === 0) {
      errors.push('Veuillez avoir au moins une photo.');
    }

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
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde…';
      btn.disabled  = true;

      const formData = new FormData(form);
      formData.set('id_vendeur', this.userId);

      // Handle photos array manually, strip empty inputs
      formData.delete('photos[]');
      this.selectedFiles.forEach(f => formData.append('photos[]', f));

      // Checkbox
      if (!form.querySelector('[name="est_disponible"]').checked) {
        formData.set('est_disponible', '0');
      }

      try {
        await ProductService.updateProduct(this.productId, formData);
        btn.innerHTML = '<i class="fas fa-check"></i> Enregistré !';
        btn.style.background = '#22C55E';
        StudioToast.success('Modifications enregistrées !', 2000);
        setTimeout(() => window.location.href = 'products.html', 1500);
      } catch (err) {
        btn.innerHTML = originalHTML;
        btn.disabled  = false;
        StudioToast.error('Erreur lors de la sauvegarde.', 5000);
        console.error('[EditProduct] Submit error:', err);
      }
    });

    document.getElementById('draft-btn')?.addEventListener('click', () => {
      window.location.href = 'products.html';
    });
  }
};

document.addEventListener('DOMContentLoaded', () => EditProductController.init());
