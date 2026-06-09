import React, { useState } from 'react';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  amount: number; // amount in USD
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, reservationId, amount, onSuccess }) => {
  const [method, setMethod] = useState<'stripe' | 'paypal' | 'on_arrival'>('stripe');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      if (method === 'on_arrival') {
        // Simple request to mark on-arrival payment
        await fetch(`/api/payments/on-arrival`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservation_id: reservationId }),
        });
        onSuccess();
      } else {
        // Placeholder for Stripe/PayPal integration
        // Normally you would call your backend to create a PaymentIntent or PayPal order
        // Here we just simulate a successful flow
        await new Promise((res) => setTimeout(res, 1000));
        onSuccess();
      }
    } catch (e) {
      console.error('Payment error', e);
      // In a real UI you would show an error toast
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Select Payment Method</h2>
        <p className="modal-amount">Amount: ${amount.toFixed(2)} USD</p>
        <div className="options">
          <label className="option-label">
            <input
              type="radio"
              name="payment_method"
              value="stripe"
              checked={method === 'stripe'}
              onChange={() => setMethod('stripe')}
            />
            <span className="option-name">Stripe</span>
          </label>
          <label className="option-label">
            <input
              type="radio"
              name="payment_method"
              value="paypal"
              checked={method === 'paypal'}
              onChange={() => setMethod('paypal')}
            />
            <span className="option-name">PayPal</span>
          </label>
          <label className="option-label">
            <input
              type="radio"
              name="payment_method"
              value="on_arrival"
              checked={method === 'on_arrival'}
              onChange={() => setMethod('on_arrival')}
            />
            <span className="option-name">Pay on Arrival</span>
          </label>
        </div>
        <button
          className="pay-button"
          onClick={handlePay}
          disabled={processing}
        >
          {processing ? 'Processing…' : 'Confirm Payment'}
        </button>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};
