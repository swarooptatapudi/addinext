'use client';

import React, { useEffect } from 'react';

import { ChevronRight, LogOutIcon, Plus, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Popover } from '@radix-ui/react-popover';
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLazyLogoutQuery } from '@/rtk-query/apis/auth';
import useUser from '@/hooks/useUser';
import { USER } from '@/uttils/Types';
import { Label } from '@/components/ui/label';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from '@/components/ui/menubar';

export default function Header(): React.JSX.Element {
  const [logout, { isSuccess, isLoading }] = useLazyLogoutQuery();
  const { user }: { user: USER } = useUser();

  useEffect(() => {
    if (isSuccess) {
      window.location.href = '/auth';
    }
  }, [isSuccess]);

  return (
    <div className="h-16 bg-white    px-4 shadow-md">
      <div className="flex items-center justify-between h-full">
        <h3 className="text-2xl font-bold text-center text-primary">O&P Design Platform</h3>
        <div className="flex items-center gap-4">
          <Button variant={'secondary'}>Support</Button>
          {!user?.active_plan && (
            <Link href="/subscription/select-plan">
              <Button variant={'secondary'} className="cursor-pointer">
                Subscribe
              </Button>
            </Link>
          )}
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>AddiCoins:- {user?.customer_available_coins}</MenubarTrigger>
              <MenubarContent>
                <Link href="/addicoins">
                  <MenubarItem>
                    <Plus /> Add
                  </MenubarItem>
                </Link>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <Link href="/orders/new-order">
            <Button className="flex items-center gap-2">
              <PlusIcon />
              New Order
            </Button>
          </Link>
          <Popover>
            <PopoverTrigger>
              <Avatar>
                <AvatarFallback>{user?.first_name?.slice(0, 1)}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="min-w-[150px]  p-3 mr-3 mt-2 flex flex-col gap-4 items-start">
              <Link
                href={'/profile'}
                className="flex items-center justify-between  gap-2 cursor-pointer w-full"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{user?.first_name?.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <Label>{user?.full_name}</Label>
                </div>
                <ChevronRight size={20} />
              </Link>

              <Button
                variant={'destructive'}
                className="cursor-pointer w-full"
                onClick={(): void => {
                  void logout('');
                }}
                disabled={isLoading}
              >
                <LogOutIcon /> Logout
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
