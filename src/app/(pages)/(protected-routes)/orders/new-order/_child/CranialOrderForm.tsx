'use client';
import React, { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

import {
  calculateCephalicRatio,
  calculateCVAI,
  makeProductCode,
  type SeverityCode,
  type ConditionCode,
} from '@/lib/metrics';

import PatientDetails from './steps/PatientDetails';
import Measurement from './steps/Measurement';
import Computation from './steps/Computation';
import Assessment from './steps/Assessment';
import SummaryStep from './steps/Summary';
import ScanUpload from './steps/ScanUpload';
import FinishPayment from './steps/FinishPayment';

import {
  useCreateCranialOrderMutation,
  useValidateCouponMutation,
} from '@/rtk-query/apis/orders';

// ✅ import the client-side estimator + baseQuery
import baseQueryWithReauth from '@/rtk-query/base/baseQueryReAuth';
import { estimateOrderClientSide } from '@/uttils/getEstimate';

// ---------------- Types ----------------
type FormValues = {
  sales_order_id?: string;
  item_code?: string; // synced from computed productCode (not user-entered)
  customer?: string;

  // Patient
  first_name?: string;
  last_name?: string;
  parent_name?: string;
  parent_mobile?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: string;
  weight_kg?: string;
  email?: string;
  clinic_name?: string;
  consultant?: string;

  // Measurements
  ap?: string; ml?: string; da?: string; db?: string; hc?: string; tw?: string;

  // Derived (display)
  cr?: number; cvai?: number;

  // Clinical
  occipital_area?: string;
  parietal_area?: string;
  frontal_area?: string;
  ear_alignment?: string;

  // Diagnosis (may be short codes or labels)
  positional?: string; // 'P'|'B'|'SC'|'ASB'|'ASYS' OR full label
  severity?: 'L'|'M'|'S'|'' | 'Light' | 'Moderate' | 'Severe';
  torticollis?: string;

  // Surgical & others
  post_surgical?: string; // CSV
  suture_type_surgical_diagnoses_only?: string; // CSV
  date_of_surgery?: string;
  surgical_complications?: string;
  other_diagnosis_and_syndromes?: string;

  // Files & remarks
  scan_file?: File | null;
  extra_files?: File[];
  patient_remarks?: string;
  other_remarks?: string;
  scan_gdrive_link?: string;

  // Pricing / payments
  design_by?: string;
  print_by?: string;
  colour?: string;
  thickness_3d_mm?: string;
  coupon_code?: string;
  coupon_id?: string;
  agree_terms?: boolean;

  design_price?: number;
  print_price?: number;
  standard_discount_pct?: number; // 0–1
  gst_rate?: number;              // 0–1 (e.g., 0.05)
};
// ---------------- Validation ----------------
const Schema = Yup.object({
  first_name: Yup.string().required('Required'),
  date_of_birth: Yup.string().required('Required'),
  ap: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  ml: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  da: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  db: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  hc: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
});

// ---------------- Steps ----------------
const steps = [
  { key: 'patient', label: 'Basic Details' },
  { key: 'measurement', label: 'Measurement' },
  { key: 'computation', label: 'Computation' },
  { key: 'assessment', label: 'Clinical Assessment' },
  { key: 'summary', label: 'Summary' },
  { key: 'scan', label: 'Scan & Upload' },
  { key: 'finish', label: 'Finish & Payment' }
] as const;

// ---------------- Helpers ----------------
const toNum = (v?: string) => (v === '' || v == null ? undefined : Number(v));
const up = (s?: string) => (s || '').trim().toUpperCase();

const normalizeCondition = (pos?: string): ConditionCode | undefined => {
  const p = up(pos);
  if (p === 'P' || p === 'PLAGIOCEPHALY') return 'P';
  if (p === 'B' || p === 'BRACHYCEPHALY') return 'B';
  if (p === 'SC' || p === 'SCAPHOCEPHALY') return 'SC';
  if (p === 'ASB' || p === 'ASYMMETRICAL BRACHYCEPHALY (COMBO)') return 'ASB';
  if (p === 'ASYS' || p === 'ASYMMETRICAL SCAPHOCEPHALY') return 'ASYS';
  return undefined;
};

const normalizeSeverity = (sev?: string, cvai?: number): SeverityCode | undefined => {
  const s = up(sev);
  if (s === 'L' || s === 'LIGHT') return 'L';
  if (s === 'M' || s === 'MODERATE') return 'M';
  if (s === 'S' || s === 'SEVERE') return 'S';
  if (typeof cvai === 'number' && Number.isFinite(cvai)) {
    if (cvai < 3.5) return 'L';
    if (cvai < 7.0) return 'M';
    return 'S';
  }
  return undefined;
};

// keep every key by sending nulls, never undefined (JSON.stringify drops undefined)
const toNumOrNull = (v?: string) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const orEmpty = (v?: string) => (v == null ? '' : v);

// Backend expects labels for positional
const POS_LABEL_BY_CODE: Record<string, string> = {
  P: 'Plagiocephaly',
  B: 'Brachycephaly',
  SC: 'Scaphocephaly',
  ASB: 'Asymmetrical Brachycephaly (Combo)',
  ASYS: 'Asymmetrical Scaphocephaly',
};
const toPositionalLabel = (pos?: string) => {
  const raw = (pos || '').trim();
  const code = raw.toUpperCase();
  return POS_LABEL_BY_CODE[code] || raw;
};

// Build payload that matches CranialHelmetOrder shape; use computed productCode
function toApiOrder(values: FormValues, productCode: string) {
  const ap = toNumOrNull(values.ap);
  const ml = toNumOrNull(values.ml);
  const da = toNumOrNull(values.da);
  const db = toNumOrNull(values.db);

  let cr: number | null = null;
  let cvai: number | null = null;
  try { if (ap && ml) cr = calculateCephalicRatio(ap, ml).value; } catch {}
  try { if (da && db && da >= db) cvai = calculateCVAI(da, db).valueShorterDenominator; } catch {}

  return {
    // ---- Basic details / header ----
    basic_details_section: null,
    sales_order_id: orEmpty(values.sales_order_id),
    item_code: productCode || '',
    column_break_jqdc: null,
    customer: orEmpty(values.customer),

    // ---- Patient info ----
    patient_information_section: null,
    first_name: orEmpty(values.first_name),
    last_name: orEmpty(values.last_name),
    //parent_name: orEmpty(values.parent_name),
    parent_mobile: orEmpty(values.parent_mobile),
    column_break_mxvu: null,
    date_of_birth: values.date_of_birth || null,
    weight_kg: toNumOrNull(values.weight_kg),
    email: orEmpty(values.email),
    clinic_name: orEmpty(values.clinic_name),

    // ---- Measurement section ----
    measurement_section_section: null,
    measurement_of_length_a_to_p__mm: ap,
    head_circumference_mm: toNumOrNull(values.hc),
    temple_width_mm: toNumOrNull(values.tw),
    column_break_bzvk: null,
    measurement_of_width_m_to_l_mm: ml,
    cr,
    cvai,

    // ---- Clinical section ----
    clinical_section_section: null,
    occipital_area: orEmpty(values.occipital_area),
    parietal_area: orEmpty(values.parietal_area),
    column_break_zgts: null,
    frontal_area: orEmpty(values.frontal_area),
    ear_alignment: orEmpty(values.ear_alignment),

    // ---- Clinical diagnosis ----
    clinical_diagnosis_section_section: null,
    positional: toPositionalLabel(values.positional),
    torticollis: orEmpty(values.torticollis),
    column_break_lngl: null,
    post_surgical: orEmpty(values.post_surgical),
    suture_type_surgical_diagnoses_only: orEmpty(values.suture_type_surgical_diagnoses_only),

    // ---- Surgery details ----
    surgery_details_section: null,
    date_of_surgery: values.date_of_surgery || null,
    surgical_complications: orEmpty(values.surgical_complications),
    column_break_scqs: null,
    other_diagnosis_and_syndromes: orEmpty(values.other_diagnosis_and_syndromes),
  };
}

// ---------------- Component ----------------
type CranialOrderFormProps = { item_type: string };

export default function CranialOrderForm({ item_type }: CranialOrderFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState<null | 'place' | 'later'>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [createCranialOrder] = useCreateCranialOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();

  const pill = (i: number) =>
    `text-xs border rounded-full px-3 py-1 ${i === activeStep ? 'bg-primary text-white border-primary' : 'text-violet-300 border-violet-400'}`;

  const initialValues: FormValues = useMemo(() => ({
    first_name: '', last_name: '', parent_name: '', parent_mobile: '',
    date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
    email: '', clinic_name: '', consultant: '',

    item_code: item_type, // synced later from computed productCode
    sales_order_id: '',
    customer: '',

    ap: '', ml: '', da: '', db: '', hc: '', tw: '',
    cr: undefined, cvai: undefined,

    occipital_area: '', parietal_area: '', frontal_area: '', ear_alignment: '',
    positional: '', severity: '', torticollis: '',
    post_surgical: '', suture_type_surgical_diagnoses_only: '',
    date_of_surgery: '', surgical_complications: '',
    other_diagnosis_and_syndromes: '',

    scan_file: null, extra_files: [],
    patient_remarks: '', other_remarks: '',
    scan_gdrive_link: '',

    design_by: 'Addiwise', print_by: 'Addiwise', colour: '', thickness_3d_mm: '3.5',
    coupon_code: '', coupon_id: '', agree_terms: false,

    design_price: 0, print_price: 0, standard_discount_pct: 0, gst_rate: 0.05,
  }), [item_type]);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 bg-primary text-white px-4 py-3">
        <div className="font-semibold text-center">
          Step {activeStep + 1} of {steps.length} — {steps[activeStep].label}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {steps.map((s, i) => (
            <button key={s.key} type="button" className={pill(i)} onClick={() => setActiveStep(i)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Formik
        key={formResetKey}                 // << force remount of the entire form
        initialValues={initialValues}
        validationSchema={Schema}
        onSubmit={() => {}}
        enableReinitialize
        validateOnChange
        validateOnBlur
      >
        {({ values, errors, touched, setFieldValue,resetForm }) => {
          const handleChange = (field: string) => (eOrVal: any) => {
            const next =
              eOrVal && typeof eOrVal === 'object' && 'target' in eOrVal
                ? (eOrVal as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target.value
                : eOrVal;
            setFieldValue(field, next);
          };

          // --- Derived measurements ---
          const { cr, cvai } = useMemo(() => {
            const apN = toNum(values.ap);
            const mlN = toNum(values.ml);
            const daN = toNum(values.da);
            const dbN = toNum(values.db);

            let crV: number | undefined;
            let cvaiV: number | undefined;
            try { if (apN && mlN) crV = calculateCephalicRatio(apN, mlN).value; } catch {}
            try { if (daN && dbN && daN >= dbN) cvaiV = calculateCVAI(daN, dbN).valueShorterDenominator; } catch {}
            return { cr: crV, cvai: cvaiV };
          }, [values.ap, values.ml, values.da, values.db]);

          // --- Single source of truth: productCode ---
          const productCode = useMemo(() => {
            const cond = normalizeCondition(values.positional);
            const sev  = normalizeSeverity(values.severity as string, cvai);
            return cond && sev ? makeProductCode(sev, cond) : '';
          }, [values.positional, values.severity, cvai]);

          // keep Formik.item_code in sync (useful for any UI that reads it)
          useMemo(() => {
            setFieldValue('item_code', productCode || '');
          }, [productCode, setFieldValue]);

          // --- Estimate (calls estimateOrderClientSide directly) ---
          const onEstimate = async (
            p: { design_by: string; print_by: string; coupon_code?: string; product_code?: string }
          ): Promise<void | { design: number; print: number; stdDiscPct?: number; gstRate?: number }> => {
            if (!productCode) {
              alert('Select Positional Diagnosis and Severity to generate Product Code first.');
              return;
            }

            const qty = 1;

            // literal union to satisfy CouponInput type
            const couponPayload =
              p.coupon_code && p.coupon_code.trim()
                ? { code: p.coupon_code.trim(), discount_type: 'Percent' as const, discount_value: 0 }
                : undefined;

            const { result, error } = await estimateOrderClientSide({
              company: undefined,     // utility will fetch from item defaults if needed
              customer: undefined,    // pass a loaded Customer doc if you need in/out state accuracy
              items: [{ item_code: productCode, qty }],
              coupon: couponPayload,
              price_list: 'Standard Selling',
              baseQuery: baseQueryWithReauth,
              api: {} as any,         // baseQueryWithReauth doesn't use this
            });

            if (error) { alert(error); return; }
            if (!result) return;

            const subtotal = Number(result.subtotal || 0);
            const totalDisc = Number(result.total_discount || 0);
            const baseBeforeCoupon = Math.max(0, subtotal - totalDisc);

            // Standard discount pct (0..1) against subtotal
            const stdPct = subtotal > 0 ? totalDisc / subtotal : 0;

            // pick current GST rate from form or default
            const prevGstRate = (typeof values.gst_rate === 'number' && values.gst_rate > 0)
              ? values.gst_rate!
              : 0.05;

            // take first line's tax_rate if present; else keep previous or default
            const firstLine = result.breakdown?.items?.[0];
            const computedGstRate =
              typeof firstLine?.tax_rate === 'number' && firstLine.tax_rate > 0
                ? firstLine.tax_rate / 100
                : prevGstRate;

            // Push into form state
            setFieldValue('design_price', 0);
            setFieldValue('print_price', baseBeforeCoupon);
            setFieldValue('standard_discount_pct', stdPct);
            setFieldValue('gst_rate', computedGstRate);

            // Return for FinishPayment
            return { design: 0, print: baseBeforeCoupon, stdDiscPct: stdPct, gstRate: computedGstRate };
          };

          // --- Coupon validate ---
          const onValidateCoupon = async (code: string) => {
            if (!code) return null;
            try {
              const res = await validateCoupon({ coupon_code: code }).unwrap();
              return res;
            } catch {
              return null;
            }
          };

          // --- Final POSTs ---
          const [isPlacing, isSavingLater] = [busy === 'place', busy === 'later'];

          const placeOrder = async () => {
            if (!values.agree_terms) return alert('Please agree to the terms and conditions.');
            if (!productCode) return alert('Please select Positional Diagnosis + Severity (product code missing).');
            try {
              setBusy('place');
              const payload = toApiOrder(values, productCode);
              await createCranialOrder(payload).unwrap();
              alert('Order placed successfully.');
              // >>> Reset everything:
              resetForm({ values: initialValues });  // reset Formik state
              setActiveStep(0);                      // go back to first step
              setFormResetKey((k) => k + 1);         // remount children to flush
            } catch (e: any) {
              const msg = e?.data?.message || e?.data?._server_messages || e?.error || e?.message || 'Failed to place order.';
              alert(msg);
            } finally {
              setBusy(null);
            }
          };

          const payLater = async () => {
            if (!values.agree_terms) return alert('Please agree to the terms and conditions.');
            if (!productCode)        return alert('Please select Positional Diagnosis + Severity (product code missing).');
            try {
              setBusy('later');
              const payload = toApiOrder(values, productCode);
              await createCranialOrder(payload).unwrap();
              alert('Order saved. You can pay later.');
              // >>> Reset everything:
              resetForm({ values: initialValues });  // reset Formik state
              setActiveStep(0);                      // go back to first step
              setFormResetKey((k) => k + 1);         // remount children to flush
            } catch (e: any) {
              const msg = e?.data?.message || e?.data?._server_messages || e?.error || e?.message || 'Failed to save order.';
              alert(msg);
            } finally {
              setBusy(null);
            }
          };

          return (
            <Form className="max-w-6xl w-[92%] mx-auto my-6 space-y-6">
              {activeStep === 0 && (
                <PatientDetails
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
                  shouldShowError={() => false}
                  UI={{ Input, Label, SelectBox, DatePicker, Textarea }}
                />
              )}

              {activeStep === 1 && (
                <Measurement
                  UI={{ Input, Label, Card }}
                />
              )}

              {activeStep === 2 && (
                <Computation cr={cr} cvai={cvai} UI={{ Card, Label, Input }} />
              )}

              {activeStep === 3 && (
                <Assessment
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
                  shouldShowError={() => false}
                  UI={{ RadioGroup, RadioGroupItem, Input, SelectBox, Label, Textarea }}
                />
              )}

              {activeStep === 4 && (
                <SummaryStep
                  values={values}
                  cr={cr}
                  cvai={cvai}
                  productCode={productCode}
                  UI={{ Input, Label }}
                />
              )}

              {activeStep === 5 && (
                <ScanUpload
                  values={values}
                  setFieldValue={setFieldValue}
                  UI={{ Input, Label, Card, Textarea }}
                />
              )}

              {activeStep === 6 && (
                <FinishPayment
                  values={values}
                  productCode={productCode}
                  UI={{ Input, Button, Label, Card, SelectBox }}
                  onEstimate={onEstimate}
                  onValidateCoupon={onValidateCoupon}
                  onPlaceOrder={placeOrder}
                  onPayLater={payLater}
                  isPlacing={isPlacing}
                  isSavingLater={isSavingLater}
                  setFieldValue={setFieldValue}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}>
                  Previous
                </Button>
                {activeStep < steps.length - 1 && (
                  <Button type="button" onClick={() => setActiveStep((s) => Math.min(s + 1, steps.length - 1))}>
                    Next
                  </Button>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
