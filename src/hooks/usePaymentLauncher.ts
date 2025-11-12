'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import {
  paymentsApi,
  useCreatePaymentOrderMutation,
} from '@/rtk-query/apis/payments';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface PaymentLauncherOptions {
  amount: number;
  salesOrder: string;
  provider?: 'HDFC';
  currency?: 'INR';
  returnUrl?: string;
  onSuccess?: (result: any) => void;
  onFailure?: (error: any) => void;
  autoNavigateOnSuccess?: boolean;
  pollingAttempts?: number;
  pollingIntervalMs?: number;
  openInPopup?: boolean;
}

interface PaymentStatusResponse {
  message?: {
    data?: {
      status?: string;
    };
    status?: string;
  };
  data?: {
    status?: string;
  };
  status?: string;
}

/* -------------------------------------------------------------------------- */
/*                              HOOK DEFINITION                               */
/* -------------------------------------------------------------------------- */

export function usePaymentLauncher() {
  const router = useRouter();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [triggerGetPaymentStatus] = paymentsApi.useLazyGetPaymentStatusQuery();

  const popupRef = useRef<Window | null>(null);
  const lastIntentRef = useRef<string | null>(null);

  /* ---------------------------- Polling Function --------------------------- */
  async function pollForStatus(
    orderId: string,
    attempts = 20,
    interval = 2000
  ): Promise<{ ok: boolean; status: string; raw?: any }> {
    let i = 0;
    while (i++ < attempts) {
      try {
        const r = (await triggerGetPaymentStatus({
          order_id: orderId,
        } as any).unwrap()) as PaymentStatusResponse;

        const status =
          r?.message?.data?.status ||
          r?.data?.status ||
          r?.message?.status ||
          r?.status ||
          '';

        if (status && status.toUpperCase() === 'CHARGED') {
          return { ok: true, status: 'CHARGED', raw: r };
        }
      } catch (err) {
        console.warn('pollForStatus error', err);
      }

      await new Promise((res) => setTimeout(res, interval));
    }
    return { ok: false, status: 'TIMEOUT' };
  }

  /* ---------------------------- Popup Management --------------------------- */
  async function openPopup(url: string) {
    const w = 1000;
    const h = 760;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      url,
      'hdfc_payment',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (popup) popup.focus();
    return popup;
  }

  /* ----------------------------- Start Payment ----------------------------- */
  async function startPayment(options: PaymentLauncherOptions) {
    const {
      amount,
      salesOrder,
      provider = 'HDFC',
      currency = 'INR',
      returnUrl,
      onSuccess,
      onFailure,
      autoNavigateOnSuccess = true,
      pollingAttempts = 20,
      pollingIntervalMs = 2000,
      openInPopup = true,
    } = options;

    try {
      // 🔹 Prepare payload compatible with Frappe endpoint
      const payload = {
        amount_rupees: amount,
        sales_order: salesOrder,
        currency: currency as 'INR',
        provider: provider as 'HDFC',
        return_url: returnUrl || `${window.location.origin}/api/payments/return`,
      };

      // 🔹 Create payment intent on backend
      const res: any = await createPaymentOrder(payload).unwrap();

      // Handle different Frappe response shapes
      const data =
        (res?.message && (res.message as any).data) || res?.data || res || {};
      const intentId =
        data?.order_id || data?.intent_id || data?.payment_intent_id;
      const paymentLink = data?.paymentlink || data?.payment_link;

      if (!intentId || !paymentLink) {
        throw new Error(
          'Invalid payment response: Missing intent/order ID or payment link.'
        );
      }

      lastIntentRef.current = intentId;

      /* ------------------------- Open popup or tab ------------------------- */
      let popup: Window | null = null;
      if (openInPopup) popup = await openPopup(paymentLink);
      popupRef.current = popup;

      // handle popup blocked
      if (!popup) {
        window.open(paymentLink, '_blank');
        const pollRes = await pollForStatus(
          intentId,
          pollingAttempts,
          pollingIntervalMs
        );
        if (pollRes.ok) {
          onSuccess?.(pollRes);
          if (autoNavigateOnSuccess) router.push('/orders');
        } else {
          onFailure?.(pollRes);
        }
        return;
      }

      /* ------------------------- PostMessage listener ------------------------- */
      const onMessage = async (e: MessageEvent) => {
        if (!e.data || e.data.type !== 'HDFC_RETURN') return;
        const payload = e.data.payload ?? {};

        try {
          if (popupRef.current && !popupRef.current.closed)
            popupRef.current.close();
        } catch {}

        const returnedIntentId =
          payload?.data?.processed_order_id ||
          payload?.data?.order_id ||
          payload?.forwarded?.received?.body?.order_id ||
          payload?.order_id ||
          intentId;

        const returnedStatus =
          (payload?.data?.status ||
            payload?.status ||
            payload?.forwarded?.received?.body?.status ||
            '')
            .toString()
            .toUpperCase();

        if (returnedStatus === 'CHARGED') {
          onSuccess?.(payload);
          if (autoNavigateOnSuccess) router.push('/orders');
        } else {
          const pollRes = await pollForStatus(
            returnedIntentId,
            pollingAttempts,
            pollingIntervalMs
          );
          if (pollRes.ok) {
            onSuccess?.(pollRes);
            if (autoNavigateOnSuccess) router.push('/orders');
          } else {
            onFailure?.(pollRes);
          }
        }

        window.removeEventListener('message', onMessage);
      };

      window.addEventListener('message', onMessage);

      /* -------------------- Fallback polling if popup closes ------------------- */
      const watcher = window.setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(watcher);
            window.removeEventListener('message', onMessage);
            const pollRes = await pollForStatus(
              intentId,
              pollingAttempts,
              pollingIntervalMs
            );
            if (pollRes.ok) {
              onSuccess?.(pollRes);
              if (autoNavigateOnSuccess) router.push('/orders');
            } else {
              onFailure?.(pollRes);
            }
          }
        } catch {
          clearInterval(watcher);
        }
      }, 1000);
    } catch (err) {
      console.error('Payment error:', err);
      onFailure?.(err);
    }
  }

  return { startPayment };
}
