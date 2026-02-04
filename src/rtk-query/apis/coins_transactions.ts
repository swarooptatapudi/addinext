import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryReAuth from '@/rtk-query/base/baseQueryReAuth';


export interface CreateCoinOrderResponse {
  message: {
    status: string;
    sales_order: string;
    coins_transaction: string;
    coins: number;
    unit_price: number;
    base_amount: number;
    subscription_discount: number;
    coupon_discount: number;
    tax_amount: number;
    final_amount: number;
    bonus_coins: number;
  };
}

/* ================================
   API
================================ */

export const coinTransactionApi = createApi({
  reducerPath: 'coinTransactionApi',
  baseQuery: baseQueryReAuth,
  tagTypes: ['CoinTransaction'],
  endpoints: (builder) => ({

    /* ---------------------------------
       1️⃣ Create Coin Order (NO PAYMENT)
    ---------------------------------- */
    createCoinOrder: builder.mutation<
      CreateCoinOrderResponse,
      {
        coins: number;
        coupon_code?: string;
      }
    >({
      query: (body) => ({
        url: '/method/addiwise.apis.payment.addinxt_coins_purchase.create_addinxt_coin_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CoinTransaction'],
    }),
  }),
});

export const {
  useCreateCoinOrderMutation,
} = coinTransactionApi;
