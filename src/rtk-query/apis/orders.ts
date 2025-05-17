import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order.create_order',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: any) => response.message
    }),
    getOrders: builder.query({
      query: () => ({
        url: `/method/addiwise.apis.sales_order_details.get_sales_order_details`,
        method: 'GET'
      }),
      transformResponse: (response: any) => response.message
    })
  })
});

export const { useCreateOrderMutation, useGetOrdersQuery } = ordersApi;
