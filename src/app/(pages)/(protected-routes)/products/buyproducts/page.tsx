"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCartIcon, CreditCardIcon, BookmarkIcon, InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useValidateCouponMutation } from "@/rtk-query/apis/orders";
import { useGetProductsListQuery } from "@/rtk-query/apis/products";
import { toast } from "react-toastify";
import { useCreateProductOrderMutation } from "@/rtk-query/apis/orders";
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import { useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
import { Loader, Check, X } from 'lucide-react';


declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuyProductsPage() {
  const [quantity, setQuantity] = useState<number | "">("");
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [validateCoupon] = useValidateCouponMutation();
  const [createProductOrder, { isLoading: isOrderCreating }] = useCreateProductOrderMutation();

  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const router = useRouter();

  // Debounced coupon check
  useEffect(() => {
    if (!couponCode) return;

    const timer = setTimeout(() => {
      handleCouponValidation();
    }, 800);

    return () => clearTimeout(timer);
  }, [couponCode]);



  const searchParams = useSearchParams();
  const productName = searchParams.get("name") || "Unknown Product";


  // Fetch products
  const { data: products, isLoading, error } = useGetProductsListQuery();
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load products</p>;

  // 🎯 Find product by name (from query params)
  const selectedProduct = products?.find(
    (item: any) => item.item_name === productName
  );
  console.log("selectedProduct", selectedProduct);
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
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // 🎯 Amount in paise (Razorpay expects INR * 100)
      const amountInPaise = Math.round(finalAmount * 100);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise.toString(),
        currency: "INR",
        name: "Addiwise Company",
        description: `Purchase of ${quantity} x ${productName}`,

        // 👉 Only ONE handler function
        handler: async function (response: any) {
          console.log("Payment response:", response);

          try {
            // Build order payload
            const orderPayload = {
              orderPayload: {
                product_name: productName,
                item_code: selectedProduct?.item_code,
                product_id: selectedProduct?.id,
                quantity,
                amount: finalAmount.toFixed(2), // makes "11100.00"
                coupon_code: couponCode || null,
                payment_reference_id: response.razorpay_payment_id, // ✅ corrected key name
              },
            };

            console.log("Order Payload (object):", orderPayload);

            // 🟢 Logs as raw JSON string (exact body you send)
            console.log("Order Payload (JSON):", JSON.stringify(orderPayload, null, 2));
            // Call your API
            const orderRes = await createProductOrder(orderPayload).unwrap();

            toast.success("Order placed successfully!");
            console.log("Order Response:", orderRes);
            router.push(`/transcations`);
          } catch (err) {
            toast.error("Failed to create order after payment");
            console.error("Create Order Error:", err);
          }
        },

        prefill: {
          name: user?.full_name || '',
          // email: user?. || '',
          contact: user?.phone_number || '',
        },
        notes: {
          customer_id: user?.customer_id,
          product: productName,
          quantity: quantity.toString(),
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
        console.error("Payment failed:", response.error);
      });
    } catch (err) {
      toast.error("An error occurred during payment process");
      console.error(err);
    }
  };



  const description = selectedProduct?.description || "";
  // ✅ MRP & Discount come from selected product
  const mrp = selectedProduct?.mrp || 0;
  console.log("mrp", mrp);
  const discountAmount = selectedProduct?.standard_discount || 0;
  // console.log("discountAmount", discountAmount);

  // Coupon validation with debounce
  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponData(null);
      return;
    }

    if (couponCode.trim().length < 5) {
      setCouponData(null);
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await validateCoupon({ coupon_code: couponCode }).unwrap();
      console.log("Coupon Validation Response:", response);
      setCouponData(response.message);
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      setCouponData(null);
      setTimeout(() => { toast.error(error.data?.message || "Invalid coupon code"); }, 10000);
      console.error("Coupon Validation Error:", error);

    } finally {
      setIsValidatingCoupon(false);
    }
  };




  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Failed to load products</p>;
  }

  // 🧮 Price calculations
  const baseAmount = mrp * (typeof quantity === "number" ? quantity : 0);

  const netAmount = baseAmount - discountAmount / 100 * baseAmount - (couponData?.discount_amount || 0);

  const tax = netAmount * 0.18;
  const totalAmount = netAmount + tax;

  // 📌 Coupon discount applied (if available)
  const finalAmount =
    totalAmount - totalAmount * (couponData?.discount_percentage || 0) / 100

  if (!selectedProduct) {
    return <p>No product selected</p>; // conditions go *after* hooks
  }

  // 📌 AddiStud Description
  const getAddiStudDescription = () => {
    if (productName === "AddiStud-P") {
      return (
        <Card className="border border-blue-200 bg-blue-50 shadow-sm rounded-lg mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-semibold text-primary">
                AddiStud-P: Adjustable Dial for Prosthetics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            {/* Fluctuations in limb size can cause discomfort, instability, and
            frequent device replacements. AddiStud-P provides seamless
            adjustment for Trans-Tibial & Trans-Femoral sockets, training, and
            temporary prostheses. */}{description}
          </CardContent>
        </Card>
      );
    } else if (productName === "AddiStud-O") {
      return (
        <Card className="border border-green-200 bg-green-50 shadow-sm rounded-lg mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg font-semibold text-green-800">
                AddiStud-O: Adjustable Dial for Orthotics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            {description}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* LEFT COLUMN */}
      <div>
        {/* Summary Card */}
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
              <li>MRP: ₹{baseAmount}</li>
              <li>Standard Discount: {discountAmount}%</li>
              {couponData?.discount_amount > 0 && (
                <li className="text-green-600">
                  Coupon Applied: -₹{couponData.discount_amount}
                </li>
              )}
              <li>Net Amount: <span className="font-semibold">₹{netAmount}</span></li>
              {/* <li>Taxes @ 18%: ₹{tax.toFixed(2)}</li> */}
              <li>Taxes @ 18%</li>
              <li className="font-bold text-primary">
                Total Payable: ₹{finalAmount.toFixed(2)}
              </li>
            </ul>
          </CardContent>
        </Card>
        {getAddiStudDescription()}
      </div>

      {/* RIGHT COLUMN: Buy Card */}
      <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-xl font-semibold text-primary">
              {productName}
            </CardTitle>
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
                const val = e.target.value.replace(/^0+/, ""); // remove leading zeros
                setQuantity(val === "" ? "" : Number(val));
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
                className={`w-full pr-10 ${couponCode.length >= 5 && !couponData && !isValidatingCoupon
                  ? 'border-orange-200'
                  : couponData
                    ? 'border-green-200'
                    : ''
                  }`}
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
            <div className="text-xl font-bold text-primary">
              ₹{finalAmount.toFixed(2)}
            </div>
          </div>
          <Button
            onClick={onPayNow}
            className="w-full py-6 bg-primary text-white font-semibold shadow-md transition-all">
            <ShoppingCartIcon className="w-5 h-5" />
            Buy Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
