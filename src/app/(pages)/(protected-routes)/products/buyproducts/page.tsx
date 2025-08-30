"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCartIcon, CreditCardIcon, BookmarkIcon, InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BuyProductsPage() {
  const searchParams = useSearchParams();
  const productName = searchParams.get("name") || "Unknown Product";

  // 🧮 State for price calculations
  const [quantity, setQuantity] = useState(1);
  const [mrp, setMrp] = useState(2000);
  const [standardDiscount, setStandardDiscount] = useState(200);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Apply coupon logic
  const applyCoupon = () => {
    if (couponCode === "SAVE10") {
      setCouponDiscount(0.1 * mrp * quantity);
    } else {
      setCouponDiscount(0);
    }
  };

  // Net amount (after discounts)
  const netAmount = mrp * quantity - standardDiscount - couponDiscount;

  // Tax @ 18%
  const tax = netAmount * 0.18;

  // Final total
  const totalAmount = netAmount + tax;

  // 📌 AddiStud Description logic
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
            Fluctuations in limb size can cause discomfort, instability, and frequent device replacements.
            AddiStud-P provides seamless adjustment for Trans-Tibial & Trans-Femoral sockets, training,
            and temporary prostheses. With its gear-driven dial system, users can fine-tune socket fit
            instantly for better comfort, stability, and longer device lifespan.
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
            AddiStud-O allows customizable, on-the-go fit adjustments for AFOs, spinal braces, and
            post-surgical rehabilitation. By adapting to limb size changes instantly, it enhances comfort,
            stability, and reduces the need for frequent clinical interventions.
          </CardContent>
        </Card>
      );
    } else if (productName.includes("AddiStud")) {
      return (
        <Card className="border border-gray-200 bg-gray-50 shadow-sm rounded-lg mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-lg font-semibold text-gray-800">
                AddiStud: Adjustable Dial System
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            A smart dial system for prosthetic sockets & orthotic braces that adapts to limb size
            changes instantly, improving comfort, stability, and device lifespan.
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
        {/* 📌 Product Description */}


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
              <li>MRP: ₹{mrp * quantity}</li>
              <li>Standard Discount: -₹{standardDiscount}</li>
              {couponDiscount > 0 && (
                <li className="text-green-600">
                  Coupon Applied: -₹{couponDiscount}
                </li>
              )}
              <li>
                Net Amount: <span className="font-semibold">₹{netAmount}</span>
              </li>
              <li>Taxes @ 18%: ₹{tax.toFixed(2)}</li>
              <li className="font-bold text-primary">
                Total Amount: ₹{totalAmount.toFixed(2)}
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
            <label className="text-sm font-medium">MRP (per unit)</label>
            <Input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Standard Discount</label>
            <Input
              type="number"
              value={standardDiscount}
              onChange={(e) => setStandardDiscount(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Enter Coupon Code</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
              />
              <Button size="sm" onClick={applyCoupon}>
                Apply
              </Button>
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
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>
          <Button className="w-full py-6 bg-primary  text-white font-semibold shadow-md transition-all">
            <ShoppingCartIcon className="w-5 h-5" />
            Buy Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
