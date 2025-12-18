'use client';

import React from 'react';
import Image from 'next/image';
import { useField } from 'formik';

type Props = {
  UI: { Input: any; Label: any; Card: any };
};

/* ---------------------- IMAGES (DO NOT CHANGE PATHS) ---------------------- */
const IMG = {
  length_ap_cm: '/assets/order-forms/asp/stockinet.jpg',
  head_circumference_cm: '/assets/order-forms/asp/head_circumference.png',
  temple_width_cm: '/assets/order-forms/asp/temple_width.jpg',
  width_ml_cm: '/assets/order-forms/asp/measurement_of_width.png',
  eyebrow_to_vertex_cm: '/assets/order-forms/asp/eyebrow_line_to_highest_cranial.jpg',
  tragus_to_vertex_cm: '/assets/order-forms/asp/tragus_of_ear_to_vertex.png',
  occiput_to_vertex_cm: '/assets/order-forms/asp/most_prominent_occiput_to_vertex.png',
  suboccipital_chin_cm: '/assets/order-forms/asp/suboccipital.jpg',
  ear_clearance_cm: '/assets/order-forms/asp/ear_clearance.png',
  neck_clearance_cm: '/assets/order-forms/asp/neck_clearance.png',
};

/* ---------------------- FIELD CONFIG ---------------------- */
const FIELDS = [
  { key: 'length_ap_cm', label: 'Measurement of Length (A–P) (cm)' },
  { key: 'head_circumference_cm', label: 'Head Circumference (cm)' },
  { key: 'temple_width_cm', label: 'Temple Width (cm)' },
  { key: 'width_ml_cm', label: 'Measurement of Width (M–L) (cm)' },
  { key: 'eyebrow_to_vertex_cm', label: 'Eyebrow line → Vertex (cm)', min: 7.5, max: 15 },
  { key: 'tragus_to_vertex_cm', label: 'Tragus → Vertex (cm)', min: 9, max: 15 },
  { key: 'occiput_to_vertex_cm', label: 'Occiput → Vertex (cm)', min: 6, max: 12 },
  { key: 'suboccipital_chin_cm', label: 'Suboccipital → Chin strap path (cm)', min: 10, max: 30 },
  { key: 'ear_clearance_cm', label: 'Ear Clearance (cm)', min: 2, max: 5 },
  { key: 'neck_clearance_cm', label: 'Neck Clearance (Occiput → C7) (cm)', min: 6, max: 12 },
  { key: 'bony_defect_size', label: 'Approximate size of Bony Defect (L × W)', type: 'text' },
] as const;

/* ---------------------- FIELD CARD (MATCHES CRANIAL) ---------------------- */
function FieldCard({
                     name,
                     label,
                     img,
                     min,
                     max,
                     type = 'number',
                     UI,
                   }: {
  name: string;
  label: string;
  img?: string;
  min?: number;
  max?: number;
  type?: 'number' | 'text';
  UI: { Input: any; Label: any; Card: any };
}) {
  const { Input, Label, Card } = UI;
  const [field, meta, helpers] = useField(name);

  const showError = Boolean(meta.touched && meta.error);

  const normalizeOnBlur = () => {
    if (type !== 'number') return;
    const n = Number(field.value);
    if (!Number.isFinite(n)) return;
    if (min !== undefined && n < min) helpers.setValue(min);
    if (max !== undefined && n > max) helpers.setValue(max);
  };

  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex items-start gap-4">
        {img && (
          <div className="w-24 h-24 relative flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden">
            <Image
              src={img}
              alt={label}
              fill
              sizes="96px"
              className="object-contain p-2"
            />
          </div>
        )}

        <div className="flex-1">
          <Label htmlFor={name} className="mb-1 block">
            {label}
          </Label>

          <Input
            {...field}
            id={name}
            type={type}
            value={field.value ?? ''}
            className={`text-center ${showError ? 'border-red-500' : ''}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              helpers.setValue(e.target.value)
            }
            onBlur={normalizeOnBlur}
            onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
            }}
            required
          />

          {showError && (
            <div className="mt-1 text-xs text-red-600">{meta.error}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ======================= MAIN COMPONENT ======================= */
export default function ASPMeasurement({ UI }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Measurements (with Stockinet)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {FIELDS.map((f) => (
          <FieldCard
            key={f.key}
            name={f.key}
            label={f.label}
            img={IMG[f.key as keyof typeof IMG]}
            min={(f as any).min}
            max={(f as any).max}
            type={(f as any).type}
            UI={UI}
          />
        ))}
      </div>
    </div>
  );
}
