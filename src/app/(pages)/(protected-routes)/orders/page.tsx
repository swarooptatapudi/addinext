'use client';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/app/common/DataTable';
import { useGetOrdersQuery } from '@/rtk-query/apis/orders';
import { Button } from '@/components/ui/button'; // Assuming you're using shadcn/ui
import { useRouter } from 'next/navigation';

export type Payment = {
  orderId: string;
  clinicName: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  patientName: string;
  deviceType: string;
  orderDate: string;
  estimateDelivery: string;
  orderValue: string;
  designLink: string;
};

export default function Orders(): React.JSX.Element {
  const { data } = useGetOrdersQuery('');
  const router = useRouter();

  const handleView = (order: Payment) => {
    console.log('Viewing order:', order);

    const orderId = order.orderId || 'BK';
    console.log('Redirecting to order:', orderId);
    router.push(`/orders/new-order/${orderId}`)
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'name',
      header: 'Order ID'
    },
    {
      accessorKey: 'custom_clinic_name',
      header: 'Clinic Name'
    },
    {
      accessorKey: 'custom_patient_name',
      header: 'Patient Name'
    },
    {
      accessorKey: 'deviceType',
      header: 'Device Type'
    },
    {
      accessorKey: 'transaction_date',
      header: 'Order Date'
    },
    {
      accessorKey: 'delivery_date',
      header: 'Estimate Delivery'
    },
    {
      accessorKey: 'rounded_total',
      header: 'Order Value'
    },
    {
      accessorKey: 'designLink',
      header: 'Design Link'
    },
    {
      accessorKey: 'status',
      header: 'Status'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        console.log("row::",row);
        
        const order = row.original;
        
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(order)}
          >
            View
          </Button>
        );
      },
    }
  ];

  return (
    <div className="">
      <DataTable columns={columns} data={data || []} />
    </div>
  );
}

//------------------------------------previouse-------
// 'use client';
// import React from 'react';
// import { ColumnDef } from '@tanstack/react-table';
// import { DataTable } from '@/components/app/common/DataTable';
// import { useGetOrdersQuery } from '@/rtk-query/apis/orders';
// export type Payment = {
//   orderId: string;
//   clinicName: number;
//   status: 'pending' | 'processing' | 'success' | 'failed';
//   patientName: string;
//   deviceType: string;
//   orderDate: string;
//   estimateDelivery: string;
//   orderValue: string;
//   designLink: string;
// };
// export default function Orders(): React.JSX.Element {
//   const { data } = useGetOrdersQuery('');
//   const columns: ColumnDef<Payment>[] = [
//     {
//       accessorKey: 'name',
//       header: 'Order ID'
//     },
//     {
//       accessorKey: 'custom_clinic_name',
//       header: 'Clinic Name'
//     },
//     {
//       accessorKey: 'custom_patient_name',
//       header: 'Patient Name'
//     },
//     {
//       accessorKey: 'deviceType',
//       header: 'Device Type'
//     },
//     {
//       accessorKey: 'transaction_date',
//       header: 'Order Date'
//     },
//     {
//       accessorKey: 'delivery_date',
//       header: 'Estimate Delivery'
//     },
//     {
//       accessorKey: 'rounded_total',
//       header: 'Order Value'
//     },
//     {
//       accessorKey: 'designLink',
//       header: 'Design Link'
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status'
//     }
//   ];
//   return (
//     <div className="">
//       <DataTable columns={columns} data={data || []} />
//     </div>
//   );
// }
