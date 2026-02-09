// ================================
// File: components/afo/steps/AFOFinish.tsx
// ================================

'use client';
import React from 'react';

export default function AFOFinish({ values }: any) {

  return (
    <div className="mt-6 border rounded p-4 space-y-3">

      <h3 className="font-semibold text-lg">Review Order</h3>

      <p><b>Patient:</b> {values.first_name} {values.last_name}</p>
      <p><b>Product:</b> {values.product_type}</p>
      <p><b>Clinic:</b> {values.clinic_name}</p>
      <p><b>Condition:</b> {values.medical_condition}</p>

      <div className="bg-gray-50 p-3 rounded">
        <p className="text-sm text-gray-600">After submission you will be redirected to payment.</p>
      </div>

    </div>
  );
}
