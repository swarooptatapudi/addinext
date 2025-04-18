import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

interface SalesOrder {
  order_id: string;
  customer: string;
  clinic_name: null | string;
  patient_name: string;
  device_type: string;
  order_date: string;
  delivery_date: string;
  order_value: number;
  status: string;
}
interface SalesOrdersResponse {
  message: string;
  data: {
    time: string;
    sales_orders: SalesOrder[];
  };
}
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
      transformResponse: (response: SalesOrdersResponse) => response
    }),
    getOrders: builder.query({
      query: () => ({
        url: `/method/addiwise.apis.order.get_sales_order`,
        method: 'GET'
      }),
      transformResponse: (response: SalesOrdersResponse) => response
    })
  })
});

export const { useCreateOrderMutation, useGetOrdersQuery } = ordersApi;
