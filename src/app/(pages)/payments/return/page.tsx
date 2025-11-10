// app/payments/return/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function PaymentReturnPage() {
  const q = useSearchParams();
  const providerRef = q.get('provider_ref') || '';
  const status = (q.get('status') || '').toUpperCase();
  const sig = q.get('sig') === '1';

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4">Payment Result</h1>

      <div className="space-y-2 text-sm">
        <div><strong>Provider Ref:</strong> {providerRef || '—'}</div>
        <div><strong>Status:</strong> {status || '—'}</div>
        <div>
          <strong>Signature:</strong>{' '}
          {sig ? <span className="text-green-600">Verified</span> : <span className="text-red-600">Not Verified</span>}
        </div>
      </div>

      {/* Your UX here: fetch SO/payment tx details and show summary, etc. */}
    </div>
  );
}



// // app/payments/return/page.tsx
// 'use client';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { useEffect } from 'react';
//
// export default function PaymentReturnPage() {
//   const qs = useSearchParams();
//   const router = useRouter();
//
//   const sigOk = qs.get('sig') === '1';
//   const ref = qs.get('provider_ref') || '';
//   const status = (qs.get('status') || '').toUpperCase();
//
//   useEffect(() => {
//     // Optional UX: auto-navigate user to Orders after a short delay on success
//     // if (sigOk && (status === 'SUCCESS' || status === 'CAPTURED' || status === 'PAID')) {
//     //   const t = setTimeout(() => router.push('/orders'), 2000);
//     //   return () => clearTimeout(t);
//     // }
//   }, [sigOk, status, router]);
//
//   return (
//     <div className="max-w-md mx-auto mt-16 p-6 rounded-lg border">
//       <h1 className="text-xl font-semibold mb-2">Payment Result</h1>
//       <div className="text-sm text-gray-700 space-y-1">
//         <div><strong>Signature OK:</strong> {sigOk ? 'Yes' : 'No'}</div>
//         <div><strong>Status:</strong> {status || 'UNKNOWN'}</div>
//         <div><strong>Reference:</strong> {ref || '—'}</div>
//       </div>
//       <div className="mt-4 flex gap-2">
//         <button className="px-3 py-2 rounded bg-gray-100 border" onClick={() => router.push('/orders')}>
//           Go to Orders
//         </button>
//         <button className="px-3 py-2 rounded bg-gray-100 border" onClick={() => router.back()}>
//           Back
//         </button>
//       </div>
//       {!sigOk && (
//         <p className="mt-3 text-xs text-red-600">
//           Signature verification failed. If your payment was debited, it may still succeed—please check Orders.
//         </p>
//       )}
//     </div>
//   );
// }
//
//
//
//
// // // src/app/(pages)/(protected-routes)/payments/return/page.tsx
// // 'use client';
// // import * as React from 'react';
// // import { useSearchParams } from 'next/navigation';
// // import { useGetPaymentStatusQuery } from '@/rtk-query/apis/payments';
// // import { Button } from '@/components/ui/button';
// // import { useRouter } from 'next/navigation';
//
// // export default function PaymentReturnPage() {
// //   const qp = useSearchParams();
// //   const router = useRouter();
//
// //   const order_id = qp.get('merchantTxnId') || qp.get('orderId') || undefined;
// //   const provider_ref = qp.get('txnId') || qp.get('id') || undefined;
// //   const verified = qp.get('verified') === '1';
//
// //   const { data, isLoading, isError } = useGetPaymentStatusQuery(
// //     { order_id, provider_ref },
// //     { skip: !order_id && !provider_ref }
// //   );
//
// //   React.useEffect(() => {
// //     console.log("PAGE: /payments/return loaded, qp:", {
// //       merchantTxnId: qp.get('merchantTxnId'),
// //       txnId: qp.get('txnId'),
// //       status: qp.get('status'),
// //       verified: qp.get('verified'),
// //     });
// //   }, [qp]);
//
// //   if (isLoading)
// //     return <div className="flex justify-center items-center h-64">Checking payment...</div>;
//
// //   if (isError)
// //     return <div className="text-center text-red-600 mt-6">Error fetching payment status</div>;
//
// //   const status = (data?.data?.status as string) || qp.get('status') || 'Unknown';
// //   const success = status === 'Captured' || status === 'Authorized' || status === 'CHARGED';
//
// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
// //       <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
// //         <h1 className={`text-2xl font-semibold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
// //           {success ? 'Payment Successful' : 'Payment Failed'}
// //         </h1>
//
// //         <p className="text-gray-700 mb-4">
// //           {success
// //             ? '🎉 Your order has been placed successfully!'
// //             : '❌ Payment failed or cancelled. Please try again.'}
// //         </p>
//
// //         {verified ? (
// //           <p className="text-sm text-green-600 mb-4">Signature verified ✅</p>
// //         ) : (
// //           <p className="text-sm text-yellow-600 mb-4">Signature not verified</p>
// //         )}
//
// //         <div className="mb-4 text-gray-600">
// //           <div>Order ID: {order_id ?? '-'}</div>
// //           <div>Provider Ref: {provider_ref ?? '-'}</div>
// //           <div>Status: {status}</div>
// //         </div>
//
// //         <Button onClick={() => router.push('/orders')} className="bg-primary hover:bg-primary/90 text-white">
// //           Go to Orders
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // }
