'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FinishPaymentProps {
  values: any;
  onSubmit: () => void;
  onBack: () => void;
  loading?: boolean;
}

export default function FinishPayment({
                                        values,
                                        onSubmit,
                                        onBack,
                                        loading = false,
                                      }: FinishPaymentProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-primary border-b pb-2">
          Review & Finish
        </h2>

        {/* ---------------- Summary ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Product Type</p>
            <p>{values.product_type}</p>
          </div>

          <div>
            <p className="font-semibold">Patient</p>
            <p>
              {values.first_name} {values.last_name}
            </p>
          </div>

          <div>
            <p className="font-semibold">Age</p>
            <p>{values.age}</p>
          </div>

          <div>
            <p className="font-semibold">Laterality</p>
            <p>{values.laterality}</p>
          </div>

          <div>
            <p className="font-semibold">Clinic</p>
            <p>{values.clinic_name || '—'}</p>
          </div>

          <div>
            <p className="font-semibold">Assessment Date</p>
            <p>{values.assessment_date || '—'}</p>
          </div>
        </div>

        {/* ---------------- Info ---------------- */}
        <div className="bg-gray-50 border rounded p-4 text-sm text-gray-700">
          <p>
            This order will be saved and forwarded for pricing and payment
            processing. You can review pricing before final payment.
          </p>
        </div>

        {/* ---------------- Actions ---------------- */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Finish & Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
