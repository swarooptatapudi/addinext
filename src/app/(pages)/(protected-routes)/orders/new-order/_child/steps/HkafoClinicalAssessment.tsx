'use client';

import React from 'react';
import { useField } from 'formik';

import {
  LengthField,
  SelectField,
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
};

const ANKLE_SELECT_FIELDS: SelectFieldConfig[] = [
  {
    name: 'ankle_frontal_alignment',
    label: 'Alignment (Varus / Valgus)',
    options: [
      { value: 'Varus', label: 'Varus' },
      { value: 'Valgus', label: 'Valgus' },
    ],
  },
  {
    name: 'ankle_flexibility',
    label: 'Flexibility',
    options: [
      { value: 'Flexible', label: 'Flexible' },
      { value: 'Rigid', label: 'Rigid' },
    ],
  },
  {
    name: 'ankle_rotation',
    label: 'Rotation (Toe Out / Toe In)',
    options: [
      { value: 'Toe Out', label: 'Toe Out' },
      { value: 'Toe In', label: 'Toe In' },
    ],
  },
  {
    name: 'ankle_plane',
    label: 'Plane (Medial / Lateral)',
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
    options: [
      { value: 'Varus', label: 'Varus' },
      { value: 'Valgum', label: 'Valgum' },
    ],
  },
  {
    name: 'knee_flexibility',
    label: 'Flexibility',
    options: [
      { value: 'Flexible', label: 'Flexible' },
      { value: 'Rigid', label: 'Rigid' },
    ],
  },
  {
    name: 'knee_sagittal_condition',
    label: 'Condition (Hyperextended / Flexion contracture)',
    options: [
      { value: 'Hyperextended', label: 'Hyperextended' },
      { value: 'Knee Flexion Contracture', label: 'Knee flexion contracture' },
    ],
  },
] ;

const KNEE_NUMERIC_FIELDS: LengthFieldConfig[] = [
  {
    name: 'knee_alignment_degrees',
    label: 'Alignment degrees',
    placeholder: '°',
  },
  {
    name: 'knee_sagittal_degrees',
    label: 'Sagittal degrees',
    placeholder: '°',
  },
];

export default function HkafoClinicalAssessment({ UI }: Props) {
  const { Card } = UI;

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
              <SelectField key={cfg.name} config={cfg} UI={UI} />
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
              <SelectField key={cfg.name} config={cfg} UI={UI} />
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
