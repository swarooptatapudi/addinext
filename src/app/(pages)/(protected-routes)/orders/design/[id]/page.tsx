'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/* ---------------- Types ---------------- */

type Patient = {
  patient_name: string;
  gender: string;
  dob: string;
  weight: number;
  shoe_size_eu: string;
  activity?: string;
};

type ScanFileItem = {
  scan_item_id: string;
  foot_side: string;
  left_foot_file?: string;
  right_foot_file?: string;
};

type DesignWorkflowResponse = {
  order: {
    sales_order_id: string;
    order_type: string;
    status: string;
  };
  patient: Patient;
  files: ScanFileItem[];
};

type WikyCaptureResult = {
  scanId: string;
  formResponseId?: string;
};

/* ---------------- Page ---------------- */

export default function DesignWorkflowPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<DesignWorkflowResponse | null>(null);
  const [wikyResult, setWikyResult] = useState<WikyCaptureResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('wiky:lastSubmission');
    if (stored) {
      setWikyResult(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    console.log('Fetching design workflow for order ID:', id);
    fetch('/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_design_workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sales_order_id: id }),
    })
      .then(res => res.json())
      .then(res => setData(res.message))
      .finally(() => setLoading(false));
  }, [id]);

  const proceedToDesign = async () => {
    if (!wikyResult?.scanId) return;
    if (submitLock.current) return;
    submitLock.current = true;

    setSubmitting(true);

    try {
      const sessionRes = await fetch(
        '/api/method/addiwise.apis.wiky_scan.wiky_workflow.create_wiky_scan_session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sales_order_id: id,
            scan_id: wikyResult.scanId,
            form_response_id: wikyResult.formResponseId ?? null,
            raw_payload: wikyResult,
          }),
        }
      ).then(r => r.json());

      const resolvedSessionId = sessionRes?.message?.session || sessionRes?.message?.session_id;

      if (!resolvedSessionId) {
        throw new Error('Failed to create session');
      }

      setSessionId(resolvedSessionId);

      const processRes = await fetch(
        '/api/method/addiwise.apis.wiky_scan.wiky_workflow.process_wiky_files',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sales_order_id: id }),
        }
      ).then(r => r.json());

      if (!processRes?.message?.success) {
        throw new Error(processRes?.message?.error || 'Processing failed');
      }

      sessionStorage.removeItem('wiky:lastSubmission');

      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(`/design-sessions/${resolvedSessionId}`);

    } catch (e: any) {
      console.error(e);
      submitLock.current = false;
      alert(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return <div className="p-6">Loading workflow…</div>;
  }

  const { patient, files, order } = data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Design Workflow – {order.sales_order_id}
        </h1>
        <p className="text-sm text-muted-foreground">
          {order.order_type} • Status: {order.status}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
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

        <Card className="col-span-7">
          <CardHeader className="border-b px-6 py-4">
            <h3 className="text-sm font-semibold">Scan Files</h3>
          </CardHeader>
          <CardContent className="px-6 py-4 space-y-4 text-sm">
            {files.map(f => (
              <div key={f.scan_item_id} className="rounded-md border p-4 space-y-2">
                <div className="font-medium">Foot Side: {f.foot_side}</div>
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

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold">Wiky Scan Result</h3>
        </CardHeader>

        <CardContent className="px-6 py-4 grid grid-cols-3 gap-6 text-sm">
          {wikyResult ? (
            <>
              <Field label="Scan ID" value={wikyResult.scanId} />
              <Field label="Form Response ID" value={wikyResult.formResponseId ?? '—'} />
              <Field label="Status" value="FORM_SUBMITTED" />
            </>
          ) : (
            <div className="text-muted-foreground col-span-3">Scan not submitted yet</div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 border-t">
          <Button onClick={proceedToDesign} disabled={!wikyResult || submitting} className="ml-auto">
            {submitting ? 'Preparing files…' : 'Proceed to Design'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

function extractFilename(path: string) {
  return path.split('/').pop();
}

// 'use client';
//
// import { useEffect, useRef, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
//
// /* ---------------- Types ---------------- */
//
// type Patient = {
//   patient_name: string;
//   gender: string;
//   dob: string;
//   weight: number;
//   shoe_size_eu: string;
//   activity?: string;
// };
//
// type ScanFileItem = {
//   scan_item_id: string;
//   foot_side: string;
//   left_foot_file?: string;
//   right_foot_file?: string;
// };
//
// type DesignWorkflowResponse = {
//   order: {
//     sales_order_id: string;
//     order_type: string;
//     status: string;
//   };
//   patient: Patient;
//   files: ScanFileItem[];
// };
//
// type WikyCaptureResult = {
//   scanId: string;
//   formResponseId?: string;
// };
//
// /* ---------------- Page ---------------- */
//
// export default function DesignWorkflowPage() {
//   const { id } = useParams<{ id: string }>();
//
//   const router = useRouter();
//
//   const [data, setData] = useState<DesignWorkflowResponse | null>(null);
//   const [wikyResult, setWikyResult] = useState<WikyCaptureResult | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//
//   /* Load scan capture result (temporary) */
//   useEffect(() => {
//     const stored = sessionStorage.getItem('wiky:lastSubmission');
//     if (stored) {
//       setWikyResult(JSON.parse(stored));
//     }
//   }, []);
//
//   /* Load design workflow context */
//   useEffect(() => {
//     fetch('/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_design_workflow', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ sales_order_id: id }),
//     })
//       .then(res => res.json())
//       .then(res => setData(res.message))
//       .finally(() => setLoading(false));
//   }, [id]);
//
//
//   if (loading || !data) {
//     return <div className="p-6">Loading workflow…</div>;
//   }
//
//   const { patient, files, order } = data;
//
//   /* ---------------- Actions ---------------- */
//
//   // const proceedToDesign = async () => {
//   //   if (!wikyResult?.scanId) return;
//   //
//   //   setSubmitting(true);
//   //
//   //   try {
//   //     // 1️⃣ Ensure Wiky Scan Session exists
//   //     await fetch(
//   //       '/api/method/addiwise.apis.wiky_scan.wiky_workflow.create_wiky_scan_session',
//   //       {
//   //         method: 'POST',
//   //         headers: { 'Content-Type': 'application/json' },
//   //         body: JSON.stringify({
//   //           sales_order_id: id,
//   //           scan_id: wikyResult.scanId,
//   //           form_response_id: wikyResult.formResponseId ?? null,
//   //           raw_payload: wikyResult,
//   //         }),
//   //       }
//   //     );
//   //
//   //     // 2️⃣ Process files (rename + zip + upload)
//   //     const res = await fetch(
//   //       '/api/method/addiwise.apis.wiky_scan.wiky_workflow.process_wiky_files',
//   //       {
//   //         method: 'POST',
//   //         headers: { 'Content-Type': 'application/json' },
//   //         body: JSON.stringify({ sales_order_id: id }),
//   //       }
//   //     ).then(r => r.json());
//   //
//   //     const sessionId = res?.message?.session_id;
//   //     if (!sessionId) {
//   //       throw new Error('Failed to prepare Wiky files');
//   //     }
//   //
//   //     // 3️⃣ Clear temporary scan capture
//   //     sessionStorage.removeItem('wiky:lastSubmission');
//   //
//   //     // 4️⃣ Redirect to Wiky Workspace
//   //     router.push(`/design-sessions/${sessionId}`);
//   //   } catch (e) {
//   //     console.error(e);
//   //     alert('Unable to proceed to design. Please try again.');
//   //   } finally {
//   //     setSubmitting(false);
//   //   }
//   // };
//   const submitLock = useRef(false);
//   const [sessionId, setSessionId] = useState<string | null>(null);
//
//   const proceedToDesign = async () => {
//     if (!wikyResult?.scanId) return;
//
//     // 🔒 HARD client-side lock (prevents double fire)
//     if (submitLock.current) return;
//     submitLock.current = true;
//
//     setSubmitting(true);
//
//     try {
//       // 1️⃣ Create or resolve Wiky session (idempotent)
//       const sessionRes = await fetch(
//         '/api/method/addiwise.apis.wiky_scan.wiky_workflow.create_wiky_scan_session',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             sales_order_id: id,
//             scan_id: wikyResult.scanId,
//             form_response_id: wikyResult.formResponseId ?? null,
//             raw_payload: wikyResult,
//           }),
//         }
//       ).then(r => r.json());
//
//       const resolvedSessionId =
//         sessionRes?.message?.session ||
//         sessionRes?.message?.session_id;
//
//       if (!resolvedSessionId) {
//         throw new Error('Failed to resolve Wiky session');
//       }
//
//       setSessionId(resolvedSessionId);
//
//       // 2️⃣ Process files (rename + zip + upload)
//       await fetch(
//         '/api/method/addiwise.apis.wiky_scan.wiky_workflow.process_wiky_files',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ sales_order_id: id }),
//         }
//       );
//
//       // 3️⃣ Clear temporary scan capture
//       sessionStorage.removeItem('wiky:lastSubmission');
//
//       // 4️⃣ Redirect to Wiky Workspace
//       router.push(`/design-sessions/${resolvedSessionId}`);
//
//     } catch (e) {
//       console.error(e);
//       submitLock.current = false; // allow retry
//       alert('Unable to proceed to design. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };
//
//   /* ---------------- UI ---------------- */
//
//   return (
//     <div className="p-6 space-y-6">
//
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-semibold">
//           Design Workflow – {order.sales_order_id}
//         </h1>
//         <p className="text-sm text-muted-foreground">
//           {order.order_type} • Status: {order.status}
//         </p>
//       </div>
//
//       {/* Patient + Files */}
//       <div className="grid grid-cols-12 gap-6">
//
//         {/* Patient */}
//         <Card className="col-span-5">
//           <CardHeader className="border-b px-6 py-4">
//             <h3 className="text-sm font-semibold">Patient</h3>
//           </CardHeader>
//           <CardContent className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
//             <Field label="Name" value={patient.patient_name} />
//             <Field label="Gender" value={patient.gender} />
//             <Field label="DOB" value={patient.dob} />
//             <Field label="Weight" value={`${patient.weight} kg`} />
//             <Field label="Shoe Size" value={patient.shoe_size_eu} />
//             <Field label="Activity" value={patient.activity} />
//           </CardContent>
//         </Card>
//
//         {/* Scan Files */}
//         <Card className="col-span-7">
//           <CardHeader className="border-b px-6 py-4">
//             <h3 className="text-sm font-semibold">Scan Files</h3>
//           </CardHeader>
//           <CardContent className="px-6 py-4 space-y-4 text-sm">
//             {files.map(f => (
//               <div
//                 key={f.scan_item_id}
//                 className="rounded-md border p-4 space-y-2"
//               >
//                 <div className="font-medium">
//                   Foot Side: {f.foot_side}
//                 </div>
//                 {f.left_foot_file && (
//                   <div className="text-muted-foreground truncate">
//                     <strong>L:</strong> {extractFilename(f.left_foot_file)}
//                   </div>
//                 )}
//                 {f.right_foot_file && (
//                   <div className="text-muted-foreground truncate">
//                     <strong>R:</strong> {extractFilename(f.right_foot_file)}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>
//
//       {/* Wiky Scan Result */}
//       <Card>
//         <CardHeader className="border-b px-6 py-4">
//           <h3 className="text-sm font-semibold">Wiky Scan Result</h3>
//         </CardHeader>
//
//         <CardContent className="px-6 py-4 grid grid-cols-3 gap-6 text-sm">
//           {wikyResult ? (
//             <>
//               <Field label="Scan ID" value={wikyResult.scanId} />
//               <Field
//                 label="Form Response ID"
//                 value={wikyResult.formResponseId ?? '—'}
//               />
//               <Field label="Status" value="FORM_SUBMITTED" />
//             </>
//           ) : (
//             <div className="text-muted-foreground col-span-3">
//               Scan not submitted yet
//             </div>
//           )}
//         </CardContent>
//
//         <CardFooter className="px-6 py-4 border-t">
//           <Button
//             onClick={proceedToDesign}
//             disabled={!wikyResult || submitting}
//             className="ml-auto"
//           >
//             {submitting ? 'Preparing…' : 'Proceed to Design'}
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
//
// /* ---------------- Helpers ---------------- */
//
// function Field({ label, value }: { label: string; value?: string | number }) {
//   return (
//     <div>
//       <div className="text-muted-foreground text-xs">{label}</div>
//       <div className="font-medium">{value ?? '—'}</div>
//     </div>
//   );
// }
//
// function extractFilename(path: string) {
//   return path.split('/').pop();
// }
//
//
//
// // 'use client';
// //
// // import { useEffect, useState } from 'react';
// // import { useParams } from 'next/navigation';
// // import {
// //   Card,
// //   CardContent,
// //   CardFooter,
// //   CardHeader,
// // } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// //
// // export default function DesignWorkflowPage() {
// //   const { id } = useParams<{ id: string }>();
// //   const [data, setData] = useState<any>(null);
// //   const [wikyResult, setWikyResult] = useState<any>(null);
// //   const [showDesignSteps, setShowDesignSteps] = useState(false);
// //
// //   useEffect(() => {
// //     const stored = sessionStorage.getItem('wiky:lastSubmission');
// //     if (stored) setWikyResult(JSON.parse(stored));
// //   }, []);
// //
// //   useEffect(() => {
// //     fetch('/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_design_workflow', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ sales_order_id: id }),
// //     })
// //       .then((res) => res.json())
// //       .then((res) => setData(res.message));
// //   }, [id]);
// //
// //   if (!data) return <div className="p-6">Loading workflow…</div>;
// //
// //   const { patient, files } = data;
// //
// //   return (
// //     <div className="p-6 space-y-6">
// //
// //       {/* ================= PAGE HEADER ================= */}
// //       <div>
// //         <h1 className="text-2xl font-semibold">
// //           Design Workflow – {data.order.sales_order_id}
// //         </h1>
// //         <p className="text-sm text-muted-foreground">
// //           {data.order.order_type} • Status: {data.order.status}
// //         </p>
// //       </div>
// //
// //       {/* ================= MAIN GRID ================= */}
// //       <div className="grid grid-cols-12 gap-6">
// //
// //         {/* -------- Patient -------- */}
// //         <Card className="col-span-5">
// //           <CardHeader className="border-b px-6 py-4">
// //             <h3 className="text-sm font-semibold">Patient</h3>
// //           </CardHeader>
// //
// //           <CardContent className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
// //             <Field label="Name" value={patient.patient_name} />
// //             <Field label="Gender" value={patient.gender} />
// //             <Field label="DOB" value={patient.dob} />
// //             <Field label="Weight" value={`${patient.weight} kg`} />
// //             <Field label="Shoe Size" value={patient.shoe_size_eu} />
// //             <Field label="Activity" value={patient.activity} />
// //           </CardContent>
// //         </Card>
// //
// //         {/* -------- Scan Files -------- */}
// //         <Card className="col-span-7">
// //           <CardHeader className="border-b px-6 py-4">
// //             <h3 className="text-sm font-semibold">Scan Files</h3>
// //           </CardHeader>
// //
// //           <CardContent className="px-6 py-4 space-y-4 text-sm">
// //             {files.map((f: any) => (
// //               <div
// //                 key={f.scan_item_id}
// //                 className="rounded-md border p-4 space-y-2"
// //               >
// //                 <div className="font-medium">
// //                   Foot Side: {f.foot_side}
// //                 </div>
// //
// //                 {f.left_foot_file && (
// //                   <div className="text-muted-foreground truncate">
// //                     <strong>L:</strong> {extractFilename(f.left_foot_file)}
// //                   </div>
// //                 )}
// //
// //                 {f.right_foot_file && (
// //                   <div className="text-muted-foreground truncate">
// //                     <strong>R:</strong> {extractFilename(f.right_foot_file)}
// //                   </div>
// //                 )}
// //               </div>
// //             ))}
// //           </CardContent>
// //         </Card>
// //       </div>
// //
// //       {/* ================= WIKY RESULT ================= */}
// //       <Card>
// //         <CardHeader className="border-b px-6 py-4 flex items-center justify-between">
// //           <h3 className="text-sm font-semibold">Wiky Scan Result</h3>
// //         </CardHeader>
// //
// //         <CardContent className="px-6 py-4 grid grid-cols-3 gap-6 text-sm">
// //           {wikyResult ? (
// //             <>
// //               <Field label="Scan ID" value={wikyResult.scanId} />
// //               <Field
// //                 label="Form Response ID"
// //                 value={wikyResult.formResponseId ?? '—'}
// //               />
// //               <Field label="Status" value="SUBMITTED" />
// //             </>
// //           ) : (
// //             <div className="text-muted-foreground col-span-3">
// //               Scan not submitted yet
// //             </div>
// //           )}
// //         </CardContent>
// //
// //         <CardFooter className="px-6 py-4 border-t">
// //           <Button
// //             onClick={() => setShowDesignSteps(true)}
// //             disabled={!wikyResult}
// //             className="ml-auto"
// //           >
// //             Proceed to Design
// //           </Button>
// //         </CardFooter>
// //       </Card>
// //
// //       {/* ================= WORKFLOW STEPS ================= */}
// //       {showDesignSteps && (
// //         <Card>
// //           <CardHeader className="border-b px-6 py-4">
// //             <h3 className="text-sm font-semibold">Design Workflow</h3>
// //           </CardHeader>
// //
// //           <CardContent className="px-6 py-4 flex items-center gap-6 text-sm">
// //             <Step label="Scan Captured" done />
// //             <Step label="File Validation" />
// //             <Step label="Design" />
// //             <Step label="Manufacturing" />
// //           </CardContent>
// //         </Card>
// //       )}
// //     </div>
// //   );
// // }
// //
// // /* ---------------- helpers ---------------- */
// //
// // function Field({ label, value }: { label: string; value: any }) {
// //   return (
// //     <div>
// //       <div className="text-muted-foreground text-xs">{label}</div>
// //       <div className="font-medium">{value ?? '—'}</div>
// //     </div>
// //   );
// // }
// //
// // function Step({ label, done }: { label: string; done?: boolean }) {
// //   return (
// //     <div className="flex items-center gap-2">
// //       <span
// //         className={`h-2 w-2 rounded-full ${
// //           done ? 'bg-green-500' : 'bg-gray-300'
// //         }`}
// //       />
// //       <span>{label}</span>
// //     </div>
// //   );
// // }
// //
// // function extractFilename(path: string) {
// //   return path.split('/').pop();
// // }
