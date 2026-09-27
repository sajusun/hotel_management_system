import api from '../lib/axios';

export interface InitiatePaymentResponse {
  success: boolean;
  redirect_url: string;
  session_id: string;
  gateway: string;
}

export const initiatePayment = (
  invoiceId: number,
  gateway: 'stripe' | 'paypal',
  amount?: number
) => {
  return api.post<InitiatePaymentResponse>(`/api/v1/payments/${invoiceId}/initiate`, {
    gateway,
    amount,
  });
};
