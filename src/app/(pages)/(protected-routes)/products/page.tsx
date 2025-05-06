import Image from 'next/image';
import React from 'react';

export default function Products(): React.JSX.Element {
  return (
    <div className="p-6 max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
        {/* Prosthetics Lower Extremity */}
        <div>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
            Prosthetics Lower Extremity
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            <ProductItem src="/assets/order-forms/products/BK.jpg" label="Below Knee (BK)" />
            <ProductItem src="/assets/order-forms/products/AK.jpg" label="Above Knee (AK)" />
          </div>
        </div>

        {/* Prosthetics Upper Extremity */}
        <div>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
            Prosthetics Upper Extremity
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6 justify-center">
            <ProductItem src="/assets/order-forms/products/BE.jpg" label="Below Elbow (BE)" />
            <ProductItem src="/assets/order-forms/products/AE.jpg" label="Above Elbow (AE)" />
          
          </div>
        </div>

        {/* Off the Shelf */}
        <div>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase ">
            Off the Shelf
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6 flex flex-col" >
            <ProductItem src="/assets/order-forms/products/Addistud.jpg" label="AddiStud" />
          </div>
        </div>
      </div>

      {/* Orthotics */}
      <div className='mt-5'>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Orthotics
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem src="/assets/order-forms/products/IN.jpg" label="Insoles" />
        <ProductItem src="/assets/order-forms/products/AFO.jpg" label="AFO/SMO" />
        <ProductItem src="/assets/order-forms/products/Braces.jpg" label="Braces" />
        <ProductItem src="/assets/order-forms/products/Cranial Helmet.jpg" label="Cranial Helmet" />
        <ProductItem src="/assets/order-forms/products/Facemask.jpg" label="Face Mask" />
          </div>
        </div>

      {/* Scanners */}
      <div className='mt-5'>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Scanners
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
        <ProductItem src="/assets/order-forms/products/AddiPrime.jpg" label="AddiPrime" />
        <ProductItem src="/assets/order-forms/products/AddiPrint.jpg" label="AddiPrint-P500" />
          </div>
        </div>

      {/* Printers */}
      <div className='mt-5'>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          Printers
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
        <ProductItem src="/assets/order-forms/products/HP-MJF.jpg" label="HP-MJF" />
          </div>
        </div>

      {/* AddiNxT Design Platform */}
      <div className='mt-5'>
          <p className="text-xs font-extrabold text-[#2e2a6f] mb-3 uppercase">
          AddiNxT Design Platform
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-6">
          <ProductItem src="/assets/order-forms/products/Standard.jpg" label="Standard" />
          <ProductItem src="/assets/order-forms/products/Premium.jpg" label="Premium" />
          </div>
        </div>
    </div>
  );
}

function ProductItem({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-col items-center w-35">
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
      <span className="text-xs text-black text-center">{label}</span>
    </div>
  );
}


//========= it is working proper ========================
// import Image from 'next/image';
// import React from 'react';

// export default function Products(): React.JSX.Element {
//   return (
//     <div className="p-4 max-w-full">
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-6">
//         {/* Prosthetics Lower Extremity */}
//         <div>
//           <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
//             Prosthetics Lower Extremity
//           </p>
//           <div className="flex flex-wrap gap-x-6 gap-y-4">
//             <ProductItem src="/assets/order-forms/products/BK.jpg" label="Below Knee (BK)" />
//             <ProductItem src="/assets/order-forms/products/AK.jpg" label="Above Knee (AK)" />
//           </div>
//         </div>

//         {/* Prosthetics Upper Extremity */}
//         <div>
//           <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
//             Prosthetics Upper Extremity
//           </p>
//           <div className="flex flex-wrap gap-x-6 gap-y-4">
//             <ProductItem src="/assets/order-forms/products/BE.jpg" label="Below Elbow (BE)" />
//             <ProductItem src="/assets/order-forms/products/AE.jpg" label="Above Elbow (AE)" />
//             <div className="flex flex-col items-center w-20">
//               <span className="text-[11px] text-black text-center">
//                 Shoulder Disarticulation
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Off the Shelf */}
//         <div>
//           <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">Off the Shelf</p>
//           <div className="flex flex-wrap gap-x-6 gap-y-4">
//             <ProductItem src="/assets/order-forms/products/Addistud.jpg" label="AddiStud" />
//           </div>
//         </div>
//       </div>

//       {/* Orthotics */}
//       <Section title="Orthotics">
//         <ProductItem src="/assets/order-forms/products/IN.jpg" label="Insoles" />
//         <ProductItem src="/assets/order-forms/products/AFO.jpg" label="AFO/SMO" />
//         <ProductItem src="/assets/order-forms/products/Braces.jpg" label="Braces" />
//         <ProductItem src="/assets/order-forms/products/Cranial Helmet.jpg" label="Cranial Helmet" />
//         <ProductItem src="/assets/order-forms/products/Facemask.jpg" label="Face Mask" />
//       </Section>

//       {/* Scanners */}
//       <Section title="Scanners">
//         <ProductItem src="/assets/order-forms/products/AddiPrime.jpg" label="AddiPrime" />
//         <ProductItem src="/assets/order-forms/products/AddiPrint.jpg" label="AddiPrint-P500" />
//       </Section>

//       {/* Printers */}
//       <Section title="Printers">
//         <ProductItem src="/assets/order-forms/products/HP-MJF.jpg" label="HP-MJF" />
//       </Section>

//       {/* AddiNxT Design Platform */}
//       <Section title="AddiNxT Design Platform">
//         <ProductItem src="/assets/order-forms/products/Standard.jpg" label="Standard" />
//         <ProductItem src="/assets/order-forms/products/Premium.jpg" label="Premium" />
//       </Section>
//     </div>
//   );
// }

// function ProductItem({ src, label }: { src: string; label: string }) {
//   return (
//     <div className="flex flex-col items-center w-20">
//       <Image
//         alt={label}
//         height={90}
//         width={90}
//         src={src}
//         className="object-contain rounded-r-lg rounded-l-lg mb-1"
//         loading="lazy"
//         priority={false}
//         unoptimized={true}
//       />
//       <span className="text-[11px] text-black text-center">{label}</span>
//     </div>
//   );
// }

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="mt-6">
//       <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">{title}</p>
//       <div className="flex flex-wrap gap-x-6 gap-y-4">{children}</div>
//     </div>
//   );
// }
//======================================================================
