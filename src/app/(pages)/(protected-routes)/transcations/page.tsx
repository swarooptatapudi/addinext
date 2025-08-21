'use client';
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookmarkIcon,
  CheckCircleIcon,
  CoinsIcon,
  CreditCardIcon,
  HistoryIcon,
  InfoIcon,
  ShoppingCartIcon
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useSelector } from 'react-redux';
import {
  useGetRateAndDiscountsQuery,
  useGetTransactionHistoryQuery,
  useGetTransactionHistorySelesQuery
} from '@/rtk-query/apis/addicoins';
import { useGetSubscriptionTranscationHistoryQuery } from '@/rtk-query/apis/subscription';
import { USER } from '@/uttils/Types';
import { RootState } from '@/rtk-query/store';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Transaction {
  payment_transaction_id?: string;
  name: string;
  coins: number;
  total_amount: string;
  invoice: string;
  invoiceUrl: string;
  payment_receipt: string;
  payment_receiptURL: string;
  rate: string;
  transaction_date: string;
  transaction_type: string;
  payment_status: string;
  sales_order?: string;
  docstatus?: string;
  customer_name?: string;
  device_type?: string;
  transaction_id?: string;
  sales_invoice_pdf_url: string;
  payment_entry_pdf_url: string;
  custom_sales_invoice: string;
  custom_payment_entry: string;
  sales_order_id: string
}
// interface SubscriptionTranscationHistory{
//   message?: {
//         name: string,
//         plan_name: string,
//         amount:  number,
//         start_date: string,
//       end_date:string,
//         payment_status: string,
//         bonus_coins: number
//     }
// }

interface SubscriptionTransactionItem {
  name: string;
  plan_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  payment_status: string;
  bonus_coins: number;
  sales_invoice: string;
  payment_entry: string;
  invoice_pdf_url: string;
  payment_pdf_url: string;
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
      transaction_id: string;
    }>;
  };
}

export default function Transcations(): React.JSX.Element {
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const { data }: { data?: RateAndDiscountData } = useGetRateAndDiscountsQuery({
    customer: user?.customer_id
  });
  const { data: transactionHistory, refetch: refetchTransactions } = useGetTransactionHistoryQuery({
    customer: user?.customer_id
  });

  const { data: subscriptionTranscationHistory, refetch: subscriptionTranscationHistorys } =
    useGetSubscriptionTranscationHistoryQuery({
      customer: user?.customer_id
    });
  console.log('subscriptionTranscationHistory=>', subscriptionTranscationHistory);
  // console.log('transactionHistory=>', transactionHistory);
  const { data: transactionHistorySeles, refetch: refetchTransactionsS } =
    useGetTransactionHistorySelesQuery({
      customer: user?.customer_id
    });

  // console.log('::>>', transactionHistorySeles);

  // const { data: transactionHistory, isLoading, isError } = useGetReceiptsPdfQuery('CT-25-050');

  useEffect(() => {
    // console.log('ReceiptsData from API:', transactionHistory);
  }, [transactionHistory]);

  const receipts = transactionHistory?.data;
  // console.log('Receipts object:', receipts);
  // console.log('ReceiptsData from API:', receiptsData);
  // console.log('Parsed receipts object:', receipts);

  // const downloadPdf = (base64String: string, fileName: string) => {
  //   const linkSource = `data:application/pdf;base64,${base64String}`;
  //   const downloadLink = document.createElement('a');
  //   downloadLink.href = linkSource;
  //   downloadLink.download = `${fileName}.pdf`;
  //   downloadLink.click();
  // };

  // const downloadBase64File = (base64: string, filename: string) => {
  //   const linkSource = `data:application/pdf;base64,${base64}`;
  //   const downloadLink = document.createElement('a');
  //   downloadLink.href = linkSource;
  //   downloadLink.download = `${filename}.pdf`;
  //   downloadLink.click();
  // };
  const downloadPdfFromUrl = async (pdfUrl: string, fileName: string) => {
    try {
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          // If your API requires auth, include token here
          // 'Authorization': `Bearer ${yourToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(' Error downloading PDF:', error);
      alert('Unable to download PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinic Card */}
            {/* <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookmarkIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-primary font-semibold">
                    Clinic Details
                  </CardTitle>
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
            </Card>  */}

            {/* User Card */}
            {/* <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <InfoIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-primary">
                    Organization User
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg font-medium mt-1">Rohit Gupta</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
                  <p className="text-lg font-medium mt-1">9876543210</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-lg font-medium mt-1 truncate">addiwise56@gmail.com</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subscription Name</h3>
                  <p className="text-lg font-medium mt-1 truncate">Premium</p>
                </div>
              </CardContent>
            </Card> */}
          </div>
          {/* Addinxt subscription transcation  history */}
          <div className="bg-white shadow rounded-lg overflow-hidden mt-10">
            <div className="overflow-x-auto">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <HistoryIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-primary ">
                      Addinxt Subscription Transcation History
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-[-25px]">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-medium text-gray-600 ">Order ID</TableHead>
                        <TableHead className="font-medium text-gray-600 ">Transcation ID</TableHead>
                        <TableHead className="font-medium text-gray-600">Date</TableHead>
                        <TableHead className="font-medium text-gray-600">
                          Subscription Type{' '}
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">Start Date</TableHead>
                        <TableHead className="font-medium text-gray-600">End Date</TableHead>
                        <TableHead className="font-medium text-gray-600">Amount</TableHead>
                        <TableHead className="font-medium text-gray-600">Invoice</TableHead>
                        <TableHead className="font-medium text-gray-600">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                 <TableBody>
  {subscriptionTranscationHistory && subscriptionTranscationHistory.length > 0 ? (
    subscriptionTranscationHistory.map((subscription: any, index: number) => (
      <TableRow key={index} className="hover:bg-gray-100">
        <TableCell>
          <span className="text-gray-600">
            {subscription.custom_sales_order ?? "-"}
          </span>
        </TableCell>

        <TableCell>
          <span className="text-gray-600">{subscription.name}</span>
        </TableCell>

        <TableCell>{subscription.start_date}</TableCell>
        <TableCell>{subscription.plan_name}</TableCell>
        <TableCell>{subscription.start_date}</TableCell>
        <TableCell>{subscription.end_date}</TableCell>

        <TableCell>
          {subscription.amount ? subscription.amount.toLocaleString() : "-"}
        </TableCell>

        {/* Invoice PDF */}
        <TableCell>
          {subscription.invoice_pdf_url ? (
            <a
              href={subscription.invoice_pdf_url}
              download="invoice.pdf"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Invoice PDF
            </a>
          ) : (
            "-"
          )}
        </TableCell>

        {/* Receipt PDF */}
        <TableCell>
          {subscription.payment_pdf_url ? (
            <a
              href={subscription.payment_pdf_url}
              download="receipt.pdf"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Receipt PDF
            </a>
          ) : (
            "-"
          )}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={9} className="text-center text-gray-500 py-6">
        No subscription found.
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
        <CardTitle className="text-xl font-semibold text-primary">
          Buy Coins Transaction History
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-0 mt-[-25px]">
      <Table>
        <TableHeader className="bg-gray-50 ">
          <TableRow><TableHead className="font-medium text-gray-600 p-2">
              Order ID
            </TableHead>
            <TableHead className="font-medium text-gray-600 p-2">
              Transaction ID
            </TableHead>
            <TableHead className="font-medium text-gray-600">Date</TableHead>
            <TableHead className="font-medium text-gray-600">Coins</TableHead>
            <TableHead className="font-medium text-gray-600">Rate</TableHead>
            <TableHead className="font-medium text-gray-600">Amount</TableHead>
            <TableHead className="font-medium text-gray-600">Invoice</TableHead>
            <TableHead className="font-medium text-gray-600">Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionHistory?.data?.coin_history?.length ? (
            transactionHistory.data.coin_history.map(
              (transaction: Transaction, index: number) => (
                <TableRow key={index} className="hover:bg-gray-100">
                   <TableCell className="p-2">
                    <span className="text-gray-600">{transaction.sales_order_id}</span>
                  </TableCell>
                  <TableCell className="p-2">
                    <span className="text-gray-600">{transaction.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {transaction.transaction_date}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {transaction.coins?.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{transaction.rate}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{transaction.total_amount}</span>
                  </TableCell>
                  <TableCell>
                    {/* <Button
                      className="bg-white text-gray-600 hover:bg-white no-underline hover:underline"
                      onClick={() => {
                        if (transaction.sales_invoice_pdf_url) {
                          downloadPdfFromUrl(
                            transaction.sales_invoice_pdf_url,
                            transaction.custom_sales_invoice || 'Sales_Invoice'
                          );
                        } else {
                          console.error('Invoice PDF URL is missing');
                        }
                      }}
                    >
                      <Image
                        src={'/assets/order-forms/icons/arrowdownload.svg'}
                        alt=""
                        className="object-cover"
                        width={20}
                        height={20}
                        unoptimized
                      />
                      Invoice
                    </Button> */}
                    <a   href={transaction.sales_invoice_pdf_url}
                              download="invoice.pdf"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline">Invoice PDF</a>
                  </TableCell>
                  <TableCell>
                    {/* <Button
                      className="bg-white text-gray-600 hover:bg-white no-underline hover:underline"
                      onClick={() => {
                        if (transaction.payment_entry_pdf_url) {
                          downloadPdfFromUrl(
                            transaction.payment_entry_pdf_url,
                            transaction.custom_payment_entry || 'Receipt'
                          );
                        } else {
                          console.error('Payment receipt PDF URL is missing');
                        }
                      }}
                    >
                      <Image
                        src={'/assets/order-forms/icons/arrowdownload.svg'}
                        alt=""
                        className="object-cover"
                        width={20}
                        height={20}
                        unoptimized
                      />
                      Receipt
                    </Button>  */}
                    <a   href={transaction.payment_entry_pdf_url}
                              download="receipt.pdf"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"> Receipt PDF</a>

                              
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-gray-500">
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
           {/* Coins  history */}
          <div className="bg-white shadow rounded-lg overflow-hidden mt-10">
            <div className="overflow-x-auto">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <HistoryIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-primary ">
                     Usage Coins History
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-[-25px]">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-medium text-gray-600 ">
                       Transcation ID
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">Date</TableHead>
                        <TableHead className="font-medium text-gray-600">
                          Date
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">Sales Order ID</TableHead>
                        <TableHead className="font-medium text-gray-600">Device Type</TableHead>
                        
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionHistorySeles?.data?.coin_history?.length ? (
                        transactionHistorySeles.data.coin_history.map(
                          (transaction: Transaction, index: number) => (
                            <TableRow key={index} className="hover:bg-gray-100">
                              <TableCell>
                                <span className="text-gray-600">{transaction.name}</span>
                              </TableCell>

                              <TableCell>
                                <span className="text-gray-600">
                                  {transaction.transaction_date}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-600">
                                  {transaction.coins?.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium">
                                <span className="text-gray-600">{transaction.sales_order}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-600">{transaction.device_type}</span>
                              </TableCell>
                            </TableRow>
                          )
                        )
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
          {/* Other buying transcation history */}
          <div className="bg-white shadow rounded-lg overflow-hidden mt-10">
            <div className="overflow-x-auto">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <HistoryIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-primary ">
                      Other Transcation History
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-[-25px]">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-medium text-gray-600 ">
                        Transcation ID
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">Date</TableHead>
                        <TableHead className="font-medium text-gray-600">
                          Transcation Type
                        </TableHead>
                        <TableHead className="font-medium text-gray-600">Amount</TableHead>
                        <TableHead className="font-medium text-gray-600">Invoice</TableHead>
                        <TableHead className="font-medium text-gray-600">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionHistorySeles?.data?.coin_history?.length ? (
                        transactionHistorySeles.data.coin_history.map(
                          (transaction: Transaction, index: number) => (
                            <TableRow key={index} className="hover:bg-gray-100">
                              <TableCell>
                                <span className="text-gray-600">{transaction.name}</span>
                              </TableCell>

                              <TableCell>
                                <span className="text-gray-600">
                                  {transaction.transaction_date}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-600">
                                  {transaction.coins?.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium">
                                <span className="text-gray-600">{transaction.sales_order}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-600">{transaction.device_type}</span>
                              </TableCell>
                            </TableRow>
                          )
                        )
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