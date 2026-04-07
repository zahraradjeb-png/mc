const FinanceController = {
  async init() {
    const user = await SellerLayout.init({
      title: '', // Custom header defined locally
      pageId: 'finance'
    });
    if (!user) return;

    this.userId = user.id_vendeur || user.id;
    this.renderFinance();
  },

  async renderFinance() {
    try {
       const stats = await ProductService.getFinance(this.userId);
       if (stats) {
          document.querySelector('.balance-val').textContent = stats.balance + ' €';
          const revenusMois = document.querySelectorAll('.stat-card h2');
          if (revenusMois.length >= 2) {
             revenusMois[0].textContent = '+ ' + stats.gross_30d + ' €';
             revenusMois[1].textContent = stats.fees_30d + ' €'; // used for fees instead of pending
          }

          // Render transaction history
          const txContainer = document.querySelector('.transaction-list');
          if (txContainer && stats.transactions) {
            // Keep the header but overwrite the rest
            const headerHTML = `<div style="padding:24px; border-bottom:1px solid var(--studio-border);">
                 <h3 class="section-title"><i class="fas fa-list-ul"></i> Historique des Transactions</h3>
             </div>`;

            if (stats.transactions.length === 0) {
               txContainer.innerHTML = headerHTML + `<p style="padding:30px; text-align:center; color:var(--studio-muted);">Aucune transaction facturée pour le moment.</p>`;
            } else {
               txContainer.innerHTML = headerHTML + stats.transactions.map(t => `
                 <div class="t-row">
                   <div class="t-info">
                     <div class="t-icon"><i class="fas fa-arrow-down" style="color:#22C55E;"></i></div>
                     <div>
                       <div style="font-weight:600; color:#fff;">${t.desc}</div>
                       <div style="font-size:0.75rem; color:var(--studio-muted);">${t.date}</div>
                     </div>
                   </div>
                   <div class="t-amt plus">+ ${t.net} €</div>
                 </div>
               `).join('');
            }
          }
       } else {
          document.querySelector('.balance-val').textContent = '0,00 €';
       }
    } catch (e) {
      console.warn('Could not load finance data.');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => FinanceController.init());
