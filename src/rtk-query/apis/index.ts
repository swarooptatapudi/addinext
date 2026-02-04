import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { authApi } from './auth';
import { subscriptionApi } from './subscription';
import { addicoinsApi } from './addicoins';
import { productsApi } from './products';
import { ordersApi } from './orders';
import { formsApi } from './forms';
import { patientApi } from './patient';
import { paymentsApi } from '@/rtk-query/apis/payments';

export const APIS_LIST = [
  authApi,
  subscriptionApi,
  addicoinsApi,
  productsApi,
  ordersApi,
  formsApi,
  patientApi,
  paymentsApi
];

// const baseQuery = fetchBaseQuery({
//   baseUrl: '/api/',
//   prepareHeaders: (headers) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//       localStorage.setItem('token', token); // Refresh token expiry on each request
//       // not this api. where is login api
//     } else {
//       console.warn('No auth token found in localStorage');
//     }
//     return headers;
//   }
// });
//
// // Move the declaration **after** baseQuery
// export const baseQueryWithReauth: BaseQueryFn<
//   string | FetchArgs,
//   unknown,
//   FetchBaseQueryError
// > = async (args, api, extraOptions) => {
//   const result = await baseQuery(args, api, extraOptions);
//
//   if (result.error) {
//     if (result.error.status === 401) {
//       console.error('Unauthorized! Handling token refresh...');
//       // TODO: Add token refresh logic
//     } else {
//       console.error('API Error:', result.error);
//     }
//   }
//
//   return result;
// };
