'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import {
  useCreatePaymentOrderMutation,
  paymentsApi,
} from '@/rtk-query/apis/payments';

type PaymentState = 'paid' | 'failed' | 'processing';

export function usePaymentLauncher(redirectPath = '/orders') {
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);

  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [getStatus] = paymentsApi.useLazyGetPaymentStatusQuery();

  /* ---------------------------- Polling ---------------------------- */
  async function pollForStatus(
    orderId: string,
    attempts = 30,
    intervalMs = 3000
  ): Promise<PaymentState> {
    for (let i = 0; i < attempts; i++) {
      try {
        const res: any = await getStatus({ order_id: orderId }).unwrap();

        const status =
          res?.data?.status ||
          res?.message?.data?.status ||
          res?.status;

        const normalized = String(status || '').toUpperCase();

        if (normalized === 'CAPTURED' || normalized === 'CHARGED') {
          return 'paid';
        }
        if (normalized === 'FAILED') {
          return 'failed';
        }
      } catch {
        // retry
      }

      await new Promise(r => setTimeout(r, intervalMs));
    }
    return 'processing';
  }

  /* -------------------------- Start Payment -------------------------- */
  async function startPayment(salesOrder: string) {
    const popup = window.open(
      'about:blank',
      'hdfc_payment',
      'width=1000,height=760,resizable=yes,scrollbars=yes'
    );

    if (!popup) {
      alert('Please allow popups to continue payment');
      return;
    }

    popupRef.current = popup;

    let orderId: string | null = null;

    try {
      const res: any = await createPaymentOrder({
        sales_order: salesOrder,
      }).unwrap();

      const data = res?.message?.data || res?.message || res;

      orderId = data?.order_id;
      const paymentLink =
        data?.payment_link ||
        data?.paymentlink ||
        data?.paymentLink;

      if (!orderId || !paymentLink) {
        popup.close();
        throw new Error('Invalid payment response');
      }

      popup.location.href = paymentLink;
      popup.focus();
    } catch (err) {
      popup.close();
      throw err;
    }

    /* optional: still listen for HDFC_RETURN for logging */
    const onMessage = async (e: MessageEvent) => {
      if (e?.data?.type !== 'HDFC_RETURN') return;
      window.removeEventListener('message', onMessage);
      // no redirect here
    };
    window.addEventListener('message', onMessage);

    /* ✅ ONLY redirect when user clicks Close */
    const onCloseClick = (e: MessageEvent) => {
      if (e?.data?.type !== 'PAYMENT_CLOSE_CLICKED') return;

      window.removeEventListener('message', onCloseClick);
      router.push(redirectPath);
    };

    window.addEventListener('message', onCloseClick);
  }

  return { startPayment };
}
