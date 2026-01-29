// steps/ASEP/ASEPAssessment.tsx
'use client';

import React from 'react';
import { useField } from 'formik';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

/* ---------------- Radio Group ---------------- */
const RadioGroup = ({ name, label, options }: any) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div>
      <Label className="font-medium mb-2 block">{label}</Label>
      <div className="flex flex-col gap-2 text-sm">
        {options.map((o: string) => (
          <label key={o} className="flex items-center gap-2">
            <input
              type="radio"
              className="accent-primary"
              checked={field.value === o}
              onChange={() => helpers.setValue(o)}
            />
            {o}
          </label>
        ))}
      </div>
      {meta.touched && meta.error && (
        <div className="text-xs text-red-600 mt-2">{meta.error}</div>
      )}
    </div>
  );
};

/* ---------------- Checkbox Group ---------------- */
const CheckboxGroup = ({ name, label, options }: any) => {
  const [field, meta, helpers] = useField(name);
  const values: string[] = field.value || [];

  const toggle = (opt: string) => {
    helpers.setValue(
      values.includes(opt)
        ? values.filter(v => v !== opt)
        : [...values, opt]
    );
  };

  return (
    <div>
      <Label className="font-medium mb-2 block">{label}</Label>
      <div className="grid grid-cols-1 gap-2 text-sm">
        {options.map((o: string) => (
          <label key={o} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary"
              checked={values.includes(o)}
              onChange={() => toggle(o)}
            />
            {o}
          </label>
        ))}
      </div>
      {meta.touched && meta.error && (
        <div className="text-xs text-red-600 mt-2">{meta.error}</div>
      )}
    </div>
  );
};

export default function ASEPAssessment() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Clinical Assessment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        <Card className="p-4">
          <RadioGroup
            name="epilepsy_type"
            label="Epilepsy Type"
            options={['Generalized Epilepsy',
              'Combined Generalized and Focal',
              'Unknown Epilepsy',
              'Focal Epilepsy'
            ]}
          />
        </Card>

        <Card className="p-4">
          <RadioGroup
            name="seizure_frequency"
            label="Seizure Frequency"
            options={['Daily',
              'Weekly',
              'Monthly'
            ]}
          />
        </Card>

        <Card className="p-4">
          <RadioGroup
            name="fall_pattern"
            label="Fall Pattern"
            options={[
              'Forward',
              'Backward',
              'Lateral',
              'Multi Directional',
            ]}
          />
        </Card>
        <Card className="p-4">
          <RadioGroup
            name="risk_situations"
            label="Risk Situations"
            options={[
              'Walking',
              'Transfers',
              'Self-injurious',
              'Behaviour'
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
