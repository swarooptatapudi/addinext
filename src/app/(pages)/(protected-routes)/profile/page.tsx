'use client';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import { useSelector } from 'react-redux';

export default function Profile() {
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Avatar className="w-[100px] h-[100px]">
              <AvatarFallback className="text-2xl">{user?.first_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">{user?.full_name}</h1>
              <p className="text-sm">{user?.user_id}</p>
              {user?.active_plan && (
                <>
                  <span className="flex items-center gap-2">
                    <p className="text-xs">Active Plan:-</p>
                    <Badge className="bg-amber-400">{user?.active_plan}</Badge>
                  </span>
                  <p className="text-xs">Plan Expries on: {user?.plan_expiration_date}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
