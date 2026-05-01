const NotificationService = {
  baseUrl: window.API_BASE || 'http://localhost:8000/api',

  async getNotifications(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/notifications`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return [];
    }
  },

  async markAsRead(vendeurId, notifId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/notifications/${notifId}/lue`, { method: 'PUT' });
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  },

  async markAllAsRead(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/notifications/tout-lire`, { method: 'PUT' });
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  },

  async getUnreadCount(vendeurId) {
    try {
      const notifs = await this.getNotifications(vendeurId);
      return notifs.filter(n => !n.est_lue).length;
    } catch (e) {
      return 0;
    }
  }
};
