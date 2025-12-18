'use client';

import React from 'react';

type UISet = { Input: any; Label: any };

type Props = {
  values: any;
  productCode: string;
  UI: UISet;
};

export default function ASEPASummary({ values, productCode, UI }: Props) {
  const { Input, Label } = UI;

  const Row = ({ label, value }: { label: string; value: any }) => (
    <tr>
      <td className="px-4 py-2 font-medium">{label}</td>
      <td className="px-4 py-2">{value || '—'}</td>
    </tr>
  );

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Summary
      </h2>

      <div className="mt-4">
        <Label>Product Code</Label>
        <Input readOnly value={productCode} className="mt-1 bg-gray-50 text-center" />
      </div>

      <table className="w-full text-sm mt-6 border">
        <tbody className="divide-y">
        <Row label="Patient Name" value={`${values.first_name} ${values.last_name}`} />
        <Row label="Parent / Guardian" value={values.parent_name} />
        <Row label="Date of Birth" value={values.date_of_birth} />

        <Row label="Length A–P (cm)" value={values.length_ap_cm} />
        <Row label="Head Circumference (cm)" value={values.head_circumference_cm} />
        <Row label="Temple Width (cm)" value={values.temple_width_cm} />
        <Row label="Width M–L (cm)" value={values.width_ml_cm} />

        <Row label="Eyebrow → Vertex" value={values.eyebrow_to_vertex_cm} />
        <Row label="Tragus → Vertex" value={values.tragus_to_vertex_cm} />
        <Row label="Occiput → Vertex" value={values.occiput_to_vertex_cm} />
        <Row label="Suboccipital → Chin" value={values.suboccipital_chin_cm} />
        <Row label="Ear Clearance (R)" value={values.ear_clearance_right_cm} />
        <Row label="Ear Clearance (L)" value={values.ear_clearance_left_cm} />
        <Row label="Neck Clearance" value={values.neck_clearance_cm} />

        <Row label="Site of Craniectomy" value={values.site_of_craniectomy} />
        <Row label="Side of Craniectomy" value={values.side_of_craniectomy} />
        <Row
          label="Scalp Condition"
          value={(values.scalp_skin_condition || []).join(', ')}
        />
        <Row label="Mobility Level" value={values.mobility_level} />
        </tbody>
      </table>
    </div>
  );
}
