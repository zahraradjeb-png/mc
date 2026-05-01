const FinanceService = {
  baseUrl: window.API_BASE || 'http://localhost:8000/api',

  async getFinanceSummary(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/stats`);
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  },

  async getTransactions(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/transactions`);
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return [];
    }
  }
};
