'use client';
import { useState, useEffect, useCallback } from 'react';
import { SelectBox } from '@/components/ui/selectbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkIcon, Check, Link, Loader, X, CoinsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useGetBKEstimateMutation, useValidateCouponMutation } from '@/rtk-query/apis/orders';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGetProductColorStep5Mutation } from '@/rtk-query/apis/products';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

import OrderSummaryModal from './OrderSummaryModal'; // Import the modal
// Define the API response type
interface EstimateResponse {
  design: string;
  print: string;
  laticess: string;
  finish: string;
  estimate_price: string;
  item_discount: string;
  additional_discount: string;
  discounted_price: string;
  discounted_price_18: string;
  discounted_price_5: string;
  gst_18: string;
  gst_5: string;
  total_price: string;
  customer_available_coins: string;
  design_coin_use: string;
}

interface OrderSummaryModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: string;
}

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
  deviceTypeId,
  user // Add user prop to access customer_id
}: any) => {
  const [showEstimateCard, setShowEstimateCard] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);
  const [estimateDataLabel, setEstimateDataLabel] = useState<any>('');
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

  // Coins as strings to match API response
  const [availableAddicoins, setAvailableAddicoins] = useState<string | null>(null);
  const [requiredAddicoins, setRequiredAddicoins] = useState<string | null>(null);

  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false); // State for modal
  const [showPreviwButton, setShowPreviwButton] = useState(false);
  const [orderData, setOrderData] = useState<any | null>({});

  const isAddiEase = values.model_name === 'AddiEase';
  const isAddiEaseEco = values.model_name === 'AddiEaseEco';
  const isAddiEaseL = values.model_name === 'AddiEaseL';

  const showFinishOptions =
    isAddiEase || isAddiEaseEco || isAddiEaseL || 'AddiEaseMould' || 'AddiEaseMould-HR';
  const showFinishOptionsMould = isAddiEase || isAddiEaseEco || isAddiEaseL;
  const isDesignSelf = values.Design_by === 'Self';
  const isPrintSelf = values.Print_by === 'Self';

  //colors dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSubColor, setSelectedSubColor] = useState<{
    label: string;
    hex: string;
  } | null>(null);

  const [getProductColorStep5] = useGetProductColorStep5Mutation();
  const [subColors, setSubColors] = useState<{ label: string; hex: string }[]>([]);

  const getTailwindColorClass = (name: string) => {
    const safe = name.toLowerCase();

    const colorMap: Record<string, string> = {
      black: '#000000',
      red: '#EF4444',
      blue: '#3B82F6',
      green: '#10B981',
      yellow: '#FACC15',
      pink: '#EC4899',
      brown: '#78350F',
      orange: '#FB923C',
      purple: '#8B5CF6',
      gray: '#9CA3AF'
    };

    return colorMap[safe] || '#888888'; // Fallback hex
  };

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
    setShowLaticesField(isAddiEase && isAddiEaseL && !isDesignSelf);
    if (orderId && deviceTypeId) {
      setFieldValue('finish_type', values.finish_type);
    } else {
      if ((showFinishOptions && !values.finish_type) || initialLoad) {
        if (isAddiEase || isAddiEaseL) {
          setFieldValue('finish_type', 'Bead Blast');
        } else if (isAddiEaseEco) {
          setFieldValue('finish_type', 'Bead Blast');
        }
      }
      setShowLaticesField(isAddiEaseL || isAddiEase);
    }
  }, [
    isDesignSelf,
    values.model_name,
    showFinishOptions,
    isAddiEase,
    isAddiEaseL,
    isAddiEaseEco,
    setFieldValue,
    initialLoad,
    orderId,
    deviceTypeId
  ]);

  useEffect(() => {
    if (showEstimateCard && !initialLoad) {
      const relevantFields = ['Design_by', 'Print_by', 'Latices', 'finish_type'];
      const hasChanged = relevantFields.some((field) => values[field] !== prevValues[field]);

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

  //color api
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const data = await getProductColorStep5({}).unwrap(); // ['Orange', 'Yellow', ...]
        // console.log("colors :", data);

        const mappedColors = data.map((colorName: string) => ({
          label: colorName,
          hex: getTailwindColorClass(colorName) // Convert name to Tailwind class
        }));

        setSubColors(mappedColors);
      } catch (err) {
        console.error('Failed to fetch product colors:', err);
      }
    };

    fetchColors();
  }, []);

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
      laticess: (isAddiEase || isAddiEaseL) && !isDesignSelf ? values.Latices : 'No',
      finish: !isPrintSelf ? values.finish_type : '0',
      discount_per: couponData?.discount_percentage || 0,
      discount_amt: couponData?.discount_amount || 0,
      coupon_code: couponCode.trim()
    };

    console.log('Estimate Payload:', estimatePayload);

    try {
      const response = await getBKEstimate(estimatePayload).unwrap();
      // console.log('Estimate Response:', response);
      // Parse coins to numbers for comparison

      // @ts-ignore
      const availableCoins = parseFloat(response.data.customer_available_coins.replace(/,/g, ''));
      // @ts-ignore
      const requiredCoins = parseFloat(response.data.design_coin_use.replace(/,/g, ''));
      // console.log('Available Coins , Required Coins:', availableCoins, requiredCoins);

      // @ts-ignore
      setAvailableAddicoins(response.data.customer_available_coins);
      // @ts-ignore
      setRequiredAddicoins(response.data.design_coin_use);

      if (isDesignSelf && isPrintSelf && availableCoins < requiredCoins) {
        setShowInsufficientCoinsModal(true);
        setIsEstimating(false);
        return;
      }

      if (isDesignSelf && !isPrintSelf && availableCoins < requiredCoins) {
        setShowInsufficientCoinsModal(true);
        setIsEstimating(false);
        return;
      }

      setEstimateData({
        ...estimatePayload,
        apiResponse: response.data
      });
      setFieldValue('gst_5', response.data.gst_5 || '0.00');
      setFieldValue('gst_18', response.data.gst_18 || '0.00');
      setFieldValue('item_discount', response.data.item_discount || '0.00');
      setFieldValue('additional_discount', response.data.additional_discount || '0.00');
      // @ts-ignore
      setFieldValue('addicoins', response.data.design_coin_use || '0.00');

      setShowEstimateCard(true);
      setIsEstimateStale(false);
      setIsEstimateAccepted(false);
      if (isDesignSelf && isPrintSelf) {
        setEstimateConform(true);
      }
      // Construct and store orderPayload in local storage
      const orderPayload = {
        item_type: 'BK',
        customer: user?.customer_id || 'Not specified', // Use user prop
        order_details: values
      };
      // @ts--ignore
      // console.log('orderPayload MOdal', orderPayload);
      setOrderData(orderPayload);
      setShowPreviwButton(true);
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
    const payload = { coupon_code: couponCode };
    try {
      const response = await validateCoupon({ coupon_code: couponCode }).unwrap();
      console.log('Coupon Validation Response:', response);
      setCouponData(response.message);
    } catch (error: any) {
      setCouponData(null);
      console.error('Coupon Validation Error:', error);
      toast.error(error.data?.message || 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const getFinishOptions = () => {
    if (isAddiEase || isAddiEaseL) {
      return [
        {
          value: 'Dye',
          label: 'Black Dye',
          color: 'bg-black text-white'
        },
        {
          value: 'Colour',
          label: selectedSubColor?.label || 'Colour',
          color: selectedSubColor?.hex || 'bg-neutral-500 text-white',
          subColors: subColors,
          hex: selectedSubColor?.hex || '#888888' // coming from API
        }
      ];
    } else if (isAddiEaseEco) {
      return [
        {
          value: 'Dye',
          label: 'Black Dye',
          color: 'bg-black text-white'
        },
        {
          value: 'Epoxy',
          label: 'Epoxy',
          color: 'bg-slate-500 text-white'
        }
      ];
    }
    return [];
  };

  const finishOptions = getFinishOptions();

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 p-2 ml-5">
          <h3 className="text-lg font-semibold text-primary">Design & Printing</h3>
          <div className="grid md:grid-cols-2 gap-6 mt-5">
            <div className="flex items-center gap-4">
              <label className="font-sm min-w-[100px] text-sm">Design by</label>
              <div className="w-[300px] min-w-[200px]">
                <SelectBox
                  options={FORM_OPTIONS.design_by || []}
                  value={values.Design_by || ''}
                  onValueChange={(value) => {
                    setFieldValue('Design_by', value);
                    setEstimateConform(false);
                  }}
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
                  options={FORM_OPTIONS.print_by || []}
                  value={values.Print_by || ''}
                  onValueChange={(value) => {
                    setFieldValue('Print_by', value);
                    setEstimateConform(false);
                  }}
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
              <label className="font-medium text-sm">
                {isAddiEase || isAddiEaseL || isAddiEaseEco ? 'Finish' : ''}{' '}
              </label>
              {showFinishOptionsMould && (
                <div className="ml-10 mb-5">
                  <div className="flex items-center gap-8 -mt-7 ml-12 ">
                    {finishOptions.map((option) => (
                      <div key={option.value} className="relative">
                        {option.subColors ? (
                          <>
                            {/* Dropdown Trigger Button */}
                            <div
                              className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                                values.finish_type === 'Colour'
                                  ? 'border-blue-200 ring-2 ring-blue-300'
                                  : 'border-gray-300'
                              }`}
                              style={{
                                backgroundColor: option.hex
                              }}
                              onClick={() => setIsDropdownOpen((prev) => !prev)}
                            ></div>

                            <div className="text-sm mt-1 text-center">{option.label}</div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                              <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg p-2 w-50">
                                <p className="text-xs text-gray-500 mb-1">Choose Colour</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {option.subColors.map((sub) => (
                                    <label
                                      key={sub.label}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name="finish_type"
                                        value="Colour"
                                        className="sr-only"
                                        checked={
                                          values.finish_type === 'Colour' &&
                                          selectedSubColor?.label === sub.label
                                        }
                                        onChange={() => {
                                          setSelectedSubColor(sub);
                                          setFieldValue('finish_type', 'Colour');
                                          setIsDropdownOpen(false);
                                        }}
                                      />
                                      <div
                                        className={`w-6 h-6 rounded-full border-2 ${
                                          selectedSubColor?.label === sub.label
                                            ? 'border-blue-400 ring-2 ring-blue-200'
                                            : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: sub.hex }}
                                      />
                                      <span className="text-sm">{sub.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          // Normal options like Black Dye
                          <label className="flex flex-col items-center cursor-pointer">
                            <input
                              type="radio"
                              name="finish_type"
                              value={option.value}
                              checked={values.finish_type === option.value}
                              onChange={() => {
                                setSelectedSubColor(null);
                                setFieldValue('finish_type', option.value);
                              }}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                                values.finish_type === option.value
                                  ? 'border-blue-200 ring-2 ring-blue-300'
                                  : 'border-gray-300'
                              }`}
                            />
                            <span className="text-sm mt-1 capitalize">{option.label}</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.finish_type && touched.finish_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
                  )}
                </div>
              )}

              <div className="space-y-2 mt-0">
                <div className="relative w-[350px]">
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
              {!orderId && !deviceTypeId && (
                <Button
                  className="w-[350px] mt-10 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
                  onClick={handleEstimateClick}
                  disabled={isEstimating}
                >
                  {isEstimating
                    ? 'Estimating...'
                    : isEstimateStale
                      ? 'Update Estimate'
                      : 'Estimate Now'}
                </Button>
              )}
              {showPreviwButton && (
                <Button
                  className="w-[350px] mt-4 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
                  onClick={() => setIsOrderSummaryOpen(true)}
                  disabled={isEstimating}
                >
                  Show Order Summary
                </Button>
              )}
            </div>
          )}
        </div>

        {showInsufficientCoinsModal ? (
          <Dialog open={showInsufficientCoinsModal} onOpenChange={setShowInsufficientCoinsModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center pb-2 pt-1">
                <DialogTitle className="text-primary text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CoinsIcon className="w-5 h-5 text-primary" />
                    <p className="">Insufficient Addicoins</p>
                  </div>
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  You do not have enough Addicoins to place this order. Please add more Addicoins to
                  proceed.
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Available Addicoins</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {availableAddicoins || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Design will use</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {requiredAddicoins || 0}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Additional Needed</span>
                      <span className="text-lg font-bold text-gray-700">
                        {parseFloat(requiredAddicoins?.replace(/,/g, '') || '0') -
                          parseFloat(availableAddicoins?.replace(/,/g, '') || '0')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInsufficientCoinsModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowInsufficientCoinsModal(false);
                      window.location.href = '/addicoins';
                    }}
                    className="flex-1"
                  >
                    Add Addicoins
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="md:w-[500px] mr-40 space-y-4 mt-2">
            {initialLoad && isActiveStep && (
              <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
            )}
            {!initialLoad && showEstimateCard && estimateData?.apiResponse && (
              <>
                {isDesignSelf && isPrintSelf ? (
                  <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CoinsIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">PAY WITH ADDICOINS</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="text-sm space-y-2.5">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                          <div className="flex justify-between w-full">
                            <span className="font-medium text-gray-700">Available Addicoins</span>
                            <span className="text-gray-700">{availableAddicoins}</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                          <div className="flex justify-between w-full">
                            <span className="font-medium text-gray-700">Design will use</span>
                            <span className="text-gray-700">{requiredAddicoins}</span>
                          </div>
                        </li>

                        {parseFloat(availableAddicoins?.replace(/,/g, '') || '0') -
                          parseFloat(requiredAddicoins?.replace(/,/g, '') || '0') >
                        0 ? (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">
                                Balance after design
                              </span>
                              <span className="text-gray-700">
                                {parseFloat(availableAddicoins?.replace(/,/g, '') || '0') -
                                  parseFloat(requiredAddicoins?.replace(/,/g, '') || '0')}
                              </span>
                            </div>
                          </li>
                        ) : (
                          ''
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                ) : !isDesignSelf && !isPrintSelf ? (
                  <Card
                    className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${
                      isEstimateStale ? 'border-gray-200' : 'border-gray-200'
                    } transition-colors duration-200`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                          <BookmarkIcon
                            className={`w-5 h-5 ${isEstimateStale ? 'text-gray-600' : 'text-gray-700'}`}
                          />
                          <p
                            className={`text-sm font-semibold ${
                              isEstimateStale ? 'text-gray-700' : 'text-gray-700'
                            }`}
                          >
                            PRICE SUMMARY {isEstimateStale && ''}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="text-sm space-y-2.5">
                        <div className="space-y-3 text-sm">
                          {parseFloat(estimateData.apiResponse.design.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Design</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.design}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(estimateData.apiResponse.print.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Print</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.print}
                                </span>
                              </div>
                            </li>
                          )}
                          {(isAddiEase || isAddiEaseL) &&
                            estimateData.laticess === 'Yes' &&
                            showLaticesField &&
                            parseFloat(estimateData.apiResponse.laticess.replace(/,/g, '')) > 0 && (
                              <li className="flex items-start gap-2">
                                <div
                                  className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                    isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                  }`}
                                ></div>
                                <div className="flex justify-between w-full">
                                  <span className="font-medium text-gray-700">Latices</span>
                                  <span className="text-gray-700">
                                    ₹{estimateData.apiResponse.laticess}
                                  </span>
                                </div>
                              </li>
                            )}

                          {values.finish_type &&
                            parseFloat(estimateData.apiResponse.finish.replace(/,/g, '')) > 0 && (
                              <li className="flex items-start gap-2">
                                <div
                                  className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                    isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                  }`}
                                ></div>
                                <div className="flex justify-between w-full">
                                  <span className="font-medium text-gray-700">Finish</span>
                                  <span className="text-gray-700">
                                    ₹{estimateData.apiResponse.finish}
                                  </span>
                                </div>
                              </li>
                            )}
                          <div
                            className={`border-t ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} my-2`}
                          ></div>
                          <li className="flex items-start gap-2 pt-0">
                            <div
                              className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                              }`}
                            ></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Subtotal</span>
                              <span className="text-gray-700">
                                ₹{estimateData.apiResponse.estimate_price}
                              </span>
                            </div>
                          </li>
                          {parseFloat(estimateData.apiResponse.item_discount.replace(/,/g, '')) >
                            0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Special Discount</span>
                                <span className="text-gray-700">
                                  (-)₹{estimateData.apiResponse.item_discount}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(
                            estimateData.apiResponse.additional_discount.replace(/,/g, '')
                          ) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">
                                  Additional Discount
                                </span>
                                <span className="text-gray-700">
                                  (-)₹{estimateData.apiResponse.additional_discount}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(estimateData.apiResponse.gst_18.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">GST (18%)</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.gst_18}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(estimateData.apiResponse.gst_5.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">GST (5%)</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.gst_5}
                                </span>
                              </div>
                            </li>
                          )}
                          <div
                            className={`border-t ${isEstimateStale ? 'border-gray-300' : 'border-gray-200'} my-2`}
                          ></div>
                          <div
                            className={`flex justify-between text-base font-bold ${
                              isEstimateStale ? 'text-primary' : 'text-primary'
                            }`}
                          >
                            <span>Total Amount</span>
                            <span>₹{estimateData.apiResponse.total_price}</span>
                          </div>
                        </div>
                      </ul>
                      {(!isDesignSelf || !isPrintSelf) && (
                        <>
                          {!isEstimateStale && (
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="enable-submit"
                                  onChange={(e) => setEstimateConform(e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-100"
                                />
                                <Label
                                  htmlFor="enable-submitss"
                                  className="text-sm font-medium leading-none ml-2"
                                >
                                  I agree to the{' '}
                                  <span
                                    className="text-primary hover:underline cursor-pointer"
                                    onClick={() => window.open('/terms', '_blank')}
                                  >
                                    terms and conditions
                                  </span>
                                </Label>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : isDesignSelf && !isPrintSelf ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg gap-0">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <CoinsIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-700">
                                PAY WITH ADDICOINS
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <ul className="text-sm space-y-2.5">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">
                                  Available Addicoins
                                </span>
                                <span className="text-gray-700">{availableAddicoins}</span>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Design will use</span>
                                <span className="text-gray-700">{requiredAddicoins}</span>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">
                                  Balance after design
                                </span>
                                <span className="text-gray-700">
                                  {parseFloat(availableAddicoins?.replace(/,/g, '') || '0') -
                                    parseFloat(requiredAddicoins?.replace(/,/g, '') || '0')}
                                </span>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card
                        className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg gap-0 ${
                          isEstimateStale ? 'border-gray-200' : 'border-gray-200'
                        } transition-colors duration-200`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                              <BookmarkIcon
                                className={`w-5 h-5 ${isEstimateStale ? 'text-gray-600' : 'text-gray-700'}`}
                              />
                              <p
                                className={`text-sm font-semibold ${
                                  isEstimateStale ? 'text-gray-700' : 'text-gray-700'
                                }`}
                              >
                                PRICE SUMMARY {isEstimateStale && ''}
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <ul className="text-sm space-y-2.5">
                            <div className="space-y-3 text-sm">
                              {parseFloat(estimateData.apiResponse.design.replace(/,/g, '')) >
                                0 && (
                                <li className="flex items-start gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                      isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                    }`}
                                  ></div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-700">Design</span>
                                    <span className="text-gray-700">
                                      ₹{estimateData.apiResponse.design}
                                    </span>
                                  </div>
                                </li>
                              )}
                              {parseFloat(estimateData.apiResponse.print.replace(/,/g, '')) > 0 && (
                                <li className="flex items-start gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                      isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                    }`}
                                  ></div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-700">Print</span>
                                    <span className="text-gray-700">
                                      ₹{estimateData.apiResponse.print}
                                    </span>
                                  </div>
                                </li>
                              )}
                              {isAddiEase &&
                                estimateData.laticess === 'Yes' &&
                                showLaticesField &&
                                parseFloat(estimateData.apiResponse.laticess.replace(/,/g, '')) >
                                  0 && (
                                  <li className="flex items-start gap-2">
                                    <div
                                      className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                        isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                      }`}
                                    ></div>
                                    <div className="flex justify-between w-full">
                                      <span className="font-medium text-gray-700">Latices</span>
                                      <span className="text-gray-700">
                                        ₹{estimateData.apiResponse.laticess}
                                      </span>
                                    </div>
                                  </li>
                                )}
                              {values.finish_type &&
                                parseFloat(estimateData.apiResponse.finish.replace(/,/g, '')) >
                                  0 && (
                                  <li className="flex items-start gap-2">
                                    <div
                                      className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                        isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                      }`}
                                    ></div>
                                    <div className="flex justify-between w-full">
                                      <span className="font-medium text-gray-700">Finish</span>
                                      <span className="text-gray-700">
                                        ₹{estimateData.apiResponse.finish}
                                      </span>
                                    </div>
                                  </li>
                                )}
                              <div
                                className={`border-t ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} my-2`}
                              ></div>
                              <li className="flex items-start gap-2 pt-0">
                                <div
                                  className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                    isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                  }`}
                                ></div>
                                <div className="flex justify-between w-full">
                                  <span className="font-medium text-gray-700">Subtotal</span>
                                  <span className="text-gray-700">
                                    ₹{estimateData.apiResponse.estimate_price}
                                  </span>
                                </div>
                              </li>
                              {parseFloat(
                                estimateData.apiResponse.item_discount.replace(/,/g, '')
                              ) > 0 && (
                                <li className="flex items-start gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                      isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                    }`}
                                  ></div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-700">
                                      Special Discount
                                    </span>
                                    <span className="text-gray-700">
                                      (-)₹{estimateData.apiResponse.item_discount}
                                    </span>
                                  </div>
                                </li>
                              )}
                              {parseFloat(
                                estimateData.apiResponse.additional_discount.replace(/,/g, '')
                              ) > 0 && (
                                <li className="flex items-start gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                      isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                    }`}
                                  ></div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-700">
                                      Additional Discount
                                    </span>
                                    <span className="text-gray-700">
                                      (-)₹{estimateData.apiResponse.additional_discount}
                                    </span>
                                  </div>
                                </li>
                              )}
                              {parseFloat(estimateData.apiResponse.gst_18.replace(/,/g, '')) >
                                0 && (
                                <li className="flex items-start gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                      isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                    }`}
                                  ></div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-700">GST (18%)</span>
                                    <span className="text-gray-700">
                                      ₹{estimateData.apiResponse.gst_18}
                                    </span>
                                  </div>
                                </li>
                              )}
                              {parseFloat(estimateData.apiResponse.gst_5.replace(/,/g, '')) > 0 && (
                                <li className="flex items-start gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                      isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                    }`}
                                  ></div>
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-700">GST (5%)</span>
                                    <span className="text-gray-700">
                                      ₹{estimateData.apiResponse.gst_5}
                                    </span>
                                  </div>
                                </li>
                              )}
                              <div
                                className={`border-t ${isEstimateStale ? 'border-gray-300' : 'border-gray-200'} my-2`}
                              ></div>
                              <div
                                className={`flex justify-between text-base font-bold ${
                                  isEstimateStale ? 'text-primary' : 'text-primary'
                                }`}
                              >
                                <span>Total Amount</span>
                                <span>₹{estimateData.apiResponse.total_price}</span>
                              </div>
                            </div>
                          </ul>
                          {(!isDesignSelf || !isPrintSelf) && (
                            <>
                              {!isEstimateStale && (
                                <div className="mt-4 space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="enable-submit"
                                      onChange={(e) => setEstimateConform(e.target.checked)}
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-100"
                                    />
                                    <Label
                                      htmlFor="enable-submitss"
                                      className="text-sm font-medium leading-none ml-2"
                                    >
                                      I agree to the{' '}
                                      <span
                                        className="text-primary hover:underline cursor-pointer"
                                        onClick={() => window.open('/terms', '_blank')}
                                      >
                                        terms and conditions
                                      </span>
                                    </Label>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : !isDesignSelf && isPrintSelf ? (
                  <Card
                    className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${
                      isEstimateStale ? 'border-gray-200' : 'border-gray-200'
                    } transition-colors duration-200`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                          <BookmarkIcon
                            className={`w-5 h-5 ${isEstimateStale ? 'text-gray-600' : 'text-gray-700'}`}
                          />
                          <p
                            className={`text-sm font-semibold ${
                              isEstimateStale ? 'text-gray-700' : 'text-gray-700'
                            }`}
                          >
                            PRICE SUMMARY {isEstimateStale && ''}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="text-sm space-y-2.5">
                        <div className="space-y-3 text-sm">
                          {parseFloat(estimateData.apiResponse.design.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Design</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.design}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(estimateData.apiResponse.print.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Print</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.print}
                                </span>
                              </div>
                            </li>
                          )}
                          {isAddiEase &&
                            estimateData.laticess === 'Yes' &&
                            showLaticesField &&
                            parseFloat(estimateData.apiResponse.laticess.replace(/,/g, '')) > 0 && (
                              <li className="flex items-start gap-2">
                                <div
                                  className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                    isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                  }`}
                                ></div>
                                <div className="flex justify-between w-full">
                                  <span className="font-medium text-gray-700">Latices</span>
                                  <span className="text-gray-700">
                                    ₹{estimateData.apiResponse.laticess}
                                  </span>
                                </div>
                              </li>
                            )}
                          {values.finish_type &&
                            parseFloat(estimateData.apiResponse.finish.replace(/,/g, '')) > 0 && (
                              <li className="flex items-start gap-2">
                                <div
                                  className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                    isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                  }`}
                                ></div>
                                <div className="flex justify-between w-full">
                                  <span className="font-medium text-gray-700">Finish</span>
                                  <span className="text-gray-700">
                                    ₹{estimateData.apiResponse.finish}
                                  </span>
                                </div>
                              </li>
                            )}
                          <div
                            className={`border-t ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} my-2`}
                          ></div>
                          <li className="flex items-start gap-2 pt-0">
                            <div
                              className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                              }`}
                            ></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Subtotal</span>
                              <span className="text-gray-700">
                                ₹{estimateData.apiResponse.estimate_price}
                              </span>
                            </div>
                          </li>
                          {parseFloat(estimateData.apiResponse.item_discount.replace(/,/g, '')) >
                            0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">Special Discount</span>
                                <span className="text-gray-700">
                                  (-)₹{estimateData.apiResponse.item_discount}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(
                            estimateData.apiResponse.additional_discount.replace(/,/g, '')
                          ) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">
                                  Additional Discount
                                </span>
                                <span className="text-gray-700">
                                  (-)₹{estimateData.apiResponse.additional_discount}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(estimateData.apiResponse.gst_18.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">GST (18%)</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.gst_18}
                                </span>
                              </div>
                            </li>
                          )}
                          {parseFloat(estimateData.apiResponse.gst_5.replace(/,/g, '')) > 0 && (
                            <li className="flex items-start gap-2">
                              <div
                                className={`w-1.5 h-1.5 mt-2 rounded-full ${
                                  isEstimateStale ? 'bg-purple-800' : 'bg-purple-800'
                                }`}
                              ></div>
                              <div className="flex justify-between w-full">
                                <span className="font-medium text-gray-700">GST (5%)</span>
                                <span className="text-gray-700">
                                  ₹{estimateData.apiResponse.gst_5}
                                </span>
                              </div>
                            </li>
                          )}
                          <div
                            className={`border-t ${isEstimateStale ? 'border-gray-300' : 'border-gray-200'} my-2`}
                          ></div>
                          <div
                            className={`flex justify-between text-base font-bold ${
                              isEstimateStale ? 'text-primary' : 'text-primary'
                            }`}
                          >
                            <span>Total Amount</span>
                            <span>₹{estimateData.apiResponse.total_price}</span>
                          </div>
                        </div>
                      </ul>
                      {(!isDesignSelf || !isPrintSelf) && (
                        <>
                          {!isEstimateStale && (
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="enable-submit"
                                  onChange={(e) => setEstimateConform(e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-100"
                                />
                                <Label
                                  htmlFor="enable-submitss"
                                  className="text-sm font-medium leading-none ml-2"
                                >
                                  I agree to the{' '}
                                  <span
                                    className="text-primary hover:underline cursor-pointer"
                                    onClick={() => window.open('/terms', '_blank')}
                                  >
                                    terms and conditions
                                  </span>
                                </Label>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${
                      isEstimateStale ? 'border-gray-200' : 'border-gray-200'
                    } transition-colors duration-200`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5" />
                          <p
                            className={`text-sm font-semibold ${
                              isEstimateStale ? 'text-gray-700' : 'text-gray-700'
                            }`}
                          >
                            PRICE SUMMARY {isEstimateStale && '(Stale Estimate)'}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="text-sm space-y-2.5">
                        {parseFloat(estimateData.apiResponse.design.replace(/,/g, '')) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Design</span>
                              <span className="text-gray-700">
                                ₹{estimateData.apiResponse.design}
                              </span>
                            </div>
                          </li>
                        )}
                        {parseFloat(estimateData.apiResponse.print.replace(/,/g, '')) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Print</span>
                              <span className="text-gray-700">
                                ₹{estimateData.apiResponse.print}
                              </span>
                            </div>
                          </li>
                        )}
                        {parseFloat(estimateData.apiResponse.laticess.replace(/,/g, '')) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Latices</span>
                              <span className="text-gray-700">
                                ₹{estimateData.apiResponse.laticess}
                              </span>
                            </div>
                          </li>
                        )}
                        {parseFloat(estimateData.apiResponse.finish.replace(/,/g, '')) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Finish</span>
                              <span className="text-gray-700">
                                ₹{estimateData.apiResponse.finish}
                              </span>
                            </div>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                          <div className="flex justify-between w-full">
                            <span className="font-medium text-gray-700">Subtotal</span>
                            <span className="text-gray-700">
                              ₹{estimateData.apiResponse.estimate_price}
                            </span>
                          </div>
                        </li>
                        {parseFloat(estimateData.apiResponse.item_discount.replace(/,/g, '')) >
                          0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Item Discount</span>
                              <span className="text-gray-700">
                                -₹{estimateData.apiResponse.item_discount}
                              </span>
                            </div>
                          </li>
                        )}
                        {parseFloat(
                          estimateData.apiResponse.additional_discount.replace(/,/g, '')
                        ) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">Additional Discount</span>
                              <span className="text-gray-700">
                                (-)₹{estimateData.apiResponse.additional_discount}
                              </span>
                            </div>
                          </li>
                        )}
                        {parseFloat(estimateData.apiResponse.gst_5.replace(/,/g, '')) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">GST (5%)</span>
                              <span className="text-gray-700">
                                +₹{estimateData.apiResponse.gst_5}
                              </span>
                            </div>
                          </li>
                        )}
                        {parseFloat(estimateData.apiResponse.gst_18.replace(/,/g, '')) > 0 && (
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-gray-700">GST (18%)</span>
                              <span className="text-gray-700">
                                +₹{estimateData.apiResponse.gst_18}
                              </span>
                            </div>
                          </li>
                        )}
                        <div
                          className={`border-t ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} my-2`}
                        ></div>
                        <div
                          className={`flex justify-between text-base font-bold ${
                            isEstimateStale ? 'text-primary' : 'text-primary'
                          }`}
                        >
                          <span>Total Amount</span>
                          <span>₹{estimateData.apiResponse.total_price}</span>
                        </div>
                      </ul>
                      {!isDesignSelf && !isPrintSelf && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="enable-submit"
                              onChange={(e) => setEstimateConform(e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-100"
                            />
                            <Label
                              htmlFor="enable-submit"
                              className="text-sm font-medium leading-none ml-2"
                            >
                              I agree to the{' '}
                              <span
                                className="text-primary hover:underline cursor-pointer"
                                onClick={() => window.open('/terms', '_blank')}
                              >
                                terms and conditions
                              </span>
                            </Label>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {isOrderSummaryOpen && (
        <OrderSummaryModal
          open={isOrderSummaryOpen}
          onOpenChange={setIsOrderSummaryOpen}
          orderData={orderData}
          selectedItem={selectedItem}
        />
      )}
    </>
  );
};
