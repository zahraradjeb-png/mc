/**
 * URL de base de l'API (suffixe /api).
 *
 * - En production : pointe vers le backend déployé sur Render
 * - En local http : même origine + /api
 * - En local file:// : 127.0.0.1:8000
 *
 * Surcharge : <script>window.API_BASE = 'https://autre/api';</script> avant ce fichier.
 */
(function () {
  if (typeof window.API_BASE !== 'undefined') return;

  const host = window.location.hostname;

  // Production (hébergé sur Netlify ou autre)
  if (host !== 'localhost' && host !== '127.0.0.1' && window.location.protocol !== 'file:') {
    // ⚠️ REMPLACER cette URL par l'URL de votre backend Render après déploiement
    window.API_BASE = 'https://retromarket-api.onrender.com/api';
  }
  // Développement local via serveur (php artisan serve, Live Server, etc.)
  else if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    window.API_BASE = window.location.origin + '/api';
  }
  // Fichier ouvert directement (file://)
  else {
    window.API_BASE = 'http://127.0.0.1:8000/api';
  }
})();
