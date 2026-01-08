'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useGetProductsListQuery } from '@/rtk-query/apis/products';
import InsolesOrderForm from '../orders/new-order/_child/InsolesOrderForm';

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
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Prosthetics</p>{' '}
          <div className="text-xs  font-extrabold text-[#2e2a6f] mb-3  -mt-3 uppercase">
            Lower Extremity
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            <ProductItem
              src="/assets/order-forms/products/BK.jpg"
              label="AddiEase LE (BK)"
              href="/orders/new-order/BK"
            />
            <ProductItem
              src="/assets/order-forms/products/AK.jpg"
              label="AddiEase LE (AK)"
              href="/orders/new-order/AK"
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
            />
            <ProductItem
              src="/assets/order-forms/products/AE.jpg"
              label="AddiEase UE (AE)"
              href="/orders/new-order/AE"
            />
          </div>
        </div>
      </div>

      {/* Orthotics */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Orthotics</p>
        {/*<div className="flex flex-wrap gap-x-8 gap-y-6">*/}
        {/*  {orthotics?.map((orthotic: any) => (*/}
        {/*    <ProductItem*/}
        {/*      key={orthotic.item_name}*/}
        {/*      src={orthotic.image || "/assets/placeholder.jpg"}*/}
        {/*      label={orthotic.item_name}*/}
        {/*      href={*/}
        {/*        orthotic.item_name === "AddiSole (Insole)"*/}
        {/*          ? "/orders/new-order/Insoles"   // 👈 route for Insole*/}
        {/*          : ""   // 👈 route for others*/}
        {/*      }*/}
        {/*    />*/}
        {/*  ))}*/}
        {/*</div>*/}
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem
            src="/assets/order-forms/products/IN.jpg"
            label="AddiSole (Insole/UCBL)"
            href="/orders/new-order/Insoles"
          />
          <ProductItem
            src="/assets/order-forms/products/AFO.jpg"
            label="AddiFlex (AFO/DAFO)"
            href="/orders/new-order/AFO"
          />
           <ProductItem
            src="/assets/order-forms/products/kafo_icon.jpg"
            label="AddiKneeFlex (KAFO/HKFO)"
            href="/orders/new-order/HkAFO"
          />
          <ProductItem
            src="/assets/order-forms/products/Cranial Helmet.jpg"
            label="AddiShield (Cranial Helmets)"
            href="/orders/new-order/Cranial"
          />
          <ProductItem
            src="/assets/order-forms/products/Addisheild_icon.jpg"
            label="AddiShield+"
            href="/orders/new-order/AddiShieldPlus"
          />
          {/*<ProductItem
            src="/assets/order-forms/products/Cranial Helmet.jpg"
            label="AddiShield+ (Epilepsy)"
            href="/orders/new-order/ASEP"
          />
          <ProductItem
            src="/assets/order-forms/products/Cranial Helmet.jpg"
            label="AddiShield+ (Epilepsy Pro)"
            href="/orders/new-order/ASEPA"
          />*/}
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
          {/*{orthotics?.map((orthotic: any) => {
            let href = '';
            switch (orthotic.item_name) {
              case 'AddiSole (Insole)':
                href = '/orders/new-order/Insoles'; // Route for Insole
                break;
              case 'Cranial Helmet':
                href = '/orders/new-order/Cranial'; // Route for Cranial Helmet
                break;
              default:
                href = '#'; // Default route for others
                break;
            }

            return (
              <ProductItem
                key={orthotic.item_name}
                src={orthotic.image || '/assets/placeholder.jpg'}
                label={orthotic.item_name}
                href={href}
              />
            );
          })}*/}
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
          {/*{scanners?.map((scanners: any) => (
            <ProductItem
              key={scanners.item_name}
              src={scanners.image || '/assets/placeholder.jpg'}
              label={scanners.item_name}
              href={`/products/buyproducts?name=${encodeURIComponent(scanners.item_name)}`}
            />
          ))}*/}
          <ProductItem
            src="/assets/order-forms/products/Addiscan-E.png"
            label="AddiScan-E"
            href="/products/buyproducts?name=AddiScan-E"
          />
          <ProductItem
            src="/assets/order-forms/products/AddiPrime.jpg"
            label="AddiScan-Prime"
            href="/products/buyproducts?name=AddiScan-Prime"
          />
          <ProductItem
            src="/assets/order-forms/products/Addiscan-RP.png"
            label="AddiScan-RP"
            href="/products/buyproducts?name=AddiScan-RP"
          />
        </div>
      </div>

      {/* Printers */}
      <div className="mt-5">
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">Printers</p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {/*{printer?.map((printer: any) => (
            <ProductItem
              key={printer.item_name}
              src={printer.image || '/assets/placeholder.jpg'}
              label={printer.item_name}
              href={`/products/buyproducts?name=${encodeURIComponent(printer.item_name)}`}
            />
          ))}*/}
          <ProductItem
            src="/assets/order-forms/products/AddIPrint.jpg"
            label="AddiPrint-P400"
            href="/products/buyproducts?name=AddiPrint-P400"
          />
          <ProductItem
            src="/assets/order-forms/products/AddIPrint.jpg"
            label="AddiPrint-P600"
            href="/products/buyproducts?name=AddiPrint - P600"
          />
          {/*<ProductItem*/}
          {/*  src="/assets/order-forms/products/HP MJF.jpg"*/}
          {/*  label="HP-MJF"*/}
          {/*  href="/products/buyproducts?name=HP-MJF"*/}
          {/*/>*/}
        </div>
      </div>
      {/* AddiNxT Design Platform */}
      {/*<div className="mt-5">*/}
      {/*  <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">*/}
      {/*    AddiNxT Design Platform*/}
      {/*  </p>*/}
      {/*  <div className="flex flex-wrap gap-x-8 gap-y-6">*/}
      {/*    <ProductItem src="/assets/order-forms/products/Standard.jpg" label="Standard" href={''} />*/}
      {/*    <ProductItem src="/assets/order-forms/products/Premium.jpg" label="Premium" href={''} />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}

// function ProductItem({ src, label, href }: { src: string; label: string; href: string }) {
//   return (
//     <div className="flex flex-col items-center w-35">
//       <Link href={href} passHref>
//         <div className="cursor-pointer hover:scale-105 transition-transform">
//           <Image
//             alt={label}
//             height={150}
//             width={150}
//             src={src}
//             className="object-contain rounded-lg mb-2 shadow-md border border-gray-200"
//             loading="lazy"
//             priority={false}
//             unoptimized={true}
//           />
//         </div>
//       </Link>
//       <span className="text-xs text-black text-center">{label}</span>
//     </div>
//   );
// }

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
