'use client';
import { useState, useEffect } from 'react';
import { SelectBox } from "@/components/ui/selectbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BookmarkIcon, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 
import { Label } from '@/components/ui/label';

export const Step5 = ({
  values,
  errors,
  touched,
  setFieldValue,
  FORM_OPTIONS,
  selectedItem,
  handleSubmit,
  currentStep, 
  isActiveStep,
  setEstimateConform
}: any) => {
  const [showEstimateCard, setShowEstimateCard] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);
  const [estimateDataLabel, setEstimateDataLabel] = useState<any>("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [getBKEstimate] = useGetBKEstimateMutation();
  const [prevValues, setPrevValues] = useState(values);
  const [isEstimateAccepted, setIsEstimateAccepted] = useState(false);
  const [isEstimateStale, setIsEstimateStale] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showLaticesField, setShowLaticesField] = useState(false);

  const isAddiEase = values.model_name === 'AddiEase';
  const isAddiEaseEco = values.model_name === 'AddiEaseEco';
  const showFinishOptions = isAddiEase || isAddiEaseEco;

  useEffect(() => {
    if (!isActiveStep) {
      setShowEstimateCard(false);
      setEstimateData(null);
      setInitialLoad(true);
    }
  }, [isActiveStep]);
  // Set default finish type when model changes
  useEffect(() => {
    if (showFinishOptions && !values.finish_type || initialLoad) {
      if (isAddiEase) {
        setFieldValue('finish_type', 'Bead Blast');
      } else if (isAddiEaseEco) {
        setFieldValue('finish_type', 'Bead Blast');
      }
    }
    setShowLaticesField(isAddiEase);
  }, [values.model_name, showFinishOptions, isAddiEase, isAddiEaseEco, setFieldValue, initialLoad]);

  // Effect to mark estimate as stale when form values change
  useEffect(() => {
    if (showEstimateCard  && !initialLoad) {
      const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
      const hasChanged = relevantFields.some(
        field => values[field] !== prevValues[field]
      );
      
      if (hasChanged) {
        setIsEstimateStale(true);
        setIsEstimateAccepted(false);
      }
    }
    
    setPrevValues(values);
  }, [values, showEstimateCard, prevValues,initialLoad]);
  useEffect(() => {
    if (isActiveStep) {
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isActiveStep]);
  const validateBeforeAction = () => {
    if (!selectedItem) {
      toast.error('Please complete the basic form first');
      return false;
    }
    if (!values.Design_by) {
      toast.error('Please select Design by');
      return false;
    }
    if (!values.Print_by) {
      toast.error('Please select Print by');
      return false;
    }
    if (showFinishOptions && !values.finish_type) {
      toast.error('Please select a finish type');
      return false;
    }
    return true;
  };

  const handleEstimateClick = async () => {
    const getBasePriceLabel = () => {
      const designBy = values.Design_by || '';
      const printBy = values.Print_by || '';
      
      const isDesignAddiwise = designBy === 'Addiwise';
      const isPrintAddiwise = printBy === 'Addiwise';
      const isDesignSelf = designBy === 'Self';
      const isPrintSelf = printBy === 'Self';
    
      if (isDesignAddiwise && isPrintAddiwise) {
        return 'Design + Print';
      }
      if (isDesignAddiwise) {
        return 'Design';
      }
      if (isPrintAddiwise) {
        return 'Print';
      }
    
      if (isDesignSelf && isPrintSelf) {
        return '';
      }
      if (isDesignSelf) {
        return 'Self Design';
      }
      if (isPrintSelf) {
        return 'Self Print';
      }
    
      return 'Base';
    };
    setEstimateDataLabel(getBasePriceLabel());

    if (!validateBeforeAction()) return;

    setIsEstimating(true);
    
    const estimatePayload = {
      item_code: selectedItem,
      design_by: values.Design_by,
      print_by: values.Print_by,
      laticess: isAddiEase ?values.Latices : 'No',
      finish: values.finish_type || '',
    };
console.log(estimatePayload);

    try {
      const response = await getBKEstimate(estimatePayload).unwrap();
      
      setEstimateData({
        ...estimatePayload,
        apiResponse: response.data
      });
      
      setShowEstimateCard(true);
      setIsEstimateStale(false);
      setIsEstimateAccepted(false);
      // toast.success(response.message);
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to get estimate');
      console.error('Estimate error:', error);
    } finally {
      setIsEstimating(false);
    }
  };

  const getFinishOptions = () => {
    if (isAddiEase) {
      return [
        { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
        { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
      ];
    } else if (isAddiEaseEco) {
      return [
        { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
        { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
      ];
    }
    return [];
  };
  const finishOptions = getFinishOptions();

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 p-2 ml-5">
        <h3 className="text-lg font-semibold">Design & Printing</h3>
        <div className="grid md:grid-cols-2 gap-6 mt-5">
          <div className="flex items-center gap-4">
            <label className="font-sm min-w-[100px] text-sm">Design by</label>
            <div className="w-[300px] min-w-[200px]">
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
          <div className="flex items-center gap-4">
            <label className="font-medium min-w-[100px] text-sm">Print by</label>
            <div className="w-[300px] min-w-[200px]">
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
        {/* {isAddiEase && estimateData.laticess === 'Yes' && ( */}
        {showLaticesField  && (
          <div className="grid md:grid-cols-2 gap-6 mt-2">
            <div className="flex items-center gap-4">
              <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
              <div className="w-[300px] min-w-[200px]">
                <SelectBox
                  options={FORM_OPTIONS.Latices || []}
                  value={values.Latices || ''}
                  onValueChange={(value) => setFieldValue('Latices', value)}
                />
              </div>
            </div>
          </div>
        )}
        
        {showFinishOptions && (
          <div className="space-y-4 mt-5">
            <label className="font-medium text-sm">Finish</label>
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
            <Button 
              className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
              onClick={handleEstimateClick}
              disabled={isEstimating}
            >
              {isEstimating ? 'Estimating...' : 
               isEstimateStale ? 'Update Estimate' : 'Estimate Now'}
            </Button>
          </div>
        )}
      </div>

      <div className="md:w-[500px] mr-40 space-y-4 mt-10">
      {initialLoad && isActiveStep && (
          <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
        )}

        {!initialLoad && showEstimateCard && estimateData?.apiResponse && (
          <Card className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${
            isEstimateStale ? 'border-gray-100 bg-blue-50' : 'border-gray-200'
          } transition-colors duration-200`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <BookmarkIcon className={`w-5 h-5 ${
                    isEstimateStale ? 'text-gray-600' : 'text-gray-700'
                  }`} />
                  <p className={`text-sm font-semibold ${
                    isEstimateStale ? 'text-gray-600' : 'text-gray-700'
                  }`}>
                    Estimate Summary {isEstimateStale && ''}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ul className="text-sm space-y-2.5">
                <div className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                      isEstimateStale ? 'bg-blue-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <span className="font-medium text-gray-700">{estimateDataLabel} Price: </span>
                      <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
                    </div>
                  </li>
                  {/* {isAddiEase && ( */}
                  {isAddiEase && estimateData.laticess === 'Yes' && showLaticesField && (
                    <li className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                        isEstimateStale ? 'bg-blue-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <span className="font-medium text-gray-700">Latices Price: </span>
                        <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
                      </div>
                    </li>
                  )}
                  {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
                    <li className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                        isEstimateStale ? 'bg-blue-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <span className="font-medium text-gray-700">Finish Price: </span>
                        <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
                      </div>
                    </li>
                  )}
                  <div className={`border-t ${
                    isEstimateStale ? 'border-gray-300' : 'border-gray-200'
                  } my-2`}></div>
                  <div className={`flex justify-between text-base font-bold ${
                    isEstimateStale ? 'text-blue-800' : 'text-blue-800'
                  }`}>
                    <span>Total Amount </span>
                    <span>
                      ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </ul>
              
              {/* {!isEstimateStale && (
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEstimateAccepted(!isEstimateAccepted)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      isEstimateAccepted 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {isEstimateAccepted && <Check className="w-4 h-4 text-white" onChange={setEstimateConform(!false)}/>}
                    </div>
                    <Label htmlFor="accept-estimate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I accept this estimate
                    </Label>
                  </button>
                </div>
              )} */}
              {/* // In your Step5 component, add this checkbox near the estimate acceptance section */}
{!isEstimateStale && (
  <div className="mt-4 space-y-3">
    {/* <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => setIsEstimateAccepted(!isEstimateAccepted)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
          isEstimateAccepted 
            ? 'bg-blue-600 border-blue-600' 
            : 'border-gray-300'
        }`}>
          {isEstimateAccepted && <Check className="w-4 h-4 text-white" />}
        </div>
        <Label htmlFor="accept-estimate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I accept this estimate
        </Label>
      </button>
    </div> */}
    
    {/* Add this checkbox to control the submit button */}
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="enable-submit"
        // checked={estimateConform}
        onChange={(e) => setEstimateConform(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
      <Label htmlFor="enable-submit" className="text-sm font-medium leading-none ml-1">
      I accept this estimate
      </Label>
    </div>
  </div>
)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// 'use client';
// import { useState, useEffect } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon, Check } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 
// import { Label } from '@/components/ui/label';

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit,
//   currentStep, // Add this prop
//   isActiveStep
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [estimateDataLabel, setEstimateDataLabel] = useState<any>("");
//   const [isEstimating, setIsEstimating] = useState(false);
//   const [getBKEstimate] = useGetBKEstimateMutation();
//   const [prevValues, setPrevValues] = useState(values);
//   const [isEstimateAccepted, setIsEstimateAccepted] = useState(false);
//   const [isEstimateStale, setIsEstimateStale] = useState(false);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;
//   useEffect(() => {
//     if (!isActiveStep) {
//       setShowEstimateCard(false);
//       setEstimateData(null);
//       setInitialLoad(true);
//     }
//   }, [isActiveStep]);
//   // Set default finish type when model changes
//   useEffect(() => {
//     if (showFinishOptions && !values.finish_type) {
//       if (isAddiEase) {
//         setFieldValue('finish_type', 'Bead Blast');
//       } else if (isAddiEaseEco) {
//         setFieldValue('finish_type', 'Bead Blast');
//       }
//     }
//   }, [values.model_name, showFinishOptions, isAddiEase, isAddiEaseEco, setFieldValue]);

//   // Effect to mark estimate as stale when form values change
//   useEffect(() => {
//     if (showEstimateCard  && !initialLoad) {
//       const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
//       const hasChanged = relevantFields.some(
//         field => values[field] !== prevValues[field]
//       );
      
//       if (hasChanged) {
//         setIsEstimateStale(true);
//         setIsEstimateAccepted(false);
//       }
//     }
    
//     setPrevValues(values);
//   }, [values, showEstimateCard, prevValues,initialLoad]);
//   useEffect(() => {
//     if (isActiveStep) {
//       const timer = setTimeout(() => {
//         setInitialLoad(false);
//       }, 300);
      
//       return () => clearTimeout(timer);
//     }
//   }, [isActiveStep]);
//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     if (!values.Design_by) {
//       toast.error('Please select Design by');
//       return false;
//     }
//     if (!values.Print_by) {
//       toast.error('Please select Print by');
//       return false;
//     }
//     if (showFinishOptions && !values.finish_type) {
//       toast.error('Please select a finish type');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     const getBasePriceLabel = () => {
//       const designBy = values.Design_by || '';
//       const printBy = values.Print_by || '';
      
//       const isDesignAddiwise = designBy === 'Addiwise';
//       const isPrintAddiwise = printBy === 'Addiwise';
//       const isDesignSelf = designBy === 'Self';
//       const isPrintSelf = printBy === 'Self';
    
//       if (isDesignAddiwise && isPrintAddiwise) {
//         return '(Design + Print)';
//       }
//       if (isDesignAddiwise) {
//         return '(Design)';
//       }
//       if (isPrintAddiwise) {
//         return '(Print)';
//       }
    
//       if (isDesignSelf && isPrintSelf) {
//         return '';
//       }
//       if (isDesignSelf) {
//         return 'Self Design';
//       }
//       if (isPrintSelf) {
//         return 'Self Print';
//       }
    
//       return 'Base';
//     };
//     setEstimateDataLabel(getBasePriceLabel());

//     if (!validateBeforeAction()) return;

//     setIsEstimating(true);
    
//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type || '',
//     };

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
      
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       setShowEstimateCard(true);
//       setIsEstimateStale(false);
//       setIsEstimateAccepted(false);
//       // toast.success(response.message);
//     } catch (error: any) {
//       toast.error(error.data?.message || 'Failed to get estimate');
//       console.error('Estimate error:', error);
//     } finally {
//       setIsEstimating(false);
//     }
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };
//   const finishOptions = getFinishOptions();

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1 p-2 ml-5">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
        
//         {showFinishOptions && (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//               disabled={isEstimating}
//             >
//               {isEstimating ? 'Estimating...' : 
//                isEstimateStale ? 'Update Estimate' : 'Estimate Now'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4 mt-10">
//       {initialLoad && isActiveStep && (
//           <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
//         )}

//         {!initialLoad && showEstimateCard && estimateData?.apiResponse && (
//           <Card className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${
//             isEstimateStale ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
//           } transition-colors duration-200`}>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className={`w-5 h-5 ${
//                     isEstimateStale ? 'text-yellow-600' : 'text-blue-700'
//                   }`} />
//                   <p className={`text-sm font-semibold ${
//                     isEstimateStale ? 'text-yellow-700' : 'text-gray-700'
//                   }`}>
//                     Estimate Summary {isEstimateStale && '(Needs Update)'}
//                   </p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
//                       isEstimateStale ? 'bg-yellow-500' : 'bg-blue-500'
//                     }`}></div>
//                     <div>
//                       <span className="font-medium text-gray-700">{estimateDataLabel} Price: </span>
//                       <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
//                         isEstimateStale ? 'bg-yellow-500' : 'bg-blue-500'
//                       }`}></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price: </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
//                     <li className="flex items-start gap-2">
//                       <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
//                         isEstimateStale ? 'bg-yellow-500' : 'bg-blue-500'
//                       }`}></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price: </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className={`border-t ${
//                     isEstimateStale ? 'border-yellow-300' : 'border-gray-200'
//                   } my-2`}></div>
//                   <div className={`flex justify-between text-base font-bold ${
//                     isEstimateStale ? 'text-yellow-700' : 'text-blue-800'
//                   }`}>
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
              
//               {!isEstimateStale && (
//                 <div className="mt-4 flex items-center space-x-2">
//                   <button
//                     type="button"
//                     onClick={() => setIsEstimateAccepted(!isEstimateAccepted)}
//                     className="flex items-center gap-2 cursor-pointer"
//                   >
//                     <div className={`w-5 h-5 rounded border flex items-center justify-center ${
//                       isEstimateAccepted 
//                         ? 'bg-blue-600 border-blue-600' 
//                         : 'border-gray-300'
//                     }`}>
//                       {isEstimateAccepted && <Check className="w-4 h-4 text-white" />}
//                     </div>
//                     <Label htmlFor="accept-estimate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                       I accept this estimate
//                     </Label>
//                   </button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };
  
// 'use client';
// import { useState, useEffect } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon, Check } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 
// import { Label } from '@/components/ui/label';

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [estimateDataLable, setEstimateDataLable] = useState<any>("");
//   const [isEstimating, setIsEstimating] = useState(false);
//   const [getBKEstimate] = useGetBKEstimateMutation();
//   const [prevValues, setPrevValues] = useState(values);
//   const [isEstimateAccepted, setIsEstimateAccepted] = useState(false);
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   // Set default finish type when model changes
//   useEffect(() => {
//     if (showFinishOptions && !values.finish_type) {
//       if (isAddiEase) {
//         setFieldValue('finish_type', 'Bead Blast');
//       } else if (isAddiEaseEco) {
//         setFieldValue('finish_type', 'Bead Blast');
//       }
//     }
//   }, [values.model_name, showFinishOptions, isAddiEase, isAddiEaseEco, setFieldValue]);

//   // Effect to hide estimate card when form values change
//   useEffect(() => {
//     if (showEstimateCard) {
//       const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
//       const hasChanged = relevantFields.some(
//         field => values[field] !== prevValues[field]
//       );
      
//       if (hasChanged) {
//         setShowEstimateCard(false);
//         setIsEstimateAccepted(false); // Reset acceptance when values change
//       }
//     }
    
//     // Update previous values
//     setPrevValues(values);
//   }, [values, showEstimateCard, prevValues]);

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     if (!values.Design_by) {
//       toast.error('Please select Design by');
//       return false;
//     }
//     if (!values.Print_by) {
//       toast.error('Please select Print by');
//       return false;
//     }
//     if (showFinishOptions && !values.finish_type) {
//       toast.error('Please select a finish type');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     const getBasePriceLabel = () => {
//       const designBy = values.Design_by || '';
//       const printBy = values.Print_by || '';
      
//       const isDesignAddiwise = designBy === 'Addiwise';
//       const isPrintAddiwise = printBy === 'Addiwise';
//       const isDesignSelf = designBy === 'Self';
//       const isPrintSelf = printBy === 'Self';
    
//       // Handle Addiwise cases first
//       if (isDesignAddiwise && isPrintAddiwise) {
//         return '(Design + Print )';
//       }
//       if (isDesignAddiwise) {
//         return '(Design)';
//       }
//       if (isPrintAddiwise) {
//         return '(Print)';
//       }
    
//       // Then handle Self cases
//       if (isDesignSelf && isPrintSelf) {
//         return '';
//       }
//       if (isDesignSelf) {
//         return 'Self Design';
//       }
//       if (isPrintSelf) {
//         return 'Self Print';
//       }
    
//       // Default case
//       return 'Base';
//     };
//     setEstimateDataLable(getBasePriceLabel())

//     if (!validateBeforeAction()) return;

//     setIsEstimating(true);
    
//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type || '',
//     };
// console.log(estimateData);

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
      
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       setShowEstimateCard(true);
//       setIsEstimateAccepted(false); // Reset acceptance when new estimate is generated
//       toast.success(response.message);
//     } catch (error: any) {
//       toast.error(error.data?.message || 'Failed to get estimate');
//       console.error('Estimate error:', error);
//     } finally {
//       setIsEstimating(false);
//     }
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };
//   const finishOptions = getFinishOptions();

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1 p-2 ml-5">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
        
//         {showFinishOptions && (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//               disabled={isEstimating}
//             >
//               {isEstimating ? 'Estimating...' : 'Estimate Now'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4 mt-10">
//         {showEstimateCard && estimateData?.apiResponse && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">{estimateDataLable} Price : </span>
//                       <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
              
//               {/* <div className="mt-4 flex items-center space-x-2">
//                 <Label htmlFor="accept-estimate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                   I accept this estimate
//                 </Label>
//               </div> */}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// 'use client';
// import { useState, useEffect } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon, Check } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 
// // import { SelectBox } from '@/components/ui/selectbox';
// import { Label } from '@/components/ui/label';
// import { Select } from 'react-day-picker';
// import { SelectArrow, SelectContent } from '@radix-ui/react-select';

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [estimateDataLable, setEstimateDataLable] = useState<any>("");
//   const [isEstimating, setIsEstimating] = useState(false);
//   const [getBKEstimate] = useGetBKEstimateMutation();
//   const [prevValues, setPrevValues] = useState(values);
//   const [isEstimateAccepted, setIsEstimateAccepted] = useState(false);
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   // Effect to hide estimate card when form values change
//   useEffect(() => {
//     if (showEstimateCard) {
//       const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
//       const hasChanged = relevantFields.some(
//         field => values[field] !== prevValues[field]
//       );
      
//       if (hasChanged) {
//         setShowEstimateCard(false);
//         setIsEstimateAccepted(false); // Reset acceptance when values change
//       }
//     }
    
//     // Update previous values
//     setPrevValues(values);
//   }, [values, showEstimateCard, prevValues]);

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     if (!values.Design_by) {
//       toast.error('Please select Design by');
//       return false;
//     }
//     if (!values.Print_by) {
//       toast.error('Please select Print by');
//       return false;
//     }
//     if (showFinishOptions && !values.finish_type) {
//       toast.error('Please select a finish type');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     const getBasePriceLabel = () => {
//       const designBy = values.Design_by || '';
//       const printBy = values.Print_by || '';
      
//       const isDesignAddiwise = designBy === 'Addiwise';
//       const isPrintAddiwise = printBy === 'Addiwise';
//       const isDesignSelf = designBy === 'Self';
//       const isPrintSelf = printBy === 'Self';
    
//       // Handle Addiwise cases first
//       if (isDesignAddiwise && isPrintAddiwise) {
//         return '(Design + Print )';
//       }
//       if (isDesignAddiwise) {
//         return '(Design)';
//       }
//       if (isPrintAddiwise) {
//         return '(Print)';
//       }
    
//       // Then handle Self cases
//       if (isDesignSelf && isPrintSelf) {
//         return '';
//       }
//       if (isDesignSelf) {
//         return 'Self Design';
//       }
//       if (isPrintSelf) {
//         return 'Self Print';
//       }
    
//       // Default case
//       return 'Base';
//     };
//     setEstimateDataLable(getBasePriceLabel())

//     if (!validateBeforeAction()) return;

//     setIsEstimating(true);
    
//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type || '',
//     };

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
      
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       setShowEstimateCard(true);
//       setIsEstimateAccepted(false); // Reset acceptance when new estimate is generated
//       toast.success(response.message);
//     } catch (error: any) {
//       toast.error(error.data?.message || 'Failed to get estimate');
//       console.error('Estimate error:', error);
//     } finally {
//       setIsEstimating(false);
//     }
//   };

//   const handleOrderSubmit = () => {
//     if (!validateBeforeAction()) return;
//     if (!isEstimateAccepted) {
//       toast.error('Please accept the estimate before submitting');
//       return;
//     }
//     handleSubmit();
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };
//   const finishOptions = getFinishOptions();

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1 p-2 ml-5">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
        
//         {showFinishOptions && (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       defaultValue={"Bead Blast"}
//                       defaultChecked={true}
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//               disabled={isEstimating}
//             >
//               {isEstimating ? 'Estimating...' : 'Estimate Now'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4 mt-10">
//         {showEstimateCard && estimateData?.apiResponse && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">{estimateDataLable} Price : </span>
//                       <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
              
//               <div className="mt-4 flex items-center space-x-2">
                
//                 {/* <Checkbox 
//                   id="accept-estimate" 
//                   checked={isEstimateAccepted}
//                   onCheckedChange={(checked: any) => setIsEstimateAccepted(!!checked)}
//                 /> */}
//                 <Label htmlFor="accept-estimate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                   I accept this estimate
//                 </Label>
//               </div>
//             </CardContent>
//           </Card>
//         )}
        
//         {/* <Button 
//           className="w-full mt-4 py-6 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all"
//           onClick={handleOrderSubmit}
//           disabled={!isEstimateAccepted || !showEstimateCard}
//         >
//           Submit Order
//         </Button> */}
//       </div>
//     </div>
//   );
// };


// 'use client';
// import { useState, useEffect } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [estimateDataLable, setEstimateDataLable] = useState<any>("");
//   const [isEstimating, setIsEstimating] = useState(false);
//   const [getBKEstimate] = useGetBKEstimateMutation();
//   const [prevValues, setPrevValues] = useState(values);
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   // Effect to hide estimate card when form values change
//   useEffect(() => {
//     if (showEstimateCard) {
//       const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
//       const hasChanged = relevantFields.some(
//         field => values[field] !== prevValues[field]
//       );
      
//       if (hasChanged) {
//         setShowEstimateCard(false);
//       }
//     }
    
//     // Update previous values
//     setPrevValues(values);
//   }, [values, showEstimateCard, prevValues]);

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     if (!values.Design_by) {
//       toast.error('Please select Design by');
//       return false;
//     }
//     if (!values.Print_by) {
//       toast.error('Please select Print by');
//       return false;
//     }
//     if (showFinishOptions && !values.finish_type) {
//       toast.error('Please select a finish type');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     const getBasePriceLabel = () => {
//       const designBy = values.Design_by || '';
//       const printBy = values.Print_by || '';
      
//       const isDesignAddiwise = designBy === 'Addiwise';
//       const isPrintAddiwise = printBy === 'Addiwise';
//       const isDesignSelf = designBy === 'Self';
//       const isPrintSelf = printBy === 'Self';
    
//       // Handle Addiwise cases first
//       if (isDesignAddiwise && isPrintAddiwise) {
//         return '(Design by + Print by)';
//       }
//       if (isDesignAddiwise) {
//         return '(Design by)';
//       }
//       if (isPrintAddiwise) {
//         return '(Print by)';
//       }
    
//       // Then handle Self cases
//       if (isDesignSelf && isPrintSelf) {
//         return '';
//       }
//       if (isDesignSelf) {
//         return 'Self Design';
//       }
//       if (isPrintSelf) {
//         return 'Self Print';
//       }
    
//       // Default case
//       return 'Base';
//     };
//     setEstimateDataLable(getBasePriceLabel())

//     if (!validateBeforeAction()) return;

//     setIsEstimating(true);
    
//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type || '',
//     };

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
      
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       setShowEstimateCard(true);
//       toast.success(response.message);
//     } catch (error: any) {
//       toast.error(error.data?.message || 'Failed to get estimate');
//       console.error('Estimate error:', error);
//     } finally {
//       setIsEstimating(false);
//     }
//   };

//   const handleOrderSubmit = () => {
//     if (!validateBeforeAction()) return;
//     handleSubmit();
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };
//   const finishOptions = getFinishOptions();

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1 p-2 ml-5">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
        
//         {showFinishOptions && (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//               disabled={isEstimating}
//             >
//               {isEstimating ? 'Estimating...' : 'Estimate Now'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4 mt-10">
//         {showEstimateCard && estimateData?.apiResponse && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">{estimateDataLable} Price : </span>
//                       <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };


// it is working now ------------------------
// 'use client';
// import { useState, useEffect } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [estimateDataLable, setEstimateDataLable] = useState<any>("");
//   const [isEstimating, setIsEstimating] = useState(false);
//   const [getBKEstimate] = useGetBKEstimateMutation();
//   const [prevValues, setPrevValues] = useState(values);
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   // Effect to hide estimate card when form values change
//   useEffect(() => {
//     if (showEstimateCard) {
//       const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
//       const hasChanged = relevantFields.some(
//         field => values[field] !== prevValues[field]
//       );
      
//       if (hasChanged) {
//         setShowEstimateCard(false);
//       }
//     }
    
//     // Update previous values
//     setPrevValues(values);
//   }, [values, showEstimateCard, prevValues]);

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     if (!values.Design_by) {
//       toast.error('Please select Design by');
//       return false;
//     }
//     if (!values.Print_by) {
//       toast.error('Please select Print by');
//       return false;
//     }
//     if (showFinishOptions && !values.finish_type) {
//       toast.error('Please select a finish type');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     const getBasePriceLabel = () => {
//       const designBy = values.Design_by || '';
//       const printBy = values.Print_by || '';
      
//       const isDesignAddiwise = designBy === 'Addiwise';
//       const isPrintAddiwise = printBy === 'Addiwise';
//       const isDesignSelf = designBy === 'Self';
//       const isPrintSelf = printBy === 'Self';
    
//       // Handle Addiwise cases first
//       if (isDesignAddiwise && isPrintAddiwise) {
//         return '(Design by + Print by)';
//       }
//       if (isDesignAddiwise) {
//         return '(Design by)';
//       }
//       if (isPrintAddiwise) {
//         return '(Print by)';
//       }
    
//       // Then handle Self cases
//       if (isDesignSelf && isPrintSelf) {
//         return '';
//       }
//       if (isDesignSelf) {
//         return 'Self Design';
//       }
//       if (isPrintSelf) {
//         return 'Self Print';
//       }
    
//       // Default case
//       return 'Base';
//     };
//     setEstimateDataLable(getBasePriceLabel())

//     if (!validateBeforeAction()) return;

//     setIsEstimating(true);
    
//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type || '',
//     };

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
      
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       setShowEstimateCard(true);
//       toast.success(response.message);
//     } catch (error: any) {
//       toast.error(error.data?.message || 'Failed to get estimate');
//       console.error('Estimate error:', error);
//     } finally {
//       setIsEstimating(false);
//     }
//   };

//   const handleOrderSubmit = () => {
//     if (!validateBeforeAction()) return;
//     handleSubmit();
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };
//   const finishOptions = getFinishOptions();

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1 p-2 ml-5">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
        
//         {showFinishOptions && (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//               disabled={isEstimating}
//             >
//               {isEstimating ? 'Estimating...' : 'Estimate Now'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4 mt-10">
//         {showEstimateCard && estimateData?.apiResponse && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">{estimateDataLable} Price : </span>
//                       <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };
// 'use client';
// import { useState } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; 

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [estimateDataLable, setEstimateDataLable] = useState<any>("");
//   const [isEstimating, setIsEstimating] = useState(false);
//   const [getBKEstimate] = useGetBKEstimateMutation();
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     if (!values.Design_by) {
//       toast.error('Please select Design by');
//       return false;
//     }
//     if (!values.Print_by) {
//       toast.error('Please select Print by');
//       return false;
//     }
//     if (showFinishOptions && !values.finish_type) {
//       toast.error('Please select a finish type');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     const getBasePriceLabel = () => {
//       const designBy = values.Design_by || '';
//       const printBy = values.Print_by || '';
      
//       const isDesignAddiwise = designBy === 'Addiwise';
//       const isPrintAddiwise = printBy === 'Addiwise';
//       const isDesignSelf = designBy === 'Self';
//       const isPrintSelf = printBy === 'Self';
    
//       // Handle Addiwise cases first
//       if (isDesignAddiwise && isPrintAddiwise) {
//         return '(Design by + Print by)';
//       }
//       if (isDesignAddiwise) {
//         return '(Design by)';
//       }
//       if (isPrintAddiwise) {
//         return '(Print by)';
//       }
    
//       // Then handle Self cases
//       if (isDesignSelf && isPrintSelf) {
//         return '';
//       }
//       if (isDesignSelf) {
//         return 'Self Design';
//       }
//       if (isPrintSelf) {
//         return 'Self Print';
//       }
    
//       // Default case
//       return 'Base';
//     };
//     setEstimateDataLable(getBasePriceLabel())

//     if (!validateBeforeAction()) return;

//     setIsEstimating(true);
    
//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type || '',
//     };
// console.log("Payload",estimatePayload);

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
//       console.log("@@@@@@@@::>>>>",response);
      
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       setShowEstimateCard(true);
//       toast.success(response.message);
//     } catch (error: any) {
//       toast.error(error.data?.message || 'Failed to get estimate');
//       console.error('Estimate error:', error);
//     } finally {
//       setIsEstimating(false);
//     }
//   };

//   const handleOrderSubmit = () => {
//     if (!validateBeforeAction()) return;
//     handleSubmit();
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };
//   const finishOptions = getFinishOptions();
//   // const getBasePriceLabel = () => {
//   //   const designBy = values.Design_by || '';
//   //   const printBy = values.Print_by || '';
    
//   //   const isDesignAddiwise = designBy === 'Addiwise';
//   //   const isPrintAddiwise = printBy === 'Addiwise';
//   //   const isDesignSelf = designBy === 'Self';
//   //   const isPrintSelf = printBy === 'Self';
  
//   //   // Handle Addiwise cases first
//   //   if (isDesignAddiwise && isPrintAddiwise) {
//   //     return 'Design by Addiwise + Print by Addiwise';
//   //   }
//   //   if (isDesignAddiwise) {
//   //     return 'Design by Addiwise';
//   //   }
//   //   if (isPrintAddiwise) {
//   //     return 'Print by Addiwise';
//   //   }
  
//   //   // Then handle Self cases
//   //   if (isDesignSelf && isPrintSelf) {
//   //     return 'Self Design & Self Print';
//   //   }
//   //   if (isDesignSelf) {
//   //     return 'Self Design';
//   //   }
//   //   if (isPrintSelf) {
//   //     return 'Self Print';
//   //   }
  
//   //   // Default case
//   //   return 'Base';
//   // };
//   // const getBasePriceLabel = () => {
//   //   const isDesignAddiwise = values.Design_by === 'Addiwise';
//   //   const isPrintAddiwise = values.Print_by === 'Addiwise';
//   //   const isDesignSelf = values.Design_by === 'Self';
//   //   const isPrintSelf = values.Print_by === 'Self';
  
//   //   if (isDesignAddiwise && isPrintAddiwise) {
//   //     return 'Base Price (Design by Addiwise + Print by Addiwise)';
//   //   } else if (isDesignAddiwise && isPrintSelf) {
//   //     return 'Base Price (Design by Addiwise)';
//   //   } else if (isDesignSelf && isPrintAddiwise) {
//   //     return 'Base Price (Print by Addiwise)';
//   //   } else if (isDesignAddiwise) {
//   //     return 'Base Price (Design by Addiwise)';
//   //   } else if (isPrintAddiwise) {
//   //     return 'Base Price (Print by Addiwise)';
//   //   } else if (isDesignSelf && isPrintSelf) {
//   //     return 'Base Price (Self Design & Self Print)';
//   //   } else if (isDesignSelf) {
//   //     return 'Base Price (Self Design)';
//   //   } else if (isPrintSelf) {
//   //     return 'Base Price (Self Print)';
//   //   } else {
//   //     return 'Base Price';
//   //   }
//   // };

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1 p-2 ml-5">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
        
        
//         {showFinishOptions && (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//               disabled={isEstimating}
//             >
//               {isEstimating ? 'Estimating...' : 'Estimate Now'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4 mt-10">
//         {showEstimateCard && estimateData?.apiResponse && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">{estimateDataLable} Price : </span>
//                       <span className="text-gray-600"> ₹{estimateData.apiResponse.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && ['Colour', 'Epoxy'].includes(estimateData.finish) && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price : </span>
//                         <span className="text-gray-600"> ₹{estimateData.apiResponse.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{estimateData.apiResponse.estimate_price.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
//             </CardContent>
//           </Card>
//         )}

//         {/* <Button 
//           className="w-full mt-6 py-6 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all"
//           onClick={handleOrderSubmit}
//         >
//           Submit Order
//         </Button> */}
//       </div>
//     </div>
//   );
// };

// 'use client';
// import { useState } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';
// import { useGetBKEstimateMutation } from '@/rtk-query/apis/orders'; // Update this path

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
//   const [getBKEstimate] = useGetBKEstimateMutation(); // Add this line
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const LaticeAmount = values.Latices === 'Yes' ? 1000 : 0; 

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const finishPrice = getFinishPrice();
//   const [totalAmount, setTotalAmount] = useState(5 + 50 + (isAddiEase ? LaticeAmount : 0) + finishPrice);

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = async () => {
//     if (!validateBeforeAction()) return;

//     const estimatePayload = {
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       laticess: values.Latices || 'No',
//       finish: values.finish_type,
//     };

//     try {
//       const response = await getBKEstimate(estimatePayload).unwrap();
      
//       // Update the state with the API response
//       setEstimateData({
//         ...estimatePayload,
//         apiResponse: response.data
//       });
      
//       // Update the total amount from the API response
//       setTotalAmount(response.data.estimate_price);
      
//       setShowEstimateCard(true);
//       toast.success(response.message);
//     } catch (error) {
//       toast.error('Failed to get estimate');
//       console.error('Estimate error:', error);
//     }
//   };

//   // ... rest of your component remains the same until the CardContent section

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       {/* ... previous JSX remains the same ... */}
      
//       <div className="md:w-[500px] mr-40 space-y-4">
//         {showEstimateCard && estimateData && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">Base Price: </span>
//                       <span className="text-gray-600">₹{estimateData.apiResponse?.item_price.toLocaleString()}</span>
//                     </div>
//                   </li>
//                   {estimateData.laticess === 'Yes' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price: </span>
//                         <span className="text-gray-600">₹{estimateData.apiResponse?.laticess.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   {estimateData.finish && estimateData.finish !== 'Bead Blast' && estimateData.finish !== 'Dye' && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price: </span>
//                         <span className="text-gray-600">₹{estimateData.apiResponse?.finish.toLocaleString()}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{totalAmount.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// 'use client';
// import { useState } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { toast } from 'react-toastify';

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const LaticeAmount = values.Latices === 'Yes' ? 1000 : 0; 

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const finishPrice = getFinishPrice();
//   const totalAmount = 5 + 50 + (isAddiEase ? LaticeAmount : 0) + finishPrice;

//   const validateBeforeAction = () => {
//     if (!selectedItem) {
//       toast.error('Please complete the basic form first');
//       return false;
//     }
//     return true;
//   };

//   const handleEstimateClick = () => {
//     if (!validateBeforeAction()) return;

//     const estimatePayload = {
//       // finishPrice: finishPrice,
//       // laticesPrice: isAddiEase ? LaticeAmount : 0,
//       // totalAmount: totalAmount,
      
//       finish: values.finish_type,
//       laticess:values.Latices ||'No',
//       item_code: selectedItem,
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//     };

//   //   {
//   //     "item_code": "BK-M-SX-T1-AEMHR-L",

//   //     "design_by":"Addiwise",
//   //     "print_by":"Addiwise",
//   //     "laticess":"Yes",
//   //     "finish":"Colour"
  
//   // }
//     console.log("pl::>",estimatePayload);
    

//     setEstimateData(estimatePayload);
//     setShowEstimateCard(true);
//   };

//   const handleOrderSubmit = () => {
//     if (!validateBeforeAction()) return;
//     handleSubmit();
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
//       ];
//     } else if (isAddiEaseEco) {
//       return [
//         { value: 'Bead Blast', label: 'Bead Blast', color: 'bg-gray-500 text-gray-700' },
//         { value: 'Dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'Epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
//       ];
//     }
//     return [];
//   };

//   const finishOptions = getFinishOptions();

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Print By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Lattices Section */}
//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//         {showFinishOptions ? (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//             >
//               Estimate Now
//             </Button>
//           </div>
//         ) : (
//           <div className="ml-26 text-gray-500"></div>
//         )}
//       </div>

//       <div className="md:w-[500px] mr-40 space-y-4">
//         {showEstimateCard && estimateData && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//                   <BookmarkIcon className="w-5 h-5 text-gray-700" />
//                   <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//                 </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//               <ul className="text-sm space-y-2.5">
//                 <div className="space-y-3 text-sm">
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">Design Price: </span>
//                       <span className="text-gray-600">₹5</span>
//                     </div>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                     <div>
//                       <span className="font-medium text-gray-700">Print Price: </span>
//                       <span className="text-gray-600">₹50</span>
//                     </div>
//                   </li>
//                   {isAddiEase && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Latices Price: </span>
//                         <span className="text-gray-600">₹{LaticeAmount}</span>
//                       </div>
//                     </li>
//                   )}
//                   {finishPrice > 0 && (
//                     <li className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-gray-700">Finish Price: </span>
//                         <span className="text-gray-600">₹{finishPrice}</span>
//                       </div>
//                     </li>
//                   )}
//                   <div className="border-t border-gray-200 my-2"></div>
//                   <div className="flex justify-between text-base font-bold text-blue-800">
//                     <span>Total Amount </span>
//                     <span>
//                       ₹{totalAmount.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </ul>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };


// 'use client';
// import { useState } from 'react';
// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon, CoinsIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
// }: any) => {
//   const [showEstimateCard, setShowEstimateCard] = useState(false);
//   const [estimateData, setEstimateData] = useState<any>(null);
  
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const LaticeAmount = values.Latices === 'Yes' ? 1000 : 0; 

//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const finishPrice = getFinishPrice();
//   const totalAmount = 5 + 50 + (isAddiEase ? LaticeAmount : 0) + finishPrice;

//   const handleEstimateClick = () => {
//     const estimatePayload = {
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       finishPrice: finishPrice,
//       finishType: values.finish_type,
//       laticesPrice: isAddiEase ? LaticeAmount : 0,
//       item_code: selectedItem,
//       totalAmount: totalAmount
//     };

//     console.log(">>>>>>",estimatePayload);
    

//     setEstimateData(estimatePayload);
//     setShowEstimateCard(true);
//   };

//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
//         { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
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

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>

//         {/* Design By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Print By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Lattices Section */}
//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Finish Section */}
//         {showFinishOptions ? (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-5 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick}
//             >
//               Estimate Now
//             </Button>
//           </div>
//         ) : (
//           <div className="ml-26 text-gray-500"></div>
//         )}
//       </div>

//       {/* Right Side Cards */}
//       <div className="md:w-[520px] mr-35 space-y-4">
        

//         {/* Estimate Result Card */}
//         {showEstimateCard && estimateData && (
//           <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg font-semibold text-blue-800">
//                 <div className="flex items-center gap-2">
//               <BookmarkIcon className="w-5 h-5 text-gray-700" />
//               <p className="text-sm font-semibold text-gray-700">Estimate Summary</p>
//             </div>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-2">
//             <ul className="text-sm space-y-2.5">
//               <div className="space-y-3 text-sm">
//             <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Design Price: </span>
//                   <span className="text-gray-600">₹5</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Print Price: </span>
//                   <span className="text-gray-600">₹50</span>
//                 </div>
//               </li>
//                 {isAddiEase && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Latices Price: </span>
//                     <span className="text-gray-600">₹{LaticeAmount}</span>
//                   </div>
//                 </li>
//               )}
//                 {/* {estimateData.finishPrice > 0 && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-700">Finish Price:</span>
//                     <span className="font-medium">₹{estimateData.finishPrice}</span>
//                   </div>
//                 )} */}
//                 {finishPrice > 0 && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish Price: </span>
//                     <span className="text-gray-600">₹{finishPrice}</span>
//                   </div>
//                 </li>
//               )}
//                 <div className="border-t border-gray-200 my-2"></div>
//                 <div className="flex justify-between text-base font-bold text-blue-800">
//                   <span>Total Amount </span>
//                   <span>
//                   ₹{totalAmount.toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//                 </ul>
//               <div className="mt-4 flex justify-end gap-2">
//                 <Button 
//                   variant="secondary" 
//                   onClick={() => setShowEstimateCard(false)}
//                 >
//                   Close
//                 </Button>
//                 <Button 
//                   onClick={handleSubmit}
//                 >
//                   Confirm Order
//                 </Button>
//               </div>
//             </CardContent>

//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon, CoinsIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS,
//   selectedItem,
//   handleSubmit
//    // Add this prop from Formik
// }: any) => {
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const LaticeAmount = values.Latices === 'Yes' ? 1000 : 0; 

//   // Calculate finish price based on selection
//   const getFinishPrice = () => {
//     switch(values.finish_type) {
//       case 'colour': return 2000;
//       case 'epoxy': return 1000;
//       case 'black-dye':
//       case 'bead-blasting':
//       default: return 0;
//     }
//   };

//   const finishPrice = getFinishPrice();
// console.log("@@@@@@@@@@@@",selectedItem);

//   // Handle estimate button click
//   const handleEstimateClick = () => {
//     // Prepare the payload with all relevant values
//     const estimatePayload = {
//       design_by: values.Design_by,
//       print_by: values.Print_by,
//       latices: values.Latices,
//       finishPrice: finishPrice,
//       finishType: values.finish_type,
//       laticesPrice: isAddiEase ? LaticeAmount : 0,
//       item_code:selectedItem
//     };

//     // Log the payload (you can replace this with your actual estimation logic)
//     console.log("Estimation Payload:", estimatePayload);
    
//     // You could also call an API here to send the data to your backend
//     // await submitEstimation(estimatePayload);
    
//     // Or update some state with the estimation results
//   };

//   // Finish options configuration
//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
//         { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
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

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>

//         {/* Design By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Print By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Lattices Section (Only for AddiEase) */}
//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Finish Section */}
//         {showFinishOptions ? (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button 
//               className="w-[380px] mt-5 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               onClick={handleEstimateClick} // Add click handler
//             >
//               Estimate Now
//             </Button>
//           </div>
//         ) : (
//           <div className="ml-26 text-gray-500"></div>
//         )}
//       </div>

//       {/* Available Coins card */}
//       <div className="md:w-[500px] mr-25">
//         <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg h-full sticky top-4">
//           <CardHeader className="pb-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <CoinsIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <span className="text-sm font-semibold text-gray-700">Total Amount</span>
//                 <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
//                   {5 + 50 + (isAddiEase ? LaticeAmount : 0) + finishPrice}
//                 </CardTitle>
//               </div>
//             </div>
//           </CardHeader>
       
//           <CardContent className="pt-4">
//             <div className="flex items-center gap-2 mb-3">
//               <BookmarkIcon className="w-4 h-4 text-gray-500" />
//               <p className="text-sm font-semibold text-gray-700">Amount</p>
//             </div>

//             <ul className="text-sm space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Design Price : </span>
//                   <span className="text-gray-600">5</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Print Price : </span>
//                   <span className="text-gray-600">50</span>
//                 </div>
//               </li>
//               {isAddiEase && (
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                   <span className="font-medium text-gray-700">Latices Price : </span>
//                   <span className="text-gray-600">{LaticeAmount}</span>
//                 </div>
//               </li>
//               )}

//               {values.finish_type === 'colour' && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish Price : </span>
//                     <span className="text-gray-600">₹2,000</span>
//                   </div>
//                 </li>
//               )}
//               {values.finish_type === 'epoxy' && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish : </span>
//                     <span className="text-gray-600">₹1,000</span>
//                   </div>
//                 </li>
//               )}
//               {(values.finish_type === 'black-dye' || values.finish_type === 'bead-blasting') && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish : </span>
//                     <span className="text-gray-600">NIL</span>
//                   </div>
//                 </li>
//               )}
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// import { SelectBox } from "@/components/ui/selectbox";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { BookmarkIcon, CoinsIcon } from 'lucide-react';
// import { Button } from "@/components/ui/button";

// export const Step5 = ({
//   values,
//   errors,
//   touched,
//   setFieldValue,
//   FORM_OPTIONS
// }: any) => {
//   const isAddiEase = values.model_name === 'AddiEase';
//   const isAddiEaseEco = values.model_name === 'AddiEaseEco';
//   const showFinishOptions = isAddiEase || isAddiEaseEco;

//   const LaticeAmount = values.Latices === 'Yes' ? 1000 : 0; 

//   // Finish options configuration
//   const getFinishOptions = () => {
//     if (isAddiEase) {
//       return [
//         { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
//         { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
//         { value: 'colour', label: 'Colour', color: 'bg-neutral-500 text-neutral-100' },
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

//   return (
//     <div className="flex flex-col md:flex-row gap-6">
//       <div className="flex-1">
//         <h3 className="text-lg font-semibold">Design & Printing</h3>

//         {/* Design By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-5">
//           <div className="flex items-center gap-4">
//             <label className="font-sm min-w-[100px] text-sm">Design by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Design_by || []}
//                 value={values.Design_by}
//                 onValueChange={(value) => setFieldValue('Design_by', value)}
//                 inVaild={!!errors.Design_by && !!touched.Design_by}
//                 required
//               />
//               {errors.Design_by && touched.Design_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Print By Section */}
//         <div className="grid md:grid-cols-2 gap-6 mt-2">
//           <div className="flex items-center gap-4">
//             <label className="font-medium min-w-[100px] text-sm">Print by</label>
//             <div className="w-[300px] min-w-[200px]">
//               <SelectBox
//                 options={FORM_OPTIONS.Print_by || []}
//                 value={values.Print_by}
//                 onValueChange={(value) => setFieldValue('Print_by', value)}
//                 inVaild={!!errors.Print_by && !!touched.Print_by}
//                 required
//               />
//               {errors.Print_by && touched.Print_by && (
//                 <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Lattices Section (Only for AddiEase) */}
//         {isAddiEase && (
//           <div className="grid md:grid-cols-2 gap-6 mt-2">
//             <div className="flex items-center gap-4">
//               <label className="font-medium min-w-[100px] text-sm">Extras Latices</label>
//               <div className="w-[300px] min-w-[200px]">
//                 <SelectBox
//                   options={FORM_OPTIONS.Latices || []}
//                   value={values.Latices || ''}
//                   onValueChange={(value) => setFieldValue('Latices', value)}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Finish Section */}
//         {showFinishOptions ? (
//           <div className="space-y-4 mt-5">
//             <label className="font-medium text-sm">Finish</label>
//             <div className="ml-10 mb-5">
//               <div className="flex items-center gap-10 -mt-7 ml-8">
//                 {finishOptions.map((option) => (
//                   <label key={option.value} className="flex flex-col items-center cursor-pointer">
//                     <input
//                       type="radio"
//                       name="finish_type"
//                       value={option.value}
//                       checked={values.finish_type === option.value}
//                       onChange={() => setFieldValue('finish_type', option.value)}
//                       className="sr-only peer"
//                     />
//                     <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
//                       values.finish_type === option.value
//                         ? 'border-blue-200 ring-2 ring-blue-300'
//                         : 'border-gray-300'
//                     }`} />
//                     <span className="text-sm mt-1 capitalize">
//                       {option.label}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {errors.finish_type && touched.finish_type && (
//                 <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
//               )}
//             </div>
//             <Button className="w-[380px] mt-5 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all">
//              Estimate Now
//             </Button>
//           </div>
//         ) : (
//           <div className="ml-26 text-gray-500"></div>
//         )}
//       </div>

//       {/* Available Coins card */}
//       <div className="md:w-[500px] mr-25">
//         <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg h-full sticky top-4">
//           <CardHeader className="pb-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <CoinsIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <span className="text-sm font-semibold text-gray-700">Total Amount</span>
//                 <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
//                   5600
//                   {/* {user?.customer_available_coins?.toLocaleString() || 0} */}
//                 </CardTitle>
//               </div>
//             </div>
//           </CardHeader>
       
//           <CardContent className="pt-4">
//             <div className="flex items-center gap-2 mb-3">
//               <BookmarkIcon className="w-4 h-4 text-gray-500" />
//               <p className="text-sm font-semibold text-gray-700">Amount</p>
//             </div>

//             <ul className="text-sm space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Design Price : </span>
//                   <span className="text-gray-600">5</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Print Price : </span>
//                   <span className="text-gray-600">50</span>
//                 </div>
//               </li>
//               {isAddiEase && (
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                   <span className="font-medium text-gray-700">Latices Price : </span>
//                   <span className="text-gray-600">{LaticeAmount}</span>
//                 </div>
//               </li>
//               )}

//               {values.finish_type === 'colour' && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish Price : </span>
//                     <span className="text-gray-600">₹2,000</span>
//                   </div>
//                 </li>
//               )}
//               {values.finish_type === 'epoxy' && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish : </span>
//                     <span className="text-gray-600">₹1,000</span>
//                   </div>
//                 </li>
//               )}
//               {(values.finish_type === 'black-dye' || values.finish_type === 'bead-blasting') && (
//                 <li className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                   <div>
//                     <span className="font-medium text-gray-700">Finish : </span>
//                     <span className="text-gray-600">NIL</span>
//                   </div>
//                 </li>
//               )}
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };