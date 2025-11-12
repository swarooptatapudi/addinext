'use client';
import { useEffect, useState } from 'react';

export default function PaymentReturnPage() {
  const [status, setStatus] = useState<'success' | 'failed' | 'processing'>('processing');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order_id = params.get('order_id');
    const paymentStatus = (params.get('status') || '').toLowerCase();

    setOrderId(order_id);

    if (paymentStatus === 'success' || paymentStatus === 'paid') {
      setStatus('success');
    } else if (paymentStatus === 'failed' || paymentStatus === 'error' || paymentStatus === 'cancelled') {
      setStatus('failed');
    } else {
      setStatus('processing');
    }

    // 🔄 Notify parent (popup mode)
    if (window.opener) {
      window.opener.postMessage(
        { type: 'HDFC_RETURN', payload: { order_id, status: paymentStatus } },
        '*'
      );
    }
  }, []);

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/orders';
    }
  };

  // 🌈 UI colors and messages
  const colors = {
    success: '#22c55e', // green
    failed: '#ef4444',  // red
    processing: '#facc15' // yellow
  };

  const messages = {
    success: 'Payment Successful!',
    failed: 'Payment Failed!',
    processing: 'Processing Payment...'
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem 2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        {/* Status Icon */}
        <div style={{ marginBottom: '1rem' }}>
          {status === 'success' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={colors.success}
              style={{ width: '64px', height: '64px', margin: 'auto' }}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.172l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {status === 'failed' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={colors.failed}
              style={{ width: '64px', height: '64px', margin: 'auto' }}
            >
              <path
                fillRule="evenodd"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm.707 10.707a1 1 0 01-1.414 0L7.293 9.707a1 1 0 111.414-1.414L12 10.586l3.293-3.293a1 1 0 011.414 1.414l-3.293 3.293zM12 14a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {status === 'processing' && (
            <div
              style={{
                border: `4px solid ${colors.processing}`,
                borderRadius: '50%',
                borderTopColor: 'transparent',
                width: '48px',
                height: '48px',
                margin: 'auto',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}
        </div>

        {/* Title */}
        <h2 style={{ color: colors[status], fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {messages[status]}
        </h2>

        {/* Order info */}
        {orderId && (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Order ID: <strong>{orderId}</strong>
          </p>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            backgroundColor: colors[status],
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            width: '100%',
            transition: 'opacity 0.2s'
          }}
        >
          Close
        </button>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </main>
  );
}
