'use client';

import React from 'react';
import { useField } from 'formik';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/* ---------------------- Radio Group ---------------------- */
const RadioGroup = ({
                      name,
                      label,
                      options,
                    }: {
  name: string;
  label: string;
  options: string[];
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div>
      <Label className="font-medium mb-2 block">{label}</Label>
      <div className="flex flex-col gap-2 text-sm">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="radio"
              className="accent-primary"
              checked={field.value === opt}
              onChange={() => helpers.setValue(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      {meta.touched && meta.error && (
        <div className="text-xs text-red-600 mt-2">{meta.error}</div>
      )}
    </div>
  );
};

/* ---------------------- Checkbox Group ---------------------- */
const CheckboxGroup = ({
                         name,
                         label,
                         options,
                       }: {
  name: string;
  label: string;
  options: string[];
}) => {
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
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary"
              checked={values.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      {meta.touched && meta.error && (
        <div className="text-xs text-red-600 mt-2">{meta.error}</div>
      )}
    </div>
  );
};

/* ======================= COMPONENT ======================= */
export default function ASPAssessment() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Clinical Assessment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-4">
          <RadioGroup
            name="site_of_craniectomy"
            label="Site of Craniectomy"
            options={['Frontal', 'Temporal', 'Parietal', 'Occipital']}
          />
        </Card>

        <Card className="p-4">
          <RadioGroup
            name="side_of_craniectomy"
            label="Side of Craniectomy"
            options={['Lt Side of Craneal',
              'Rt Side of Craneal',
              'Bilateral']}
          />
        </Card>
        <Card className="p-4">
          <RadioGroup
            name="scalp_skin_condition"
            label="Scalp / Skin Condition"
            options={[
              'Intact',
              'Flap sinking',
              'Oedema',
              'Scars',
              'Shunts',
              'Drains',
              'Pain areas to avoid contact'
            ]}
          />
        </Card>
        <Card className="p-4">
          <RadioGroup
            name="mobility_level"
            label="Mobility Level"
            options={[
              'Bed Bound',
              'Assisted Ambulation',
              'Independent'
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
