import { createApi } from '@reduxjs/toolkit/query/react';
import { USER } from '@/uttils/Types';
import baseQueryWithReauth from '../base/baseQueryReAuth';

interface LOGIN_RESPONSE {
  message: string;
  data: USER;
}

interface FILE_UPLOAD_RESPONSE {
  message: {
    name: string;
    owner: string;
    creation: string;
    modified: string;
    modified_by: string;
    docstatus: number;
    idx: number;
    file_name: string;
    is_private: number;
    file_type: string;
    is_home_folder: number;
    is_attachments_folder: number;
    file_size: number;
    file_url: string;
    folder: string;
    is_folder: number;
    content_hash: string;
    uploaded_to_dropbox: number;
    uploaded_to_google_drive: number;
    doctype: string;
  };
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
    }),
    uploadFile: builder.mutation<FILE_UPLOAD_RESPONSE, { formData: FormData; folder?: string }>({
      query: ({ formData, folder }) => ({
        url: '/method/upload_file',
        method: 'POST',
        body: formData,
        // If your API expects folder as a query parameter instead:
        // params: { folder },
        headers: {
          // If needed, add other headers here
        },
      }),
      transformResponse: (response: FILE_UPLOAD_RESPONSE) => response
    }),
    uploadUserProfile: builder.mutation<any, { file_url: string }>({
      query: (payload) => ({
        url: '/method/addiwise.apis.customer.user_profile_upload',
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: any) => response
    }),
  })
});

export const { 
  useLoginMutation, 
  useLazyLogoutQuery, 
  useLazyGetUserDetailsQuery,
  useUploadFileMutation,
  useUploadUserProfileMutation 
} = authApi;