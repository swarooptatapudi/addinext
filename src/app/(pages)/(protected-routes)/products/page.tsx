import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Printers from '@/app/(pages)/(protected-routes)/printers/page'

export default function Products(): React.JSX.Element {
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
      <div className='mt-5'>
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Orthotics
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem 
            src="/assets/order-forms/products/IN.jpg" 
            label="Insoles" 
            href="/orders/new-order/insoles" 
          />
          <ProductItem 
            src="/assets/order-forms/products/AFO.jpg" 
            label="AFO/SMO" 
            href={''}
          />
          <ProductItem 
            src="/assets/order-forms/products/Braces.jpg" 
            label="Braces" 
            href={''}
          />
          <ProductItem 
            src="/assets/order-forms/products/Cranial Helmet.jpg" 
            label="Cranial Helmet" 
            href={''}
          />
          <ProductItem 
            src="/assets/order-forms/products/Facemask.jpg" 
            label="Face Mask" 
            href={''}
          />
        </div>
      </div>
 {/* Off the Shelf */}
        <div>
          <p className="text-xs mt-5 font-extrabold text-[#2e2a6f] mb-3 uppercase">
            Off the Shelf
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6 flex flex-col justify-start">
            <ProductItem 
              src="/assets/order-forms/products/Addistud.jpg" 
              label="AddiStud" 
              href=""
            />
          </div>
        </div>
      {/* Scanners */}
      <div className='mt-5'>
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Scanners
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem 
            src="/assets/order-forms/products/AddiPrime.jpg" 
            label="AddiPrime" 
            href=""
          />
         
        </div>
      </div>

      {/* Printers */}
      <div className='mt-5'>
        <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Printers
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem 
            src="/assets/order-forms/products/HP-MJF.jpg" 
            label="HP-MJF" 
            href=""
          />
           <ProductItem 
            src="/assets/order-forms/products/AddIPrint.jpg" 
            label="AddiPrint-P500" 
            href=''
          />
            <ProductItem 
            src="/assets/order-forms/products/AddIPrint.jpg" 
            label="AddiPrint-P350" 
            href=''
          />
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
