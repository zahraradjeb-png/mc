/* ══ PredictionService — API calls for AI predictions ══ */
const PredictionService = {
  baseUrl: 'http://localhost:8000/api',

  /**
   * Récupère les prédictions IA pour un vendeur.
   * @param {number} vendeurId
   * @returns {Promise<Object>} Données de prédiction
   */
  async getPredictions(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/predictions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('[PredictionService] getPredictions:', e);
      return null;
    }
  }
};
