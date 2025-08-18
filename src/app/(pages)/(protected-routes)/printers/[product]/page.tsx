// interface Props {
//   params: { product: string };
// }

// export default function BuyPrintersPage({ params }: Props) {
//   const { product } = params; // e.g. "AddiStud"

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">Buy</h1>
//       <p className="mt-4 text-gray-700">
//         You are buying <strong>{product}</strong>.  
//         (Here you can add product details, pricing, checkout form, etc.)
//       </p>
//     </div>
//   );
// }
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookmarkIcon, CoinsIcon, CreditCardIcon, InfoIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  useBuyAddiNxtCoinMutation,
  useBuyCoinsAfterPaymentMutation,
  useBuyCoinsInitiatePaymentMutation,
  useGetRateAndDiscountsQuery,
  useGetTransactionHistoryQuery,
} from '@/rtk-query/apis/addicoins'; 
import { USER } from '@/uttils/Types';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Loader, Check, X } from 'lucide-react';
import Razorpay from 'razorpay';

import { useValidateCouponMutation } from '@/rtk-query/apis/orders';
import { RootState } from '@/rtk-query/store';


declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
params: {product: string}
}

interface Transaction {
  payment_transaction_id: string;
  name: string;
  coins: number;
  total_amount:string;
  rate:string;
  transaction_date: string;
  transaction_type: string;
  payment_status: string;
  base_rate?:string;
}

interface RateAndDiscountData {
  message?: {
    status_code: number;
    message: string;
    data: {
      coin_rules: {
        custom_base_rate: number;
        custom_tax_rate: number;
        minimum_coin_purchase: number;
        maximum_coin_purchase: number;
        coin_price_per_unit: number;
        addinxt_subscription: string;
      };
      subscription_discount: number;
      time: string;
    };
  };
}
export default function BuyPrintersPage ({ params }: { params: Promise<{ product: string }> }) {
  const { product } = React.use(params);

  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const { data }: { data?: RateAndDiscountData } = useGetRateAndDiscountsQuery({
    customer: user?.customer_id,
  });
  console.log("rate dd:",data);
    console.log("user  dd:",user);
  
  const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
    customer: user?.customer_id,
  });
  console.log("transactionHistory dd:",user);
  const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
  const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
  const [buyAddiNxtCoin, { isLoading: isBuyingCoins }] = useBuyAddiNxtCoinMutation(); 
  const [buyQuantity, setBuyQuantity] = React.useState<number>(0);
  const [payId, setPayId] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

const coinRules = data?.message?.data?.coin_rules;
const minCoins =  1;
const maxCoins = coinRules?.maximum_coin_purchase || Infinity;
const applyRate = coinRules?.custom_base_rate || 0;
const taxRate = coinRules?.custom_tax_rate || 18;
const coinRate = coinRules?.coin_price_per_unit || 0;
const subscriptionId = coinRules?.addinxt_subscription || "Basic";
const standardDiscount = data?.message?.data?.subscription_discount || 50;

const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [validateCoupon] = useValidateCouponMutation();
  const [couponTimeout, setCouponTimeout] = useState<NodeJS.Timeout | null>(null);
 

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
      // const payload = { coupon_code: couponCode };
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

  const validateQuantity = (value: number) => {
    if (value < minCoins) {
      setError(`Minimum purchase is ${minCoins} coins`);
      return false;
    }
    if (value > maxCoins) {
      setError(`Maximum purchase is ${maxCoins === Infinity ? 'unlimited' : maxCoins} coins`);
      return false;
    }
    setError('');
    return true;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value); 
    if (!isNaN(value)) {
      setBuyQuantity(value);
      validateQuantity(value);
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const onPayNow = async () => {
    if (!validateQuantity(buyQuantity)) return;
  
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }
      
      // Set up Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount:(finalRate * 100).toString(),
        currency: 'INR',
        name: 'addiwise company',
        description: `Purchase of ${buyQuantity} coins`,
        // order_id: orderResponse.data.order_id,
        // image: '/your-company-logo.png',
        // order_id: "ddd",
        app_name:'addiwise customer portal',
        handler: async function(response: any) {
          console.log('Payment response:', response);
          try {
            const payload = {
              buy_coin: buyQuantity,
              plan: subscriptionId,
              payment_id: response.razorpay_payment_id,
              amount: finalRate.toString()
            };
            
            const result = await buyAddiNxtCoin(payload).unwrap();
            console.log('Payment result:', result);
            toast.success('product purchased successfully!');
            refetchTransactions(); 
            // if (result.success) {
            //   toast.success('Payment and coin purchase successful!');
            //   refetchTransactions();
            // } else {
            //   toast.error(result.message || 'Failed to update coins');
            // }
          } catch (err) {
            toast.error('Payment verification failed');
            console.error('Verification error:', err);
          }
        },
        prefill: {
          name: user?.full_name || '',
          // email: user?. || '',
          contact: user?.phone_number || '',
        },
         
        notes: {
          customer_id: user?.customer_id,
          coins: buyQuantity.toString(),
          plan: subscriptionId,
        },
        theme: {
          color: '#3399cc',
        },
      };
      console.log('Razorpay options:', options);
      // Open Razorpay payment modal
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function(response: any) {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });

    } catch (err) {
      toast.error('An error occurred during payment process');
    }
  };

  const onPaymentSuccess = async () => {
    try {
      const res = await buyCoins({
        customer_coins_transaction_id: payId,
        status: 'Success',
      });

      if ('data' in res) {
        toast.success(res.data?.message);
        refetchTransactions(); 
      } else {
        toast.error('Failed to complete payment');
      }
    } catch (err) {
      toast.error('An error occurred during payment completion');
    }
  };

const calculateBasicRate = (coins: number): number => {
  if (!coins || coins === 0) return 0;
  const baseAmount = coins * COIN_BASE_PRICE;
  const discountAmount = baseAmount * (DISCOUNT_PERCENTAGE / 100);
  console.log('Base Amount:', baseAmount);
  console.log('Discount Amount:', discountAmount);
  if (couponData?.discount_percentage) {
    const finalDiscountAmount = discountAmount * (couponData?.discount_percentage / 100);
    return discountAmount - finalDiscountAmount; 
  } else {
  return discountAmount; 
  }
};
const COIN_BASE_PRICE = 200; // 1 Addicoins: ₹200
const DISCOUNT_PERCENTAGE = 50; // Additional Discount: 50%
const TAX_PERCENTAGE = 18; // Tax Value: 18%

const calculateFinalRate = (basicRate: number): number => {
  if (!basicRate) return 0;
  const taxAmount = basicRate * (TAX_PERCENTAGE / 100);
  return basicRate + taxAmount;
};
  const basicRate = calculateBasicRate(buyQuantity);
const finalRate = calculateFinalRate(basicRate);
  
    return (
        <>
        <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Coins Card */}
        <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
          {/* <CardHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CoinsIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-primary">Available Coins</span>
                <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
                  {user?.customer_available_coins?.toLocaleString() || 0}
                </CardTitle>
              </div>
            </div>
          </CardHeader> */}
          
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <BookmarkIcon className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-semibold text-primary">Rules</p>
            </div>
            
            <ul className="text-sm space-y-2.5">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Quantity: </span>
                  {/* <span className="text-gray-600">₹{data?.data?.user_rules[0]?.coin_rate}</span> */}
                  {/* <span className="text-gray-600">₹200</span> */}
                  <span className="text-gray-600">₹{coinRate}</span>
                   {/* <span className="text-gray-600">₹{rule?.coin_price_per_unit ?? 0}</span> */}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Standard Discount:</span>
                  <span className="text-gray-600">{standardDiscount}%</span>
                  {/* <span className="text-gray-600">50%</span> */}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">MRP: </span>
                 
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Enter Coupon Code: </span>
                  {/* <span className="text-gray-600">{maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span> */}
                </div>
              </li>
              {/* {
                couponData?.discount_percentage && (
                  <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Net Amount: </span>
                  <span className="text-gray-600">₹100</span>
                  <span className="text-gray-600">{couponData?.discount_percentage}%</span>
                </div>
              </li>
                )} */}
           <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Net Amount: </span>
                  {/* <span className="text-gray-600">{maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span> */}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Tax Value: </span>
                  <span className="text-gray-600">{taxRate}%</span>
                  {/* <span className="text-gray-600">18%</span> */}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Final Rate: </span>
                  {/* <span className="text-gray-600">₹{applyRate}</span> */}
                  <span className="text-gray-600">₹{finalRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Buy Coins Card */}
        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-primary">Buy {product}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="w-full pt-1">
            <div className="space-y-4">
              <div>
                <Input
                  label="Quantity"
                  placeholder="Enter coin amount"
                  value={buyQuantity}
                  onChange={handleQuantityChange}
                  required
                  className="[&_input]:text-right [&_input]:text-lg [&_input]:font-medium [&_input]:py-4"
                />
                {error && (
                  <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <InfoIcon className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-2 mt-3">
      <div className="relative w-full">
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
              
             
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-0">
            <div className="w-full flex items-center justify-between py-3 px-1 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCardIcon className="w-5 h-5" />
                <span className="font-medium">Total Amount:</span>
              </div>
              <div className="text-xl font-bold text-blue-800">
                ₹{finalRate?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <Button
              className="w-full py-6 bg-gradient-to-r from-blue-900 to-blue-900 bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
              disabled={!!error || isLoading || isBuyingCoins || !buyQuantity}
              onClick={onPayNow}
            >
              {(isLoading || isBuyingCoins) ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  Buy Now
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
     
        </div>
        </>
    )
}