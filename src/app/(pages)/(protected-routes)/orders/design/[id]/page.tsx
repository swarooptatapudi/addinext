'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DesignWorkflowPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [wikyResult, setWikyResult] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('wiky:lastSubmission');
    if (stored) {
      setWikyResult(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetch('/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_design_workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sales_order_id: id })
    })
      .then((res) => res.json())
      .then((res) => setData(res.message));
  }, [id]);

  if (!data) {
    return <div className="p-6">Loading design workflow…</div>;
  }

  const { patient, wiky, files } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Design Workflow – {data.order.sales_order_id}</h1>

      {/* ================= PATIENT ================= */}
      <Card>
        <CardHeader>Patient Information</CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Name" value={patient.patient_name} />
          <Field label="DOB" value={patient.dob} />
          <Field label="Gender" value={patient.gender} />
          <Field label="Weight" value={`${patient.weight} kg`} />
          <Field label="Shoe Size (EU)" value={patient.shoe_size_eu} />
          <Field label="Activity" value={patient.activity} />
          <Field label="Usage" value={patient.usage} />
        </CardContent>
      </Card>

      {/* ================= WIKY ================= */}
      <Card>
        <CardHeader>Wiky Scan</CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {wikyResult ? (
            <>
              <Field label="Scan ID" value={wikyResult.scanId} />
              <Field label="Form Response ID" value={wikyResult.formResponseId ?? '—'} />
              <Field label="Status" value="SUBMITTED" />
            </>
          ) : (
            <div className="text-muted-foreground col-span-2">No Wiky scan submitted yet</div>
          )}
        </CardContent>
      </Card>

      {/* ================= FILES ================= */}
      <Card>
        <CardHeader>Scan Files</CardHeader>
        <CardContent className="space-y-3 text-sm">
          {files.map((f: any) => (
            <div key={f.scan_item_id} className="border rounded p-3 grid grid-cols-2 gap-2">
              <Field label="Foot Side" value={f.foot_side} />
              {f.left_foot_file && (
                <Field label="Left Foot File" value={extractFilename(f.left_foot_file)} />
              )}
              {f.right_foot_file && (
                <Field label="Right Foot File" value={extractFilename(f.right_foot_file)} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= NEXT ================= */}
      <div className="flex justify-end">
        <button
          disabled={!wikyResult}
          className={`px-4 py-2 rounded ${
            wikyResult
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Proceed to Design
        </button>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

function extractFilename(path: string) {
  return path.split('/').pop();
}
