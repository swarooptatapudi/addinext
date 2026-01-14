'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DesignWorkflowPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [wikyResult, setWikyResult] = useState<any>(null);
  const [showDesignSteps, setShowDesignSteps] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('wiky:lastSubmission');
    if (stored) setWikyResult(JSON.parse(stored));
  }, []);

  useEffect(() => {
    fetch('/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_design_workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sales_order_id: id }),
    })
      .then((res) => res.json())
      .then((res) => setData(res.message));
  }, [id]);

  if (!data) return <div className="p-6">Loading workflow…</div>;

  const { patient, files } = data;

  return (
    <div className="p-6 space-y-6">

      {/* ================= PAGE HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">
          Design Workflow – {data.order.sales_order_id}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.order.order_type} • Status: {data.order.status}
        </p>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-12 gap-6">

        {/* -------- Patient -------- */}
        <Card className="col-span-5">
          <CardHeader className="border-b px-6 py-4">
            <h3 className="text-sm font-semibold">Patient</h3>
          </CardHeader>

          <CardContent className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={patient.patient_name} />
            <Field label="Gender" value={patient.gender} />
            <Field label="DOB" value={patient.dob} />
            <Field label="Weight" value={`${patient.weight} kg`} />
            <Field label="Shoe Size" value={patient.shoe_size_eu} />
            <Field label="Activity" value={patient.activity} />
          </CardContent>
        </Card>

        {/* -------- Scan Files -------- */}
        <Card className="col-span-7">
          <CardHeader className="border-b px-6 py-4">
            <h3 className="text-sm font-semibold">Scan Files</h3>
          </CardHeader>

          <CardContent className="px-6 py-4 space-y-4 text-sm">
            {files.map((f: any) => (
              <div
                key={f.scan_item_id}
                className="rounded-md border p-4 space-y-2"
              >
                <div className="font-medium">
                  Foot Side: {f.foot_side}
                </div>

                {f.left_foot_file && (
                  <div className="text-muted-foreground truncate">
                    <strong>L:</strong> {extractFilename(f.left_foot_file)}
                  </div>
                )}

                {f.right_foot_file && (
                  <div className="text-muted-foreground truncate">
                    <strong>R:</strong> {extractFilename(f.right_foot_file)}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ================= WIKY RESULT ================= */}
      <Card>
        <CardHeader className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Wiky Scan Result</h3>
        </CardHeader>

        <CardContent className="px-6 py-4 grid grid-cols-3 gap-6 text-sm">
          {wikyResult ? (
            <>
              <Field label="Scan ID" value={wikyResult.scanId} />
              <Field
                label="Form Response ID"
                value={wikyResult.formResponseId ?? '—'}
              />
              <Field label="Status" value="SUBMITTED" />
            </>
          ) : (
            <div className="text-muted-foreground col-span-3">
              Scan not submitted yet
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 border-t">
          <Button
            onClick={() => setShowDesignSteps(true)}
            disabled={!wikyResult}
            className="ml-auto"
          >
            Proceed to Design
          </Button>
        </CardFooter>
      </Card>

      {/* ================= WORKFLOW STEPS ================= */}
      {showDesignSteps && (
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <h3 className="text-sm font-semibold">Design Workflow</h3>
          </CardHeader>

          <CardContent className="px-6 py-4 flex items-center gap-6 text-sm">
            <Step label="Scan Captured" done />
            <Step label="File Validation" />
            <Step label="Design" />
            <Step label="Manufacturing" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          done ? 'bg-green-500' : 'bg-gray-300'
        }`}
      />
      <span>{label}</span>
    </div>
  );
}

function extractFilename(path: string) {
  return path.split('/').pop();
}
