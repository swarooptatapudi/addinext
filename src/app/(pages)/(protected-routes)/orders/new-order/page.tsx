'use client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/datepicker';
import { Input } from '@/components/ui/input';
import { useGetProductsQuery } from '@/rtk-query/apis/products';
import Link from 'next/link';
import React, { useMemo } from 'react';

export default function NewOrder(): React.JSX.Element {
  const { data, isLoading, isSuccess } = useGetProductsQuery('');
  const products = useMemo((): Array<{ id: string; name: string }> => {
    if (isLoading) return [];
    if (isSuccess) {
      return data?.map((product: any) => ({
        id: product.name,
        name: product.name
      }));
    }
    return [];
  }, [data, isLoading, isSuccess]);

  return (
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

      <div className="mt-10">
        <h3>Select Products</h3>

        <div className="mt-6 grid grid-cols-6 gap-4">
          {products?.map((product) => (
            <div key={product.id}>
              <Link href={`/orders/new-order/${product?.name}`}>
                <Card className="hover:bg-secondary cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-center">{product.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
