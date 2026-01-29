'use client';

import React, { useEffect } from 'react';
import { WikyProduct } from './types';
import { useWikySession } from './useWikySession';

type Props = {
  orderId: string;
  product: WikyProduct;
  patient: any;          // patient object from PatientPicker
  shoeSize: number;      // required by Wiky form
};

export function WikyDesignFlow({ orderId, product, patient, shoeSize }: Props) {
  const wiky = useWikySession(orderId, product, { patient, shoeSize });

  useEffect(() => {
    // auto start once mounted (you can remove if you want manual start button)
    wiky.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="border rounded p-4 space-y-3">
      <div className="font-medium">Wiky Flow</div>

      {wiky.error ? <div className="text-red-600 text-sm">{wiky.error}</div> : null}

      {wiky.step === 'UPLOAD' && (
        <div className="text-sm">Session created. Upload ZIP in your existing UI step.</div>
      )}

      {wiky.iframeUrl ? (
        <iframe
          src={wiky.iframeUrl}
          className="w-full h-[75vh] border rounded"
          allow="clipboard-read; clipboard-write"
        />
      ) : (
        <div className="text-xs text-gray-600">
          Step: <b>{wiky.step}</b>
        </div>
      )}
    </div>
  );
}
