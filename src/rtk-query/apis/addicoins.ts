import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

interface BuyCoinsPayload {
  buy_coin: number;
  plan: string;
  payment_id: string;
  amount:string;
}
export const addicoinsApi = createApi({
  reducerPath: 'addicoinsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Addicoins'],
  endpoints: (builder) => ({
    getRateAndDiscounts: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.addinxt_coin.get_user_plan_rule',
        method: 'GET'
      }),
      transformResponse: (response: any) => response
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
    }),
    getTransactionHistory: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.addinxt_coin.get_coin_transaction_history',
        method: 'GET'
      }),
      transformResponse: (response: any) => response
    }),
    getTransactionHistorySeles: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.addinxt_coin.get_sales_order_coin_history',
        method: 'GET'
      }),
      transformResponse: (response: any) => response
    }),
    buyAddiNxtCoin: builder.mutation({
      query: (payload: BuyCoinsPayload) => ({
        url: '/method/addiwise.apis.addinxt_coin.buy_addinxt_coin',
        method: 'POST',
        body: payload
      }),
      transformResponse: (response: any) => response
    })
  })
});

export const {
  useGetRateAndDiscountsQuery,
  useBuyCoinsInitiatePaymentMutation,
  useBuyCoinsAfterPaymentMutation,
  useGetTransactionHistoryQuery,
  useGetTransactionHistorySelesQuery,
  useBuyAddiNxtCoinMutation  
} = addicoinsApi;
