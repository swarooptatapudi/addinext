'use client';

import React from 'react';

type UISet = { Input: any; Label: any };

type Props = {
  values: any;
  productCode: string;
  UI: UISet;
};

const csv = (v?: string[] | string) =>
  Array.isArray(v) ? v.join(', ') : v || '';

export default function ASEPSummary({ values, productCode, UI }: Props) {
  const { Input, Label } = UI;

  const fullName = `${values.first_name} ${values.last_name}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Summary</h2>

      <div className="mt-4">
        <Label>Product Code</Label>
        <Input readOnly value={productCode} className="bg-gray-50 mt-1" />
      </div>

      <table className="w-full text-sm mt-6 border">
        <tbody className="divide-y">
        <tr><td className="p-3 font-medium">Patient Name</td><td className="p-3">{fullName}</td></tr>
        <tr><td className="p-3 font-medium">Parent / Guardian</td><td className="p-3">{values.parent_name}</td></tr>
        <tr><td className="p-3 font-medium">DOB</td><td className="p-3">{values.date_of_birth}</td></tr>

        <tr className="bg-gray-50">
          <td colSpan={2} className="px-4 py-2 font-medium">
            Measurements (with Stockinet)
          </td>
        </tr>

        <tr><td className="px-4 py-3">Length A–P (cm)</td><td className="px-4 py-3">{values.length_ap_cm}</td></tr>
        <tr><td className="px-4 py-3">Head Circumference (cm)</td><td className="px-4 py-3">{values.head_circumference_cm}</td></tr>
        <tr><td className="px-4 py-3">Temple Width (cm)</td><td className="px-4 py-3">{values.temple_width_cm}</td></tr>
        <tr><td className="px-4 py-3">Width M–L (cm)</td><td className="px-4 py-3">{values.width_ml_cm}</td></tr>
        <tr><td className="px-4 py-3">Eyebrow → Vertex (cm)</td><td className="px-4 py-3">{values.eyebrow_to_vertex_cm}</td></tr>
        <tr><td className="px-4 py-3">Tragus → Vertex (cm)</td><td className="px-4 py-3">{values.tragus_to_vertex_cm}</td></tr>
        <tr><td className="px-4 py-3">Occiput → Vertex (cm)</td><td className="px-4 py-3">{values.occiput_to_vertex_cm}</td></tr>
        <tr><td className="px-4 py-3">Suboccipital → Chin (cm)</td><td className="px-4 py-3">{values.suboccipital_chin_cm}</td></tr>
        <tr><td className="px-4 py-3">Ear Clearance Right (cm)</td><td className="px-4 py-3">{values.ear_clearance_right_cm}</td></tr>
        <tr><td className="px-4 py-3">Ear Clearance Left (cm)</td><td className="px-4 py-3">{values.ear_clearance_left_cm}</td></tr>
        <tr><td className="px-4 py-3">Neck Clearance (cm)</td><td className="px-4 py-3">{values.neck_clearance_cm}</td></tr>

        <tr className="bg-gray-50"><td colSpan={2} className="p-3 font-semibold">Clinical Assessment</td></tr>
        <tr><td className="p-3">Seizure Frequency</td><td className="p-3">{values.seizure_frequency}</td></tr>
        <tr><td className="p-3">Epilepsy Type</td><td className="p-3">{values.epilepsy_type}</td></tr>
        <tr><td className="p-3">Risk Situations</td><td className="p-3">{csv(values.risk_situations)}</td></tr>
        <tr><td className="p-3">Fall Pattern</td><td className="p-3">{values.fall_pattern}</td></tr>

        <tr className="bg-gray-50"><td colSpan={2} className="p-3 font-semibold">Scan & Upload</td></tr>
        <tr><td className="p-3">Other Diagnosis</td><td className="p-3">{values.other_diagnosis}</td></tr>
        <tr><td className="p-3">Date of Surgery</td><td className="p-3">{values.date_of_surgery}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
