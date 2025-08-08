'use client';
import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';
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
  symbol?: string;
};

export default function Orders(): React.JSX.Element {
  const { data, isLoading, error } = useGetOrdersQuery('');
  const [getOrderDetails, { isLoading: isPaymentLoading }] = useGetOrderDetailsMutation();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'order_date', desc: true }]);

  const router = useRouter();
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

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

        script.onload = () => setIsRazorpayLoaded(true);
        script.onerror = () => {
          setIsRazorpayLoaded(false);
          toast.error('Failed to load payment gateway. Please refresh the page.');
        };

        document.body.appendChild(script);
      } catch (err) {
        setIsRazorpayLoaded(false);
      }
    };

    loadRazorpayScript();
  }, []);

  const handleView = async (order: Order) => {
    if (!razorpayKey || !isRazorpayLoaded) return;

    try {
      const payload = {
        order_id: order.order_id,
        order_type: order.device_type
      };
      const response = await getOrderDetails(payload).unwrap();

      const orderAmount = response.data.order_amount;
      const amountInPaise = Math.round(orderAmount * 100);

      const options = {
        key: razorpayKey,
        amount: amountInPaise.toString(),
        currency: 'INR',
        name: 'Addiwise Company',
        description: `Payment for Order ${response.data.so_order_id || order.order_id}`,
        handler: function (response: any) {
          console.log('Payment Success:', response);
          // For example:
          // response.razorpay_payment_id
          // response.razorpay_order_id
          // response.razorpay_signature
          toast.success('Payment successful!');
          // You should send this to your backend to verify the payment signature.
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
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) =>
        toast.error(`Payment failed: ${response.error.description}`)
      );
      rzp.open();
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const handleOrderIdClick = (order: Order) => {
    if (order.device_type === 'BK Orders') {
      router.push(
        `/orders/new-order/BK?${new URLSearchParams({
          orderId: order.order_id,
          deviceType: order.device_type
        }).toString()}`
      );
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
      )
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
      header: ({ column }) => {
        const getSortIcon = () => '/assets/order-forms/icons/sort-up-down.svg';
        const isSorted = column.getIsSorted();
        const rotationClass =
          isSorted === 'asc'
            ? 'rotate-180 transition-transform duration-300'
            : 'rotate-0 transition-transform duration-300';

        return (
          <button
            onClick={() => column.toggleSorting(isSorted === 'desc' ? false : true)}
            className="flex justify-between items-center w-full"
          >
            <span>Order Date</span>
            <img src={getSortIcon()} alt="sort icon" className={`w-4 h-4 ml-1 ${rotationClass}`} />
          </button>
        );
      },
      cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString(),
      sortingFn: 'datetime',
      enableSorting: true
    },
    {
      accessorKey: 'order_value',
      header: 'Order Value',
      cell: ({ row }) => `${row.original.symbol}${row.original.order_value.toFixed(2)}`
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
            className={`px-2 py-1 rounded-full text-xs ${statusClasses[status as keyof typeof statusClasses] || statusClasses.default}`}
          >
            {status}
          </span>
        );
      }
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
              className="bg-primary hover:bg-primary/90 text-white shadow-md"
              onClick={() => handleView(order)}
            >
              {isPaymentLoading ? 'Processing...' : 'Pay'}
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

              {order.status !== 'Paid' && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#583ca3]/90 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Design engine under construction
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      id: 'invoice',
      header: 'Invoice',
      cell: ({ row }) => {
        const order = row.original;
        const isDisabled = order.status === 'Completed' || order.status === 'Paid';

        return (
          <div className="flex space-x-">
            <div className="relative group ml-2"></div>
          </div>
        );
      }
    },
    {
      id: 'payment-receipt',
      header: 'Payment Receipt',
      cell: ({ row }) => {
        const order = row.original;
        const isDisabled = order.status === 'Completed' || order.status === 'Paid';

        return (
          <div className="flex space-x-">
            <div className="relative group ml-2"></div>
          </div>
        );
      }
    }
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
        {!razorpayKey && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            Warning: Payment gateway is not properly configured
          </div>
        )}
      </div>
      <DataTable
        columns={columns}
        data={(data?.data?.sales_orders || [])
          .filter((order: Order) =>
            order.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((order: any) => ({ ...order, device_type: order.custom_order_types || '-' }))}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}
