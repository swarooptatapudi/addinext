'use client';
import React from 'react';
import PlanCard from '../../_child/PlanCard';
import {
  useGetSubscriptionPlanQuery,
  usePaymentInitMutation,
  useSubscribePlanMutation
} from '@/rtk-query/apis/subscription';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import { toast } from 'react-toastify';

export default function BuyPlan({ params }: { params: Promise<{ plan_id: string }> }) {
  const { plan_id } = React.use(params);
  const { data, isLoading } = useGetSubscriptionPlanQuery(plan_id);
  const [initPayment, { isLoading: paymentLoading }] = usePaymentInitMutation();
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const [paymentId, setPaymentId] = React.useState<string>('');
  const [subscribePlan, { isLoading: subscribeLoading }] = useSubscribePlanMutation();

  const onPayNow = async () => {
    const res = await initPayment({
      addinxt_subscription_id: plan_id,
      customer: user?.customer_id
    });
    if (res?.data) {
      toast.success(res?.data?.message);
      setPaymentId(res?.data?.customer_subscription_id?.name);
    }
  };

  const onSubscribe = async () => {
    const res = await subscribePlan({
      status: 'Success',
      customer_subscription_id: paymentId
    });

    if (res?.data) {
      toast.success('Payment Success');
      window.location.href = '/profile';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="h-fit">
        {isLoading ? <Skeleton className="h-[400px] w-full" /> : <PlanCard plan={data} readOnly />}
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm ">Amount</span>
              <span className="text-sm ">₹ {data?.plan_amount}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {!paymentId && (
              <Button disabled={paymentLoading} onClick={onPayNow}>
                Pay Now
              </Button>
            )}
            {paymentId && (
              <Button disabled={subscribeLoading} onClick={onSubscribe}>
                Payment Success
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
