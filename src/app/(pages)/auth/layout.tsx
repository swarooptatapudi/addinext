
import React from 'react';
import ErrorBoundary from '@/components/app/common/ErrorBoundary';

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorBoundary>
    <div className="flex w-full h-screen">
      <div className="flex flex-col items-center justify-center min-w-[60%] bg-gray-100 text-primary min-h-full">
        <h1 className="text-5xl font-bold ">ADDINxT</h1>
        <h2 className="text-2xl font-medium ">Welcome to the app</h2>
      </div>
      {children}
    </div>
    </ErrorBoundary>
  );
}
