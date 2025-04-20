'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useBuyCoinsAfterPaymentMutation,
  useBuyCoinsInitiatePaymentMutation,
  useGetRateAndDiscountsQuery
} from '@/rtk-query/apis/addicoins';
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import React from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function Addicoins(): React.JSX.Element {
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const router = useRouter();
  const { data } = useGetRateAndDiscountsQuery({
    customer: user?.customer_id
  });
  const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
  const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
  const [buyQuantity, setBuyQuantity] = React.useState<number>(100);
  const [payId, setPayId] = React.useState<string>('');

  const onPayNow = async () => {
    const res = await initPayment({
      coins_qty: buyQuantity,
      customer: user?.customer_id
    });

    if (res?.data) {
      toast.success(res?.data?.message);
      setPayId(res?.data?.customer_coins_transaction_id);
    }
  };
  const onPaymentSuccess = async () => {
    const res = await buyCoins({
      customer_coins_transaction_id: payId,
      status: 'Success'
    });

    if (res?.data) {
      toast.success(res?.data?.message);
      router.refresh();
      // window.location.reload();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="text-sm font-serif">Available Coins:- </span>
            <CardTitle>{user?.customer_available_coins}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="w-fit">
          <p className="text-sm font-semibold pb-2 ">Rules</p>
          <ul className="text-xs font-[400] flex flex-col gap-1 list-disc pl-4">
            <li>1 Addicoins = ₹{data?.coins_rate} INR</li>
            {data?.coins_special_discount > 0 && (
              <li>Special Discount = {data?.coins_special_discount}%</li>
            )}
            <li>Plan Discount = {data?.plan_discount}%</li>
            <li>Total Discount = {data?.total_discount}%</li>
            <li>Minimum Coin Purchase = {data?.minimum_coin_purchase}</li>
            <li>Maximum Coin Purchase = {data?.maximum_coin_purchase}</li>
            <li>After Discount Rate = ₹{data?.after_discount_rate}</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Buy Coins</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <Input
            label="Quantity"
            placeholder="100"
            value={buyQuantity}
            onChange={(e: any) => {
              if (!isNaN(e.target.value)) {
                setBuyQuantity(e.target.value);
              }
            }}
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col ">
          <div className="text-sm w-full flex items-center justify-between py-2 border-y">
            Total Amount:-{' '}
            <b className="text-lg">
              ₹ {Number(buyQuantity * Number(data?.after_discount_rate || 0))?.toFixed(2)}
            </b>
          </div>
          {!payId && (
            <Button
              className="mt-4 w-full"
              disabled={
                buyQuantity < data?.minimum_coin_purchase ||
                !buyQuantity ||
                buyQuantity > data?.maximum_coin_purchase ||
                isLoading
              }
              onClick={onPayNow}
            >
              Buy Now
            </Button>
          )}
          {payId && (
            <Button
              className="mt-4 w-full"
              disabled={isPaymentSuccessLoading}
              onClick={onPaymentSuccess}
            >
              Payment Success
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
