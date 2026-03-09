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
  productCode?: string;
  UI: UISet;
  onEstimate?: (v: {
    design_by: string;
    print_by: string;
    coupon_code?: string;
    product_code?: string;
  }) => Promise<any>;
  onValidateCoupon?: (code: string) => Promise<any | null>;
  onPlaceOrder?: (isCoinMode?: boolean) => void;
  onPayLater?: () => void;
  isPlacing?: boolean;
  isSavingLater?: boolean;
  setFieldValue?: (f: string, v: any) => void;
};

type Coupon = {
  id?: string;
  code: string;
  title?: string;
  percent?: number;
  amount?: number;
};

export default function FinishPayment({
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

  function toNum(v: any): number {
    return Number(String(v ?? '0').replace(/,/g, '')) || 0;
  }

  /** Format float → Indian locale string with 2 decimals */
  function inr(v: any): string {
    return toNum(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
  // ---------------- State ----------------

  const [designBy, setDesignBy] = useState(values.design_by);
  const [printBy, setPrintBy] = useState(values.print_by);
  const [colour, setColour] = useState(values.colour ?? '');

  const [couponText, setCouponText] = useState(values.coupon_code || '');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [validating, setValidating] = useState(false);
  const [couponError,  setCouponError]  = useState<string | null>(null);
  const [showSugg,     setShowSugg]     = useState(false);
  const [estimating,   setEstimating]   = useState(false);
  const [suggestions, setSuggestions] = useState<Coupon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const couponBoxRef = useRef<HTMLDivElement>(null);

  // ---------------- Coin Mode ----------------

  const isCoinMode = designBy === 'Self' && printBy === 'Self';
  const gst18 = toNum(values.gst_18);
  const gst5  = toNum(values.gst_5);
  const availableCoins = toNum(values.customer_available_coins);
  const coinsNeeded = toNum(values.design_coin_use);
  const hasEnoughCoins = availableCoins >= coinsNeeded;

  // ---------------- Effects ----------------

  useEffect(() => {
    setFieldValue?.('item_code', productCode || '');
  }, [productCode]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!couponBoxRef.current) return;
      if (!couponBoxRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };

    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

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

      setSuggestions(
        pool.filter((c) =>
          c.code.toLowerCase().includes(q.toLowerCase())
        )
      );

      setShowSuggestions(true);
    }, 250);

    return () => clearTimeout(t);
  }, [couponText]);

  useEffect(() => {
    setFieldValue?.('coupon_code', coupon?.code ?? couponText ?? '');
  }, [coupon, couponText]);

  // ---------------- Actions ----------------

  const triggerEstimate = async () => {
    if (!onEstimate) return;
    try {
      setEstimating(true);
      await onEstimate({
        design_by:   designBy,
        print_by:    printBy,
        coupon_code: coupon?.code ?? couponText,
        product_code: productCode,
      });
    } finally {
      setEstimating(false);
    }
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
      const amount  = Number(res?.data?.discount_amount     || 0);
      if (!percent && !amount) {
        setCoupon(null);
        setCouponError('Invalid or expired coupon.');
        return;
      }
      setCoupon({
        code,
        percent: percent ? percent / 100 : undefined,
        amount:  amount  || undefined,
        title:   res?.data?.coupon_name || res?.data?.message,
      });
      setShowSugg(false);
      // re-estimate with new coupon
      await triggerEstimate();
    } catch {
      setCoupon(null);
      setCouponError('Could not validate coupon.');
    } finally {
      setValidating(false);
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Finish & Payment
      </h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}

        <div className="space-y-4">
          <Label className="text-primary text-base font-semibold">
            Design & Printing
          </Label>

          <SelectBox
            options={[
              { value: 'Addiwise', label: 'Addiwise' },
              { value: 'Self', label: 'Self' },
            ]}
            label="Design by"
            value={designBy}
            onValueChange={(v: string) => {
              setDesignBy(v);
              setFieldValue?.('design_by', v);
            }}
          />

          <SelectBox
            options={[
              { value: 'Addiwise', label: 'Addiwise' },
              { value: 'Self', label: 'Self' },
            ]}
            label="Print by"
            value={printBy}
            onValueChange={(v: string) => {
              setPrintBy(v);
              setFieldValue?.('print_by', v);
            }}
          />

          {/* Coin Banner */}

          {isCoinMode && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm flex gap-3 ${
                hasEnoughCoins
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              🪙 Required: {coinsNeeded} coins | Available:{' '}
              {availableCoins.toLocaleString('en-IN')}
            </div>
          )}

          <Input
            label="Product Code"
            value={productCode || ''}
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
          />

          {/* Coupon hidden in coin mode */}

          {!isCoinMode && (
            <div ref={couponBoxRef} className="relative">
              <Label>Enter coupon code</Label>

              <div className="flex">
                <Input
                  value={couponText}
                  onChange={(e: any) => {
                    setCouponText(e.target.value);
                    setCoupon(null);
                    setCouponError(null);
                  }}
                />

                <Button onClick={applyCoupon}>
                  {validating ? 'Applying…' : 'Apply'}
                </Button>
              </div>

              {couponError && (
                <div className="text-xs text-red-600 mt-1">
                  {couponError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}

        <Card className="p-5 bg-gradient-to-b from-gray-50 to-white self-start">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-gray-700">
              Payment Summary
            </span>
            <span className="text-primary text-sm font-medium">
              {productCode || '—'}
            </span>
          </div>

          {isCoinMode ? (
            /* ── Coin mode summary ────────────────────────────────────────── */
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Item Price</span>
                <span>₹{inr(values.estimate_price)}</span>
              </li>
              <li className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Coins Required</span>
                <span className="text-amber-700 font-semibold">
                  🪙 {coinsNeeded} coins
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Your Balance</span>
                <span className={hasEnoughCoins ? 'text-emerald-700' : 'text-red-600'}>
                  🪙 {availableCoins.toLocaleString('en-IN')} coins
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">GST</span>
                <span className="text-gray-400 text-xs italic">Waived in coin mode</span>
              </li>
              <li className="flex justify-between pt-2 border-t font-semibold text-base">
                <span>Total</span>
                <span className="text-amber-700">🪙 {coinsNeeded} coins</span>
              </li>
            </ul>
          ) : (
            /* ── Normal mode summary ──────────────────────────────────────── */
            <ul className="text-sm space-y-2">
              {/* Component breakdown */}
              <li className="flex justify-between text-gray-500">
                <span>Design</span>
                <span>₹{inr(values.design_price)}</span>
              </li>
              <li className="flex justify-between text-gray-500">
                <span>Print</span>
                <span>₹{inr(values.print_price)}</span>
              </li>

              {/* Estimate price */}
              <li className="flex justify-between pt-2 border-t">
                <span className="text-gray-700">Estimate Price</span>
                <span className="font-medium">₹{inr(values.estimate_price)}</span>
              </li>

              {/* Standard discount */}
              {toNum(values.item_standard_discount) > 0 && (
                <li className="flex justify-between">
                  <span className="text-gray-600">
                    Standard Discount
                    {values.discount_percent
                      ? ` (${toNum(values.discount_percent).toFixed(1)}%)`
                      : ''}
                  </span>
                  <span className="text-emerald-700">
                    −₹{inr(values.item_standard_discount)}
                  </span>
                </li>
              )}

              {/* Coupon discount */}
              {toNum(values.coupon_discount) > 0 && (
                <li className="flex justify-between">
                  <span className="text-gray-600">
                    Coupon Discount
                    {coupon?.code ? ` (${coupon.code})` : ''}
                  </span>
                  <span className="text-emerald-700">
                    −₹{inr(values.coupon_discount)}
                  </span>
                </li>
              )}

              {/* Discounted price (taxable base) */}
              <li className="flex justify-between pt-2 border-t">
                <span className="text-gray-700">Taxable Amount</span>
                <span className="font-medium">₹{inr(values.discounted_price)}</span>
              </li>

              {/* GST 5% */}
              {gst5 > 0 && (
                <li className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>+₹{inr(values.gst_5)}</span>
                </li>
              )}

              {/* GST 18% */}
              {gst18 > 0 && (
                <li className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>+₹{inr(values.gst_18)}</span>
                </li>
              )}

              {/* Total */}
              <li className="flex justify-between pt-3 border-t text-base font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">₹{inr(values.total_price)}</span>
              </li>
            </ul>
          )}

          {/* Terms */}
          <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!values.agree_terms}
              onChange={(e) => setFieldValue?.('agree_terms', e.target.checked)}
            />
            I agree to the{' '}
            <a
              className="text-primary underline underline-offset-4"
              href="/terms"
              target="_blank"
              rel="noreferrer"
            >
              terms and conditions
            </a>
          </label>
        </Card>
      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-col items-center gap-4">
        <Button
          className="w-full md:w-[360px]"
          onClick={triggerEstimate}
          disabled={estimating || !productCode}
          aria-busy={estimating}
        >
          {estimating ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
              </svg>
              Estimating…
            </span>
          ) : 'Estimate Now'}
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={() => onPlaceOrder?.(isCoinMode)}
            disabled={
              !!isPlacing ||
              !values.agree_terms ||
              (isCoinMode && !hasEnoughCoins)
            }
          >
            {isPlacing ? 'Placing…' : 'Pay & Place Order'}
          </Button>

          <Button
            variant="outline"
            onClick={onPayLater}
            disabled={!!isSavingLater || !values.agree_terms}
          >
            {isSavingLater ? 'Saving…' : 'Pay Later'}
          </Button>
        </div>

        {isCoinMode && !hasEnoughCoins && (
          <p className="text-xs text-red-600">
            Insufficient Addicoins — cannot place order.
          </p>
        )}
      </div>
    </div>
  );
}
