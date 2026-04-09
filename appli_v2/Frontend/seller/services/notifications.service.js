const NotificationService = {
  baseUrl: 'http://localhost:8000/api',

  async getNotifications(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/notifications`);
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return [];
    }
  },

  async markAsRead(id) {
    try {
      const res = await fetch(`${this.baseUrl}/notifications/${id}/read`, { method: 'PUT' });
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  }
};
