'use client';
import React from 'react';
import Image from 'next/image';
import { useField } from 'formik';

type MeasurementProps = {
  UI: { Input: any; Label: any; Card: any };
};

const IMG = {
  ap: '/assets/order-forms/cranial/image1.png',
  hc: '/assets/order-forms/cranial/image2.png',
  tw: '/assets/order-forms/cranial/image3.png',
  ml: '/assets/order-forms/cranial/image4.png',
  da: '/assets/order-forms/cranial/image14.png',
  db: '/assets/order-forms/cranial/image15.png',
} as const;

const FIELDS = [
  { key: 'ap', title: 'Measurement of Length (A-P) (mm)', img: IMG.ap },
  { key: 'hc', title: 'Head Circumference (mm)', img: IMG.hc },
  { key: 'tw', title: 'Temple Width (mm)', img: IMG.tw },
  { key: 'ml', title: 'Measurement of Width (M-L) (mm)', img: IMG.ml },
  { key: 'da', title: 'Diagonal A (mm)', img: IMG.da },
  { key: 'db', title: 'Diagonal B (mm)', img: IMG.db },
] as const;

function FieldCard({
                     name,
                     title,
                     img,
                     UI,
                   }: {
  name: string;
  title: string;
  img: string;
  UI: { Input: any; Label: any; Card: any };
}) {
  const { Input, Label, Card } = UI;
  const [field, meta, helpers] = useField(name);

  const normalizeOnBlur = (raw: any) => {
    if (raw === '' || raw == null) return '';
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : '';
  };

  const showError = !!(meta.touched && meta.error);

  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 relative flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden">
          <Image src={img} alt={title} fill className="object-contain p-2" sizes="96px" />
        </div>

        <div className="flex-1">
          <Label htmlFor={name} className="mb-1 block">
            {title}
          </Label>
          <Input
            {...field}
            id={name}
            placeholder="mm"
            value={field.value ?? ''}
            className={`text-center ${showError ? 'border-red-500' : ''}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => helpers.setValue(e.target.value)}
            required
            onBlur={() => helpers.setValue(normalizeOnBlur(field.value))}
            onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
            }}
          />
          {showError ? <div className="mt-1 text-xs text-red-600">{meta.error}</div> : null}
        </div>
      </div>
    </Card>
  );
}

export default function Measurement({ UI }: MeasurementProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Measurement</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {FIELDS.map((f) => (
          <FieldCard key={f.key} name={f.key} title={f.title} img={f.img} UI={UI} />
        ))}
      </div>
    </div>
  );
}
