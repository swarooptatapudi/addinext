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

export function WikyScanModal({ salesOrderId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
  /* Wiky postMessage Listener                          */
  /* -------------------------------------------------- */
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.origin.includes('wiky')) return;

      if (e.data?.event === 'customFormSubmitted') {
        if (submittedRef.current) return;
        submittedRef.current = true;

        toast.success('Design captured successfully');
        // ✅ STORE RESULT (NO BACKEND)
        sessionStorage.setItem(
          'wiky:lastSubmission',
          JSON.stringify(e.data)
        );

        setOpen(false);
        router.push(`/orders/design/${salesOrderId}`);
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router, salesOrderId]);

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
            src={iframeUrl}
            className="w-full h-full border-0"
            allow="camera *; microphone *"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

