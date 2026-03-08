'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGetKafoProductCodesMutation } from '@/rtk-query/apis/products';

// ─── Types ───────────────────────────────────────────────────────────────────

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
    item_code?: string;
  }) => Promise<void>;
  onValidateCoupon?: (code: string) => Promise<any | null>;
  onPlaceOrder?: () => void;
  onPayLater?: () => void;
  isPlacing?: boolean;
  isSavingLater?: boolean;
  setFieldValue?: (f: string, v: any) => void;
};

type Coupon = {
  code: string;
  title?: string;
  percent?: number;
  amount?: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse Indian-formatted number string → float */
function toNum(v: any): number {
  return Number(String(v ?? '0').replace(/,/g, '')) || 0;
}

/** Format float → Indian locale string with 2 decimals */
function inr(v: any): string {
  return toNum(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

const DESIGN_PRINT_OPTIONS = [
  { value: 'Addiwise', label: 'Addiwise' },
  { value: 'Self',   label: 'Self' },
];

// ─── Component ────────────────────────────────────────────────────────────────

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

  // ── Product codes (backend) ──────────────────────────────────────────────
  const [getKafoProductCodes, { data: productData, isLoading: loadingCodes }] =
    useGetKafoProductCodesMutation();

  useEffect(() => {
    if (!values.type) return;
    getKafoProductCodes({ product_type: values.type });
  }, [values.type, getKafoProductCodes]);

  const productOptions = useMemo(() => {
    return (
      productData?.message?.data?.map((item: any) => ({
        value: item.item_code,
        label: `${item.item_code} — ₹${toNum(item.valuation_rate).toLocaleString('en-IN')}`,
      })) ?? []
    );
  }, [productData]);

  // Auto-select first product
  useEffect(() => {
    if (!values.item_code && productOptions.length > 0) {
      setFieldValue?.('item_code', productOptions[0].value);
    }
  }, [productOptions, values.item_code, setFieldValue]);

  // ── Local state ──────────────────────────────────────────────────────────
  const [designBy, setDesignBy] = useState<string>(values.design_by ?? 'Addiwise');
  const [printBy,  setPrintBy]  = useState<string>(values.print_by  ?? 'Addiwise');
  const [colour,   setColour]   = useState<string>(values.colour    ?? '');

  const [couponText,   setCouponText]   = useState<string>(values.coupon_code ?? '');
  const [coupon,       setCoupon]       = useState<Coupon | null>(null);
  const [validating,   setValidating]   = useState(false);
  const [couponError,  setCouponError]  = useState<string | null>(null);
  const [suggestions,  setSuggestions]  = useState<Coupon[]>([]);
  const [showSugg,     setShowSugg]     = useState(false);
  const [estimating,   setEstimating]   = useState(false);

  const couponRef = useRef<HTMLDivElement>(null);

  // Coin mode: both clinic (self+self)
  const isCoinMode = designBy === 'Self' && printBy === 'Self';

  // ── Sync coupon code to form ─────────────────────────────────────────────
  useEffect(() => {
    setFieldValue?.('coupon_code', coupon?.code ?? couponText ?? '');
  }, [coupon, couponText]);

  // ── Sync design_by / print_by to form ────────────────────────────────────
  useEffect(() => { setFieldValue?.('design_by', designBy); }, [designBy]);
  useEffect(() => { setFieldValue?.('print_by',  printBy);  }, [printBy]);

  // ── Auto-estimate when item_code / design_by / print_by changes ──────────
  useEffect(() => {
    if (!values.item_code || !onEstimate) return;
    triggerEstimate();
  }, [values.item_code, designBy, printBy]);

  // ── Coupon suggestions (local pool) ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = couponText.trim();
      if (!q) { setSuggestions([]); return; }
      const pool: Coupon[] = [
        { code: 'KAFO10',  title: '10% off',   percent: 0.1  },
        { code: 'SAVE500', title: '₹500 off',  amount:  500  },
      ];
      setSuggestions(pool.filter((c) => c.code.toLowerCase().includes(q.toLowerCase())));
      setShowSugg(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [couponText]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!couponRef.current?.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const triggerEstimate = async () => {
    if (!onEstimate) return;
    try {
      setEstimating(true);
      await onEstimate({
        design_by:   designBy,
        print_by:    printBy,
        coupon_code: coupon?.code ?? couponText,
        item_code:   values.item_code,
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

  // ── Derived display values (all from backend response via values) ─────────
  const gst18 = toNum(values.gst_18);
  const gst5  = toNum(values.gst_5);

  // ── Coin mode info ────────────────────────────────────────────────────────
  const availableCoins = toNum(values.customer_available_coins);
  const coinsNeeded    = toNum(values.design_coin_use);
  const hasEnoughCoins = availableCoins >= coinsNeeded;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Finish & Payment
      </h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Label className="text-primary text-base font-semibold">
            Design & Printing
          </Label>

          {/* Design by */}
          <SelectBox
            label="Design by"
            value={designBy}
            options={DESIGN_PRINT_OPTIONS}
            onValueChange={(v: string) => setDesignBy(v)}
            required
          />

          {/* Print by */}
          <SelectBox
            label="Print by"
            value={printBy}
            options={DESIGN_PRINT_OPTIONS}
            onValueChange={(v: string) => setPrintBy(v)}
            required
          />

          {/* Coin mode banner */}
          {isCoinMode && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${
                hasEnoughCoins
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-red-300 bg-red-50 text-red-700'
              }`}
            >
              <span className="text-xl leading-none">🪙</span>
              <div>
                <p className="font-semibold">
                  Addicoin Mode — no GST charged
                </p>
                <p className="mt-0.5">
                  Required: <strong>{coinsNeeded} coins</strong> &nbsp;|&nbsp;
                  Available: <strong>{availableCoins.toLocaleString('en-IN')} coins</strong>
                </p>
                {!hasEnoughCoins && (
                  <p className="mt-1 font-medium">
                    ⚠ Insufficient Addicoins to place this order.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Product code */}
          <SelectBox
            label="Product Code"
            value={values.item_code}
            options={productOptions}
            isLoading={loadingCodes}
            required
            placeholder="Select product code"
            onValueChange={(v: string) => setFieldValue?.('item_code', v)}
          />

          {/* Colour */}
          <SelectBox
            label="Colour"
            value={colour}
            options={[
              { value: 'White', label: 'White' },
              { value: 'Grey',  label: 'Grey'  },
              { value: 'Black', label: 'Black' },
            ]}
            onValueChange={(v: string) => {
              setColour(v);
              setFieldValue?.('colour', v);
            }}
          />

          {/* Coupon (hidden in coin mode) */}
          {!isCoinMode && (
            <div ref={couponRef} className="relative">
              <Label className="mb-1 block">Coupon code</Label>
              <div className="flex">
                <Input
                  placeholder="Enter coupon code"
                  value={couponText}
                  onChange={(e: any) => {
                    setCouponText(e.target.value);
                    setCoupon(null);
                    setCouponError(null);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
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
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                      </svg>
                      Applying…
                    </span>
                  ) : 'Apply'}
                </Button>
              </div>

              {/* Suggestions dropdown */}
              {showSugg && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {suggestions.map((s) => (
                    <div
                      key={s.code}
                      className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer"
                      onClick={() => {
                        setCouponText(s.code);
                        setShowSugg(false);
                      }}
                    >
                      <div className="font-medium">{s.code}</div>
                      <div className="text-xs text-gray-500">
                        {s.title ||
                          (s.percent != null
                            ? `${Math.round(s.percent * 100)}% off`
                            : s.amount
                              ? `₹${s.amount} off`
                              : '')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {couponError ? (
                <p className="text-xs text-red-600 mt-1">{couponError}</p>
              ) : coupon ? (
                <p className="text-xs text-emerald-700 mt-1">
                  ✓ {coupon.title || coupon.code}{' '}
                  {coupon.percent != null
                    ? `(${Math.round(coupon.percent * 100)}% off)`
                    : coupon.amount
                      ? `(₹${coupon.amount} off)`
                      : ''}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — Payment Summary ─────────────────────────────── */}
        <Card className="p-5 bg-gradient-to-b from-gray-50 to-white self-start">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-gray-700">
              Payment Summary
            </span>
            <span className="text-primary text-sm font-medium">
              {values.item_code || '—'}
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
                  <span className="text-gray-600">GST (18%)</span>
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

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <Button
          className="w-full md:w-[360px]"
          onClick={triggerEstimate}
          disabled={estimating || !values.item_code}
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
            onClick={onPlaceOrder}
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



// 'use client';
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useGetKafoProductCodesMutation } from '@/rtk-query/apis/products';
//
// type UISet = {
//   Button: any;
//   Input: any;
//   SelectBox: any;
//   Label: any;
//   Card: any;
// };
//
// type Props = {
//   values: any;
//   UI: UISet;
//   onEstimate?: (v: {
//     design_by: string;
//     print_by: string;
//     coupon_code?: string;
//     product_code?: string;
//   }) => Promise<{ design: number; print: number; stdDiscPct?: number; gstRate?: number } | void>;
//   onValidateCoupon?: (code: string) => Promise<any | null>;
//   onPlaceOrder?: () => void;
//   onPayLater?: () => void;
//   isPlacing?: boolean;
//   isSavingLater?: boolean;
//   setFieldValue?: (f: string, v: any) => void;
// };
//
// type Coupon = { id?: string; code: string; title?: string; percent?: number; amount?: number };
//
// export default function FinishPayment({
//                                         values,
//                                         UI,
//                                         onEstimate,
//                                         onValidateCoupon,
//                                         onPlaceOrder,
//                                         onPayLater,
//                                         isPlacing,
//                                         isSavingLater,
//                                         setFieldValue,
//                                       }: Props) {
//   const { Button, Input, SelectBox, Label, Card } = UI;
//
//   /* ======================================================
//      PRODUCT CODE (BACKEND – POST / MUTATION)
//   ====================================================== */
//
//   const [getKafoProductCodes, { data, isLoading }] =
//     useGetKafoProductCodesMutation();
//
//   // fetch product codes when device type is known
//   useEffect(() => {
//     if (!values.type) return;
//
//     getKafoProductCodes({
//       product_type: values.type, // KAFO | HKAFO
//     });
//   }, [values.type, getKafoProductCodes]);
//
//   const productOptions = useMemo(() => {
//     return (
//       data?.message?.data?.map((item: any) => ({
//         value: item.item_code,
//         label: `${item.item_code} — ₹${item.valuation_rate}`,
//       })) || []
//     );
//   }, [data]);
//
//   // auto-select first backend product
//   useEffect(() => {
//     if (!values.item_code && productOptions.length > 0) {
//       setFieldValue?.('item_code', productOptions[0].value);
//     }
//   }, [productOptions, values.item_code, setFieldValue]);
//
//   /* ======================================================
//      LOCAL STATE
//   ====================================================== */
//
//   const [designBy, setDesignBy] = useState(values.design_by);
//   const [printBy, setPrintBy] = useState(values.print_by);
//   const [colour, setColour] = useState(values.colour ?? '');
//
//   const [designPrice, setDesignPrice] = useState<number>(Number(values.design_price || 0));
//   const [printPrice, setPrintPrice] = useState<number>(Number(values.print_price || 0));
//   const [stdPct, setStdPct] = useState<number>(Number(values.standard_discount_pct || 0));
//   const [gstRate, setGstRate] = useState<number>(Number(values.gst_rate ?? 0.05));
//
//   const [couponText, setCouponText] = useState(values.coupon_code || '');
//   const [coupon, setCoupon] = useState<Coupon | null>(null);
//   const [validating, setValidating] = useState(false);
//   const [couponError, setCouponError] = useState<string | null>(null);
//   const [suggestions, setSuggestions] = useState<Coupon[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//
//   const couponBoxRef = useRef<HTMLDivElement>(null);
//
//
//   useEffect(() => {
//     setFieldValue?.('coupon_code', coupon?.code ?? couponText ?? '');
//   }, [coupon, couponText, setFieldValue]);
//
//   /* ======================================================
//      SUMMARY
//   ====================================================== */
//
//   const summary = useMemo(() => {
//     const subtotal = designPrice + printPrice;
//     const std = subtotal * stdPct;
//     const base = subtotal - std;
//
//     const couponDisc =
//       coupon?.percent != null
//         ? base * coupon.percent
//         : Math.min(base, coupon?.amount || 0);
//
//     const taxable = Math.max(0, base - couponDisc);
//     const gst = taxable * gstRate;
//
//     return {
//       subtotal,
//       std,
//       couponDisc,
//       gst,
//       total: taxable + gst,
//     };
//   }, [designPrice, printPrice, stdPct, coupon, gstRate]);
//
//   useEffect(() => {
//     const onDoc = (e: MouseEvent) => {
//       if (!couponBoxRef.current) return;
//       if (!couponBoxRef.current.contains(e.target as Node)) setShowSuggestions(false);
//     };
//     document.addEventListener('mousedown', onDoc);
//     return () => document.removeEventListener('mousedown', onDoc);
//   }, []);
//
//   // lightweight local suggestions
//   useEffect(() => {
//     const t = setTimeout(() => {
//       const q = couponText.trim();
//       if (!q) {
//         setSuggestions([]);
//         return;
//       }
//       const pool: Coupon[] = [
//         { code: 'CRAN10', title: '10% off', percent: 0.1 },
//         { code: 'SAVE500', title: '₹500 off', amount: 500 },
//       ];
//       setSuggestions(pool.filter((c) => c.code.toLowerCase().includes(q.toLowerCase())));
//       setShowSuggestions(true);
//     }, 250);
//     return () => clearTimeout(t);
//   }, [couponText]);
//
//   // push coupon code back to form
//   useEffect(() => {
//     setFieldValue?.('coupon_code', coupon?.code ?? couponText ?? '');
//   }, [coupon, couponText, setFieldValue]);
//
//
//   // --- actions ---
//   const handleEstimate = async () => {
//     if (!onEstimate) return;
//
//     await onEstimate({
//       design_by: designBy,
//       print_by: printBy,
//       coupon_code: couponText,
//       product_code: values.item_code,
//     });
//   };
//
//
//
//   const applyCoupon = async () => {
//     if (!onValidateCoupon) return;
//     const code = couponText.trim();
//     if (!code) return;
//
//     try {
//       setValidating(true);
//       setCouponError(null);
//       const res = await onValidateCoupon(code);
//       const percent = Number(res?.data?.discount_percentage || 0);
//       const amount = Number(res?.data?.discount_amount || 0);
//       if (!percent && !amount) {
//         setCoupon(null);
//         setCouponError('Invalid or expired coupon.');
//         return;
//       }
//       setCoupon({
//         code,
//         percent: percent ? percent / 100 : undefined,
//         amount: amount || undefined,
//         title: res?.data?.coupon_name || res?.data?.message,
//       });
//       setShowSuggestions(false);
//     } catch {
//       setCoupon(null);
//       setCouponError('Could not validate coupon.');
//     } finally {
//       setValidating(false);
//     }
//   };
//   const toNum = (v: any) =>
//     Number(String(v || '0').replace(/,/g, '')) || 0;
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//       <h2 className="text-primary text-lg font-semibold border-b pb-2">
//         Finish & Payment
//       </h2>
//
//       <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* LEFT */}
//         <div className="space-y-4">
//           <Label className="text-primary text-base font-semibold">
//             Design & Printing
//           </Label>
//
//           <SelectBox
//             label="Design by"
//             value={designBy}
//             options={[
//               { value: 'Addiwise', label: 'Addiwise' }
//             ]}
//             onValueChange={(v: string) => {
//               setDesignBy(v);
//               setFieldValue?.('design_by', v);
//             }}
//             required
//             disabled
//           />
//
//           <SelectBox
//             label="Print by"
//             value={printBy}
//             options={[
//               { value: 'Addiwise', label: 'Addiwise' }
//             ]}
//             onValueChange={(v: string) => {
//               setPrintBy(v);
//               setFieldValue?.('print_by', v);
//             }}
//             required
//             disabled
//           />
//
//           {/* ✅ PRODUCT CODE DROPDOWN */}
//           <SelectBox
//             label="Product Code"
//             value={values.item_code}
//             options={productOptions}
//             isLoading={isLoading}
//             required
//             placeholder="Select product code"
//             onValueChange={(v: string) => setFieldValue?.('item_code', v)}
//           />
//
//           <SelectBox
//             label="Colour"
//             value={colour}
//             options={[
//               { value: 'White', label: 'White' },
//               { value: 'Grey', label: 'Grey' },
//               { value: 'Black', label: 'Black' },
//             ]}
//             onValueChange={(v: string) => {
//               setColour(v);
//               setFieldValue?.('colour', v);
//             }}
//           />
//
//           {/* Coupon */}
//           <div ref={couponBoxRef} className="relative">
//             <Label className="mb-1 block">Enter coupon code</Label>
//
//             <div className="flex">
//               <Input
//                 placeholder="Enter coupon code"
//                 value={couponText}
//                 onChange={(e: any) => {
//                   setCouponText(e.target.value);
//                   setCoupon(null);
//                   setCouponError(null);
//                 }}
//                 onFocus={() => setShowSuggestions(suggestions.length > 0)}
//                 className="h-10 rounded-r-none"
//               />
//
//               <Button
//                 type="button"
//                 onClick={applyCoupon}
//                 disabled={validating || !couponText.trim()}
//                 aria-busy={validating}
//                 className="h-10 rounded-l-none -ml-px px-4"
//                 variant="outline"
//               >
//                 {validating ? (
//                   <span className="inline-flex items-center gap-2">
//                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
//                     </svg>
//                     Applying…
//                   </span>
//                 ) : (
//                   'Apply'
//                 )}
//               </Button>
//             </div>
//
//             {showSuggestions && suggestions.length > 0 && (
//               <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
//                 {suggestions.map((s) => (
//                   <div
//                     key={s.code}
//                     className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer"
//                     onClick={() => {
//                       setCouponText(s.code);
//                       setShowSuggestions(false);
//                     }}
//                   >
//                     <div className="font-medium">{s.code}</div>
//                     <div className="text-xs text-gray-500">
//                       {s.title ||
//                         (s.percent != null ? `${Math.round(s.percent * 100)}% off` : s.amount ? `₹${s.amount} off` : '')}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//
//             {couponError ? (
//               <div className="text-xs text-red-600 mt-1">{couponError}</div>
//             ) : coupon ? (
//               <div className="text-xs text-emerald-700 mt-1">
//                 Applied {coupon.title || coupon.code}{' '}
//                 {coupon.percent != null
//                   ? `(${Math.round(coupon.percent * 100)}% off)`
//                   : coupon.amount
//                     ? `(₹${coupon.amount} off)`
//                     : ''}
//               </div>
//             ) : null}
//           </div>
//         </div>
//
//         {/* RIGHT */}
//         <Card className="p-5 bg-gradient-to-b from-gray-50 to-white">
//           <div className="flex items-center justify-between mb-1">
//               <span>Payment Summary</span>
//               <span className="text-primary">{values.item_code}</span>
//           </div>
//
//           <ul className="text-sm space-y-2">
//             <li className="flex justify-between">
//               <span>Design</span>
//               <span>₹{toNum(values.design_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//             </li>
//
//             <li className="flex justify-between">
//               <span>Print</span>
//               <span>₹{toNum(values.print_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//             </li>
//
//             <li className="flex justify-between pt-2 border-t">
//               <span className="text-gray-600">Estimate Price</span>
//               <span>₹{toNum(values.estimate_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//             </li>
//
//             <li className="flex justify-between">
//               <span className="text-gray-600">Standard Discount</span>
//               <span className="text-emerald-700">
//         −₹{toNum(values.item_standard_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//       </span>
//             </li>
//
//             <li className="flex justify-between">
//               <span className="text-gray-600">Additional Discount</span>
//               <span className="text-emerald-700">
//         −₹{toNum(values.additional_discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//       </span>
//             </li>
//             <li className="flex justify-between pt-2 border-t">
//               <span className="text-gray-600">GST (5%)</span>
//               <span>₹{toNum(values.gst_5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//             </li>
//             {/*{toNum(values.gst_18) > 0 && (
//               <li className="flex justify-between">
//                 <span className="text-gray-600">GST (18%)</span>
//                 <span>+₹{toNum(values.gst_18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//               </li>
//             )}*/}
//           </ul>
//
//           <div className="mt-3 pt-3 border-t flex justify-between text-base font-semibold">
//             <span>Total Amount</span>
//             <span className="text-primary">
//       ₹{toNum(values.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//     </span>
//           </div>
//           <label className="mt-4 flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               className="accent-primary"
//               checked={!!values.agree_terms}
//               onChange={(e) => setFieldValue?.('agree_terms', e.target.checked)}
//             />
//             I agree to the{' '}
//             <a className="text-primary underline underline-offset-4" href="/terms" target="_blank" rel="noreferrer">
//               terms and conditions
//             </a>
//           </label>
//         </Card>
//       </div>
//
//       {/* ACTIONS */}
//       <div className="mt-6 flex flex-col items-center gap-4">
//         <Button className="w-full md:w-[360px]" onClick={handleEstimate}>
//           Estimate Now
//         </Button>
//
//         <div className="flex gap-3">
//           <Button onClick={onPlaceOrder} disabled={!!isPlacing}>
//             {isPlacing ? 'Placing…' : 'Pay & Place Order'}
//           </Button>
//           <Button variant="outline" onClick={onPayLater} disabled={!!isSavingLater}>
//             Pay Later
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
