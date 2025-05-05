'use client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/datepicker';
import { Input } from '@/components/ui/input';
import { useGetProductsQuery } from '@/rtk-query/apis/products';
import Link from 'next/link';
import React, { useMemo } from 'react';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export default function NewOrder(): React.JSX.Element {
  const { data, isLoading, isSuccess } = useGetProductsQuery('');
  
  const getLocalImagePath = (productName: string) => {
    const cleanName = productName
      .replace(/[()]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    return `/assets/order-forms/products/${cleanName}.jpg`;
  };

  const getProductDescription = (productName: string) => {
    const descriptions: Record<string, string> = {
      'AE': 'Above Elbow Sockets',
      'AK': 'Above Knee Sockets',
      'BK': 'Below Knee Sockets',
      'BE': 'Below Elbow Sockets',
      'IN': 'Insoles',
    };
    return descriptions[productName] || 'Premium quality prosthetic product';
  };

  const products = useMemo(() => {
    if (isLoading) return [];
    if (isSuccess) {
      return data?.map((product: any) => ({
        id: product.name,
        name: product.name,
        image: getLocalImagePath(product.name),
        description: getProductDescription(product.name)
      }));
    }
    return [];
  }, [data, isLoading, isSuccess]);

  return (
    <div className="container mx-auto px-4 py-8">
            <div>
         <div className="grid grid-cols-3 gap-2">
           <div>
             <p className="font-[400] text-gray-500 text-sm mb-1">Organization</p>
             <Input placeholder="ABC" />
           </div>
           <div>
             <p className="font-[400] text-gray-500 text-sm mb-1">Branch</p>
             <Input placeholder="ABC" />
           </div>
           <div>
             <p className="font-[400] text-gray-500 text-sm mb-1">Order No.</p>
             <Input placeholder="ABC" />
           </div>
           <div>
             <p className="font-[400] text-gray-500 text-sm mb-1">Date</p>
             <DatePicker label="Date" required onChange={() => {}} value={new Date()} />
           </div>
         </div>
       </div>

      {/* Products section */}
      <div className="bg-white rounded-lg shadow-sm p-2 mt-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Products</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {products?.map((product: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: React.Key | null | undefined; image: string | StaticImport; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
            <Link href={`/orders/new-order/${product?.name}`} key={product.id}>
            <Card className="hover:bg-gray-50 cursor-pointer transition-all duration-200 h-full flex flex-col border border-gray-200 hover:border-primary hover:shadow-md">
              <CardHeader className="p-0 flex-grow"> {/* Removed flex-col and items-center */}
                <div className="w-full aspect-square relative rounded-t-md overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt='image not found'
                    fill
                    className="object-cover"
                    sizes="(max-width: 400px) 100vw"
                    unoptimized={true}
                    priority={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/order-forms/products/default.jpg';
                    }}
                  />
                </div>
              </CardHeader>
              <div className="p-3 border-t border-gray-100">
                <CardTitle className="text-center font-medium text-gray-900 mb-1">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-xs text-center text-gray-500">
                  {product.description}
                </CardDescription>
              </div>
            </Card>
          </Link>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-full">
                <div className="w-full aspect-square bg-gray-200 rounded-t-md"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
