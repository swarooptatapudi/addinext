import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: '/resource/Item?fields=["*"]&filters=[["has_variants","=","1"]]',
        method: 'GET'
      }),
      transformResponse: (response: any) => response.data
    }),
    getProductsByTemplete: builder.query({
      query: (templete_id) => ({
        url: `/resource/Item?fields=["*"]&filters=[["has_variants","=","0"],["variant_of","=","${templete_id}"]]`,
        method: 'GET'
      }),
      transformResponse: (response: any) => response.data
    }),
    getItemNameByDetails: builder.mutation({
      query: (payload) => ({
        url: `/method/addiwise.apis.item_details.get_bk_item_details`,
        method: 'POST',
        body: payload
      }),
      transformResponse: (response: any) => response.message
    }),
    getProductColorStep5: builder.mutation({
      query: (_unusedArg) => ({
        url: '/method/addiwise.apis.color_api.get_colors',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.message.colors,
    }),
    getProductsList: builder.query<any, void>({
      query: () => ({
        url: `/method/addiwise.apis.customer.get_items`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.message.data,
    }),
    getProductsSalesOrderList: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.order_types.bk_order.get_sales_order_offthe_shelf',
        method: 'GET',
        // params: customer ? { customer } : undefined, // ✅ pass query param
      }),
      transformResponse: (response: any) => {
        // console.log("Full API Response >>>", response); // 🔍 debug
        return response?.data?.sales_orders ?? [];
      },
    }),




  })
});

export const {
  useGetProductsQuery,
  useGetProductsByTempleteQuery,
  useGetItemNameByDetailsMutation,
  useGetProductColorStep5Mutation,
  useGetProductsListQuery,
  useGetProductsSalesOrderListQuery
} = productsApi;
