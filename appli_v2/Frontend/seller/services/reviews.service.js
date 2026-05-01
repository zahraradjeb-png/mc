const ReviewService = {
  baseUrl: window.API_BASE || 'http://localhost:8000/api',

  async getReviews(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/avis`);
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return [];
    }
  },

  async replyToReview(id, content) {
    try {
      const res = await fetch(`${this.baseUrl}/avis/${id}/reponse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  }
};
