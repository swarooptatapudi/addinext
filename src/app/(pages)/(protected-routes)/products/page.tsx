'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useGetProductsListQuery } from '@/rtk-query/apis/products';

export default function Products(): React.JSX.Element {

  const { data: products, isLoading, error } = useGetProductsListQuery();
  console.log("products", products);
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load products</p>;

  const printer = products?.filter(
    (item: any) => item.item_group === "Printer 3D" && item.custom_allow_to_ui === 1
  );

  const orthotics = products?.filter((item: any) => (item.item_group === "Orthotics" && item.custom_allow_to_ui === 1))
  const offtheself = products?.filter((item: any) => (item.item_group === "Off the Shelf" && item.custom_allow_to_ui === 1))
  const scanners = products?.filter((item: any) => (item.item_group === "Scanners" && item.custom_allow_to_ui === 1))
  const services = products?.filter((item: any) => (item.item_group === "Services" && item.custom_allow_to_ui === 1))
  return (
    <div className="p-6 max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
        <div>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
            Prosthetics
          </p> <div className="text-xs  font-extrabold text-[#2e2a6f] mb-3  -mt-3 uppercase">Lower Extremity</div>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            <ProductItem
              src="/assets/order-forms/products/BK.jpg"
              label="Below Knee (BK)"
              href="/orders/new-order/BK"
            />
            <ProductItem
              src="/assets/order-forms/products/AK.jpg"
              label="Above Knee (AK)"
              href="/orders/new-order/AK"
            />
          </div>
        </div>

        {/* Prosthetics Upper Extremity */}
        <div>
          <p className="text-xs  font-extrabold text-[#2e2a6f] mb-3 uppercase">
            Prosthetics
          </p> <div className="text-xs  font-extrabold text-[#2e2a6f] mb-3  -mt-3 uppercase">Upper Extremity</div>
          <div className="flex flex-wrap gap-x-8 gap-y-6 justify-start">
            <ProductItem
              src="/assets/order-forms/products/BE.jpg"
              label="Below Elbow (BE)"
              href="/orders/new-order/BE"
            />
            <ProductItem
              src="/assets/order-forms/products/AE.jpg"
              label="Above Elbow (AE)"
              href="/orders/new-order/AE"
            />
          </div>
        </div>
      </div>

      {/* Orthotics */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Orthotics
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {orthotics?.map((orthotics: any) => (
            <ProductItem
              key={orthotics.name}
              src={orthotics.image || "/assets/placeholder.jpg"}
              label={orthotics.item_name}
              href=""
            />
          ))}
        </div>
      </div>
      {/* Off the Shelf */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Off the Shelf
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {offtheself?.map((offtheself: any) => (
            <ProductItem
              key={offtheself.name}
              src={offtheself.image}
              label={offtheself.item_name}
              href=""
            />
          ))}
        </div>
      </div>
      {/* Scanners */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Scanners
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {scanners?.map((scanners: any) => (
            <ProductItem
              key={scanners.name}
              src={scanners.image || "/assets/placeholder.jpg"}
              label={scanners.item_name}
              href=""
            />
          ))}
        </div>
      </div>

      {/* Printers */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Printers
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {printer?.map((printer: any) => (
            <ProductItem
              key={printer.name}
              src={printer.image || "/assets/placeholder.jpg"}
              label={printer.item_name}
              href=""
            />
          ))}
        </div>
      </div>
      {/* AddiNxT Design Platform */}
      <div className='mt-5'>
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          AddiNxT Design Platform
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem
            src="/assets/order-forms/products/Standard.jpg"
            label="Standard"
            href={''}
          />
          <ProductItem
            src="/assets/order-forms/products/Premium.jpg"
            label="Premium"
            href={''}
          />
        </div>
      </div>
    </div>
  );
}

function ProductItem({ src, label, href }: { src: string; label: string; href: string }) {
  return (
    <div className="flex flex-col items-center w-35">
      <Link href={href} passHref>
        <div className="cursor-pointer hover:scale-105 transition-transform">
          <Image
            alt={label}
            height={150}
            width={150}
            src={src}
            className="object-contain rounded-lg mb-2 shadow-md border border-gray-200"
            loading="lazy"
            priority={false}
            unoptimized={true}
          />
        </div>
      </Link>
      <span className="text-xs text-black text-center">{label}</span>
    </div>
  );
}
