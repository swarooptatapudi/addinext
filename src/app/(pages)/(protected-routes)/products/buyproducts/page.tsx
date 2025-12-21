'use client';
import DOMPurify from 'dompurify';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { ShoppingCartIcon, CreditCardIcon, BookmarkIcon, InfoIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useValidateCouponMutation, useCreateProductOrderMutation } from '@/rtk-query/apis/orders';
import { useGetProductsListQuery } from '@/rtk-query/apis/products';
import { toast } from 'react-toastify';
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Loader, Check, X } from 'lucide-react';
import { usePaymentLauncher } from '@/hooks/usePaymentLauncherForScannersPrinters';
import { Interweave ,Matcher} from 'interweave';
import { HashtagMatcher, UrlMatcher } from 'interweave-autolink';
import linkifyHtml from 'linkify-html';
declare global {
  interface Window {
    Razorpay: any;
  }
}


class ColoredUrlMatcher extends Matcher<{}> {
  replaceWith(children: React.ReactNode, props: any) {
    const { key, escapeHtml, ...rest } = props; // remove key + escapeHtml

    return (
      <a
        key={key}
        {...rest} // href, target, rel, etc.
        className="text-blue-600 hover:text-blue-700 underline"
      >
        {children}
      </a>
    );
  }

  asTag() {
    return 'a';
  }

  match(string: string) {
    const regex = /(https?:\/\/[^\s]+)/;
    const result = string.match(regex);
    if (!result) return null;

    return {
      match: result[0],
      index: result.index!,
      length: result[0].length,
      url: result[0],
      valid: true,
    };
  }
}


export default function BuyProductsWithHdfc() {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [validateCoupon] = useValidateCouponMutation();
  const [createProductOrder, { isLoading: isOrderCreating }] = useCreateProductOrderMutation();

  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const router = useRouter();

  const searchParams = useSearchParams();
  const productName = searchParams.get('name') || 'Unknown Product';

  const { data: products, isLoading, error } = useGetProductsListQuery();

  // payment launcher hook
  const { startPayment } = usePaymentLauncher();



  // coupon debounce
  useEffect(() => {
    if (!couponCode) {
      setCouponData(null);
      return;
    }
    const t = setTimeout(() => {
      handleCouponValidation();
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode]);

  const selectedProduct = products?.find((p: any) => p.item_name === productName);

  // pricing fields
  const mrp = selectedProduct?.mrp || 0;
  const discountAmountPercent = selectedProduct?.standard_discount || 0;

  const baseAmount = mrp * (typeof quantity === 'number' ? quantity : 0);
  const netAmount =
    baseAmount - (discountAmountPercent / 100) * baseAmount - (couponData?.discount_amount || 0);
  const tax = netAmount * 0.18;
  const totalAmount = netAmount + tax;
  const finalAmount =
    totalAmount - ((totalAmount * (couponData?.discount_percentage || 0)) / 100 || 0);

  const linkMatcher = new ColoredUrlMatcher('coloredUrl');

  async function handleCouponValidation() {
    if (!couponCode || couponCode.trim().length < 3) {
      setCouponData(null);
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const res: any = await validateCoupon({ coupon_code: couponCode }).unwrap();
      setCouponData(res.message || res.data || null);
      toast.success('Coupon validated');
    } catch (err: any) {
      setCouponData(null);
      toast.error(err?.data?.message || 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load products</p>;
  if (!selectedProduct) return <p>No product selected</p>;

  // ---------- Helper: robust extractor ----------
  const extractSalesAndPrice = (res: any) => {
    const sales =
      res?.sales_order ||
      res?.sales_order_id ||
      res?.bk_order_id ||
      res?.message?.sales_order ||
      res?.message?.sales_order_id ||
      res?.data?.sales_order_id ||
      null;

    let total_price =
      res?.frontend_values?.total_price ??
      res?.message?.frontend_values?.total_price ??
      res?.message?.data?.total_price ??
      res?.data?.frontend_values?.total_price ??
      res?.data?.total_price ??
      null;

    // convert to number if possible
    if (total_price !== null && total_price !== undefined) {
      total_price = Number(total_price);
      // If backend returned paise (very large compared to UI amounts), convert to rupees.
      // Heuristic: if > 100000 (₹1,000) in paise OR if value >> local UI estimate, divide by 100.
      if (!isNaN(total_price)) {
        // If it looks like paise (very large), convert:
        if (total_price > 100000) {
          total_price = total_price / 100;
        }
      }
    }

    return { sales, total_price, raw: res };
  };

  // ---------- Create Draft Order ----------
  const createDraftOrder = useCallback(async () => {
    const draftPayload = {
      orderPayload: {
        product_name: productName,
        item_code: selectedProduct?.item_code,
        product_id: selectedProduct?.id,
        quantity,
        amount: Number(finalAmount || 0),
        coupon_code: couponCode || null,
        create_draft: true
      }
    };

    const res: any = await createProductOrder(draftPayload).unwrap();
    return extractSalesAndPrice(res);
  }, [createProductOrder, productName, selectedProduct, quantity, couponCode, finalAmount]);

  // ---------- Finalize Order (called after payment success) ----------
  const finalizeOrder = useCallback(
    async (salesOrderId: string, paymentRef: string | null) => {
      // assume createProductOrder accepts finalize payload; adapt if you have a dedicated endpoint
      const finalizePayload = {
        orderPayload: {
          sales_order_id: salesOrderId,
          payment_reference_id: paymentRef,
          finalize: true
        }
      };

      const res: any = await createProductOrder(finalizePayload).unwrap();
      return res;
    },
    [createProductOrder]
  );

  // ---------- Main payment handler ----------
  const onPayNow = async () => {
    if (!quantity || Number(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      // 1) create draft
      const draft = await createDraftOrder();
      const salesOrderId = draft.sales;
      const backendPrice = draft.total_price;

      if (!salesOrderId) {
        console.error('Draft created but did not return sales id', draft.raw);
        toast.error('Could not create draft order. Please try again.');
        return;
      }

      // 2) determine canonical amount (prefer backend)
      const canonicalAmountRupees =
        backendPrice !== null && backendPrice !== undefined
          ? Number(backendPrice)
          : Number(finalAmount || 0);

      if (!canonicalAmountRupees || canonicalAmountRupees <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }

      // 3) Call startPayment (pass rupees, NOT paise). Do NOT pass returnUrl to let hook use its default.
      await startPayment({
        amount: canonicalAmountRupees, // rupees
        salesOrder: String(salesOrderId),
        provider: 'HDFC',
        openInPopup: true,
        pollingAttempts: 20,
        pollingIntervalMs: 2000,
        // finalize the order when payment confirmed
        onSuccess: async (payload) => {
          try {
            // try to extract payment reference id from payload delivered by HDFC / hook
            const paymentRef =
              payload?.data?.payment_reference_id ||
              payload?.data?.order_id ||
              payload?.payment_id ||
              payload?.order_id ||
              payload?.payment_reference_id ||
              null;

            await finalizeOrder(String(salesOrderId), paymentRef);
            toast.success('Payment successful & order finalized');
            router.push('/transcations#other-transcation-history');
          } catch (err) {
            console.error('Failed to finalize after success:', err);
            toast.error('Payment succeeded but finalizing failed.');
            // Keep user on page or redirect depending on your UX choice
          }
        },
        onFailure: (err) => {
          console.error('Payment failed/cancelled', err);
          toast.error('Payment failed or cancelled. Please try again.');
        }
      });
    } catch (err: any) {
      console.error('Error in payment flow', err);
      toast.error(err?.data?.message || err?.message || 'Failed to prepare payment. Try again.');
    }
  };

  // ----- UI card helpers -----
  const custom_product_image = selectedProduct?.custom_product_image;
  // const description = selectedProduct?.description || '';

  function sanitizeDescription(raw: string): string {
    if (!raw) return '';

    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['div', 'p', 'br', 'strong', 'em', 'b', 'i'],
      ALLOWED_ATTR: [], // no attributes needed yet
    });
  }

  // const getProductDescriptionCard = () => {
  //   if (!selectedProduct) return null;
  //   const safeDescription =
  //     description?.includes('<a') || description?.includes('<p') ? (
  //       <div dangerouslySetInnerHTML={{ __html: description }} />
  //     ) : (
  //       <p>{description}</p>
  //     );
  //
  //   return (
  //     <Card className="border border-gray-200 bg-gray-50 shadow-sm rounded-lg mb-6">
  //       <CardHeader className="pb-2">
  //         <div className="flex items-center gap-2">
  //           <InfoIcon className="w-5 h-5 text-primary" />
  //           <CardTitle className="text-lg font-semibold text-primary">
  //             {selectedProduct.item_name}
  //           </CardTitle>
  //         </div>
  //       </CardHeader>
  //       <CardContent className="text-sm text-gray-700">
  //         {safeDescription}
  //         {custom_product_image && (
  //           <img
  //             src={custom_product_image}
  //             alt={selectedProduct.item_name}
  //             className="mt-3 rounded-md w-full max-w-sm"
  //           />
  //         )}
  //       </CardContent>
  //     </Card>
  //   );
  // };
  const getProductDescriptionCard = () => {
    if (!selectedProduct) return null;
    const descriptionNew = selectedProduct?.description || '';
    // console.warn(descriptionNew);

    const refinedContent =  linkifyHtml(descriptionNew, {
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'text-blue-600 underline',
    });

    return (
      <Card className="border border-gray-200 bg-gray-50 shadow-sm rounded-lg mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-primary">
              {selectedProduct.item_name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <Interweave
            content={refinedContent}
            matchers={[new UrlMatcher('url', { validateTLD: false })]}
          />
          {custom_product_image && (
            <img
              src={custom_product_image}
              alt={selectedProduct.item_name}
              className="mt-3 rounded-md w-full max-w-sm"
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* LEFT */}
      <div>
        <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg mb-6">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold text-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <BookmarkIcon className="w-4 h-4 text-gray-500" />
                <p className="text-xl font-semibold text-primary">Summary</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="text-l space-y-3">
              <li>Quantity: {quantity}</li>
              <li>MRP: ₹{baseAmount.toFixed(2)}</li>
              <li>Standard Discount: {discountAmountPercent}%</li>
              {couponData?.discount_amount > 0 && (
                <li className="text-green-600">Coupon Applied: -₹{couponData.discount_amount}</li>
              )}
              <li>
                Net Amount: <span className="font-semibold">₹{netAmount.toFixed(2)}</span>
              </li>
              <li>Taxes @ 18%</li>
              <li className="font-bold text-primary">Total Amount: ₹{finalAmount.toFixed(2)}</li>
            </ul>
          </CardContent>
        </Card>

        {getProductDescriptionCard()}
      </div>

      {/* RIGHT */}
      <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-xl font-semibold text-primary">{productName}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="w-full pt-1 space-y-3">
          <div>
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value.replace(/^0+/, '');
                setQuantity(val === '' ? '' : Number(val));
              }}
              className="mt-1"
            />
          </div>

          <div className="space-y-2 mt-3">
            <div className="relative w-full">
              <Input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className={`w-full pr-10 ${couponCode.length >= 5 && !couponData && !isValidatingCoupon ? 'border-orange-200' : couponData ? 'border-green-200' : ''}`}
              />
              <div className="absolute right-3 top-2">
                {isValidatingCoupon ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : couponCode.length >= 5 ? (
                  couponData ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )
                ) : null}
              </div>
            </div>
            {couponData && (
              <div className="text-sm text-green-700 mt-1 ml-5">
                {couponData.coupon_name} ({couponData.discount_percentage}% off)
                {couponData.valid_upto && (
                  <span className="text-gray-500 ml-6">
                    valid date {new Date(couponData.valid_upto).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-0">
          <div className="w-full flex items-center justify-between py-3 px-1 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCardIcon className="w-5 h-5" />
              <span className="font-medium ">Total Amount:</span>
            </div>
            <div className="text-xl font-bold text-primary">₹{finalAmount.toFixed(2)}</div>
          </div>

          <Button
            onClick={onPayNow}
            disabled={isOrderCreating}
            className="w-full py-6 bg-primary text-white font-semibold shadow-md transition-all"
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            {isOrderCreating ? 'Processing...' : 'Buy Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
