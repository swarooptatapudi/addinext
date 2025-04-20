'use client';

import React from 'react';
import { ChevronRight, LogOutIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLazyLogoutQuery } from '@/rtk-query/apis/auth';
import useUser from '@/hooks/useUser';
import { Label } from '@/components/ui/label';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from '@/components/ui/menubar';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Header(): React.JSX.Element {
  const router = useRouter();
  const [logout] = useLazyLogoutQuery();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await logout('').unwrap();
      toast.success('Logged out successfully');
      router.push('/auth');
      router.refresh();
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-white px-4 shadow-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80">
          O&P Design Platform
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild>
            <Link href="/support">Support</Link>
          </Button>

          {!user?.active_plan && (
            <Button variant="secondary" asChild>
              <Link href="/subscription/select-plan">Subscribe</Link>
            </Button>
          )}

          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer">
                AddiCoins: {user?.customer_available_coins || 0}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Link href="/addicoins" className="flex items-center gap-2">
                    <PlusIcon size={16} /> Add Coins
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <Button asChild className="flex items-center gap-2">
            <Link href="/orders/new-order">
              <PlusIcon/>
              New Order
            </Link>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="User menu"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary text-white">
                    {user?.first_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-2"
              align="end"
              sideOffset={8}
            >
              <Link
                href="/profile"
                className="flex w-full items-center justify-between rounded p-2 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {user?.first_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Label className="font-normal">{user?.full_name}</Label>
                </div>
                <ChevronRight size={16} />
              </Link>

              <Button
                variant="destructive"
                className="mt-2 w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOutIcon size={16} />
                Logout
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
