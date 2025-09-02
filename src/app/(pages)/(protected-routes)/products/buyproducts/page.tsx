"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCartIcon, CreditCardIcon, BookmarkIcon, InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useValidateCouponMutation } from "@/rtk-query/apis/orders";
import { useGetProductsListQuery } from "@/rtk-query/apis/products";
import { toast } from "react-toastify";

export default function BuyProductsPage() {
  const [quantity, setQuantity] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [validateCoupon] = useValidateCouponMutation();

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
      console.error("Coupon Validation Error:", error);
      toast.error(error.data?.message || "Invalid coupon code");
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
  const baseAmount = mrp * quantity;

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
              <li>Taxes @ 18%: ₹{tax.toFixed(2)}</li>
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
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Enter Coupon Code</label>
            <div className="w-full mt-1">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
              />
              {/* <Button
                size="sm"
                onClick={handleCouponValidation}
                disabled={isValidatingCoupon}
              >
                {isValidatingCoupon ? "Validating..." : "Apply"}
              </Button> */}
            </div>
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
          <Button className="w-full py-6 bg-primary text-white font-semibold shadow-md transition-all">
            <ShoppingCartIcon className="w-5 h-5" />
            Buy Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
