
'use client';
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, HistoryIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSelector } from 'react-redux';
import { useGetRateAndDiscountsQuery, useGetTransactionHistoryQuery,useGetTransactionHistorySelesQuery } from '@/rtk-query/apis/addicoins';
import { USER } from '@/uttils/Types';
import { RootState } from '@/rtk-query/store';
interface Transaction {
    payment_transaction_id?: string;
    name: string;
    coins: number;
    total_amount:string;
    rate:string;
    transaction_date: string;
    transaction_type: string;
    payment_status: string;
    sales_order?:string;
    docstatus?:string;
    customer_name?:string;
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
export default function Organization(): React.JSX.Element {
    const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
    const { data }: { data?: RateAndDiscountData } = useGetRateAndDiscountsQuery({
        customer: user?.customer_id,
      });
       const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
          customer: user?.customer_id,
        });
        const { data: transactionHistorySeles, refetch: refetchTransactionsS } = useGetTransactionHistorySelesQuery({
            customer: user?.customer_id,
        });
        console.log("::>>",transactionHistorySeles);
        

    return (
        <div className="space-y-2">
    <div className="min-h-screen bg-gray-50">
      

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Clinic Card */}
           <Card className="shadow-sm">
             <CardHeader className="border-b">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 rounded-lg">
                   <BookmarkIcon className="w-5 h-5 text-blue-600" />
                 </div>
                 <CardTitle className="text-xl font-semibold">Clinic Details</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="pt-4 grid grid-cols-1 gap-4">
               <div>
                 <h3 className="text-sm font-medium text-gray-500">Clinic Name</h3>
                 <p className="text-lg font-medium mt-1">Addinxt Clinic</p>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
                 <p className="text-lg font-medium mt-1">24CPNBG1258T0Z5</p>
               </div>
             </CardContent>
           </Card>

           {/* User Card */}
           <Card className="shadow-sm">
             <CardHeader className="border-b">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-100 rounded-lg">
                   <InfoIcon className="w-5 h-5 text-purple-600" />
                 </div>
                 <CardTitle className="text-xl font-semibold">Organization User</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="pt-4 grid grid-cols-1 gap-4">
               <div>
                 <h3 className="text-sm font-medium text-gray-500">Name</h3>
                 <p className="text-lg font-medium mt-1">Rohit Gupta</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
                   <p className="text-lg font-medium mt-1">9876543210</p>
                 </div>
                 <div>
                   <h3 className="text-sm font-medium text-gray-500">Email</h3>
                   <p className="text-lg font-medium mt-1 truncate">addiwise56@gmail.com</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Stats Section */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
           {/* <Card className="shadow-sm">
             <CardHeader className="border-b">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-100 rounded-lg">
                   <CheckCircleIcon className="w-5 h-5 text-green-600" />
                 </div>
                 <CardTitle className="text-lg font-semibold">Challenge</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="pt-4">
               <p className="text-2xl font-bold">CGT</p>
               <p className="text-sm text-gray-500 mt-1">Current challenge</p>
             </CardContent>
           </Card> */}

          {/* <Card className="shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCartIcon className="w-5 h-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Adherr</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
               <p className="text-2xl font-bold">-</p>
               <p className="text-sm text-gray-500 mt-1">Organization metrics</p>
             </CardContent>
           </Card> */}
           {/* <Card className="shadow-sm">
             <CardHeader className="border-b">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-yellow-100 rounded-lg">
                   <CoinsIcon className="w-5 h-5 text-yellow-600" />
                 </div>
                 <CardTitle className="text-lg font-semibold">Kidogel</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="pt-4">
               <p className="text-2xl font-bold">-</p>
               <p className="text-sm text-gray-500 mt-1">Performance data</p>
             </CardContent>
           </Card> */}
         </div>
        {/* Clinic Info */}
        {/* <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Clinic Details</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Clinic Name</h3>
            <p className="text-gray-600">Addinxt Clinic</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">GST Number</h3>
            <p className="text-gray-600">24CPNBG1258T0Z5</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kidogel</h3>
            <p className="text-gray-600">Performance data</p>
          </div>
        </div>
        </div> */}
        {/* Organization Info */}
        {/* <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Organization User</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Name</h3>
            <p className="text-gray-600">Rohit Gupta</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mobile Number</h3>
            <p className="text-gray-600">9876543210</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">addiwise56@gmai.com</p>
          </div>
        </div>
        </div> */}


        {/* Coin History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <Card className="mt-0">
                    <CardHeader className="border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCardIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl font-semibold">Buy Coins Transaction History</CardTitle>
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
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden mt-10">
          <div className="overflow-x-auto">
        


          <Card >
                    <CardHeader className="border-b">
                      <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <HistoryIcon className="w-5 h-5 text-blue-600" />
                      </div>
                        <CardTitle className="text-xl font-semibold">Sales Coins Transaction History</CardTitle>
                      </div>
                    </CardHeader> 
                    <CardContent className="p-0 mt-[-25px]">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-medium text-gray-600">Sales Order ID</TableHead>
                            <TableHead className="font-medium text-gray-600">Date</TableHead>
                            <TableHead className="font-medium text-gray-600">Coins</TableHead>
                            <TableHead className="font-medium text-gray-600">Rate</TableHead>
                            <TableHead className="font-medium text-gray-600">Aomunt</TableHead>
                            <TableHead className="font-medium text-gray-600">Payment ID</TableHead>
                            <TableHead className="font-medium text-gray-600">Payment Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactionHistorySeles?.data?.coin_history?.length ? (
                            transactionHistorySeles.data.coin_history.map((transaction: Transaction,index:number) => (
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
            {/* <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goodful</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCE</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay M-Ster</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$100.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DCE123</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Completed</td>
                </tr>
              </tbody>
            </table> */}
          </div>
        </div>
      </main>
    </div>
          
           
        </div>
    );
}


//--------------------------------------------------------------------------------------
//======================================================================================
// 'use client';
// import React from "react";
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { BookmarkIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, HistoryIcon, InfoIcon, ShoppingCartIcon } from 'lucide-react';
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useSelector } from 'react-redux';
// import { useGetRateAndDiscountsQuery, useGetTransactionHistoryQuery, useGetTransactionHistorySelesQuery } from '@/rtk-query/apis/addicoins';
// import { USER } from '@/uttils/Types';
// import { RootState } from '@/rtk-query/store';
// import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";

// interface Transaction {
//   payment_transaction_id?: string;
//   name: string;
//   coins: number;
//   total_amount: string;
//   rate: string;
//   transaction_date: string;
//   transaction_type: string;
//   payment_status: string;
//   sales_order?: string;
//   docstatus?: string;
//   customer_name?: string;
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

// export default function Organization(): React.JSX.Element {
//   const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
//   const { data }: { data?: RateAndDiscountData } = useGetRateAndDiscountsQuery({
//     customer: user?.customer_id,
//   });
//   const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
//     customer: user?.customer_id,
//   });
//   const { data: transactionHistorySeles, refetch: refetchTransactionsS } = useGetTransactionHistorySelesQuery({
//     customer: user?.customer_id,
//   });

//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'PPpp');
//     } catch (e) {
//       return dateString;
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'completed':
//         // return <Badge variant="success">{status}</Badge>;
//         return <Badge variant="secondary">{status}</Badge>;
//       case 'pending':
//         // return <Badge variant="warning">{status}</Badge>;
//         return <Badge variant="outline">{status}</Badge>;
//       case 'failed':    
//         return <Badge variant="destructive">{status}</Badge>;
//       default:
//         return <Badge>{status}</Badge>;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Clinic and User Info Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Clinic Card */}
//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <BookmarkIcon className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <CardTitle className="text-xl font-semibold">Clinic Details</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-4 grid grid-cols-1 gap-4">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Clinic Name</h3>
//                 <p className="text-lg font-medium mt-1">Addinxt Clinic</p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
//                 <p className="text-lg font-medium mt-1">24CPNBG1258T0Z5</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* User Card */}
//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <InfoIcon className="w-5 h-5 text-purple-600" />
//                 </div>
//                 <CardTitle className="text-xl font-semibold">Organization User</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-4 grid grid-cols-1 gap-4">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Name</h3>
//                 <p className="text-lg font-medium mt-1">Rohit Gupta</p>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
//                   <p className="text-lg font-medium mt-1">9876543210</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Email</h3>
//                   <p className="text-lg font-medium mt-1 truncate">addiwise56@gmail.com</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <CheckCircleIcon className="w-5 h-5 text-green-600" />
//                 </div>
//                 <CardTitle className="text-lg font-semibold">Challenge</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-4">
//               <p className="text-2xl font-bold">CGT</p>
//               <p className="text-sm text-gray-500 mt-1">Current challenge</p>
//             </CardContent>
//           </Card>

//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-orange-100 rounded-lg">
//                   <ShoppingCartIcon className="w-5 h-5 text-orange-600" />
//                 </div>
//                 <CardTitle className="text-lg font-semibold">Adherr</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-4">
//               <p className="text-2xl font-bold">-</p>
//               <p className="text-sm text-gray-500 mt-1">Organization metrics</p>
//             </CardContent>
//           </Card>

//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <CoinsIcon className="w-5 h-5 text-yellow-600" />
//                 </div>
//                 <CardTitle className="text-lg font-semibold">Kidogel</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="pt-4">
//               <p className="text-2xl font-bold">-</p>
//               <p className="text-sm text-gray-500 mt-1">Performance data</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Transaction History Sections */}
//         <div className="space-y-6">
//           {/* Buy Coins Transaction History */}
//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <CreditCardIcon className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <CardTitle className="text-xl font-semibold">Buy Coins Transaction History</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader className="bg-gray-50">
//                     <TableRow>
//                       <TableHead className="font-medium text-gray-600 min-w-[180px]">Transaction ID</TableHead>
//                       <TableHead className="font-medium text-gray-600 min-w-[180px]">Date</TableHead>
//                       <TableHead className="font-medium text-gray-600 text-right">Coins</TableHead>
//                       <TableHead className="font-medium text-gray-600 text-right">Rate</TableHead>
//                       <TableHead className="font-medium text-gray-600 text-right">Amount</TableHead>
//                       <TableHead className="font-medium text-gray-600 min-w-[180px]">Payment ID</TableHead>
//                       <TableHead className="font-medium text-gray-600 min-w-[120px]">Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {transactionHistory?.data?.coin_history?.length ? (
//                       transactionHistory.data.coin_history.map((transaction: Transaction, index: number) => (
//                         <TableRow key={index} className="hover:bg-gray-50">
//                           <TableCell className="font-medium">
//                             <span className="text-gray-900">{transaction.name}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="text-gray-600">{formatDate(transaction.transaction_date)}</span>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span className="text-gray-600">{transaction.coins?.toLocaleString()}</span>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span className="text-gray-600">{transaction.rate}</span>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span className="text-gray-600">{transaction.total_amount}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="text-gray-600 break-all">{transaction.payment_transaction_id || '-'}</span>
//                           </TableCell>
//                           <TableCell>
//                             {getStatusBadge(transaction.payment_status)}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell colSpan={7} className="text-center py-12 text-gray-500">
//                           No transactions found
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Sales Coins Transaction History */}
//           <Card className="shadow-sm">
//             <CardHeader className="border-b">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <HistoryIcon className="w-5 h-5 text-green-600" />
//                 </div>
//                 <CardTitle className="text-xl font-semibold">Sales Coins Transaction History</CardTitle>
//               </div>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader className="bg-gray-50">
//                     <TableRow>
//                       <TableHead className="font-medium text-gray-600 min-w-[180px]">Sales Order ID</TableHead>
//                       <TableHead className="font-medium text-gray-600 min-w-[180px]">Date</TableHead>
//                       <TableHead className="font-medium text-gray-600 text-right">Coins</TableHead>
//                       <TableHead className="font-medium text-gray-600 text-right">Rate</TableHead>
//                       <TableHead className="font-medium text-gray-600 text-right">Amount</TableHead>
//                       <TableHead className="font-medium text-gray-600 min-w-[180px]">Payment ID</TableHead>
//                       <TableHead className="font-medium text-gray-600 min-w-[120px]">Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {transactionHistorySeles?.data?.coin_history?.length ? (
//                       transactionHistorySeles.data.coin_history.map((transaction: Transaction, index: number) => (
//                         <TableRow key={index} className="hover:bg-gray-50">
//                           <TableCell className="font-medium">
//                             <span className="text-gray-900">{transaction.name}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="text-gray-600">{formatDate(transaction.transaction_date)}</span>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span className="text-gray-600">{transaction.coins?.toLocaleString()}</span>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span className="text-gray-600">{transaction.rate}</span>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span className="text-gray-600">{transaction.total_amount}</span>
//                           </TableCell>
//                           <TableCell>
//                             <span className="text-gray-600 break-all">{transaction.payment_transaction_id || '-'}</span>
//                           </TableCell>
//                           <TableCell>
//                             {getStatusBadge(transaction.payment_status)}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell colSpan={7} className="text-center py-12 text-gray-500">
//                           No transactions found
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
