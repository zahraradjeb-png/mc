/* ══ ProductService — All seller product API operations ══ */
const ProductService = {
  baseUrl: 'http://localhost:8000/api',

  /* ── Fetch seller's products ── */
  async getProducts(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/produits?id_vendeur=${vendeurId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const list = Array.isArray(body) ? body : (body.data || body.produits || []);
      return list.filter(p => String(p.id_vendeur) === String(vendeurId));
    } catch (e) {
      console.error('[ProductService] getProducts:', e);
      return [];
    }
  },

  /* ── Fetch seller stats ── */
  async getSellerStats(vendeurId) {
    try {
      // Try dedicated stats endpoint first
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/stats`);
      if (res.ok) {
        const data = await res.json();
        return data.stats || data;
      }
    } catch (_) {}

    // Fallback: compute from products list
    try {
      const products = await this.getProducts(vendeurId);
      const total      = products.length;
      const active     = products.filter(p => p.est_disponible == 1 && p.quantite > 0).length;
      const low_stock  = products.filter(p => p.quantite <= 3 && p.quantite > 0).length;
      const out_stock  = products.filter(p => p.quantite == 0).length;
      return { total_products: total, active: active, low_stock: low_stock, out_stock: out_stock, avg_rating: 0, month_revenue: 0, total_orders: 0, pending_orders: 0 };
    } catch (e) {
      console.error('[ProductService] getSellerStats fallback:', e);
      return { total_products: 0, active: 0, low_stock: 0, out_stock: 0, avg_rating: 0, month_revenue: 0, total_orders: 0, pending_orders: 0 };
    }
  },

  /* ── Fetch Finance Stats ── */
  async getFinance(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/finance`);
      if (res.ok) return await res.json();
      return null;
    } catch (_) { return null; }
  },

  /* ── Fetch Seller Orders ── */
  async getOrders(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/commandes`);
      if (res.ok) return await res.json();
      return [];
    } catch (_) { return []; }
  },

  /* ── Fetch Seller Reviews ── */
  async getReviews(vendeurId) {
    try {
      const res = await fetch(`${this.baseUrl}/vendeurs/${vendeurId}/avis`);
      if (res.ok) return await res.json();
      return [];
    } catch (_) { return []; }
  },

  /* ── Create product (multipart/form-data) ── */
  async createProduct(formData) {
    try {
      const res = await fetch(`${this.baseUrl}/produits`, {
        method: 'POST',
        body: formData
        // No Content-Type header — browser sets multipart boundary automatically
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error('[ProductService] createProduct:', e);
      throw e;
    }
  },

  /* ── Update product ── */
  async updateProduct(id, formData) {
    try {
      const res = await fetch(`${this.baseUrl}/produits-update/${id}`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error('[ProductService] updateProduct:', e);
      throw e;
    }
  },

  /* ── Delete product ── */
  async deleteProduct(id) {
    try {
      const res = await fetch(`${this.baseUrl}/produits/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch (e) {
      console.error('[ProductService] deleteProduct:', e);
      throw e;
    }
  },

  /* ── Get single product ── */
  async getProduct(id) {
    try {
      const res = await fetch(`${this.baseUrl}/produits/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('[ProductService] getProduct:', e);
      return null;
    }
  },

  /* ── Toggle product availability ── */
  async toggleAvailability(id, available) {
    try {
      const res = await fetch(`${this.baseUrl}/produits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ est_disponible: available ? 1 : 0 })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('[ProductService] toggleAvailability:', e);
      throw e;
    }
  },

  /* ── Utility: build image URL ── */
  resolveImage(product) {
    let url = null;
    if (product.photo_principale) url = product.photo_principale;
    else if (product.photos && product.photos.length > 0) {
      const first = product.photos[0];
      url = first.chemin || first.url || first;
    }
    else if (product.chemin) url = product.chemin;

    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Si c'est un chemin relatif (ex: uploads/products/xyz.jpg)
    const base = this.baseUrl ? this.baseUrl.replace('/api', '') : 'http://localhost:8000';
    return `${base}/${url.replace(/^\//, '')}`;
  }
};
