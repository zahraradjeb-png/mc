const SellerAuth = {
  checkSession() {
    const user = JSON.parse(localStorage.getItem('gold_user'));
    if (!user || (user.role !== 'VENDEUR' && user.role !== 'seller')) {
      console.warn('Unauthorized access to Seller Studio. Redirecting...');
      window.location.href = '../authentification/sign-in.html';
      return null;
    }
    return user;
  },

  logout() {
    localStorage.removeItem('gold_user');
    window.location.href = '../authentification/sign-in.html';
  }
};
