'use client';
import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/app/common/DataTable';
import {
  useGetOrdersQuery,
  useGetOrderDetailsMutation,
  // useUpdateSalesOrderDetailsMutation,
  useGetOrderDetailIdsMutation
} from '@/rtk-query/apis/orders';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useHDFCPayment } from '@/hooks/useHDFCPayment';


type SalesInvoice = {
  name: string;
  posting_date: string;
  status: string;
  grand_total: number;
  pdf_url: string;
  payments: {
    name: string;
    posting_date: string;
    status: string;
    paid_amount: number;
    pdf_url: string;
  }[];
};

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
  order_type?: string;
  symbol?: string;
  custom_payment_reference_id?: string;
  sales_invoices: SalesInvoice[];
};

export default function Orders(): React.JSX.Element {
  // const { data, isLoading, error, refetch } = useGetOrdersQuery('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useGetOrdersQuery({ page, page_size: pageSize });

  const orders = data?.data.sales_orders ?? [];
  const totalPages = data?.data.total_pages ?? 1;

  // console.log("salesorderdetails", data)
  const [getOrderDetails, { isLoading: isPaymentLoading }] =
    useGetOrderDetailsMutation();
  const [getOrderDetailIds] = useGetOrderDetailIdsMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'order_date', desc: true },
  ]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const deviceType = searchParams.get("deviceType");

  const router = useRouter();
  // const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  // Add HDFC payment hook
  const { initiatePayment, isLoading: isPaymentLoadingHDFC } = useHDFCPayment();

  // prepare table data
  const tableData: Order[] = (data?.data?.sales_orders || []).map((so: any) => ({
    ...so,
    device_type: so.custom_order_types || '-',
    sales_invoices: so.sales_invoices || [],
  }));
  //   useEffect(() => {
  //   if (data?.data?.total_count) {
  //     setTotalPages(Math.ceil(data.data.total_count / pageSize));
  //   }
  // }, [data, pageSize]);


  // load Razorpay script
  // useEffect(() => {
  //   if (window.Razorpay) {
  //     setIsRazorpayLoaded(true);
  //     return;
  //   }
  //   const script = document.createElement('script');
  //   script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //   script.async = true;
  //   script.onload = () => setIsRazorpayLoaded(true);
  //   script.onerror = () => {
  //     setIsRazorpayLoaded(false);
  //     toast.error('Failed to load payment gateway. Please refresh the page.');
  //   };
  //   document.body.appendChild(script);
  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);

  // helper for order_type
  function getOrderType(order: Order): string {
    if (order.device_type) return order.device_type;
    if (order.order_type) return order.order_type;
    return 'Unknown';
  }

  // ✅ Pay button logic with direct HDFC API
  const handlePayment = async (order: Order) => {
    try {
      const payload = {
        order_id: order.order_id,
        order_type: getOrderType(order),
      };

      const response = await getOrderDetails(payload).unwrap();
      const orderAmount = response.data.order_amount;

      // Direct HDFC payment link creation
      const hdfcPaymentData = {
        "currency": "INR",
        "mobile_country_code": "+91",
        "options": {
          "create_mandate": "REQUIRED"
        },
        "payment_page_client_id": "hdfcmaster",
        "cardsCheckBox": true,
        "otcCheckBox": true,
        "walletCheckBox": true,
        "consumerFinanceCheckBox": true,
        "netbankingCheckBox": true,
        "upiCheckBox": true,
        "amount": orderAmount,
        "customer_email": response.data.email || "ch.kirankumar311@gmail.com",
        "shouldSendMail": true,
        "customer_phone": response.data.mobile_no || "7396192829",
        "shouldSendSMS": true,
        "order_id": order.order_id,
        "return_url": null,
        "offer_details": null,
        "payment_filter": {
          "allowDefaultOptions": true,
          "options": [
            { "paymentMethodType": "UPI", "enable": true },
            { "paymentMethodType": "WALLET", "enable": true },
            { "paymentMethodType": "CARD", "enable": true },
            { "paymentMethodType": "NB", "enable": true },
            { "paymentMethodType": "OTC", "enable": true },
            { "paymentMethodType": "VIRTUAL_ACCOUNT", "enable": false },
            { "paymentMethodType": "CONSUMER_FINANCE", "enable": true }
          ],
          "emiOptions": {
            "standardEmi": { "enable": false, "credit": { "enable": false }, "debit": { "enable": false }, "cardless": { "enable": false } },
            "lowCostEmi": { "enable": false, "credit": { "enable": false }, "debit": { "enable": false }, "cardless": { "enable": false } },
            "noCostEmi": { "enable": false, "credit": { "enable": false }, "debit": { "enable": false }, "cardless": { "enable": false } },
            "showOnlyEmi": false
          }
        },
        "merchant_id": "SG3698"
      };

      console.log('🏦 Creating HDFC Payment Link:', hdfcPaymentData);

      // Call Frappe API endpoint
      const hdfcResponse = await fetch('/api/method/addiwise.apis.hdfc_payment.create_payment_link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hdfcPaymentData)
      });

      if (!hdfcResponse.ok) {
        throw new Error(`HDFC API error: ${hdfcResponse.status}`);
      }

      const result = await hdfcResponse.json();
      console.log('✅ HDFC Payment Link Response:', result);

      if (result && result.payment_url) {
        // Open HDFC payment page in new window
        const paymentWindow = window.open(
          result.payment_url,
          'HDFCPayment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        if (!paymentWindow) {
          toast.error('Please allow popups for payment processing');
          return;
        }

        // Monitor payment window
        const checkPaymentStatus = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkPaymentStatus);

            // After payment window closes, update order status
            setTimeout(async () => {
              try {
                const backendPayload = {
                  order_id: order.order_id,
                  order_type: getOrderType(order),
                  custom_payment_reference_id: `HDFC_${Date.now()}`,
                  payment_status: 'Paid',
                };

                const res = await getOrderDetailIds(backendPayload).unwrap();
                toast.success('Payment Successful');
                refetch();
              } catch (err) {
                toast.error('Payment completed but order update failed');
              }
            }, 2000);
          }
        }, 1000);

      } else {
        throw new Error('Failed to create HDFC payment link');
      }

    } catch (error) {
      console.error('HDFC Payment Error:', error);
      toast.error('Failed to initiate HDFC payment. Please try again.');
    }
  };

  // navigate on order click
  const handleOrderIdClick = (order: Order) => {
    // console.log("order>>>",order);
    setSelectedOrder(order);

    if (order.device_type === "BK Orders") {
      // console.log("BK Orders..>", order.order_id, order.device_type)
      router.push(
        `/orders/new-order/BK?${new URLSearchParams({
          orderId: order.order_id,
          deviceType: order.device_type,
          paid: order.status,
          //  skipValidation: "true"
        }).toString()}`
      );
    }
    else if (order.device_type === "Insole Orders") {
      // console.log("IN Orders..>", order.order_id, order.device_type)
      router.push(
        `/orders/new-order/Insoles?${new URLSearchParams({
          orderId: order.order_id,
          deviceType: order.device_type,
          //  skipValidation: "true"
        }).toString()}`
      );
    }
  };

  // table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'order_id',
      header: 'Order ID',
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:underline hover:text-blue-500"
          onClick={() => {
            // console.log("🟢 Row data clicked:", row.original);
            handleOrderIdClick(row.original);
          }}
        >
          {row.original.order_id}
        </span>
      ),
    },
    {
      accessorKey: 'patient_name',
      header: 'Patient Name',
      cell: ({ row }) => row.original.patient_name || '-'
    },
    {
      accessorKey: 'device_type',
      header: 'Device Type',
      cell: ({ row }) => row.original.device_type || '-'
    },
    {
      accessorKey: 'order_date',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString(),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'order_value',
      header: 'Order Value',
      cell: ({ row }) =>
        `${row.original.symbol || ''}${row.original.order_value.toFixed(2)}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const order = row.original;
        // console.log('Order Status:', order);
        let status = order.status;
        const orderValue = order.order_value || 0;
        // console.log('Order Value:', orderValue);

        if (
          status === 'Draft' &&
          (order.custom_payment_reference_id || order.sales_invoices.length > 0)
        ) {
          status = 'Paid';
        }
        if (orderValue === 0) {
          status = 'Paid';
        }
        const statusClasses = {
          Draft: 'bg-yellow-100 text-yellow-800',
          Completed: 'bg-green-100 text-green-800',
          Paid: 'bg-blue-100 text-blue-800',
          Cancelled: 'bg-red-100 text-red-800',
          default: 'bg-gray-100 text-gray-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${statusClasses[status as keyof typeof statusClasses] ||
              statusClasses.default
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
        // console.log('Order for Actions:', order);
        const isDisabled =
          order.status === 'Completed' || order.status === 'Paid' || order.order_value === 0;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isDisabled || isPaymentLoadingHDFC}
              className="bg-primary hover:bg-primary/90 text-white shadow-md"
              onClick={() => handlePayment(order)}
            >
              {isPaymentLoadingHDFC ? 'Processing...' : 'Pay'}
            </Button>

            <div className="relative group ml-2">
              <Button
                size="sm"
                variant="outline"
                disabled={order.status !== 'Paid'}
                onClick={() => router.push(`/orders/design/${order.order_id}`)}
              >
                Design
              </Button>
            </div>
          </div>
        );

      },
    },
    {
      id: 'invoice',
      header: 'Invoice',
      cell: ({ row }) => {
        const invoices = row.original.sales_invoices;
        if (!invoices.length) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex flex-col gap-1">
            {invoices.map((inv, i) => (
              <a
                key={i}
                href={inv.pdf_url}
                download={'invoice.pdf'}
                className="text-blue-600 underline"
              >
                Invoice PDF
              </a>
            ))}
          </div>
        );
      },
    },
    {
      id: 'receipt',
      header: 'Receipt',
      cell: ({ row }) => {
        const invoices = row.original.sales_invoices;
        if (!invoices.length) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex flex-col gap-1">
            {invoices.map((inv, i) =>
              inv.payments.map((pay, j) => (
                <a
                  key={j}
                  href={pay.pdf_url}
                  download={'Receipt.pdf'}
                  className="text-green-600 underline ml-2"
                >
                  Receipt PDF
                </a>
              ))
            )}
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
        Error loading orders:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by patient name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64 placeholder:text-sm"
        />
      </div>
      <DataTable
        columns={columns}
        data={tableData.filter((order) =>
          (order.patient_name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )}
        sorting={sorting}
        onSortingChange={setSorting}
      />
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((p) => (totalPages ? Math.min(p + 1, totalPages) : p + 1))}
          disabled={totalPages ? page >= totalPages : false}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

    </div>
  );
}


// 'use client';
// import React, { useEffect, useState } from 'react';
// import {
//   ColumnDef,
//   SortingState,
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   flexRender
// } from '@tanstack/react-table';
// import { DataTable } from '@/components/app/common/DataTable';
// import { useGetOrdersQuery, useGetOrderDetailsMutation } from '@/rtk-query/apis/orders';
// import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import OrderSummaryModal from '@/components/app/common/OrderSummaryModal'
// import { OrderData } from '@/rtk-query/apis/orders';

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// interface GetSalesOrderDetailsRequest {
//   order_id: string;
//   order_type: string;
// }

// type SalesInvoice = {
//   name: string;
//   posting_date: string;
//   status: string;
//   grand_total: number;
//   pdf_url: string;
//   payments: {
//     name: string;
//     posting_date: string;
//     status: string;
//     paid_amount: number;
//     pdf_url: string;
//   }[];
// };

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
//   symbol?: string;
//   sales_invoices


//   : SalesInvoice[];
// };

// export default function Orders(): React.JSX.Element {
//   const { data, isLoading, error } = useGetOrdersQuery('OrderData');
//   // console.log("salesdata",data)
//   const [getOrderDetails, { isLoading: isPaymentLoading }] = useGetOrderDetailsMutation();
//   const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sorting, setSorting] = useState<SortingState>([{ id: 'order_date', desc: true }]);
//   const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
//   const [openModal, setOpenModal] = useState(false);




//   const router = useRouter();
//   const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
//   const tableData: Order[] = (data?.data?.sales_orders || []).map((so: any) => ({
//     ...so,
//     device_type: so.custom_order_types || '-',
//     sales_invoices: so.sales_invoices || [] // Ensure property exists
//   }));
//   useEffect(() => {
//     const loadRazorpayScript = async () => {
//       if (window.Razorpay) {
//         setIsRazorpayLoaded(true);
//         return;
//       }
//       try {
//         const script = document.createElement('script');
//         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//         script.async = true;
//         script.onload = () => setIsRazorpayLoaded(true);
//         script.onerror = () => {
//           setIsRazorpayLoaded(false);
//           toast.error('Failed to load payment gateway. Please refresh the page.');
//         };

//         document.body.appendChild(script);
//       } catch (err) {
//         setIsRazorpayLoaded(false);
//       }
//     };

//     loadRazorpayScript();
//   }, []);

//   const handleView = async (order: Order) => {
//     if (!razorpayKey || !isRazorpayLoaded) return;

//     try {
//       const payload = {
//         order_id: order.order_id,
//         order_type: order.device_type
//       };
//       const response = await getOrderDetails(payload).unwrap();
//       console.log("payload orderid", response)
//       const orderAmount = response.data.order_amount;
//       const amountInPaise = Math.round(orderAmount * 100);

//       const options = {
//         key: razorpayKey,
//         amount: amountInPaise.toString(),
//         currency: 'INR',
//         name: 'Addiwise Company',
//         description: `Payment for Order ${response.data.so_order_id || order.order_id}`,
//         handler: function (response: any) {
//           console.log('Payment Success:', response);
//           // For example:
//           // response.razorpay_payment_id
//           // response.razorpay_order_id
//           // response.razorpay_signature
//           toast.success('Payment successful!');
//           // You should send this to your backend to verify the payment signature.
//         },
//         prefill: {
//           name: response.data.customer || '',
//           email: response.data.email || '',
//           contact: response.data.mobile_no || ''
//         },
//         notes: {
//           order_type: response.data.order_type,
//           order_value: response.data.order_value,
//           internal_order_id: order.order_id
//         },
//         theme: { color: '#3399cc' }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.on('payment.failed', (response: any) =>
//         toast.error(`Payment failed: ${response.error.description}`)
//       );
//       rzp.open();
//     } catch (error) {
//       toast.error('Failed to process payment');
//     }
//   };

//   // const handleOrderIdClick = (order: Order) => {
//   //   console.log("Order data on click:", order); 
//   //   if (order.device_type === 'BK Orders') {
//   //     router.push(
//   //       `/orders/new-order/BK?${new URLSearchParams({
//   //         orderId: order.order_id,
//   //         deviceType: order.device_type,
//   //         paid: order.status
//   //       }).toString()}`
//   //     );
//   //   }
//   // };
//   // const handleOrderIdClick = async (order: Order) => {
//   //   try {
//   //     const response = await getOrderDetails({
//   //       order_id: order.order_id,
//   //       order_type: order.device_type, // required by API
//   //     }).unwrap();

//   //     // Cast or map response to OrderData
//   //     setSelectedOrder(response as OrderData);
//   //     setOpenModal(true);
//   //   } catch (err) {
//   //     console.error("Failed to fetch order details", err);
//   //   }
//   // };

//   const handleOrderIdClick = async (order: Order) => {
//     try {
//       // First, call API if you need details
//       const response = await getOrderDetails({
//         order_id: order.order_id,
//         order_type: order.device_type,
//       }).unwrap();
//       console.log("responseorderdetails", response)
//       // Navigate to new route with query params
//       router.push(
//         `/orders/new-order/BK?${new URLSearchParams({
//           orderId: order.order_id,
//           deviceType: order.device_type,
//           paid: order.status,
//         }).toString()}`
//       );

//     } catch (err) {
//       console.error("Failed to fetch order details", err);
//     }
//   };



//   const columns: ColumnDef<Order>[] = [
//     {
//       accessorKey: 'order_id',
//       header: 'Order ID',
//       cell: ({ row }) => (
//         <span
//           className="cursor-pointer hover:underline hover:text-blue-500"
//           onClick={() => handleOrderIdClick(row.original)}
//         >
//           {row.original.order_id}
//         </span>
//       )
//     },
//     //     {
//     //   accessorKey: 'order_id',
//     //   header: 'Order ID',
//     //   cell: ({ row }) => (
//     //     <span
//     //       className="cursor-pointer hover:underline hover:text-blue-500"
//     //       onClick={() => handleOrderIdClick(row.original)}
//     //     >
//     //       {row.original.order_id}
//     //     </span>
//     //   )
//     // },

//     {
//       accessorKey: 'patient_name',
//       header: 'Patient Name',
//       cell: ({ row }) => row.original.patient_name || '-'
//     },
//     {
//       accessorKey: 'device_type',
//       header: 'Device Type',
//       cell: ({ row }) => row.original.device_type || '-'
//     },
//     {
//       accessorKey: 'order_date',
//       header: ({ column }) => {
//         const getSortIcon = () => '/assets/order-forms/icons/sort-up-down.svg';
//         const isSorted = column.getIsSorted();
//         const rotationClass =
//           isSorted === 'asc'
//             ? 'rotate-180 transition-transform duration-300'
//             : 'rotate-0 transition-transform duration-300';

//         return (
//           <button
//             onClick={() => column.toggleSorting(isSorted === 'desc' ? false : true)}
//             className="flex justify-between items-center w-full"
//           >
//             <span>Order Date</span>
//             <img src={getSortIcon()} alt="sort icon" className={`w-4 h-4 ml-1 ${rotationClass}`} />
//           </button>
//         );
//       },
//       cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString(),
//       sortingFn: 'datetime',
//       enableSorting: true
//     },
//     {
//       accessorKey: 'order_value',
//       header: 'Order Value',
//       cell: ({ row }) => `${row.original.symbol}${row.original.order_value.toFixed(2)}`
//     },
//     {
//       id: 'status',
//       header: 'Status',
//       cell: ({ row }) => {
//         const status = row.original.status;
//         const statusClasses = {
//           Draft: 'bg-yellow-100 text-yellow-800',
//           Completed: 'bg-green-100 text-green-800',
//           Paid: 'bg-blue-100 text-blue-800',
//           Cancelled: 'bg-red-100 text-red-800',
//           default: 'bg-gray-100 text-gray-800'
//         };
//         return (
//           <span
//             className={`px-2 py-1 rounded-full text-xs ${statusClasses[status as keyof typeof statusClasses] || statusClasses.default}`}
//           >
//             {status}
//           </span>
//         );
//       }
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       cell: ({ row }) => {
//         const order = row.original;
//         const isDisabled = order.status === 'Completed' || order.status === 'Paid';

//         return (
//           <div className="flex space-x-">
//             <Button
//               size="sm"
//               disabled={isDisabled || isPaymentLoading || !razorpayKey}
//               className="bg-primary hover:bg-primary/90 text-white shadow-md"
//               onClick={() => handleView(order)}
//             >
//               {isPaymentLoading ? 'Processing...' : 'Pay'}
//             </Button>
//             <div className="relative group ml-2">
//               <Button
//                 size="sm"
//                 variant="outline"
//                 disabled={order.status !== 'Paid'}
//                 onClick={() => router.push(`/orders/design/${order.order_id}`)}
//               >
//                 Design
//               </Button>

//               {order.status !== 'Paid' && (
//                 <></>
//               )}
//             </div>
//           </div>
//         );
//       }
//     },
//     {
//       id: 'invoice',
//       header: 'Invoice',
//       cell: ({ row }) => {
//         const invoices = row.original.sales_invoices;
//         if (!invoices.length) return <span className="text-gray-400">-</span>;

//         return (
//           <div className="flex flex-col gap-1">
//             {invoices.map((inv, i) => (
//               <div key={i}>
//                 <a
//                   href={inv.pdf_url}
//                   download={"invoice.pdf"}
//                   rel="noopener noreferrer"
//                   className="text-blue-600 underline"
//                 >
//                   Invoice PDF
//                 </a>
//                 {/* {inv.payments.map((pay, j) => (
//               <a
//                 key={j}
//                 href={pay.pdf_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-green-600 underline ml-2"
//               >
//                 Payment  PDF
//               </a>
//             ))} */}
//               </div>
//             ))}
//           </div>
//         );
//       },
//     },

//     {
//       id: 'payment-receipt',
//       header: 'Receipt',
//       cell: ({ row }) => {
//         const invoices = row.original.sales_invoices;
//         if (!invoices.length) return <span className="text-gray-400">-</span>;

//         return (
//           <div className="flex flex-col gap-1">
//             {invoices.map((inv, i) => (
//               <div key={i}>
//                 {/* <a
//               href={inv.pdf_url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 underline"
//             >
//               Invoice PDF
//             </a> */}
//                 {inv.payments.map((pay, j) => (
//                   <a
//                     key={j}
//                     href={pay.pdf_url}
//                     download={"Receipt.pdf"}
//                     rel="noopener noreferrer"
//                     className="text-green-600 underline ml-2"
//                   >
//                     Receipt PDF
//                   </a>
//                 ))}
//               </div>
//             ))}
//           </div>
//         );
//       },
//     },
//     // {
//     //   id: 'payment-receipt',
//     //   header: 'Receipt',
//     //   cell: ({ row }) => {
//     //     const order = row.original;
//     //     const isDisabled = order.status === 'Completed' || order.status === 'Paid';

//     //     return (
//     //       <div className="flex space-x-">
//     //         <div className="relative group ml-2"></div>
//     //       </div>
//     //     );
//     //   }
//     // }
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 text-red-500">
//         Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <div className="mb-4 flex justify-between items-center">
//         <input
//           type="text"
//           placeholder="Search by patient name"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border border-gray-300 px-4 py-2 rounded w-64 placeholder:text-sm"
//         />
//         {!razorpayKey && (
//           <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
//             Warning: Payment gateway is not properly configured
//           </div>
//         )}
//       </div>
//       <DataTable
//         columns={columns}
//         data={tableData.filter(order =>
//           (order.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase())
//         )}
//         sorting={sorting}
//         onSortingChange={setSorting}
//       />
//       {/* <DataTable
//         columns={columns}
//         data={(data?.data?.sales_orders || [])
//           .filter((order: Order) =>
//             // Use (order.patient_name || '') to handle null/undefined
//             (order.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase())
//           )
//           .map((order: any) => ({ ...order, device_type: order.custom_order_types || '-' }))}
//         sorting={sorting}
//         onSortingChange={setSorting}
//       /> */}



//     </div>
//   );
// }



