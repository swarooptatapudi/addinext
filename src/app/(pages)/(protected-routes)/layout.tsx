'use client';
import Header from '@/components/app/common/Header';
import PageNavigationBreadcrumb from '@/components/app/common/PageNavigationBreadcrumb';
import Sidebar from '@/components/app/common/Sidebar';
// import { Button } from '@/components/ui/button';
import useUser from '@/hooks/useUser';
// import { useLazyLogoutQuery } from '@/rtk-query/apis/auth';
import React from 'react';

export default function MainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  // const [logout, { isLoading: logoutLoading }] = useLazyLogoutQuery();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen w-full">Loading...</div>;
  }
  if (!user && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        {/* <Button
          onClick={async () => {
            await logout('');
            window.location.href = '/auth';
          }}
          disabled={logoutLoading}
          variant={'destructive'}
        >
          Logout
        </Button> */}
      </div>
    );
  }
  return (
    <>
      <div className="h-screen sticky left-0 top-0  z-10">
        <Sidebar />
      </div>
      <section className="flex-1  bg-white   relative">
        <header className="z-10  top-0">
          <Header />
          <div className="px-4 py-2 bg-accent border-t">
            <PageNavigationBreadcrumb />
          </div>
        </header>
        <div className="flex-1 p-4 ">{children}</div>
      </section>
    </>
  );
}
