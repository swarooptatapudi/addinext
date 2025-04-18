import { createApi } from '@reduxjs/toolkit/query/react';
import { USER } from '@/uttils/Types';
import baseQueryWithReauth from '../base/baseQueryReAuth';

interface LOGIN_RESPONSE {
  message: string;
  data: USER;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: '/method/login',
        method: 'POST',
        body: payload
      }),
      transformResponse: (response: LOGIN_RESPONSE) => response
    }),
    logout: builder.query({
      query: () => ({
        url: '/method/logout',
        method: 'GET'
      }),
      transformResponse: (response: LOGIN_RESPONSE) => response
    }),
    getUserDetails: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.customer.get_logged_in_user_details',
        method: 'GET'
      }),
      transformResponse: (response: LOGIN_RESPONSE) => response
    })
  })
});

export const { useLoginMutation, useLazyLogoutQuery, useLazyGetUserDetailsQuery } = authApi;
