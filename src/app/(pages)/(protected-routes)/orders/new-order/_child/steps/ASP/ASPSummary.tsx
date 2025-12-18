'use client';
import React from 'react';

type UISet = { Input: any; Label: any };

type Props = {
  values: any;
  productCode: string;
  UI: UISet;
};

const csv = (v?: string[] | string) => {
  if (!v) return '';
  if (Array.isArray(v)) return v.join(', ');
  return v;
};

export default function ASPSummary({ values, productCode, UI }: Props) {
  const { Input, Label } = UI;

  const fullName = `${values.first_name ?? ''}${
    values.last_name ? ` ${values.last_name}` : ''
  }`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Summary
      </h2>

      {/* ================= Product Code ================= */}
      <div className="mt-4">
        <Label className="block font-semibold">Product Code</Label>
        <Input
          readOnly
          value={productCode}
          className="mt-2 bg-gray-50 text-center"
        />
      </div>

      {/* ================= Summary Table ================= */}
      <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
          <tr className="text-left">
            <th className="px-4 py-3 font-semibold w-[40%]">Field</th>
            <th className="px-4 py-3 font-semibold">Value</th>
          </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
          {/* ================= Patient ================= */}
          <tr>
            <td className="px-4 py-3">Patient Name</td>
            <td className="px-4 py-3">{fullName}</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Parent / Guardian</td>
            <td className="px-4 py-3">{values.parent_name || '—'}</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Date of Birth</td>
            <td className="px-4 py-3">{values.date_of_birth || '—'}</td>
          </tr>

          {/* ================= Measurements ================= */}
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
          <tr><td className="px-4 py-3">Bony Defect Size</td><td className="px-4 py-3">{values.bony_defect_size}</td></tr>

          {/* ================= Clinical Assessment ================= */}
          <tr className="bg-gray-50">
            <td colSpan={2} className="px-4 py-2 font-medium">
              Clinical Assessment
            </td>
          </tr>

          <tr><td className="px-4 py-3">Site of Craniectomy</td><td className="px-4 py-3">{values.site_of_craniectomy}</td></tr>
          <tr><td className="px-4 py-3">Side of Craniectomy</td><td className="px-4 py-3">{values.side_of_craniectomy}</td></tr>
          <tr><td className="px-4 py-3">Scalp / Skin Condition</td><td className="px-4 py-3">{csv(values.scalp_skin_condition)}</td></tr>
          <tr><td className="px-4 py-3">Mobility Level</td><td className="px-4 py-3">{values.mobility_level}</td></tr>
          <tr><td className="px-4 py-3">Assessment Notes</td><td className="px-4 py-3">{values.assessment_notes}</td></tr>
          <tr><td className="px-4 py-3">Date of Surgery</td><td className="px-4 py-3">{values.date_of_surgery}</td></tr>
          <tr><td className="px-4 py-3">Surgical Complications</td><td className="px-4 py-3">{values.surgical_complications}</td></tr>
          <tr><td className="px-4 py-3">Other Diagnosis & Syndromes</td><td className="px-4 py-3">{values.other_diagnosis}</td></tr>

          {/* ================= Footer ================= */}
          <tr className="bg-gray-50">
            <td className="px-4 py-3 font-medium">Product Code</td>
            <td className="px-4 py-3 font-medium">{productCode}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
