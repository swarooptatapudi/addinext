// import { createApi } from '@reduxjs/toolkit/query/react';
// import baseQueryWithReauth from '../base/baseQueryReAuth';
// at top of file with other imports:
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { QueryReturnValue } from '@reduxjs/toolkit/query/react';

// ---- helper: try multiple RPCs in order, return first non-417 ----
async function tryRpcInOrder(
  baseQuery: (arg: string | FetchArgs) => Promise<QueryReturnValue<unknown, FetchBaseQueryError, unknown>>,
  attempts: Array<{ url: string; method: 'POST' | 'GET'; body?: any }>
): Promise<QueryReturnValue<unknown, FetchBaseQueryError, unknown>> {
  let last: QueryReturnValue<unknown, FetchBaseQueryError, unknown> | undefined;

  for (const req of attempts) {
    const res = await baseQuery({ url: req.url, method: req.method, body: req.body });
    // success: return immediately
    if (!('error' in res) || !res.error) return res;

    // If it's NOT the "method not found" 417, also return immediately
    if ((res.error as any)?.status !== 417) return res;

    // keep the 417 to return if everything fails
    last = res;
  }
  // if all attempts failed with 417, return the last one
  return last as QueryReturnValue<unknown, FetchBaseQueryError, unknown>;
}

// interface SalesOrder {
//   order_id: string;
//   customer: string;
//   clinic_name: null | string;
//   patient_name: string;
//   device_type: string;
//   order_date: string;
//   delivery_date: string;
//   order_value: number;
//   status: string;
// }

// interface SalesOrderDetails {
//   // Define the structure based on your API response
//   // Example fields - adjust according to actual response
//   order_id: string;
//   customer: string;
//   patient_details: {
//     name: string;
//     age: number;
//     gender: string;
//   };
//   items: Array<{
//     item_code: string;
//     description: string;
//     quantity: number;
//     rate: number;
//     amount: number;
//   }>;
//   total_amount: number;
//   discount: number;
//   tax: number;
//   grand_total: number;
//   status: string;
//   // Add other fields as needed
// }

// interface SalesOrdersResponse {
//   message: string;
//   data: {
//     time: string;
//     sales_orders: SalesOrder[];
//   };
// }

// interface SalesOrderDetailsResponse {
//   message: string;
//   data: SalesOrderDetails;
// }


// // interface UpdateSalesOrderDetailsRequest {
// //   order_type: string;
// //   order_id: string;
// //   custom_payment_reference_id?: string;
// //   payment_status: string// optional field
// // }
// interface BKEstimateRequest {
//   item_code: string;
//   design_by: string;
//   print_by: string;
//   laticess: string;
//   finish: string;
//   discount_per: number;
//   discount_amt: number;
// }

// interface BKEstimateResponse {
//   message: string;
//   data: {
//     design: number;
//     print: number;
//     laticess: number;
//     finish: number;
//     estimate_price: number;
//     item_discount: number;
//     additional_discount: number;
//     discounted_price: number;
//     discounted_price_18: number;
//     discounted_price_5: number;
//     gst_18: number;
//     gst_5: number;
//     total_price: number;
//   };
// }

// interface CouponRequest {
//   coupon_code: string;
// }

// interface CouponResponse {
//   message: string;
//   data: {
//     coupon_name: string;
//     coupon_code: string;
//     valid_from: string;
//     valid_upto: string;
//     rate_or_discount: string;
//     discount_percentage: number;
//     discount_amount: number;
//   };
// }

// interface GetSalesOrderDetailsRequest {
//   order_type: string;
//   order_id: string;
// }



// export const ordersApi = createApi({
//   reducerPath: 'ordersApi',
//   baseQuery: baseQueryWithReauth,
//   tagTypes: ['Orders'],
//   endpoints: (builder) => ({
//     createOrder: builder.mutation({
//       query: (data) => {
//         return {
//           url: '/method/addiwise.apis.order_types.bk_order.create_bk_order',
//           method: 'POST',
//           body: data,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         };
//       },
//     }),
//     getOrders: builder.query<SalesOrdersResponse, void>({
//       query: () => ({
//         url: `/method/addiwise.apis.order.get_sales_order`,
//         method: 'GET'
//       }),
//       providesTags: ['Orders']
//     }),
//     getOrderDetails: builder.mutation<any, GetSalesOrderDetailsRequest>({
//       query: (data) => ({
//         url: '/method/addiwise.apis.order.get_sales_order_details',
//         method: 'POST',
//         body: data
//       }),

//       transformResponse: (response: any) => response
//     }),
//     getBKEstimate: builder.mutation<BKEstimateResponse, BKEstimateRequest>({
//       query: (data) => ({
//         url: '/method/addiwise.apis.order_types.bk_order.get_bk_estimate',
//         method: 'POST',
//         body: data
//       }),
//       transformResponse: (response: BKEstimateResponse) => response
//     }),
//     validateCoupon: builder.mutation<CouponResponse, CouponRequest>({
//       query: (data) => ({
//         url: '/method/addiwise.apis.utils.coupon_code',
//         method: 'POST',
//         body: data,
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       }),
//       transformResponse: (response: CouponResponse) => response,
//     }),
//     getOrderDetailIds: builder.mutation<any, SalesOrderDetails>({
//       query: (data) => ({
//         url: '/method/addiwise.apis.order.update_sales_order_details',
//         method: 'POST',
//         body: data
//       })
//     }),
//     // updateSalesOrderDetails: builder.mutation<any, UpdateSalesOrderDetailsRequest>({
//     //   query: (data) => ({
//     //     url: '/method/addiwise.apis.order.update_sales_order_details',
//     //     method: 'POST',
//     //     body: data,
//     //   }),
//     // }),
//   })
// });

// export const {
//   useCreateOrderMutation,
//   useGetOrdersQuery,
//   useGetOrderDetailsMutation,
//   useGetBKEstimateMutation,
//   useValidateCouponMutation,
//   useGetOrderDetailIdsMutation,
//   // useUpdateSalesOrderDetailsMutation,
// } = ordersApi;
// export type OrderData = SalesOrder | SalesOrderDetails;



import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../base/baseQueryReAuth';
import { estimateOrderClientSide } from '@/uttils/getEstimate';

interface SalesOrder {
  order_id: string;
  customer: string;
  clinic_name: null | string;
  patient_name: string;
  device_type: string;
  order_date: string;
  delivery_date: string;
  order_value: number;
  status: string;
}

interface SalesOrderDetails {
  // Define the structure based on your API response
  // Example fields - adjust according to actual response
  order_id: string;
  customer: string;
  patient_details: {
    name: string;
    age: number;
    gender: string;
  };
  items: Array<{
    item_code: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  total_amount: number;
  discount: number;
  tax: number;
  grand_total: number;
  status: string;
  // Add other fields as needed
}

// interface SalesOrdersResponse {
//   message: string;
//   data: {
//     time: string;
//     sales_orders: SalesOrder[];
//   };
// }
export interface SalesOrdersResponse {
  message: string;
  data: {
    time: string;
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    sales_orders: SalesOrder[];
  };
}

interface SalesOrderDetailsResponse {
  message: string;
  data: SalesOrderDetails;
}

interface BKEstimateRequest {
  item_code: string;

  design_by: string;
  print_by: string;
  laticess: string;
  finish: string;
  discount_per: number;
  discount_amt: number;
}
interface INEstimateRequest {
  item_code: string;
  design_by: string;
  print_by: string;
  discount_per: number;
  discount_amt: number;
  coupon_code?: string;
}
interface ASPEstimateData {
  design: string;
  print: string;
  estimate_price: string;
  item_standard_discount: string;
  item_special_discount: string;
  additional_discount: string;
  discounted_price: string;
  gst_5: string;
  gst_18: string;
  total_price: string;
  customer_available_coins?: string;
  design_coin_use?: string;
}

interface ASPEstimateResponse {
  message: string;
  data: ASPEstimateData;
}

interface CHEstimateRequest {
  item_code: string;
  design_by: string;
  print_by: string;
  discount_per: number;
  discount_amt: number;
  coupon_code?: string;
}
interface CHEstimateResponse {
  message: {
    status: number;
    message: string;
    data: {
      item_standard_discount: string;
      design: string;
      print: string;
      estimate_price: string;
      item_discount: string;
      additional_discount: string;
      discounted_price: string;
      discounted_price_18: string;
      discounted_price_5: string;
      gst_18: string;
      gst_5: string;
      total_price: string;
      customer_available_coins: string;
      design_coin_use: string;
    };
  };
}
interface BKEstimateResponse {
  message: string;
  data: {
    total_distcounted_price: any;
    item_standard_discount: string;
    design: number;
    print: number;
    laticess: number;
    finish: number;
    estimate_price: number;
    item_discount: number;
    additional_discount: number;
    discounted_price: number;
    discounted_price_18: number;
    discounted_price_5: number;
    gst_18: number;
    gst_5: number;
    total_price: number;
  };
}
interface INEstimateResponse {
  message: {
    status: number;
    message: string;
    data: {
      item_standard_discount: string;
      design: string;
      print: string;
      estimate_price: string;
      item_discount: string;
      additional_discount: string;
      discounted_price: string;
      discounted_price_18: string;
      discounted_price_5: string;
      gst_18: string;
      gst_5: string;
      total_price: string;
      customer_available_coins: string;
      design_coin_use: string;
    };
  };
}

interface CouponRequest {
  coupon_code: string;
}

interface CouponResponse {
  message: string;
  data: {
    coupon_name: string;
    coupon_code: string;
    valid_from: string;
    valid_upto: string;
    rate_or_discount: string;
    discount_percentage: number;
    discount_amount: number;
  };
}

interface GetSalesOrderDetailsRequest {
  order_type: string;
  order_id: string;
}
const isFormData = (v: unknown): v is FormData =>
  typeof FormData !== 'undefined' && v instanceof FormData;

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.bk_order.create_bk_order',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        // console.log("create_bk_order", response);
        return response;
      }
    }),
    createInsoleOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.insole_order.create_insole_order',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        // console.log("create_bk_order", response);
        return response;
      }
    }),
    createAfoOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.afo_order.create_afo_order',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        // console.log("create_bk_order", response);
        return response;
      }
    }),
    // ----------------------
    // CREATE CRANIAL ORDER (same style as createInsoleOrder)
    createCranialOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.cranial_helmet_order.create_cranial_order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        return response;
      },
    }),
    createASPOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.addishield_pro_orders.create_addishield_pro_order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        return response;
      },
    }),
    getASPEstimate: builder.mutation<ASPEstimateResponse, INEstimateRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.addishield_pro_orders.get_addishield_pro_estimate',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: ASPEstimateResponse) => response
    }),
    createASEPOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.addishield_epipro_orders.create_addishield_epipro_order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        return response;
      },
    }),
    getASEPEstimate: builder.mutation<ASPEstimateResponse, INEstimateRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.addishield_epipro_orders.get_addishield_epipro_estimate',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: ASPEstimateResponse) => response
    }),
    createASEPAOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.addishield_epipro_active_orders.create_addishield_epipro_active_order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        return response;
      },
    }),
    getASEPAEstimate: builder.mutation<ASPEstimateResponse, INEstimateRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.addishield_epipro_active_orders.get_addishield_epipro_active_estimate',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: ASPEstimateResponse) => response
    }),
    // ----------------------
    // CRANIAL ESTIMATE
    // ----------------------
    // getCHEstimate: builder.mutation<
    //   any,
    //   { item_code: string; design_by: string; print_by: string; discount_per: number; discount_amt: number; coupon_code?: string }
    // >({
    //   /** Try both known RPC paths; there is no /resource fallback for estimates. */
    //   async queryFn(arg, _api, _extra, baseQuery) {
    //     const res = await tryRpcInOrder(baseQuery as any, [
    //       { url: '/method/addiwise.apis.order_types.ch_order.get_ch_estimate', method: 'POST', body: arg },
    //       { url: '/method/addiwise.apis.order_types.cranial_helmet_order.get_ch_estimate', method: 'POST', body: arg },
    //       { url: '/resource/Cranial%20Helmet%20Orders', method: 'POST', body: arg },
    //     ]);
    //     if ('error' in res && res.error) return { error: res.error };
    //     return { data: (res.data as any) ?? res };
    //   },
    // }),
    getCHEstimate: builder.mutation<CHEstimateResponse, CHEstimateRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.cranial_helmet_order.get_che_estimate',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: CHEstimateResponse) => response
    }),
    //     getOrders: builder.query<SalesOrdersResponse, { page: number; page_size: number }>({
    //   query: ({ page, page_size }) => ({
    //     url: `/method/addiwise.apis.order.get_sales_order?page=${page}&page_size=${page_size}`,
    //     method: 'GET'
    //   }),
    //   transformResponse: (response: SalesOrdersResponse) => response,
    // }),
    getOrders: builder.query<
      SalesOrdersResponse, // API response type
      { page: number; page_size: number } // Query args
    >({
      query: ({ page, page_size }) => ({
        url: `/method/addiwise.apis.order.get_sales_order?page=${page}&page_size=${page_size}`,
        method: 'GET',
      }),
      transformResponse: (response: SalesOrdersResponse) => response,
    }),


    getOrderDetails: builder.mutation<any, GetSalesOrderDetailsRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order.get_sales_order_details',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: any) => response
    }),
    getBKEstimate: builder.mutation<BKEstimateResponse, BKEstimateRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.bk_order.get_bk_estimate',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: BKEstimateResponse) => response
    }),
    getINEstimate: builder.mutation<INEstimateResponse, INEstimateRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.insole_order.get_insole_estimate',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: INEstimateResponse) => response
    }),
    validateCoupon: builder.mutation<CouponResponse, CouponRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.utils.coupon_code',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      transformResponse: (response: CouponResponse) => response,
    }),
    getOrderDetailIds: builder.mutation<any, GetSalesOrderDetailsRequest>({
      query: (data) => ({
        url: '/method/addiwise.apis.order.update_sales_order_details',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: any) => response
    }),
    createProductOrder: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.order_types.bk_order.create_sales_order_for_off_the_shelf',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: SalesOrdersResponse) => {
        // console.log("create_bk_order", response);
        return response;
      }
    }),

    preSignedUrl: builder.mutation({
      query: (data) => ({
        url: '/method/addiwise.apis.utils.generate_presigned_url',
        method: 'POST',
        body: data
      }),
      transformResponse: (response) => {
        // console.log("create_bk_order", response);
        return response;
      }
    }),
  })
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderDetailsMutation,
  useGetBKEstimateMutation,
  useValidateCouponMutation,
  useGetOrderDetailIdsMutation,
  useCreateProductOrderMutation,
  useCreateInsoleOrderMutation,
  useCreateAfoOrderMutation,
  useCreateCranialOrderMutation,
  useGetCHEstimateMutation,
  useGetINEstimateMutation,
  usePreSignedUrlMutation,
  useGetASPEstimateMutation,
  useCreateASPOrderMutation,
  useGetASEPEstimateMutation,
  useCreateASEPOrderMutation,
  useGetASEPAEstimateMutation,
  useCreateASEPAOrderMutation
} = ordersApi;
export type OrderData = SalesOrder | SalesOrderDetails;


