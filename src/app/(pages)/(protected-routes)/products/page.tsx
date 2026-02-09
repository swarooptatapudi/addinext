'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useGetProductsListQuery } from '@/rtk-query/apis/products';
import productImageMap from '@/data/product-image-map.json';

export default function Products(): React.JSX.Element {

  const { data: products, isLoading, error } = useGetProductsListQuery();
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load products</p>;

  const getProductImage = (item: any) =>
    productImageMap[item.item_code as keyof typeof productImageMap] ||
    item.image ||
    item.custom_product_image ||
    '/assets/placeholder.jpg';

  const printer = products?.filter(
    (item: any) => item.item_group === "Printer 3D" && item.custom_allow_to_ui === 1
  );

  const orthotics = products?.filter((item: any) => (item.item_group === "Orthotics" && item.custom_allow_to_ui === 1))
  const offtheself = products?.filter((item: any) => (item.item_group === "Off the Shelf" && item.custom_allow_to_ui === 1))
  const scanners = products?.filter((item: any) => (item.item_group === "Scanners" && item.custom_allow_to_ui === 1))
  return (
    <div className="p-6 max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
        <div>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Prosthetics</p>{' '}
          <div className="text-xs  font-extrabold text-[#2e2a6f] mb-3  -mt-3 uppercase">
            Lower Extremity
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            <ProductItem
              src="/assets/order-forms/products/BK.jpg"
              label="AddiEase LE (BK)"
              href="/orders/new-order/BK"
              disabled={true}
            />
            <ProductItem
              src="/assets/order-forms/products/AK.jpg"
              label="AddiEase LE (AK)"
              href="/orders/new-order/AK"
              disabled={true}
            />
          </div>
        </div>

        {/* Prosthetics Upper Extremity */}
        <div>
          <p className="text-xs  font-extrabold text-[#2e2a6f] mb-3 uppercase">Prosthetics</p>{' '}
          <div className="text-xs  font-extrabold text-[#2e2a6f] mb-3  -mt-3 uppercase">
            Upper Extremity
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-6 justify-start">
            <ProductItem
              src="/assets/order-forms/products/BE.jpg"
              label="AddiEase UE (BE)"
              href="/orders/new-order/BE"
              disabled={true}
            />
            <ProductItem
              src="/assets/order-forms/products/AE.jpg"
              label="AddiEase UE (AE)"
              href="/orders/new-order/AE"
              disabled={true}
            />
          </div>
        </div>
      </div>

      {/* Orthotics */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Orthotics</p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem
            src="/assets/order-forms/products/IN.jpg"
            label="AddiSole (Insole/UCBL)"
            href="/orders/new-order/Insoles"
            disabled={true}
          />
          <ProductItem
            src="/assets/order-forms/products/AFO.jpg"
            label="AddiFlex (AFO/DAFO)"
            href="/orders/new-order/AFO"
            disabled={true}
          />
          <ProductItem
            src="/assets/order-forms/products/kafo_icon.jpg"
            label="AddiKneeFlex (KAFO/HKFO)"
            href="/orders/new-order/HkAFO"
            disabled={true}
          />
          <ProductItem
            src="/assets/order-forms/products/Cranial Helmet.jpg"
            label="AddiShield (Cranial Helmets)"
            href="/orders/new-order/Cranial"
            disabled={true}
          />
          <ProductItem
            src="/assets/order-forms/products/Addisheild_icon.jpg"
            label="AddiShield+"
            href="/orders/new-order/AddiShieldPlus"
            disabled={true}
          />
          <ProductItem
            src="/assets/order-forms/products/Braces.jpg"
            label="Braces"
            href="#"
            disabled={true}
          />
          <ProductItem
            src="/assets/order-forms/products/Facemask.jpg"
            label="Face Mask"
            href="#"
            disabled={true}
          />
        </div>
      </div>
      {/* Off the Shelf */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Off the Shelf</p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {offtheself?.map((offtheself: any) => (
            <ProductItem
              key={offtheself.item_name}
              src={offtheself.image}
              label={offtheself.item_name}
              href={`/products/buyproducts?name=${encodeURIComponent(offtheself.item_name)}`}
            />
          ))}
        </div>
      </div>
      {/* Scanners */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Scanners</p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {scanners?.map((scanner: any) => (
            <ProductItem
              key={scanner.item_name}
              src={scanner.image}
              label={scanner.item_name}
              href={`/products/buyproducts?name=${encodeURIComponent(scanner.item_name)}`}
            />
          ))}
        </div>
      </div>

      {/* Printers */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Printers</p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {printer?.map((printer: any) => (
            <ProductItem
              key={printer.item_name}
              src={printer.image}
              label={printer.item_name}
              href={`/products/buyproducts?name=${encodeURIComponent(printer.item_name)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductItem({
                       src,
                       label,
                       href,
                       disabled = false,
                     }: {
  src: string;
  label: string;
  href: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`cursor-pointer hover:scale-105 transition-transform ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      }`}
      aria-disabled={disabled}
    >
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
  );

  return (
    <div className="flex flex-col items-center w-35">
      {disabled ? content : <Link href={href} passHref>{content}</Link>}
      <span className="text-xs text-black text-center">{label}</span>
    </div>
  );
}
