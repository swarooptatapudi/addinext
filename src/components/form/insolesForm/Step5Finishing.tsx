import { Input } from "@/components/ui/input";
import { SelectBox } from "@/components/ui/selectbox";
import { ImageCheckbox } from "./ImgproCheck";
import { useState } from "react";

import {thicknessToUsageMap,usageToThicknessMap} from '@/app/(pages)/(protected-routes)/orders/new-order/_child/constants';

type LayeringImageType = {
  standard: string;
  premium: string;
  name: string;
};

type LayeringImagesKey = 'city-comfort' | 'endurance' | 'sensitive' | 'sports' | 'diabetic';

type FinishOption = {
  value: string;
  label: string;
  imgSrc: string;
};

type SelectedFinishOption = {
  value: string;
  type: 'standard' | 'premium';
};

export const Step5 = ({
  values,
  errors,
  touched,
  setFieldValue,
  FORM_OPTIONS,
}: any) => {
  const [selectedFinishOptions, setSelectedFinishOptions] = useState<SelectedFinishOption[]>([]);
 
const [selectedType, setSelectedType] = useState<'standard' | 'premium'>('standard');


  const isAddiEase = values.model_name === 'AddiEase';
  const isAddiEaseEco = values.model_name === 'AddiEaseEco';
  const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const isDesignBySelf = values.Design_by === 'Self';
// const isPrintBySelf = values.Print_by === 'Self';
// const hideLaticesAndFinish = isDesignBySelf && isPrintBySelf;


  const LAYERING_IMAGES: Record<LayeringImagesKey, LayeringImageType> = {
    'city-comfort': {
      standard: '/assets/order-forms/insoles/City_Standard.png',
      premium: '/assets/order-forms/insoles/City_premium.png',
      name: 'City Comfort'
    },
    'endurance': {
      standard: '/assets/order-forms/insoles/Endurance_standard.png',
      premium: '/assets/order-forms/insoles/Endurance_premium.png',
      name: 'Endurance'
    },
    'sensitive': {
      standard: '/assets/order-forms/insoles/Sensitive_standard.png',
      premium: '/assets/order-forms/insoles/standard_premium.png',
      name: 'Sensitive'
    },
    'sports': {
      standard: '/assets/order-forms/insoles/sports_standard.png',
      premium: '/assets/order-forms/insoles/sports_premium.png',
      name: 'Sports'
    },
    'diabetic': {
      standard: '/assets/order-forms/insoles/diabetic_standardpng.png',
      premium: '/assets/order-forms/insoles/diabetic_premium.png',
      name: 'Diabetic'
    }
  };

  const getImageSet = (option: string): LayeringImageType | undefined => {
    if (!option) return undefined;
    
    const normalizedKey = option.toLowerCase()
      .replace(/\s+/g, '-')
      .trim() as LayeringImagesKey;

    if (LAYERING_IMAGES[normalizedKey]) {
      return LAYERING_IMAGES[normalizedKey];
    }

    return Object.values(LAYERING_IMAGES).find(img => 
      img.name.toLowerCase() === option?.toLowerCase()
    );
  };

  

  const handleFinishOptionSelect = (option: FinishOption) => {
    setSelectedFinishOptions(prev => {
      const exists = prev.find(item => item.value === option.value);
      if (exists) {
        return prev.filter(item => item.value !== option.value);
      } else {
        return [...prev, { value: option.value, type: 'standard' }];
      }
    });
  };

  const handleTypeSelect = (optionValue: string, type: 'standard' | 'premium') => {
    setSelectedFinishOptions(prev =>
      prev.map(item =>
        item.value === optionValue ? { ...item, type } : item
      )
    );
    setFieldValue(`finish_options.${optionValue}`, type);
  };

  const getFinishOptions = () => {
    if (isAddiEase ) {
      return [
        { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
        { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'colour', label: 'colour', color: 'bg-neutral-500 text-neutral-100' },
      ];
    } else if (isAddiEaseEco) {
      return [
        { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
        { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
      ];
    }
    return [];
  };


  
 // Define mapping (string thickness → usage option)


  
  const finishOptions = getFinishOptions();
  const options: FinishOption[] = [
    { value: 'city-comfort', label: 'City Comfort', imgSrc: '/assets/order-forms/insoles/City_Comfort.png' },
    { value: 'endurance', label: 'Endurance', imgSrc: '/assets/order-forms/insoles/Endurance.png' },
    { value: 'sensitive', label: 'Sensitive', imgSrc: '/assets/order-forms/insoles/Sensitive.png' },
    { value: 'sports', label: 'Sports', imgSrc: '/assets/order-forms/insoles/Sports.png' },
    { value: 'diabetic', label: 'Diabetic', imgSrc: '/assets/order-forms/insoles/Diabetics.png' },
  ];
   const selectedInsole = options.find(option => option.label === values.usage);
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold mt-5 text-primary">Design & Printing</h3>
      {/* Design By Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <div className="flex items-center">
          <label className="font-sm min-w-[100px] text-sm">Design by :</label>
          <div className="w-[250px]">
            <SelectBox
              options={FORM_OPTIONS.Design_by || []}
              value={values.Design_by}
              onValueChange={(value) => setFieldValue('Design_by', value)}
              inVaild={!!errors.Design_by && !!touched.Design_by}
              required
            />
            {errors.Design_by && touched.Design_by && (
              <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
            )}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-2">
        <div className="flex items-center">
          <label className="font-medium min-w-[100px] text-sm">Print by :</label>
          <div className="w-[250px]">
            <SelectBox
              options={FORM_OPTIONS.Print_by || []}
              value={values.Print_by}
              onValueChange={(value) => setFieldValue('Print_by', value)}
              inVaild={!!errors.Print_by && !!touched.Print_by}
              required
            />
            {errors.Print_by && touched.Print_by && (
              <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
            )}
          </div>
        </div>
      </div>

      {isAddiEase && (
        <div className="grid md:grid-cols-2 gap-6 mt-2">
          <div className="flex items-center">
            <label className="font-medium min-w-[100px] text-sm">Extras Latices:</label>
            <div className="w-[250px]">
              <SelectBox
                options={FORM_OPTIONS.Latices || []}
                value={values.Latices || ''}
                onValueChange={(value) => setFieldValue('Latices', value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-2">
        <div className="flex items-center">
          <div className="grid md:grid-cols-2 gap-6 mt-2"> 
         <div className="flex items-center">
  <label className="font-medium min-w-[100px] text-sm">Thickness:</label>
  <input
    type="text"
    name="thickness"
    className="border rounded px-2 py-1 w-[350px] rounded-md"
    placeholder="Enter thickness"
   
  />
</div>

          </div>
         
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-2">
        <div className="flex items-center">
          <label className="font-medium min-w-[100px] text-sm">Insole Type</label>
          <div className="w-[250px]">
           <Input
  placeholder=""
  value={thicknessToUsageMap[values.thickness] || ""}   // show text instead of number
  onChange={(e) => {
    const newText = e.target.value;

    // find the number (key) for this usage text
    const matchingThickness = Object.entries(thicknessToUsageMap)
      .find(([key, usage]) => usage === newText)?.[0];

    if (matchingThickness) {
      setFieldValue("thickness", matchingThickness); // store number internally
      setFieldValue("usage", newText);              // store text for usage
    } else {
      // if no match, allow free text (optional)
      setFieldValue("thickness", "");
      setFieldValue("usage", "");
    }
  }}
/>


            
          </div>
        </div>
      </div>
            {values.insole_model !=='AddiSole' ?(<>
          <div className="flex gap-8 mb-8 -mt-[230px] ml-[416px]">
           <div>
             <h2 className="text-xl font-medium mb-4 text-center">Thickness Selection Chart for  {values.insole_model}</h2>
             <div className="border border-gray-300">
               <table className="w-[600px] text-sm">
                 <thead>
                   <tr className="bg-gray-100">
                     <th rowSpan={2} className="border p-1 text-left">
                       PATIENT
                       <br />
                       WEIGHT
                     </th>
                     <th className="border p-1 text-center">KG</th>
                     <th className="border p-1 text-center">0 - 40</th>
                     <th className="border p-1 text-center">40 - 60</th>
                     <th className="border p-1 text-center">60 - 80</th>
                     <th className="border p-1 text-center">80 - 100</th>
                     <th className="border p-1 text-center">100+</th>
                   </tr>
                   <tr className="bg-gray-100">
                     <th className="border p-1 text-center">LBS</th>
                     <th className="border p-1 text-center">0 - 88</th>
                     <th className="border p-1 text-center">88 - 132</th>
                     <th className="border p-1 text-center">132 - 176</th>
                     <th className="border p-1 text-center">176 - 220</th>
                     <th className="border p-1 text-center">220+</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td rowSpan={3} className="border p-1 text-left">
                       LEVEL OF ACTIVITY
                     </td>
                     <td className="border p-1 text-center">LOW</td>
                     <td className="border p-1 text-center bg-[#d0e6f5]">2 MM</td>
                     <td className="border p-1 text-center bg-[#a7d1f0]">2.5 MM</td>
                     <td className="border p-1 text-center bg-[#4a95d8]">3 MM</td>
                     <td className="border p-1 text-center bg-[#2a6cb8]">3.5 MM</td>
                     <td className="border p-1 text-center bg-[#0a4a98]">4 MM</td>
                   </tr>
                   <tr>
                     <td className="border p-1 text-center">MID</td>
                     <td className="border p-1 text-center bg-[#a7d1f0]">2.5 MM</td>
                     <td colSpan={2} className="border p-1 text-center bg-[#4a95d8]">
                       3 MM
                     </td>
                     <td className="border p-1 text-center bg-[#2a6cb8]">3.5 MM</td>
                     <td className="border p-1 text-center bg-[#0a4a98]">4 MM</td>
                   </tr>
                   <tr>
                     <td className="border p-1 text-center">HIGH</td>
                     <td className="border p-1 text-center bg-[#a7d1f0]">3 MM</td>
                     <td colSpan={1} className="border p-1 text-center bg-[#4a95d8]">
                       3.5 MM
                     </td>
                     <td colSpan={2} className="border p-1 text-center  bg-[#0a4a98]">
                       4 MM
                     </td>
                     <td colSpan={2} className="border p-1 text-center bg-[#0a4a98]">
                       4.5 MM
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>        
         </div>
         </>):<>
         <div className="flex gap-8 mb-8 -mt-[230px] ml-[416px]">
           <div>
             <h2 className="text-xl font-medium mb-4 text-center">Thickness Selection Chart for {values.insole_model}</h2>
             <div className="border border-gray-300">
             <table className="w-[600px] text-sm">
                 <thead>
                   <tr className="bg-gray-100">
                     <th rowSpan={2} className="border p-1 text-left">
                       PATIENT
                       <br />
                       WEIGHT
                     </th>
                     <th className="border p-1 text-center">KG</th>
                     <th className="border p-1 text-center">0 - 40</th>
                     <th className="border p-1 text-center">40 - 60</th>
                     <th className="border p-1 text-center">60 - 80</th>
                     <th className="border p-1 text-center">80 - 100</th>
                     <th className="border p-1 text-center">100+</th>
                   </tr>
                   <tr className="bg-gray-100">
                     <th className="border p-1 text-center">LBS</th>
                     <th className="border p-1 text-center">0 - 88</th>
                     <th className="border p-1 text-center">88 - 132</th>
                     <th className="border p-1 text-center">132 - 176</th>
                     <th className="border p-1 text-center">176 - 220</th>
                     <th className="border p-1 text-center">220+</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td rowSpan={3} className="border p-1 text-left">
                       LEVEL OF ACTIVITY
                     </td>
                     <td className="border p-1 text-center">LOW</td>
                     <td className="border p-1 text-center bg-[#d0e6f5]">2.5 MM</td>
                     <td className="border p-1 text-center bg-[#a7d1f0]">3 MM</td>
                     <td className="border p-1 text-center bg-[#4a95d8]">3.5 MM</td>
                     <td className="border p-1 text-center bg-[#2a6cb8]">4 MM</td>
                     <td className="border p-1 text-center bg-[#0a4a98]">4.5 MM</td>
                   </tr>
                   <tr>
                     <td className="border p-1 text-center">MID</td>
                     <td className="border p-1 text-center bg-[#a7d1f0]">3 MM</td>
                     <td colSpan={2} className="border p-1 text-center bg-[#4a95d8]">
                       3.5 MM
                     </td>
                     <td className="border p-1 text-center bg-[#2a6cb8]">4 MM</td>
                     <td className="border p-1 text-center bg-[#0a4a98]">4.5 MM</td>
                   </tr>
                   <tr>
                     <td className="border p-1 text-center">HIGH</td>
                     <td className="border p-1 text-center bg-[#a7d1f0]">3.5 MM</td>
                     <td colSpan={1} className="border p-1 text-center bg-[#4a95d8]">
                       4 MM
                     </td>
                     <td colSpan={2} className="border p-1 text-center  bg-[#0a4a98]">
                       4.5 MM
                     </td>
                     <td colSpan={2} className="border p-1 text-center bg-[#0a4a98]">
                       5 MM
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
         </div>
         </>}

         

      {/* Finish Section */}
      {showFinishOptions && (
        <div className="space-y-4 mt-5">
          <label className="font-medium text-sm">Finish:</label>
          <div className="ml-10 mb-5">
            <div className="flex items-center gap-10 -mt-7 ml-8">
              {finishOptions.map((option) => (
                <label key={option.value} className="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    name="finish_type"
                    value={option.value}
                    checked={values.finish_type === option.value}
                    onChange={() => setFieldValue('finish_type', option.value)}
                    className="sr-only peer"
                  />
                  <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                    values.finish_type === option.value 
                      ? 'border-blue-200 ring-2 ring-blue-300' 
                      : 'border-gray-300'
                  }`} />
                  <span className="text-sm mt-1 capitalize">
                    {option.label}
                  </span>
                </label>
                 ))}
               </div>
               {errors.finish_type && touched.finish_type && (
               <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
              )}
             </div>
            </div>
          )}
              {/* <div className="mt-20">
                <h3 className="text-lg font-medium mb-[-40px]">Finish/ Usage</h3>
                <div className="ml-45">
                <ImageCheckbox 
          options={options}
          value={selectedFinishOptions.length > 0 ? selectedFinishOptions[0].value : ''}
          onChange={(value) => {
            if (value) {
              setSelectedFinishOptions([{
                value,
                type: selectedFinishOptions.find(o => o.value === value)?.type || 'standard'
              }]);
            } else {
              setSelectedFinishOptions([]);
            }
          }}
        />
        </div>
      </div> */}
  <div className="mt-20">
  {/* <p className="text-lg font-semibold mb-4 ml-5">Standard/ Premium options</p> */}

  <div className="flex flex-col gap-6 ml-5">
    {/* Standard */}
   {/* Standard */}
<label className="flex items-start gap-3 cursor-pointer">
  <input
    type="radio"
    name="insoleType"  // must match Formik field
    checked={values.insoleType === "standard"}
    onChange={() => setFieldValue("insoleType", "standard")}
    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
  />
  <div className="flex flex-col md:flex-row md:items-center gap-4">
    <div>
      <span className="text-base font-medium">Standard</span>
      {values.insoleType === "standard" && (
        <p className="mt-1 text-sm text-gray-600 leading-relaxed max-w-md">
          Functional cushioning designed for regular use. Provides reliable
          comfort and support for the intended purpose of the insole
          (walking, endurance, sports, or medical use).
        </p>
      )}
    </div>
    {values.insoleType === "standard" && selectedInsole && (
      <img
        src={selectedInsole.imgSrc}
        alt={selectedInsole.label}
        className="w-[160px] h-auto border rounded-xl shadow-md"
      />
    )}
  </div>
</label>

{/* Premium */}
<label className="flex items-start gap-3 cursor-pointer">
  <input
    type="radio"
    name="insoleType"
    checked={values.insoleType === "premium"}
    onChange={() => setFieldValue("insoleType", "premium")}
    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
  />
  <div className="flex flex-col md:flex-row md:items-center gap-4">
    <div>
      <span className="text-base font-medium">Premium</span>
      {values.insoleType === "premium" && (
        <p className="mt-1 text-sm text-gray-600 leading-relaxed max-w-md">
          Advanced cushioning with enhanced softness, shock absorption, and
          pressure distribution. Recommended for sensitive feet, extended
          usage hours, or patients needing higher protection and comfort.
        </p>
      )}
    </div>
    {values.insoleType === "premium" && selectedInsole && (
      <img
        src={selectedInsole.imgSrc}
        alt={selectedInsole.label}
        className="w-[160px] h-auto border rounded-xl shadow-md"
      />
    )}
  </div>
</label>

  </div>
</div>





      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-2 ml-45">
        {selectedFinishOptions.map((option, index) => {
          const imageSet = getImageSet(option.value);
          const optionData = options.find(opt => opt.value === option.value);

          return (
            <div key={index} className="flex flex-col items-center  border rounded-lg">
              <h4 className="font-xs">{optionData?.label}</h4>
              <div className="flex gap-4">
                <div 
                  className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
                    option.type === 'standard' ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => handleTypeSelect(option.value, 'standard')}
                >
                  <p className="text-xs font-medium mb-1">Standard</p>
                  <div className="w-24 h-16 flex items-center justify-center">
                    {imageSet?.standard ? (
                      <img 
                        src={imageSet.standard} 
                        alt={`${option.value} Standard`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    <input
                      type="radio"
                      name={`finish-${option.value}-type`}
                      checked={option.type === 'standard'}
                      onChange={() => handleTypeSelect(option.value, 'standard')}
                      className="mr-1"
                    />
                    {/* <label className="text-sm">Select</label> */}
                  </div>
                </div>

                <div 
                  className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
                    option.type === 'premium' ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => handleTypeSelect(option.value, 'premium')}
                >
                  <p className="text-xs font-medium mb-1">Premium</p>
                  <div className="w-24 h-16 flex items-center justify-center">
                    {imageSet?.premium ? (
                      <img 
                        src={imageSet.premium} 
                        alt={`${option.value} Premium`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    <input
                      type="radio"
                      name={`finish-${option.value}-type`}
                      checked={option.type === 'premium'}
                      onChange={() => handleTypeSelect(option.value, 'premium')}
                      className="mr-1"
                    />
                    {/* <label className="text-sm">Select</label> */}
                  </div>
                </div>
              </div>
              {/* <div className="mt-2 text-sm font-medium">
                Selected: <span className="text-blue-600">{option.type === 'standard' ? 'Standard' : 'Premium'}</span>
              </div> */}
</div>
          );
        })}
      </div>
                    <p>Disclaimer : Actual product may vary in appearance from the images shown, without compromising on quality or functionality</p>
             <p>The color of the insole padding may vary depending on material availability.
</p>
    </div>
  );
};

// -----------It is working now ----------------------------

// import { Input } from "@/components/ui/input";
// import { SelectBox } from "@/components/ui/selectbox";
// import { ImageCheckbox } from "./ImgproCheck";
// import { Key } from "react";

// type LayeringImageType = {
//   standard: string;
//   premium: string;
//   name: string;
// };

// type LayeringImagesKey = 'city-comfort' | 'endurance' | 'sensitive' | 'sports' | 'diabetic';

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   setSelectedOptions,
//   selectedOptions=[]
// }: any) => {
  
 
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;


//     const LAYERING_IMAGES: Record<LayeringImagesKey, LayeringImageType> = {

//     'city-comfort': {
//       standard: '/assets/order-forms/insoles/City_Standard.png',
//       premium: '/assets/order-forms/insoles/City_premium.png',
//       name: 'City Comfort'
//     },
//     'endurance': {
//       standard: '/assets/order-forms/insoles/Endurance_standard.png',
//       premium: '/assets/order-forms/insoles/Endurance_premium.png',
//       name: 'Endurance'
//     },
//     'sensitive': {
//       standard: '/assets/order-forms/insoles/Sensitive_standard.png',
//       premium: '/assets/order-forms/insoles/standard_premium.png',
//       name: 'Sensitive'
//     },
//     'sports': {
//       standard: '/assets/order-forms/insoles/sports_standard.png',
//       premium: '/assets/order-forms/insoles/sports_premium.png',
//       name: 'Sports'
//     },
//     'diabetic': {
//       standard: '/assets/order-forms/insoles/diabetic_standardpng.png',
//       premium: '/assets/order-forms/insoles/diabetic_premium.png',
//       name: 'Diabetic'
//     }
//   };

//   const getImageSet = (option: any): LayeringImageType | undefined => {
    
//     if (!option) {
//       console.error("No option name provided");
//       return undefined;
//     }
  
//     // Normalize the key (handle multiple spaces if needed)
//     const normalizedKey = option.toLowerCase()
//       .replace(/\s+/g, '-')  // Replace all spaces with single hyphen
//       .trim() as LayeringImagesKey;
  
//     console.log("Normalized key:", normalizedKey, "Original name:", option);
  
//     // 1. Try direct key access
//     if (LAYERING_IMAGES[normalizedKey]) {
//       console.log("Found by direct key:", normalizedKey);
//       return LAYERING_IMAGES[normalizedKey];
//     }
  
//     // 2. Try case-insensitive name matching
//     const foundByName = Object.values(LAYERING_IMAGES).find(img => 
//       img.name.toLowerCase() === option?.toLowerCase()
//     );
  
//     if (foundByName) {
//       console.log("Found by name match:", foundByName.name);
//       return foundByName;
//     }
  
//     console.warn("No matching image set found for:", option);
//     return undefined;
//   };

//   // Finish options configuration
//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
//         { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'colour', label: 'colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
//         { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };

//   const finishOptions = getFinishOptions();
//   const options = [
//     // D:\COMPANY\addiwise-customer-portal-main\public\assets\order-forms\insoles\City_Comfort.png
//     { value: 'city-comfort', label: 'City Comfort', imgSrc: '/assets/order-forms/insoles/City_Comfort.png' },
//     { value: 'endurance', label: 'Endurance', imgSrc: '/assets/order-forms/insoles/Endurance.png' },
//     { value: 'sensitive', label: 'Sensitive', imgSrc: '/assets/order-forms/insoles/Sensitive.png' },
//     { value: 'sports', label: 'Sports', imgSrc: '/assets/order-forms/insoles/Sports.png' },
//     { value: 'diabetic', label: 'Diabetic', imgSrc: '/assets/order-forms/insoles/Diabetics.png' },
//   ];
//   return (
//     <div className="flex flex-col gap-4">
//       <h3 className="text-lg font-semibold mt-5">Design & Printing</h3>
      
//       {/* Design By Section */}
//       <div className="grid md:grid-cols-2 gap-6 mt-5">
//         <div className="flex items-center">
//           <label className="font-sm min-w-[100px] text-sm">Design by :</label>
//           <div className="w-[250px]">
//             <SelectBox
//               options={FORM_OPTIONS.Design_by || []}
//               value={values.Design_by}
//               onValueChange={(value) => setFieldValue('Design_by', value)}
//               inVaild={!!errors.Design_by && !!touched.Design_by}
//               required
//             />
//             {errors.Design_by && touched.Design_by && (
//               <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Print By Section */}
//       <div className="grid md:grid-cols-2 gap-6 mt-2">
//         <div className="flex items-center">
//           <label className="font-medium min-w-[100px] text-sm">Print by :</label>
//           <div className="w-[250px]">
//             <SelectBox
//               options={FORM_OPTIONS.Print_by || []}
//               value={values.Print_by}
//               onValueChange={(value) => setFieldValue('Print_by', value)}
//               inVaild={!!errors.Print_by && !!touched.Print_by}
//               required
//             />
//             {errors.Print_by && touched.Print_by && (
//               <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {isAddiEase && (
//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center">
//             <label className="font-medium min-w-[100px] text-sm">Extras Latices:</label>
//             <div className="w-[250px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Latices || []}
//                 value={values.Latices || ''}
//                 onValueChange={(value) => setFieldValue('Latices', value)}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center">
//             <label className="font-medium min-w-[100px] text-sm">Thickness:</label>
//             <div className="w-[250px]">
//             <Input 
//           placeholder="Thickness number"
//         />
//             </div>
//           </div>
//         </div>

//       {/* Finish Section */}
//           {showFinishOptions ? (
//       <div className="space-y-4 mt-5">
//         <label className="font-medium text-sm">Finish:</label>
//         <div className="ml-10 mb-5">
//             <div className="flex items-center gap-10 -mt-7 ml-8">
//               {finishOptions.map((option) => (
//                 <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="finish_type"
//                     value={option.value}
//                     checked={values.finish_type === option.value}
//                     onChange={() => setFieldValue('finish_type', option.value)}
//                     className="sr-only peer"
//                   />
//                   <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                     values.finish_type === option.value 
//                       ? 'border-blue-200 ring-2 ring-blue-300' 
//                       : 'border-gray-300'
//                   }`} />
//                   <span className="text-sm mt-1 capitalize">
//                     {option.label}
//                   </span>
//                 </label>
//               ))}
//             </div>
          
//           {errors.finish_type && touched.finish_type && (
//             <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//           )}
//         </div>
        
//       </div>
//         ) : (
//           <div className="ml-26 text-gray-500"></div>
//         )}
        
//         {values.insole_model !=='AddiSole' ?(<>
//          <div className="flex gap-8 mb-8 -mt-[230px] ml-[416px]">
//           <div>
//             <h2 className="text-xl font-medium mb-4 text-center">Thickness Selection Chart for  {values.insole_model}</h2>
//             <div className="border border-gray-300">
//               <table className="w-[600px] text-sm">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th rowSpan={2} className="border p-1 text-left">
//                       PATIENT
//                       <br />
//                       WEIGHT
//                     </th>
//                     <th className="border p-1 text-center">KG</th>
//                     <th className="border p-1 text-center">0 - 40</th>
//                     <th className="border p-1 text-center">40 - 60</th>
//                     <th className="border p-1 text-center">60 - 80</th>
//                     <th className="border p-1 text-center">80 - 100</th>
//                     <th className="border p-1 text-center">100+</th>
//                   </tr>
//                   <tr className="bg-gray-100">
//                     <th className="border p-1 text-center">LBS</th>
//                     <th className="border p-1 text-center">0 - 88</th>
//                     <th className="border p-1 text-center">88 - 132</th>
//                     <th className="border p-1 text-center">132 - 176</th>
//                     <th className="border p-1 text-center">176 - 220</th>
//                     <th className="border p-1 text-center">220+</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td rowSpan={3} className="border p-1 text-left">
//                       LEVEL OF ACTIVITY
//                     </td>
//                     <td className="border p-1 text-center">LOW</td>
//                     <td className="border p-1 text-center bg-[#d0e6f5]">2 MM</td>
//                     <td className="border p-1 text-center bg-[#a7d1f0]">2.5 MM</td>
//                     <td className="border p-1 text-center bg-[#4a95d8]">3 MM</td>
//                     <td className="border p-1 text-center bg-[#2a6cb8]">3.5 MM</td>
//                     <td className="border p-1 text-center bg-[#0a4a98]">4 MM</td>
//                   </tr>
//                   <tr>
//                     <td className="border p-1 text-center">MID</td>
//                     <td className="border p-1 text-center bg-[#a7d1f0]">2.5 MM</td>
//                     <td colSpan={2} className="border p-1 text-center bg-[#4a95d8]">
//                       3 MM
//                     </td>
//                     <td className="border p-1 text-center bg-[#2a6cb8]">3.5 MM</td>
//                     <td className="border p-1 text-center bg-[#0a4a98]">4 MM</td>
//                   </tr>
//                   <tr>
//                     <td className="border p-1 text-center">HIGH</td>
//                     <td className="border p-1 text-center bg-[#a7d1f0]">3 MM</td>
//                     <td colSpan={1} className="border p-1 text-center bg-[#4a95d8]">
//                       3.5 MM
//                     </td>
//                     <td colSpan={2} className="border p-1 text-center  bg-[#0a4a98]">
//                       4 MM
//                     </td>
//                     <td colSpan={2} className="border p-1 text-center bg-[#0a4a98]">
//                       4.5 MM
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
          
//         </div>
//         </>):<>
//         <div className="flex gap-8 mb-8 -mt-[230px] ml-[416px]">
//           <div>
//             <h2 className="text-xl font-medium mb-4 text-center">Thickness Selection Chart for {values.insole_model}</h2>
//             <div className="border border-gray-300">
//             <table className="w-[600px] text-sm">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th rowSpan={2} className="border p-1 text-left">
//                       PATIENT
//                       <br />
//                       WEIGHT
//                     </th>
//                     <th className="border p-1 text-center">KG</th>
//                     <th className="border p-1 text-center">0 - 40</th>
//                     <th className="border p-1 text-center">40 - 60</th>
//                     <th className="border p-1 text-center">60 - 80</th>
//                     <th className="border p-1 text-center">80 - 100</th>
//                     <th className="border p-1 text-center">100+</th>
//                   </tr>
//                   <tr className="bg-gray-100">
//                     <th className="border p-1 text-center">LBS</th>
//                     <th className="border p-1 text-center">0 - 88</th>
//                     <th className="border p-1 text-center">88 - 132</th>
//                     <th className="border p-1 text-center">132 - 176</th>
//                     <th className="border p-1 text-center">176 - 220</th>
//                     <th className="border p-1 text-center">220+</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td rowSpan={3} className="border p-1 text-left">
//                       LEVEL OF ACTIVITY
//                     </td>
//                     <td className="border p-1 text-center">LOW</td>
//                     <td className="border p-1 text-center bg-[#d0e6f5]">2.5 MM</td>
//                     <td className="border p-1 text-center bg-[#a7d1f0]">3 MM</td>
//                     <td className="border p-1 text-center bg-[#4a95d8]">3.5 MM</td>
//                     <td className="border p-1 text-center bg-[#2a6cb8]">4 MM</td>
//                     <td className="border p-1 text-center bg-[#0a4a98]">4.5 MM</td>
//                   </tr>
//                   <tr>
//                     <td className="border p-1 text-center">MID</td>
//                     <td className="border p-1 text-center bg-[#a7d1f0]">3 MM</td>
//                     <td colSpan={2} className="border p-1 text-center bg-[#4a95d8]">
//                       3.5 MM
//                     </td>
//                     <td className="border p-1 text-center bg-[#2a6cb8]">4 MM</td>
//                     <td className="border p-1 text-center bg-[#0a4a98]">4.5 MM</td>
//                   </tr>
//                   <tr>
//                     <td className="border p-1 text-center">HIGH</td>
//                     <td className="border p-1 text-center bg-[#a7d1f0]">3.5 MM</td>
//                     <td colSpan={1} className="border p-1 text-center bg-[#4a95d8]">
//                       4 MM
//                     </td>
//                     <td colSpan={2} className="border p-1 text-center  bg-[#0a4a98]">
//                       4.5 MM
//                     </td>
//                     <td colSpan={2} className="border p-1 text-center bg-[#0a4a98]">
//                       5 MM
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//         </>}

        
         
//       <div className="mt-10">
//   <h3 className="text-lg font-medium mb-[-35]">Finish/ Usage</h3>
//   <div className="ml-40">
//     <ImageCheckbox 
//        options={options}
//       value={selectedOptions}
//       onChange={setSelectedOptions}
//       // multiple={true}
//     />
//   </div>
// </div>
// <div className="grid grid-cols-5 gap-1">
//         {(Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions].filter(Boolean))
//           .map((option: string, index: number) => {
//             const imageSet = getImageSet(option);
//             return (
//               <div key={index} className="flex flex-col items-center">
//                 <div className="flex gap-2 mb-2 ml-72">
//                   <div className="text-center">
//                     <p className="text-xs">Standard</p>
//                     <div className="w-30 h-12 mb-1">
//                       {imageSet?.standard ? (
//                         <img 
//                           src={imageSet.standard} 
//                           alt={`${option} Standard`}
//                           className="w-full h-full object-contain"
//                         />
//                       ) : (
//                         <div className="w-12 h-8 bg-[#333333]"></div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-xs">Premium</p>
//                     <div className="w-30 h-12 mb-1">
//                       {imageSet?.premium ? (
//                         <img 
//                           src={imageSet.premium} 
//                           alt={`${option} Premium`}
//                           className="w-full h-full object-contain"
//                         />
//                       ) : (
//                         <div className="w-12 h-8 bg-[#3a8bd8]"></div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         }
//       </div>
//     </div>
//   );
// };