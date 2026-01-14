'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { toast } from 'react-toastify';

type Props = {
  salesOrderId: string;
};

type WikySaveState = 'IDLE' | 'RECEIVED' | 'SAVING' | 'SAVED' | 'FAILED';

export function WikyScanModal({ salesOrderId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<WikySaveState>('IDLE');
  const [saveError, setSaveError] = useState<string | null>(null);

  const submittedRef = useRef(false);

  /* -------------------------------------------------- */
  /* Load Wiky Config                                   */
  /* -------------------------------------------------- */
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(
          '/api/method/addiwise.apis.wiky_scan.wiky.get_wiky_config',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sales_order_id: salesOrderId }),
          }
        );

        const json = await res.json();
        const url = json?.message?.wiky?.iframe?.url;

        if (!url) throw new Error('Invalid Wiky response');

        setIframeUrl(url);
      } catch (e) {
        toast.error('Failed to load design tool');
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [salesOrderId]);

  /* -------------------------------------------------- */
  /* Persist Scan Session                               */
  /* -------------------------------------------------- */
  async function persistScanSession(payload: any): Promise<boolean> {
    try {
      setSaveState('SAVING');

      const res = await fetch(
        '/api/method/addiwise.apis.wiky_scan.wiky_workflow.create_wiky_scan_session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sales_order_id: salesOrderId,
            scan_id: payload.scanId,
            form_response_id: payload.formResponseId ?? null,
            raw_payload: payload,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to persist scan session');

      setSaveState('SAVED');
      return true;
    } catch (err: any) {
      console.error(err);
      setSaveState('FAILED');
      setSaveError(err.message ?? 'Unknown error');
      return false;
    }
  }

  /* -------------------------------------------------- */
  /* Wiky postMessage Listener                          */
  /* -------------------------------------------------- */
  useEffect(() => {
    const ALLOWED_ORIGINS = [
      'https://scan.wikyapps.com',
      'https://apps.wikysolutions.com',
      'https://capture.wikysolutions.com',
    ];

    async function onMessage(e: MessageEvent) {
      if (!ALLOWED_ORIGINS.includes(e.origin)) return;
      if (submittedRef.current) return;

      const scanId =
        e.data?.scanId ||
        e.data?.ID ||
        e.data?.data?.ID;

      if (!scanId) return;

      submittedRef.current = true;
      setSaveState('RECEIVED');

      const payload = {
        ...e.data,
        scanId,
      };

      // 🔐 crash-safe local persist (used by DesignWorkflowPage)
      sessionStorage.setItem(
        'wiky:lastSubmission',
        JSON.stringify(payload)
      );

      const ok = await persistScanSession(payload);
      if (ok) {
        router.push(`/orders/design/${salesOrderId}`);
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [salesOrderId, router]);

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-[95vw] h-[95vh] overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Insole Design</DialogTitle>
          <DialogDescription>
            Capture foot scan and design prescription using Wiky
          </DialogDescription>
        </VisuallyHidden>

        {loading && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Loading design tool…
          </div>
        )}

        {!loading && iframeUrl && (
          <iframe
            id="wiky_iframe"
            src={iframeUrl}
            className="w-full h-full border-0"
            allow="camera *; microphone *"
          />
        )}

        {saveState === 'FAILED' && (
          <div className="absolute bottom-4 right-4 text-xs text-red-600">
            {saveError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



// 'use client';
//
// import { useEffect, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
// import { toast } from 'react-toastify';
//
// type Props = {
//   salesOrderId: string;
// };
// type WikySaveState =
//   | 'IDLE'
//   | 'RECEIVED'
//   | 'SAVING'
//   | 'SAVED'
//   | 'FAILED';
//
// export function WikyScanModal({ salesOrderId }: Props) {
//   const router = useRouter();
//
//   const [open, setOpen] = useState(true);
//   const [iframeUrl, setIframeUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   const submittedRef = useRef(false);
//
//
//   // const submittedRef = useRef(false);
//   const [saveState, setSaveState] = useState<WikySaveState>('IDLE');
//   const [saveError, setSaveError] = useState<string | null>(null);
//   /* -------------------------------------------------- */
//   /* Load Wiky Config                                   */
//   /* -------------------------------------------------- */
//   useEffect(() => {
//     async function loadConfig() {
//       try {
//         const res = await fetch(
//           '/api/method/addiwise.apis.wiky_scan.wiky.get_wiky_config',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ sales_order_id: salesOrderId }),
//           }
//         );
//
//         const json = await res.json();
//         const url = json?.message?.wiky?.iframe?.url;
//
//         if (!url) throw new Error('Invalid Wiky response');
//
//         setIframeUrl(url);
//       } catch (e) {
//         toast.error('Failed to load design tool');
//         setOpen(false);
//       } finally {
//         setLoading(false);
//       }
//     }
//
//     loadConfig();
//   }, [salesOrderId]);
//
//   /* -------------------------------------------------- */
//   /* Wiky postMessage Listener                          */
//   /* -------------------------------------------------- */
//   // useEffect(() => {
//   //   function onMessage(e: MessageEvent) {
//   //     if (!e.origin.includes('wiky')) return;
//   //
//   //     // if (e.data?.event === 'customFormSubmitted') {
//   //     //   if (submittedRef.current) return;
//   //     //   submittedRef.current = true;
//   //     //
//   //     //   toast.success('Design captured successfully');
//   //     //   // ✅ STORE RESULT (NO BACKEND)
//   //     //   sessionStorage.setItem(
//   //     //     'wiky:lastSubmission',
//   //     //     JSON.stringify(e.data)
//   //     //   );
//   //     //
//   //     //   setOpen(false);
//   //     //   router.push(`/orders/design/${salesOrderId}`);
//   //     // }
//   //
//   //     if (e.data?.event === 'customFormSubmitted') {
//   //       if (submittedRef.current) return;
//   //       submittedRef.current = true;
//   //
//   //       const scanId =
//   //         e.data.scanId ||
//   //         e.data.ID ||
//   //         e.data?.data?.ID;
//   //
//   //       // 1️⃣ Store locally (already correct)
//   //       sessionStorage.setItem(
//   //         'wiky:lastSubmission',
//   //         JSON.stringify({ ...e.data, scanId })
//   //       );
//   //
//   //       // 2️⃣ 🔥 CREATE WIKY SCAN SESSION (HERE)
//   //        fetch(
//   //         '/api/method/addiwise.apis.wiky_workflow.create_scan_session',
//   //         {
//   //           method: 'POST',
//   //           headers: { 'Content-Type': 'application/json' },
//   //           body: JSON.stringify({
//   //             sales_order_id: salesOrderId,
//   //             scan_id: scanId,
//   //             form_response_id: e.data.formResponseId,
//   //             wiky_raw_response: e.data,
//   //           }),
//   //         }
//   //       );
//   //
//   //       // 3️⃣ Redirect
//   //       router.push(`/orders/design/${salesOrderId}`);
//   //     }
//   //
//   //   }
//   //
//   //   window.addEventListener('message', onMessage);
//   //   return () => window.removeEventListener('message', onMessage);
//   // }, [router, salesOrderId]);
//
//
//   useEffect(() => {
//     async function persistScanSession(eData: any) {
//       try {
//         setSaveState('SAVING');
//
//         const res = await fetch(
//           '/api/method/addiwise.apis.wiky_scan.create_scan_session',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               sales_order_id: salesOrderId,
//               scan_id: eData.scanId,
//               form_response_id: eData.formResponseId,
//               wiky_raw_response: eData,
//             }),
//           }
//         );
//
//         if (!res.ok) {
//           throw new Error('Failed to persist scan session');
//         }
//
//         setSaveState('SAVED');
//         router.push(`/orders/design/${salesOrderId}`);
//       } catch (err: any) {
//         console.error(err);
//         setSaveState('FAILED');
//         setSaveError(err.message ?? 'Unknown error');
//       }
//     }
//
//     function onMessage(e: MessageEvent) {
//       if (e.data?.event !== 'customFormSubmitted') return;
//       if (submittedRef.current) return;
//
//       submittedRef.current = true;
//       setSaveState('RECEIVED');
//
//       const scanId = e.data.scanId || e.data.ID;
//       if (!scanId) {
//         setSaveState('FAILED');
//         setSaveError('Scan ID missing');
//         return;
//       }
//
//       const payload = { ...e.data, scanId };
//
//       // crash-safe local persist
//       sessionStorage.setItem(
//         'wiky:lastSubmission',
//         JSON.stringify(payload)
//       );
//
//       // 🔐 async boundary (safe)
//       persistScanSession(payload);
//     }
//
//     window.addEventListener('message', onMessage);
//     return () => window.removeEventListener('message', onMessage);
//   }, [salesOrderId, router]);
//
//   /* -------------------------------------------------- */
//   /* UI                                                 */
//   /* -------------------------------------------------- */
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="p-0 max-w-[95vw] h-[95vh] overflow-hidden">
//         <VisuallyHidden>
//           <DialogTitle>Insole Design</DialogTitle>
//           <DialogDescription>
//             Capture foot scan and design prescription using Wiky
//           </DialogDescription>
//         </VisuallyHidden>
//
//         {loading && (
//           <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
//             Loading design tool…
//           </div>
//         )}
//
//         {!loading && iframeUrl && (
//           <iframe
//             src={iframeUrl}
//             className="w-full h-full border-0"
//             allow="camera *; microphone *"
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
//
