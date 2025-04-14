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

export const APIS_LIST = [
  authApi,
  subscriptionApi,
  addicoinsApi,
  productsApi,
  ordersApi,
  formsApi,
  patientApi
];

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// Move the declaration **after** baseQuery
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      console.error('Unauthorized! Handling token refresh...');
      // TODO: Add token refresh logic
    } else {
      console.error('API Error:', result.error);
    }
  }

  return result;
};
