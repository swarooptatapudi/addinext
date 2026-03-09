'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type UISet = {
  Button: any;
  Input: any;
  SelectBox: any;
  Label: any;
  Card: any;
};

type Props = {
  values: any;
  productCode?: string; // single source from parent
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

export default function ASPFinishPayment({
                                        values,
                                        productCode,
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

  // ---------- local state ----------
  const [designBy, setDesignBy] = useState(values.design_by);
  const [printBy, setPrintBy] = useState(values.print_by);
  const [colour, setColour] = useState(values.colour ?? '');
  // coupon lookup / validate
  const [couponText, setCouponText] = useState(values.coupon_code || '');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [validating, setValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // suggestions
  const [suggestions, setSuggestions] = useState<Coupon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const couponBoxRef = useRef<HTMLDivElement>(null);

  // ensure Formik.item_code matches the single productCode
  useEffect(() => {
    setFieldValue?.('item_code', productCode || '');
  }, [productCode, setFieldValue]);

  // close suggestions when clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!couponBoxRef.current) return;
      if (!couponBoxRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // lightweight local suggestions
  useEffect(() => {
    const t = setTimeout(() => {
      const q = couponText.trim();
      if (!q) {
        setSuggestions([]);
        return;
      }
      const pool: Coupon[] = [
        { code: 'CRAN10', title: '10% off', percent: 0.1 },
        { code: 'SAVE500', title: '₹500 off', amount: 500 },
      ];
      setSuggestions(pool.filter((c) => c.code.toLowerCase().includes(q.toLowerCase())));
      setShowSuggestions(true);
    }, 250);
    return () => clearTimeout(t);
  }, [couponText]);

  // push coupon code back to form
  useEffect(() => {
    setFieldValue?.('coupon_code', coupon?.code ?? couponText ?? '');
  }, [coupon, couponText, setFieldValue]);


  // --- actions ---
  const handleEstimate = async () => {
    if (!onEstimate) return;

    await onEstimate({
      design_by: designBy,
      print_by: printBy,
      coupon_code: couponText,
      product_code: productCode,
    });
  };



  const applyCoupon = async () => {
    if (!onValidateCoupon) return;
    const code = couponText.trim();
    if (!code) return;

    try {
      setValidating(true);
      setCouponError(null);
      const res = await onValidateCoupon(code);
      const percent = Number(res?.data?.discount_percentage || 0);
      const amount = Number(res?.data?.discount_amount || 0);
      if (!percent && !amount) {
        setCoupon(null);
        setCouponError('Invalid or expired coupon.');
        return;
      }
      setCoupon({
        code,
        percent: percent ? percent / 100 : undefined,
        amount: amount || undefined,
        title: res?.data?.coupon_name || res?.data?.message,
      });
      setShowSuggestions(false);
    } catch {
      setCoupon(null);
      setCouponError('Could not validate coupon.');
    } finally {
      setValidating(false);
    }
  };
  const toNum = (v: any) =>
    Number(String(v || '0').replace(/,/g, '')) || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Finish & Payment</h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Design & Printing */}
        <div className="space-y-4">
          <Label className="text-primary text-base font-semibold">Design &amp; Printing</Label>

          <SelectBox
            options={[
              { value: 'Addiwise', label: 'Addiwise' },
              { value: 'Clinic', label: 'Clinic' },
            ]}
            label="Design by :"
            value={designBy}
            onValueChange={(v: string) => {
              setDesignBy(v);
              setFieldValue?.('design_by', v);
            }}
            inVaild={false}
            required
            error={undefined}
            placeholder="Select"
          />

          <SelectBox
            options={[
              { value: 'Addiwise', label: 'Addiwise' },
              { value: 'Clinic', label: 'Clinic' },
            ]}
            label="Print by :"
            value={printBy}
            onValueChange={(v: string) => {
              setPrintBy(v);
              setFieldValue?.('print_by', v);
            }}
            inVaild={false}
            required
            error={undefined}
            placeholder="Select"
          />

          {/* Product Code (read-only; from parent) */}
          <Input
            label="Product Code"
            value={productCode || 'CH-?-?'}
            readOnly
            className="font-mono"
          />

          <SelectBox
            options={[
              { value: 'White', label: 'White' },
              { value: 'Grey', label: 'Grey' },
              { value: 'Black', label: 'Black' },
            ]}
            label="Colour"
            value={colour}
            onValueChange={(v: string) => {
              setColour(v);
              setFieldValue?.('colour', v);
            }}
            inVaild={false}
            error={undefined}
            placeholder="Select"
          />

          {/* Coupon lookup + validate */}
          <div ref={couponBoxRef} className="relative">
            <Label className="mb-1 block">Enter coupon code</Label>

            <div className="flex">
              <Input
                placeholder="Enter coupon code"
                value={couponText}
                onChange={(e: any) => {
                  setCouponText(e.target.value);
                  setCoupon(null);
                  setCouponError(null);
                }}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                className="h-10 rounded-r-none"
              />

              <Button
                type="button"
                onClick={applyCoupon}
                disabled={validating || !couponText.trim()}
                aria-busy={validating}
                className="h-10 rounded-l-none -ml-px px-4"
                variant="outline"
              >
                {validating ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                    </svg>
                    Applying…
                  </span>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
                {suggestions.map((s) => (
                  <div
                    key={s.code}
                    className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer"
                    onClick={() => {
                      setCouponText(s.code);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium">{s.code}</div>
                    <div className="text-xs text-gray-500">
                      {s.title ||
                        (s.percent != null ? `${Math.round(s.percent * 100)}% off` : s.amount ? `₹${s.amount} off` : '')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {couponError ? (
              <div className="text-xs text-red-600 mt-1">{couponError}</div>
            ) : coupon ? (
              <div className="text-xs text-emerald-700 mt-1">
                Applied {coupon.title || coupon.code}{' '}
                {coupon.percent != null
                  ? `(${Math.round(coupon.percent * 100)}% off)`
                  : coupon.amount
                    ? `(₹${coupon.amount} off)`
                    : ''}
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT — Payment Summary */}
        <Card className="p-5 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold text-gray-700">PAYMENT SUMMARY</div>
            {!!productCode && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
        {productCode}
      </span>
            )}
          </div>

          <ul className="text-sm space-y-2">
            <li className="flex justify-between">
              <span>Design</span>
              <span>₹{toNum(values.design_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </li>

            <li className="flex justify-between">
              <span>Print</span>
              <span>₹{toNum(values.print_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </li>

            <li className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Estimate Price</span>
              <span>₹{toNum(values.estimate_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </li>

            <li className="flex justify-between">
              <span className="text-gray-600">Standard Discount</span>
              <span className="text-emerald-700">
        −₹{toNum(values.item_standard_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
            </li>

            <li className="flex justify-between">
              <span className="text-gray-600">Additional Discount</span>
              <span className="text-emerald-700">
        −₹{toNum(values.additional_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
            </li>

            {toNum(values.gst_5) > 0 && (
              <li className="flex justify-between">
                <span className="text-gray-600">GST (5%)</span>
                <span>+₹{toNum(values.gst_5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </li>
            )}

            {toNum(values.gst_18) > 0 && (
              <li className="flex justify-between">
                <span className="text-gray-600">GST (5%)</span>
                <span>+₹{toNum(values.gst_18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </li>
            )}
          </ul>

          <div className="mt-3 pt-3 border-t flex justify-between text-base font-semibold">
            <span>Total Amount</span>
            <span className="text-primary">
      ₹{toNum(values.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </span>
          </div>
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
        <Button
          type="button"
          className="w-full md:w-[360px]"
          onClick={handleEstimate}
          disabled={!values.agree_terms}
        >
          Estimate Now
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="default"
            onClick={onPlaceOrder}
            disabled={!values.agree_terms || !!isPlacing}
            aria-busy={!!isPlacing}
          >
            {isPlacing ? 'Placing…' : 'Pay & Place Order'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onPayLater}
            disabled={!values.agree_terms || !!isSavingLater}
            aria-busy={!!isSavingLater}
          >
          {isSavingLater ? 'Saving…' : 'Pay Later'}
          </Button>
        </div>
      </div>

      {/* Hidden (still single source) */}
      <div className="sr-only">{productCode}</div>
    </div>
  );
}
