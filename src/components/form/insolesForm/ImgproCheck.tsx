import * as React from 'react';
import Image from 'next/image';

type ImageCheckboxOption = {
  value: string;
  label: string;
  imgSrc: string;
};

type ImageCheckboxProps = {
  label?: string;
  options: ImageCheckboxOption[];
  value: string[] | string | null;
  onChange: (value: string[] | string | null) => void;
  className?: string;
  required?: boolean;
  multiple?: boolean;
  inValid?: boolean;
  error?: string;
};

export function ImageCheckbox({
  label,
  options,
  value,
  onChange,
  className,
  required = false,
  multiple = false,
  inValid = false,
  error,
}: ImageCheckboxProps) {
  const handleChange = (optionValue: string) => {
    if (multiple) {
      // Handle multiple selection
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionValue)
        ? currentValue.filter(v => v !== optionValue)
        : [...currentValue, optionValue];
      onChange(newValue.length > 0 ? newValue : null);
    } else {
      // Handle single selection
      const newValue = value === optionValue ? null : optionValue;
      onChange(newValue);
    }
  };

  const isSelected = (optionValue: string) => {
    return multiple
      ? Array.isArray(value) && value.includes(optionValue)
      : value === optionValue;
  };

  return (
    <div className={className}>
      {label && (
        <p className="mb-2 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={`
              flex flex-col items-center p-1 border rounded-lg cursor-pointer transition-all
              ${isSelected(option.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${inValid ? 'border-destructive' : ''}
              hover:border-gray-300
            `}
          >
      {/* <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-md"> */}
  <div className="w-30 h-30 relative">
    <Image
      src={option.imgSrc}
      alt={option.label || 'img'}
      fill
      className="object-contain"
      loading="lazy"
      priority={false}
      unoptimized={true}
    />
  </div>
            <span className="text-sm font-medium">{option.label}</span>
          </div>
        ))}
      </div>

      {inValid && (
        <p className="mt-1 text-xs text-destructive">{error || 'This field is required'}</p>
      )}
    </div>
  );
}
// import * as React from 'react';
// import Image from 'next/image';

// type ImageCheckboxOption = {
//   value: string;
//   label: string;
//   imgSrc: string;
// };

// type ImageCheckboxProps = {
//   label?: string;
//   options: ImageCheckboxOption[];
//   value: string[] | string | null;
//   onChange: (value: string[] | string | null) => void;
//   className?: string;
//   required?: boolean;
//   multiple?: boolean;
//   inValid?: boolean;
//   error?: string;
// };

// export function ImageCheckbox({
//   label,
//   options,
//   value,
//   onChange,
//   className,
//   required = false,
//   multiple = false,
//   inValid = false,
//   error,
// }: ImageCheckboxProps) {
//   const handleChange = (optionValue: string) => {
//     if (multiple) {
//       // Handle multiple selection
//       const currentValue = Array.isArray(value) ? value : [];
//       const newValue = currentValue.includes(optionValue)
//         ? currentValue.filter(v => v !== optionValue)
//         : [...currentValue, optionValue];
//       onChange(newValue.length > 0 ? newValue : null);
//     } else {
//       // Handle single selection
//       const newValue = value === optionValue ? null : optionValue;
//       onChange(newValue);
//     }
//   };

//   const isSelected = (optionValue: string) => {
//     return multiple
//       ? Array.isArray(value) && value.includes(optionValue)
//       : value === optionValue;
//   };

//   return (
//     <div className={className}>
//       {label && (
//         <p className="mb-2 text-sm font-medium">
//           {label} {required && <span className="text-red-500">*</span>}
//         </p>
//       )}
      
//       <div className="flex flex-wrap gap-3">
//         {options.map((option) => (
//           <div
//             key={option.value}
//             onClick={() => handleChange(option.value)}
//             className={`
//               flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all
//               ${isSelected(option.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
//               ${inValid ? 'border-destructive' : ''}
//               hover:border-gray-300
//             `}
//           >
//             <div className="w-16 h-16 relative mb-2">
//               <Image
//                 src={option.imgSrc}
//                 alt={option.label}
//                 fill
//                 className="object-contain rounded-full"
//                 sizes="64px"
//               />
//             </div>
//             <span className="text-sm font-medium">{option.label}</span>
//           </div>
//         ))}
//       </div>

//       {inValid && (
//         <p className="mt-1 text-xs text-destructive">{error || 'This field is required'}</p>
//       )}
//     </div>
//   );
// }
//---- multiple ---------------------------------------------
// import * as React from 'react';
// import Image from 'next/image';

// type ImageCheckboxProps = {
//   label?: string;
//   options: Array<{
//     value: string;
//     label: string;
//     imgSrc: string;
//   }>;
//   value: string[];
//   onChange: (value: string[]) => void;
//   className?: string;
//   required?: boolean;
//   inValid?: boolean;
//   error?: string;
// };

// export function ImageCheckbox({
//   label,
//   options,
//   value = [],
//   onChange,
//   required,
//   inValid,
//   error,
//   className,
// }: ImageCheckboxProps) {
//   const handleChange = (optionValue: string) => {
//     const newValue = value.includes(optionValue)
//       ? value.filter(v => v !== optionValue)
//       : [...value, optionValue];
//     onChange(newValue);
//   };

//   return (
//     <div className={className}>
//       {label && (
//         <p className="mb-2 text-sm font-medium">
//           {label} {required && <span className="text-red-500">*</span>}
//         </p>
//       )}
      
//       <div className="flex flex-wrap gap-3">
//       Finish/ Usage
//         {options.map((option) => (
//           <div
//             key={option.value}
//             onClick={() => handleChange(option.value)}
//             className={`
//               flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all
//               ${value.includes(option.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
//               ${inValid ? 'border-destructive' : ''}
//               hover:border-gray-300
//             `}
//           >
            
//             <div className="w-16 h-16 relative mb-2">
//               <Image
//                 src={option.imgSrc}
//                 alt={option.label}
//                 width={500}
//                 height={500}
//                 // fill
//                 className="object-contain rounded-full"
//               />
//             </div>
//             <span className="text-sm font-medium">{option.label}</span>
//           </div>
//         ))}
//       </div>

//       {inValid && (
//         <p className="mt-1 text-xs text-destructive">{error || 'This field is required'}</p>
//       )}
//     </div>
//   );
// }