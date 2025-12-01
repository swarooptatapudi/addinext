'use client';

import React from 'react';
import { useField } from 'formik';

import {
  type LengthFieldConfig,
  type SelectFieldConfig,
} from './HkafoMeasurement';

type UISet = {
  Input: any;
  Label: any;
  Card: any;
  SelectBox: any;
};

type Props = {
  UI: UISet;
  values: any;
  errors: any;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  shouldShowError: (fieldName: string, isRequired?: boolean) => boolean;
};

const ANKLE_SELECT_FIELDS: SelectFieldConfig[] = [
  {
    name: 'ankle_frontal_alignment',
    label: 'Alignment (Varus / Valgus)',
    required: true,
    options: [
      { value: 'Varus', label: 'Varus' },
      { value: 'Valgus', label: 'Valgus' },
    ],
  },
  {
    name: 'ankle_flexibility',
    label: 'Flexibility',
    required: true,
    options: [
      { value: 'Flexible', label: 'Flexible' },
      { value: 'Rigid', label: 'Rigid' },
    ],
  },
  {
    name: 'ankle_rotation',
    label: 'Rotation (Toe Out / Toe In)',
    required: true,
    options: [
      { value: 'Toe Out', label: 'Toe Out' },
      { value: 'Toe In', label: 'Toe In' },
    ],
  },
  {
    name: 'ankle_plane',
    label: 'Plane (Medial / Lateral)',
    required: true,
    options: [
      { value: 'Medial Plane', label: 'Medial plane' },
      { value: 'Lateral Plane', label: 'Lateral plane' },
    ],
  },
] ;

const ANKLE_NUMERIC_FIELDS: LengthFieldConfig[] = [
  {
    name: 'ankle_frontal_degrees',
    label: 'Alignment degrees',
    placeholder: '0',
  },
  {
    name: 'ankle_plane_degrees',
    label: 'Plane degrees',
    placeholder: '0',
  },
  {
    name: 'ankle_heel_height',
    label: 'Heel height',
    usesUnitToggle: true,
  },
] ;

const KNEE_SELECT_FIELDS: SelectFieldConfig[] = [
  {
    name: 'knee_alignment',
    label: 'Alignment (Varus / Valgum)',
    required: true,
    options: [
      { value: 'Varus', label: 'Varus' },
      { value: 'Valgum', label: 'Valgum' },
    ],
  },
  {
    name: 'knee_flexibility',
    label: 'Flexibility',
    required: true,
    options: [
      { value: 'Flexible', label: 'Flexible' },
      { value: 'Rigid', label: 'Rigid' },
    ],
  },
  {
    name: 'knee_sagittal_condition',
    label: 'Condition',
    required: true,
    options: [
      { value: 'Hyperextended', label: 'Hyperextended' },
      { value: 'Knee Flexion Contracture', label: 'Knee flexion contracture' },
    ],
  },
  {
    name: 'knee_muscle_grade',
    label: 'Muscle grade (0 to 5)',
    required: true,
    options: [
      { value: '0', label: '0' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
    ],
  },
  {
    name: 'knee_static_dynamic',
    label: 'Knee (Static / Dynamic)',
    required: true,
    options: [
      { value: 'Static', label: 'Static' },
      { value: 'Dynamic', label: 'Dynamic' },
    ],
    placeholder: 'Select Knee status',
  },
] ;

const KNEE_NUMERIC_FIELDS: LengthFieldConfig[] = [
  {
    name: 'knee_alignment_degrees',
    label: 'Alignment degrees',
    placeholder: '0',
  },
  {
    name: 'knee_sagittal_degrees',
    label: 'Sagittal degrees',
    placeholder: '0',
  },
];

type LengthFieldProps = {
  config: LengthFieldConfig;
  UI: UISet;
  measurementUnit: string;
};

function LengthField({ config, UI, measurementUnit }: LengthFieldProps) {
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
      <div className="gap-3">
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
          className={`flex-1 min-w-30 text-center ${showError ? 'border-red-500' : ''}`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            helpers.setValue(e.target.value)
          }
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

export default function HkafoClinicalAssessment({ UI, values, errors, setFieldValue, shouldShowError }: Props) {
  const { Card, SelectBox } = UI;

  const [unitField] = useField('measurement_unit');
  const measurementUnit = unitField.value === 'in' ? 'in' : 'cm';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Clinical Assessment</h2>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 bg-gray-50">
          <h3 className="text-sm font-semibold mb-3">Ankle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ANKLE_SELECT_FIELDS.map((cfg) => (
              <SelectBox
                key={cfg.name}
                options={cfg.options}
                label={cfg.label}
                placeholder={cfg.placeholder}
                required={cfg.required}
                value={values?.[cfg.name] ?? ''}
                onValueChange={(val: string) => setFieldValue(cfg.name, val, true)}
                inVaild={shouldShowError(cfg.name, true)}
                error={errors?.[cfg.name]}
              />
            ))}
            {ANKLE_NUMERIC_FIELDS.map((cfg) => (
              <LengthField
                key={cfg.name}
                config={cfg}
                UI={UI}
                measurementUnit={measurementUnit}
              />
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-gray-50">
          <h3 className="text-sm font-semibold mb-3">Knee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {KNEE_SELECT_FIELDS.map((cfg) => (
              <SelectBox
                key={cfg.name}
                options={cfg.options}
                label={cfg.label}
                placeholder={cfg.placeholder}
                required={cfg.required}
                value={values?.[cfg.name] ?? ''}
                onValueChange={(val: string) => setFieldValue(cfg.name, val, true)}
                inVaild={shouldShowError(cfg.name, true)}
                error={errors?.[cfg.name]}
              />
            ))}
            {KNEE_NUMERIC_FIELDS.map((cfg) => (
              <LengthField
                key={cfg.name}
                config={cfg}
                UI={UI}
                measurementUnit={measurementUnit}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
