import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Patient'],
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: (filters) => ({
        url: '/resource/Patient',
        params: {
          fields: '["*"]',
          filters
        },
        method: 'GET'
      }),
      transformResponse: (response: any) => response.data
    })
  })
});

export const { useLazyGetPatientsQuery } = patientApi;
