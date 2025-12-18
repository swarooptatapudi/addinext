'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Formik, Form, type FormikTouched } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/datepicker';
import { Card } from '@/components/ui/card';

import {
  calculateCephalicRatio,
  calculateCVAI,
  makeProductCode,
  type SeverityCode,
  type ConditionCode
} from '@/lib/metrics';

import HkafoPatientDetails from './steps/HkafoPatientDetails';
import HkafoMeasurement from './steps/HkafoMeasurement';
import HkafoClinicalAssessment from './steps/HkafoClinicalAssessment';
import ScanUpload from './steps/ScanUpload';
import FinishPayment from './steps/FinishPayment';

import {
  useCreateCranialOrderMutation,
  useValidateCouponMutation,
  useGetOrderDetailsMutation,
  usePreSignedUrlMutation
} from '@/rtk-query/apis/orders';
// ❌ removed paymentsApi + useCreatePaymentOrderMutation imports
// import { paymentsApi, useCreatePaymentOrderMutation } from '@/rtk-query/apis/payments';

import { USER } from '@/uttils/Types';
import { estimateOrderClientSide } from '@/uttils/getEstimate';
import { baseQueryWithReauth } from '@/rtk-query/apis';

// ✅ reusable payment launcher
import { usePaymentLauncher } from '@/hooks/usePaymentLauncher';

/* ------------------------------- Types/Schema ------------------------------ */

type FormValues = {
  item_code?: string;
  customer?: string;

  // Patient
  patient_name?: string;
  first_name?: string;
  last_name?: string;
  parent_name?: string;
  parent_mobile?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: string;
  weight_kg?: string | number;
  email?: string;
  clinic_name?: string;
  consultant?: string;
  type?: string;
  today_date?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  orthotist?: string;
  diagnosis?: string;
  delivery_date?: string;
  po_number?: string;

  // Measurements
  ap?: string;
  ml?: string;
  da?: string;
  db?: string;
  hc?: string;
  tw?: string;
  circ_waist?: string;
  circ_iliac_crest?: string;
  circ_greater_trochanter?: string;
  circ_perineum?: string;
  circ_upper_mid_thigh?: string;
  circ_lower_mid_thigh?: string;
  circ_upper_mid_calf?: string;
  circ_lower_mid_calf?: string;

  ml_waist?: string;
  ml_iliac_crest?: string;
  ml_greater_trochanter?: string;
  ml_perineum?: string;
  ml_mid_thigh?: string;
  ml_knee_axis?: string;
  ml_mid_calf?: string;
  ml_ankle_axis?: string;

  length_ankle_axis_to_mid_tibia?: string;
  length_ground_to_fibular_neck?: string;
  length_ground_to_knee_axis?: string;
  length_ground_to_perineum_30mm_down?: string;
  length_ground_to_ischial_tuberosity?: string;
  length_ground_to_greater_trochanter?: string;
  length_ground_to_pelvic_line?: string;
  length_ground_to_waist_line?: string;
  measurement_unit?: 'cm' | 'in';

  ankle_frontal_alignment?: string;
  ankle_flexibility?: string;
  ankle_frontal_degrees?: string;
  ankle_rotation?: string;
  ankle_plane?: string;
  ankle_plane_degrees?: string;
  ankle_heel_height?: string;

  knee_alignment?: string;
  knee_flexibility?: string;
  knee_alignment_degrees?: string;
  knee_sagittal_condition?: string;
  knee_sagittal_degrees?: string;

  // Derived (display)
  cr?: number;
  cvai?: number;

  // Clinical
  occipital_area?: string;
  parietal_area?: string;
  frontal_area?: string;
  ear_alignment?: string;

  // Diagnosis
  positional?: string;
  severity?: 'L' | 'M' | 'S' | '' | 'Light' | 'Moderate' | 'Severe';
  torticollis?: string;

  // Surgical & others
  post_surgical?: string;
  suture_type_surgical_diagnoses_only?: string;
  date_of_surgery?: string;
  surgical_complications?: string;
  other_diagnosis_and_syndromes?: string;

  // Files & remarks
  scan_file?: File | null;
  extra_files?: File[];
  patient_remarks?: string;
  other_remarks?: string;
  scan_gdrive_link?: string;

  // UI / selections
  design_by?: string;
  print_by?: string;
  colour?: string;
  thickness_3d_mm?: string;
  coupon_code?: string;
  coupon_id?: string;
  agree_terms?: boolean;

  // From SERVER ONLY
  design_price?: string | number;
  print_price?: string | number;
  item_special_discount?: string | number;
  item_standard_discount?: string | number;
  additional_discount?: string | number;
  discounted_price?: string | number;
  gst_5_amt?: string | number;
  gst_18_amt?: string | number;
  total_price?: string | number;

  // For flags
  gst_rate?: 0 | 0.05 | 0.18;
};

const HKAFO_LIMITS = {
  circ_waist: { min: 43.4, max: 110 },
  circ_iliac_crest: { min: 44.2, max: 115 },
  circ_greater_trochanter: { min: 46.8, max: 120 },
  circ_perineum: { min: 35.7, max: 110 },
  circ_upper_mid_thigh: { min: 40.8, max: 70 },
  circ_lower_mid_thigh: { min: 39.1, max: 65 },
  circ_upper_mid_calf: { min: 27.2, max: 42 },
  circ_lower_mid_calf: { min: 25.5, max: 39 },
  ml_waist: { min: 13.6, max: 35 },
  ml_iliac_crest: { min: 14.4, max: 38 },
  ml_greater_trochanter: { min: 15.3, max: 25 },
  ml_perineum: { min: 10.2, max: 15 },
  ml_mid_thigh: { min: 12.8, max: 22 },
  ml_knee_axis: { min: 6.8, max: 18 },
  ml_mid_calf: { min: 10.2, max: 15 },
  ml_ankle_axis: { min: 4.7, max: 12 },
  length_ankle_axis_to_mid_tibia: { min: 9.2, max: 25 },
  length_ground_to_fibular_neck: { min: 10, max: 34.7 },
  length_ground_to_knee_axis: { min: 23.1, max: 60 },
  length_ground_to_perineum_30mm_down: { min: 30, max: 105 },
  length_ground_to_ischial_tuberosity: { min: 30.3, max: 115 },
  length_ground_to_greater_trochanter: { min: 37.6, max: 110 },
  length_ground_to_pelvic_line: { min: 37.6, max: 120 },
  length_ground_to_waist_line: { min: 49.1, max: 125 }
} as const;
const cmToIn = (cm: number) => cm / 2.54;

const MIN_PATIENT_AGE_MONTHS = 18;

const getMinAllowedDob = () => {
  const now = new Date();
  const d = new Date(now);
  d.setMonth(d.getMonth() - MIN_PATIENT_AGE_MONTHS);
  d.setHours(0, 0, 0, 0);
  return d;
};

const applyHkafoRange = (key: keyof typeof HKAFO_LIMITS, schema: any) =>
  schema.test('hkafo-range', '', function (this: Yup.TestContext, value: unknown) {
    if (value === undefined || value === null || value === '') return true;

    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return true;

    const parent = this.parent as { measurement_unit?: 'cm' | 'in' } | undefined;
    const unit = parent?.measurement_unit === 'in' ? 'in' : 'cm';
    const { min, max } = HKAFO_LIMITS[key];

    if (unit === 'in') {
      const minIn = Number(cmToIn(min).toFixed(1));
      const maxIn = Number(cmToIn(max).toFixed(1));
      if (num < minIn || num > maxIn) {
        return this.createError({ message: `Value must be between ${minIn} and ${maxIn} in` });
      }
      return true;
    }

    if (num < min || num > max) {
      return this.createError({ message: `Value must be between ${min} and ${max} cm` });
    }
    return true;
  });

const Schema = Yup.object({
  // Patient details (step 0)
  patient_name: Yup.string().required('Patient name is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  date_of_birth: Yup.string()
    .required('Date of birth is required')
    .test(
      'min-age-1-5-years',
      'Patient must be at least 1.5 years old',
      (value) => {
        if (!value) return true; // handled by required()
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) {
          return false;
        }
        const minDob = getMinAllowedDob();
        return dob <= minDob;
      }
    ),
  weight_kg: Yup.number().typeError('Enter weight (kg)').positive('Must be a positive value').required('Weight is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  clinic_name: Yup.string().required('Clinic name is required'),
  parent_mobile: Yup.string().required('Mobile number is required along with country code'),

  // Measurements (step 1) - require numeric > 0
  ap: Yup.number().typeError('Enter a number').positive('Must be a positive value').required('AP is required'),
  ml: Yup.number().typeError('Enter a number').positive('Must be a positive value').required('ML is required'),
  da: Yup.number().typeError('Enter a number').positive('Must be a positive value').required('Diagonal A is required'),
  db: Yup.number().typeError('Enter a number').positive('Must be a positive value').required('Diagonal B is required'),
  hc: Yup.number().typeError('Enter a number').positive('Must be a positive value').required('Head circumference is required'),
  tw: Yup.number().typeError('Enter a number').positive('Must be a positive value').required('Temple width is required'),

  // HKAFO / KAFO measurements (step 1) - all mandatory
  circ_waist: applyHkafoRange(
    'circ_waist',
    Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue == null ? undefined : value
      )
      .typeError('Enter a number')
  ).when('type', (deviceType: any, schema:any) =>
    deviceType === 'KAFO'
      ? schema.notRequired()
      : schema.required('Circumference is required')
  ),
  circ_iliac_crest: applyHkafoRange(
    'circ_iliac_crest',
    Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue == null ? undefined : value
      )
      .typeError('Enter a number')
  ).when('type', (deviceType: any, schema:any) =>
    deviceType === 'KAFO'
      ? schema.notRequired()
      : schema.required('Circumference is required')
  ),
  circ_greater_trochanter: applyHkafoRange(
    'circ_greater_trochanter',
    Yup.number().typeError('Enter a number')
  ).required('Circumference is required'),
  circ_perineum: applyHkafoRange(
    'circ_perineum',
    Yup.number().typeError('Enter a number')
  ).required('Circumference is required'),
  circ_upper_mid_thigh: applyHkafoRange(
    'circ_upper_mid_thigh',
    Yup.number().typeError('Enter a number')
  ).required('Circumference is required'),
  circ_lower_mid_thigh: applyHkafoRange(
    'circ_lower_mid_thigh',
    Yup.number().typeError('Enter a number')
  ).required('Circumference is required'),
  circ_upper_mid_calf: applyHkafoRange(
    'circ_upper_mid_calf',
    Yup.number().typeError('Enter a number')
  ).required('Circumference is required'),
  circ_lower_mid_calf: applyHkafoRange(
    'circ_lower_mid_calf',
    Yup.number().typeError('Enter a number')
  ).required('Circumference is required'),
  ml_waist: applyHkafoRange(
    'ml_waist',
    Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue == null ? undefined : value
      )
      .typeError('Enter a number')
  ).when('type', (deviceType: any, schema:any) =>
    deviceType === 'KAFO'
      ? schema.notRequired()
      : schema.required('M-L diameter is required')
  ),
  ml_iliac_crest: applyHkafoRange(
    'ml_iliac_crest',
    Yup.number()
      .transform((value, originalValue) =>
        originalValue === '' || originalValue == null ? undefined : value
      )
      .typeError('Enter a number')
  ).when('type', (deviceType: any, schema:any) =>
    deviceType === 'KAFO'
      ? schema.notRequired()
      : schema.required('M-L diameter is required')
  ),
  ml_greater_trochanter: applyHkafoRange(
    'ml_greater_trochanter',
    Yup.number().typeError('Enter a number')
  ).required('M-L diameter is required'),
  ml_perineum: applyHkafoRange(
    'ml_perineum',
    Yup.number().typeError('Enter a number')
  ).required('M-L diameter is required'),
  ml_mid_thigh: applyHkafoRange(
    'ml_mid_thigh',
    Yup.number().typeError('Enter a number')
  ).required('M-L diameter is required'),
  ml_knee_axis: applyHkafoRange(
    'ml_knee_axis',
    Yup.number().typeError('Enter a number')
  ).required('M-L diameter is required'),
  ml_mid_calf: applyHkafoRange(
    'ml_mid_calf',
    Yup.number().typeError('Enter a number')
  ).required('M-L diameter is required'),
  ml_ankle_axis: applyHkafoRange(
    'ml_ankle_axis',
    Yup.number().typeError('Enter a number')
  ).required('M-L diameter is required'),
  length_ankle_axis_to_mid_tibia: applyHkafoRange(
    'length_ankle_axis_to_mid_tibia',
    Yup.number().typeError('Enter a number')
  ).required('Ankle axis to mid tibia length is required'),
  length_ground_to_fibular_neck: applyHkafoRange(
    'length_ground_to_fibular_neck',
    Yup.number().typeError('Enter a number')
  ).required('Ground to fibular neck length is required'),
  length_ground_to_knee_axis: applyHkafoRange(
    'length_ground_to_knee_axis',
    Yup.number().typeError('Enter a number')
  ).required('Ground to knee axis length is required'),
  length_ground_to_perineum_30mm_down: applyHkafoRange(
    'length_ground_to_perineum_30mm_down',
    Yup.number().typeError('Enter a number')
  ).required('Ground to 30 mm below perineum level length is required'),
  length_ground_to_ischial_tuberosity: applyHkafoRange(
    'length_ground_to_ischial_tuberosity',
    Yup.number().typeError('Enter a number')
  ).required('Ground to ischial tuberosity length is required'),
  length_ground_to_greater_trochanter: applyHkafoRange(
    'length_ground_to_greater_trochanter',
    Yup.number().typeError('Enter a number')
  ).required('Ground to greater trochanter length is required'),
  length_ground_to_pelvic_line: applyHkafoRange(
    'length_ground_to_pelvic_line',
    Yup.number().typeError('Enter a number')
  ).required('Ground to pelvic line length is required'),
  length_ground_to_waist_line: applyHkafoRange(
    'length_ground_to_waist_line',
    Yup.number().typeError('Enter a number')
  ).required('Ground to waist line length is required'),
  ankle_frontal_alignment: Yup.string().required('Ankle frontal alignment is required'),
  ankle_flexibility: Yup.string().required('Ankle flexibility is required'),
  ankle_rotation: Yup.string().required('Ankle rotation is required'),
  ankle_plane: Yup.string().required('Ankle plane is required'),
  ankle_frontal_degrees: Yup.number()
    .typeError('Enter a number')
    .min(0, 'Must be zero or greater')
    .required('Ankle alignment degrees are required'),
  ankle_plane_degrees: Yup.number()
    .typeError('Enter a number')
    .min(0, 'Must be 0 or greater than 0')
    .required('Ankle plane degrees are required'),
  ankle_heel_height: Yup.number()
    .typeError('Enter a number')
    .min(0, 'Must be 0 or greater than 0')
    .required('Heel height is required'),
  knee_alignment: Yup.string().required('Knee alignment is required'),
  knee_flexibility: Yup.string().required('Knee flexibility is required'),
  knee_sagittal_condition: Yup.string().required('Knee sagittal condition is required'),
  knee_alignment_degrees: Yup.number()
    .typeError('Enter a number')
    .min(0, 'Must be 0 or greater than 0')
    .required('Knee alignment degrees are required'),
  knee_sagittal_degrees: Yup.number()
    .typeError('Enter a number')
    .min(0, 'Must be 0 or greater than 0')
    .required('Knee sagittal degrees are required'),

  // Computation doesn't add new fields  cr/cvai are derived so no required validation here

  // Assessment (step 3) - require the clinical/diagnosis fields
  occipital_area: Yup.string().required('Occipital area is required'),
  parietal_area: Yup.string().required('Parietal area is required'),
  frontal_area: Yup.string().required('Frontal area is required'),
  ear_alignment: Yup.string().required('Ear alignment is required'),

  positional: Yup.string().required('Positional diagnosis is required'),
  severity: Yup.string().required('Severity is required'),
  torticollis: Yup.string().required('Torticollis is required'),


  // UI / selections that appear on the form
  design_by: Yup.string().required('Design by is required'),
  print_by: Yup.string().required('Print by is required'),
  colour: Yup.string().required('Colour is required'),
  agree_terms: Yup.boolean().oneOf([true], 'You must agree to terms'),

  // keep numbers monetary optional or validated elsewhere
});
const STEP_FIELDS: Record<number, string[]> = {
  0: [
    'patient_name',
    'first_name',
    'last_name',
    'parent_mobile',
    'date_of_birth',
    'height_cm',
    'weight_kg',
    'email',
    'clinic_name',
  ],
  1: [
    'circ_waist',
    'circ_iliac_crest',
    'circ_greater_trochanter',
    'circ_perineum',
    'circ_upper_mid_thigh',
    'circ_lower_mid_thigh',
    'circ_upper_mid_calf',
    'circ_lower_mid_calf',
    'ml_waist',
    'ml_iliac_crest',
    'ml_greater_trochanter',
    'ml_perineum',
    'ml_mid_thigh',
    'ml_knee_axis',
    'ml_mid_calf',
    'ml_ankle_axis',
    'length_ankle_axis_to_mid_tibia',
    'length_ground_to_fibular_neck',
    'length_ground_to_knee_axis',
    'length_ground_to_perineum_30mm_down',
    'length_ground_to_ischial_tuberosity',
    'length_ground_to_greater_trochanter',
    'length_ground_to_pelvic_line',
    'length_ground_to_waist_line',
  ],
  2: [
    'ankle_frontal_alignment',
    'ankle_flexibility',
    'ankle_rotation',
    'ankle_plane',
    'ankle_frontal_degrees',
    'ankle_plane_degrees',
    'ankle_heel_height',
    'knee_alignment',
    'knee_flexibility',
    'knee_sagittal_condition',
    'knee_alignment_degrees',
    'knee_sagittal_degrees',
    // Computation uses ap/ml/da/db/hc/tw (already required in step 1) — keep step-level check minimal.
    // If you want to force user to review computed values explicitly, add 'cr','cvai' here (but they are derived).
  ],
  3: [],
  4: [], // Summary - no requirements to move forward
  5: [], // Scan & Upload - intentionally excluded from mandatory set
  6: [] // Finish & Payment - excluded
};

const STEP1_FIELDS_KAFO: string[] = [
  'circ_greater_trochanter',
  'ml_greater_trochanter',
  'circ_perineum',
  'ml_perineum',
  'circ_upper_mid_thigh',
  'ml_mid_thigh',
  'circ_lower_mid_thigh',
  'ml_knee_axis',
  'circ_upper_mid_calf',
  'ml_mid_calf',
  'circ_lower_mid_calf',
  'ml_ankle_axis',
  'length_ankle_axis_to_mid_tibia',
  'length_ground_to_fibular_neck',
  'length_ground_to_knee_axis',
  'length_ground_to_perineum_30mm_down',
  'length_ground_to_ischial_tuberosity',
  'length_ground_to_greater_trochanter',
  'length_ground_to_pelvic_line',
  'length_ground_to_waist_line'
];


/* --------------------------------- Steps ---------------------------------- */
const FIELD_LABELS: Record<string, string> = {
  // Step 0
  patient_name: 'Patient name',
  first_name: 'First name',
  last_name: 'Last name',
  parent_mobile: 'Parent mobile number',
  date_of_birth: 'Date of birth',
  height_cm: 'Height (cm)',
  weight_kg: 'Weight (kg)',
  email: 'Email',
  clinic_name: 'Clinic name',

  // Step 1
  ap: 'AP measurement',
  ml: 'ML measurement',
  da: 'Diagonal A',
  db: 'Diagonal B',
  hc: 'Head circumference',
  tw: 'Temple width',

  // Step 3
  occipital_area: 'Occipital area',
  parietal_area: 'Parietal area',
  frontal_area: 'Frontal area',
  ear_alignment: 'Ear alignment',
  positional: 'Positional diagnosis',
  severity: 'Severity',
  torticollis: 'Torticollis',
};

const steps = [
  { key: 'patient', label: 'Basic Details' },
  { key: 'measurement', label: 'Measurement' },
  { key: 'assessment', label: 'Clinical Assessment' },
  { key: 'scan', label: 'Scan & Upload' },
  { key: 'finish', label: 'Finish & Payment' }
] as const;

/* -------------------------------- Helpers --------------------------------- */

const toNum = (v?: string) => (v === '' || v == null ? undefined : Number(v));
const up = (s?: string) => (s || '').trim().toUpperCase();

const normalizeCondition = (pos?: string): ConditionCode | undefined => {
  const p = up(pos);
  if (p === 'P' || p === 'PLAGIOCEPHALY') return 'P';
  if (p === 'B' || p === 'BRACHYCEPHALY') return 'B';
  if (p === 'SC' || p === 'SCAPHOCEPHALY') return 'SC';
  if (p === 'ASB' || p === 'ASYMMETRICAL BRACHYCEPHALY (COMBO)') return 'ASB';
  if (p === 'ASSC' || p === 'ASYMMETRICAL SCAPHOCEPHALY') return 'ASSC';
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

const toNumOrNull = (v?: string | number) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const orEmpty = (v?: string) => (v == null ? '' : v);

const POS_LABEL_BY_CODE: Record<string, string> = {
  P: 'Plagiocephaly',
  B: 'Brachycephaly',
  SC: 'Scaphocephaly',
  ASB: 'Asymmetrical Brachycephaly (Combo)',
  ASSC: 'Asymmetrical Scaphocephaly'
};
const toPositionalLabel = (pos?: string) => {
  const raw = (pos || '').trim();
  const code = raw.toUpperCase();
  return POS_LABEL_BY_CODE[code] || raw;
};

function toOrderDetails(values: FormValues) {
  const ap = toNumOrNull(values.ap);
  const ml = toNumOrNull(values.ml);
  const da = toNumOrNull(values.da);
  const db = toNumOrNull(values.db);

  let cr: number | null = null;
  let cvai: number | null = null;
  try {
    if (ap && ml) cr = calculateCephalicRatio(ap, ml).value;
  } catch {}
  try {
    if (da && db) cvai = calculateCVAI(da, db).value;
  } catch {}

  return {
    patient_name: `${orEmpty(values.first_name)} ${orEmpty(values.last_name)}`.trim(),
    first_name: orEmpty(values.first_name),
    last_name: orEmpty(values.last_name),

    parent_mobile: orEmpty(values.parent_mobile),
    email: orEmpty(values.email),
    clinic_name: orEmpty(values.clinic_name),
    date_of_birth: values.date_of_surgery || null,
    height_cm: toNumOrNull(values.height_cm),
    weight_kg: toNumOrNull(values.weight_kg),

    measurement_of_length_a_to_p__mm: ap,
    measurement_of_width_m_to_l_mm: ml,
    diagonal_a_mm: toNumOrNull(values.da),
    diagonal_b_mm: toNumOrNull(values.db),
    head_circumference_mm: toNumOrNull(values.hc),
    temple_width_mm: toNumOrNull(values.tw),
    cr,
    cvai,

    occipital_area: orEmpty(values.occipital_area),
    parietal_area: orEmpty(values.parietal_area),
    frontal_area: orEmpty(values.frontal_area),
    ear_alignment: orEmpty(values.ear_alignment),

    positional: toPositionalLabel(values.positional),
    severity: orEmpty(values.severity as string),
    torticollis: orEmpty(values.torticollis),

    post_surgical: orEmpty(values.post_surgical),
    suture_type_surgical_diagnoses_only: orEmpty(values.suture_type_surgical_diagnoses_only),
    date_of_surgery: values.date_of_surgery || null,
    surgical_complications: orEmpty(values.surgical_complications),
    other_diagnosis_and_syndromes: orEmpty(values.other_diagnosis_and_syndromes),

    custom_design_by: orEmpty(values.design_by),
    custom_print_by: orEmpty(values.print_by),
    colour: orEmpty(values.colour),
    thickness_3d_mm: orEmpty(values.thickness_3d_mm),

    patient_remarks: orEmpty(values.patient_remarks),
    other_remarks: orEmpty(values.other_remarks)
  };
}

function flattenForSalesOrder(values: FormValues) {
  return {
    patient_name: `${orEmpty(values.first_name)} ${orEmpty(values.last_name)}`.trim(),
    custom_patient_name: `${orEmpty(values.first_name)} ${orEmpty(values.last_name)}`.trim(),
    first_name: orEmpty(values.first_name),
    last_name: orEmpty(values.last_name),
    parent_mobile: orEmpty(values.parent_mobile),
    email: orEmpty(values.email),
    clinic_name: orEmpty(values.clinic_name),
    date_of_birth: values.date_of_surgery || null,
    height_cm: toNumOrNull(values.height_cm),
    weight_kg: toNumOrNull(values.weight_kg),

    // Measurements
    measurement_of_length_a_to_p__mm: toNumOrNull(values.ap),
    measurement_of_width_m_to_l_mm: toNumOrNull(values.ml),
    diagonal_a_mm: toNumOrNull(values.da),
    diagonal_b_mm: toNumOrNull(values.db),
    head_circumference_mm: toNumOrNull(values.hc),
    temple_width_mm: toNumOrNull(values.tw),

    // Derived
    cr: typeof values.cr === 'number' ? values.cr : undefined,
    cvai: typeof values.cvai === 'number' ? values.cvai : undefined,

    // Clinical / Diagnosis
    positional: toPositionalLabel(values.positional),
    torticollis: orEmpty(values.torticollis),
    severity: orEmpty(values.severity as string),
    post_surgical: orEmpty(values.post_surgical),
    suture_type_surgical_diagnoses_only: orEmpty(values.suture_type_surgical_diagnoses_only),
    date_of_surgery: values.date_of_surgery || null,
    surgical_complications: orEmpty(values.surgical_complications),
    other_diagnosis_and_syndromes: orEmpty(values.other_diagnosis_and_syndromes),

    // Areas
    occipital_area: orEmpty(values.occipital_area),
    parietal_area: orEmpty(values.parietal_area),
    frontal_area: orEmpty(values.frontal_area),
    ear_alignment: orEmpty(values.ear_alignment),

    // UI / selections
    custom_design_by: orEmpty(values.design_by),
    custom_print_by: orEmpty(values.print_by),
    colour: orEmpty(values.colour),
    thickness_3d_mm: orEmpty(values.thickness_3d_mm),

    // Payment Summary (send as plain numbers; backend can format)
    design_price: values.design_price ?? 0,
    print_price: values.print_price ?? 0,
    item_special_discount: values.item_special_discount ?? 0,
    item_standard_discount: values.item_standard_discount ?? 0,
    additional_discount: values.additional_discount ?? 0,
    discounted_price: values.discounted_price ?? 0,
    gst_5_amt: values.gst_5_amt ?? 0,
    gst_18_amt: values.gst_18_amt ?? 0,
    gst_rate: values.gst_rate ?? 0.05
  };
}

function toCreatePayload(
  values: FormValues,
  productCode: string,
  ctx: {
    customerId?: string;
    orderId?: string | null;
    deviceTypeId?: string | null;
  }
) {
  const order_details = toOrderDetails(values);

  const gst_18_num = Number(String(values.gst_18_amt ?? 0).replace(/,/g, '')) || 0;
  const gst_5_num = Number(String(values.gst_5_amt ?? 0).replace(/,/g, '')) || 0;

  const today = new Date();
  const ymd = today.toISOString().slice(0, 10);
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const flattened = flattenForSalesOrder(values);

  const payload: any = {
    item_type: 'CH',
    customer: ctx.customerId || values.customer || '',
    item_code: productCode || '',
    qty: 1,
    rate: Number(values.print_price ?? 0),
    total_price: String(values.total_price ?? ''),

    addicoins: 0,
    custom_payment_reference_id: orEmpty(values.coupon_code),

    gst_5: gst_5_num > 0,
    gst_18: gst_18_num > 0,

    transaction_date: ymd,
    delivery_date: in7,

    order_details,
    ...flattened
  };

  if (values.scan_gdrive_link) {
    payload.custom_scan_items = { scan_file: values.scan_gdrive_link };
    payload.custom_upload_link_with_photos = values.scan_gdrive_link;
  }
  if (ctx.orderId) {
    payload.order_id = ctx.orderId;
    payload.orderId = ctx.orderId;
  }
  if (ctx.deviceTypeId) {
    payload.device_type_id = ctx.deviceTypeId;
    payload.deviceTypeId = ctx.deviceTypeId;
    payload.device_type = ctx.deviceTypeId;
  }

  return payload;
}

/* ---------- Payment helpers (keep) ---------- */

function normalizePaymentResponse(paymentRes: any) {
  let success = false;
  let paymentLink: string | undefined;
  let msgText = '';

  if (typeof paymentRes === 'string') {
    msgText = paymentRes;
  } else if (paymentRes && typeof paymentRes === 'object') {
    const msg = paymentRes.message;
    if (msg && typeof msg === 'object') {
      success = !!msg.success || msg.status === 'success' || msg.ok === true;
      paymentLink = msg.data?.payment_link || msg.payment_link;
      msgText = msg.message || '';
    } else {
      success = !!paymentRes.success || paymentRes.status === 'success' || paymentRes.ok === true;
      paymentLink = paymentRes.data?.payment_link || paymentRes.payment_link;
      msgText = paymentRes.message || '';
    }
  }

  return { success, paymentLink, msgText };
}

function redirectToPayment(link: string) {
  const trimmed = (link || '').trim();
  if (!trimmed) throw new Error('Empty payment link');
  window.location.assign(trimmed);
}

/* -------------------------------- Component -------------------------------- */

type CranialOrderFormProps = { item_type?: string };

export default function HkafoAndKafoForm(_: CranialOrderFormProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const deviceTypeId = searchParams.get('deviceType');
  const router = useRouter();
  const isReadOnly = searchParams.get('readonly') === 'true';

  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState<null | 'place' | 'later'>(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const [createCranialOrder] = useCreateCranialOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const [getOrderDetails] = useGetOrderDetailsMutation();
  const [preSignedUrl] = usePreSignedUrlMutation();

  const { startPayment } = usePaymentLauncher(); // ✅ get reusable payment launcher

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);

  // ❌ removed popup/status hooks & listeners

  const pill = (i: number) => {
    const isFuture = i > activeStep;
    const base = 'text-xs border rounded-full px-3 py-1';
    const stateClass =
      i === activeStep
        ? 'bg-primary text-white border-primary'
        : 'text-violet-300 border-violet-400';
    const disabledClass = !isReadOnly && isFuture ? ' opacity-60 cursor-not-allowed' : '';
    return `${base} ${stateClass}${disabledClass}`;
  };

  const initialValues: FormValues = useMemo(
    () => ({
      first_name: '',
      last_name: '',
      parent_mobile: '',
      date_of_birth: '',
      gender: '',
      height_cm: '',
      weight_kg: '',
      email: '',
      clinic_name: '',
      consultant: '',
      type: '',
      today_date: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      orthotist: '',
      diagnosis: '',
      delivery_date: '',
      po_number: '',

      item_code: '',
      customer: user?.customer_id || '',

      ap: '',
      ml: '',
      da: '',
      db: '',
      hc: '',
      tw: '',
      cr: undefined,
      cvai: undefined,
      circ_waist: '',
      circ_iliac_crest: '',
      circ_greater_trochanter: '',
      circ_perineum: '',
      circ_upper_mid_thigh: '',
      circ_lower_mid_thigh: '',
      circ_upper_mid_calf: '',
      circ_lower_mid_calf: '',

      ml_waist: '',
      ml_iliac_crest: '',
      ml_greater_trochanter: '',
      ml_perineum: '',
      ml_mid_thigh: '',
      ml_knee_axis: '',
      ml_mid_calf: '',
      ml_ankle_axis: '',

      length_ankle_axis_to_mid_tibia: '',
      length_ground_to_fibular_neck: '',
      length_ground_to_knee_axis: '',
      length_ground_to_perineum_30mm_down: '',
      length_ground_to_ischial_tuberosity: '',
      length_ground_to_greater_trochanter: '',
      length_ground_to_pelvic_line: '',
      length_ground_to_waist_line: '',
      measurement_unit: 'cm',

      ankle_frontal_alignment: '',
      ankle_flexibility: '',
      ankle_frontal_degrees: '',
      ankle_rotation: '',
      ankle_plane: '',
      ankle_plane_degrees: '',
      ankle_heel_height: '',

      knee_alignment: '',
      knee_flexibility: '',
      knee_alignment_degrees: '',
      knee_sagittal_condition: '',
      knee_sagittal_degrees: '',

      occipital_area: '',
      parietal_area: '',
      frontal_area: '',
      ear_alignment: '',
      positional: '',
      severity: '',
      torticollis: '',
      post_surgical: '',
      suture_type_surgical_diagnoses_only: '',
      date_of_surgery: '',
      surgical_complications: '',
      other_diagnosis_and_syndromes: '',

      scan_file: null,
      extra_files: [],
      patient_remarks: '',
      other_remarks: '',
      scan_gdrive_link: '',

      design_by: 'Addiwise',
      print_by: 'Addiwise',
      colour: '',
      thickness_3d_mm: '3.5',
      coupon_code: '',
      coupon_id: '',
      agree_terms: false,

      design_price: '',
      print_price: '',
      item_special_discount: '',
      item_standard_discount: '',
      additional_discount: '',
      discounted_price: '',
      gst_5_amt: '',
      gst_18_amt: '',
      total_price: '',
      gst_rate: 0.05
    }),
    [user?.customer_id]
  );

  const [formSeed, setFormSeed] = useState<FormValues>(initialValues);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      if (!orderId || !deviceTypeId) return;
      try {
        const resp: any = await getOrderDetails({
          order_type: deviceTypeId,
          order_id: orderId
        }).unwrap();
        const d = resp?.data || {};
        const seed: FormValues = {
          ...initialValues,
          first_name: d.first_name || '',
          last_name: d.last_name || '',
          parent_mobile: d.parent_mobile || d.custom_mobile_no || '',
          date_of_birth: d.date_of_birth || d.dob || '',
          gender: d.gender || '',
          height_cm: d.height_cm || '',
          weight_kg: d.weight || d.weight_kg || '',
          email: d.email || d.custom_email || '',
          clinic_name: d.clinic_name || '',
          ap: (d.measurement_of_length_a_to_p__mm ?? d.ap ?? '')?.toString() || '',
          ml: (d.measurement_of_width_m_to_l_mm ?? d.ml ?? '')?.toString() || '',
          hc: (d.head_circumference_mm ?? '')?.toString() || '',
          tw: (d.temple_width_mm ?? '')?.toString() || '',
          da: (d.diagonal_a_mm ?? '')?.toString() || '',
          db: (d.diagonal_b_mm ?? '')?.toString() || '',
          occipital_area: d.occipital_area || '',
          parietal_area: d.parietal_area || '',
          frontal_area: d.frontal_area || '',
          ear_alignment: d.ear_alignment || '',
          positional: d.positional || '',
          severity: d.severity || '',
          torticollis: d.torticollis || '',
          post_surgical: d.post_surgical || '',
          suture_type_surgical_diagnoses_only: d.suture_type_surgical_diagnoses_only || '',
          date_of_surgery: d.date_of_surgery || '',
          surgical_complications: d.surgical_complications || '',
          other_diagnosis_and_syndromes: d.other_diagnosis_and_syndromes || '',
          item_code: d.item_code || '',
          scan_gdrive_link: d.custom_upload_link_with_photos || '',
          colour: d.colour || '',
        };
        setFormSeed(seed);
        setPrefilled(true);
      } catch {
        setPrefilled(false);
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, deviceTypeId]);

  // ------------------ presigned upload helper ------------------
  const uploadFileAndStoreMetadata = async (file: File, userId: string) => {
    try {
      let contentType = 'application/octet-stream';
      const lower = (file.name || '').toLowerCase();
      if (lower.endsWith('.stl')) contentType = 'model/stl';
      else if (file.type) contentType = file.type;

      const result: any = await usePreSignedUrlMutationResult(preSignedUrl, {
        fileName: file.name,
        fileType: contentType,
        userId
      });

      if (!result?.message?.status) {
        throw new Error('Presigned URL request failed');
      }
      const uploadUrl = result?.message?.data?.uploadUrl;
      const key = result?.message?.data?.key;
      if (!uploadUrl) throw new Error('No uploadUrl from presign response');

      await fetch(String(uploadUrl), {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file
      });

      const fileMeta = {
        key: key ? String(key) : String(uploadUrl).split('?')[0],
        size: file.size,
        type: contentType,
        originalName: file.name
      };

      setUploadedFiles((prev) => [...prev, fileMeta]);
      return fileMeta;
    } catch (err) {
      console.error('Presigned upload error:', err);
      throw err;
    }
  };

  // small helper so we can await the RTK mutation (since we already have the hook instance)
  async function usePreSignedUrlMutationResult(
    mutate: ReturnType<typeof usePreSignedUrlMutation>[0],
    args: any
  ) {
    return await mutate(args).unwrap();
  }

  return (
    <div className="w-full">
      <Formik
        key={formResetKey + (prefilled ? 1 : 0)}
        initialValues={prefilled ? formSeed : initialValues}
        validationSchema={Schema}
        onSubmit={() => {}}
        enableReinitialize
        validateOnChange
        validateOnBlur
      >
        {({ values, errors, touched, setFieldValue, validateForm, setTouched }) => {
          const handleChange = (field: string) => (eOrVal: any) => {
            const next =
              eOrVal && typeof eOrVal === 'object' && 'target' in eOrVal
                ? (eOrVal as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target.value
                : eOrVal;
            setFieldValue(field, next, true);
          };

          useEffect(() => {
            setFieldValue('customer', user?.customer_id || '');
          }, [user?.customer_id, setFieldValue]);

          const getValueByPath = (obj: any, path: string) => {
            if (!obj) return undefined;
            return path
              .replace(/\[(\d+)\]/g, '.$1')
              .split('.')
              .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
          };

          const shouldShowError = (fieldName: string, isRequired = false) => {
            const fieldValue = getValueByPath(values, fieldName);
            const fieldError = getValueByPath(errors, fieldName);
            const fieldTouched = getValueByPath(touched, fieldName);

            if (isRequired) {
              const hasValue =
                fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
              const msg =
                typeof fieldError === 'string' ? fieldError.toLowerCase() : '';

              if (!hasValue && fieldTouched) return true;

              if (hasValue && fieldTouched && fieldError && msg && !msg.includes('required')) {
                return true;
              }

              return false;
            }

            return !!fieldError && !!fieldTouched;
          };

          const { cr, cvai } = useMemo(() => {
            const apN = toNum(values.ap);
            const mlN = toNum(values.ml);
            const daN = toNum(values.da);
            const dbN = toNum(values.db);

            let crV: number | undefined;
            let cvaiV: number | undefined;

            if (
              typeof apN === 'number' &&
              Number.isFinite(apN) &&
              apN > 0 &&
              typeof mlN === 'number' &&
              Number.isFinite(mlN) &&
              mlN > 0
            ) {
              try {
                crV = calculateCephalicRatio(apN, mlN).value;
              } catch {}
            }

            if (
              typeof daN === 'number' &&
              Number.isFinite(daN) &&
              daN > 0 &&
              typeof dbN === 'number' &&
              Number.isFinite(dbN) &&
              dbN > 0
            ) {
              try {
                cvaiV = calculateCVAI(daN, dbN).value;
              } catch {}
            }

            return { cr: crV, cvai: cvaiV };
          }, [values.ap, values.ml, values.da, values.db]);

          const productCode = useMemo(() => {
            const cond = normalizeCondition(values.positional);
            const sev = normalizeSeverity(values.severity as string, cvai);
            return cond && sev ? makeProductCode(sev, cond) : '';
          }, [values.positional, values.severity, cvai]);

          useEffect(() => {
            setFieldValue('item_code', productCode || '');
          }, [productCode, setFieldValue]);

          const onEstimate = async (p: {
            design_by: string;
            print_by: string;
            coupon_code?: string;
            product_code?: string;
          }): Promise<
            | void
            | {
            design: number;
            print: number;
            stdDiscPct?: number;
            gstRate?: number;
          }
          > => {
            if (!productCode) {
              alert('Select Positional Diagnosis and Severity to generate Product Code first.');
              return;
            }

            const qty = 1;
            const couponPayload =
              p.coupon_code && p.coupon_code.trim()
                ? { code: p.coupon_code.trim(), discount_type: 'Percent' as const, discount_value: 0 }
                : undefined;

            const { result, error } = await estimateOrderClientSide({
              company: undefined,
              customer: undefined,
              items: [{ item_code: productCode, qty }],
              coupon: couponPayload,
              price_list: 'Standard Selling',
              baseQuery: baseQueryWithReauth,
              api: {} as any
            });

            if (error) {
              alert(error);
              return;
            }
            if (!result) return;

            const subtotal = Number(result.subtotal || 0);
            const totalDisc = Number(result.total_discount || 0);
            const baseBeforeCoupon = Math.max(0, subtotal - totalDisc);
            const stdPct = subtotal > 0 ? totalDisc / subtotal : 0;

            const prevGstRate =
              typeof values.gst_rate === 'number' && values.gst_rate > 0
                ? values.gst_rate!
                : 0.05;

            const firstLine = result.breakdown?.items?.[0];
            const computedGstRate =
              typeof firstLine?.tax_rate === 'number' && firstLine.tax_rate > 0
                ? firstLine.tax_rate / 100
                : prevGstRate;

            setFieldValue('design_price', 0);
            setFieldValue('print_price', baseBeforeCoupon);
            setFieldValue('standard_discount_pct', stdPct);
            setFieldValue('gst_rate', computedGstRate);

            const totalAmount = Number(
              result.total ?? result.grand_total ?? baseBeforeCoupon * (1 + (computedGstRate || 0))
            );

            setFieldValue('total_price', totalAmount);

            return { design: 0, print: baseBeforeCoupon, stdDiscPct: stdPct, gstRate: computedGstRate };
          };

          const onValidateCoupon = async (code: string) => {
            if (!code) return null;
            try {
              const res = await validateCoupon({ coupon_code: code }).unwrap();
              return res;
            } catch {
              return null;
            }
          };

          const [isPlacing, isSavingLater] = [busy === 'place', busy === 'later'] as const;

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
              cranial_order_id?: string;
            };
          }
            | { status: string; message?: string; sales_order_id?: string; cranial_order_id?: string }
            | string
            | Record<string, any>
            | undefined
            | null;

          function normalizeCreateResponse(res: unknown) {
            let ok = false;
            let salesId: string | undefined;
            let cranialId: string | undefined;
            let note = '';

            if (res == null) return { ok, salesId, cranialId, note: 'Empty response' };

            if (typeof res === 'string') {
              ok = /success|ok/i.test(res);
              note = res;
              return { ok, salesId, cranialId, note };
            }

            const obj = res as Record<string, any>;
            const msgObj = obj?.message;
            const topStatus = obj?.status;
            const nestedStatus = msgObj && typeof msgObj === 'object' ? msgObj.status : undefined;

            const statusStr =
              (typeof nestedStatus === 'string' && nestedStatus) ||
              (typeof topStatus === 'string' && topStatus) ||
              '';

            ok = /success|ok/i.test(statusStr);

            salesId =
              msgObj?.sales_order_id ?? obj?.sales_order_id ?? obj?.data?.sales_order_id;
            cranialId =
              msgObj?.cranial_order_id ?? obj?.cranial_order_id ?? obj?.data?.cranial_order_id;

            note =
              (typeof msgObj?.message === 'string' && msgObj.message) ||
              (typeof obj?.message === 'string' && obj.message) ||
              statusStr ||
              '';

            return { ok, salesId, cranialId, note };
          }

          // ✅ postOrder now uses the reusable payment launcher
          const postOrder = async (intent: 'place' | 'later') => {
            if (!values.agree_terms) return alert('Please agree to the terms and conditions.');
            const cond = normalizeCondition(values.positional);
            const sev = normalizeSeverity(values.severity as string, cvai);
            const productCode = cond && sev ? makeProductCode(sev, cond) : '';
            if (!productCode)
              return alert('Please select Positional Diagnosis + Severity (product code missing).');

            try {
              setBusy(intent);

              const payload = toCreatePayload(values, productCode, {
                customerId: user?.customer_id,
                orderId,
                deviceTypeId
              });

              // If there's a scan file, try presign upload first
              if (values.scan_file instanceof File) {
                try {
                  const meta = await uploadFileAndStoreMetadata(
                    values.scan_file,
                    user?.customer_id || '1'
                  );
                  payload.custom_scan_items = payload.custom_scan_items || {};
                  payload.custom_scan_items.scan_file = meta.key;
                  payload.custom_upload_link_with_photos = meta.key;
                } catch (presignErr) {
                  // Fallback to multipart POST
                  console.warn('Presign/upload failed — using multipart POST', presignErr);
                  const bodyOrForm = buildBodyOrForm(payload);
                  const resFallback = (await createCranialOrder(bodyOrForm).unwrap()) as CreateOk;
                  const { ok, note, salesId } = normalizeCreateResponse(resFallback);

                  if (ok) {
                    if (intent === 'place' && salesId) {
                      // ✅ Use reusable payment launcher
                      const raw = String(values.total_price ?? '0').replace(/,/g, '');
                      const amount = Number(parseFloat(raw || '0').toFixed(2));
                      await startPayment({
                        amount,
                        salesOrder: salesId,
                        onSuccess: () => {
                          alert('Payment successful.');
                          router.push('/orders');
                        },
                        onFailure: () => {
                          alert('Payment failed or timed out. Please check status in Orders.');
                        }
                      });
                      return;
                    }
                    alert(
                      intent === 'place'
                        ? `Order placed successfully${salesId ? ` (SO: ${salesId})` : ''}.`
                        : 'Order saved. You can pay later.'
                    );
                    router.push('/orders');
                    return;
                  }

                  alert(note || 'Order created response not marked as success.');
                  setBusy(null);
                  return;
                }
              }

              // JSON payload path (preferred)
              const res = (await createCranialOrder(payload).unwrap()) as CreateOk;
              const { ok, note, salesId } = normalizeCreateResponse(res);

              if (ok) {
                if (intent === 'place' && salesId) {
                  // ✅ Use reusable payment launcher
                  const raw = String(values.total_price ?? '0').replace(/,/g, '');
                  const amount = Number(parseFloat(raw || '0').toFixed(2));
                  await startPayment({
                    amount,
                    salesOrder: salesId,
                    onSuccess: () => {
                      alert('Payment successful.');
                      router.push('/orders');
                    },
                    onFailure: () => {
                      alert('Payment failed or timed out. Please check status in Orders.');
                    }
                  });
                  return;
                }

                alert(
                  intent === 'place'
                    ? `Order placed successfully${salesId ? ` (SO: ${salesId})` : ''}.`
                    : 'Order saved. You can pay later.'
                );
                router.push('/orders');
                return;
              }

              alert(note || 'Order created response not marked as success.');
            } catch (e: any) {
              const msg =
                e?.data?.message ||
                e?.data?._server_messages ||
                e?.error ||
                e?.message ||
                'Failed to submit order.';
              alert(msg);
            } finally {
              setBusy(null);
            }
          };

          const placeOrder = () => postOrder('place');
          const payLater = () => postOrder('later');

          const validateStepAndShowErrors = async (stepIndex: number) => {
            let fields = STEP_FIELDS[stepIndex] ?? [];

            if (stepIndex === 1 && values.type === 'KAFO') {
              fields = STEP1_FIELDS_KAFO;
            }

            const stepTouched = fields.reduce(
              (acc, f) => ({ ...acc, [f]: true }),
              {} as FormikTouched<FormValues>
            );

            setTouched({
              ...(touched as FormikTouched<FormValues>),
              ...stepTouched
            });

            const errs = await validateForm();

            if (fields.length === 0) {
              return [] as string[];
            }

            const stepErrors = fields.filter((f) => Boolean((errs as any)[f]));

            if (stepErrors.length > 0) {
              const stepName = steps[stepIndex]?.label ?? `Step ${stepIndex + 1}`;

              const lines = stepErrors.map((fieldKey) => {
                const label = FIELD_LABELS[fieldKey] || fieldKey;
                const errMsg = (errs as any)[fieldKey];
                if (typeof errMsg === 'string' && errMsg.trim()) {
                  return `• ${label}: ${errMsg}`;
                }
                return `• ${label}: Please fill this field.`;
              });
              // alert(`${header}\n\n${lines.join('\n')}`);
              const firstField = stepErrors[0];
              if (firstField) {
                const el = document.querySelector<
                  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >(`[name="${firstField}"]`);
                if (el && typeof el.focus === 'function') {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }

            return stepErrors;
          };

          const handleNextStep = async () => {
            if (isReadOnly) {
              setActiveStep((s) => Math.min(s + 1, steps.length - 1));
              return;
            }

            const stepErrors = await validateStepAndShowErrors(activeStep);
            if (stepErrors.length === 0) {
              setActiveStep((s) => Math.min(s + 1, steps.length - 1));
            }
          };

          const handleDeviceTypeChange = (val: string) => {
            setFieldValue('type', val, true);
            if (!isReadOnly) {
              void handleNextStep();
            }
          };

          const handleStepClick = async (targetStep: number) => {
            if (isReadOnly) {
              setActiveStep(targetStep);
              return;
            }

            if (targetStep <= activeStep) {
              setActiveStep(targetStep);
              return;
            }

            // const stepErrors = await validateStepAndShowErrors(activeStep);
            // if (stepErrors.length === 0) {
            //   setActiveStep(targetStep); 
            // }
            setActiveStep(targetStep)
          };

          return (
            <>
              <div className="sticky top-0 z-10 bg-primary text-white px-4 py-3">
                <div className="font-semibold text-center">
                  Step {activeStep + 1} of {steps.length} - {steps[activeStep].label}
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {steps.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      className={pill(i)}
                      onClick={() => {
                        void handleStepClick(i);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Form className="max-w-6xl w-[92%] mx-auto my-6 space-y-6">
                <fieldset
                  disabled={isReadOnly}
                  className={isReadOnly ? 'opacity-70 pointer-events-none' : ''}
                >
                  {activeStep === 0 && (
                    <HkafoPatientDetails
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
                    <HkafoMeasurement
                      UI={{ Input, Label, Card, SelectBox }}
                      deviceType={values.type}
                    />
                  )}
                  {activeStep === 2 && (
                    <HkafoClinicalAssessment
                      UI={{ Input, Label, Card, SelectBox }}
                      values={values}
                      errors={errors}
                      setFieldValue={setFieldValue}
                      shouldShowError={shouldShowError}
                    />
                  )}
                  {activeStep === 3 && (
                    <ScanUpload
                      values={values}
                      setFieldValue={setFieldValue}
                      UI={{ Input, Label, Card, Textarea }}
                      title="HKAFO - Scan & Upload"
                    />
                  )}
                  {activeStep === 4 && (
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
                </fieldset>

                {/* Navigation */}
                <div className="flex justify-between items-center gap-3 pt-2">
                  {activeStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
                    >
                      Previous
                    </Button>
                  )}
                  <div className="ml-auto">
                    {activeStep === 0 ? (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => handleDeviceTypeChange('HKAFO')}
                        >
                          HKAFO & NEXT
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDeviceTypeChange('KAFO')}
                        >
                          KAFO & NEXT
                        </Button>
                      </div>
                    ) : (
                      activeStep < steps.length - 1 && (
                        <Button type="button" onClick={handleNextStep}>
                          Next
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {isReadOnly && (
                  <div className="mt-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
                    This form is opened in <strong>read-only</strong> mode from Orders. Editing and payment are
                    disabled.
                  </div>
                )}
              </Form>
            </>
          );
        }}
      </Formik>
    </div>
  );
}
