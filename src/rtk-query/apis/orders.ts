// import { createApi } from '@reduxjs/toolkit/query/react';
// import baseQueryWithReauth from '../base/baseQueryReAuth';

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

interface SalesOrdersResponse {
  message: string;
  data: {
    time: string;
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
    getOrders: builder.query({
      query: () => ({
        url: `/method/addiwise.apis.order.get_sales_order`,
        method: 'GET'
      }),
      transformResponse: (response: SalesOrdersResponse) => response
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
  useGetINEstimateMutation,
} = ordersApi;
export type OrderData = SalesOrder | SalesOrderDetails;