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
    console.log('Viewing order:', order);
    router.push(`/orders/new-order/${order.order_id}`);
  };
  
  const handleOrderIdClick = (orderId: string) => {
    console.log('Clicked Order ID:', orderId);
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
      )
    },
    {
      accessorKey: 'custom_clinic_name',
      header: 'Clinic Name',
      cell: ({ row }) => row.original.clinic_name || '-'
    },
    {
      accessorKey: 'patient_name',
      header: 'Patient Name',
       cell: ({ row }) => row.original.patient_name || '-'
    },
    {
      accessorKey: 'device_type',
      header: 'Device Type'
    },
    {
      accessorKey: 'order_date',
      header: 'Order Date'
    },
    {
      accessorKey: 'delivery_date',
      header: 'Estimate Delivery'
    },
    {
      accessorKey: 'order_value',
      header: 'Order Value',
      cell: ({ row }) => `$${row.original.order_value.toFixed(2)}`
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
            status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
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
    <div className="p-4">
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
// import { useGetOrdersQuery } from '@/rtk-query/apis/orders';
// import { Button } from '@/components/ui/button'; // Assuming you're using shadcn/ui
// import { useRouter } from 'next/navigation';

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
//   const { data }  = useGetOrdersQuery('');
//   const router = useRouter();

//   const handleView = (order: Payment) => {
//     console.log('Viewing order:', order);

//     const orderId = order.orderId || 'BK';
//     console.log('Redirecting to order:', orderId);
//     router.push(`/orders/new-order/${orderId}`)
//   };

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
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       cell: ({ row }) => {
//         console.log("row::",row);
        
//         const order = row.original;
        
//         return (
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handleView(order)}
//           >
//             View
//           </Button>
//         );
//       },
//     }
//   ];

//   return (
//     <div className="">
//       <DataTable columns={columns} data={data?.data?.sales_orders || []} />
//     </div>
//   );
// }

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
