'use client';

import React, { useState } from 'react';

import {
  useGetRateAndDiscountsQuery,
} from '@/rtk-query/apis/addicoins';

import {
  useCreateCoinOrderMutation,
} from '@/rtk-query/apis/coins_transactions';

import { usePaymentLauncher } from '@/hooks/usePaymentLauncherForScannersPrinters';

import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';

import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

/* ================= UI ================= */

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import {
  BookmarkIcon,
  CoinsIcon,
  CreditCardIcon,
  InfoIcon,
  ShoppingCartIcon,
  Loader,
  Check,
  X,
} from 'lucide-react';

/* ========================================================= */

export default function Addicoins(): React.JSX.Element {

  /* ================= USER ================= */

  const { user }: { user: USER } = useSelector(
    (state: RootState) => state.userReducer
  );

  /* ================= API ================= */

  const {
    data: rateData,
    isLoading: isPricing,
  } = useGetRateAndDiscountsQuery({
    customer: user?.customer_id,
  });

  const [createOrder, { isLoading: isCreating }] =
    useCreateCoinOrderMutation();

  const { startPayment } = usePaymentLauncher();

  /* ================= STATE ================= */

  const [buyQuantity, setBuyQuantity] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string>('');

  const [couponData, setCouponData] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  /* ================= RULES ================= */

  const coinRules = rateData?.message?.data?.coin_rules;

  const minCoins =
    coinRules?.minimum_coin_purchase || 3;

  const maxCoins =
    coinRules?.maximum_coin_purchase || Infinity;

  const coinRate =
    coinRules?.coin_price_per_unit || 0;

  const taxRate =
    coinRules?.custom_tax_rate || 18;

  const standardDiscount =
    rateData?.message?.data?.subscription_discount || 0;

  /* ======================================================
     VALIDATION
  ====================================================== */

  const validateQuantity = (value: number) => {

    if (value < minCoins) {
      setError(`Minimum purchase is ${minCoins} coins`);
      return false;
    }

    if (value > maxCoins) {
      setError(
        `Maximum purchase is ${
          maxCoins === Infinity ? 'Unlimited' : maxCoins
        } coins`
      );
      return false;
    }

    setError('');
    return true;
  };

  /* ======================================================
     CHANGE
  ====================================================== */

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const value = Number(e.target.value);

    if (!isNaN(value)) {
      setBuyQuantity(value);
      validateQuantity(value);
    }
  };

  /* ======================================================
     PRICE CALC
  ====================================================== */

  const baseAmount = buyQuantity * coinRate;

  const discountAmount =
    baseAmount * (standardDiscount / 100);

  const basicRate =
    baseAmount - discountAmount;

  const taxAmount =
    basicRate * (taxRate / 100);

  const finalRate =
    basicRate + taxAmount;

  /* ======================================================
     PAY
  ====================================================== */

  const onPayNow = async () => {

    if (!validateQuantity(buyQuantity)) return;

    try {

      /* Create Order */

      const res = await createOrder({
        coins: buyQuantity,
        coupon_code: couponCode || undefined,
      }).unwrap();

      const salesOrder = res?.message?.sales_order;

      if (!salesOrder) {
        throw new Error('Order failed');
      }

      /* Launch Payment */

      await startPayment(salesOrder);

      toast.success('Payment started');

    } catch (err: any) {

      console.error(err);

      toast.error(
        err?.data?.message ||
        err?.message ||
        'Payment failed'
      );
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (

    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ================= AVAILABLE COINS ================= */}

        <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">

          <CardHeader className="pb-0">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-blue-100 rounded-lg">
                <CoinsIcon className="w-5 h-5 text-blue-600" />
              </div>

              <div>

                <span className="text-sm font-semibold text-primary">
                  Available Coins
                </span>

                <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
                  {user?.customer_available_coins?.toLocaleString() || 0}
                </CardTitle>

              </div>

            </div>

          </CardHeader>


          <CardContent className="pt-4">

            <div className="flex items-center gap-2 mb-3">
              <BookmarkIcon className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-semibold text-primary">
                Rules
              </p>
            </div>

            <ul className="text-sm space-y-2.5">

              <li className="flex gap-2">
                <span className="font-medium text-gray-700">
                  1 Addicoins:
                </span>
                <span className="text-gray-600">
                  ₹{coinRate}
                </span>
              </li>

              <li className="flex gap-2">
                <span className="font-medium text-gray-700">
                  Standard Discount:
                </span>
                <span className="text-gray-600">
                  {standardDiscount}%
                </span>
              </li>

              <li className="flex gap-2">
                <span className="font-medium text-gray-700">
                  Minimum Purchase:
                </span>
                <span className="text-gray-600">
                  {minCoins}
                </span>
              </li>

              <li className="flex gap-2">
                <span className="font-medium text-gray-700">
                  Maximum Purchase:
                </span>
                <span className="text-gray-600">
                  {maxCoins === Infinity ? 'Unlimited' : maxCoins}
                </span>
              </li>

              <li className="flex gap-2">
                <span className="font-medium text-gray-700">
                  Basic Rate:
                </span>
                <span className="text-gray-600">
                  ₹{basicRate.toLocaleString('en-IN')}
                </span>
              </li>

              <li className="flex gap-2">
                <span className="font-medium text-gray-700">
                  Tax:
                </span>
                <span className="text-gray-600">
                  {taxRate}%
                </span>
              </li>

              <li className="flex gap-2 font-semibold">
                <span className="font-medium text-gray-700">
                  Final Rate:
                </span>
                <span className="text-gray-600">
                  ₹{finalRate.toLocaleString('en-IN')}
                </span>
              </li>

            </ul>

          </CardContent>

        </Card>


        {/* ================= BUY COINS ================= */}

        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">

          <CardHeader className="pb-2">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
              </div>

              <CardTitle className="text-xl font-semibold text-primary">
                Buy Coins
              </CardTitle>

            </div>

          </CardHeader>


          <CardContent className="pt-1">

            <div className="space-y-4">

              {/* Quantity */}

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


              {/* Coupon */}

              <div className="space-y-2 mt-3">

                <div className="relative">

                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="pr-10"
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

              </div>


              {/* Limits */}

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">

                <div className="flex items-center gap-2 text-gray-600 text-sm">

                  <InfoIcon className="w-4 h-4" />

                  <span>Min: {minCoins}</span>

                  <span>|</span>

                  <span>
                    Max: {maxCoins === Infinity ? 'Unlimited' : maxCoins}
                  </span>

                </div>

              </div>

            </div>

          </CardContent>


          <CardFooter className="flex flex-col space-y-3 pt-0">

            {/* Total */}

            <div className="w-full flex justify-between py-3 border-t">

              <div className="flex items-center gap-2 text-gray-600">

                <CreditCardIcon className="w-5 h-5" />

                <span className="font-medium">
                  Total Amount:
                </span>

              </div>

              <div className="text-xl font-bold text-blue-800">
                ₹{finalRate.toLocaleString('en-IN')}
              </div>

            </div>


            {/* Button */}

            <Button
              className="w-full py-6 bg-gradient-to-r from-blue-900 to-blue-900 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
              disabled={
                !!error ||
                isPricing ||
                isCreating ||
                !buyQuantity
              }
              onClick={onPayNow}
            >

              {(isPricing || isCreating) ? (
                <span className="animate-pulse">
                  Processing...
                </span>
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
  );
}
