import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';
import { PatientFormValuesData } from '@/uttils/Types';

interface LOGIN_RESPONSE {
  message: string;
  data: PatientFormValuesData;
}
export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Patient'],
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: (filters) => ({
        url: '/resource/Patient?fields=["*"]&limit_page_length=0',
        params: {
          fields: '["*"]',
          filters
        },
        method: 'GET'
      }),
      transformResponse: (response: any) => response.data
    }),
    CreatePatient: builder.mutation({
      query: (payload) => ({
        url: '/method/addiwise.apis.customer.create_patient',
        method: 'POST',
        body: payload
      }),
      transformResponse: (response: LOGIN_RESPONSE) => response.message
    }),
    GetPatientList: builder.query({
      query: (payload) => ({
        url: '/method/addiwise.apis.customer.get_patients_by_customer',
        method: 'GET'

      }),
      transformResponse: (response: any) => response.message.data

    }),
  })
});

export const { useLazyGetPatientsQuery, useCreatePatientMutation, useGetPatientListQuery } = patientApi;
