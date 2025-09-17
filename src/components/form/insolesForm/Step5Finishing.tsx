import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { ImageCheckbox } from './ImgproCheck';
import { useState, useCallback, useEffect } from 'react';
import {
  useCreateInsoleOrderMutation,
  useGetOrderDetailIdsMutation
} from '@/rtk-query/apis/orders';
import {
  thicknessToinsoletypeMap,
  insoletypeToThicknessMap
} from '@/app/(pages)/(protected-routes)/orders/new-order/_child/constants';
import { useGetINEstimateMutation, useValidateCouponMutation } from '@/rtk-query/apis/orders';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { BK_FORM_TYPE, USER } from '@/uttils/Types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookmarkIcon, CoinsIcon, Check, Loader, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useGetItemNameInByDetailsMutation } from '@/rtk-query/apis/products';
import { INSOLES_FORM_INITIAL_VALUES } from '@/app/(pages)/(protected-routes)/orders/new-order/_child/constants';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
type LayeringImageType = {
  Standard: string;
  Premium: string;
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
  type: 'Standard' | 'Premium';
};

export const Step5 = ({
  values,
  errors,
  touched,
  thicknests,
  selectedItem,
  isActiveStep,
  setFieldValue,
  FORM_OPTIONS,
  handleSubmit,
  orderId,
  deviceTypeId,
  isAddiSoleL,
  thicknest,
  showPriceSummary
}: any) => {
  const [selectedFinishOptions, setSelectedFinishOptions] = useState<SelectedFinishOption[]>([]);
  // const [thickness, setThickness] = useState("");
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<'Standard' | 'Premium'>('Standard');
  const [showEstimateCard, setShowEstimateCard] = useState(false);
  const [estimateConform, setEstimateConform] = useState(false);
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  const [createInsoleOrder, { isLoading: isOrderCreating }] = useCreateInsoleOrderMutation();
  const [estimateData, setEstimateData] = useState<any>(null);
  const [estimateDataLabel, setEstimateDataLabel] = useState<any>('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [getINEstimate, { isLoading, isError, data }] = useGetINEstimateMutation();
const [isEstimateDisabled, setIsEstimateDisabled] = useState(false);


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
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameInByDetailsMutation();

  // Coins as strings to match API response
  const [availableAddicoins, setAvailableAddicoins] = useState<string | null>(null);
  const [requiredAddicoins, setRequiredAddicoins] = useState<string | null>(null);

  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false); // State for modal
  const [showPreviwButton, setShowPreviwButton] = useState(false);
  const [orderData, setOrderData] = useState<any | null>({});
  const [showAddicoinsCard, setShowAddicoinsCard] = useState(false);
  const [formDisable, setFormDisable] = useState(false);

  const initialValues = INSOLES_FORM_INITIAL_VALUES;

  const isAddiSole = values.model_name === 'AddiEase';
  const isAddiSoleEco = values.model_name === 'AddiEaseEco';
  const showFinishOptions = isAddiSole || isAddiSoleEco;
  const [selectedItemCode, setSelectedItemcode] = React.useState<string>('');
  const [formValues, setFormValues] = useState(initialValues);

  {
    /**payment */
  }
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  // Add this useEffect to load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        script.onload = () => setIsRazorpayLoaded(true);
        script.onerror = () => {
          setIsRazorpayLoaded(false);
          toast.error('Failed to load payment gateway. Please refresh the page.');
        };

        document.body.appendChild(script);
      } catch (err) {
        setIsRazorpayLoaded(false);
      }
    };

    loadRazorpayScript();
  }, []);

  //    const handlePayAndPlaceOrder = async (values: any) => {
  //   if (!razorpayKey || !isRazorpayLoaded) {
  //     toast.error('Payment gateway is not available. Please try again.');
  //     return;
  //   }

  //   setIsPaymentProcessing(true);
  //   setFormValues(values);

  //   try {
  //     // 🔹 Step 1: Prepare payload for item code (IN specific)
  //     const payload = {
  //       item_type: 'IN',
  //       insole_model: values.insole_model,
  //       design_variation: values.design_variation,
  //       activity_level: values.activity_level,
  //       model_name: values.model_name,
  //       stump_length: values.stump_length,
  //       weight: values.weight,
  //       insoletype: values.insoletype,
  //       insole_design_variation: values.insole_design_variation,
  //       thickness: thicknests // e.g. "3.5 MM"
  //     };

  //     const itemCode = await getItemCodeByValues(payload);
  //     setSelectedItemcode(itemCode);

  //     // 🔹 Step 2: Build the order payload
  //     const orderPayload = {
  //       item_type: 'IN',
  //       customer: user?.customer_id,
  //       order_details: {
  //         ...values,
  //         thickness: thicknests // add calculated thickness
  //       },
  //       item_code: itemCode,
  //       addicoins: parseInt(values.addicoins) || 0
  //     };
  // console.log("orderPayload>>",orderPayload)
  //     // 🔹 Step 3: (Optional) Fetch order amount from API instead of hardcoded
  //     // const orderAmountResponse = await getOrderAmount(orderPayload).unwrap();
  //     // if (orderAmountResponse?.status !== "success") {
  //     //   throw new Error(orderAmountResponse?.message || "Failed to calculate order amount");
  //     // }
  //     // const orderAmount = orderAmountResponse.data.order_amount;
  //     const amountInPaise = 100000; // 🔹 Replace with dynamic orderAmount * 100

  //     // 🔹 Step 4: Configure Razorpay
  //     const options = {
  //       key: razorpayKey,
  //       amount: amountInPaise.toString(),
  //       currency: 'INR',
  //       name: 'Addiwise Company',
  //       description: `Payment for IN Order`,
  //       handler: async function (response: any) {
  //         try {
  //           // 🔹 Step 5: After payment success → Create order
  //           const finalOrderPayload = {
  //             ...orderPayload,
  //             custom_payment_reference_id: response.razorpay_payment_id
  //           };

  //           console.log('Final Insole Order Payload:', finalOrderPayload);
  //           const orderResponse = await createInsoleOrder(finalOrderPayload).unwrap();

  //           // @ts-ignore
  //           if (orderResponse?.message?.status === 'success') {
  //             toast.success('Payment successful! Insole order created successfully.');
  //             setSelectedItemcode('');
  //             setIsPaymentProcessing(false);
  //             setFormDisable(true);
  //             router.push('/orders');
  //           } else {
  //             // @ts-ignore
  //             throw new Error(orderResponse?.message?.message || 'Order creation failed');
  //           }
  //         } catch (orderError) {
  //           toast.error(
  //             'Payment successful but order creation failed. Please contact support with payment ID: ' +
  //             response.razorpay_payment_id
  //           );
  //           setIsPaymentProcessing(false);
  //         }
  //       },
  //       theme: { color: '#3399cc' },
  //       modal: {
  //         ondismiss: function () {
  //           setIsPaymentProcessing(false);
  //           toast.info('Payment cancelled');
  //         }
  //       }
  //     };

  //     const rzp = new window.Razorpay(options);

  //     rzp.on('payment.failed', function (response: any) {
  //       setIsPaymentProcessing(false);
  //       toast.error(`Payment failed: ${response.error.description}`);
  //     });

  //     rzp.open();
  //   } catch (error) {
  //     setIsPaymentProcessing(false);
  //     toast.error('Failed to prepare payment. Please try again.');
  //   }
  // };

 const handlePayAndPlaceOrderWithAddicoins = async (values: any) => {
  try {
    setIsPaymentProcessing(true);
    setFormValues(values);
    // 🔹 Step 1: Prepare payload for item code
    const payload = {
      item_type: "IN",
      insole_model: values.insole_model,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight,
      insoletype: values.insoletype,
      insole_design_variation: values.insole_design_variation,
      thickness: thicknests,
    };

    const itemCode = await getItemCodeByValues(payload);
    setSelectedItemcode(itemCode);

    // 🔹 Step 2: Build order payload (NO Razorpay needed)
    const orderPayload = {
      item_type: "IN",
      customer: user?.customer_id,
      order_details: {
        ...values,
        thickness: thicknests,
      },
      item_code: itemCode,
      addicoins: parseInt(values.addicoins) || 0, // Deduct coins
      total_price: estimateData?.apiResponse?.total_price ?? 0,
      payment_method: "ADDICOINS", // mark as coins payment
    };

    console.log("📦 Base Order Payload (Addicoins):", orderPayload);

    // 🔹 Step 3: Call API directly — no Razorpay flow
    const orderResponse = await createInsoleOrder(orderPayload).unwrap();
    console.log("✅ Order Response:", orderResponse);

    // @ts-ignore
    if (orderResponse?.message?.status === "success") {
      toast.success(" Order created successfully ");
      setSelectedItemcode("");
      setIsPaymentProcessing(false);
      setFormDisable(true);
      router.push("/orders");
    } else {
      // @ts-ignore
      throw new Error(orderResponse?.message?.message || "Order creation failed");
    }
  } catch (error: any) {
    console.error("❌ Addicoins order failed:", error);
    toast.error(error?.message || "Failed to place order using Addicoins");
    setIsPaymentProcessing(false);
  }
};
const handlePayLater = async (values: any) => {
  try {
    setIsPaymentProcessing(true); // ✅ Start processing (was false before)
    setFormValues(values);

    // 🟢 Step 1: Prepare payload for item code
    const payload = {
      item_type: "IN",
      insole_model: values.insole_model,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight,
      insoletype: values.insoletype,
      insole_design_variation: values.insole_design_variation,
      thickness: thicknests,
    };

    // Fetch item code
    const itemCode = await getItemCodeByValues(payload);
    if (!itemCode) {
      throw new Error("Failed to fetch item code. Please try again.");
    }
    setSelectedItemcode(itemCode);

    // 🟢 Step 2: Build order payload
    const orderPayload = {
      item_type: "IN",
      customer: user?.customer_id,
      order_details: {
        ...values,
        thickness: thicknests,
      },
      item_code: itemCode,
      addicoins: parseInt(values.addicoins) || 0, // Deduct coins
      total_price: estimateData?.apiResponse?.total_price ?? 0,
    };

    console.log("📝 Pay Later Order Payload:", orderPayload);

    // 🟢 Step 3: Call API directly — no Razorpay flow
    const orderResponse = await createInsoleOrder(orderPayload).unwrap();
    console.log("✅ Order Response:", orderResponse);
 // @ts-ignore
    if (orderResponse?.message?.status === "success") {
      toast.success("Order created successfully");
      setSelectedItemcode("");
      setFormDisable(true);
      router.push("/orders");
    } else {
       // @ts-ignore
      throw new Error(orderResponse?.message?.message || "Order creation failed");
    }
  } catch (error: any) {
    console.error("Order creation failed:", error);
    toast.error(error?.message || "Failed to place order using Addicoins");
  } finally {
    setIsPaymentProcessing(false); // ✅ Always stop loader
  }
};

  const handlePayAndPlaceOrder = async (values: any) => {
    if (!razorpayKey || !isRazorpayLoaded) {
      toast.error('Payment gateway is not available. Please try again.');
      return;
    }

    setIsPaymentProcessing(true);
    setFormValues(values);

    try {
      // 🔹 Step 1: Prepare payload for item code

      const payload = {
        item_type: 'IN',
        insole_model: values.insole_model,
        design_variation: values.design_variation,
        activity_level: values.activity_level,
        model_name: values.model_name,
        stump_length: values.stump_length,
        weight: values.weight,
        insoletype: values.insoletype,
        insole_design_variation: values.insole_design_variation,
        thickness: thicknests
        // e.g. "3.5 MM"
      };

      const itemCode = await getItemCodeByValues(payload);
      setSelectedItemcode(itemCode);

      // 🔹 Step 2: Build the order payload
      const orderPayload = {
        item_type: 'IN',
        customer: user?.customer_id, // Make sure this is an ID, not just a name
        order_details: {
          ...values,
          thickness: thicknests // add calculated thickness
        },
        item_code: itemCode,
        addicoins: parseInt(values.addicoins) || 0,
        total_price: estimateData?.apiResponse?.total_price ?? 0
      };

      console.log('📦 Base Order Payload:', orderPayload);

      // 🔹 Step 3: Payment amount (hardcoded for now)
      const amountInPaise = 100000; // Replace later with API order amount * 100

      // 🔹 Step 4: Configure Razorpay
      const options = {
        key: razorpayKey,
        amount: amountInPaise.toString(),
        currency: 'INR',
        name: 'Addiwise Company',
        description: `Payment for IN Order`,

        handler: async function (response: any) {
          try {
            // 🔹 Step 5: After payment success → Create order
            const finalOrderPayload = {
              ...orderPayload,
              razorpay_payment_id: response.razorpay_payment_id,
              custom_payment_reference_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            };

            console.log('📤 Final Insole Order Payload:', finalOrderPayload);

            const orderResponse = await createInsoleOrder(finalOrderPayload).unwrap();
            console.log('✅ Order Response:', orderResponse);

            // @ts-ignore
            if (orderResponse?.message?.status === 'success') {
              toast.success('Payment successful! Insole order created successfully.');
              setSelectedItemcode('');
              setIsPaymentProcessing(false);
              setFormDisable(true);
              router.push('/orders');
            } else {
              // @ts-ignore
              throw new Error(orderResponse?.message?.message || 'Order creation failed');
            }
          } catch (orderError: any) {
            console.error('❌ Order creation failed:', orderError);

            if (orderError?.data) {
              console.error('🔎 Backend error response:', orderError.data);
              toast.error(
                `Payment successful but order creation failed: ${
                  orderError.data.message || 'Unknown error'
                } (Payment ID: ${response.razorpay_payment_id})`
              );
            } else {
              toast.error(
                'Payment successful but order creation failed. Please contact support with payment ID: ' +
                  response.razorpay_payment_id
              );
            }

            setIsPaymentProcessing(false);
          }
        },

        theme: { color: '#3399cc' },
        modal: {
          ondismiss: function () {
            setIsPaymentProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        setIsPaymentProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (orderError: any) {
      console.error(' Unexpected error before payment:', orderError);

      if (orderError?.data) {
        console.error(' Backend error response:', orderError.data);
      }

      toast.error('Failed to prepare payment. Please try again.');
      setIsPaymentProcessing(false);
    }
  };
  const getItemCodeByValues = async (payload: any) => {
    const res: any = await getItem(payload);
    console.log('Item code fetch response:', res);
    return res?.data?.item_code;
  };

  const isDesignSelf = values.design_by === 'Self';
  const isPrintSelf = values.print_by === 'Self';

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
    if (showEstimateCard && !initialLoad) {
      const relevantFields = ['design_by', 'print_by', 'Latices', 'finish_type'];
      const hasChanged = relevantFields.some((field) => values[field] !== prevValues[field]);

      if (hasChanged) {
        setIsEstimateStale(true);
        setIsEstimateAccepted(false);
      }
    }
    setPrevValues(values);
  }, [values, showEstimateCard, prevValues, initialLoad]);

  //color api

  const validateBeforeAction = () => {
    console.log('Validating before action, selectedItem:', selectedItem, values);
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

  // const handleEstimateClick = async () => {
  //   const designByRes = values.Design_by || '';
  //   const printByRes = values.Print_by || '';
  //   const isDesignSelfRes = designByRes === 'Self';
  //   const isPrintSelfRes = printByRes === 'Self';

  //   const getBasePriceLabel = () => {
  //     const designBy = values.Design_by || '';
  //     const printBy = values.Print_by || '';

  //     const isDesignAddiwise = designBy === 'Addiwise';
  //     const isPrintAddiwise = printBy === 'Addiwise';
  //     const isDesignSelf = designBy === 'Self';
  //     const isPrintSelf = printBy === 'Self';

  //     if (isDesignAddiwise && isPrintAddiwise) {
  //       return 'Design + Print';
  //     }
  //     if (isDesignAddiwise) {
  //       return 'Design';
  //     }
  //     if (isPrintAddiwise) {
  //       return 'Print';
  //     }

  //     if (isDesignSelf && isPrintSelf) {
  //       return '';
  //     }
  //     if (isDesignSelf) {
  //       return 'Self Design';
  //     }
  //     if (isPrintSelf) {
  //       return 'Self Print';
  //     }

  //     return 'Base';
  //   };
  //   setEstimateDataLabel(getBasePriceLabel());

  //   if (!validateBeforeAction()) return;

  //   setIsEstimating(true);

  //   const estimatePayload = {
  //     item_code: selectedItem,
  //     design_by: values.Design_by,
  //     print_by: values.Print_by,
  //     discount_per: couponData?.discount_percentage || 0,
  //     discount_amt: couponData?.discount_amount || 0,
  //     coupon_code: couponCode.trim()
  //   };

  //   console.log('Estimate Payload:', estimatePayload);

  //   try {
  //     const response = await getINEstimate(estimatePayload).unwrap();
  //     console.log('Estimate Response:', response);
  //     const apiRes = response?.message?.data || {};
  //     // Parse coins to numbers for comparison

  //     // @ts-ignore
  //     const availableCoins = parseFloat(response.data.customer_available_coins.replace(/,/g, ''));
  //     // @ts-ignore
  //     const requiredCoins = parseFloat(response.data.design_coin_use.replace(/,/g, ''));
  //     // console.log('Available Coins , Required Coins:', availableCoins, requiredCoins);

  //     // @ts-ignore
  //     setAvailableAddicoins(response.data.customer_available_coins);
  //     // @ts-ignore
  //     setRequiredAddicoins(response.data.design_coin_use);

  //     if (isDesignSelf && isPrintSelf && availableCoins < requiredCoins) {
  //       setShowInsufficientCoinsModal(true);
  //       setIsEstimating(false);
  //       return;
  //     }

  //     if (isDesignSelf && !isPrintSelf && availableCoins < requiredCoins) {
  //       setShowInsufficientCoinsModal(true);
  //       setIsEstimating(false);
  //       return;
  //     }

  //     setEstimateData({
  //       ...estimatePayload,
  //       apiResponse: apiRes
  //     });
  //     setFieldValue('gst_5', response.data.gst_5 || '0.00');
  //     setFieldValue('gst_18', response.data.gst_18 || '0.00');
  //     setFieldValue('item_standard_discount', response.data.item_standard_discount || '0.00');
  //     setFieldValue('additional_discount', response.data.additional_discount || '0.00');
  //     // @ts-ignore
  //     setFieldValue('addicoins', response.data.design_coin_use || '0.00');

  //     setShowEstimateCard(true);
  //     setIsEstimateStale(false);
  //     setIsEstimateAccepted(false);
  //     if (isDesignSelf && isPrintSelf) {
  //       setEstimateConform(true);
  //     }
  //     // Construct and store orderPayload in local storage
  //     const orderPayload = {
  //       item_type: 'IN',
  //       customer: user?.customer_id || 'Not specified', // Use user prop
  //       order_details: values
  //     };
  //     // @ts--ignore
  //     // console.log('orderPayload MOdal', orderPayload);
  //     setOrderData(orderPayload);
  //     setShowPreviwButton(true);
  //   } catch (error: any) {
  //     toast.error(error.data?.message || 'Failed to get estimate');
  //     console.error('Estimate error:', error);
  
  //   } finally {
  //     setIsEstimating(false);
  //   }
  // };

  const handleEstimateClick = async () => {


    const estimatePayload = {
      item_code: selectedItem,
      design_by: values.Design_by,
      print_by: values.Print_by,
      discount_per: couponData?.discount_percentage || 0,
      discount_amt: couponData?.discount_amount || 0,
      coupon_code: couponCode.trim()
    };

    console.log('Estimate Payload:', estimatePayload);

    try {
      const response = await getINEstimate(estimatePayload).unwrap();
      console.log('Estimate Response:', response);

      // ✅ Correct extraction
      const apiRes = response?.message?.data || {};

      // Parse coins safely
      const availableCoins = parseFloat(apiRes.customer_available_coins?.replace(/,/g, '') || '0');
      const requiredCoins = parseFloat(apiRes.design_coin_use?.replace(/,/g, '') || '0');

      setAvailableAddicoins(apiRes.customer_available_coins || '0.00');
      setRequiredAddicoins(apiRes.design_coin_use || '0.00');

      if (isDesignSelf && availableCoins < requiredCoins) {
        setShowInsufficientCoinsModal(true);
        setIsEstimating(false);
        return;
      }

      // ✅ store API response in state
      setEstimateData({
        ...estimatePayload,
        apiResponse: apiRes
      });

      // ✅ set form values from apiRes
      setFieldValue('gst_5', apiRes.gst_5 || '0.00');
      setFieldValue('gst_18', apiRes.gst_18 || '0.00');
      setFieldValue('item_standard_discount', apiRes.item_standard_discount || '0.00');
      setFieldValue('additional_discount', apiRes.additional_discount || '0.00');
      setFieldValue('addicoins', apiRes.design_coin_use || '0.00');

      setShowEstimateCard(true);
      setIsEstimateStale(false);
      setIsEstimateAccepted(false);

      if (isDesignSelf && isPrintSelf) {
        setEstimateConform(true);
      }

      // Store payload
      const orderPayload = {
        item_type: 'IN',
        customer: user?.customer_id || 'Not specified',
        order_details: values
      };
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
      // console.log('Coupon Validation Response:', response);
      setCouponData(response.message);
    } catch (error: any) {
      setCouponData(null);
      // console.error('Coupon Validation Error:', error);
      toast.error(error.data?.message || '');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  //   const isDesignBySelf = values.Design_by === 'Self';
  // const isPrintBySelf = values.Print_by === 'Self';
  // const hideLaticesAndFinish = isDesignBySelf && isPrintBySelf;

  const LAYERING_IMAGES: Record<LayeringImagesKey, LayeringImageType> = {
    'city-comfort': {
      Standard: '/assets/order-forms/insoles/City_Standard.png',
      Premium: '/assets/order-forms/insoles/City_Premium.png',
      name: 'City Comfort'
    },
    endurance: {
      Standard: '/assets/order-forms/insoles/Endurance_Standard.png',
      Premium: '/assets/order-forms/insoles/Endurance_Premium.png',
      name: 'Endurance'
    },
    sensitive: {
      Standard: '/assets/order-forms/insoles/Sensitive_Standard.png',
      Premium: '/assets/order-forms/insoles/Standard_Premium.png',
      name: 'Sensitive'
    },
    sports: {
      Standard: '/assets/order-forms/insoles/sports_Standard.png',
      Premium: '/assets/order-forms/insoles/sports_Premium.png',
      name: 'Sports'
    },
    diabetic: {
      Standard: '/assets/order-forms/insoles/diabetic_Standardpng.png',
      Premium: '/assets/order-forms/insoles/diabetic_Premium.png',
      name: 'Diabetic'
    }
  };

  const getImageSet = (option: string): LayeringImageType | undefined => {
    if (!option) return undefined;

    const normalizedKey = option.toLowerCase().replace(/\s+/g, '-').trim() as LayeringImagesKey;

    if (LAYERING_IMAGES[normalizedKey]) {
      return LAYERING_IMAGES[normalizedKey];
    }

    return Object.values(LAYERING_IMAGES).find(
      (img) => img.name.toLowerCase() === option?.toLowerCase()
    );
  };

  const handleFinishOptionSelect = (option: FinishOption) => {
    setSelectedFinishOptions((prev) => {
      const exists = prev.find((item) => item.value === option.value);
      if (exists) {
        return prev.filter((item) => item.value !== option.value);
      } else {
        return [...prev, { value: option.value, type: 'Standard' }];
      }
    });
  };

  const handleTypeSelect = (optionValue: string, type: 'Standard' | 'Premium') => {
    setSelectedFinishOptions((prev) =>
      prev.map((item) => (item.value === optionValue ? { ...item, type } : item))
    );
    setFieldValue(`finish_options.${optionValue}`, type);
  };

  const getFinishOptions = () => {
    if (isAddiSole) {
      return [
        { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
        { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'colour', label: 'colour', color: 'bg-neutral-500 text-neutral-100' }
      ];
    } else if (isAddiSoleEco) {
      return [
        { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
        { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
      ];
    }
    return [];
  };

  // Define mapping (string thickness → insoletype option)

  const finishOptions = getFinishOptions();
  const options: FinishOption[] = [
    {
      value: 'city-comfort',
      label: 'City Comfort',
      imgSrc: '/assets/order-forms/insoles/City_Comfort.png'
    },
    { value: 'endurance', label: 'Endurance', imgSrc: '/assets/order-forms/insoles/Endurance.png' },
    { value: 'sensitive', label: 'Sensitive', imgSrc: '/assets/order-forms/insoles/Sensitive.png' },
    { value: 'sports', label: 'Sports', imgSrc: '/assets/order-forms/insoles/Sports.png' },
    { value: 'diabetic', label: 'Diabetic', imgSrc: '/assets/order-forms/insoles/Diabetics.png' }
  ];
  const selectedInsole = options.find((option) => option.label === values.insoletype);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        <div></div>
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

        {isAddiSole && (
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

        {/* <div className="grid md:grid-cols-2 gap-6 mt-2">
        <div className="flex items-center">
          <div className="grid md:grid-cols-2 gap-6 mt-2"> 
         <div className="flex items-center">
  <label className="font-medium min-w-[100px] text-sm">Thickness:</label>
  <input
    type="text"
    name="thickness"
    value={thickness}
     onChange={(e) => setThickness(e.target.value)}
    className="border rounded px-2 py-1 w-[350px] rounded-md"
    placeholder="Enter thickness"
   
  />
</div>

          </div>
         
        </div>
      </div> */}
        <div className="grid md:grid-cols-2 gap-6 mt-2">
          <div className="flex items-center">
            <label className="font-medium min-w-[150px] text-sm">Thickness of 3D layer</label>
            <div className="w-[250px]">
              <input
                type="text"
                // value={(console.log("Input value (thickness):", thickness), thickness)}
                value={thicknests}
                // ✅ just show the passed value
                readOnly
                className="border rounded px-2 py-1 w-full rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-2">
          <div className="flex items-center">
            <label className="font-medium min-w-[100px] text-sm">Insole Type</label>
            <div className="w-[250px]">
              <Input
                placeholder=""
                disabled
                value={thicknessToinsoletypeMap[values.thickness] || ''} // show text instead of number
                onChange={(e) => {
                  const newText = e.target.value;

                  // find the number (key) for this insoletype text
                  const matchingThickness = Object.entries(thicknessToinsoletypeMap).find(
                    ([key, insoletype]) => insoletype === newText
                  )?.[0];

                  if (matchingThickness) {
                    setFieldValue('thickness', matchingThickness); // store number internally
                    setFieldValue('insoletype', newText); // store text for insoletype
                  } else {
                    // if no match, allow free text (optional)
                    setFieldValue('thickness', '');
                    setFieldValue('insoletype', '');
                  }
                }}
              />
            </div>
          </div>
        </div>

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
        {/* {values.insole_model !=='AddiSole' ?(<>
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
         </>} */}

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
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                        values.finish_type === option.value
                          ? 'border-blue-200 ring-2 ring-blue-300'
                          : 'border-gray-300'
                      }`}
                    />
                    <span className="text-sm mt-1 capitalize">{option.label}</span>
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
                <h3 className="text-lg font-medium mb-[-40px]">Finish/ insoletype</h3>
                <div className="ml-45">
                <ImageCheckbox 
          options={options}
          value={selectedFinishOptions.length > 0 ? selectedFinishOptions[0].value : ''}
          onChange={(value) => {
            if (value) {
              setSelectedFinishOptions([{
                value,
                type: selectedFinishOptions.find(o => o.value === value)?.type || 'Standard'
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
                name="insole_design_variation" // must match Formik field
                checked={values.insole_design_variation === 'Standard'}
                onChange={() => setFieldValue('insole_design_variation', 'Standard')}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
              />
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <span className="text-base font-medium">Standard</span>
                  {values.insole_design_variation === 'Standard' && (
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed max-w-md">
                      Functional cushioning designed for regular use. Provides reliable comfort and
                      support for the intended purpose of the insole (walking, endurance, sports, or
                      medical use).
                    </p>
                  )}
                </div>
                {values.insole_design_variation === 'Standard' && selectedInsole && (
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
                name="insole_design_variation"
                checked={values.insole_design_variation === 'Premium'}
                onChange={() => setFieldValue('insole_design_variation', 'Premium')}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
              />
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <span className="text-base font-medium">Premium</span>
                  {values.insole_design_variation === 'Premium' && (
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed max-w-md">
                      Advanced cushioning with enhanced softness, shock absorption, and pressure
                      distribution. Recommended for sensitive feet, extended insole_design_variation
                      hours, or patients needing higher protection and comfort.
                    </p>
                  )}
                </div>
                {values.insole_design_variation === 'Premium' && selectedInsole && (
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
            const optionData = options.find((opt) => opt.value === option.value);

            return (
              <div key={index} className="flex flex-col items-center  border rounded-lg">
                <h4 className="font-xs">{optionData?.label}</h4>
                <div className="flex gap-4">
                  <div
                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
                      option.type === 'Standard' ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => handleTypeSelect(option.value, 'Standard')}
                  >
                    <p className="text-xs font-medium mb-1">Standard</p>
                    <div className="w-24 h-16 flex items-center justify-center">
                      {imageSet?.Standard ? (
                        <img
                          src={imageSet.Standard}
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
                        checked={option.type === 'Standard'}
                        onChange={() => handleTypeSelect(option.value, 'Standard')}
                        className="mr-1"
                      />
                      {/* <label className="text-sm">Select</label> */}
                    </div>
                  </div>

                  <div
                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
                      option.type === 'Premium' ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => handleTypeSelect(option.value, 'Premium')}
                  >
                    <p className="text-xs font-medium mb-1">Premium</p>
                    <div className="w-24 h-16 flex items-center justify-center">
                      {imageSet?.Premium ? (
                        <img
                          src={imageSet.Premium}
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
                        checked={option.type === 'Premium'}
                        onChange={() => handleTypeSelect(option.value, 'Premium')}
                        className="mr-1"
                      />
                      {/* <label className="text-sm">Select</label> */}
                    </div>
                  </div>
                </div>
                {/* <div className="mt-2 text-sm font-medium">
                Selected: <span className="text-blue-600">{option.type === 'Standard' ? 'Standard' : 'Premium'}</span>
              </div> */}
              </div>
            );
          })}
        </div>
        <p>
          Disclaimer : Actual product may vary in appearance from the images shown, without
          compromising on quality or functionality
        </p>
        <p>The color of the insole padding may vary depending on material availability.</p>
      </div>
      {/* right content */}
      
      {
        showPriceSummary && (
          <div className="flex flex-col gap-6">
       
 
        

        {values.Design_by === 'Addiwise' && values.Print_by === 'Addiwise' && (
          <>
          
            <Card
              className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} transition-colors duration-200`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5" />
                    <p
                      className={`text-sm font-semibold ${isEstimateStale ? 'text-gray-700' : 'text-gray-700'}`}
                    >
                      PRICE SUMMARY {isEstimateStale && '(Stale Estimate)'}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="text-sm space-y-2.5">
                  {parseFloat(estimateData?.apiResponse?.design.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Design</span>
                        <span className="text-gray-700">₹{estimateData.apiResponse.design}</span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.print.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Print</span>
                        <span className="text-gray-700">₹{estimateData.apiResponse.print}</span>
                      </div>
                    </li>
                  )}

                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-gray-700">Subtotal</span>
                      <span className="text-gray-700">
                        ₹{estimateData?.apiResponse?.estimate_price}
                      </span>
                    </div>
                  </li>
                  {parseFloat(estimateData?.apiResponse?.item_standard_discount.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Standard Discount</span>
                        <span className="text-gray-700">
                          -₹{estimateData?.apiResponse?.item_standard_discount}
                        </span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.additional_discount.replace(/,/g, '')) >
                    0 && (
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
                  {parseFloat(estimateData?.apiResponse?.gst_5.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">GST (5%)</span>
                        <span className="text-gray-700">+₹{estimateData.apiResponse.gst_5}</span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.gst_18.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">GST (18%)</span>
                        <span className="text-gray-700">+₹{estimateData.apiResponse.gst_18}</span>
                      </div>
                    </li>
                  )}
                  <div
                    className={`border-t ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} my-2`}
                  ></div>
                  <div
                    className={`flex justify-between text-base font-bold ${isEstimateStale ? 'text-primary' : 'text-primary'}`}
                  >
                    <span>Total Amount</span>
                    <span>₹{estimateData?.apiResponse?.total_price}</span>
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
          </>
        )}
        {values.Design_by === 'Addiwise' && values.Print_by === 'Self' && (
          <>
            <Card
              className={`bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} transition-colors duration-200`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5" />
                    <p
                      className={`text-sm font-semibold ${isEstimateStale ? 'text-gray-700' : 'text-gray-700'}`}
                    >
                      PRICE SUMMARY {isEstimateStale && '(Stale Estimate)'}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="text-sm space-y-2.5">
                  {parseFloat(estimateData?.apiResponse?.design.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Design</span>
                        <span className="text-gray-700">₹{estimateData.apiResponse.design}</span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.print.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Print</span>
                        <span className="text-gray-700">₹{estimateData.apiResponse.print}</span>
                      </div>
                    </li>
                  )}

                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-gray-700">Subtotal</span>
                      <span className="text-gray-700">
                        ₹{estimateData?.apiResponse?.estimate_price}
                      </span>
                    </div>
                  </li>
                  {parseFloat(estimateData?.apiResponse?.item_standard_discount.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Standard Discount</span>
                        <span className="text-gray-700">
                          -₹{estimateData.apiResponse.item_standard_discount}
                        </span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.additional_discount.replace(/,/g, '')) >
                    0 && (
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
                  {parseFloat(estimateData?.apiResponse?.gst_5.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">GST (5%)</span>
                        <span className="text-gray-700">+₹{estimateData.apiResponse.gst_5}</span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.gst_18.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">GST (18%)</span>
                        <span className="text-gray-700">+₹{estimateData.apiResponse.gst_18}</span>
                      </div>
                    </li>
                  )}
                  <div
                    className={`border-t ${isEstimateStale ? 'border-gray-200' : 'border-gray-200'} my-2`}
                  ></div>
                  <div
                    className={`flex justify-between text-base font-bold ${isEstimateStale ? 'text-primary' : 'text-primary'}`}
                  >
                    <span>Total Amount</span>
                    <span>₹{estimateData?.apiResponse?.total_price}</span>
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
          </>
        )}
         {values.Design_by === 'Self' && values.Print_by === 'Addiwise' && (
          
          <>
            <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg mt-4 cursor-pointer">
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
                    0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Balance after design</span>
                        <span className="text-gray-700">
                          {parseFloat(availableAddicoins?.replace(/,/g, '') || '0') -
                            parseFloat(requiredAddicoins?.replace(/,/g, '') || '0')}
                        </span>
                      </div>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

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
                  {parseFloat(estimateData?.apiResponse?.design?.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Design</span>
                        <span className="text-gray-700">₹{estimateData.apiResponse.design}</span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.print?.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Print</span>
                        <span className="text-gray-700">₹{estimateData?.apiResponse?.print}</span>
                      </div>
                    </li>
                  )}

                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-gray-700">Subtotal</span>
                      <span className="text-gray-700">
                        ₹{estimateData?.apiResponse?.estimate_price || '0.00'}
                      </span>
                    </div>
                  </li>
                  {parseFloat(estimateData?.apiResponse?.item_standard_discount.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Standard Discount</span>
                        <span className="text-gray-700">
                          -₹{estimateData.apiResponse.item_standard_discount}
                        </span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.additional_discount?.replace(/,/g, '')) >
                    0 && (
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
                  {parseFloat(estimateData?.apiResponse?.gst_5.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">GST (5%)</span>
                        <span className="text-gray-700">+₹{estimateData.apiResponse.gst_5}</span>
                      </div>
                    </li>
                  )}
                  {parseFloat(estimateData?.apiResponse?.gst_18.replace(/,/g, '')) > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800 flex-shrink-0"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">GST (18%)</span>
                        <span className="text-gray-700">+₹{estimateData.apiResponse.gst_18}</span>
                      </div>
                    </li>
                  )}
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between text-base font-bold text-primary">
                    <span>Total Amount</span>
                    <span>₹{estimateData?.apiResponse?.total_price}</span>
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
          </>
        )}
        {values.Design_by === 'Self' && values.Print_by === 'Self' && (
          <>
            <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border rounded-lg mt-4 cursor-pointer">
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
                    0 && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-800"></div>
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-700">Balance after design</span>
                        <span className="text-gray-700">
                          {parseFloat(availableAddicoins?.replace(/,/g, '') || '0') -
                            parseFloat(requiredAddicoins?.replace(/,/g, '') || '0')}
                        </span>
                      </div>
                    </li>
                  )}
                </ul>
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
              </CardContent>
            </Card>
             {!orderId && !deviceTypeId && (
          <Button
            className="w-[350px] mt-10 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
            onClick={handleEstimateClick}
            disabled={isEstimating}
          >
            {isEstimating ? 'Estimating...' : isEstimateStale ? 'Update Estimate' : 'Estimate Now'}
          </Button>
        )}
        <Button
                className="shadow-2xl w-88"
                onClick={() => handlePayAndPlaceOrderWithAddicoins(values)}
                disabled={
                  !estimateConform ||
                  isOrderCreating ||
                  isPaymentProcessing ||
                  ((values.Design_by !== 'Self' || values.Print_by !== 'Self') && !isRazorpayLoaded)
                }
              >
                {isPaymentProcessing ? 'Processing Payment...' : 'Pay & Place Order'}
              </Button>
          </>
        )}
       {!orderId && !deviceTypeId && (
  <>
    {/* ✅ Show Estimate Button Always */}
   

    {/* ✅ Show Payment Buttons ONLY if NOT Self/Self */}
    {!(values.Design_by === 'Self' && values.Print_by === 'Self') && (
      <> <Button
      className="w-[350px] mt-10 py-6 bg-gradient-to-r bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
      onClick={handleEstimateClick}
      disabled={isEstimating}
    >
      {isEstimating
        ? 'Estimating...'
        : isEstimateStale
        ? 'Update Estimate'
        : 'Estimate Now'}
    </Button> <div className="flex gap-2.5 mt-6">
        <Button
          className="shadow-2xl"
          onClick={() => handlePayAndPlaceOrder(values)}
          disabled={
            !estimateConform ||
            isOrderCreating ||
            isPaymentProcessing ||
            !isRazorpayLoaded
          }
        >
          {isPaymentProcessing
            ? 'Processing Payment...'
            : 'Pay & Place Order'}
        </Button>

        <Button
          className="shadow-2xl"
          onClick={() => handlePayLater(values)}
          type="submit"
          disabled={!estimateConform || isOrderCreating || isPaymentProcessing}
        >
          Pay Later
        </Button>
      </div></>
     
    )}
  </>
)}

      </div>
        )
      }
    </div>
  );
};