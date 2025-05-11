'use client';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/app/common/DataTable';
import { useGetOrdersQuery } from '@/rtk-query/apis/orders';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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
};

export default function Orders(): React.JSX.Element {
  const { data } = useGetOrdersQuery('');
  const router = useRouter();

  const handleView = (order: Order) => {
    router.push(`/orders/new-order/${order.order_id}`);
  };

  const handleOrderIdClick = (orderId: string) => {
    // Handle order ID click logic here
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'order_id',
      header: 'Order ID',
      cell: ({ row }) => (
        <span
          className="cursor-pointer hover:underline hover:text-blue-500"
          onClick={() => handleOrderIdClick(row.original.order_id)}
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
    },
    {
      accessorKey: 'order_value',
      header: 'Order Value',
      cell: ({ row }) => `${row.original.order_value.toFixed(2)}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === 'Draft'
                ? 'bg-yellow-100 text-yellow-800'
                : status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
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
        return (
          <>
            <Button
              size="sm"
              className="mr-2 bg-gradient-to-r bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
              onClick={() => handleView(order)}
            >
              Pay
            </Button>
            <Button
              size="sm"
              className="mr-2 bg-gradient-to-r bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
              onClick={() => handleView(order)}
            >
              Start Design
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <DataTable
        columns={columns}
        data={data?.data?.sales_orders || []}
      />
    </div>
  );
}
