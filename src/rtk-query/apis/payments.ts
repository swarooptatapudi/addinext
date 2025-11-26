// src/rtk-query/apis/payments.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/rtk-query/apis';

export type Provider = 'HDFC';
export type Currency = 'INR';

// Request interface for updateStatus
export interface UpdateStatusRequest {
  order_id: string;
  provider_ref?: string;
  status: string;
  raw?: any;
}

// Response interface for updateStatus
export interface UpdateStatusResponse {
  message: string;
  success: boolean;
}

export interface CreatePaymentOrderInput {
  amount_rupees: number;
  sales_order: string;
  currency?: Currency;
  provider?: Provider;
  return_url?: string;
}

export interface CreatePaymentOrderResponse {
  message: {
    success: boolean;
    message: string;
    data?: {
      order_id: string;
      paymentlink: string;
      providerref?: string;
      amount: number;
      currency: Currency;
      sales_order: string;
    };
  };
}

export interface PaymentStatusResponse {
  message: string;
  data?: {
    order_id: string;
    status: string;
    amount?: number;
    currency?: string;
  };
}

export interface ConfirmPaymentInput {
  order_id: string;
  sales_order?: string | null;
  status: string;
  signature_valid: boolean;
}

export interface ConfirmPaymentResponse {
  message: {
    success: boolean;
    message: string;
    data?: {
      order_id: string;
      sales_order: string;
      status: string;
    };
  };
}

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PaymentStatus'],
  endpoints: (builder) => ({
    /** 🔹 Create payment order (calls Frappe create_payment_order) */
    createPaymentOrder: builder.mutation<CreatePaymentOrderResponse, CreatePaymentOrderInput>({
      query: (body) => {
        const RETURN_URL = `${window.location.origin}/api/payments/return`;
        const payload = {
          ...body,
          provider: body.provider || 'HDFC',
          currency: body.currency || 'INR',
          return_url: body.return_url || RETURN_URL,
        };

        return {
          url: '/method/addiwise.apis.payments.hdfc_payments.create_payment_order',
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        };
      },
    }),

    /** 🔹 Get payment status (calls Frappe get_payment_status) */
    getPaymentStatus: builder.query<PaymentStatusResponse, { order_id: string }>({
      query: ({ order_id }) => ({
        url: `/method/addiwise.apis.payments.hdfc_payments.get_payment_status?order_id=${order_id}`,
        method: 'GET',
      }),
    }),

    /** 🔹 Confirm payment (calls Frappe confirm_payment) */
    confirmPayment: builder.mutation<ConfirmPaymentResponse, ConfirmPaymentInput>({
      query: (body) => ({
        url: '/method/addiwise.apis.payments.hdfc_payments.confirm_payment',
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    }),
    updateStatus: builder.mutation<UpdateStatusResponse, UpdateStatusRequest>({
      query: (body) => ({
        url:
          '/method/addiwise.apis.payments.hdfc_payments.confirm_payment',
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    }),
  }),

});

export const {
  useCreatePaymentOrderMutation,
  useGetPaymentStatusQuery,
  useConfirmPaymentMutation,
  useUpdateStatusMutation,
} = paymentsApi;
