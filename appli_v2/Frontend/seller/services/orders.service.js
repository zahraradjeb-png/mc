const OrderService = {
  baseUrl: window.API_BASE || 'http://localhost:8000/api',

  async getOrders(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/commandes`);
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return [];
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await fetch(`${this.baseUrl}/commandes/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  }
};
