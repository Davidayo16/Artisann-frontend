import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const bookingId = searchParams.get('bookingId');

    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    async function verifyPayment() {
      try {
        const { data } = await api.get(`/payments/verify`, {
          params: { reference, bookingId }
        });

        if (data?.success || data?.data?.status === 'success') {
          setStatus('success');
          setMessage('Payment successful!');
          setTimeout(() => navigate('/bookings'), 3000);
        } else {
          setStatus('failed');
          setMessage('Payment was not successful');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify payment');
      }
    }

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-4">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl">✓</div>
            <h2 className="text-xl font-semibold text-green-600">Payment Successful!</h2>
            <p className="text-muted">{message}</p>
            <p className="text-sm text-muted">Redirecting...</p>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <div className="text-6xl">✗</div>
            <h2 className="text-xl font-semibold text-red-600">Payment Failed</h2>
            <p className="text-muted">{message}</p>
            <button onClick={() => navigate('/bookings')} className="btn btn-primary">
              Back to Bookings
            </button>
          </>
        )}
      </div>
    </div>
  );
}