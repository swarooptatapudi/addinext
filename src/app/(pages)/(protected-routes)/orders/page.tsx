'use client';
import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/app/common/DataTable';
import { useGetOrdersQuery, useGetOrderDetailsMutation } from '@/rtk-query/apis/orders';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type Order = {
  order_id: string;
  customer: string;
  clinic_name: string | null;
  patient_name: string;
  device_type: string;
  order_date: string;
  delivery_date: string;
  order_value: number;
  status: string;
  symbol?:string;
};
interface OrderParams {
  orderId: string;
  deviceType: string;
}

export default function Orders(): React.JSX.Element {
  const { data, isLoading, error } = useGetOrdersQuery('');
  const [getOrderDetails, { isLoading: isPaymentLoading }] = useGetOrderDetailsMutation();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const router = useRouter();

  // Verify environment variable is available
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!razorpayKey && typeof window !== 'undefined') {
    console.error('Razorpay key is missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.');
  }

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          setIsRazorpayLoaded(true);
        };
        
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          setIsRazorpayLoaded(false);
          toast.error('Failed to load payment gateway. Please refresh the page.');
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading Razorpay:', err);
        setIsRazorpayLoaded(false);
      }
    };

    loadRazorpayScript();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleView = async (order: Order) => {
    if (!razorpayKey) {
      toast.error('Payment gateway configuration error. Please contact support.');
      return;
    }

    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is still loading. Please try again shortly.');
      return;
    }

    try {
      toast.info('Processing payment...');
      
      const payload = {
        order_id: order.order_id,
        order_type: order.device_type
      };

      const response = await getOrderDetails(payload).unwrap();

      if (!response?.data?.order_id) {
        throw new Error('Invalid order details received');
      }

      const orderAmount = response.data.order_amount;
      if (!orderAmount || isNaN(orderAmount)) {
        throw new Error('Invalid order amount');
      }

      // Convert amount to paise (Razorpay expects amount in smallest currency unit)
      const amountInPaise = Math.round(orderAmount * 100);

      const options = {
        key: razorpayKey,
        amount: amountInPaise.toString(),
        currency: 'INR',
        name: 'Addiwise Company',
        description: `Payment for Order ${response.data.so_order_id || order.order_id}`,
        // order_id: response.data.order_id,
        handler: async function(razorpayResponse: any) {
          try {
            // Here you would typically verify the payment on your backend
            toast.success('Payment successful!');
            // You might want to refetch orders or update the status locally
          } catch (err) {
            toast.error('Payment verification failed');
            console.error('Verification error:', err);
          }
        },
        prefill: {
          name: response.data.customer || '',
          email: response.data.email || '',
          contact: response.data.mobile_no || ''
        },
        notes: {
          order_type: response.data.order_type,
          order_value: response.data.order_value,
          internal_order_id: order.order_id
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        console.error('Payment failed:', response.error);
      });

      rzp.open();

    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleOrderIdClick = (order:Order) => {
    const payload = {
      order_id: order.order_id,
      order_type: order.device_type
    };

    if (order.device_type === 'BK Orders') {
      router.push(`/orders/new-order/BK?${new URLSearchParams({
        orderId: order.order_id,
        deviceType: order.device_type
      }).toString()}`);
      router.push(`/orders/new-order/BK?${new URLSearchParams({
        orderId: order.order_id,
        deviceType: order.device_type
      }).toString()}`);
    }if (order.device_type === 'AK Orders') {
    }
    else {
      console.log('Unknown device type:',order.device_type);
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'order_id',
      header: 'Order ID',
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:underline hover:text-blue-500"
          onClick={() => handleOrderIdClick(row.original)}
        >
          {row.original.order_id}
        </span>
      ),
    },
    {
      accessorKey: 'patient_name',
      header: 'Patient Name',
      cell: ({ row }) => row.original.patient_name || '-',
    },
    {
      accessorKey: 'device_type',
      header: 'Device Type',
    },
    {
      accessorKey: 'order_date',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString(),
    },
    {
      accessorKey: 'order_value',
      header: 'Order Value',
      cell: ({ row }) => `${row.original.symbol}${row.original.order_value.toFixed(2)}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusClasses = {
          Draft: 'bg-yellow-100 text-yellow-800',
          Completed: 'bg-green-100 text-green-800',
          Paid: 'bg-blue-100 text-blue-800',
          Cancelled: 'bg-red-100 text-red-800',
          default: 'bg-gray-100 text-gray-800'
        };
        
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              statusClasses[status as keyof typeof statusClasses] || statusClasses.default
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original;
        const isDisabled = order.status === 'Completed' || order.status === 'Paid';
        
        return (
          <div className="flex space-x-">
            <Button
              size="sm"
              disabled={isDisabled || isPaymentLoading || !razorpayKey}
              className="bg-primary hover:bg-primary/90 text-white shadow-md "
              onClick={() => handleView(order)}
            >
              {isPaymentLoading ? 'Processing...' : 'Pay'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className='ml-2'
              disabled={order.status !== 'Paid'}
              onClick={() => {
                router.push(`/orders/design/${order.order_id}`);
              }}
            >
              Design
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
        {!razorpayKey && (
          <div className="mt-2 p-2 bg-red-100 rounded">
            Additional error: Razorpay payment key is not configured properly.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        {!razorpayKey && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            Warning: Payment gateway is not properly configured
          </div>
        )}
      </div>
      
      <DataTable
        columns={columns}
        data={data?.data?.sales_orders || []}
      />
    </div>
  );
}

// 'use client';
// import React from 'react';
// import { ColumnDef } from '@tanstack/react-table';
// import { DataTable } from '@/components/app/common/DataTable';
// import { useGetOrdersQuery, useGetOrderDetailsMutation } from '@/rtk-query/apis/orders';
// import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import Razorpay from 'razorpay';

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// export type Order = {
//   order_id: string;
//   customer: string;
//   clinic_name: string | null;
//   patient_name: string;
//   device_type: string;
//   order_date: string;
//   delivery_date: string;
//   order_value: number;
//   status: string;
//   // order_amount:string;
// };

// export default function Orders(): React.JSX.Element {
//   const { data } = useGetOrdersQuery('');
//   const [getOrderDetails] = useGetOrderDetailsMutation();
//   const router = useRouter();

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => {
//         resolve(true);
//       };
//       script.onerror = () => {
//         resolve(false);
//       };
//       document.body.appendChild(script);
//     });
//   };
  
//   const handleView = async (order: Order) => {
//     const isScriptLoaded = await loadRazorpayScript();
//           if (!isScriptLoaded) {
//             toast.error('Failed to load payment gateway');
//             return;
//           }
//     try {
//       const payload={
//         order_id:order.order_id,
//         order_type:order.device_type
//       }
//       const response = await getOrderDetails(payload).unwrap();
//       if(response){
//          // Set up Razorpay options
//               const options = {
//                 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
//                 amount:response?.data?.order_amount ||0,
//                 // amount:(buyQuantity * applyRate *100).toString(), 
//                 currency: 'INR',
//                 name: 'addiwise company',
//                 description: `Purchase of order ${response?.data?.so_order_id} ${response?.data?.order_type} `,
//                 order_id:response?.data?.order_id,
//                 // image: '/your-company-logo.png',
//                 app_name:'addiwise customer portal',
//                 handler: async function(response: any) {
//                   try {
//                     // const payload = {
//                     //   buy_coin: buyQuantity,
//                     //   plan: currentPlan,
//                     //   payment_id: response.razorpay_payment_id,
//                     //   amount:(buyQuantity * applyRate).toString()
        
//                     // };
                    
//                     // const result = await buyAddiNxtCoin(payload).unwrap();
//                     toast.success('Coins purchased successfully!');
//                     // refetchTransactions(); 
//                     // if (result.success) {
//                     //   toast.success('Payment and coin purchase successful!');
//                     //   refetchTransactions();
//                     // } else {
//                     //   toast.error(result.message || 'Failed to update coins');
//                     // }
//                   } catch (err) {
//                     toast.error('Payment verification failed');
//                     console.error('Verification error:', err);
//                   }
//                 },
//                 prefill: {
//                   name:response?.data?.customer||'',
//                   email:response?.data?.email ||'',
//                   contact:response?.data?.mobile_no ||''
//                 },
                 
//                 notes: {
//                   order_type: response?.data?.order_type,
//                   order_value: response?.data?.order_value,
//                 },
//                 theme: {
//                   color: '#3399cc',
//                 },
//               };
//               // Open Razorpay payment modal
//               const rzp = new window.Razorpay(options);
//               rzp.open();
//                 rzp.on('payment.failed', function(response: any) {
//                       toast.error('Payment failed. Please try again.');
//                       console.error('Payment failed:', response.error);
//                     });
              
//       }


//     } catch (error) {
//       console.error('Failed to fetch order details:', error);
//     }
//   };

//   const handleOrderIdClick = (orderId: string) => {
//     // Handle order ID click logic here
//   };

//   const columns: ColumnDef<Order>[] = [
//     {
//       accessorKey: 'order_id',
//       header: 'Order ID',
//       cell: ({ row }) => (
//         <span
//           className="cursor-pointer hover:underline hover:text-blue-500"
//           onClick={() => handleOrderIdClick(row.original.order_id)}
//         >
//           {row.original.order_id}
//         </span>
//       ),
//     },
//     {
//       accessorKey: 'patient_name',
//       header: 'Patient Name',
//       cell: ({ row }) => row.original.patient_name || '-',
//     },
//     {
//       accessorKey: 'device_type',
//       header: 'Device Type',
//     },
//     {
//       accessorKey: 'order_date',
//       header: 'Order Date',
//     },
//     {
//       accessorKey: 'order_value',
//       header: 'Order Value',
//       cell: ({ row }) => `$${row.original.order_value.toFixed(2)}`,
//     },
//     {
//       id: 'status',
//       header: 'Status',
//       cell: ({ row }) => {
//         const status = row.original.status;
//         return (
//           <span
//             className={`px-2 py-1 rounded-full text-xs ${
//               status === 'Draft'
//                 ? 'bg-yellow-100 text-yellow-800'
//                 : status === 'Completed'
//                 ? 'bg-green-100 text-green-800'
//                 : 'bg-gray-100 text-gray-800'
//             }`}
//           >
//             {status}
//           </span>
//         );
//       },
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       cell: ({ row }) => {
//         const order = row.original;
//         return (
//           <>
//             <Button
//               size="sm"
//               className="mr-2 bg-gradient-to-r bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
//               onClick={() => handleView(order)}
//             >
//               Pay
//             </Button>
//             <Button
//               disabled
//               size="sm"
//               className="mr-2 bg-gradient-to-r bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
//               onClick={() => handleView(order)}
//             >
//               Design
//             </Button>
//           </>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="p-4">
//       <DataTable
//         columns={columns}
//         data={data?.data?.sales_orders || []}
//       />
//     </div>
//   );
// }

//=================================================================================
// 'use client';
// import React from 'react';
// import { ColumnDef } from '@tanstack/react-table';
// import { DataTable } from '@/components/app/common/DataTable';
// import { useGetOrdersQuery } from '@/rtk-query/apis/orders';
// import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';

// export type Order = {
//   order_id: string;
//   customer: string;
//   clinic_name: string | null;
//   patient_name: string;
//   device_type: string;
//   order_date: string;
//   delivery_date: string;
//   order_value: number;
//   status: string;
// };

// export default function Orders(): React.JSX.Element {
//   const { data } = useGetOrdersQuery('');
//   const router = useRouter();

//   const handleView = (order: Order) => {
//     router.push(`/orders/new-order/${order.order_id}`);
//   };

//   const handleOrderIdClick = (orderId: string) => {
//     // Handle order ID click logic here
//   };

//   const columns: ColumnDef<Order>[] = [
//     {
//       accessorKey: 'order_id',
//       header: 'Order ID',
//       cell: ({ row }) => (
//         <span
//           className="cursor-pointer hover:underline hover:text-blue-500"
//           onClick={() => handleOrderIdClick(row.original.order_id)}
//         >
//           {row.original.order_id}
//         </span>
//       ),
//     },
//     {
//       accessorKey: 'patient_name',
//       header: 'Patient Name',
//        cell: ({ row }) => row.original.patient_name || '-',
//     },
//     {
//       accessorKey: 'device_type',
//       header: 'Device Type',
//     },
//     {
//       accessorKey: 'order_date',
//       header: 'Order Date',
//     },
//     {
//       accessorKey: 'order_value',
//       header: 'Order Value',
//       cell: ({ row }) => `${row.original.order_value.toFixed(2)}`,
//     },
//     {
//       id: 'status',
//       header: 'Status',
//       cell: ({ row }) => {
//         const status = row.original.status;
//         return (
//           <span
//             className={`px-2 py-1 rounded-full text-xs ${
//               status === 'Draft'
//                 ? 'bg-yellow-100 text-yellow-800'
//                 : status === 'Completed'
//                 ? 'bg-green-100 text-green-800'
//                 : 'bg-gray-100 text-gray-800'
//             }`}
//           >
//             {status}
//           </span>
//         );
//       },
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       cell: ({ row }) => {
//         const order = row.original;
//         return (
//           <>
//             <Button
//               size="sm"
//               className="mr-2 bg-gradient-to-r bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
//               onClick={() => handleView(order)}
//             >
//               Pay
//             </Button>
//             <Button
//             disabled
//               size="sm"
//               className="mr-2 bg-gradient-to-r bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
//               onClick={() => handleView(order)}
//             >
//               Design
//             </Button>
//           </>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="p-4">
//       <DataTable
//         columns={columns}
//         data={data?.data?.sales_orders || []}
//       />
//     </div>
//   );
// }
