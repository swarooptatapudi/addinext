'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';


import { useRouter } from "next/navigation";

const printers = [
  {
    name: 'HP-MJF',
    image: '/assets/order-forms/products/HP-MJF.jpg', // Replace with actual image path
  },
  {
    name: 'AddiPrint-P600',
    image: '/assets/order-forms/products/AddIPrint.jpg', // Replace with actual image path
  },
    {
    name: 'AddiPrint-P400 ',
    image: '/assets/order-forms/products/AddIPrint.jpg', // Replace with actual image path
  },
];

export default function Printers(): React.JSX.Element {

  const router = useRouter()

  const handleClickBuy = (products: string) => {
    router.push(`/printers/${products}`)
  }
return (
 <div className="px-2 sm:px-4 md:px-6 py-4">
  <h2 className="text-lg md:text-xl font-semibold text-primary mb-4">PRINTERS</h2>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
    {printers.map((printer, index) => (
      <div
        key={index}
        className="group relative text-center p-3 rounded-2xl
                   bg-white/10 backdrop-blur-lg border border-white/20
                   transition-all duration-500
                   hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                   hover:border-primary/40"
      >
        {/* Gradient glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-primary/20 pointer-events-none"></div>

        {/* Image */}
        <div className="overflow-hidden rounded-xl">
          <Image
            src={printer.image}
            alt={printer.name}
            width={160}
            height={160}
            className="object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Name */}
        <p className="mt-3 font-medium text-gray-900 text-xs sm:text-sm">
          {printer.name}
        </p>
         <Button
           onClick={() => handleClickBuy(printer.name)}
              className="mt-3 w-full text-xs sm:text-sm transition-transform duration-300 group-hover:scale-[1.05]"
              variant="default"
            >
              Buy
            </Button>
      </div>
    ))}
  </div>

</div>

);




}
