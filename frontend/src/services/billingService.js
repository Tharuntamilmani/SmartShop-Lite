import api from '@/lib/api';

export const billingService = {
    createBill: async (billData) => {
        const response = await api.post('/billing', billData);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/billing/history');
        return response.data;
    },

    getInvoice: async (id) => {
        const response = await api.get(`/billing/invoice/${id}`);
        return response.data;
    }
};
