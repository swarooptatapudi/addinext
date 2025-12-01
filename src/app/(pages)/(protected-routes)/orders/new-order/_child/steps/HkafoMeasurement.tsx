'use client';

import React from 'react';
import Image from 'next/image';
import { useField } from 'formik';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type HkafoMeasurementProps = {
  UI: { Input: any; Label: any; Card: any; SelectBox: any };
  deviceType?: string;
};

export type LengthFieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  usesUnitToggle?: boolean;
};

export type SelectFieldConfig = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
};
type PartSectionConfig = {
  id: string;
  title: string;
  fields: LengthFieldConfig[];
};

const PART_SECTIONS_KAFO: PartSectionConfig[] = [
  {
    id: 'greater-trochanter',
    title: '1. Greater trochanter',
    fields: [
      { name: 'circ_greater_trochanter', label: 'Circumference', usesUnitToggle: true },
      { name: 'ml_greater_trochanter', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'perineum',
    title: '2. Perineum',
    fields: [
      { name: 'circ_perineum', label: 'Circumference', usesUnitToggle: true },
      { name: 'ml_perineum', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'upper-mid-thigh',
    title: '3. Upper mid thigh',
    fields: [
      { name: 'circ_upper_mid_thigh', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'mid-thigh',
    title: '4. Mid thigh',
    fields: [
      { name: 'ml_mid_thigh', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'lower-mid-thigh',
    title: '5.1 Lower mid thigh',
    fields: [
      { name: 'circ_lower_mid_thigh', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'knee-axis',
    title: '5.2 Knee axis',
    fields: [
      { name: 'ml_knee_axis', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'upper-mid-calf',
    title: '6.1 Upper mid calf',
    fields: [
      { name: 'circ_upper_mid_calf', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'mid-calf',
    title: '6.2 Mid calf',
    fields: [
      { name: 'ml_mid_calf', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'lower-mid-calf',
    title: '7. Lower mid calf',
    fields: [
      { name: 'circ_lower_mid_calf', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'ankle-axis',
    title: '8. Ankle axis',
    fields: [
      { name: 'ml_ankle_axis', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'ankle-axis-to-mid-tibia',
    title: '9. Ankle axis to mid tibia',
    fields: [
      { name: 'length_ankle_axis_to_mid_tibia', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-fibular-neck',
    title: '10. Ground to fibular neck',
    fields: [
      { name: 'length_ground_to_fibular_neck', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-knee-axis',
    title: '11. Ground to knee axis',
    fields: [
      { name: 'length_ground_to_knee_axis', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-perineum-30mm',
    title: '12. Ground to 30 mm down from perineum level',
    fields: [
      { name: 'length_ground_to_perineum_30mm_down', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-ischial-tuberosity',
    title: '13. Ground to ischial tuberosity',
    fields: [
      { name: 'length_ground_to_ischial_tuberosity', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-greater-trochanter',
    title: '14. Ground to greater trochanter',
    fields: [
      { name: 'length_ground_to_greater_trochanter', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-pelvic-line',
    title: '15. Ground to pelvic line',
    fields: [
      { name: 'length_ground_to_pelvic_line', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-waist-line',
    title: '16. Ground to waist line',
    fields: [
      { name: 'length_ground_to_waist_line', label: 'Length', usesUnitToggle: true },
    ],
  },
];

const PART_SECTIONS: PartSectionConfig[] = [
  {
    id: 'waist',
    title: '1. Waist',
    fields: [
      { name: 'circ_waist', label: 'Circumference', usesUnitToggle: true },
      { name: 'ml_waist', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'iliac-crest',
    title: '2. Iliac crest',
    fields: [
      { name: 'circ_iliac_crest', label: 'Circumference', usesUnitToggle: true },
      { name: 'ml_iliac_crest', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'greater-trochanter',
    title: '3. Greater trochanter',
    fields: [
      { name: 'circ_greater_trochanter', label: 'Circumference', usesUnitToggle: true },
      { name: 'ml_greater_trochanter', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'perineum',
    title: '4. Perineum',
    fields: [
      { name: 'circ_perineum', label: 'Circumference', usesUnitToggle: true },
      { name: 'ml_perineum', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'upper-mid-thigh',
    title: '5. Upper mid thigh',
    fields: [
      { name: 'circ_upper_mid_thigh', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'mid-thigh',
    title: '6. Mid thigh',
    fields: [
      { name: 'ml_mid_thigh', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'lower-mid-thigh',
    title: '7. Lower mid thigh',
    fields: [
      { name: 'circ_lower_mid_thigh', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'knee-axis',
    title: '7. Knee axis',
    fields: [
      { name: 'ml_knee_axis', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'upper-mid-calf',
    title: '8. Upper mid calf',
    fields: [
      { name: 'circ_upper_mid_calf', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'mid-calf',
    title: '8. Mid calf',
    fields: [
      { name: 'ml_mid_calf', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'lower-mid-calf',
    title: '9. Lower mid calf',
    fields: [
      { name: 'circ_lower_mid_calf', label: 'Circumference', usesUnitToggle: true },
    ],
  },
  {
    id: 'ankle-axis',
    title: '10. Ankle axis',
    fields: [
      { name: 'ml_ankle_axis', label: 'M-L diameter', usesUnitToggle: true },
    ],
  },
  {
    id: 'ankle-axis-to-mid-tibia',
    title: '11. Ankle axis to mid tibia',
    fields: [
      { name: 'length_ankle_axis_to_mid_tibia', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-fibular-neck',
    title: '12. Ground to fibular neck',
    fields: [
      { name: 'length_ground_to_fibular_neck', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-knee-axis',
    title: '13. Ground to knee axis',
    fields: [
      { name: 'length_ground_to_knee_axis', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-perineum-30mm',
    title: '14. Ground to 30 mm down from perineum level',
    fields: [
      { name: 'length_ground_to_perineum_30mm_down', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-ischial-tuberosity',
    title: '15. Ground to ischial tuberosity',
    fields: [
      { name: 'length_ground_to_ischial_tuberosity', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-greater-trochanter',
    title: '16. Ground to greater trochanter',
    fields: [
      { name: 'length_ground_to_greater_trochanter', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-pelvic-line',
    title: '17. Ground to pelvic line',
    fields: [
      { name: 'length_ground_to_pelvic_line', label: 'Length', usesUnitToggle: true },
    ],
  },
  {
    id: 'ground-to-waist-line',
    title: '18. Ground to waist line',
    fields: [
      { name: 'length_ground_to_waist_line', label: 'Length', usesUnitToggle: true },
    ],
  },
];

export function LengthField({
  config,
  UI,
  measurementUnit,
}: {
  config: LengthFieldConfig;
  UI: HkafoMeasurementProps['UI'];
  measurementUnit: string;
}) {
  const { Input, Label } = UI;
  const [field, meta, helpers] = useField(config.name);

  const showError = !!(meta.touched && meta.error);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur(e);
    const raw = e.target.value;
    if (raw === '' || raw == null) {
      helpers.setValue('');
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) {
      helpers.setValue(n);
    } else {
      helpers.setValue('');
    }
  };

  const placeholder =
    config.usesUnitToggle
      ? measurementUnit === 'in'
        ? 'in'
        : 'cm'
      : config.placeholder || 'cm';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={config.name}
          className="block text-sm whitespace-nowrap w-"
        >
          {config.label}
        </Label>
        <Input
          {...field}
          id={config.name}
          placeholder={placeholder}
          value={field.value ?? ''}
          className={`flex-1 max-w-24 text-center ${showError ? 'border-red-500' : ''}`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => helpers.setValue(e.target.value)}
          onBlur={handleBlur}
          onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
          }}
        />
      </div>
      {showError ? <div className="text-xs text-red-600">{meta.error}</div> : null}
    </div>
  );
}

export function SelectField({
  config,
  UI,
}: {
  config: SelectFieldConfig;
  UI: HkafoMeasurementProps['UI'];
}) {
  const { SelectBox } = UI;
  const [field, meta, helpers] = useField(config.name);

  const hasError = !!(meta.touched && meta.error);
  const isEmpty = field.value === '' || field.value == null;
  const showError = hasError && isEmpty;

  return (
    <SelectBox
      options={config.options}
      label={config.label}
      placeholder={config.placeholder}
      required={config.required}
      value={field.value ?? ''}
      onValueChange={(val: string) => {
        helpers.setValue(val, true);
        helpers.setTouched(true, true);
        if (val !== '' && val != null) {
          helpers.setError(undefined);
        }
      }}
      inVaild={showError}
      error={meta.error}
    />
  );
}

export default function HkafoMeasurement({ UI, deviceType }: HkafoMeasurementProps) {
  const { Card, SelectBox } = UI;

  const imageSrc =
    deviceType === 'KAFO'
      ? '/assets/order-forms/hkfo-akfo/KAFO.png'
      : '/assets/order-forms/hkfo-akfo/HKAFO.png';
  const imageAlt = deviceType === 'KAFO' ? 'KAFO measurement chart' : 'HKAFO measurement chart';

  // Global measurement unit for this step ("cm" or "in").
  const [unitField, , unitHelpers] = useField('measurement_unit');
  const measurementUnit = unitField.value === 'in' ? 'in' : 'cm';
  const sections = deviceType === 'KAFO' ? PART_SECTIONS_KAFO : PART_SECTIONS;
  const topSections = sections.slice(0, 10);
  const bottomSections = sections.slice(10);

  return (
    <div className="bg-whiteborder border-gray-200 rounded-lg  shadow-sm">
      <div className='flex  items-center justify-between border-b border-gray-300 p-4'>
      <h2 className="text-primary text-lg font-semibold">Measurement</h2>

      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-gray-700">Measurements: </span>
        <RadioGroup
          value={measurementUnit}
          onValueChange={(val: string) => unitHelpers.setValue(val)}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-1">
            <RadioGroupItem id="unit-cm" value="cm" />
            <label htmlFor="unit-cm" className="text-sm text-gray-700">
              Centimeters (cm)
            </label>
          </div>
          <div className="flex items-center gap-1">
            <RadioGroupItem id="unit-in" value="in" />
            <label htmlFor="unit-in" className="text-sm text-gray-700">
              Inches (in)
            </label>
          </div>
        </RadioGroup>

      </div>
      </div>

      <div className="p-4 space-y-6 ">
        <div className="flex flex-col lg:flex-row gap-6 items-start m-1">
          <div className="w-full lg:w-1/2">
            <div className="w-full relative h-[360px] md:h-[480px] lg:h-[560px] rounded-md  border-gray-300 bg-white overflow-hidden flex items-center justify-center my-8">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-fill"
                sizes="(min-width: 768px) 640px, 100vw"
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {topSections.map((section: PartSectionConfig) => (
              <Card key={section.id} className="p-3 bg-gray-50 gap-2">
                <h3 className="text-sm font-semibold border-b ">{section.title}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {section.fields.map((fieldCfg: LengthFieldConfig) => (
                    <LengthField
                      key={fieldCfg.name}
                      config={fieldCfg}
                      UI={UI}
                      measurementUnit={measurementUnit}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {bottomSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bottomSections.map((section: PartSectionConfig) => (
              <Card key={section.id} className="p-2 bg-gray-50 gap-2">
                <h3 className="text-sm font-semibold border-b">{section.title}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {section.fields.map((fieldCfg: LengthFieldConfig) => (
                    <LengthField
                      key={fieldCfg.name}
                      config={fieldCfg}
                      UI={UI}
                      measurementUnit={measurementUnit}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
      {/* </Card> */}
    </div>
  );
}
