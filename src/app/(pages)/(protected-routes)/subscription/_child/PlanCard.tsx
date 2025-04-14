import { SUBSCRIPTION_PLAN } from '@/uttils/Types';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PlanCard({
  plan,
  readOnly
}: {
  plan: SUBSCRIPTION_PLAN;
  readOnly?: boolean;
}) {
  return (
    <Card className="justify-between">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-normal">{plan?.plan_name}</CardTitle>
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-center text-4xl font-bold">₹{plan?.plan_amount}</p>
          {plan?.subscription_bonus_coins ? (
            <p className="text-sm">{plan?.subscription_bonus_coins} Addicoins</p>
          ) : (
            '-'
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ul className="flex flex-col gap-5 w-[80%]">
          {plan &&
            plan?.subscription_features &&
            plan?.subscription_features
              ?.slice()
              ?.sort((a, b) => a.idx - b.idx)
              .map((feature, index) => (
                <li className="flex items-center gap-2" key={index}>
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="text-sm font-[400]">{feature.feature_name}</p>
                </li>
              ))}
        </ul>
      </CardContent>
      {!readOnly && (
        <CardFooter className="w-full ">
          <Link href={`/subscription/select-plan/${plan?.name}`} className="w-full">
            <Button className="w-full">Select</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
