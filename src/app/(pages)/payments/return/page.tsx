'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentReturnPage() {
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
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentReturnPage />
    </Suspense>
  );
}