'use client';
import { useState, useEffect, useCallback } from 'react';
import { SelectBox } from "@/components/ui/selectbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BookmarkIcon, Check, Link, Loader, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { useGetBKEstimateMutation, useValidateCouponMutation  } from '@/rtk-query/apis/orders';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  setEstimateConform,
  orderId,
  deviceTypeId
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
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [validateCoupon] = useValidateCouponMutation();
  const [couponTimeout, setCouponTimeout] = useState<NodeJS.Timeout | null>(null);
  const isAddiEase = values.model_name === 'AddiEase';
  const isAddiEaseEco = values.model_name === 'AddiEaseEco';
  const showFinishOptions = isAddiEase || isAddiEaseEco || 'AddiEaseMould'||'AddiEaseMould-HR';
  const showFinishOptionsMould = isAddiEase || isAddiEaseEco;
  const isDesignSelf = values.Design_by === 'Self';
  const isPrintSelf = values.Print_by === 'Self';
  
  // Debounced coupon validation
  const debouncedCouponValidation = useCallback(() => {
    if (couponTimeout) {
      clearTimeout(couponTimeout);
    }

    if (couponCode.trim().length === 0) {
      setCouponData(null);
      return;
    }

    if (couponCode.trim().length < 5) {
      setCouponData(null);
      return;
    }

    const timer = setTimeout(() => {
      handleCouponValidation();
    }, 1000);

    setCouponTimeout(timer);

    return () => {
      if (couponTimeout) {
        clearTimeout(couponTimeout);
      }
    };
  }, [couponCode]);

  useEffect(() => {
    debouncedCouponValidation();
  }, [couponCode, debouncedCouponValidation]);

  useEffect(() => {
    if (!isActiveStep) {
      setShowEstimateCard(false);
      setEstimateData(null);
      setInitialLoad(true);
    }
  }, [isActiveStep]);

  useEffect(() => {
    setShowLaticesField(isAddiEase && !isDesignSelf);
    if(orderId && deviceTypeId){
      setFieldValue('finish_type', values.finish_type);
    }else{
      if (showFinishOptions && !values.finish_type || initialLoad) {
        if (isAddiEase) {
          setFieldValue('finish_type', 'Bead Blast');
        } else if (isAddiEaseEco) {
          setFieldValue('finish_type', 'Bead Blast');
        }
      }
      setShowLaticesField(isAddiEase); 
    }
  }, [isDesignSelf,values.model_name, showFinishOptions, isAddiEase, isAddiEaseEco, setFieldValue, initialLoad,orderId,deviceTypeId]);

  useEffect(() => {
    if (showEstimateCard && !initialLoad) {
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
  }, [values, showEstimateCard, prevValues, initialLoad]);
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
    return true;
  };

  const handleEstimateClick = async () => {
    const designByRes = values.Design_by || '';
    const printByRes = values.Print_by || '';
    const isDesignSelfRes = designByRes === 'Self';
      const isPrintSelfRes = printByRes === 'Self';

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
      laticess: isAddiEase && !isDesignSelf ? values.Latices : 'No',
      finish: !isPrintSelf ? values.finish_type : '0', 
      discount_per: couponData?.discount_percentage || 0,
      discount_amt: couponData?.discount_amount || 0
    };

    try {
      const response = await getBKEstimate(estimatePayload).unwrap();
      
      setEstimateData({
        ...estimatePayload,
        apiResponse: response.data
      });
      setFieldValue('gst_5', response.data.gst_5 || 0.0);
      setFieldValue('gst_18', response.data.gst_18 || 0.0);
      setFieldValue('item_discount', response.data.item_discount || 0.0);
      setFieldValue('additional_discount', response.data.additional_discount || 0.0);
  
      setShowEstimateCard(true);
      setIsEstimateStale(false);
      setIsEstimateAccepted(false);
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to get estimate');
      console.error('Estimate error:', error);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponData(null);
      return;
    }

    if (couponCode.trim().length < 5) {
      setCouponData(null);
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await validateCoupon({ coupon_code: couponCode }).unwrap();
      setCouponData(response.data);
      // toast.success(response.message);
    } catch (error: any) {
      setCouponData(null);
      toast.error(error.data?.message || 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
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
                value={values.Design_by || ''}
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
                value={values.Print_by || ''}
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

        {showLaticesField && (
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
            <label className="font-medium text-sm">{ isAddiEase || isAddiEaseEco ?'Finish':''} </label>
            {showFinishOptionsMould && (
            <div className="ml-10 mb-5">
              <div className="flex items-center gap-10 -mt-7 ml-8">
                {finishOptions.map((option) => (
                  <label key={option.value} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="finish_type"
                      value={option.value || '' }
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
            )}

            {/* Coupon Code Section */}
            <div className="space-y-2 mt-0">
            <div className="relative w-[350px]"> {/* Add fixed width container */}
  <Input
    type="text"
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value)}
    placeholder="Enter coupon code"
    className={`w-full pr-10 ${
      couponCode.length >= 5 && !couponData && !isValidatingCoupon 
        ? 'border-orange-200' 
        : couponData 
          ? 'border-green-200' 
          : ''
    }`}
  />
  <div className="absolute right-3 top-2">
    {isValidatingCoupon ? (
      <Loader className="h-4 w-4 animate-spin" />
    ) : couponCode.length >= 5 ? (
      couponData ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      )
    ) : null}
  </div>
</div>
              {couponData && (
                <div className="text-sm text-green-700 mt-1 ml-5">
                  {couponData.coupon_name} ({couponData.discount_percentage}% off)
                  {couponData.valid_upto && (
                    <span className="text-gray-500 ml-6">
                      valid date {new Date(couponData.valid_upto).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            { !orderId && !deviceTypeId &&(
            <Button 
              className="w-[380px] mt-10 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
              onClick={handleEstimateClick}
              disabled={isEstimating}
            >
              {isEstimating ? 'Estimating...' : 
               isEstimateStale ? 'Update Estimate' : 'Estimate Now'}
            </Button>
              )
            }
          </div>
        )}
      </div>

      <div className="md:w-[500px] mr-40 space-y-4 mt-8">
        {initialLoad && isActiveStep && (
          <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
        )}
        {!initialLoad && showEstimateCard && estimateData?.apiResponse && (
  <Card className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${
    isEstimateStale ? 'border-gray-200' : 'border-gray-200'
  } transition-colors duration-200`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <BookmarkIcon className={`w-5 h-5 ${
            isEstimateStale ? 'text-gray-600' : 'text-gray-700'
          }`} />
          <p className={`text-sm font-semibold ${
            isEstimateStale ? 'text-gray-700' : 'text-gray-700'
          }`}>
            ESTIMATE SUMMARY {isEstimateStale && ''}
          </p>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-2">
      <ul className="text-sm space-y-2.5">
        <div className="space-y-3 text-sm">
          {/* Design Cost - Only show if not Self and there's a design cost */}
          {/* {estimateData?.apiResponse?.design > 0 && ( */}
          {parseFloat(estimateData.apiResponse.design.replace(/,/g, '')) > 0 && (
            <li className="flex items-start gap-2">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">Design </span>
              {/* estimateData?.apiResponse.design */}
              <span className="text-gray-700">₹{estimateData?.apiResponse?.design}</span>
            </div>
          </li>
          )}

          {/* Print Cost - Only show if not Self and there's a print cost */}
          {parseFloat(estimateData.apiResponse.print.replace(/,/g, '')) > 0 && (
                <li className="flex items-start gap-2">
                <div
                  className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                    isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                  }`}
                ></div>
                
                <div className="flex justify-between w-full">
                  <span className="font-medium text-gray-700">Print </span>
                  <span className="text-gray-700">₹{estimateData.apiResponse.print}</span>
                </div>
              </li>
          )}
{(isAddiEase && estimateData.laticess === 'Yes' && showLaticesField) && parseFloat(estimateData.apiResponse.laticess.replace(/,/g, '')) > 0 && (
          // {isAddiEase && estimateData.laticess === 'Yes' && showLaticesField && estimateData.apiResponse.laticess > 0 && (
            <li className="flex items-start gap-2">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">Latices </span>
              <span className="text-gray-700">₹{estimateData.apiResponse.laticess}</span>
            </div>
          </li>
          )}

          {/* Finish Cost - Only show if applicable */}
          {/* {estimateData.finish && estimateData.apiResponse.finish > 0 && ( */}
          {values.finish_type && parseFloat(estimateData.apiResponse.finish.replace(/,/g, '')) > 0 && (
            <li className="flex items-start gap-2">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">Finish </span>
              <span className="text-gray-700">₹{estimateData.apiResponse.finish}</span>
            </div>
          </li>
          )}
 <div className={`border-t ${
            isEstimateStale ? 'border-gray-200' : 'border-gray-200'
          } my-2`}></div>
          {/* Subtotal */}
          <li className="flex items-start gap-2 pt-0">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">Subtotal </span>
              <span className="text-gray-700">₹{estimateData.apiResponse.estimate_price}</span>
            </div>
          </li>


          {/* Discounts - Only show if there are any */}
          {/* {estimateData.apiResponse.item_discount > 0 && (
            <li className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}></div>
              <div>
                <span className="font-medium text-gray-700">Item Discount: </span>
                <span className="text-gray-600"> ₹{estimateData.apiResponse.item_discount}</span>
              </div>
            </li>
          )} */}

{/* Discounted Price - Only show if different from estimate price */}
      {/* {estimateData.apiResponse.discounted_price !== estimateData.apiResponse.estimate_price && ( */}
      {parseFloat(estimateData.apiResponse.item_discount.replace(/,/g, '')) > 0 && (
            <li className="flex items-start gap-2 ">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">Special Discount </span>
              <span className="text-gray-700">(-)₹{estimateData.apiResponse.item_discount}</span>
            </div>
          </li>
          )}
          {/* {estimateData.apiResponse.additional_discount > 0 && ( */}
          {parseFloat(estimateData.apiResponse.additional_discount.replace(/,/g, '')) > 0 && (
             <li className="flex items-start gap-2 ">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">Additional Discount </span>
              <span className="text-gray-700">₹{estimateData.apiResponse.additional_discount}</span>
            </div>
          </li>
          )}
          {/* GST */}
          {/* {estimateData.apiResponse.gst > 0 && ( */}
          {parseFloat(estimateData.apiResponse.gst_18.replace(/,/g, '')) > 0 && (
            <li className="flex items-start gap-2 ">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">GST (18%) </span>
              <span className="text-gray-700">₹{estimateData.apiResponse.gst_18}</span>
            </div>
          </li>
          )}

         {parseFloat(estimateData.apiResponse.gst_5.replace(/,/g, '')) > 0 && (
            <li className="flex items-start gap-2 ">
            <div
              className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${
                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
              }`}
            ></div>
            
            <div className="flex justify-between w-full">
              <span className="font-medium text-gray-700">GST (5%) </span>
              <span className="text-gray-700">₹{estimateData.apiResponse.gst_5}</span>
            </div>
          </li>
          )}

          <div className={`border-t ${
            isEstimateStale ? 'border-gray-300' : 'border-gray-200'
          } my-2`}></div>

          {/* Total Price */}
          <div className={`flex justify-between text-base font-bold ${
            isEstimateStale ? 'text-primary' : 'text-primary'
          }`}>
            <span>Total Amount </span>
            <span>₹{estimateData.apiResponse.total_price}</span>
          </div>
        </div>
      </ul>
      {!isEstimateStale && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enable-submit"
              onChange={(e) => setEstimateConform(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-100"
            />
           
     <Label htmlFor="enable-submitss" className="text-sm font-medium leading-none ml-2">
        I agree to the{' '}
        {/* laticess: isAddiEase && !isDesignSelf ? values.Latices : 'No', */}
        {/* finish: !isPrintSelf ? values.finish_type : '0',  */}
        {(!isDesignSelf || !isPrintSelf) &&(

          <span 
          className="text-primary hover:underline cursor-pointer"
          onClick={() => window.open('/terms', '_blank')}
          >
          terms and conditions
        </span>
        ) }
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
