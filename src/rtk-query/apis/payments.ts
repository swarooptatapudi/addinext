// src/rtk-query/apis/payments.ts (only snippet shown)
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/rtk-query/apis';

export type Provider = 'HDFC';
export type Currency = 'INR';

export interface CreateIntentInput {
  amount_rupees: number;
  sales_order?: string | null;
  currency?: Currency;
  provider?: Provider;
  return_url?: string;
  order_id?: string;
}

export interface CreateIntentResponse {
  success: boolean;
  message: string;
  data?: {
    order_id: string;
    provider: Provider;
    provider_ref?: string;
    payment_link: string;
  };
}

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PaymentStatus'],
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<CreateIntentResponse, CreateIntentInput>({
      query: (body) => ({
        url: '/method/addiwise.apis.payments.hdfc_payments.create_intent',
        method: 'POST',
        // Force JSON text body and explicit header so Frappe sees text JSON (not raw bytes)
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    }),

    getPaymentStatus: builder.query<any, { order_id?: string; provider_ref?: string }>({
      query: ({ order_id, provider_ref }) => {
        const q = new URLSearchParams();
        if (order_id) q.set('order_id', order_id);
        if (provider_ref) q.set('provider_ref', provider_ref);
        return {
          url: `/method/addiwise.apis.payments.status?${q.toString()}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const { useCreatePaymentIntentMutation, useGetPaymentStatusQuery } = paymentsApi;
