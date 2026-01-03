'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Formik, Form, type FormikTouched } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import ASEPAMeasurement from './steps/ASEP/ASEPMeasurement';
import ASEPAAssessment from './steps/ASEP/ASEPAssessment';
import SummaryStep from './steps/ASEP/ASEPSummary';
import ScanUpload from './steps/ScanUpload';
import ASPFinishPayment from './steps/ASP/ASPFinishPayment';

import {
  useGetASEPEstimateMutation,
  useCreateASEPOrderMutation,
  useValidateCouponMutation,
  useGetOrderDetailsMutation
} from '@/rtk-query/apis/orders';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SelectBox } from '@/components/ui/selectbox';
import { usePaymentLauncher } from '@/hooks/usePaymentLauncher';
import { useRouter, useSearchParams } from 'next/navigation';

const ITEM_CODE = 'ASH-EP';

/* ---------------- Validation ---------------- */
const Schema = Yup.object({
  first_name: Yup.string().required(),
  last_name: Yup.string().required(),
  parent_mobile: Yup.string().required(),
  date_of_birth: Yup.string().required(),

  length_ap_cm: Yup.number().required(),
  head_circumference_cm: Yup.number().required(),
  temple_width_cm: Yup.number().required(),
  width_ml_cm: Yup.number().required(),
  eyebrow_to_vertex_cm: Yup.number().required(),
  tragus_to_vertex_cm: Yup.number().required(),
  occiput_to_vertex_cm: Yup.number().required(),
  suboccipital_chin_cm: Yup.number().required(),
  ear_clearance_cm: Yup.number().required(),
  neck_clearance_cm: Yup.number().required(),

  seizure_frequency: Yup.string().required(),
  epilepsy_type: Yup.string().required(),
  risk_situations: Yup.string().required(),
  fall_pattern: Yup.string().required(),

});
const steps = [
  { key: 'measurement', label: 'Measurement' },
  { key: 'assessment', label: 'Clinical Assessment' },
  { key: 'summary', label: 'Summary' },
  { key: 'scan', label: 'Scan & Upload' },
  { key: 'finish', label: 'Finish & Payment' }
] as const;
type Props = {
  initialPatient: any;
};
export default function ASEPOrderForm({ initialPatient }: Props) {

  const [activeStep, setActiveStep] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSavingLater, setIsSavingLater] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const deviceTypeId = searchParams.get('deviceType');
  const [formResetKey, setFormResetKey] = useState(0);
  const isReadOnly = searchParams.get('readonly') === 'true';

  // Coupon state
  const [couponData, setCouponData] = useState<any>(null);

  const { user }: any = useSelector((s: any) => s.userReducer);
  const pill = (i: number) =>
    `text-xs border rounded-full px-3 py-1 ${i === activeStep ? 'bg-primary text-white border-primary' : 'text-violet-300 border-violet-400'}`;
  const [getASPEstimate] = useGetASEPEstimateMutation();
  const [createASPOrder] = useCreateASEPOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const [getOrderDetails] = useGetOrderDetailsMutation();

  const initialValues = {
    ...initialPatient,

    first_name: '',
    last_name: '',
    parent_name: '',
    parent_mobile: '',
    date_of_birth: '',
    weight_kg: '',
    email: '',
    clinic_name: '',

    length_ap_cm: '',
    head_circumference_cm: '',
    temple_width_cm: '',
    width_ml_cm: '',
    eyebrow_to_vertex_cm: '',
    tragus_to_vertex_cm: '',
    occiput_to_vertex_cm: '',
    suboccipital_chin_cm: '',
    ear_clearance_cm: '',
    neck_clearance_cm: '',

    seizure_frequency: '',
    epilepsy_type: '',
    risk_situations: '',
    fall_pattern: '',
    scan_file: null,
    extra_files: [],
    uploaded_stl_file: null,
    google_drive_link: '',
    other_diagnosis: '',
    date_of_surgery: '',
    design_by: 'Addiwise', print_by: 'Addiwise', colour: '', coupon_code: '', item_code: ITEM_CODE, agree_terms: false, design_price: '0.00', print_price: '0.00', estimate_price: '0.00', item_standard_discount: '0.00', item_special_discount: '0.00', additional_discount: '0.00', discounted_price: '0.00', gst_5: '0.00', gst_18: '0.00', total_price: '0.00',

  };
  type FormValues = typeof initialValues;
  const [formSeed, setFormSeed] = useState(initialValues);
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    const hydrate = async () => {
      if (!orderId || !deviceTypeId) return;

      try {
        const resp: any = await getOrderDetails({
          order_type: deviceTypeId,
          order_id: orderId
        }).unwrap();

        const d = resp?.message?.data || {};

        const seed = {
          ...initialValues,

          /* ---------------- Patient ---------------- */
          first_name: d.first_name || '',
          last_name: d.last_name || '',
          parent_mobile: d.parent_mobile || d.custom_mobile_no || '',
          date_of_birth: d.date_of_birth || d.dob || '',
          gender: d.gender || '',
          height_cm: d.height_cm || '',
          weight_kg: d.weight_kg || d.weight || '',
          email: d.email || '',
          clinic_name: d.clinic_name || '',

          /* ---------------- Measurements ---------------- */
          length_ap_cm: d.length_ap_cm ?? '',
          head_circumference_cm: d.head_circumference_cm ?? '',
          temple_width_cm: d.temple_width_cm ?? '',
          width_ml_cm: d.width_ml_cm ?? '',
          eyebrow_to_vertex_cm: d.eyebrow_to_vertex_cm ?? '',
          tragus_to_vertex_cm: d.tragus_to_vertex_cm ?? '',
          occiput_to_vertex_cm: d.occiput_to_vertex_cm ?? '',
          suboccipital_chin_cm: d.suboccipital_chin_cm ?? '',
          ear_clearance_cm: d.ear_clearance_cm ?? '',
          neck_clearance_cm: d.neck_clearance_cm ?? '',

          /* ---------------- Assessment ---------------- */
          seizure_frequency: d.seizure_frequency || '',
          epilepsy_type: d.epilepsy_type || '',
          risk_situations: d.risk_situations || '',
          fall_pattern: d.fall_pattern || '',
          other_diagnosis: d.other_diagnosis || '',

          /* ---------------- Uploads ---------------- */
          uploaded_stl_file: null, // ❗ never hydrate File object

          /* ---------------- Meta / Pricing ---------------- */
          design_by: d.design_by || 'Addiwise',
          print_by: d.print_by || 'Addiwise',
          colour: d.colour || '',
          coupon_code: d.coupon_code || '',
          item_code: d.item_code || ITEM_CODE,
          agree_terms: false,

          design_price: d.design_price || '0.00',
          print_price: d.print_price || '0.00',
          estimate_price: d.estimate_price || '0.00',
          item_standard_discount: d.item_standard_discount || '0.00',
          item_special_discount: d.item_special_discount || '0.00',
          additional_discount: d.additional_discount || '0.00',
          discounted_price: d.discounted_price || '0.00',
          gst_5: d.gst_5 || '0.00',
          gst_18: d.gst_18 || '0.00',
          total_price: d.total_price || '0.00',
        };

        setFormSeed(seed);
        setPrefilled(true);
      } catch {
        setPrefilled(false);
      }
    };
    hydrate();
  }, [orderId, deviceTypeId]);
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
        key={formResetKey + (prefilled ? 1 : 0)}
        initialValues={prefilled ? formSeed : initialValues}
        validationSchema={Schema}
        onSubmit={() => {}}
        enableReinitialize
        validateOnChange
        validateOnBlur
      >
        {({
            values,
            errors,
            touched,
            setFieldValue,
            handleChange,
            validateForm,
            setTouched,
          }
        ) => {
          const shouldShowError = (field: string) =>
            !!((touched as FormikTouched<any>)?.[field] && (errors as any)?.[field]);

          /* ---------------------- ESTIMATE ---------------------- */
          const onEstimate = async () => {
            setIsEstimating(true);

            const estimatePayload = {
              item_code: ITEM_CODE,
              design_by: values.design_by,
              print_by: values.print_by,
              discount_per: couponData?.discount_percentage || 0,
              discount_amt: couponData?.discount_amount || 0,
              coupon_code: (values.coupon_code || '').trim()
            };

            try {
              const response = await getASPEstimate(estimatePayload).unwrap();

              // ✅ CORRECT EXTRACTION
              const apiRes = response?.data || {};

              setFieldValue('design_price', apiRes.design || '0.00');
              setFieldValue('print_price', apiRes.print || '0.00');

              setFieldValue('estimate_price', apiRes.estimate_price || '0.00');
              setFieldValue('item_standard_discount', apiRes.item_standard_discount || '0.00');
              setFieldValue('additional_discount', apiRes.additional_discount || '0.00');
              setFieldValue('discounted_price', apiRes.discounted_price || '0.00');

              setFieldValue('gst_5', apiRes.gst_5 || '0.00');
              setFieldValue('gst_18', apiRes.gst_18 || '0.00');
              setFieldValue('total_price', apiRes.total_price || '0.00');

            } catch (err: any) {
              toast.error(err?.data?.message || 'Failed to get estimate');
            } finally {
              setIsEstimating(false);
            }
          };

          /* ---------------------- COUPON ---------------------- */
          const onValidateCoupon = async (code: string) => {
            const res = await validateCoupon({ coupon_code: code }).unwrap();
            setCouponData(res?.data || null);
            return res;
          };

          /* ---------------------- PLACE ORDER ---------------------- */
          const router = useRouter();
          const { startPayment } = usePaymentLauncher();
          const [busy, setBusy] = useState<'place' | 'later' | null>(null);

          const buildBodyOrForm = (payload: any) => {
            const hasFiles = !!values.scan_file || (values.extra_files && values.extra_files.length > 0);
            if (!hasFiles) return payload;

            const fd = new FormData();
            fd.append('data', JSON.stringify(payload));
            if (values.scan_file) fd.append('scan_file_primary', values.scan_file);
            for (const [i, f] of (values.extra_files || []).entries()) {
              fd.append(`additional_file_${i + 1}`, f);
            }
            return fd;
          };


          type CreateOk =
            | {
            message: {
              status: string;
              message?: string;
              sales_order_id?: string;
              addishield_epipro_order_id?: string;
            };
          }
            | {
            status: string;
            message?: string;
            sales_order_id?: string;
            addishield_epipro_order_id?: string;
          }
            | string
            | Record<string, any>
            | undefined
            | null;


          function normalizeCreateResponse(res: unknown) {
            let ok = false;
            let salesId: string | undefined;
            let aspOrderId: string | undefined;
            let note = '';

            if (res == null) return { ok, salesId, aspOrderId, note: 'Empty response' };

            if (typeof res === 'string') {
              ok = /success|ok/i.test(res);
              note = res;
              return { ok, salesId, aspOrderId, note };
            }

            const obj = res as Record<string, any>;
            const msgObj = obj?.message;

            const statusStr =
              (typeof msgObj?.status === 'string' && msgObj.status) ||
              (typeof obj?.status === 'string' && obj.status) ||
              '';

            ok = /success|ok/i.test(statusStr);

            // ✅ SALES ORDER ID (payment)
            salesId =
              msgObj?.sales_order_id ??
              obj?.sales_order_id ??
              obj?.data?.sales_order_id;

            // ✅ ASP ORDER ID (reference)
            aspOrderId =
              msgObj?.addishield_epipro_order_id ??
              obj?.addishield_epipro_order_id ??
              obj?.data?.addishield_epipro_order_id;

            note =
              (typeof msgObj?.message === 'string' && msgObj.message) ||
              (typeof obj?.message === 'string' && obj.message) ||
              statusStr ||
              '';

            return { ok, salesId, aspOrderId, note };
          }


          // ✅ postOrder now uses the reusable payment launcher
          const postOrder = async (intent: 'place' | 'later') => {
            if (!values.agree_terms) {
              alert('Please agree to the terms and conditions.');
              return;
            }

            try {
              setBusy(intent);

              const payload = {
                ...values,
                item_code: ITEM_CODE,
                customer: user?.customer_id,
                payment_status: intent === 'later' ? 'Draft' : undefined,
              };

              const bodyOrForm = buildBodyOrForm(payload);
              const res = (await createASPOrder(bodyOrForm).unwrap()) as CreateOk;

              const { ok, salesId, aspOrderId, note } = normalizeCreateResponse(res);

              if (!ok) {
                alert(note || 'Order creation failed.');
                return;
              }

              // ✅ Pay later
              if (intent === 'later') {
                alert(
                  `Order saved. You can pay later.${
                    salesId ? ` (SO: ${salesId})` : ''
                  }`
                );
                router.push('/orders');
                return;
              }

              // ✅ Pay & Place
              if (!salesId) {
                alert('Order created but Sales Order ID missing.');
                return;
              }

              const raw = String(values.total_price ?? '0').replace(/,/g, '');
              const amount = Number(parseFloat(raw || '0').toFixed(2));
              if (!amount || amount <= 0) {
                alert('Invalid payment amount.');
                return;
              }

              await startPayment(salesId);

            } catch (e: any) {
              alert(
                e?.data?.message ||
                e?.data?._server_messages ||
                e?.error ||
                e?.message ||
                'Failed to submit order.'
              );
            } finally {
              setBusy(null);
            }
          };

          const placeOrder = () => postOrder('place');
          const payLater = () => postOrder('later');

          return (
            <Form>
              <fieldset
                disabled={isReadOnly}
                className={isReadOnly ? 'opacity-70 pointer-events-none' : ''}
              >

              {activeStep === 0 && <ASEPAMeasurement UI={{ Input, Label, Card }}/>}
              {activeStep === 1 && <ASEPAAssessment />}

              {activeStep === 2 && (
                <SummaryStep values={values} productCode={ITEM_CODE} UI={{ Input, Label }} />
              )}

              {activeStep === 3 && (
                <ScanUpload
                  values={values}
                  setFieldValue={setFieldValue}
                  UI={{ Input, Label, Card, Textarea }}
                />
              )}

              {activeStep === 4 && (
                <ASPFinishPayment
                  values={values}
                  productCode={ITEM_CODE}
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
              </fieldset>

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={() => setActiveStep(s => s - 1)}>
                  Back
                </Button>
                {activeStep < steps.length - 1 && (
                  <Button
                    type="button"
                    onClick={async () => {
                      const errors = await validateForm();

                      const stepFields: Record<number, (keyof FormValues)[]> = {
                        0: [
                          'length_ap_cm',
                          'head_circumference_cm',
                          'temple_width_cm',
                          'width_ml_cm',
                          'eyebrow_to_vertex_cm',
                          'tragus_to_vertex_cm',
                          'occiput_to_vertex_cm',
                          'suboccipital_chin_cm',
                          'ear_clearance_cm',
                          'neck_clearance_cm',
                        ],
                        1: [
                          'seizure_frequency',
                          'epilepsy_type',
                          'risk_situations',
                          'fall_pattern',
                        ],
                      };

                      const fields = stepFields[activeStep] || [];
                      const hasError = fields.some(
                        (f) => Boolean((errors as Record<string,any>)[f as string])
                      );

                      if (hasError) {
                        const touched: any = {};
                        fields.forEach(f => (touched[f] = true));
                        setTouched(touched);
                        return;
                      }

                      setActiveStep(s => s + 1);
                    }}
                  >
                    Next
                  </Button>
                )}
              </div>
              {isReadOnly && (
                <div className="mt-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
                  This form is opened in <strong>read-only</strong> mode from Orders. Editing and payment are
                  disabled.
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
