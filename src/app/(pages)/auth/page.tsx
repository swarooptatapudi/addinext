'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/rtk-query/apis/auth';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function SignIn(): React.JSX.Element {
  const [login, { isSuccess, isLoading }] = useLoginMutation();
  const router = useRouter();

  useEffect(() => {
    if (isSuccess) {
      router.push('/dashboard');
      toast.success('Login successful');
    }
  }, [isSuccess,router]);
  return (
    <div className="h-full p-4 flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-center justify-center w-[80%] bg-white p-4 rounded-lg drop--lg py-10">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-sm text-gray-500">Sign in to your account</p>
        <div className="flex flex-col gap-4 w-full mt-6">
          <Formik initialValues={{ usr: '', pwd: '' }} onSubmit={(values) => login(values)}>
            {({ values, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <Input placeholder="Email" value={values.usr} onChange={handleChange('usr')} />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={values.pwd}
                    onChange={handleChange('pwd')}
                  />
                  <Button type="submit" disabled={isLoading}>
                    Sign In
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
