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
  useGetCHEstimateMutation,
  useValidateCouponMutation,
} from '@/rtk-query/apis/orders';

type FormValues = {
  sales_order_id?: string;
  item_code?: string;
  customer?: string;
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

  ap?: string; ml?: string; da?: string; db?: string; hc?: string; tw?: string;

  cr?: number; cvai?: number;

  occipital_area?: string; parietal_area?: string; frontal_area?: string; ear_alignment?: string;
  positional?: string; severity?: 'L'|'M'|'S'|''; torticollis?: string; post_surgical?: string;
  suture_type_surgical_diagnoses_only?: string; date_of_surgery?: string; surgical_complications?: string;
  other_diagnosis_and_syndromes?: string;

  scan_file?: File | null; extra_files?: File[];
  patient_remarks?: string; other_remarks?: string;

  design_by?: string; print_by?: string; colour?: string; thickness_3d_mm?: string;
  coupon_code?: string; coupon_id?: string; agree_terms?: boolean;

  design_price?: number; print_price?: number; standard_discount_pct?: number; gst_rate?: number;
};

const Schema = Yup.object({
  first_name: Yup.string().required('Required'),
  date_of_birth: Yup.string().required('Required'),
  ap: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  ml: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  da: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  db: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
  hc: Yup.number().typeError('Enter a number').positive('Must be > 0').nullable(),
});

const steps = [
  { key: 'patient', label: 'Basic Details' },
  { key: 'measurement', label: 'Measurement' },
  { key: 'computation', label: 'Computation' },
  { key: 'assessment', label: 'Clinical Assessment' },
  { key: 'summary', label: 'Summary' },
  { key: 'scan', label: 'Scan & Upload' },
  { key: 'finish', label: 'Finish & Payment' }
] as const;

// ---------- util (keep outside) ----------
const toNum = (v?: string) => (v === '' || v == null ? undefined : Number(v));
const sevFromCvai = (cvai?: number): 'L'|'M'|'S'|'' =>
  cvai == null ? '' : cvai < 3.5 ? 'L' : cvai < 7.0 ? 'M' : 'S';

// map Formik values → ERP payload (flat)
function toApiOrder(values: FormValues) {
  const ap = toNum(values.ap);
  const ml = toNum(values.ml);
  const da = toNum(values.da);
  const db = toNum(values.db);

  let cr: number | undefined;
  let cvai: number | undefined;
  try { if (ap && ml) cr = calculateCephalicRatio(ap, ml).value; } catch {}
  try { if (da && db && da >= db) cvai = calculateCVAI(da, db).valueShorterDenominator; } catch {}

  return {
    customer: values.customer || '',
    sales_order_id: values.sales_order_id,

    first_name: values.first_name,
    last_name: values.last_name,
    date_of_birth: values.date_of_birth || undefined,
    weight_kg: toNum(values.weight_kg),
    email: values.email,
    clinic_name: values.clinic_name,
    height_cm: toNum(values.height_cm),

    measurement_of_length_a_to_p__mm: ap,
    measurement_of_width_m_to_l_mm: ml,
    diagonal_a: da,
    diagonal_b: db,
    head_circumference_mm: toNum(values.hc),
    temple_width_mm: toNum(values.tw),

    cr, cvai,

    occipital_area: values.occipital_area,
    parietal_area: values.parietal_area,
    frontal_area: values.frontal_area,
    ear_alignment: values.ear_alignment,
    positional: values.positional,
    torticollis: values.torticollis,
    post_surgical: values.post_surgical,
    suture_type_surgical_diagnoses_only: values.suture_type_surgical_diagnoses_only,
    other_diagnosis_and_syndromes: values.other_diagnosis_and_syndromes,
  };
}

type CranialOrderFormProps = { item_type: string };

export default function CranialOrderForm({ item_type }: CranialOrderFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState<null | 'place' | 'later'>(null);

  const [createCranialOrder] = useCreateCranialOrderMutation();
  const [getCHEstimate] = useGetCHEstimateMutation();
  const [validateCoupon] = useValidateCouponMutation();

  const pill = (i: number) =>
    `text-xs border rounded-full px-3 py-1 ${i === activeStep ? 'bg-primary text-white border-primary' : 'text-violet-300 border-violet-400'}`;

  const initialValues: FormValues = useMemo(() => ({
    first_name: '', last_name: '', parent_name: '', parent_mobile: '',
    date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
    email: '', clinic_name: '', consultant: '',

    item_code: item_type,
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

    design_by: 'Addiwise', print_by: 'Addiwise', colour: '', thickness_3d_mm: '3.5',
    coupon_code: '', coupon_id: '', agree_terms: false,

    design_price: 0, print_price: 0, standard_discount_pct: 0, gst_rate: 0.05,
  }), [item_type]);

  return (
    <div className="w-full">
      {/* sticky header … */}

      <Formik
        initialValues={initialValues}
        validationSchema={Schema}
        onSubmit={() => {}}
        enableReinitialize
        validateOnChange
        validateOnBlur
      >
        {({ values, errors, touched, setFieldValue }) => {
          const handleChange = (field: string) => (eOrVal: any) => {
            const next =
              eOrVal && typeof eOrVal === 'object' && 'target' in eOrVal
                ? (eOrVal as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target.value
                : eOrVal;
            setFieldValue(field, next);
          };

          // ---- move ALL derived calculations INSIDE render ----
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

          const derivedSeverity: 'L' | 'M' | 'S' | '' = values.severity || sevFromCvai(cvai);

          const code = useMemo(() => {
            if (!derivedSeverity || !values.positional) return '';
            // cast to helper’s union types
            return makeProductCode(
              derivedSeverity as SeverityCode,
              values.positional as ConditionCode
            );
          }, [derivedSeverity, values.positional]);

          // === Estimate ===
          const onEstimate = async (p: {
            design_by: string; print_by: string; coupon_code?: string; product_code?: string;
          }) => {
            const res = await getCHEstimate({
              item_code: values.item_code || item_type,
              design_by: p.design_by,
              print_by: p.print_by,
              discount_per: 0,
              discount_amt: 0,
              coupon_code: p.coupon_code || '',
            }).unwrap();

            const d = Number(res?.message?.data?.design || 0);
            const pr = Number(res?.message?.data?.print || 0);
            const stdPct = Number(res?.message?.data?.item_standard_discount || 0) / 100;

            setFieldValue('design_price', d);
            setFieldValue('print_price', pr);
            setFieldValue('standard_discount_pct', stdPct);

            return { design: d, print: pr, stdDiscPct: stdPct };
          };

          // === Coupon Validate ===
          const onValidateCoupon = async (code: string) => {
            if (!code) return null;
            try {
              const res = await validateCoupon({ coupon_code: code }).unwrap();
              return res;
            } catch {
              return null;
            }
          };

          // === Final POSTs ===
          const placeOrder = async () => {
            if (!values.agree_terms) return alert('Please agree to the terms and conditions.');
            try {
              setBusy('place');
              const payload = toApiOrder(values);
              await createCranialOrder(payload).unwrap();
              alert('Order placed successfully.');
            } catch (e: any) {
              const msg = e?.data?.message || e?.data?._server_messages || e?.error || e?.message || 'Failed to place order.';
              alert(msg);
            } finally {
              setBusy(null);
            }
          };

          const payLater = async () => {
            if (!values.agree_terms) return alert('Please agree to the terms and conditions.');
            if (!values.customer)    return alert('Please select a Customer before saving the order.');
            try {
              setBusy('later');
              const payload = toApiOrder(values);
              await createCranialOrder(payload).unwrap();
              alert('Order saved. You can pay later.');
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
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleChange={handleChange}
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
                  severity={derivedSeverity}
                  productCode={code}
                  UI={{ Input, Label }}
                />
              )}

              {activeStep === 5 && (
                <ScanUpload values={values} setFieldValue={setFieldValue} UI={{ Input, Label, Card, Textarea }} />
              )}

              {activeStep === 6 && (
                <FinishPayment
                  values={values}
                  productCode={code}
                  UI={{ Input, Button, Label, Card, SelectBox }}
                  onEstimate={onEstimate}
                  onValidateCoupon={onValidateCoupon}
                  onPlaceOrder={placeOrder}
                  onPayLater={payLater}
                  isPlacing={busy === 'place'}
                  isSavingLater={busy === 'later'}
                  setFieldValue={setFieldValue}
                />
              )}

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