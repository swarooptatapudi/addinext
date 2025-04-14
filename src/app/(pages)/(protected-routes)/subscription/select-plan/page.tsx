'use client';
import { useGetSubscriptionPlansQuery } from '@/rtk-query/apis/subscription';
import { SUBSCRIPTION_PLAN } from '@/uttils/Types';
import React, { useEffect } from 'react';
import PlanCard from '../_child/PlanCard';

export default function SelectPlan(): React.JSX.Element {
  const { data, isSuccess } = useGetSubscriptionPlansQuery('');
  const [plans, setPlans] = React.useState<Array<SUBSCRIPTION_PLAN>>([]);
  useEffect(() => {
    if (isSuccess) {
      setPlans(data?.data);
    }
  }, [isSuccess]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {plans?.map((plan) => <PlanCard plan={plan} key={plan?.name} />)}
    </div>
  );
}
