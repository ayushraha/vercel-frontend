import api from './api';

export const paymentService = {
  createPaymentOrder: async (noteId, amount) => {
    const response = await api.post('/payment/create-order', { noteId, amount });
    return response.data;
  },

  verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature, noteId) => {
    const response = await api.post('/payment/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      noteId
    });
    return response.data;
  },

  // ✅ UPDATED: This now auto-creates wallet if not found
  getAdminWallet: async () => {
    try {
      const response = await api.get('/payment/admin/wallet');
      return response.data;
    } catch (error) {
      // If 404, wallet might not exist yet (will be created by backend)
      if (error.response?.status === 404) {
        console.warn('Wallet not found, requesting creation...');
        // Try again after a brief delay (backend should create it)
        await new Promise(resolve => setTimeout(resolve, 500));
        return await api.get('/payment/admin/wallet');
      }
      throw error;
    }
  },

  getPaymentHistory: async () => {
    const response = await api.get('/payment/admin/history');
    return response.data;
  },

  getStudentPurchases: async () => {
    const response = await api.get('/payment/student/purchases');
    return response.data;
  },

  updateBankDetails: async (bankDetails) => {
    const response = await api.put('/payment/admin/bank-details', bankDetails);
    return response.data;
  },

  requestWithdrawal: async (amount) => {
    const response = await api.post('/payment/admin/withdraw', { amount });
    return response.data;
  }
};