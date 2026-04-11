const ReviewsController = {
  async init() {
    const user = await SellerLayout.init({
      title: '', // Title in custom header
      pageId: 'reviews'
    });
    if (!user) return;

    this.userId = user.id_vendeur || user.id;
    this.renderReviews();
  },

  async renderReviews() {
    try {
      const reviews = await ProductService.getReviews(this.userId);
      if (reviews && reviews.length > 0) {
        this.renderList(reviews);
        
        // update header rating
        const sum = reviews.reduce((acc, r) => acc + (r.note||0), 0);
        const avg = (sum / reviews.length).toFixed(1);
        document.querySelector('.header-rating-val').textContent = avg;
        document.querySelector('.header-stars').innerHTML = this.getStars(Math.round(avg));
      } else {
        this.renderEmpty();
        document.querySelector('.header-rating-val').textContent = '-';
        document.querySelector('.header-stars').innerHTML = '';
      }
    } catch (e) {
      console.warn('Could not load reviews.', e);
    }
  },

  renderList(reviews) {
    const container = document.getElementById('reviews-list');
    container.innerHTML = reviews.map(r => `
      <article class="studio-card review-card">
        <div class="r-header">
          <div class="r-user">
            <div class="r-av">${(r.nom || 'C').substring(0, 2).toUpperCase()}</div>
            <div>
              <div style="font-weight:600; color:#fff;">${r.nom || 'Anonyme'}</div>
              <div class="r-prod">Achat : ${r.produit_titre || 'Produit inconnu'}</div>
            </div>
          </div>
          <div class="r-stars">${this.getStars(r.note)}</div>
        </div>

        <p class="r-body">${r.commentaire}</p>

        ${r.reponse ? `
          <div class="r-reply">
            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--studio-honey); margin-bottom:8px;">Votre réponse</div>
            <p style="font-size:0.85rem; color:#fff; opacity:0.8;">${r.reponse}</p>
          </div>
        ` : `
          <div class="form-group">
            <textarea class="input-studio" placeholder="Répondre à cet avis..." style="min-height:80px;"></textarea>
            <button class="btn-gold-studio" onclick="ReviewsController.reply(${r.id_avis})" style="align-self:flex-end; margin-top:12px;">Envoyer</button>
          </div>
        `}
      </article>
    `).join('');
  },

  getStars(note) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="${i <= note ? 'fas' : 'far'} fa-star"></i>`;
    }
    return stars;
  },

  renderEmpty() {
    const container = document.getElementById('reviews-list');
    container.innerHTML = `
      <div style="text-align:center; padding:80px 0; opacity:0.4;">
        <i class="fas fa-comment-slash" style="font-size:3rem; margin-bottom:20px; display:block;"></i>
        Aucun avis pour le moment.
      </div>
    `;
  },

  async reply(id) {
     // Handle reply logic...
     console.log('Replying to avis:', id);
  }
};

document.addEventListener('DOMContentLoaded', () => ReviewsController.init());
