const SellerAPI = {
  baseUrl: 'http://localhost:8000/api',

  async getStats(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/stats`);
      return await res.json();
    } catch (e) { console.error('API Error:', e); return null; }
  },

  async getProducts(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/produits?id_vendeur=${vendeurId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) { console.error('API Error:', e); return []; }
  },

  async createProduct(formData) {
    try {
      const res = await fetch(`${this.baseUrl}/produits`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (e) { console.error('API Error:', e); return null; }
  },

  async getOrders(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/commandes?id_vendeur=${vendeurId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) { console.error('API Error:', e); return []; }
  },

  async getReviews(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/avis?id_vendeur=${vendeurId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) { console.error('API Error:', e); return []; }
  }
};
