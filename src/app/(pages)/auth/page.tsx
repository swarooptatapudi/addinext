'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/rtk-query/apis/auth';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react'; // 👈 for password toggle icons

export default function SignIn(): React.JSX.Element {
  const [login, { isSuccess, error, isLoading }] = useLoginMutation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Login successful');
      router.replace('/'); // go to protected root
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    }
  }, [error]);

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
                  <Input
                    placeholder="Email"
                    value={values.usr}
                    onChange={handleChange('usr')}
                  />

                  {/* 👇 Password field with toggle button */}
                  <div className="relative">
                    <Input
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.pwd}
                      onChange={handleChange('pwd')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>

      <div className="flex justify-end text-sm text-blue-600 hover:underline cursor-pointer mt-4">
        <Link href="/auth/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
}



//===================================================================
// 'use client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useLoginMutation } from '@/rtk-query/apis/auth';
// import { Formik } from 'formik';
// import React, { useEffect } from 'react';
// import { toast } from 'react-toastify';
// import { useRouter } from 'next/navigation';

// export default function SignIn(): React.JSX.Element {
//   const [login, { isSuccess, isLoading, error }] = useLoginMutation();
//   const router = useRouter();
// useEffect(() => {
//     if (isSuccess) {
//       console.log(isSuccess,login);

//       // router.push('/dashboard');
//       window.location.href = '/dashboard';
//       // Force a full page reload to ensure all state is reset
//       setTimeout(() => window.location.reload(), 100);
//       toast.success('Login successful');
//     }
//   }, [isSuccess, router]);
//   // useEffect(() => {
//   //   if (isSuccess) {
//   //     // router.push('/dashboard');
//   //     window.location.href = '/dashboard';
//   //     toast.success('Login successful');

//   //   }
//   // }, [isSuccess, router]);

//   useEffect(() => {
//     if (error) {
//       // Log the full error for debugging
//       console.error('Login error:', error);
//       // Show user-friendly error message
//       toast.error('Login failed. Please check your credentials and try again.');
//     }
//   }, [error]);

//   return (
//     <div className="h-full p-4 flex flex-col items-center justify-center w-full">
//       <div className="flex flex-col items-center justify-center w-[80%] bg-white p-4 rounded-lg drop--lg py-10">
//         <h1 className="text-2xl font-bold">Sign In</h1>
//         <p className="text-sm text-gray-500">Sign in to your account</p>
//         <div className="flex flex-col gap-4 w-full mt-6">
//           <Formik
//             initialValues={{ usr: '', pwd: '' }}
//             onSubmit={(values) => {
//               console.log('Submitting:', values); // Debug log
//               login(values)
//                 .unwrap()
//                 .then((payload) => {
//                   console.log('Login successful:', payload); // Debug log
//                 })
//                 .catch((error) => {
//                   console.error('Login rejected:', error); // Debug log
//                 });
//             }}
//           >
//             {({ values, handleChange, handleSubmit }) => (
//               <form onSubmit={handleSubmit}>
//                 <div className="flex flex-col gap-4">
//                   <Input
//                     placeholder="Email"
//                     name="usr"
//                     value={values.usr}
//                     onChange={handleChange}
//                   />
//                   <Input
//                     placeholder="Password"
//                     type="password"
//                     name="pwd"
//                     value={values.pwd}
//                     onChange={handleChange}
//                   />
//                   <Button type="submit" disabled={isLoading}>
//                     Sign In
//                   </Button>
//                 </div>
//               </form>
//             )}
//           </Formik>
//         </div>
//       </div>
//     </div>
//   );
// }
