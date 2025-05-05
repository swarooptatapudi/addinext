import Image from 'next/image';
import React from 'react';

export default function Products(): React.JSX.Element {
  return (
    <div className="p-4 max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-6">
        <div>
          <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
            Prosthetics Lower Extremity
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex flex-col items-center w-20">
              <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/BK.jpg"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
              <span className="text-[11px] text-black text-center">
                Below Knee (BK)
              </span>
            </div>
            <div className="flex flex-col items-center w-20">
            <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/AK.jpg"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
              <span className="text-[11px] text-black text-center">
                Above Knee (AK)
              </span>
            </div>
          </div>
        </div>

        {/* Prosthetics Upper Extremity */}
        <div>
          <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
            Prosthetics Upper Extremity
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex flex-col items-center w-20">
            <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/BE.jpg"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
              <span className="text-[11px] text-black text-center">
                Below Elbow (BE)
              </span>
            </div>
            <div className="flex flex-col items-center w-20">
            <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/AE.jpg"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
              <span className="text-[11px] text-black text-center">
                Above Elbow (AE)
              </span>
            </div>
            <div className="flex flex-col items-center w-20">
              
              <span className="text-[11px] text-black text-center">
                Shoulder Disarticulation
              </span>
            </div>
          </div>
        </div>

        {/* Off the Shelf */}
        <div>
          <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
            Off the Shelf
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex flex-col items-center w-20">
              
              <span className="text-[11px] text-black text-center">
                AddiStud
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Orthotics */}
      <div className="mt-6">
        <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
          Orthotics
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div className="flex flex-col items-center w-20">
          <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/IN.jpg"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
            <span className="text-[11px] text-black text-center">
              Insoles
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
          <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/AFO.jpg"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
            <span className="text-[11px] text-black text-center">
              AFO/SMO
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              Braces
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              Cranial Helmet
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              Fase Mask
            </span>
          </div>
        </div>
      </div>

      {/* Scanners */}
      <div className="mt-6">
        <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
          Scanners
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              AddiPrime
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              AddiPrime RP
            </span>
          </div>
        </div>
      </div>

      {/* Printers */}
      <div className="mt-6">
        <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
          Printers
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              HP-MJF
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              AddiPrint 1
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
            
            <span className="text-[11px] text-black text-center">
              AddiPrint 2
            </span>
          </div>
        </div>
      </div>

      {/* AddiNxT Design Platform */}
      <div className="mt-6">
        <p className="text-[11px] font-extrabold text-[#2e2a6f] mb-2">
          AddiNxT Design Platform
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div className="flex flex-col items-center w-20">
          <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/AddiSole.png"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
            <span className="text-[11px] text-black text-center">
              Standard
            </span>
          </div>
          <div className="flex flex-col items-center w-20">
          <Image    
              alt="Premium AddiNxT Design Platform black silhouette " 
              height={90} 
              width={90}
              src="/assets/order-forms/products/AddiSoleEco.png"
              className="object-contain rounded-r-lg rounded-l-lg mb-1"
                loading="lazy"
                priority={false}
                unoptimized={true}
            />
            <span className="text-[11px] text-black text-center">
              Premium
            </span>
          </div>
        </div>
      </div>
    </div>
    // <div className="flex flex-col items-center justify-center h-screen">
    //   <h1>Products</h1>
      
    // </div>
  );
}
