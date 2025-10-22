import React from 'react';
import Image from 'next/image';

type MeasurementProps = {
  values: Record<string, any>;
  errors?: Record<string, any>;
  touched?: Record<string, boolean>;
  setFieldValue: (field: string, value: any) => void;
  UI: { Input: any; Label: any; Card: any };
  handleChange?: (field: string) => (eOrVal: any) => void;
};

const IMG = {
  ap: '/assets/order-forms/cranial/image1.png',
  hc: '/assets/order-forms/cranial/image2.png',
  tw: '/assets/order-forms/cranial/image3.png',
  ml: '/assets/order-forms/cranial/image4.png',
  da: '/assets/order-forms/cranial/image14.png',
  db: '/assets/order-forms/cranial/image15.png',
} as const;

export default function Measurement({ values, errors, touched, setFieldValue, UI }: MeasurementProps) {
  const { Input, Label, Card } = UI;

  type FieldKey = 'ap' | 'hc' | 'tw' | 'ml' | 'da' | 'db';
  type FieldCfg = { key: FieldKey; title: string; img: string };

  const FIELDS: FieldCfg[] = [
    { key: 'ap', title: 'Measurement of Length (A-P) (mm)', img: IMG.ap },
    { key: 'hc', title: 'Head Circumference (mm)',          img: IMG.hc },
    { key: 'tw', title: 'Temple Width (mm)',                 img: IMG.tw },
    { key: 'ml', title: 'Measurement of Width (M-L) (mm)',   img: IMG.ml },
    { key: 'da', title: 'Diagonal A (mm)',                   img: IMG.da },
    { key: 'db', title: 'Diagonal B (mm)',                   img: IMG.db },
  ];

  const normalizeOnBlur = (raw: any) => {
    // allow empty
    if (raw === '' || raw == null) return '';
    const n = Number(raw);
    // keep valid finite >= 0, otherwise empty
    return Number.isFinite(n) && n >= 0 ? n : '';
  };

  const FieldCard = ({ cfg }: { cfg: FieldCfg }) => {
    const name = cfg.key;
    const id = `measure_${name}`;
    const val = values?.[name] ?? '';

    const showError = !!(touched?.[name] && errors?.[name]);
    const helper = showError ? String(errors?.[name]) : undefined;

    return (
      <Card className="p-4 bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 relative flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden">
            <Image src={cfg.img} alt={cfg.title} fill className="object-contain p-2" sizes="96px" />
          </div>

          <div className="flex-1">
            <Label htmlFor={id} className="mb-1 block">{cfg.title}</Label>
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              placeholder="mm"
              value={val}
              className={`text-center ${showError ? 'border-red-500' : ''}`}
              onChange={(e: any) => setFieldValue(name, e.target.value)}
              onBlur={() => setFieldValue(name, normalizeOnBlur(values?.[name]))}
              onWheel={(e: React.WheelEvent<HTMLInputElement>) => (e.currentTarget as HTMLInputElement).blur()}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                // block arrows from incrementing/decrementing
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
              }}
              error={helper}
              inVaild={showError}
            />
            {helper ? <div className="mt-1 text-xs text-red-600">{helper}</div> : null}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Measurement</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {FIELDS.map((cfg) => (
          <FieldCard key={cfg.key} cfg={cfg} />
        ))}
      </div>
    </div>
  );
}