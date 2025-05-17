import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

export const addicoinsApi = createApi({
  reducerPath: 'addicoinsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Addicoins'],
  endpoints: (builder) => ({
    getRateAndDiscounts: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.payment.addinxt_coins_purchase.get_coins_rate_and_discount_details',
        method: 'GET'
      }),
      transformResponse: (response: any) => response.message
    }),
    buyCoinsInitiatePayment: builder.mutation({
      query: (payload) => ({
        url: '/method/addiwise.apis.payment.addinxt_coins_purchase.initiate_payment_process_request_to_coins_purchase',
        method: 'POST',
        body: { payload }
      }),
      transformResponse: (response: any) => response.message
    }),
    buyCoinsAfterPayment: builder.mutation({
      query: (payload) => ({
        url: '/method/addiwise.apis.payment.addinxt_coins_purchase.update_payment_details',
        method: 'POST',
        body: { payload }
      }),
      transformResponse: (response: any) => response.message
    })
  })
});

export const {
  useGetRateAndDiscountsQuery,
  useBuyCoinsInitiatePaymentMutation,
  useBuyCoinsAfterPaymentMutation
} = addicoinsApi;
