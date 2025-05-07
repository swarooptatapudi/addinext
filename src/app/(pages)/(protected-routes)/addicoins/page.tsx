'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useBuyAddiNxtCoinMutation,
  useBuyCoinsAfterPaymentMutation,
  useBuyCoinsInitiatePaymentMutation,
  useGetRateAndDiscountsQuery,
  useGetTransactionHistoryQuery,
} from '@/rtk-query/apis/addicoins';
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Razorpay from 'razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Transaction {
  payment_transaction_id: string;
  name: string;
  coins: number;
  total_amount:string;
  rate:string;
  transaction_date: string;
  transaction_type: string;
  payment_status: string;
}

interface RateAndDiscountData {
  data?: {
    user_rules: Array<{
      minimum: number;
      maximum: number;
      apply_rate: number;
      plan: string;
      coin_rate: number;
      discount: number;
    }>;
  };
}

export default function Addicoins(): React.JSX.Element {
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const { data }: { data?: RateAndDiscountData } = useGetRateAndDiscountsQuery({
    customer: user?.customer_id,
  });
  
  const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
    customer: user?.customer_id,
  });
  const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
  const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
  const [buyAddiNxtCoin, { isLoading: isBuyingCoins }] = useBuyAddiNxtCoinMutation(); 
  const [buyQuantity, setBuyQuantity] = React.useState<number>(0);
  const [payId, setPayId] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const minCoins = data?.data?.user_rules[0]?.minimum || 0;
  const maxCoins = data?.data?.user_rules[0]?.maximum || Infinity;
  const applyRate = data?.data?.user_rules[0]?.apply_rate || 0;
  const currentPlan = data?.data?.user_rules[0]?.plan || "Basic";

  const validateQuantity = (value: number) => {
    if (value < minCoins) {
      setError(`Minimum purchase is ${minCoins} coins`);
      return false;
    }
    if (value > maxCoins) {
      setError(`Maximum purchase is ${maxCoins === Infinity ? 'unlimited' : maxCoins} coins`);
      return false;
    }
    setError('');
    return true;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value); 
    if (!isNaN(value)) {
      setBuyQuantity(value);
      validateQuantity(value);
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const onPayNow = async () => {
    if (!validateQuantity(buyQuantity)) return;
  
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }
      
      // Set up Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount:(buyQuantity * applyRate *100).toString(), 
        currency: 'INR',
        name: 'addiwise company',
        description: `Purchase of ${buyQuantity} coins`,
        // order_id: orderResponse.data.order_id,
        // image: '/your-company-logo.png',
        // order_id: "ddd",
        app_name:'addiwise customer portal',
        handler: async function(response: any) {
          try {
            const payload = {
              buy_coin: buyQuantity,
              plan: currentPlan,
              payment_id: response.razorpay_payment_id,
              amount:(buyQuantity * applyRate).toString()

            };
            
            const result = await buyAddiNxtCoin(payload).unwrap();
            toast.success('Coins purchased successfully!');
            refetchTransactions(); 
            // if (result.success) {
            //   toast.success('Payment and coin purchase successful!');
            //   refetchTransactions();
            // } else {
            //   toast.error(result.message || 'Failed to update coins');
            // }
          } catch (err) {
            toast.error('Payment verification failed');
            console.error('Verification error:', err);
          }
        },
        prefill: {
          name: user?.full_name || '',
          // email: user?. || '',
          contact: user?.phone_number || '',
        },
         
        notes: {
          customer_id: user?.customer_id,
          coins: buyQuantity.toString(),
          plan: currentPlan,
        },
        theme: {
          color: '#3399cc',
        },
      };
      // Open Razorpay payment modal
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function(response: any) {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });

    } catch (err) {
      toast.error('An error occurred during payment process');
    }
  };

  const onPaymentSuccess = async () => {
    try {
      const res = await buyCoins({
        customer_coins_transaction_id: payId,
        status: 'Success',
      });

      if ('data' in res) {
        toast.success(res.data?.message);
        refetchTransactions(); 
      } else {
        toast.error('Failed to complete payment');
      }
    } catch (err) {
      toast.error('An error occurred during payment completion');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Coins Card */}
        <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CoinsIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Available Coins</span>
                <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
                  {user?.customer_available_coins?.toLocaleString() || 0}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <BookmarkIcon className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-semibold text-gray-700">Rules</p>
            </div>
            
            <ul className="text-sm space-y-2.5">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">1 Addicoins: </span>
                  <span className="text-gray-600">₹{data?.data?.user_rules[0]?.coin_rate}</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Additional Discount: </span>
                  <span className="text-gray-600">{data?.data?.user_rules[0]?.discount}%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Minimum Purchase: </span>
                  <span className="text-gray-600">{minCoins?.toLocaleString()}</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Maximum Purchase: </span>
                  <span className="text-gray-600">{maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-gray-700">Final Rate: </span>
                  <span className="text-gray-600">₹{applyRate}</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Buy Coins Card */}
        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">Buy Coins</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="w-full pt-1">
            <div className="space-y-4">
              <div>
                <Input
                  label="Quantity"
                  placeholder="Enter coin amount"
                  value={buyQuantity}
                  onChange={handleQuantityChange}
                  required
                  className="[&_input]:text-right [&_input]:text-lg [&_input]:font-medium [&_input]:py-4"
                />
                {error && (
                  <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <InfoIcon className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <InfoIcon className="w-4 h-4" />
                  <span className="text-sm">Min: {minCoins?.toLocaleString()}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm">Max: {maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-0">
            <div className="w-full flex items-center justify-between py-3 px-1 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCardIcon className="w-5 h-5" />
                <span className="font-medium">Total Amount:</span>
              </div>
              <div className="text-xl font-bold text-blue-800">
                ₹{(buyQuantity * applyRate)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <Button
              className="w-full py-6 bg-gradient-to-r from-blue-900 to-blue-900 bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
              disabled={!!error || isLoading || isBuyingCoins || !buyQuantity}
              onClick={onPayNow}
            >
              {(isLoading || isBuyingCoins) ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  Buy Now
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="mt-6">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCardIcon className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
          </div>
        </CardHeader> 
        <CardContent className="p-0 mt-[-25px]">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium text-gray-600">Transaction ID</TableHead>
                <TableHead className="font-medium text-gray-600">Date</TableHead>
                <TableHead className="font-medium text-gray-600">Coins</TableHead>
                <TableHead className="font-medium text-gray-600">Rate</TableHead>
                <TableHead className="font-medium text-gray-600">Aomunt</TableHead>
                <TableHead className="font-medium text-gray-600">Payment ID</TableHead>
                <TableHead className="font-medium text-gray-600">Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionHistory?.data?.coin_history?.length ? (
                transactionHistory.data.coin_history.map((transaction: Transaction,index:number) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-100"
                  >
                     <TableCell>
                      <span className="text-gray-600">{transaction.name}</span>
                    </TableCell>
                   
                    <TableCell>
                      <span className="text-gray-600">{transaction.transaction_date}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{transaction.coins?.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{transaction.rate}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{transaction.total_amount}</span>
                    </TableCell>

                    <TableCell className="font-medium">
                      <span className="text-gray-600">{transaction.payment_transaction_id}</span>
                    </TableCell>
                   
               
                    <TableCell>
                      <span className="text-gray-600">{transaction.payment_status}</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

//=========================== It is simple ==================================================
// 'use client';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   useBuyAddiNxtCoinMutation,
//   useBuyCoinsAfterPaymentMutation,
//   useBuyCoinsInitiatePaymentMutation,
//   useGetRateAndDiscountsQuery,
//   useGetTransactionHistoryQuery,
// } from '@/rtk-query/apis/addicoins';
// import { RootState } from '@/rtk-query/store';
// import { USER } from '@/uttils/Types';
// import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';

// interface Transaction {
//   payment_transaction_id: string;
//   name: string;
//   coins: number;
//   transaction_date: string;
//   transaction_type: string;
//   payment_status: string;
//   // Add any other fields that might exist in your transaction data
// }

// interface RateAndDiscountData {
//   data?: {
//     user_rules: Array<{
//       minimum: number;
//       maximum: number;
//       apply_rate: number;
//       plan: string;
//       coin_rate: number;
//       discount: number;
//     }>;
//   };
// }

// export default function Addicoins(): React.JSX.Element {
//   const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
//   const { data }: { data?: RateAndDiscountData } = useGetRateAndDiscountsQuery({
//     customer: user?.customer_id,
//   });
  
//   const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
//     customer: user?.customer_id,
//   });
  
//   const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
//   const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
//   const [buyAddiNxtCoin, { isLoading: isBuyingCoins }] = useBuyAddiNxtCoinMutation();
  
//   const [buyQuantity, setBuyQuantity] = React.useState<number>(0);
//   console.log("GGG",buyQuantity);
  
//   const [payId, setPayId] = React.useState<string>('');
//   const [error, setError] = React.useState<string>('');

//   const minCoins = data?.data?.user_rules[0]?.minimum || 0;
//   const maxCoins = data?.data?.user_rules[0]?.maximum || Infinity;
//   const applyRate = data?.data?.user_rules[0]?.apply_rate || 0;
//   const currentPlan = data?.data?.user_rules[0]?.plan || "Basic";

//   const validateQuantity = (value: number) => {
//     if (value < minCoins) {
//       setError(`Minimum purchase is ${minCoins} coins`);
//       return false;
//     }
//     if (value > maxCoins) {
//       setError(`Maximum purchase is ${maxCoins === Infinity ? 'unlimited' : maxCoins} coins`);
//       return false;
//     }
//     setError('');
//     return true;
//   };

//   const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = Number(e.target.value);
//     console.log("chnage value::>>",value);
    
//     if (!isNaN(value)) {
//       setBuyQuantity(value);
//       validateQuantity(value);
//     }
//   };

//   const onPayNow = async () => {
//     if (!validateQuantity(buyQuantity)) return;
    
//     const payload = {
//       buy_coin: buyQuantity || 0,
//       plan: data?.data?.user_rules[0]?.plan || "Basic",
//       payment_id: "hvhnbvhg" // This should probably be dynamic in a real implementation
//     };
//     console.log("$$$$$$>>>>",payload);
    
      
//     try {
//       const purchaseRes = await buyAddiNxtCoin(payload);

//       if ('data' in purchaseRes) {
//         toast.success(purchaseRes.data?.message || "Coins purchased successfully!");
//         refetchTransactions(); 
//       } else {
//         toast.error('Purchase completed but failed to update records');
//       }
//     } catch (err) {
//       toast.error('An error occurred during payment process');
//       console.error('Payment error:', err);
//     }
//   };

//   const onPaymentSuccess = async () => {
//     try {
//       const res = await buyCoins({
//         customer_coins_transaction_id: payId,
//         status: 'Success',
//       });

//       if ('data' in res) {
//         toast.success(res.data?.message);
//         refetchTransactions(); 
//       } else {
//         toast.error('Failed to complete payment');
//       }
//     } catch (err) {
//       toast.error('An error occurred during payment completion');
//     }
//   };

//   // Function to generate unique keys for transactions
//   // const getTransactionKey = (transaction: Transaction) => {
//   //   // Combine multiple fields to ensure uniqueness
//   //   return `${transaction.payment_transaction_id}-${transaction.transaction_date}-${transaction.coins}`;
//   // };
//   // const getTransactionKey = (transaction: Transaction) => {
//   //   return `${transaction.payment_transaction_id}-${transaction.transaction_date}-${transaction.coins}`;
//   // };

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Available Coins Card */}
//         <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//           <CardHeader className="pb-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <CoinsIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <span className="text-sm font-semibold text-gray-700">Available Coins</span>
//                 <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
//                   {user?.customer_available_coins?.toLocaleString() || 0}
//                 </CardTitle>
//               </div>
//             </div>
//           </CardHeader>
          
//           <CardContent className="pt-4">
//             <div className="flex items-center gap-2 mb-3">
//               <BookmarkIcon className="w-4 h-4 text-gray-500" />
//               <p className="text-sm font-semibold text-gray-700">Rules</p>
//             </div>
            
//             <ul className="text-sm space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">1 Addicoins: </span>
//                   <span className="text-gray-600">₹{data?.data?.user_rules[0]?.coin_rate}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Additional Discount: </span>
//                   <span className="text-gray-600">{data?.data?.user_rules[0]?.discount}%</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Minimum Purchase: </span>
//                   <span className="text-gray-600">{minCoins?.toLocaleString()}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Maximum Purchase: </span>
//                   <span className="text-gray-600">{maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Final Rate: </span>
//                   <span className="text-gray-600">₹{applyRate}</span>
//                 </div>
//               </li>
//             </ul>
//           </CardContent>
//         </Card>

//         {/* Buy Coins Card */}
//         <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//           <CardHeader className="pb-2">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <CardTitle className="text-xl font-semibold text-gray-800">Buy Coins</CardTitle>
//             </div>
//           </CardHeader>
          
//           <CardContent className="w-full pt-1">
//             <div className="space-y-4">
//               <div>
//                 <Input
//                   label="Quantity"
//                   placeholder="Enter coin amount"
//                   value={buyQuantity}
//                   onChange={handleQuantityChange}
//                   required
//                   className="[&_input]:text-right [&_input]:text-lg [&_input]:font-medium [&_input]:py-4"
//                 />
//                 {error && (
//                   <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <InfoIcon className="w-4 h-4" />
//                     {error}
//                   </div>
//                 )}
//               </div>
              
//               <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4">
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <InfoIcon className="w-4 h-4" />
//                   <span className="text-sm">Min: {minCoins?.toLocaleString()}</span>
//                   <span className="text-gray-400">|</span>
//                   <span className="text-sm">Max: {maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
          
//           <CardFooter className="flex flex-col space-y-3 pt-0">
//             <div className="w-full flex items-center justify-between py-3 px-1 border-t">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <CreditCardIcon className="w-5 h-5" />
//                 <span className="font-medium">Total Amount:</span>
//               </div>
//               <div className="text-xl font-bold text-blue-800">
//                 ₹{(buyQuantity * applyRate)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
//               </div>
//             </div>
            
//             <Button
//               className="w-full py-6 bg-gradient-to-r from-blue-900 to-blue-900 bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               disabled={!!error || isLoading || isBuyingCoins || !buyQuantity}
//               onClick={onPayNow}
//             >
//               {(isLoading || isBuyingCoins) ? (
//                 <div className="flex items-center gap-2">
//                   <span className="animate-pulse">Processing...</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <ShoppingCartIcon className="w-5 h-5" />
//                   Buy Now
//                 </div>
//               )}
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>

//       {/* Transaction History */}
//       <Card className="mt-6">
//         <CardHeader className="border-b">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <CreditCardIcon className="w-5 h-5 text-blue-600" />
//             </div>
//             <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
//           </div>
//         </CardHeader> 
//         <CardContent className="p-0 mt-[-25px]">
//           <Table>
//             <TableHeader className="bg-gray-50">
//               <TableRow>
//                 <TableHead className="font-medium text-gray-600">Transaction ID</TableHead>
//                 <TableHead className="font-medium text-gray-600">Name</TableHead>
//                 <TableHead className="font-medium text-gray-600">Coins</TableHead>
//                 <TableHead className="font-medium text-gray-600">Date</TableHead>
//                 <TableHead className="font-medium text-gray-600">Transaction Type</TableHead>
//                 <TableHead className="font-medium text-gray-600">Payment Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {transactionHistory?.data?.coin_history?.length ? (
//                 transactionHistory.data.coin_history.map((transaction: Transaction,index:number) => (
//                   <TableRow 
//                     key={index} 
//                     className="hover:bg-gray-100"
//                   >
//                     <TableCell className="font-medium">
//                       <span className="text-gray-600">{transaction.payment_transaction_id}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.name}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.coins?.toLocaleString()}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.transaction_date}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.transaction_type}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.payment_status}</span>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-12 text-gray-500">
//                     No transactions found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

//-----------------------------------------------------------------------------
// 'use client';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   useBuyAddiNxtCoinMutation,
//   useBuyCoinsAfterPaymentMutation,
//   useBuyCoinsInitiatePaymentMutation,
//   useGetRateAndDiscountsQuery,
//   useGetTransactionHistoryQuery,
// } from '@/rtk-query/apis/addicoins';
// import { RootState } from '@/rtk-query/store';
// import { USER } from '@/uttils/Types';
// import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';

// export default function Addicoins(): React.JSX.Element {
//   const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
//   const { data } = useGetRateAndDiscountsQuery({
//     customer: user?.customer_id,
//   });
//   const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
//     customer: user?.customer_id,
//   });
//   const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
//   const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
//   const [buyAddiNxtCoin, { isLoading: isBuyingCoins }] = useBuyAddiNxtCoinMutation();
//   const [buyQuantity, setBuyQuantity] = React.useState<number>(100);
//   const [payId, setPayId] = React.useState<string>('');
//   const [error, setError] = React.useState<string>('');

//   const minCoins = data?.data?.user_rules[0]?.minimum || 0;
//   const maxCoins = data?.data?.user_rules[0]?.maximum || Infinity;
//   const applyRate = data?.data?.user_rules[0]?.apply_rate || 0;
//   const currentPlan = data?.data?.user_rules[0]?.plan || "Basic";

//   const validateQuantity = (value: number) => {
//     if (value < minCoins) {
//       setError(`Minimum purchase is ${minCoins} coins`);
//       return false;
//     }
//     if (value > maxCoins) {
//       setError(`Maximum purchase is ${maxCoins === Infinity ? 'unlimited' : maxCoins} coins`);
//       return false;
//     }
//     setError('');
//     return true;
//   };

//   const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = Number(e.target.value);
//     if (!isNaN(value)) {
//       setBuyQuantity(value);
//       validateQuantity(value);
//     }
//   };

//   const onPayNow = async () => {
//     if (!validateQuantity(buyQuantity)) return;
//         const payload ={
//         buy_coin:buyQuantity || 0,
//         plan:data?.data?.user_rules[0]?.plan || "Basic",
//         payment_id:"hvhnbvhg"
//       }
      
//     try {
//       const purchaseRes = await buyAddiNxtCoin({
//         ...payload
//       });

//         if ('data' in purchaseRes) {
//           toast.success(purchaseRes.data?.message || "Coins purchased successfully!");
//           refetchTransactions(); 
//         } else {
//           toast.error('Purchase completed but failed to update records');
//         }
//     } catch (err) {
//       toast.error('An error occurred during payment process');
//       console.error('Payment error:', err);
//     }
//   };

//   const onPaymentSuccess = async () => {
//     try {
//       const res = await buyCoins({
//         customer_coins_transaction_id: payId,
//         status: 'Success',
//       });

//       if ('data' in res) {
//         toast.success(res.data?.message);
//         refetchTransactions(); 
//       } else {
//         toast.error('Failed to complete payment');
//       }
//     } catch (err) {
//       toast.error('An error occurred during payment completion');
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Available Coins Card */}
//         <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//           <CardHeader className="pb-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <CoinsIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <span className="text-sm font-semibold text-gray-700">Available Coins</span>
//                 <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
//                   {user?.customer_available_coins?.toLocaleString() || 0}
//                 </CardTitle>
//               </div>
//             </div>
//           </CardHeader>
          
//           <CardContent className="pt-4">
//             <div className="flex items-center gap-2 mb-3">
//               <BookmarkIcon className="w-4 h-4 text-gray-500" />
//               <p className="text-sm font-semibold text-gray-700">Rules</p>
//             </div>
            
//             <ul className="text-sm space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">1 Addicoins: </span>
//                   <span className="text-gray-600">₹{data?.data?.user_rules[0]?.coin_rate}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Additional Discount: </span>
//                   <span className="text-gray-600">{data?.data?.user_rules[0]?.discount}%</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Minimum Purchase: </span>
//                   <span className="text-gray-600">{minCoins?.toLocaleString()}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Maximum Purchase: </span>
//                   <span className="text-gray-600">{maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Final Rate: </span>
//                   <span className="text-gray-600">₹{applyRate}</span>
//                 </div>
//               </li>
//             </ul>
//           </CardContent>
//         </Card>

//         {/* Buy Coins Card */}
//         <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//           <CardHeader className="pb-2">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <CardTitle className="text-xl font-semibold text-gray-800">Buy Coins</CardTitle>
//             </div>
//           </CardHeader>
          
//           <CardContent className="w-full pt-1">
//             <div className="space-y-4">
//               <div>
//                 <Input
//                   label="Quantity"
//                   placeholder="Enter coin amount"
//                   value={buyQuantity}
//                   onChange={handleQuantityChange}
//                   required
//                   className="[&_input]:text-right [&_input]:text-lg [&_input]:font-medium [&_input]:py-4"
//                 />
//                 {error && (
//                   <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <InfoIcon className="w-4 h-4" />
//                     {error}
//                   </div>
//                 )}
//               </div>
              
//               <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4">
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <InfoIcon className="w-4 h-4" />
//                   <span className="text-sm">Min: {minCoins?.toLocaleString()}</span>
//                   <span className="text-gray-400">|</span>
//                   <span className="text-sm">Max: {maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
          
//           <CardFooter className="flex flex-col space-y-3 pt-0">
//             <div className="w-full flex items-center justify-between py-3 px-1 border-t">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <CreditCardIcon className="w-5 h-5" />
//                 <span className="font-medium">Total Amount:</span>
//               </div>
//               <div className="text-xl font-bold text-blue-800">
//                 ₹{(buyQuantity * applyRate)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
//               </div>
//             </div>
            
//             <Button
//               className="w-full py-6 bg-gradient-to-r from-blue-900 to-blue-900 bg-primary hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md transition-all"
//               disabled={!!error || isLoading || isBuyingCoins || !buyQuantity}
//               onClick={onPayNow}
//             >
//               {(isLoading || isBuyingCoins) ? (
//                 <div className="flex items-center gap-2">
//                   <span className="animate-pulse">Processing...</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <ShoppingCartIcon className="w-5 h-5" />
//                   Buy Now
//                 </div>
//               )}
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>

//       {/* Transaction History */}
//       <Card className="mt-6">
//         <CardHeader className="border-b">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <CreditCardIcon className="w-5 h-5 text-blue-600" />
//             </div>
//             <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
//           </div>
//         </CardHeader> 
//         <CardContent className="p-0 mt-[-25px]">
//           <Table>
//             <TableHeader className="bg-gray-50">
//               <TableRow>
//                 <TableHead className="font-medium text-gray-600">Transaction ID</TableHead>
//                 <TableHead className="font-medium text-gray-600">Name</TableHead>
//                 <TableHead className="font-medium text-gray-600">Coins</TableHead>
//                 <TableHead className="font-medium text-gray-600">Date</TableHead>
//                 <TableHead className="font-medium text-gray-600">Transaction Type</TableHead>
//                 <TableHead className="font-medium text-gray-600">Payment Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {transactionHistory?.data?.coin_history?.length ? (
//                 transactionHistory.data.coin_history.map((transaction: any) => (
//                   <TableRow key={transaction.payment_transaction_id} className="hover:bg-gray-100 ">
//                     <TableCell className="font-medium">
//                     <span className="text-gray-600">{transaction.payment_transaction_id}</span>
//                     </TableCell>
//                     <TableCell>
//                     <span className="text-gray-600">{transaction.name}</span>
//                     </TableCell>
//                     <TableCell>
//                     <span className="text-gray-600">{transaction.coins?.toLocaleString()}</span>
//                     </TableCell>
//                     <TableCell>
//                     <span className="text-gray-600">{transaction.transaction_date}</span>
//                     </TableCell>
//                     <TableCell>
//                     <span className="text-gray-600"> {transaction.transaction_type}</span>

//                       {/* <span className={`font-medium ${
//                         transaction.transaction_type === 'Credit' ? 'text-green-600' : 'text-red-600'
//                       }`}>
//                         {transaction.transaction_type}
//                       </span> */}
//                     </TableCell>
//                     <TableCell>
//                     <span className="text-gray-600">  {transaction.payment_status}</span>
//                       {/* <span className={`font-medium ${
//                         transaction.payment_status === 'Paid' ? 'text-green-600' : 'text-amber-600'
//                       }`}>
//                         {transaction.payment_status}
//                       </span> */}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-12 text-gray-500">
//                     No transactions found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

//=================================================
// 'use client';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   useBuyCoinsAfterPaymentMutation,
//   useBuyCoinsInitiatePaymentMutation,
//   useGetRateAndDiscountsQuery,
//   useGetTransactionHistoryQuery,
// } from '@/rtk-query/apis/addicoins';
// import { RootState } from '@/rtk-query/store';
// import { USER } from '@/uttils/Types';
// import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';

// export default function Addicoins(): React.JSX.Element {
//   const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
//   const { data } = useGetRateAndDiscountsQuery({
//     customer: user?.customer_id,
//   });
//   const { data: transactionHistory } = useGetTransactionHistoryQuery({
//     customer: user?.customer_id,
//   });
//   const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
//   const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
//   const [buyQuantity, setBuyQuantity] = React.useState<number>(100);
//   const [payId, setPayId] = React.useState<string>('');
//   const [error, setError] = React.useState<string>('');

//   const minCoins = data?.data?.user_rules[0]?.minimum || 0;
//   const maxCoins = data?.data?.user_rules[0]?.maximum || Infinity;
//   const applyRate = data?.data?.user_rules[0]?.apply_rate || 0;

//   const validateQuantity = (value: number) => {
//     if (value < minCoins) {
//       setError(`Minimum purchase is ${minCoins} coins`);
//       return false;
//     }
//     if (value > maxCoins) {
//       setError(`Maximum purchase is ${maxCoins === Infinity ? 'unlimited' : maxCoins} coins`);
//       return false;
//     }
//     setError('');
//     return true;
//   };

//   const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = Number(e.target.value);
//     if (!isNaN(value)) {
//       setBuyQuantity(value);
//       validateQuantity(value);
//     }
//   };

//   const onPayNow = async () => {
//     if (!validateQuantity(buyQuantity)) return;
//     const payload ={
//         buy_coin:buyQuantity || 0,
//         plan:data?.data?.user_rules[0]?.plan || "Basic",
//         payment_id:"hvhnbvhg"
//       }
      
//     try {
//       const res = await initPayment({
//         coins_qty: buyQuantity,
//         customer: user?.customer_id,
//       });
      
//       // {
//       //   "buy_coin":"63",
//       //   "plan":"Basic",
//       //   "payment_id":"hvhnbvhg"
//       // }

//       if ('data' in res) {
//         toast.success(res.data?.message);
//         setPayId(res.data?.customer_coins_transaction_id);
//       } else if ('error' in res) {
//         toast.error('Failed to initiate payment');
//       }
//     } catch (err) {
//       toast.error('An error occurred during payment initiation');
//     }
//   };

//   const onPaymentSuccess = async () => {
//     try {
//       const res = await buyCoins({
//         customer_coins_transaction_id: payId,
//         status: 'Success',
//       });

//       if ('data' in res) {
//         toast.success(res.data?.message);
//         window.location.reload();
//       } else if ('error' in res) {
//         toast.error('Failed to complete payment');
//       }
//     } catch (err) {
//       toast.error('An error occurred during payment completion');
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Available Coins Card */}
//         <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//           <CardHeader className="pb-0">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <CoinsIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <span className="text-sm font-semibold text-gray-700">Available Coins</span>
//                 <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
//                   {user?.customer_available_coins?.toLocaleString() || 0}
//                 </CardTitle>
//               </div>
//             </div>
//           </CardHeader>
          
//           <CardContent className="pt-4">
//             <div className="flex items-center gap-2 mb-3">
//               <BookmarkIcon className="w-4 h-4 text-gray-500" />
//               <p className="text-sm font-semibold text-gray-700">Rules</p>
//             </div>
            
//             <ul className="text-sm space-y-2.5">
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Plan Discount: </span>
//                   <span className="text-gray-600">{data?.data?.user_rules[0]?.coin_rate}%</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Additional Discount: </span>
//                   <span className="text-gray-600">{data?.data?.user_rules[0]?.discount}%</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Minimum Purchase: </span>
//                   <span className="text-gray-600">{minCoins?.toLocaleString()}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Maximum Purchase: </span>
//                   <span className="text-gray-600">{maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
//                 </div>
//               </li>
//               <li className="flex items-start gap-2">
//                 <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                 <div>
//                   <span className="font-medium text-gray-700">Final Rate: </span>
//                   <span className="text-gray-600">₹{applyRate}</span>
//                 </div>
//               </li>
//             </ul>
//           </CardContent>
//         </Card>

//         {/* Buy Coins Card */}
//         <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//           <CardHeader className="pb-2">
//             <div className="flex items-center gap-3">
//               <div className="p-2  bg-blue-100 rounded-lg">
//                 <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <CardTitle className="text-xl font-semibold text-gray-800">Buy Coins</CardTitle>
//             </div>
//           </CardHeader>
          
//           <CardContent className="w-full pt-1">
//             <div className="space-y-4">
//               <div>
//                 <Input
//                   label="Quantity"
//                   placeholder="Enter coin amount"
//                   value={buyQuantity}
//                   onChange={handleQuantityChange}
//                   required
//                   className="[&_input]:text-right [&_input]:text-lg [&_input]:font-medium [&_input]:py-4"
//                 />
//                 {error && (
//                   <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <InfoIcon className="w-4 h-4" />
//                     {error}
//                   </div>
//                 )}
//               </div>
              
//               <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4">
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <InfoIcon className="w-4 h-4" />
//                   <span className="text-sm">Min: {minCoins?.toLocaleString()}</span>
//                   <span className="text-gray-400">|</span>
//                   <span className="text-sm">Max: {maxCoins === Infinity ? 'Unlimited' : maxCoins?.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
          
//           <CardFooter className="flex flex-col space-y-3 pt-0">
//             <div className="w-full flex items-center justify-between py-3 px-1 border-t">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <CreditCardIcon className="w-5 h-5" />
//                 <span className="font-medium">Total Amount:</span>
//               </div>
//               <div className="text-xl font-bold text-blue-800">
//                 ₹{(buyQuantity * applyRate)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
//               </div>
//             </div>
            
//             {!payId ? (
//               <Button
//                 className="w-full py-6 blue-300 from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md transition-all"
//                 disabled={!!error || isLoading || !buyQuantity}
//                 onClick={onPayNow}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center gap-2">
//                     <span className="animate-pulse">Processing...</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <ShoppingCartIcon className="w-5 h-5" />
//                     Buy Now
//                   </div>
//                 )}
//               </Button>
//             ) : (
//               <Button
//                 className="w-full py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md transition-all"
//                 disabled={isPaymentSuccessLoading}
//                 onClick={onPaymentSuccess}
//               >
//                 {isPaymentSuccessLoading ? (
//                   <div className="flex items-center gap-2">
//                     <span className="animate-pulse">Verifying...</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <CheckCircleIcon className="w-5 h-5" />
//                     Payment Success
//                   </div>
//                 )}
//               </Button>
//             )}
//           </CardFooter>
//         </Card>
//       </div>

//       {/* Transaction History */}
//       <Card className="mt-6">
//         <CardHeader className="border-b">
//           <div className="flex items-center gap-3">
//           <div className="flex items-center gap-3">
//               <div className="p-2  bg-blue-100 rounded-lg">
//             <CreditCardIcon className="w-5 h-5 text-blue-600" />
//               </div>
//               <CardTitle className="text-xl font-semibold text-gray-800">Buy Coins</CardTitle>
//             </div>
//             <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
//           </div>
//         </CardHeader> 
//         <CardContent className="p-0 mt-[-24px]">
//           <Table>
//             <TableHeader className="bg-gray-50">
//               <TableRow>
//                 <TableHead className="font-medium text-gray-600">Transaction ID</TableHead>
//                 <TableHead className="font-medium text-gray-600">Name</TableHead>
//                 <TableHead className="font-medium text-gray-600">Coins</TableHead>
//                 <TableHead className="font-medium text-gray-600">Date</TableHead>
//                 <TableHead className="font-medium text-gray-600">Transaction Type</TableHead>
//                 <TableHead className="font-medium text-gray-600">Payment Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {transactionHistory?.data?.coin_history?.length ? (
//                 transactionHistory.data.coin_history.map((transaction: any) => (
//                   <TableRow key={transaction.payment_transaction_id} className="hover:bg-gray-50">
//                     <TableCell className="font-medium">
//                       <span className="text-sm text-gray-800">
//                         {transaction.payment_transaction_id}
//                       </span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.name}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="font-medium text-gray-600">
//                         {transaction.coins?.toLocaleString()}
//                       </span>
//                     </TableCell>
                   
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.transaction_date}</span>
//                     </TableCell>
//                     <TableCell>
//                       {/* <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           transaction.transaction_type === 'Credit'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                       </span> */}
//                       <span className="font-medium text-gray-600">
//                         {transaction.transaction_type}
//                       </span>
//                     </TableCell>
//                     <TableCell>
//                       {/* <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           transaction.payment_status === 'Paid'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                       </span> */}
//                       <span className="font-medium text-gray-600">
//                         {transaction.payment_status}
//                       </span>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-12 text-gray-500">
//                     No transactions found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

//======================================================================
// 'use client';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import {
//   useBuyCoinsAfterPaymentMutation,
//   useBuyCoinsInitiatePaymentMutation,
//   useGetRateAndDiscountsQuery,
//   useGetTransactionHistoryQuery,
// } from '@/rtk-query/apis/addicoins';
// import { RootState } from '@/rtk-query/store';
// import { USER } from '@/uttils/Types';
// import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
// import { Spinnaker } from 'next/font/google';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';

// export default function Addicoins(): React.JSX.Element {
//   const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
//   const { data } = useGetRateAndDiscountsQuery({
//     customer: user?.customer_id,
//   });
//   const { data: transactionHistory } = useGetTransactionHistoryQuery({
//     customer: user?.customer_id,
//   });

//   const [initPayment, { isLoading }] = useBuyCoinsInitiatePaymentMutation();
//   const [buyCoins, { isLoading: isPaymentSuccessLoading }] = useBuyCoinsAfterPaymentMutation();
//   const [buyQuantity, setBuyQuantity] = React.useState<number>(100);
//   const [payId, setPayId] = React.useState<string>('');

//   const onPayNow = async () => {
//     const res = await initPayment({
//       coins_qty: buyQuantity,
//       customer: user?.customer_id,
//     });

//     if (res?.data) {
//       toast.success(res?.data?.message);
//       setPayId(res?.data?.customer_coins_transaction_id);
//     }
//   };

//   const onPaymentSuccess = async () => {
//     const res = await buyCoins({
//       customer_coins_transaction_id: payId,
//       status: 'Success',
//     });

//     if (res?.data) {
//       toast.success(res?.data?.message);
//       // router.refresh();
//       window.location.reload();
//     }
//   };

//   return (
//     <div>
//       <div className="grid grid-cols-2 gap-4">
//       <Card className="bg-gradient-to-br from-blue-20 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
//   <CardHeader className="pb-0">
//     <div className="flex items-center gap-3">
//       <div className="p-1 bg-blue-100 rounded-full">
//         <CoinsIcon className="w-5 h-5 text-blue-600" />
//       </div>
//       <div>
//         <span className="text-sm font-semibold text-gray-700">Available Coins</span>
//         <CardTitle className="text-2xl font-bold text-blue-800 mt-1">
//           {user?.customer_available_coins}
//         </CardTitle>
//       </div>
//     </div>
//   </CardHeader>
  
//   <CardContent className="border-t border-gray-300 pt-2">
//     <div className="flex items-center gap-2 mb-3">
//       <BookmarkIcon className="w-4 h-4 text-gray-500" />
//       <p className="text-sm font-semibold text-gray-700">Rules</p>
//     </div>
    
//     <ul className="text-sm space-y-2.5">
//       <li className="flex items-start gap-2">
//         <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//         <div>
//           <span className="font-medium text-gray-700">Plan Discount: </span>
//           <span className="text-gray-600">{data?.data?.user_rules[0]?.coin_rate}%</span>
//         </div>
//       </li>
//       <li className="flex items-start gap-2">
//         <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//         <div>
//           <span className="font-medium text-gray-700">Additional Discount: </span>
//           <span className="text-gray-600">{data?.data?.user_rules[0]?.discount}%</span>
//         </div>
//       </li>
//       <li className="flex items-start gap-2">
//         <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//         <div>
//           <span className="font-medium text-gray-700">Minimum Purchase: </span>
//           <span className="text-gray-600">{data?.data?.user_rules[0]?.minimum || 'N/A'}</span>
//         </div>
//       </li>
//       <li className="flex items-start gap-2">
//         <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//         <div>
//           <span className="font-medium text-gray-700">Maximum Purchase: </span>
//           <span className="text-gray-600">{data?.data?.user_rules[0]?.maximum || 'N/A'}</span>
//         </div>
//       </li>
//       <li className="flex items-start gap-2">
//         <div className="w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//         <div>
//           <span className="font-medium text-gray-700">Final Rate: </span>
//           <span className="text-gray-600">{data?.data?.user_rules[0]?.apply_rate || 'N/A'}₹</span>
//         </div>
//       </li>
//     </ul>
//   </CardContent>
// </Card>
// <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//   <CardHeader className="pb-2">
//     <div className="flex items-center gap-3">
//       <div className="p-2 bg-amber-100 rounded-lg">
//         <CoinsIcon className="w-5 h-5 text-amber-600" />
//       </div>
//       <CardTitle className="text-xl font-semibold text-gray-800">Buy Coins</CardTitle>
//     </div>
//   </CardHeader>
  
//   <CardContent className="w-full pt-1">
//     <div className="space-y-4">
//       <Input
//         label="Quantity"
//         placeholder="Enter coin amount"
//         value={buyQuantity}
//         onChange={(e: any) => {
//           if (!isNaN(e.target.value)) {
//             setBuyQuantity(e.target.value);
//           }
//         }}
//         required
//         className="[&_input]:text-right [&_input]:text-lg [&_input]:font-medium [&_input]:py-4"
//         // startContent={
//         //   <div className="pointer-events-none flex items-center">
//         //     <CoinsIcon className="w-4 h-4 text-amber-500 mr-2" />
//         //     <span className="text-gray-500">Qty:</span>
//         //   </div>
//         // }
//       />
      
//       <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-2">
//         <div className="flex items-center gap-2 text-gray-600">
//           <InfoIcon className="w-4 h-4" />
//           <span className="text-sm">Min: {data?.data?.user_rules[0]?.minimum || 0}</span>
//           <span className="text-gray-400">|</span>
//           <span className="text-sm">Max: {data?.data?.user_rules[0]?.maximum || 0}</span> 
//           {/* '∞' */}
//         </div>
//       </div>
//     </div>
//   </CardContent>
  
//   <CardFooter className="flex flex-col space-y-3 pt-0">
//     <div className="w-full flex items-center justify-between py-3 px-1 border-t">
//       <div className="flex items-center gap-2 text-gray-600">
//         <CreditCardIcon  className="w-5 h-5" />
//         <span className="font-medium">Total Amount:</span>
//       </div>
//       <div className="text-xl font-bold text-amber-600">
//         ₹{Number(buyQuantity * data?.data?.user_rules[0]?.apply_rate)?.toFixed(2)}
//       </div>
//     </div>
    
//     {!payId ? (
//       <Button
//         className="w-full py-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md"
//         disabled={
//           buyQuantity < data?.minimum_coin_purchase ||
//           !buyQuantity ||
//           buyQuantity > data?.maximum_coin_purchase ||
//           isLoading
//         }
//         onClick={onPayNow}
//       >
//         {isLoading ? (
//           <div className="flex items-center gap-2">
//             {/* <Spinner size="sm" /> */}
//             Processing...
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//             <ShoppingCartIcon  className="w-5 h-5" />
//             Buy Now
//           </div>
//         )}
//       </Button>
//     ) : (
//       <Button
//         className="w-full py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md"
//         disabled={isPaymentSuccessLoading}
//         onClick={onPaymentSuccess}
//       >
//         {isPaymentSuccessLoading ? (
//           <div className="flex items-center gap-2">
//             {/* <Spinnaker    size="sm" /> */}
//             Verifying...
//           </div>
//         ) : (
//           <div className="flex items-center gap-2">
//             <CheckCircleIcon   className="w-5 h-5" />
//             Payment Success
//           </div>
//         )}
//       </Button>
//     )}
//   </CardFooter>
// </Card>


//         <Card>
//           <CardHeader>
//             <div className="flex items-center gap-4">
//               <CardTitle>Buy Coins</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent className="w-full">
//             <Input
//               label="Quantity"
//               placeholder="100"
//               value={buyQuantity}
//               onChange={(e: any) => {
//                 if (!isNaN(e.target.value)) {
//                   setBuyQuantity(e.target.value);
//                 }
//               }}
//               required
//             />
//           </CardContent>
//           <CardFooter className="flex flex-col">
//             <div className="text-sm w-full flex items-center justify-between py-2 border-y">
//               Total Amount:-{' '}
//               <b className="text-lg">
//                 ₹ {Number(buyQuantity * Number(data?.after_discount_rate || 0))?.toFixed(2)}
//               </b>
//             </div>
//             {!payId && (
//               <Button
//                 className="mt-4 w-full"
//                 disabled={
//                   buyQuantity < data?.minimum_coin_purchase ||
//                   !buyQuantity ||
//                   buyQuantity > data?.maximum_coin_purchase ||
//                   isLoading
//                 }
//                 onClick={onPayNow}
//               >
//                 Buy Now
//               </Button>
//             )}
//             {payId && (
//               <Button
//                 className="mt-4 w-full"
//                 disabled={isPaymentSuccessLoading}
//                 onClick={onPaymentSuccess}
//               >
//                 Payment Success
//               </Button>
//             )}
//           </CardFooter>
//         </Card>


        
//       </div>

//       <div className="mt-6">
//         <Card>
//           <CardHeader className="border-b">
//             <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
//           </CardHeader>
//           <CardContent className="p-0 mt-[-24px]">
//             <Table>
//               <TableHeader className="bg-gray-50">
//                 <TableRow>
//                   <TableHead className="font-medium text-gray-600">Transaction ID</TableHead>
//                   <TableHead className="font-medium text-gray-600">Name</TableHead>
//                   <TableHead className="font-medium text-gray-600">Coins</TableHead>
//                   <TableHead className="font-medium text-gray-600">Date</TableHead>
//                   <TableHead className="font-medium text-gray-600">Type</TableHead>
//                   <TableHead className="font-medium text-gray-600">Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {transactionHistory?.data?.coin_history?.map((transaction: any) => (
//                   <TableRow key={transaction.payment_transaction_id} className="hover:bg-gray-50">
//                     <TableCell className="font-medium">
//                       <span className="text-sm text-gray-800">{transaction.payment_transaction_id}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.name}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="font-medium text-blue-600">{transaction.coins}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span className="text-gray-600">{transaction.transaction_date}</span>
//                     </TableCell>
//                     <TableCell>
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           transaction.transaction_type === 'Credit'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}
//                       >
//                         {transaction.transaction_type}
//                       </span>
//                     </TableCell>
//                     <TableCell>
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           transaction.payment_status === 'Paid'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {transaction.payment_status}
//                       </span>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//             {transactionHistory?.data?.coin_history?.length === 0 && (
//               <div className="py-12 text-center text-gray-500">No transactions found</div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }