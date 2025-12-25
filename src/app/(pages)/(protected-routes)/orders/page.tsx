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
import { exportCranialOrderToExcel } from '@/lib/utils';
import { usePaymentLauncher } from '@/hooks/usePaymentLauncher';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

const { data, isLoading,error,refetch } = useGetOrdersQuery({ page, page_size: pageSize });

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
  const { startPayment } = usePaymentLauncher();

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

  const getOrderType = (order: Order): string =>
    order.device_type || order.order_type || 'Unknown';

  // ✅ Payment handler using usePaymentLauncher
  const handlePayment = async (order: Order) => {
    try {
      const payload = { order_id: order.order_id, order_type: getOrderType(order) };
      const response = await getOrderDetails(payload).unwrap();
      const orderAmount = Number(response?.data?.order_amount);

      if (!orderAmount || orderAmount <= 0) {
        toast.error('Invalid order amount.');
        return;
      }

      const salesOrderId = response?.data?.so_order_id || order.order_id;

      await startPayment({
        amount: orderAmount,
        salesOrder: String(salesOrderId),
        provider: 'HDFC',
        returnUrl: `${window.location.origin}/api/payments/return`,
        openInPopup: true,
        onSuccess: async () => {
          toast.success('Payment successful!');
          await getOrderDetailIds({
            order_id: order.order_id,
            order_type: getOrderType(order),
          } as any);
          refetch();
        },
        onFailure: (err) => {
          console.error('Payment failed:', err);
          toast.error('Payment failed or cancelled. Please try again.');
        },
      });
    } catch (err) {
      console.error('Payment initiation failed:', err);
      toast.error('Failed to process payment.');
    }
  };

  // navigate on order click
  const handleOrderIdClick = (order: Order) => {
    setSelectedOrder(order);

    const baseParams = {
      orderId: order.order_id,
      deviceType: order.device_type,
      readonly: 'true', // <= add this
    };

    if (order.device_type === "BK Orders") {
      router.push(`/orders/new-order/BK?${new URLSearchParams(baseParams).toString()}`);
    } else if (order.device_type === "Insole Orders") {
      router.push(`/orders/new-order/Insoles?${new URLSearchParams(baseParams).toString()}`);
    } else if (order.device_type === "Cranial Helmet Orders") {
      router.push(`/orders/new-order/Cranial?${new URLSearchParams(baseParams).toString()}`);
    }
    else if (order.device_type === "AddiShield Pro Order") {
      router.push(`/orders/new-order/AddiShieldPlus?${new URLSearchParams(baseParams).toString()}`);
    }
    else if (order.device_type === "AddiShield EpiPro Order") {
      router.push(`/orders/new-order/AddiShieldPlus?${new URLSearchParams(baseParams).toString()}`);
    }
    else if (order.device_type === "AddiShield EpiPro Active Order") {
      router.push(`/orders/new-order/AddiShieldPlus?${new URLSearchParams(baseParams).toString()}`);
    }
  };
// Add at top with other React state hooks:
// inside Orders component (top-level hooks)
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());
  const isExportingFor = (orderId?: string) => !!orderId && exportingIds.has(orderId);

// inside component
  const handleExport = async (order: Order) => {
    if (!order?.order_id) return;
    const id = order.order_id;
    setExportingIds((s) => new Set(s).add(id));
    try {
      await exportCranialOrderToExcel(order.order_id, order.device_type);
      toast.success('Export complete');
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Export failed');
    } finally {
      setExportingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
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
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              disabled={isDisabled || isPaymentLoading }
              className="bg-primary hover:bg-primary/90 text-white shadow-md"
              onClick={() => handlePayment(order)}
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
            </div>
            {order.device_type === 'Cranial Helmet Orders' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleExport(order)}
                className="ml-2 border"
                title="Export order to Excel"
                disabled={isExportingFor(order.order_id)}
              >
                {isExportingFor(order.order_id) ? 'Exporting…' : 'Export'}
              </Button>
            )}
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
