'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGetKafoProductCodesMutation } from '@/rtk-query/apis/products';

type UISet = {
  Button: any;
  Input: any;
  SelectBox: any;
  Label: any;
  Card: any;
};

type Props = {
  values: any;
  UI: UISet;
  onEstimate?: (v: {
    design_by: string;
    print_by: string;
    coupon_code?: string;
    product_code?: string;
  }) => Promise<{ design: number; print: number; stdDiscPct?: number; gstRate?: number } | void>;
  onValidateCoupon?: (code: string) => Promise<any | null>;
  onPlaceOrder?: () => void;
  onPayLater?: () => void;
  isPlacing?: boolean;
  isSavingLater?: boolean;
  setFieldValue?: (f: string, v: any) => void;
};

type Coupon = { id?: string; code: string; title?: string; percent?: number; amount?: number };

export default function FinishPayment({
                                        values,
                                        UI,
                                        onEstimate,
                                        onValidateCoupon,
                                        onPlaceOrder,
                                        onPayLater,
                                        isPlacing,
                                        isSavingLater,
                                        setFieldValue,
                                      }: Props) {
  const { Button, Input, SelectBox, Label, Card } = UI;

  /* ======================================================
     PRODUCT CODE (BACKEND – POST / MUTATION)
  ====================================================== */

  const [getKafoProductCodes, { data, isLoading }] =
    useGetKafoProductCodesMutation();

  // fetch product codes when device type is known
  useEffect(() => {
    if (!values.type) return;

    getKafoProductCodes({
      product_type: values.type, // KAFO | HKAFO
    });
  }, [values.type, getKafoProductCodes]);

  const productOptions = useMemo(() => {
    return (
      data?.message?.data?.map((item: any) => ({
        value: item.item_code,
        label: `${item.item_code} — ₹${item.valuation_rate}`,
      })) || []
    );
  }, [data]);

  // auto-select first backend product
  useEffect(() => {
    if (!values.item_code && productOptions.length > 0) {
      setFieldValue?.('item_code', productOptions[0].value);
    }
  }, [productOptions, values.item_code, setFieldValue]);

  /* ======================================================
     LOCAL STATE
  ====================================================== */

  const [designBy, setDesignBy] = useState(values.design_by);
  const [printBy, setPrintBy] = useState(values.print_by);
  const [colour, setColour] = useState(values.colour ?? '');

  const [designPrice, setDesignPrice] = useState<number>(Number(values.design_price || 0));
  const [printPrice, setPrintPrice] = useState<number>(Number(values.print_price || 0));
  const [stdPct, setStdPct] = useState<number>(Number(values.standard_discount_pct || 0));
  const [gstRate, setGstRate] = useState<number>(Number(values.gst_rate ?? 0.05));

  const [couponText, setCouponText] = useState(values.coupon_code || '');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [validating, setValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const couponBoxRef = useRef<HTMLDivElement>(null);

  /* ======================================================
     SYNC BACK TO FORMIK
  ====================================================== */

  useEffect(() => {
    setFieldValue?.('design_price', designPrice);
    setFieldValue?.('print_price', printPrice);
    setFieldValue?.('standard_discount_pct', stdPct);
    setFieldValue?.('gst_rate', gstRate);
  }, [designPrice, printPrice, stdPct, gstRate, setFieldValue]);

  useEffect(() => {
    setFieldValue?.('coupon_code', coupon?.code ?? couponText ?? '');
  }, [coupon, couponText, setFieldValue]);

  /* ======================================================
     SUMMARY
  ====================================================== */

  const summary = useMemo(() => {
    const subtotal = designPrice + printPrice;
    const std = subtotal * stdPct;
    const base = subtotal - std;

    const couponDisc =
      coupon?.percent != null
        ? base * coupon.percent
        : Math.min(base, coupon?.amount || 0);

    const taxable = Math.max(0, base - couponDisc);
    const gst = taxable * gstRate;

    return {
      subtotal,
      std,
      couponDisc,
      gst,
      total: taxable + gst,
    };
  }, [designPrice, printPrice, stdPct, coupon, gstRate]);

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleEstimate = async () => {
    if (!values.item_code) {
      alert('Please select a Product Code');
      return;
    }

    const r = await onEstimate?.({
      design_by: designBy,
      print_by: printBy,
      coupon_code: couponText,
      product_code: values.item_code,
    });

    if (r) {
      const d = Number(r.design ?? designPrice);
      const p = Number(r.print ?? printPrice);
      const pct = typeof r.stdDiscPct === 'number' ? r.stdDiscPct : stdPct;
      const gst = typeof r.gstRate === 'number' ? r.gstRate : gstRate;

      setDesignPrice(d);
      setPrintPrice(p);
      setStdPct(pct);
      setGstRate(gst);

      // keep backend payload fields synced
      const subtotal = d + p;
      const std = subtotal * pct;
      const taxable = subtotal - std;
      const gstAmount = taxable * gst;
      const total = taxable + gstAmount;

      setFieldValue?.('estimate_price', subtotal);
      setFieldValue?.('item_standard_discount', std);
      setFieldValue?.('gst_5', gstAmount);
      setFieldValue?.('total_price', total);
    }
  };


  const applyCoupon = async () => {
    if (!onValidateCoupon) return;
    if (!couponText.trim()) return;

    try {
      setValidating(true);
      setCouponError(null);

      const res = await onValidateCoupon(couponText.trim());
      const percent = Number(res?.data?.discount_percentage || 0);
      const amount = Number(res?.data?.discount_amount || 0);

      if (!percent && !amount) {
        setCoupon(null);
        setCouponError('Invalid or expired coupon.');
        return;
      }

      setCoupon({
        code: couponText.trim(),
        percent: percent ? percent / 100 : undefined,
        amount: amount || undefined,
        title: res?.data?.coupon_name,
      });
    } catch {
      setCoupon(null);
      setCouponError('Could not validate coupon.');
    } finally {
      setValidating(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  const toNum = (v: any) =>
    Number(String(v || '0').replace(/,/g, '')) || 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Finish & Payment
      </h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <Label className="text-primary text-base font-semibold">
            Design & Printing
          </Label>

          <SelectBox
            label="Design by"
            value={designBy}
            options={[
              { value: 'Addiwise', label: 'Addiwise' },
              { value: 'Clinic', label: 'Clinic' },
            ]}
            onValueChange={(v: string) => {
              setDesignBy(v);
              setFieldValue?.('design_by', v);
            }}
            required
          />

          <SelectBox
            label="Print by"
            value={printBy}
            options={[
              { value: 'Addiwise', label: 'Addiwise' },
              { value: 'Clinic', label: 'Clinic' },
            ]}
            onValueChange={(v: string) => {
              setPrintBy(v);
              setFieldValue?.('print_by', v);
            }}
            required
          />

          {/* ✅ PRODUCT CODE DROPDOWN */}
          <SelectBox
            label="Product Code"
            value={values.item_code}
            options={productOptions}
            isLoading={isLoading}
            required
            placeholder="Select product code"
            onValueChange={(v: string) => setFieldValue?.('item_code', v)}
          />

          <SelectBox
            label="Colour"
            value={colour}
            options={[
              { value: 'White', label: 'White' },
              { value: 'Grey', label: 'Grey' },
              { value: 'Black', label: 'Black' },
            ]}
            onValueChange={(v: string) => {
              setColour(v);
              setFieldValue?.('colour', v);
            }}
          />

          {/* Coupon */}
          <div ref={couponBoxRef}>
            <Label>Coupon Code</Label>
            <div className="flex">
              <Input
                value={couponText}
                onChange={(e: any) => {
                  setCouponText(e.target.value);
                  setCoupon(null);
                  setCouponError(null);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={validating}
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <div className="text-xs text-red-600 mt-1">
                {couponError}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <Card className="p-5">
          <div className="flex justify-between font-semibold mb-2">
            <span>Payment Summary</span>
            <span className="text-primary">{values.item_code}</span>
          </div>

          <ul className="text-sm space-y-2">

            {/* Design */}
            <li className="flex justify-between">
              <span>Design</span>
              <span>
        ₹{summary.subtotal
                ? designPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                : '0.00'}
      </span>
            </li>

            {/* Print */}
            <li className="flex justify-between">
              <span>Print</span>
              <span>
        ₹{printPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
            </li>

            {/* Estimate */}
            <li className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Estimate Price</span>
              <span>
        ₹{summary.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
            </li>

            {/* Standard Discount */}
            {summary.std > 0 && (
              <li className="flex justify-between">
                <span className="text-gray-600">Standard Discount</span>
                <span className="text-emerald-700">
          −₹{summary.std.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
              </li>
            )}

            {/* Coupon */}
            {summary.couponDisc > 0 && (
              <li className="flex justify-between">
        <span className="text-gray-600">
          Additional Discount {coupon?.code ? `(${coupon.code})` : ''}
        </span>
                <span className="text-emerald-700">
          −₹{summary.couponDisc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
              </li>
            )}

            {/* GST — ALWAYS SHOW */}
            <li className="flex justify-between">
      <span className="text-gray-600">
        GST ({(gstRate * 100).toFixed(0)}%)
      </span>
              <span>
        +₹{summary.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
            </li>

          </ul>

          {/* TOTAL */}
          <div className="mt-3 pt-3 border-t flex justify-between text-base font-semibold">
            <span>Total Amount</span>
            <span className="text-primary">
      ₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </span>
          </div>

          {/* Terms */}
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!values.agree_terms}
              onChange={(e) => setFieldValue?.('agree_terms', e.target.checked)}
            />
            I agree to the{' '}
            <a className="text-primary underline underline-offset-4" href="/terms" target="_blank" rel="noreferrer">
              terms and conditions
            </a>
          </label>
        </Card>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <Button className="w-full md:w-[360px]" onClick={handleEstimate}>
          Estimate Now
        </Button>

        <div className="flex gap-3">
          <Button onClick={onPlaceOrder} disabled={!!isPlacing}>
            {isPlacing ? 'Placing…' : 'Pay & Place Order'}
          </Button>
          <Button variant="outline" onClick={onPayLater} disabled={!!isSavingLater}>
            Pay Later
          </Button>
        </div>
      </div>
    </div>
  );
}
