/**
 * URL de base de l’API (suffixe /api).
 *
 * - Page en http(s) (ex. php artisan serve) : même origine + /api
 * - Page ouverte en file:// (explorateur) : appel vers Laravel sur 127.0.0.1:8000
 *   → lancer : cd backend && php artisan serve
 *   → le backend autorise Origin «null» (CORS) pour le développement
 *
 * Surcharge : <script>window.API_BASE = 'https://autre/api';</script> avant ce fichier.
 */
(function () {
  if (typeof window.API_BASE !== 'undefined') return;
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    window.API_BASE = window.location.origin + '/api';
  } else {
    window.API_BASE = 'http://127.0.0.1:8000/api';
  }
})();
