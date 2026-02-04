'use client';
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCardIcon, HistoryIcon } from 'lucide-react';
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
import { useGetProductsSalesOrderListQuery } from '@/rtk-query/apis/products';
import { useLazyGetOrderPdfQuery } from '@/rtk-query/apis/orders';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/app/common/TablePagination';
import { toast } from 'react-toastify';

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
  sales_order_id: string;
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

  // console.log('subscriptionTranscationHistory=>', subscriptionTranscationHistory);
  // console.log('transactionHistory=>', transactionHistory);
  const { data: transactionHistorySeles, refetch: refetchTransactionsS } =
    useGetTransactionHistorySelesQuery({
      customer: user?.customer_id
    });

  const { data: receiptsData = [], refetch: refetchReceipts } = useGetProductsSalesOrderListQuery({
    customer: user?.customer_id
  });

  const pageSize = 10;
  const [page, setPage] = React.useState(1);

  function paginate<T>(
    data: T[] = [],
    page: number,
    pageSize: number
  ) {
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: data.slice(start, end),
      totalPages,
      totalItems,
    };
  }

  const {
    data: pagedReceipts,
    totalPages,
  } = React.useMemo(
    () => paginate(receiptsData, page, pageSize),
    [receiptsData, page]
  );


  const [fetchPdf, { isFetching }] = useLazyGetOrderPdfQuery();

  // const openPdf = async (doctype: 'Sales Invoice' | 'Payment Entry', name?: string) => {
  //   if (!name) return;
  //
  //   try {
  //     const pdfBlob = await fetchPdf({ doctype, name }).unwrap();
  //
  //     const url = URL.createObjectURL(pdfBlob);
  //     window.open(url, '_blank');
  //
  //     // optional cleanup
  //     setTimeout(() => URL.revokeObjectURL(url), 30_000);
  //   } catch (err) {
  //     console.error('PDF open failed', err);
  //
  //   }
  // };
// ✅ ADD THIS: Refetch all data on page focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page visible - refetching transactions');
        refetchTransactions();
        subscriptionTranscationHistorys();
        refetchTransactionsS();
        refetchReceipts(); // This is the important one for "Other Transactions"
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchTransactions, subscriptionTranscationHistorys, refetchTransactionsS, refetchReceipts]);
  async function extractBlobError(err: any): Promise<string> {
    // If error data is a Blob, parse it first
    if (err?.data instanceof Blob) {
      try {
        const text = await err.data.text();
        const errorData = JSON.parse(text);

        // Try _server_messages first
        if (errorData._server_messages) {
          const messagesArray = JSON.parse(errorData._server_messages);
          if (Array.isArray(messagesArray) && messagesArray.length > 0) {
            const messageObj = JSON.parse(messagesArray[0]);

            if (messageObj.message) {
              // Strip HTML
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = messageObj.message;
              return tempDiv.textContent || tempDiv.innerText || 'An error occurred';
            }
          }
        }

        // Fallback to _error_message
        return errorData._error_message || 'Unable to open PDF';
      } catch (e) {
        console.error('Failed to parse blob error:', e);
      }
    }

    return 'Unable to open PDF. Please try again later.';
  }

  const openPdf = async (doctype: 'Sales Invoice' | 'Payment Entry', name?: string) => {
    if (!name) return;

    try {
      const pdfBlob = await fetchPdf({ doctype, name }).unwrap();
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err: any) {
      console.error('PDF open failed', err);
      const errorMessage = await extractBlobError(err);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // console.log('ReceiptsData from API:', transactionHistory);
  }, [transactionHistory]);

  // pagination for subscription history
  const {
    page: subPage,
    setPage: setSubPage,
    pagedData: pagedSubscriptions,
    totalPages: subTotalPages,
  } = usePagination(subscriptionTranscationHistory ?? [], 10);

  const coinHistory: Transaction[] = Array.isArray(
    transactionHistory?.data?.coin_history
  )
    ? transactionHistory!.data!.coin_history
    : [];


  // pagination for coin transaction history
  const {
    page: coinPage,
    setPage: setCoinPage,
    pagedData: pagedCoinHistory,
    totalPages: coinTotalPages,
  } = usePagination<Transaction>(coinHistory, 10);

// Pagination for usage coin history
  const usageCoinHistory: Transaction[] = Array.isArray(
    transactionHistorySeles?.data?.coin_history
  )
    ? transactionHistorySeles!.data!.coin_history
    : [];

  const {
    page: usagePage,
    setPage: setUsagePage,
    pagedData: pagedUsageCoins,
    totalPages: usageTotalPages,
  } = usePagination<Transaction>(usageCoinHistory, 10);


  return (
    <div className="space-y-2">
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
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
                      {subscriptionTranscationHistory &&
                      subscriptionTranscationHistory.length > 0 ? (
                        pagedSubscriptions.map((subscription: any, index: number) => (
                          <TableRow key={index} className="hover:bg-gray-100">
                            <TableCell>
                              <span className="text-gray-600">
                                {subscription.custom_sales_order ?? '-'}
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
                              {subscription.amount ? subscription.amount.toLocaleString() : '-'}
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
                                '-'
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
                                '-'
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
                  <TablePagination
                  page={subPage}
                  totalPages={subTotalPages}
                  onPageChange={setSubPage}
                />


                </CardContent>
              </Card>
            </div>
          </div>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"></div>

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
                      <TableRow>
                        <TableHead className="font-medium text-gray-600 p-2">Order ID</TableHead>
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
                      {Array.isArray(pagedCoinHistory) && pagedCoinHistory.length ? (
                        pagedCoinHistory.map((transaction: Transaction, index: number) => (
                          <TableRow key={index} className="hover:bg-gray-100">
                            <TableCell className="p-2">
                              <span className="text-gray-600">{transaction.sales_order_id}</span>
                            </TableCell>
                            <TableCell className="p-2">
                              <span className="text-gray-600">{transaction.name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-600">{transaction.transaction_date}</span>
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
                              <a
                                href={transaction.sales_invoice_pdf_url}
                                className="text-blue-600 underline"
                              >
                                Invoice PDF
                              </a>
                            </TableCell>
                            <TableCell>
                              <a
                                href={transaction.payment_entry_pdf_url}
                                className="text-blue-600 underline"
                              >
                                Receipt PDF
                              </a>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    {/*<TableBody>*/}
                    {/*  {transactionHistory?.data?.coin_history?.length ? (*/}
                    {/*    transactionHistory.data.coin_history.map(*/}
                    {/*      (transaction: Transaction, index: number) => (*/}
                    {/*        <TableRow key={index} className="hover:bg-gray-100">*/}
                    {/*          <TableCell className="p-2">*/}
                    {/*            <span className="text-gray-600">{transaction.sales_order_id}</span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell className="p-2">*/}
                    {/*            <span className="text-gray-600">{transaction.name}</span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">*/}
                    {/*              {transaction.transaction_date}*/}
                    {/*            </span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">*/}
                    {/*              {transaction.coins?.toLocaleString()}*/}
                    {/*            </span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">{transaction.rate}</span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">{transaction.total_amount}</span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <a*/}
                    {/*              href={transaction.sales_invoice_pdf_url}*/}
                    {/*              download="invoice.pdf"*/}
                    {/*              rel="noopener noreferrer"*/}
                    {/*              className="text-blue-600 underline"*/}
                    {/*            >*/}
                    {/*              Invoice PDF*/}
                    {/*            </a>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <a*/}
                    {/*              href={transaction.payment_entry_pdf_url}*/}
                    {/*              download="receipt.pdf"*/}
                    {/*              rel="noopener noreferrer"*/}
                    {/*              className="text-blue-600 underline"*/}
                    {/*            >*/}
                    {/*              {' '}*/}
                    {/*              Receipt PDF*/}
                    {/*            </a>*/}
                    {/*          </TableCell>*/}
                    {/*        </TableRow>*/}
                    {/*      )*/}
                    {/*    )*/}
                    {/*  ) : (*/}
                    {/*    <TableRow>*/}
                    {/*      <TableCell colSpan={8} className="text-center py-12 text-gray-500">*/}
                    {/*        No transactions found*/}
                    {/*      </TableCell>*/}
                    {/*    </TableRow>*/}
                    {/*  )}*/}
                    {/*</TableBody>*/}
                  </Table>
                  <TablePagination
                    page={coinPage}
                    totalPages={coinTotalPages}
                    onPageChange={setCoinPage}
                  />

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
                        <TableHead className="font-medium text-gray-600 ">Order ID</TableHead>
                        <TableHead className="font-medium text-gray-600">Date</TableHead>
                        <TableHead className="font-medium text-gray-600">Date</TableHead>
                        <TableHead className="font-medium text-gray-600">Sales Order ID</TableHead>
                        <TableHead className="font-medium text-gray-600">Device Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    {/*<TableBody>*/}
                    {/*  {transactionHistorySeles?.data?.coin_history?.length ? (*/}
                    {/*    transactionHistorySeles.data.coin_history.map(*/}
                    {/*      (transaction: Transaction, index: number) => (*/}
                    {/*        <TableRow key={index} className="hover:bg-gray-100">*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">{transaction.name}</span>*/}
                    {/*          </TableCell>*/}

                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">*/}
                    {/*              {transaction.transaction_date}*/}
                    {/*            </span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">*/}
                    {/*              {transaction.coins?.toLocaleString()}*/}
                    {/*            </span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell className="font-medium">*/}
                    {/*            <span className="text-gray-600">{transaction.sales_order}</span>*/}
                    {/*          </TableCell>*/}
                    {/*          <TableCell>*/}
                    {/*            <span className="text-gray-600">{transaction.device_type}</span>*/}
                    {/*          </TableCell>*/}
                    {/*        </TableRow>*/}
                    {/*      )*/}
                    {/*    )*/}
                    {/*  ) : (*/}
                    {/*    <TableRow>*/}
                    {/*      <TableCell colSpan={6} className="text-center py-12 text-gray-500">*/}
                    {/*        No transactions found*/}
                    {/*      </TableCell>*/}
                    {/*    </TableRow>*/}
                    {/*  )}*/}
                    {/*</TableBody>*/}
                    <TableBody>
                      {Array.isArray(pagedUsageCoins) && pagedUsageCoins.length ? (
                        pagedUsageCoins.map((transaction: Transaction, index: number) => (
                          <TableRow key={index} className="hover:bg-gray-100">
                            <TableCell>
                              <span className="text-gray-600">{transaction.name}</span>
                            </TableCell>

                            <TableCell>
                              <span className="text-gray-600">{transaction.transaction_date}</span>
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>

                  </Table>
                  <TablePagination
                    page={usagePage}
                    totalPages={usageTotalPages}
                    onPageChange={setUsagePage}
                  />

                </CardContent>
              </Card>
            </div>
          </div>
          {/* Other buying transcation history */}
          <div
            id="other-transcation-history"
            className="bg-white shadow rounded-lg overflow-hidden mt-10"
          >
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
                        <TableHead className="font-medium text-gray-600 ">Order ID</TableHead>
                        <TableHead className="font-medium text-gray-600">Date</TableHead>
                        <TableHead className="font-medium text-gray-600">Product Name</TableHead>
                        <TableHead className="font-medium text-gray-600">Amount</TableHead>
                        <TableHead className="font-medium text-gray-600">Invoice</TableHead>
                        <TableHead className="font-medium text-gray-600">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedReceipts.length ? (
                        pagedReceipts.map((order, index) => (
                          <TableRow key={index} className="hover:bg-gray-100">
                            {/* Order ID */}
                            <TableCell>
                              <span className="text-gray-600">{order.order_id}</span>
                            </TableCell>

                            {/* Order Date */}
                            <TableCell>
                              <span className="text-gray-600">{order.order_date}</span>
                            </TableCell>

                            {/* Product Name */}
                            <TableCell>
                              <span className="text-gray-600">{order.product_name || '-'}</span>
                            </TableCell>

                            {/* Order Value */}
                            <TableCell className="font-medium">
                              <span className="text-gray-600">
                                {order.rate ? order.invoice_amount?.toLocaleString() : '-'}
                              </span>
                            </TableCell>

                            {/* Invoice PDF */}
                            <TableCell>
                              {order.invoice_name ? (
                                <button
                                  onClick={() => openPdf('Sales Invoice', order.invoice_name)}
                                  className="text-blue-600 underline bg-transparent p-0 border-0 cursor-pointer"
                                >
                                  Invoice
                                </button>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </TableCell>

                            {/* Receipt PDF */}
                            <TableCell>
                              {order.receipt_name ? (
                                <button
                                  onClick={() => openPdf('Payment Entry', order.receipt_name)}
                                  className="text-green-600 underline bg-transparent p-0 border-0 cursor-pointer"
                                >
                                  Receipt
                                </button>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
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
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        Previous
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
