"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, ShoppingCartIcon, CreditCardIcon, BookmarkIcon } from "lucide-react";

export default function BuyProductsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Available Coins Card */}
      <Card className="bg-gradient-to-br from-blue-10 to-indigo-50 shadow-sm border border-gray-200 rounded-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            {/* <span className="text-sm font-semibold text-primary">Available Coins</span>
            <CardTitle className="text-2xl font-bold text-blue-800 mt-1">200</CardTitle> */}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkIcon className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-primary">Rules</p>
          </div>
          <ul className="text-sm space-y-2.5">
            <li> Quantity </li>
            <li>Standard Discount:</li>
            <li>MRP:</li>
            <li>Enter Coupon Code:</li>
            <li>Tax: 18%</li>
            <li>Final Rate: ₹180</li>
          </ul>
        </CardContent>
      </Card>

      {/* Buy Coins Card */}
      <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-xl font-semibold text-primary">Buy </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="w-full pt-1">
          <p className="text-gray-500">Enter quantity, apply coupons, etc...</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-0">
          <div className="w-full flex items-center justify-between py-3 px-1 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCardIcon className="w-5 h-5" />
              <span className="font-medium">Total Amount:</span>
            </div>
            <div className="text-xl font-bold text-blue-800">₹2000</div>
          </div>
          <Button className="w-full py-6 bg-blue-900 hover:bg-blue-700 text-white font-semibold shadow-md transition-all">
            <ShoppingCartIcon className="w-5 h-5" />
            Buy Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
