import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

export const formsApi = createApi({
  reducerPath: 'formsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Forms'],
  endpoints: (builder) => ({
    getFormSettings: builder.query({
      query: (itemType) => ({
        url: `/resource/Order Form Option/${itemType}`,
        method: 'GET'
      }),
      transformResponse: (response: any) => response.data
    })
  })
});

export const { useGetFormSettingsQuery } = formsApi;
