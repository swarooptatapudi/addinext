import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';


type Response = {
  message: {
    status: string;
    data: any;
  };
};

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query({
      query: () => ({
        url: '/method/addiwise.apis.addiwise_subscription_settings.get_subscription_details',
        method: 'GET'
      }),
      transformResponse: (response: Response) => response.message
    }),
    getSubscriptionPlan: builder.query({
      query: (plan_id) => ({
        url: '/resource/AddiNxT Subscription/' + plan_id,
        method: 'GET'
      }),
      transformResponse: (response: any) => response.data
    }),
    paymentInit: builder.mutation({
      query: (payload) => ({
        url: '/method/addiwise.apis.payment.customer_subscription.initiate_payment_process_request',
        method: 'POST',
        body: { payload }
      }),
      transformResponse: (response: any) => response.message
    }),
    subscribePlan: builder.mutation({
      query: (payload) => ({
        url: '/method/addiwise.apis.payment.customer_subscription.update_payment_details',
        method: 'POST',
        body: { payload }
      }),
      transformResponse: (response: any) => response.message
    }),
   getSubscriptionTranscationHistory: builder.query({
  query: ({ customer }) => ({
    url: `/method/addiwise.apis.customer.get_subscription`,
    method: 'GET',
    params: { customer },
  }),
  transformResponse: (response: any) => response?.message?? null,
})

  })
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanQuery,
  usePaymentInitMutation,
  useSubscribePlanMutation,
  useGetSubscriptionTranscationHistoryQuery,
} = subscriptionApi;
// 