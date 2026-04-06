/* ═══════════════════════════════════════
   GOLD — add-product.js
   Sauvegarde produits dans localStorage
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Date ── */
  const dateEl = document.getElementById('dash-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }

  /* ── Tags system ── */
  let tags = [];
  const tagsWrap = document.getElementById('tags-wrap');
  const tagsInput = document.getElementById('tags-input');

  function addTag(val) {
    const v = val.trim().toLowerCase();
    if (!v || tags.includes(v) || tags.length >= 8) return;
    tags.push(v);
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.style.cssText = 'display:inline-flex;align-items:center;gap:5px;background:rgba(229,166,87,.15);border:1px solid rgba(229,166,87,.3);color:#E5A657;padding:3px 10px;border-radius:100px;font-size:.72rem;margin:2px 4px 2px 0;font-family:Jost,sans-serif';
    chip.innerHTML = `${v} <button type="button" style="background:none;border:none;color:rgba(229,166,87,.6);cursor:pointer;font-size:.85rem;padding:0;line-height:1" data-tag="${v}">&times;</button>`;
    chip.querySelector('button').addEventListener('click', () => {
      tags = tags.filter(t => t !== v);
      chip.remove();
    });
    tagsWrap?.insertBefore(chip, tagsInput);
  }

  tagsInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagsInput.value.replace(',', ''));
      tagsInput.value = '';
    }
  });
  tagsInput?.addEventListener('blur', () => {
    if (tagsInput.value.trim()) { addTag(tagsInput.value); tagsInput.value = ''; }
  });

  /* ── Condition selection ── */
  document.querySelectorAll('.cond-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.cond-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      updatePreview();
      updateChecklist();
    });
  });

  /* ── Vinyl-specific fields ── */
  document.getElementById('prod-category')?.addEventListener('change', function() {
    const vf = document.getElementById('vinyl-specific-fields');
    if (vf) vf.style.display = this.value === 'vinyles' ? 'block' : 'none';
    updatePreview();
    updateChecklist();
  });

  /* ── Image upload ── */
  let uploadedImages = [];
  const uploadZone = document.getElementById('upload-zone');
  const fileInput  = document.getElementById('image-file-input');
  const previewGrid = document.getElementById('image-preview-grid');

  uploadZone?.querySelector('.iuz-btn')?.addEventListener('click', () => fileInput?.click());
  uploadZone?.addEventListener('click', e => { if (e.target === uploadZone) fileInput?.click(); });

  uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = '#E5A657'; });
  uploadZone?.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
  uploadZone?.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.style.borderColor = '';
    handleFiles(Array.from(e.dataTransfer.files));
  });

  fileInput?.addEventListener('change', () => handleFiles(Array.from(fileInput.files)));

  function handleFiles(files) {
    files.filter(f => f.type.startsWith('image/')).slice(0, 8 - uploadedImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        uploadedImages.push(e.target.result);
        renderPreviews();
        updateChecklist();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPreviews() {
    if (!previewGrid) return;
    previewGrid.innerHTML = '';
    uploadedImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#2a1408';
      div.innerHTML = `
        <img src="${src}" style="width:100%;height:100%;object-fit:cover">
        ${i === 0 ? '<span style="position:absolute;bottom:6px;left:6px;background:rgba(229,166,87,.9);color:#1c0f07;font-size:.6rem;padding:2px 7px;border-radius:100px;font-weight:700">PRINCIPALE</span>' : ''}
        <button type="button" data-idx="${i}" style="position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(181,51,36,.85);border:none;color:white;cursor:pointer;font-size:.75rem;display:flex;align-items:center;justify-content:center">&times;</button>`;
      div.querySelector('button').addEventListener('click', () => {
        uploadedImages.splice(i, 1);
        renderPreviews();
        updateChecklist();
      });
      previewGrid.appendChild(div);
    });
  }

  /* ── Live preview ── */
  const EMOJIS = { vinyles:'🎵', cassettes:'📼', instruments:'🎸', posters:'🖼️', livres:'📚', autres:'📦' };
  const COND_LABELS = { parfait:'● Parfait', excellent:'● Excellent', bon:'● Bon', correct:'● Correct' };
  const COND_COLORS = { parfait:'#16a34a', excellent:'#84cc16', bon:'#E5A657', correct:'#B53324' };

  function updatePreview() {
    const name  = document.getElementById('prod-name')?.value || 'Nom du produit';
    const artist= document.getElementById('prod-artist')?.value || 'Artiste';
    const cat   = document.getElementById('prod-category')?.value || '';
    const year  = document.getElementById('prod-year')?.value || '';
    const price = document.getElementById('prod-price')?.value;
    const cond  = document.querySelector('input[name="condition"]:checked')?.value || 'parfait';

    document.getElementById('preview-emoji').textContent = EMOJIS[cat] || '📀';
    document.getElementById('preview-name').textContent  = name;
    document.getElementById('preview-artist').textContent = artist;
    document.getElementById('preview-meta').textContent  = [cat, year].filter(Boolean).join(' · ') || 'Catégorie · Année';
    document.getElementById('preview-price').textContent = price ? parseFloat(price).toLocaleString('fr-FR', {style:'currency',currency:'EUR'}) : '–';
    const condEl = document.getElementById('preview-cond');
    if (condEl) { condEl.textContent = COND_LABELS[cond]; condEl.style.color = COND_COLORS[cond]; }
  }

  ['prod-name','prod-artist','prod-year','prod-price'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { updatePreview(); updateChecklist(); updatePricing(); });
  });

  /* ── Pricing simulation ── */
  function updatePricing() {
    const price    = parseFloat(document.getElementById('prod-price')?.value) || 0;
    const oldPrice = parseFloat(document.getElementById('prod-old-price')?.value) || 0;
    const commission = price * 0.08;
    const net = price - commission;

    document.getElementById('pp-price').textContent      = price ? price.toLocaleString('fr-FR',{style:'currency',currency:'EUR'}) : '–';
    document.getElementById('pp-commission').textContent = price ? `-${commission.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}` : '–';
    document.getElementById('pp-net').textContent        = price ? net.toLocaleString('fr-FR',{style:'currency',currency:'EUR'}) : '–';

    const discountRow = document.getElementById('pp-discount-row');
    if (oldPrice > price && price > 0) {
      const pct = Math.round((1 - price / oldPrice) * 100);
      document.getElementById('pp-discount').textContent = `-${pct}%`;
      if (discountRow) discountRow.style.display = '';
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }
  }
  document.getElementById('prod-old-price')?.addEventListener('input', updatePricing);

  /* ── Checklist & progress ── */
  function updateChecklist() {
    const title  = !!document.getElementById('prod-name')?.value.trim();
    const cat    = !!document.getElementById('prod-category')?.value;
    const price  = !!document.getElementById('prod-price')?.value;
    const photo  = uploadedImages.length > 0;
    const checks = [
      { ok: title, icon: 'check-title-icon', text: 'check-title-text' },
      { ok: cat,   icon: 'check-cat-icon',   text: 'check-cat-text' },
      { ok: true,  icon: 'check-cond-icon',  text: 'check-cond-text' },
      { ok: photo, icon: 'check-photo-icon', text: 'check-photo-text' },
      { ok: price, icon: 'check-price-icon', text: 'check-price-text' },
    ];
    let done = 0;
    checks.forEach(c => {
      const iconEl = document.getElementById(c.icon);
      const textEl = document.getElementById(c.text);
      if (c.ok) {
        done++;
        iconEl?.classList.replace('pending','done');
        iconEl && (iconEl.innerHTML = '<i class="fas fa-check"></i>');
        textEl?.classList.replace('pending','done');
      } else {
        iconEl?.classList.replace('done','pending');
        iconEl && (iconEl.innerHTML = '<i class="fas fa-circle"></i>');
        textEl?.classList.replace('done','pending');
      }
    });
    const pct = Math.round((done / checks.length) * 100);
    const pctEl = document.getElementById('publish-pct');
    const barEl = document.getElementById('publish-progress');
    if (pctEl) pctEl.textContent = pct + '%';
    if (barEl) barEl.style.width = pct + '%';
  }

  /* ── FORM SUBMIT → save to localStorage ── */
  document.getElementById('add-product-form')?.addEventListener('submit', e => {
    e.preventDefault();

    const name  = document.getElementById('prod-name')?.value.trim();
    const artist= document.getElementById('prod-artist')?.value.trim();
    const cat   = document.getElementById('prod-category')?.value;
    const price = document.getElementById('prod-price')?.value;

    // Validation
    let valid = true;
    [['prod-name', name], ['prod-artist', artist], ['prod-category', cat], ['prod-price', price]].forEach(([id, val]) => {
      const field = document.getElementById(id);
      const err   = field?.parentElement?.querySelector('.ap-error');
      if (!val) {
        field?.classList.add('ap-input-error');
        if (err) err.style.display = 'block';
        valid = false;
      } else {
        field?.classList.remove('ap-input-error');
        if (err) err.style.display = 'none';
      }
    });
    if (!valid) return;

    const user = typeof GoldAuth !== 'undefined' ? GoldAuth.getUser() : null;
    const sellerId = user?.email || user?.firstName || 'seller';

    const product = {
      id:          'prod_' + Date.now(),
      sellerId,
      name,
      artist,
      category:    cat,
      year:        document.getElementById('prod-year')?.value || '',
      label:       document.getElementById('prod-label')?.value || '',
      description: document.getElementById('prod-desc')?.value || '',
      condition:   document.querySelector('input[name="condition"]:checked')?.value || 'parfait',
      price:       parseFloat(price),
      oldPrice:    parseFloat(document.getElementById('prod-old-price')?.value) || 0,
      stock:       parseInt(document.getElementById('prod-stock')?.value) || 1,
      shipping:    document.getElementById('prod-shipping')?.value || '',
      tags,
      images:      uploadedImages,
      status:      'published',
      createdAt:   Date.now(),
    };

    // Save
    const existing = JSON.parse(localStorage.getItem('gold_products') || '[]');
    existing.push(product);
    localStorage.setItem('gold_products', JSON.stringify(existing));

    // Toast & redirect
    showToast('✅ Produit publié avec succès !');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
  });

  /* ── Brouillon ── */
  document.querySelector('.btn-save-draft')?.addEventListener('click', () => {
    const draft = {
      name:     document.getElementById('prod-name')?.value,
      artist:   document.getElementById('prod-artist')?.value,
      category: document.getElementById('prod-category')?.value,
      price:    document.getElementById('prod-price')?.value,
      desc:     document.getElementById('prod-desc')?.value,
      status:   'draft',
      savedAt:  Date.now(),
    };
    localStorage.setItem('gold_draft', JSON.stringify(draft));
    showToast('💾 Brouillon sauvegardé');
  });

  function showToast(msg) {
    let t = document.getElementById('gold-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'gold-toast';
      t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#1c0f07;color:#F5E2CE;padding:13px 22px;border-radius:10px;font-size:.87rem;z-index:99999;border:1px solid rgba(229,166,87,0.2);opacity:0;transition:all .3s ease;white-space:nowrap';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2500);
  }

  updatePreview();
  updateChecklist();
});