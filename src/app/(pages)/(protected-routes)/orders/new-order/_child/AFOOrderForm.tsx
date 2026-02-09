'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form, type FormikTouched } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import AFOMeasurement from './steps/AFO/AFOMeasurementsStep';
import Assessment from './steps/AFO/Assessment';
import PatientDetails from './steps/AFO/AfoPatientDetails';
import ScanUpload from './steps/AFO/ScanUpload';
import ASPFinishPayment from './steps/ASP/ASPFinishPayment';

import {
  useCreateAfoOrderMutation,
  useGetAFOEstimateMutation,
  useValidateCouponMutation,
  useGetOrderDetailsMutation,
  useGetAFOItemOptionsMutation,
  usePreSignedUrlMutation // 🔥 NEW: Add this import
} from '@/rtk-query/apis/orders';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SelectBox } from '@/components/ui/selectbox';

import { usePaymentLauncher } from '@/hooks/usePaymentLauncher';
import { useRouter, useSearchParams } from 'next/navigation';
import { DatePicker } from '@/components/ui/datepicker';

const ITEM_CODE = 'AFO-P';

const Schema = Yup.object({
  product_type: Yup.string().required('Select product type'),
  first_name: Yup.string().required(),
  last_name: Yup.string().required(),
  parent_mobile: Yup.string().required(),
  date_of_birth: Yup.string().required(),
  heel_to_sulcus_cm: Yup.number().required(),
  heel_to_toe_cm: Yup.number().required(),
  fibula_head_circumference_cm: Yup.number().required(),
  fibula_head_ml_cm: Yup.number().required(),
  fibula_head_to_ankle_cm: Yup.number().required(),
  widest_calf_circumference_cm: Yup.number().required(),
  widest_calf_ml_cm: Yup.number().required(),
  ankle_circumference_cm: Yup.number().required(),
  ankle_ml_cm: Yup.number().required(),
  ankle_to_ground_cm: Yup.number().required(),
  forefoot_ml_cm: Yup.number().required(),
  afo_item_code: Yup.string().required('Select AFO model'),
  ankle_joint_type: Yup.string().when('product_type', {
    is: 'DAFO',
    then: s => s.required('Select ankle joint'),
  }),
  medical_condition: Yup.string().required(),
  treatment_suggested: Yup.string().required(),
  special_instructions: Yup.string().required(),
  agree_terms: Yup.boolean().oneOf([true])
});

const steps = [
  { key: 'patient', label: 'Patient' },
  { key: 'measurement', label: 'Measurements' },
  { key: 'clinical', label: 'Clinical' },
  { key: 'scan', label: 'Scan & Upload' },
  { key: 'finish', label: 'Finish & Payment' }
] as const;

type CranialOrderFormProps = { item_type?: string };

export default function AFOOrderForm(_: CranialOrderFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [getAFOItems] = useGetAFOItemOptionsMutation();
  const [afoOptions, setAfoOptions] = useState<any[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSavingLater, setIsSavingLater] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const deviceTypeId = searchParams.get('deviceType');
  const isReadOnly = searchParams.get('readonly') === 'true';

  const [couponData, setCouponData] = useState<any>(null);
  const { user }: any = useSelector((s: any) => s.userReducer);

  // APIs
  const [getEstimate] = useGetAFOEstimateMutation();
  const [createOrder] = useCreateAfoOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const [getOrderDetails] = useGetOrderDetailsMutation();
  const [preSignedUrl] = usePreSignedUrlMutation(); // 🔥 NEW
  const [ankleValue, setAnkleValue] = useState<number | null>(null);

  const initialValues = {
    first_name: '',
    last_name: '',
    parent_name: '',
    parent_mobile: '',
    gender: '',
    date_of_birth: '',
    weight: '',
    email: '',
    clinic_name: '',
    product_type: 'AFO',
    afo_size: '',
    afo_item_code: '',
    afo_item_name: '',
    item_code: ITEM_CODE,
    heel_to_sulcus_cm: '',
    heel_to_toe_cm: '',
    fibula_head_circumference_cm: '',
    fibula_head_ml_cm: '',
    fibula_head_to_ankle_cm: '',
    widest_calf_circumference_cm: '',
    widest_calf_ml_cm: '',
    ankle_circumference_cm: '',
    ankle_ml_cm: '',
    ankle_to_ground_cm: '',
    forefoot_ml_cm: '',
    ankle_joint_type: '',
    medical_condition: '',
    special_instructions: '',
    assessment_date: '',
    treatment_suggested: '',
    laterality: '',
    left_leg_file: null,
    right_leg_file: null,
    drive_url: '',
    coupon_code: '',
    agree_terms: false,
    design_by: 'Addiwise',
    print_by: 'Addiwise',
    design_price: '0.00',
    print_price: '0.00',
    estimate_price: '0.00',
    discounted_price: '0.00',
    gst_18: '0.00',
    total_price: '0.00',
  };

  const [formSeed, setFormSeed] = useState(initialValues);
  const [prefilled, setPrefilled] = useState(false);

  // 🔥 NEW: S3 Upload Helper (copied from Cranial)
  const uploadFileAndStoreMetadata = async (file: File, userId: string) => {
    try {
      let contentType = 'application/octet-stream';
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.stl')) contentType = 'model/stl';
      else if (file.type) contentType = file.type;

      const result: any = await preSignedUrl({
        fileName: file.name,
        fileType: contentType,
        userId,
      }).unwrap();

      if (!result?.message?.status) {
        throw new Error('Presigned URL request failed');
      }

      const uploadUrl = result?.message?.data?.uploadUrl;
      const key = result?.message?.data?.key;

      if (!uploadUrl) {
        throw new Error('No uploadUrl from presign response');
      }

      // Upload directly to S3
      await fetch(String(uploadUrl), {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      });

      return {
        key: key ? String(key) : String(uploadUrl.split('?')[0]),
        size: file.size,
        type: contentType,
        originalName: file.name,
      };
    } catch (err) {
      console.error('Presigned upload error', err);
      throw err;
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!orderId || !deviceTypeId) return;

      try {
        const resp: any = await getOrderDetails({
          order_type: deviceTypeId,
          order_id: orderId,
        }).unwrap();

        const d = resp?.data || resp?.message?.data || {};
        if (d.ankle_circumference_cm) {
          setAnkleValue(Number(d.ankle_circumference_cm));
        }

        if (!d) return;

        const seed = {
          ...initialValues,
          product_type: d.product_type || 'AFO',
          first_name: d.first_name || '',
          last_name: d.last_name || '',
          parent_name: d.parent_name || '',
          parent_mobile: d.parent_mobile || '',
          gender: d.gender || '',
          date_of_birth: d.date_of_birth || '',
          weight: d.weight || '',
          email: d.email || '',
          clinic_name: d.clinic_name || '',
          afo_item_code: d.item_code || '',
          afo_item_name: d.item_name || '',
          heel_to_sulcus_cm: d.heel_to_sulcus_cm ?? '',
          heel_to_toe_cm: d.heel_to_toe_cm ?? '',
          fibula_head_circumference_cm: d.fibula_head_circumference_cm ?? '',
          fibula_head_ml_cm: d.fibula_head_ml_cm ?? '',
          fibula_head_to_ankle_cm: d.fibula_head_to_ankle_cm ?? '',
          widest_calf_circumference_cm: d.widest_calf_circumference_cm ?? '',
          widest_calf_ml_cm: d.widest_calf_ml_cm ?? '',
          ankle_circumference_cm: d.ankle_circumference_cm ?? '',
          ankle_ml_cm: d.ankle_ml_cm ?? '',
          ankle_to_ground_cm: d.ankle_to_ground_cm ?? '',
          forefoot_ml_cm: d.forefoot_ml_cm ?? '',
          ankle_joint_type: d.ankle_joint_type || '',
          medical_condition: d.medical_condition || '',
          treatment_suggested: d.treatment_suggested || '',
          special_instructions: d.special_instructions || '',
          assessment_date: d.assessment_date || '',
          laterality: d.laterality || '',
          left_leg_file: d.left_leg_file || null,
          right_leg_file: d.right_leg_file || null,
          drive_url: d.drive_url || '',
          design_price: d.design_price || '0.00',
          print_price: d.print_price || '0.00',
          estimate_price: d.estimate_price || '0.00',
          discounted_price: d.discounted_price || '0.00',
          gst_18: d.gst_18 || '0.00',
          total_price: d.total_price || '0.00',
        };

        setFormSeed(seed);
        setPrefilled(true);
      } catch (e) {
        console.error('Hydration failed:', e);
        setPrefilled(false);
      }
    };

    hydrate();
  }, [orderId, deviceTypeId]);

  useEffect(() => {
    if (!ankleValue || ankleValue <= 0) {
      setAfoOptions([]);
      return;
    }

    const loadOptions = async () => {
      try {
        const res = await getAFOItems({
          ankle_circumference: ankleValue
        }).unwrap();

        const items = res?.message?.data || res?.data || [];
        setAfoOptions(items);
      } catch (e) {
        console.error('AFO load failed', e);
        setAfoOptions([]);
      }
    };

    loadOptions();
  }, [ankleValue]);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 bg-primary text-white px-4 py-3">
        <div className="font-semibold text-center">
          Step {activeStep + 1} of {steps.length} — {steps[activeStep].label}
        </div>
      </div>

      <Formik
        initialValues={prefilled ? formSeed : initialValues}
        validationSchema={Schema}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({
            values,
            errors,
            touched,
            setFieldValue,
            handleChange,
            validateForm,
            setTouched
          }) => {
          const shouldShowError = (field: string, force = false) =>
            !!((touched as any)?.[field] && (errors as any)?.[field]);

          const onEstimate = async () => {
            setIsEstimating(true);

            const estimatePayload = {
              item_code: values.afo_item_code,
              design_by: values.design_by,
              print_by: values.print_by,
              discount_per: couponData?.discount_percentage || 0,
              discount_amt: couponData?.discount_amount || 0,
              coupon_code: (values.coupon_code || '').trim()
            };

            try {
              const response = await getEstimate(estimatePayload).unwrap();
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

          const onValidateCoupon = async (code: string) => {
            const res = await validateCoupon({ coupon_code: code }).unwrap();
            setCouponData(res?.data || null);
            return res;
          };

          const router = useRouter();
          const { startPayment } = usePaymentLauncher();
          const [busy, setBusy] = useState<'place' | 'later' | null>(null);

          // 🔥 UPDATED: Fallback FormData builder (only used if S3 fails)
          const buildBodyOrForm = (values: any) => {
            const hasFile =
              values.left_leg_file instanceof File ||
              values.right_leg_file instanceof File;

            if (!hasFile) {
              return {
                data: JSON.stringify({
                  ...values,
                  item_code: values.afo_item_code,
                }),
              };
            }

            const fd = new FormData();
            const payload = {
              ...values,
              item_code: values.afo_item_code,
              afo_item_code: values.afo_item_code,
              heel_to_sulcus_cm: Number(values.heel_to_sulcus_cm),
              heel_to_toe_cm: Number(values.heel_to_toe_cm),
              ankle_circumference_cm: Number(values.ankle_circumference_cm),
              widest_calf_circumference_cm: Number(values.widest_calf_circumference_cm),
              forefoot_ml_cm: Number(values.forefoot_ml_cm),
              fibula_head_circumference_cm: Number(values.fibula_head_circumference_cm),
              fibula_head_ml_cm: Number(values.fibula_head_ml_cm),
              fibula_head_to_ankle_cm: Number(values.fibula_head_to_ankle_cm),
              widest_calf_ml_cm: Number(values.widest_calf_ml_cm),
              ankle_ml_cm: Number(values.ankle_ml_cm),
              ankle_to_ground_cm: Number(values.ankle_to_ground_cm),
              agree_terms: Boolean(values.agree_terms),
              qty: 1,
            };

            delete payload.left_leg_file;
            delete payload.right_leg_file;

            fd.append('data', JSON.stringify(payload));

            if (values.left_leg_file instanceof File) {
              fd.append('left_leg_file', values.left_leg_file);
            }
            if (values.right_leg_file instanceof File) {
              fd.append('right_leg_file', values.right_leg_file);
            }

            return fd;
          };

          type CreateOk =
            | {
            message: {
              status: string;
              message?: string;
              sales_order_id?: string;
              addishield_pro_order_id?: string;
            };
          }
            | {
            status: string;
            message?: string;
            sales_order_id?: string;
            addishield_pro_order_id?: string;
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

            salesId =
              msgObj?.sales_order_id ??
              obj?.sales_order_id ??
              obj?.data?.sales_order_id;

            aspOrderId =
              msgObj?.addishield_pro_order_id ??
              obj?.addishield_pro_order_id ??
              obj?.data?.addishield_pro_order_id;

            note =
              (typeof msgObj?.message === 'string' && msgObj.message) ||
              (typeof obj?.message === 'string' && obj.message) ||
              statusStr ||
              '';

            return { ok, salesId, aspOrderId, note };
          }

          // 🔥 UPDATED: postOrder with S3 presigned upload
          // const postOrder = async (intent: 'place' | 'later') => {
          //   if (!values.agree_terms) {
          //     alert('Please agree to the terms and conditions.');
          //     return;
          //   }
          //
          //   try {
          //     setBusy(intent);
          //
          //     const payload: any = {
          //       ...values,
          //       item_code: values.afo_item_code,
          //       customer: user?.customer_id,
          //       payment_status: intent === 'later' ? 'Draft' : undefined,
          //       heel_to_sulcus_cm: Number(values.heel_to_sulcus_cm),
          //       heel_to_toe_cm: Number(values.heel_to_toe_cm),
          //       ankle_circumference_cm: Number(values.ankle_circumference_cm),
          //       widest_calf_circumference_cm: Number(values.widest_calf_circumference_cm),
          //       forefoot_ml_cm: Number(values.forefoot_ml_cm),
          //       fibula_head_circumference_cm: Number(values.fibula_head_circumference_cm),
          //       fibula_head_ml_cm: Number(values.fibula_head_ml_cm),
          //       fibula_head_to_ankle_cm: Number(values.fibula_head_to_ankle_cm),
          //       widest_calf_ml_cm: Number(values.widest_calf_ml_cm),
          //       ankle_ml_cm: Number(values.ankle_ml_cm),
          //       ankle_to_ground_cm: Number(values.ankle_to_ground_cm),
          //       agree_terms: Boolean(values.agree_terms),
          //       qty: 1,
          //     };
          //
          //     // 🔥 NEW: Upload files to S3 first
          //     const uploadedFiles: any = {};
          //     let useS3 = true;
          //
          //     // 🔥 AFTER - Cast to any for instanceof check:
          //     if ((values.left_leg_file as any) instanceof File) {
          //       try {
          //         // ✅ AFTER - Double cast via unknown:
          //         const meta = await uploadFileAndStoreMetadata(
          //           values.left_leg_file as unknown as File,
          //           user?.customer_id || '1'
          //         );
          //
          //         uploadedFiles.left_leg_file = { url: meta.key };
          //         console.log('✅ Left leg uploaded to S3:', meta.key);
          //       } catch (err) {
          //         console.warn('❌ Left leg S3 upload failed, using multipart', err);
          //         useS3 = false;
          //       }
          //     }
          //
          //     if ((values.right_leg_file as any) instanceof File && useS3) {
          //       try {
          //         const meta = await uploadFileAndStoreMetadata(
          //           values.right_leg_file as unknown as File,
          //           user?.customer_id || '1'
          //         );
          //
          //         uploadedFiles.right_leg_file = { url: meta.key };
          //         console.log('✅ Right leg uploaded to S3:', meta.key);
          //       } catch (err) {
          //         console.warn('❌ Right leg S3 upload failed, using multipart', err);
          //         useS3 = false;
          //       }
          //     }
          //
          //     let res: CreateOk;
          //
          //     // 🔥 If S3 upload succeeded, send JSON with paths
          //     if (useS3 && Object.keys(uploadedFiles).length > 0) {
          //       delete payload.left_leg_file;
          //       delete payload.right_leg_file;
          //       payload.uploaded_files = uploadedFiles;
          //
          //       console.log('📤 Sending JSON payload with S3 paths');
          //       res = (await createOrder(payload).unwrap()) as CreateOk;
          //     } else {
          //       // S3 upload failed, use FormData fallback
          //       console.log('📤 Sending FormData (S3 failed)');
          //       const bodyOrForm = buildBodyOrForm(values);
          //       res = (await createOrder(bodyOrForm).unwrap()) as CreateOk;
          //     }
          //
          //     const { ok, salesId, aspOrderId, note } = normalizeCreateResponse(res);
          //
          //     if (!ok) {
          //       alert(note || 'Order creation failed.');
          //       return;
          //     }
          //
          //     if (intent === 'later') {
          //       alert(
          //         `Order saved. You can pay later.${
          //           salesId ? ` (SO: ${salesId})` : ''
          //         }`
          //       );
          //       router.push('/orders');
          //       return;
          //     }
          //
          //     if (!salesId) {
          //       alert('Order created but Sales Order ID missing.');
          //       return;
          //     }
          //
          //     const raw = String(values.total_price ?? '0').replace(/,/g, '');
          //     const amount = Number(parseFloat(raw || '0').toFixed(2));
          //     if (!amount || amount <= 0) {
          //       alert('Invalid payment amount.');
          //       return;
          //     }
          //
          //     await startPayment(salesId);
          //   } catch (e: any) {
          //     alert(
          //       e?.data?.message ||
          //       e?.data?._server_messages ||
          //       e?.error ||
          //       e?.message ||
          //       'Failed to submit order.'
          //     );
          //   } finally {
          //     setBusy(null);
          //   }
          // };
          const postOrder = async (intent: 'place' | 'later') => {
            if (!values.agree_terms) {
              alert('Please agree to the terms and conditions.');
              return;
            }

            try {
              setBusy(intent);

              const payload: any = {
                ...values,
                item_code: values.afo_item_code,
                customer: user?.customer_id,
                payment_status: intent === 'later' ? 'Draft' : undefined,
                heel_to_sulcus_cm: Number(values.heel_to_sulcus_cm),
                heel_to_toe_cm: Number(values.heel_to_toe_cm),
                ankle_circumference_cm: Number(values.ankle_circumference_cm),
                widest_calf_circumference_cm: Number(values.widest_calf_circumference_cm),
                forefoot_ml_cm: Number(values.forefoot_ml_cm),
                fibula_head_circumference_cm: Number(values.fibula_head_circumference_cm),
                fibula_head_ml_cm: Number(values.fibula_head_ml_cm),
                fibula_head_to_ankle_cm: Number(values.fibula_head_to_ankle_cm),
                widest_calf_ml_cm: Number(values.widest_calf_ml_cm),
                ankle_ml_cm: Number(values.ankle_ml_cm),
                ankle_to_ground_cm: Number(values.ankle_to_ground_cm),
                agree_terms: Boolean(values.agree_terms),
                qty: 1,
              };

              let res: CreateOk;

              // 🔥 Check if any files exist
              const hasAnyFiles = (values.left_leg_file as any) instanceof File ||
                (values.right_leg_file as any) instanceof File;

              if (!hasAnyFiles) {
                // ✅ No files - send plain JSON
                console.log('📤 Sending JSON payload (no files)');
                res = (await createOrder(payload).unwrap()) as CreateOk;

              } else {
                // ✅ Has files - try S3 upload first
                const uploadedFiles: any = {};
                let useS3 = true;

                if ((values.left_leg_file as any) instanceof File) {
                  try {
                    const meta = await uploadFileAndStoreMetadata(
                      values.left_leg_file as unknown as File,
                      user?.customer_id || '1'
                    );
                    uploadedFiles.left_leg_file = { url: meta.key };
                    console.log('✅ Left leg uploaded to S3:', meta.key);
                  } catch (err) {
                    console.warn('❌ Left leg S3 upload failed, using multipart', err);
                    useS3 = false;
                  }
                }

                if ((values.right_leg_file as any) instanceof File && useS3) {
                  try {
                    const meta = await uploadFileAndStoreMetadata(
                      values.right_leg_file as unknown as File,
                      user?.customer_id || '1'
                    );
                    uploadedFiles.right_leg_file = { url: meta.key };
                    console.log('✅ Right leg uploaded to S3:', meta.key);
                  } catch (err) {
                    console.warn('❌ Right leg S3 upload failed, using multipart', err);
                    useS3 = false;
                  }
                }

                if (useS3 && Object.keys(uploadedFiles).length > 0) {
                  // S3 upload succeeded - send JSON with paths
                  delete payload.left_leg_file;
                  delete payload.right_leg_file;
                  payload.uploaded_files = uploadedFiles;

                  console.log('📤 Sending JSON payload with S3 paths');
                  res = (await createOrder(payload).unwrap()) as CreateOk;

                } else {
                  // S3 upload failed - use FormData fallback
                  console.log('📤 Sending FormData (S3 failed)');
                  const bodyOrForm = buildBodyOrForm(values);
                  res = (await createOrder(bodyOrForm).unwrap()) as CreateOk;
                }
              }

              // 🔥 Common response handling (no duplication!)
              const { ok, salesId, aspOrderId, note } = normalizeCreateResponse(res);

              if (!ok) {
                alert(note || 'Order creation failed.');
                return;
              }

              if (intent === 'later') {
                alert(
                  `Order saved. You can pay later.${
                    salesId ? ` (SO: ${salesId})` : ''
                  }`
                );
                router.push('/orders');
                return;
              }

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

          const stepFields: Record<number, string[]> = {
            0: ['product_type', 'first_name', 'last_name', 'parent_mobile', 'date_of_birth'],
            1: [
              'heel_to_sulcus_cm',
              'heel_to_toe_cm',
              'fibula_head_circumference_cm',
              'fibula_head_ml_cm',
              'fibula_head_to_ankle_cm',
              'widest_calf_circumference_cm',
              'widest_calf_ml_cm',
              'ankle_circumference_cm',
              'ankle_ml_cm',
              'ankle_to_ground_cm',
              'forefoot_ml_cm',
              'afo_item_code'
            ],
            2: ['medical_condition', 'treatment_suggested', 'special_instructions']
          };

          return (
            <Form>
              <fieldset
                disabled={isReadOnly}
                className={isReadOnly ? 'opacity-70 pointer-events-none' : ''}
              >
                {activeStep === 0 && (
                  <PatientDetails
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    shouldShowError={shouldShowError}
                    UI={{ Input, Label, SelectBox, DatePicker, Textarea }}
                  />
                )}
                {activeStep === 1 && (
                  <AFOMeasurement
                    values={values}
                    errors={errors}
                    touched={touched}
                    shouldShowError={shouldShowError}
                    handleChange={handleChange}
                    setFieldValue={setFieldValue}
                    afoOptions={afoOptions}
                    setAnkleValue={setAnkleValue}
                  />
                )}
                {activeStep === 2 && (
                  <Assessment
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    shouldShowError={shouldShowError}
                  />
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
                    productCode={values.afo_item_code}
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
                <Button
                  type="button"
                  onClick={() => setActiveStep(s => s - 1)}
                  disabled={activeStep === 0}
                >
                  Previous
                </Button>

                {activeStep < steps.length - 1 && (
                  <Button
                    type="button"
                    onClick={async () => {
                      const errors = await validateForm();
                      const fields = stepFields[activeStep] || [];
                      const hasError = fields.some(f => Boolean((errors as any)[f]));

                      if (hasError) {
                        const t: any = {};
                        fields.forEach(f => (t[f] = true));
                        setTouched(t);
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
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-sm">
                  Read-only mode enabled
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}


// 'use client';
//
// import React, { useEffect, useState } from 'react';
// import { Formik, Form, type FormikTouched } from 'formik';
// import * as Yup from 'yup';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
//
// import AFOMeasurement from './steps/AFO/AFOMeasurementsStep';
// import Assessment from './steps/AFO/Assessment';
// import PatientDetails from './steps/AFO/AfoPatientDetails';
//
// import ScanUpload from './steps/AFO/ScanUpload';
// import ASPFinishPayment from './steps/ASP/ASPFinishPayment';
//
// import {
//   useCreateAfoOrderMutation,
//   useGetAFOEstimateMutation,
//   useValidateCouponMutation,
//   useGetOrderDetailsMutation,
//   useGetAFOItemOptionsMutation
// } from '@/rtk-query/apis/orders';
//
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';
// import { SelectBox } from '@/components/ui/selectbox';
//
// import { usePaymentLauncher } from '@/hooks/usePaymentLauncher';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { DatePicker } from '@/components/ui/datepicker';
//
// /* ---------------------------------- */
//
// const ITEM_CODE = 'AFO-P';
//
// /* ---------------------------------- */
//
// // SAME AS YOUR FILE ABOVE
// // ONLY ADDITIONS ARE MARKED
//
// /* ---------------------------------- */
//
// const Schema = Yup.object({
//
//   // Patient
//   product_type: Yup.string().required('Select product type'), // 🔹 ADDED
//
//   first_name: Yup.string().required(),
//   last_name: Yup.string().required(),
//   parent_mobile: Yup.string().required(),
//   date_of_birth: Yup.string().required(),
//
//   // Measurements
//   heel_to_sulcus_cm: Yup.number().required(),
//   heel_to_toe_cm: Yup.number().required(),
//
//   fibula_head_circumference_cm: Yup.number().required(), // 🔹 ADDED
//   fibula_head_ml_cm: Yup.number().required(),             // 🔹 ADDED
//   fibula_head_to_ankle_cm: Yup.number().required(),     // 🔹 ADDED
//
//   widest_calf_circumference_cm: Yup.number().required(),
//   widest_calf_ml_cm: Yup.number().required(),             // 🔹 ADDED
//
//   ankle_circumference_cm: Yup.number().required(),
//   ankle_ml_cm: Yup.number().required(),                   // 🔹 ADDED
//   ankle_to_ground_cm: Yup.number().required(),     // 🔹 ADDED
//
//   forefoot_ml_cm: Yup.number().required(),
//
//   afo_item_code: Yup.string().required('Select AFO model'),
//
//   // DAFO only
//   ankle_joint_type: Yup.string().when('product_type', {   // 🔹 ADDED
//     is: 'DAFO',
//     then: s => s.required('Select ankle joint'),
//   }),
//
//   // Clinical
//   medical_condition: Yup.string().required(),
//   treatment_suggested: Yup.string().required(),
//   special_instructions: Yup.string().required(),
//
//   agree_terms: Yup.boolean().oneOf([true])
// });
//
// /* ---------------------------------- */
//
// const steps = [
//   { key: 'patient', label: 'Patient' },
//   { key: 'measurement', label: 'Measurements' },
//   { key: 'clinical', label: 'Clinical' },
//   { key: 'scan', label: 'Scan & Upload' },
//   { key: 'finish', label: 'Finish & Payment' }
// ] as const;
//
// /* ---------------------------------- */
// type CranialOrderFormProps = { item_type?: string };
//
// export default function AFOOrderForm(_: CranialOrderFormProps) {
//
//   const [activeStep, setActiveStep] = useState(0);
//   const [getAFOItems] = useGetAFOItemOptionsMutation();
//   const [afoOptions, setAfoOptions] = useState<any[]>([]);
//
//   const [isPlacing, setIsPlacing] = useState(false);
//   const [isSavingLater, setIsSavingLater] = useState(false);
//   const [isEstimating, setIsEstimating] = useState(false);
//
//   const searchParams = useSearchParams();
//   const orderId = searchParams.get('orderId');
//   const deviceTypeId = searchParams.get('deviceType');
//   const isReadOnly = searchParams.get('readonly') === 'true';
//
//   const [couponData, setCouponData] = useState<any>(null);
//
//   const { user }: any = useSelector((s: any) => s.userReducer);
//
//
//   /* ---------------------------------- */
//   // APIs
//
//   const [getEstimate] = useGetAFOEstimateMutation();
//   const [createOrder] = useCreateAfoOrderMutation();
//   const [validateCoupon] = useValidateCouponMutation();
//   const [getOrderDetails] = useGetOrderDetailsMutation();
//   const [ankleValue, setAnkleValue] = useState<number | null>(null);
//
//   /* ---------------------------------- */
//
//   const initialValues = {
//
//     /* Patient */
//     first_name: '',
//     last_name: '',
//     parent_name: '',
//     parent_mobile: '',
//     gender: '',
//     date_of_birth: '',
//     weight: '',
//     email: '',
//     clinic_name: '',
//     product_type: 'AFO', // default
// // AFO Item Selection
//     afo_size: '',
//     afo_item_code: '',
//     afo_item_name: '',
//     item_code: ITEM_CODE,
//
//     /* Measurement */
//     heel_to_sulcus_cm: '',
//     heel_to_toe_cm: '',
//
//     fibula_head_circumference_cm: '', // 🔹
//     fibula_head_ml_cm: '',             // 🔹
//     fibula_head_to_ankle_cm: '',     // 🔹
//
//     widest_calf_circumference_cm: '',
//     widest_calf_ml_cm: '',             // 🔹
//
//     ankle_circumference_cm: '',
//     ankle_ml_cm: '',                   // 🔹
//     ankle_to_ground_cm: '',     // 🔹
//
//     forefoot_ml_cm: '',
//     ankle_joint_type: '',
//
//     /* Clinical */
//     medical_condition: '',
//     special_instructions: '',
//     assessment_date: '',
//     treatment_suggested: '',
//
//     /* Upload */
//     laterality: '',
//     left_leg_file: null,
//     right_leg_file: null,
//     drive_url: '',
//
//     /* Pricing */
//     coupon_code: '',
//     agree_terms: false,
//     design_by: 'Addiwise',
//     print_by: 'Addiwise',
//     design_price: '0.00',
//     print_price: '0.00',
//     estimate_price: '0.00',
//     discounted_price: '0.00',
//     gst_18: '0.00',
//     total_price: '0.00',
//   };
//
//   /* ---------------------------------- */
//   // Prefill (Edit Order)
//
//   const [formSeed, setFormSeed] = useState(initialValues);
//   const [prefilled, setPrefilled] = useState(false);
//
//   useEffect(() => {
//     const hydrate = async () => {
//       if (!orderId || !deviceTypeId) return;
//
//       try {
//         const resp: any = await getOrderDetails({
//           order_type: deviceTypeId,
//           order_id: orderId,
//         }).unwrap();
//
//         const d = resp?.data || resp?.message?.data || {};
//         if (d.ankle_circumference_cm) {
//           setAnkleValue(Number(d.ankle_circumference_cm));
//         }
//
//         if (!d) return;
//
//         const seed = {
//           ...initialValues,
//
//           /* ---------------- PATIENT ---------------- */
//           product_type: d.product_type || 'AFO',
//
//           first_name: d.first_name || '',
//           last_name: d.last_name || '',
//           parent_name: d.parent_name || '',
//           parent_mobile: d.parent_mobile || '',
//           gender: d.gender || '',
//           date_of_birth: d.date_of_birth || '',
//           weight: d.weight || '',
//           email: d.email || '',
//           clinic_name: d.clinic_name || '',
//
//           /* ---------------- ITEM ---------------- */
//           afo_item_code: d.item_code || '',
//           afo_item_name: d.item_name || '',
//
//           /* ---------------- MEASUREMENTS ---------------- */
//           heel_to_sulcus_cm: d.heel_to_sulcus_cm ?? '',
//           heel_to_toe_cm: d.heel_to_toe_cm ?? '',
//
//           fibula_head_circumference_cm: d.fibula_head_circumference_cm ?? '',
//           fibula_head_ml_cm: d.fibula_head_ml_cm ?? '',
//           fibula_head_to_ankle_cm: d.fibula_head_to_ankle_cm ?? '',
//
//           widest_calf_circumference_cm: d.widest_calf_circumference_cm ?? '',
//           widest_calf_ml_cm: d.widest_calf_ml_cm ?? '',
//
//           ankle_circumference_cm: d.ankle_circumference_cm ?? '',
//           ankle_ml_cm: d.ankle_ml_cm ?? '',
//           ankle_to_ground_cm: d.ankle_to_ground_cm ?? '',
//
//           forefoot_ml_cm: d.forefoot_ml_cm ?? '',
//
//           ankle_joint_type: d.ankle_joint_type || '',
//
//           /* ---------------- CLINICAL ---------------- */
//           medical_condition: d.medical_condition || '',
//           treatment_suggested: d.treatment_suggested || '',
//           special_instructions: d.special_instructions || '',
//           assessment_date: d.assessment_date || '',
//
//           /* ---------------- UPLOAD ---------------- */
//           laterality: d.laterality || '',
//           left_leg_file: d.left_leg_file || null,
//           right_leg_file: d.right_leg_file || null,
//           drive_url: d.drive_url || '',
//
//           /* ---------------- PRICING ---------------- */
//           design_price: d.design_price || '0.00',
//           print_price: d.print_price || '0.00',
//           estimate_price: d.estimate_price || '0.00',
//           discounted_price: d.discounted_price || '0.00',
//           gst_18: d.gst_18 || '0.00',
//           total_price: d.total_price || '0.00',
//
//         };
//
//         setFormSeed(seed);
//         setPrefilled(true);
//       } catch (e) {
//         console.error('Hydration failed:', e);
//         setPrefilled(false);
//       }
//     };
//
//     hydrate();
//   }, [orderId, deviceTypeId]);
//
//   useEffect(() => {
//
//     if (!ankleValue || ankleValue <= 0) {
//       setAfoOptions([]);
//       return;
//     }
//
//     const loadOptions = async () => {
//       try {
//         const res = await getAFOItems({
//           ankle_circumference: ankleValue
//         }).unwrap();
//
//         // safer extraction
//         const items =
//           res?.message?.data ||
//           res?.data ||
//           [];
//
//         setAfoOptions(items);
//
//       } catch (e) {
//         console.error('AFO load failed', e);
//         setAfoOptions([]);
//       }
//     };
//
//     loadOptions();
//
//   }, [ankleValue]);
//
//   /* ---------------------------------- */
//
//   return (
//
//     <div className="w-full">
//
//       {/* Header */}
//       <div className="sticky top-0 z-10 bg-primary text-white px-4 py-3">
//
//         <div className="font-semibold text-center">
//           Step {activeStep + 1} of {steps.length} — {steps[activeStep].label}
//         </div>
//
//       </div>
//
//       <Formik
//         initialValues={prefilled ? formSeed : initialValues}
//         validationSchema={Schema}
//         onSubmit={() => {}}
//         enableReinitialize
//       >
//
//         {({
//             values,
//             errors,
//             touched,
//             setFieldValue,
//             handleChange,
//             validateForm,
//             setTouched
//           }) => {
//           const shouldShowError = (field: string, force = false) =>
//             !!(
//               (touched as any)?.[field] &&
//               (errors as any)?.[field]
//             );
//
//           /* ---------------- Estimate ---------------- */
//
//           const onEstimate = async () => {
//             setIsEstimating(true);
//
//             const estimatePayload = {
//               item_code: values.afo_item_code,
//               design_by: values.design_by,
//               print_by: values.print_by,
//               discount_per: couponData?.discount_percentage || 0,
//               discount_amt: couponData?.discount_amount || 0,
//               coupon_code: (values.coupon_code || '').trim()
//             };
//
//             try {
//               const response = await getEstimate(estimatePayload).unwrap();
//
//               // ✅ CORRECT EXTRACTION
//               const apiRes = response?.data || {};
//
//               setFieldValue('design_price', apiRes.design || '0.00');
//               setFieldValue('print_price', apiRes.print || '0.00');
//
//               setFieldValue('estimate_price', apiRes.estimate_price || '0.00');
//               setFieldValue('item_standard_discount', apiRes.item_standard_discount || '0.00');
//               setFieldValue('additional_discount', apiRes.additional_discount || '0.00');
//               setFieldValue('discounted_price', apiRes.discounted_price || '0.00');
//
//               setFieldValue('gst_5', apiRes.gst_5 || '0.00');
//               setFieldValue('gst_18', apiRes.gst_18 || '0.00');
//               setFieldValue('total_price', apiRes.total_price || '0.00');
//
//             } catch (err: any) {
//               toast.error(err?.data?.message || 'Failed to get estimate');
//             } finally {
//               setIsEstimating(false);
//             }
//           };
//
//           /* ---------------------- COUPON ---------------------- */
//           const onValidateCoupon = async (code: string) => {
//             const res = await validateCoupon({ coupon_code: code }).unwrap();
//             setCouponData(res?.data || null);
//             return res;
//           };
//
//           /* ---------------------- PLACE ORDER ---------------------- */
//           const router = useRouter();
//           const { startPayment } = usePaymentLauncher();
//           const [busy, setBusy] = useState<'place' | 'later' | null>(null);
//
//           const buildBodyOrForm = (values: any) => {
//             const hasFile =
//               values.left_leg_file instanceof File ||
//               values.right_leg_file instanceof File;
//
//             // No file → send normal JSON (optional)
//             if (!hasFile) {
//               return {
//                 data: JSON.stringify({
//                   ...values,
//                   item_code: values.afo_item_code, // force correct item_code
//                 }),
//               };
//             }
//
//             const fd = new FormData();
//
//             // 🔥 Build JSON payload exactly like backend expects
//             const payload = {
//               ...values,
//
//               // force correct item code
//               item_code: values.afo_item_code,
//               afo_item_code: values.afo_item_code,
//
//               // type fixes
//               heel_to_sulcus_cm: Number(values.heel_to_sulcus_cm),
//               heel_to_toe_cm: Number(values.heel_to_toe_cm),
//               ankle_circumference_cm: Number(values.ankle_circumference_cm),
//               widest_calf_circumference_cm: Number(values.widest_calf_circumference_cm),
//               forefoot_ml_cm: Number(values.forefoot_ml_cm),
//               fibula_head_circumference_cm: Number(values.fibula_head_circumference_cm),
//               fibula_head_ml_cm: Number(values.fibula_head_ml_cm),
//               fibula_head_to_ankle_cm: Number(values.fibula_head_to_ankle_cm),
//               widest_calf_ml_cm: Number(values.widest_calf_ml_cm),
//               ankle_ml_cm: Number(values.ankle_ml_cm),
//               ankle_to_ground_cm: Number(values.ankle_to_ground_cm),
//
//               agree_terms: Boolean(values.agree_terms),
//
//               qty: 1,
//             };
//
//             // ❗ Remove file objects from JSON
//             delete payload.left_leg_file;
//             delete payload.right_leg_file;
//
//             // ✅ Append FULL JSON as "data"
//             fd.append('data', JSON.stringify(payload));
//
//             // ✅ Append files separately
//             if (values.left_leg_file instanceof File) {
//               fd.append('left_leg_file', values.left_leg_file);
//             }
//
//             if (values.right_leg_file instanceof File) {
//               fd.append('right_leg_file', values.right_leg_file);
//             }
//
//             return fd;
//           };
//
//
//
//           type CreateOk =
//             | {
//             message: {
//               status: string;
//               message?: string;
//               sales_order_id?: string;
//               addishield_pro_order_id?: string;
//             };
//           }
//             | {
//             status: string;
//             message?: string;
//             sales_order_id?: string;
//             addishield_pro_order_id?: string;
//           }
//             | string
//             | Record<string, any>
//             | undefined
//             | null;
//
//
//           function normalizeCreateResponse(res: unknown) {
//             let ok = false;
//             let salesId: string | undefined;
//             let aspOrderId: string | undefined;
//             let note = '';
//
//             if (res == null) return { ok, salesId, aspOrderId, note: 'Empty response' };
//
//             if (typeof res === 'string') {
//               ok = /success|ok/i.test(res);
//               note = res;
//               return { ok, salesId, aspOrderId, note };
//             }
//
//             const obj = res as Record<string, any>;
//             const msgObj = obj?.message;
//
//             const statusStr =
//               (typeof msgObj?.status === 'string' && msgObj.status) ||
//               (typeof obj?.status === 'string' && obj.status) ||
//               '';
//
//             ok = /success|ok/i.test(statusStr);
//
//             // ✅ SALES ORDER ID (payment)
//             salesId =
//               msgObj?.sales_order_id ??
//               obj?.sales_order_id ??
//               obj?.data?.sales_order_id;
//
//             // ✅ ASP ORDER ID (reference)
//             aspOrderId =
//               msgObj?.addishield_pro_order_id ??
//               obj?.addishield_pro_order_id ??
//               obj?.data?.addishield_pro_order_id;
//
//             note =
//               (typeof msgObj?.message === 'string' && msgObj.message) ||
//               (typeof obj?.message === 'string' && obj.message) ||
//               statusStr ||
//               '';
//
//             return { ok, salesId, aspOrderId, note };
//           }
//
//
//           // ✅ postOrder now uses the reusable payment launcher
//           const postOrder = async (intent: 'place' | 'later') => {
//             if (!values.agree_terms) {
//               alert('Please agree to the terms and conditions.');
//               return;
//             }
//
//             try {
//               setBusy(intent);
//
//               const payload = {
//                 ...values,
//                 item_code: values.afo_item_code,
//                 customer: user?.customer_id,
//                 payment_status: intent === 'later' ? 'Draft' : undefined,
//               };
//
//
//               const bodyOrForm = buildBodyOrForm(payload);
//               const res = (await createOrder(bodyOrForm).unwrap()) as CreateOk;
//
//               const { ok, salesId, aspOrderId, note } = normalizeCreateResponse(res);
//
//               if (!ok) {
//                 alert(note || 'Order creation failed.');
//                 return;
//               }
//
//               // ✅ Pay later
//               if (intent === 'later') {
//                 alert(
//                   `Order saved. You can pay later.${
//                     salesId ? ` (SO: ${salesId})` : ''
//                   }`
//                 );
//                 router.push('/orders');
//                 return;
//               }
//
//               // ✅ Pay & Place
//               if (!salesId) {
//                 alert('Order created but Sales Order ID missing.');
//                 return;
//               }
//
//               const raw = String(values.total_price ?? '0').replace(/,/g, '');
//               const amount = Number(parseFloat(raw || '0').toFixed(2));
//               if (!amount || amount <= 0) {
//                 alert('Invalid payment amount.');
//                 return;
//               }
//
//               await startPayment(salesId);
//
//             } catch (e: any) {
//               alert(
//                 e?.data?.message ||
//                 e?.data?._server_messages ||
//                 e?.error ||
//                 e?.message ||
//                 'Failed to submit order.'
//               );
//             } finally {
//               setBusy(null);
//             }
//           };
//
//           const placeOrder = () => postOrder('place');
//           const payLater = () => postOrder('later');
//
//           /* ---------------- Place Order ---------------- */
//
//
//           /* ---------------- Step Validation ---------------- */
//
//           const stepFields: Record<number, string[]> = {
//
//             0: [
//               'product_type', // 🔹
//               'first_name',
//               'last_name',
//               'parent_mobile',
//               'date_of_birth'
//             ],
//
//             1: [
//               'heel_to_sulcus_cm',
//               'heel_to_toe_cm',
//
//               'fibula_head_circumference_cm', // 🔹
//               'fibula_head_ml_cm',             // 🔹
//               'fibula_head_to_ankle_cm',     // 🔹
//
//               'widest_calf_circumference_cm',
//               'widest_calf_ml_cm',             // 🔹
//
//               'ankle_circumference_cm',
//               'ankle_ml_cm',                   // 🔹
//               'ankle_to_ground_cm',     // 🔹
//
//               'forefoot_ml_cm',
//
//               'afo_item_code'
//             ],
//
//             2: [
//               'medical_condition',
//               'treatment_suggested',
//               'special_instructions'
//             ]
//           };
//
//           /* ---------------------------------- */
//
//           return (
//
//             <Form>
//
//               <fieldset
//                 disabled={isReadOnly}
//                 className={isReadOnly ? 'opacity-70 pointer-events-none' : ''}
//               >
//
//                 {activeStep === 0 && (
//                   <PatientDetails
//                     values={values}
//                     errors={errors}
//                     touched={touched}
//                     setFieldValue={setFieldValue}
//                     handleChange={handleChange}
//                     shouldShowError={shouldShowError}
//                     UI={{ Input, Label, SelectBox, DatePicker, Textarea }}
//                   />
//                 )}
//                 {activeStep === 1 && (
//                   <AFOMeasurement
//                     values={values}
//                     errors={errors}
//                     touched={touched}
//                     shouldShowError={shouldShowError}
//                     handleChange={handleChange}
//                     setFieldValue={setFieldValue}
//                     afoOptions={afoOptions}
//                     setAnkleValue={setAnkleValue}
//                   />
//                 )}
//                 {activeStep === 2 && (
//                   <Assessment
//                     values={values}
//                     errors={errors}
//                     touched={touched}
//                     handleChange={handleChange}
//                     shouldShowError={shouldShowError}
//                   />
//                 )}
//
//                 {activeStep === 3 && (
//                   <ScanUpload
//                     values={values}
//                     setFieldValue={setFieldValue}
//                     UI={{ Input, Label, Card, Textarea }}
//                   />
//                 )}
//
//                 {activeStep === 4 && (
//                   <ASPFinishPayment
//                     values={values}
//                     productCode={values.afo_item_code}
//                     UI={{ Input, Button, Label, Card, SelectBox }}
//                     onEstimate={onEstimate}
//                     onValidateCoupon={onValidateCoupon}
//                     onPlaceOrder={placeOrder}
//                     onPayLater={payLater}
//                     isPlacing={isPlacing}
//                     isSavingLater={isSavingLater}
//                     setFieldValue={setFieldValue}
//                   />
//                 )}
//
//               </fieldset>
//
//               {/* Navigation */}
//               <div className="flex justify-between mt-6">
//
//                 <Button
//                   type="button"
//                   onClick={() => setActiveStep(s => s - 1)}
//                   disabled={activeStep === 0}
//                 >
//                   Previous
//                 </Button>
//
//                 {activeStep < steps.length - 1 && (
//
//                   <Button
//                     type="button"
//                     onClick={async () => {
//
//                       const errors = await validateForm();
//
//                       const fields = stepFields[activeStep] || [];
//
//                       const hasError = fields.some(
//                         f => Boolean((errors as any)[f])
//                       );
//
//                       if (hasError) {
//
//                         const t: any = {};
//                         fields.forEach(f => (t[f] = true));
//                         setTouched(t);
//
//                         return;
//                       }
//
//                       setActiveStep(s => s + 1);
//                     }}
//                   >
//                     Next
//                   </Button>
//                 )}
//
//               </div>
//
//               {isReadOnly && (
//                 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-sm">
//                   Read-only mode enabled
//                 </div>
//               )}
//
//             </Form>
//           );
//         }}
//
//       </Formik>
//     </div>
//   );
// }
