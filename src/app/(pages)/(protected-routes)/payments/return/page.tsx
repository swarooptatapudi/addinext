'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetPaymentStatusQuery } from '@/rtk-query/apis/payments';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PaymentReturnPage() {
  const qp = useSearchParams();
  const router = useRouter();

  const order_id = qp.get('merchantTxnId') || qp.get('orderId') || undefined;
  const provider_ref = qp.get('txnId') || qp.get('id') || undefined;

  const { data, isLoading, isError } = useGetPaymentStatusQuery(
    { order_id, provider_ref },
    { skip: !order_id && !provider_ref }
  );

  if (isLoading)
    return <div className="flex justify-center items-center h-64">Checking payment...</div>;

  if (isError)
    return <div className="text-center text-red-600 mt-6">Error fetching payment status</div>;

  const status = data?.data?.status || 'Unknown';
  const success = status === 'Captured' || status === 'Authorized';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className={`text-2xl font-semibold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
          {success ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-gray-700 mb-6">
          {success
            ? '🎉 Your order has been placed successfully!'
            : '❌ Payment failed or cancelled. Please try again.'}
        </p>
        <Button
          onClick={() => router.push('/orders')}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Go to Orders
        </Button>
      </div>
    </div>
  );
}
