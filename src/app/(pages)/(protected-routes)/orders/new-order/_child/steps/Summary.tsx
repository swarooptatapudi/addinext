'use client';
import React from 'react';

type UISet = { Input: any; Label: any };

type Props = {
  values: any;
  cr?: number;
  cvai?: number;
  productCode?: string; // single source of truth from parent
  UI: UISet;
};

const POS_LABEL: Record<string, string> = {
  P: 'Plagiocephaly',
  B: 'Brachycephaly',
  SC: 'Scaphocephaly',
  ASB: 'Asymmetrical Brachycephaly (Combo)',
  ASYS: 'Asymmetrical Scaphocephaly',
  '': '',
};

const csv = (s?: string) =>
  (s || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .join(', ');

export default function SummaryStep({ values, cr, cvai, productCode, UI }: Props) {
  const { Input, Label } = UI;

  const positionalPretty =
    POS_LABEL[values.positional as string] || (values.positional as string) || '';
  const fullName = `${values.first_name ?? ''}${values.last_name ? ` ${values.last_name}` : ''}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Summary</h2>

      <div className="mt-4">
        <Label className="block font-semibold">Generated Product Code</Label>
        <Input readOnly value={productCode || 'CH-?-?'} className="mt-2 bg-gray-50 text-center" />
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
          <tr className="text-left">
            <th className="px-4 py-3 font-semibold w-[40%]">Field</th>
            <th className="px-4 py-3 font-semibold">Value</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
          <tr><td className="px-4 py-3">Patient</td><td className="px-4 py-3">{fullName}</td></tr>
          <tr><td className="px-4 py-3">Parent/Guardian</td><td className="px-4 py-3">{values.parent_name || ''}</td></tr>
          <tr><td className="px-4 py-3">DOB</td><td className="px-4 py-3">{values.date_of_birth || ''}</td></tr>

          <tr><td className="px-4 py-3">A/P (mm)</td><td className="px-4 py-3">{values.ap ?? ''}</td></tr>
          <tr><td className="px-4 py-3">M/L (mm)</td><td className="px-4 py-3">{values.ml ?? ''}</td></tr>
          <tr><td className="px-4 py-3">Diagonal A (mm)</td><td className="px-4 py-3">{values.da ?? ''}</td></tr>
          <tr><td className="px-4 py-3">Diagonal B (mm)</td><td className="px-4 py-3">{values.db ?? ''}</td></tr>
          <tr><td className="px-4 py-3">CR</td><td className="px-4 py-3">{cr ?? ''}</td></tr>
          <tr><td className="px-4 py-3">CVAI (%)</td><td className="px-4 py-3">{cvai ?? ''}</td></tr>

          <tr><td className="px-4 py-3">Diagnosis</td><td className="px-4 py-3">{positionalPretty || 'Select'}</td></tr>
          <tr><td className="px-4 py-3">Severity</td><td className="px-4 py-3">{(values.severity as string) || ''}</td></tr>

          <tr><td className="px-4 py-3">Occipital Area</td><td className="px-4 py-3">{values.occipital_area || ''}</td></tr>
          <tr><td className="px-4 py-3">Parietal Area</td><td className="px-4 py-3">{values.parietal_area || ''}</td></tr>
          <tr><td className="px-4 py-3">Frontal Area</td><td className="px-4 py-3">{values.frontal_area || ''}</td></tr>
          <tr><td className="px-4 py-3">Ear Alignment</td><td className="px-4 py-3">{values.ear_alignment || ''}</td></tr>
          <tr><td className="px-4 py-3">Torticollis</td><td className="px-4 py-3">{values.torticollis || ''}</td></tr>
          <tr><td className="px-4 py-3">Post Surgical</td><td className="px-4 py-3">{csv(values.post_surgical)}</td></tr>
          <tr><td className="px-4 py-3">Suture Type</td><td className="px-4 py-3">{csv(values.suture_type_surgical_diagnoses_only)}</td></tr>

          <tr><td className="px-4 py-3">Date of Surgery</td><td className="px-4 py-3">{values.date_of_surgery || ''}</td></tr>
          <tr><td className="px-4 py-3">Surgical Complications</td><td className="px-4 py-3">{values.surgical_complications || ''}</td></tr>
          <tr><td className="px-4 py-3">Other Diagnosis and Syndromes</td><td className="px-4 py-3">{values.other_diagnosis_and_syndromes || ''}</td></tr>

          <tr className="bg-gray-50">
            <td className="px-4 py-3 font-medium">Product Code</td>
            <td className="px-4 py-3 font-medium">{productCode || '—'}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
