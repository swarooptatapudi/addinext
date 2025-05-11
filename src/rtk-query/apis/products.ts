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
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductsByTempleteQuery,
  useGetItemNameByDetailsMutation
} = productsApi;
