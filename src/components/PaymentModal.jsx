import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import '../styles/PaymentModal.css';


export const PaymentModal = ({ note, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderResponse = await paymentService.createPaymentOrder(note._id, note.price);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message);
      }

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: note.price * 100,
        currency: 'INR',
        name: 'SPPU Notes Portal',
        description: `Purchase: ${note.title}`,
        order_id: orderResponse.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              note._id
            );

            if (verifyResponse.success) {
              onSuccess && onSuccess();
              onClose();
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: 'Student',
          email: 'student@example.com'
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>💳 Purchase Premium Note</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="payment-details">
          <div className="note-info">
            <h3>{note.title}</h3>
            <p><strong>Subject:</strong> {note.subject}</p>
            <p><strong>Department:</strong> {note.department}</p>
            <p><strong>Semester:</strong> {note.semester}</p>
          </div>

          <div className="price-section">
            <div className="price-item">
              <span>Price:</span>
              <span className="amount">₹{note.price}</span>
            </div>
            <div className="price-item">
              <span>Platform Fee (10%):</span>
              <span className="amount">₹{(note.price * 0.1).toFixed(2)}</span>
            </div>
            <div className="price-item total">
              <span>Total:</span>
              <span className="amount">₹{note.price}</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="payment-btn"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <p className="security-note">
            🔒 Your payment is secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};