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
  console.log("#####",isSuccess,isLoading);
   
  useEffect(() => {
    if (isSuccess) {
      console.log("Redirecting to dashboard");
      router.replace('/dashboard'); 
      window.location.reload(); 
      toast.success('Login successful');
    }
  }, [isSuccess, router]);
  // useEffect(() => {
  //   console.log("Login status changed", { isSuccess, isLoading });
  //   if (isSuccess) {
  //     console.log("Redirecting to dashboard");
  //     router.push('/dashboard');
  //     toast.success('Login successful');
  //   }
  // }, [isSuccess,router]);

  // useEffect(() => {
  //   if (isSuccess) {
  //     router.push('/dashboard');
  //     toast.success('Login successful');
  //   }
  // }, [isSuccess]);

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