'use client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetProductsQuery } from '@/rtk-query/apis/products';
import Link from 'next/link';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { format } from 'date-fns';
import { USER } from '@/uttils/Types';
import { useSelector } from 'react-redux';
import { RootState } from '@/rtk-query/store';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewOrder(): React.JSX.Element {
  const { data, isLoading, isSuccess } = useGetProductsQuery('');
  const [currentDate, setCurrentDate] = useState('');
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);

  useEffect(() => {
    setCurrentDate(format(new Date(), 'dd-MM-yyyy'));
  }, []);

  const getLocalImagePath = useCallback((productName: string) => {
    const cleanName = productName.replace(/[()]/g, '').trim().replace(/\s+/g, ' ');
    return `/assets/order-forms/products/${cleanName}.jpg`;
  }, []);

  const getProductDescription = useCallback((productName: string) => {
    const descriptions: Record<string, string> = {
      'AE': 'Above Elbow Sockets',
      'AK': 'Above Knee Sockets',
      'BK': 'Below Knee Sockets',
      'BE': 'Below Elbow Sockets',
      'IN': 'Insoles',
    };
    return descriptions[productName] || 'Premium quality prosthetic product';
  }, []);

  const products = useMemo(() => {
    if (isLoading) return [];
    if (isSuccess) {
      return data?.map((product: any) => ({
        id: product.name,
        name: product.name,
        image: getLocalImagePath(product.name),
        description: getProductDescription(product.name),
      }));
    }
    return [];
  }, [data, isLoading, isSuccess, getLocalImagePath, getProductDescription]);

  // Return a proper loading state instead of null
  if (!currentDate) {
    return (
      <div className="container px-4 py-8 max-w-screen-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div>
            <p className="text-sm text-gray-500 mb-1">Organization</p>
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">User</p>
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Date</p>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full rounded-xl overflow-hidden border border-gray-200">
                <Skeleton className="w-full h-56" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-3 w-5/6 mx-auto" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-screen-xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div>
          <p className="text-sm text-gray-500 mb-1">Organization</p>
          <Input placeholder="ABC" />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">User</p>
          <Input value={user.full_name} disabled className="bg-gray-100 cursor-default" />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Date</p>
          <Input value={currentDate} readOnly className="bg-gray-100 cursor-default" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: React.Key | null | undefined; image: string | StaticImport; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
            <Link href={`/orders/new-order/${product.name}`} key={product.id}>
              <Card className="hover:shadow-lg transition-transform transform hover:-translate-y-1 flex flex-col h-full border border-gray-200 rounded-xl overflow-hidden">
                <CardHeader className="relative w-full h-56 bg-gray-10 mt-[-26px]">
                  <Image
                    src={product.image}
                    alt="images not found"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                    priority={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/order-forms/products/default.jpg';
                    }}
                  />
                </CardHeader>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <CardTitle className="text-center text-base font-medium text-gray-900 mb-2">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-center text-gray-500">
                    {product.description}
                  </CardDescription>
                </div>
              </Card>
            </Link>
          ))}

          {isLoading &&
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-full rounded-xl overflow-hidden border border-gray-200">
                <div className="w-full h-56 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

//---------------------------------------------------------------------------
// 'use client';
// import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { DatePicker } from '@/components/ui/datepicker';
// import { Input } from '@/components/ui/input';
// import { useGetProductsQuery } from '@/rtk-query/apis/products';
// import Link from 'next/link';
// import React, { useMemo } from 'react';
// import Image from 'next/image';
// import { StaticImport } from 'next/dist/shared/lib/get-img-props';
// import { format } from 'date-fns';
// import { USER } from '@/uttils/Types';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/rtk-query/store';

// export default function NewOrder(): React.JSX.Element {
//   const { data, isLoading, isSuccess } = useGetProductsQuery('');
//   const currentDate = format(new Date(), 'dd-MM-yyyy');
//   const { user }: { user: USER  } = useSelector((state: RootState) => state.userReducer);

//   const getLocalImagePath = (productName: string) => {
//     const cleanName = productName
//       .replace(/[()]/g, '')
//       .trim()
//       .replace(/\s+/g, ' ');
//     return `/assets/order-forms/products/${cleanName}.jpg`;
//   };

//   const getProductDescription = (productName: string) => {
//     const descriptions: Record<string, string> = {
//       'AE': 'Above Elbow Sockets',
//       'AK': 'Above Knee Sockets',
//       'BK': 'Below Knee Sockets',
//       'BE': 'Below Elbow Sockets',
//       'IN': 'Insoles',
//     };
//     return descriptions[productName] || 'Premium quality prosthetic product';
//   };

//   const products = useMemo(() => {
//     if (isLoading) return [];
//     if (isSuccess) {
//       return data?.map((product: any) => ({
//         id: product.name,
//         name: product.name,
//         image: getLocalImagePath(product.name),
//         description: getProductDescription(product.name)
//       }));
//     }
//     return [];
//   }, [data, isLoading, isSuccess]);

//   return (
//     <div className="container mx-auto px-4 py-8">
//             <div>
//          <div className="grid grid-cols-3 gap-2">
//            <div>
//              <p className="font-[400] text-gray-500 text-sm mb-1">Organization</p>
//              <Input placeholder="ABC" />
//            </div>
//            <div>
//              <p className="font-[400] text-gray-500 text-sm mb-1">User</p>
//              <Input value={user.full_name} disabled placeholder="ABC"   className="bg-gray-100 cursor-default" />
//            </div>
//            <div>
//       <p className="font-[400] text-gray-500 text-sm mb-1">Date</p>
//       <Input 
//         value={currentDate}
//         readOnly // Makes the input non-editable
//         className="bg-gray-100 cursor-default" // Visual feedback for read-only state
//       />
//     </div>
          
//            {/* <div>
//              <p className="font-[400] text-gray-500 text-sm mb-0">Date</p>
//              <DatePicker onChange={() => {}} value={new Date()} />
//            </div> */}
//          </div>
//        </div>

//       {/* Products section */}
//       <div className="bg-white rounded-lg shadow-sm p-2 mt-4">
//         <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Products</h3>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
//           {products?.map((product: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: React.Key | null | undefined; image: string | StaticImport; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
//             <Link href={`/orders/new-order/${product?.name}`} key={product.id}>
//             <Card className="hover:bg-gray-50 cursor-pointer transition-all duration-200 h-full flex flex-col border border-gray-200 hover:border-primary hover:shadow-md">
//               <CardHeader className="p-0 flex-grow"> {/* Removed flex-col and items-center */}
//                 <div className="w-full aspect-square relative rounded-t-md overflow-hidden bg-gray-100">
//                   <Image
//                     src={product.image}
//                     alt='image not found'
//                     fill
//                     className="object-cover"
//                     sizes="(max-width: 400px) 100vw"
//                     unoptimized={true}
//                     priority={false}
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src = '/assets/order-forms/products/default.jpg';
//                     }}
//                   />
//                 </div>
//               </CardHeader>
//               <div className="p-3 border-t border-gray-100">
//                 <CardTitle className="text-center font-medium text-gray-900 mb-1">
//                   {product.name}
//                 </CardTitle>
//                 <CardDescription className="text-xs text-center text-gray-500">
//                   {product.description}
//                 </CardDescription>
//               </div>
//             </Card>
//           </Link>
//           ))}
//         </div>

//         {isLoading && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
//             {[...Array(6)].map((_, i) => (
//               <Card key={i} className="animate-pulse h-full">
//                 <div className="w-full aspect-square bg-gray-200 rounded-t-md"></div>
//                 <div className="p-3 space-y-2">
//                   <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
//                   <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
