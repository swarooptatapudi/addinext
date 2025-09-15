'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';


// Components
import StlFilePicker from '@/components/app/common/StlPreviewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { Textarea } from '@/components/ui/textarea';
import PatientPicker from '@/components/app/common/PatientPicker';
import { GenericFileViewer } from '@/components/app/common/GenericFileViewer';
import { ConfirmOrderDialog } from '@/components/app/common/ConfirmOrderDialog';
import { Step3 } from '@/components/form/bkForm/Step3LockingMechanism';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
// API Hooks
import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
import { useCreateInsoleOrderMutation, useGetOrderDetailsMutation, useGetOrderDetailIdsMutation } from '@/rtk-query/apis/orders';
import { useGetItemNameInByDetailsMutation } from '@/rtk-query/apis/products';

// Constants & Utils
import { BK_FORM_TYPE, USER } from '@/uttils/Types';
import { getFormOptionsObject } from '@/uttils/UttilFuncations';
import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
import { INSOLES_FORM_INITIAL_VALUES } from './constants';
import { Step5 } from '@/components/form/insolesForm/Step5Finishing';
import { CheckboxGroup } from '@/components/app/common/foot-complaints-form';
import { getThickness } from "@/uttils/thicknessChart";
import { mapActivityLevel, getThicknessCode, finishMap, layeringMap, modelMap } from "@/uttils/insoleUtils";

import { thicknessToinsoletypeMap, insoletypeToThicknessMap } from '@/app/(pages)/(protected-routes)/orders/new-order/_child/constants';
import Link from 'next/link';


declare global {
  interface Window {
    Razorpay: any;
  }
}

const step1Validation = Yup.object().shape({
  patient_name: Yup.string()
    .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
    .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
    .required(FORMIK_ERRORS.REQUIRED),

  insoletype: Yup.string(),

  insole_model: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  activity_level: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  height: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true,
    })
    .test('min-height', 'Minimum height is 91cm', (value) => !value || parseFloat(value) >= 91)
    .test('max-height', 'Maximum height is 213.00cm', (value) => !value || parseFloat(value) <= 213.0),
  weight: Yup.string()
    .required('Weight is required')
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 65.5 or 70)',
      excludeEmptyString: false,
    })
    .test('min-weight', 'Minimum weight is 10kg', (value) => parseFloat(value) >= 10)
    .test('max-weight', 'Maximum weight is 180kg', (value) => parseFloat(value) <= 180),
  // stump_length: Yup.string()
  //   .required(FORMIK_ERRORS.REQUIRED)
  //   .matches(/^\d+$/, 'Must contain only numbers')
  //   .test('min-value', 'stupm length must be at least 1', (value) => Number(value) >= 1),
  shoe_size: Yup.string()
    .required(FORMIK_ERRORS.REQUIRED)
    .matches(/^\d+(\.\d+)?$/, 'Must contain only digits')
    .test(
      'min-value',
      'Size must be at least 20',
      (value) => parseInt(value) >= 20
    )
    .test(
      'max-value',
      'Size must be no more than 60',
      (value) => parseInt(value) <= 45
    ),
  foot_length: Yup.string()
    .required(FORMIK_ERRORS.REQUIRED)
    .matches(/^\d+$/, 'Must contain only digits')
    .test(
      'min-value',
      'foot length must be at least 5',
      (value) => parseInt(value) >= 5
    )
    .test(
      'max-value',
      'foot length must be no more than 50',
      (value) => parseInt(value) <= 25
    ),
  custom_metatarsal_to_heel_length: Yup.string()
    .required(FORMIK_ERRORS.REQUIRED)
    .matches(/^\d+$/, 'Must contain only digits')
    .test(
      'min-value',
      'metatarsal length must be at least 3',
      (value) => parseInt(value) >= 3
    )
    .test(
      'max-value',
      'metatarsal length must be no more than 45',
      (value) => parseInt(value) <= 45
    ),
  custom_metatarsal_width_cm: Yup.string()
    .required(FORMIK_ERRORS.REQUIRED)
    .matches(/^\d+$/, 'Must contain only digits')
    .test(
      'min-value',
      'metatarsal width must be at least 3',
      (value) => parseInt(value) >= 3
    )
    .test(
      'max-value',
      'metatarsal width must be no more than 25',
      (value) => parseInt(value) <= 25
    ),
  // shoe_width: Yup.string()
  //   .required(FORMIK_ERRORS.REQUIRED)
  //   .matches(/^\d+$/, 'Must contain only digits')
  //   .test(
  //     'min-value',
  //     'Size must be at least 0',
  //     (value) => parseInt(value) >= 0
  //   )
  //   .test(
  //     'max-value',
  //     'Size must be no more than 25',
  //     (value) => parseInt(value) <= 25
  //   ),
  flexion_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Flexion angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  abductionadduction_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Abd/adduct angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  date_of_birth: Yup.string().required(FORMIK_ERRORS.REQUIRED),
});


const step2Validation = Yup.object().shape({
  custom_upload_link_with_photos: Yup.string()
    .url('Must be a valid URL (e.g., https://drive.google.com/...)')
    .nullable(),

  scan_type: Yup.string().required('Scan condition is required'),

  foot_Amputation: Yup.string().when('scan_type', {
    is: '3D_scan',
    then: (schema) => schema.required('Foot amputation is required'),
    otherwise: (schema) => schema.nullable(),
  }),

  left_foot_file: Yup.mixed().nullable(),
  right_foot_file: Yup.mixed().nullable(),
  additional_file_1: Yup.mixed().nullable(),
  additional_file_2: Yup.mixed().nullable(),
})

  // 🔹 Test 1 → STL files or Link (only if scan_type === "3D_scan")
  .test(
    'files-or-link',
    'Upload required: Either a valid link OR the necessary STL file(s).',
    function (value) {
      const {
        scan_type,
        left_foot_file,
        right_foot_file,
        custom_upload_link_with_photos,
        foot_Amputation,
      } = value;

      if (scan_type !== '3D_scan') return true; // ✅ Skip when not 3D scan

      if (custom_upload_link_with_photos && custom_upload_link_with_photos.trim()) {
        return true;
      }

      // If amputation is specified, check respective file
      if (foot_Amputation === 'Left_Foot' && left_foot_file) return true;
      if (foot_Amputation === 'Right_Foot' && right_foot_file) return true;

      // Or require both
      if (left_foot_file && right_foot_file) return true;

      return this.createError({
        path: 'left_foot_file',
        message: 'Please upload the STL file(s) or provide a link.',
      });
    }
  )

  // 🔹 Test 2 → Additional files validation (only if scan_type === "image")
  .test(
    'validate-additional-files',
    'Both Left and Right Leg files are required',
    function (value) {
      const { scan_type, additional_file_1, additional_file_2 } = value;

      if (scan_type !== 'image') return true; // ✅ Skip when not image

      if (additional_file_1 && additional_file_2) {
        return true;
      }

      return this.createError({
        path: !additional_file_1 ? 'additional_file_1' : 'additional_file_2',
        message: 'Please upload both Left and Right Leg files.',
      });
    }
  );






// const step2Validation = Yup.object().shape({
//   custom_upload_link_with_photos: Yup.string()
//     .url('Must be a valid URL (e.g., https://drive.google.com/...)')
//     .nullable(),
//   scan_type: Yup.string().required('Scan condition is required'),
//   foot_Amputation: Yup.string().required('Foot amputation is required'),

// });
// const step2Validation = Yup.object()
//   .shape({
//     custom_upload_link_with_photos: Yup.string().url('Must be a valid URL').nullable(),
//     scan_type: Yup.string().required('Scan condition is required'),
//     foot_Amputation: Yup.string().required('Foot amputation is required'),
//     left_foot_file: Yup.mixed().nullable(),
//     right_foot_file: Yup.mixed().nullable(),
//   })
//   .test(
//     'files-or-link',
//     'Both files or a link is required',
//     function (value) {
//       const { left_foot_file, right_foot_file, custom_upload_link_with_photos } = value;
//       if ((left_foot_file && right_foot_file) || (custom_upload_link_with_photos && custom_upload_link_with_photos.trim())) {
//         return true;
//       }
//       return this.createError({
//         path: 'left_foot_file', // you can attach error to either file or link
//         message: 'Both Left and Right foot files or a photo link is required'
//       });
//     }
//   );

const step4Validation = Yup.object().shape({
  global_volume_reduction: Yup.string()
    .nullable()
    .test(
      'is-valid-percentage',
      'Must be a percentage between 0% and 5% (e.g. 2%)',
      (value) => {
        if (!value) return true;

        const regex = /^\d{1,2}%$/;
        if (!regex.test(value)) return false;

        const num = parseInt(value.replace('%', ''));
        return num >= 0 && num <= 5;
      }
    ),
  socket_design_details: Yup.array().of(
    Yup.object().shape({
      cpo_input_mm: Yup.string()
        .test(
          'is-valid-number',
          'Must be a number between -20 and +20',
          (value) => {
            if (!value || value.trim() === '') return true; // Allow empty
            if (!/^-?\d+$/.test(value)) return false;
            const num = parseInt(value, 10);
            return num >= -20 && num <= 20;
          }
        )
    })
  )
});

const step3Validation = Yup.object().shape({
  locking_mechanism: Yup.string(),
});

const step5Validation = Yup.object().shape({
  finishing_type: Yup.string(),
  delivery_date: Yup.string(),
});

const initialValues = INSOLES_FORM_INITIAL_VALUES;

const SocketTypeDialog = ({
  open,
  onOpenChange,
  data
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Socket Type Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {data && (
            <>
              <div>
                <h4 className="font-medium text-lg">{data.label}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  {data.description || ''}
                </p>
              </div>

              {data.image && (
                <div className="mt-4">
                  <Image
                    src={data.image}
                    alt={data.label}
                    width={500}
                    height={300}
                    className="rounded-md border"
                  />
                </div>
              )}

              {data.features && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Key Features:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {data.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InsolesDialog = ({
  open,
  onOpenChange,
  options,
  onSelect,
  socketType
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: any[];
  onSelect: (value: string) => void;
  socketType: string;
}) => {
  const getDynamicContent = (variation: string) => {
    // Trim and normalize the variation text
    const normalizedVariation = variation.trim();

    const contentMap: Record<string, { title: string; description: string; image: string }> = {
      'AddiSole': {
        title: 'AddiSole',
        description: 'Premium Insole printed on HP-MJF',
        image: '/assets/order-forms/insoles/AddiSole.png'
      },
      'AddiSoleL': {
        title: 'AddiSoleL',
        description: 'Insoles printed on SLS Printer ',
        image: '/assets/order-forms/insoles/AddiSole.png'
      },
      'AddiSoleEco': {
        title: 'AddiSoleEco',
        description: 'Standard Insoles printed on FDM Printer',
        image: '/assets/order-forms/insoles/AddiSoleEco.png'
      },
    };

    if (contentMap[normalizedVariation]) {
      return contentMap[normalizedVariation];
    }

    const lowerCaseVariation = normalizedVariation.toLowerCase();
    const caseInsensitiveMatch = Object.entries(contentMap).find(([key]) =>
      key.toLowerCase() === lowerCaseVariation
    );

    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch[1];
    }

    const baseVariation = normalizedVariation.split(' (')[0].trim();
    const partialMatch = Object.entries(contentMap).find(([key]) =>
      key === baseVariation
    );

    if (partialMatch) {
      return partialMatch[1];
    }

    return {
      title: normalizedVariation,
      description: '',
      image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould-HR.png'
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl  max-h-[100vh] ">
        <DialogHeader>
          <DialogTitle>Select Insoles Model</DialogTitle>
          <DialogDescription>
            Choose your preferred Insoles Model from the options below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => {
            const variationText = option.label || option.value;
            const content = getDynamicContent(variationText);

            return (
              <div
                key={option.value}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
              >
                <h4 className="font-sm text-lg">{content.title}</h4>
                <p className="text-[12px] text-gray-700 mt-1">{content.description}</p>
                <div className="mt-0">
                  <Image
                    src={content.image}
                    alt={content.title}
                    width={200}
                    height={150}
                    className="rounded-md border object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModelDialog = ({
  open,
  onOpenChange,
  options,
  onSelect,
  socketType
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: any[];
  onSelect: (value: string) => void;
  socketType: string;
}) => {

  const getDynamicContent = (variation: string) => {

    const normalizedVariation = variation.trim().toLowerCase();

    const contentMap: Record<string, { title: string; description: string; image: string }> = {
      'addieaseeco': {
        title: 'AddiEaseEco',
        description: 'Economy Definitive & Check Sockets Printed on FDM Printer',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseEco.png'
      },
      'addiease': {
        title: 'AddiEase',
        description: 'Premium Definitive Sockets Printed on HP-MJF',
        image: '/assets/order-forms/bk-order/foot-type/AddiEase.png'

      },
      'addieasemould': {
        title: 'AddiEaseMould',
        description: 'Moulds Printed on FDM Printe',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould.png'
      },

      'addieasemould-hr': {
        title: 'AddiEaseMould-HR',
        description: 'Heat Resistant Moulds Printed on FDM Printer',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould-HR.png'

      },
    };

    // Try exact match first
    if (contentMap[normalizedVariation]) {
      return contentMap[normalizedVariation];
    }

    // Try partial match (without parentheses)
    const baseVariation = normalizedVariation.split(' (')[0];
    const partialMatch = Object.entries(contentMap).find(([key]) =>
      key.startsWith(baseVariation)
    );

    if (partialMatch) {
      return partialMatch[1];
    }

    // Default fallback
    return {
      title: variation.trim(),
      description: '',
      image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould-HR.png'
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Select Design Variation</DialogTitle>
          <DialogDescription>
            Choose your preferred design variation from the options below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => {
            const variationText = option.label || option.value;
            const content = getDynamicContent(variationText);

            return (
              <div
                key={option.value}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
              >
                <h4 className="font-sm text-lg">{content.title}</h4>
                <p className="text-[12px] text-gray-700 mt-1">{content.description}</p>
                <div className="mt-1">
                  <Image
                    src={content.image}
                    alt={content.title}
                    width={200}
                    height={150}
                    className="rounded-md border object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const WatchFieldReset = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  useEffect(() => {
    setFieldValue('design_variation', '');
    setFieldValue('model_name', '');

  }, [values.socket_type]);

  return null;
};

const Step1 = ({
  values,
  handleChange,
  errors,
  touched,
  setFieldValue,
  isPatientSelected,
  FORM_OPTIONS,
  formSubmitted,
  setSocketTypeDialog
}: any) => {



  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [insoleDialog, setInsoleDialog] = useState({
    open: false,
    options: []
  });

  const [modelDialog, setModelDialog] = useState({
    open: false,
    options: []
  });

  const shouldShowError = (fieldName: string, isRequired = false) => {
    if (!values[fieldName]) {
      if (!isRequired) return false;
      return formSubmitted || touched[fieldName];
    }
    return !!errors[fieldName] && (touched[fieldName] || formSubmitted);
  };

  const socketTypeOptions = useMemo(() => {
    return (FORM_OPTIONS?.socket_type || []).map((option: { value: any }) => ({
      ...option,
    }));
  }, [FORM_OPTIONS?.socket_type]);


  const designVariationOptions = useMemo(() => {
    return FORM_OPTIONS['insole_model'] || [];
  }, [FORM_OPTIONS]);

  // useEffect(() => {
  //   console.log("Form Values Updated:", values);
  //   const activityLevel: ActivityLevel = mapActivityLevel(values.activity_level);

  //   const thicknessStr = getThickness(
  //     values.insole_model,
  //     parseFloat(values.weight),
  //     activityLevel
  //   );
  //   //@ts-ignore
  //   setThickness(thicknessStr);
  //   console.log("Calculated Thickness:", thicknessStr);
  // }, [values]);




  useEffect(() => {
    // console.log("Available insole models:", FORM_OPTIONS['insole_model']);
    // console.log("Current insole model value:", values.insole_model);
  }, [FORM_OPTIONS, values.insole_model]);


  const modelOptions = useMemo(() => {
    if (!values.socket_type || !values.design_variation) return [];
    const baseOptions = FORM_OPTIONS[values.socket_type + '_' + values.design_variation + '_' + '_design_variation'] || [];

    return baseOptions.map((option: { value: string; label: string }) => ({
      ...option,
    }));
  }, [values.socket_type, values.design_variation, FORM_OPTIONS]);



  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-lg text-primary">Basic Details</h3>
      <div className="grid grid-cols-3 gap-4">
        <PatientPicker
          label="Patient Name"
          placeholder="Patient Name"
          value={values.patient_name}
          onChange={handleChange('patient_name')}
          setFieldValue={setFieldValue}
          required
          inVaild={shouldShowError('patient_name', true)}
          error={errors.patient_name}
        />
        <div className="grid grid-cols-3 gap-2 col-span-2">
          <Input
            label="Date of Birth"
            type="date"
            value={values.date_of_birth || ''}
            onChange={handleChange('date_of_birth')}
            required
            inVaild={shouldShowError('date_of_birth', true)}
            error={errors.date_of_birth}
            disabled={true}
          />
          <Input
            placeholder="65"
            label="Height (cm)"
            onChange={handleChange('height')}
            value={values.height}
            inVaild={shouldShowError('height')}
            error={errors.height}
            disabled={true}
          />
          <Input
            placeholder="50"
            label="Weight (kgs)"
            required
            value={values.weight}
            onChange={handleChange('weight')}
            inVaild={shouldShowError('weight', true)}
            error={errors.weight}
            disabled={true}
          />
        </div>
        <Input
          placeholder="10 digit phone number"
          label="Mobile Number"
          onChange={handleChange('mobile_no')}
          value={values.mobile_no}
          error={errors.mobile_no}
          disabled={true}
        />
        <Input
          placeholder="Email"
          label="Email"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          disabled={true}
        />
        <SelectBox
          options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
          ]}
          label="Gender"
          value={values.gender}
          onValueChange={handleChange('gender')}
          inVaild={shouldShowError('gender', true)}
          required
          error={errors.gender}
          disabled={true}
        />
      </div>
      <div className="divider"></div>

      <div className="grid grid-cols-4 gap-4">
        <div><Input
          label='Shoe Size (European) '
          placeholder="10"
          value={values.shoe_size}
          onChange={handleChange('shoe_size')}
          required
          inVaild={shouldShowError('shoe_size', true)}
          error={errors.shoe_size}
        />
          {/* <Link href="https://sarainfoway.bitrix24.in/online/?IM_DIALOG=chat34952&IM_MESSAGE=2209348" target="_blank" rel="noopener noreferrer">
            <a className="text-blue-600 underline hover:text-blue-800">
              Verify shoe size
            </a>
          </Link> */}
          <a
            href="https://uaterp.addiwise.com/files/AT_IN_SHOE%20SIZES_v.1%20(1).pdf"
            target="_blank"
            rel="noopener noreferrer"

            className="text-blue-600 underline"
          >
            Verify shoe size
          </a>
        </div>



        {/* <Input
          label="insoletype"
          placeholder="Choose your comfort need"
          value={values.shoe_width}
          onChange={handleChange('shoe_width')}
          required
          inVaild={shouldShowError('shoe_width', true)}
          error={errors.shoe_width}
        /> */}
        <SelectBox
          // options={[
          //   { value: 'City Comfort', label: 'Daily comfort for urban walking' },
          //   { value: 'Endurance', label: 'Support for long hours on foot' },
          //   { value: 'Sensitive', label: 'Extra soft cushioning support' },
          //   { value: 'Sports', label: 'Sports stability and shock absorption' },
          //   { value: 'Diabetics', label: 'Diabetic foot pressure protection' }
          // ]}
          options={insoleOptions}
          label="Usage"
          placeholder="Choose your comfort need"
          value={values.insoletype}
          onValueChange={(selectedinsoletype) => {
            setFieldValue("insoletype", selectedinsoletype);

            // Auto-set thickness if mapping exists
            if (insoletypeToThicknessMap[selectedinsoletype]) {
              setFieldValue("thickness", insoletypeToThicknessMap[selectedinsoletype]);
            }
          }}
          inVaild={shouldShowError('insoletype', true)}
          required
          error={errors.insoletype}
        />
        <div className="flex flex-col">
          <label className="block text-xs font-medium text-black mb-1">
            Insoles Model <span className="text-red-500">*</span>
          </label>
          <div>

            <Button
              variant="outline"
              className="w-full text-left justify-start h-10"
              onClick={() => setInsoleDialog({
                open: true,
                options: designVariationOptions
              })}
            >
              {values.insole_model
                ? designVariationOptions.find((opt: { value: string }) => opt.value === values.insole_model)?.label
                : "Select Insole Model"}
            </Button>
            {shouldShowError('insole_model', true) && (
              <p className="text-xs text-red-500 mt-1">{errors.insole_model}</p>
            )}
          </div>

        </div>
        <SelectBox
          options={FORM_OPTIONS?.activity_level || []}
          label="Activity Level"
          value={values.activity_level}
          onValueChange={handleChange('activity_level')}
          required
          inVaild={shouldShowError('activity_level', true)}
          error={errors.activity_level}
        />
      </div>

      {/* <div className="grid grid-cols-3 gap-4">
        <SelectBox
          options={socketTypeOptions}
          label="Socket Type"
          value={values.socket_type}
          onValueChange={(value) => {
            handleChange('socket_type')(value);
          }}
          inVaild={shouldShowError('socket_type', true)}
          error={errors.socket_type}
          required
        />

        <div className="flex flex-col">
          <label className="block text-xs font-medium text-black mb-1">
            Design Variation <span className="text-red-500">*</span>
          </label>
          {values.socket_type ? (
            <>
              <Button
                variant="outline"
                className="w-full text-left justify-start h-10"
                onClick={() => setDesignVariationDialog({
                  open: true,
                  options: designVariationOptions
                })}
              >
                {values.design_variation 
                  ? designVariationOptions.find((opt: { value: string }) => opt.value === values.design_variation)?.label
                  : "Select Design Variation"}
              </Button>
              {shouldShowError('design_variation', true) && (
                <p className="text-xs text-red-500 mt-1">{errors.design_variation}</p>
              )}
            </>
          ) : (
            <Input
              placeholder="Select socket type first"
              disabled
            />
          )}
        </div>
        <div className="flex flex-col">
          <label className="block text-xs font-medium text-black mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          {values.socket_type && values.design_variation ? (
            <>
              <Button
                variant="outline"
                className="w-full text-left justify-start h-10"
                onClick={() => setModelDialog({
                  open: true,
                  options: modelOptions
                })}
              >
                {values.model_name 
                  ? modelOptions.find((opt: { value: string }) => opt.value === values.model_name)?.label
                  : "Select Model"}
              </Button>
              {shouldShowError('model_name', true) && (
                <p className="text-xs text-red-500 mt-1">{errors.model_name}</p>
              )}
            </>
          ) : (
            <Input
              placeholder={!values.socket_type ? "Select socket type first" : "Select design variation first"}
              disabled
            />
          )}
        </div>
      </div> */}

      <h3 className="font-semibold text-lg  text-primary">Measurements</h3>
      <div className="grid grid-cols-3 gap-4 items-center ml-1">
        <div className='ml-5' >
          <Image
            src='/assets/order-forms/insoles/addisoleimage.png'
            alt="measurements"
            width={400}
            height={100}
            className="object-cover"
            loading="lazy"
            priority={false}
            unoptimized={true}
          />
        </div>
        <div className="flex flex-col col-span-2 gap-4 ml-20">
          <div className="grid grid-cols-2 gap-4 ">
            <div className="mb-2">
              <label className="block text-xs font-medium text-black">
                <strong>A</strong> - Foot Length (cm) <span className="text-red-500">*</span>
              </label>
              <div className=' mt-1'>

                <Input
                  placeholder="10"
                  value={values.foot_length}
                  onChange={handleChange('foot_length')}
                  required
                  inVaild={shouldShowError('foot_length', true)}
                  error={errors.foot_length}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <div className="mb-0 ">
              <label className="block text-xs font-medium text-black">
                <strong>B</strong> - Metatarsal to heel length (cm) <span className="text-red-500">*</span>
              </label>
              <div className='mt-1'>

                <Input
                  placeholder="10"
                  value={values.custom_metatarsal_to_heel_length}
                  onChange={handleChange('custom_metatarsal_to_heel_length')}
                  required
                  inVaild={shouldShowError('custom_metatarsal_to_heel_length', true)}
                  error={errors.custom_metatarsal_to_heel_length}
                />

              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <div className="mb-2">
              <label className="block text-xs font-medium text-black">
                <strong>C</strong> - Metatarsal width (cm) <span className="text-red-500">*</span>
              </label>
              <div className=' mt-1'>
                <Input
                  placeholder="10"
                  value={values.custom_metatarsal_width_cm}
                  onChange={handleChange('custom_metatarsal_width_cm')}
                  required
                  inVaild={shouldShowError('custom_metatarsal_width_cm', true)}
                  error={errors.custom_metatarsal_width_cm}
                />
              </div>

            </div>
          </div>

        </div>
      </div>
      <div className="ml-1 space-y-4">
        <h6 className="text-2xl font-bold text-[16px] ml-5 text-primary">FOOT COMPLAINTS/ PROBLEMS</h6>
        <div className="grid grid-cols-2 gap-4 mr-40 mb-5">
          <CheckboxGroup
            options={[
              { id: 'plantar-fascitis', label: 'Plantar Fascitis', group: 'Heel Pain' },
              { id: 'heel-spur', label: 'Heel Spur', group: 'Heel Pain' },
              { id: 'flat-feet', label: 'Flat Feet', group: 'Arch Pain' },
              { id: 'pronation', label: 'Pronation', group: 'Arch Pain' },
              { id: 'metatarsalgia', label: 'Metatarsalgia', group: 'Metatarsal Pain' },
              { id: 'mortons-neuroma', label: 'Mortons Neuroma', group: 'Metatarsal Pain' },
              { id: 'heel-deformity', label: 'Heel Deformity', group: 'Ankle Pain' },
              { id: 'ankle-pain', label: 'Ankle Pain', group: 'Ankle Pain' },
              { id: 'osteoarthritis', label: 'Osteoarthritis', group: 'Knee Pain' },
              { id: 'corn', label: 'Corn', group: 'Skin Issues' },
              { id: 'calluses', label: 'Calluses', group: 'Skin Issues' },
              { id: 'achiles-tendonitis', label: 'Achilles Tendonitis', group: 'Ach Tend.' },
              { id: 'neuroma', label: 'Neuroma', group: 'Diabetic' },
              { id: 'shin-pain', label: 'Shin Pain', group: 'Shin Splint' },
              { id: 'high-arches', label: 'High Arches', group: 'Lateral Foot Pain' },
            ]}
            selectedOptions={selectedOptions}
            onChange={(newSelectedOptions) => {
              setSelectedOptions(newSelectedOptions);
              setFieldValue('selected_foot_conditions', newSelectedOptions);
            }}
          />
        </div>
      </div>

      <InsolesDialog
        open={insoleDialog.open}
        onOpenChange={(open) => setInsoleDialog(prev => ({ ...prev, open }))}
        options={designVariationOptions}
        onSelect={(value) => {
          setFieldValue('insole_model', value);
        }}
        socketType={values.socket_type}
      />

      <ModelDialog
        open={modelDialog.open}
        onOpenChange={(open) => setModelDialog(prev => ({ ...prev, open }))}
        options={modelOptions}
        onSelect={(value) => setFieldValue('model_name', value)}
        socketType={values.socket_type}
      // designVariation={values.design_variation}
      />
    </div>
  );
};

const Step2 = ({
  values,
  handleChange,
  errors,
  touched,
  setFieldValue,
  FORM_OPTIONS,
  formSubmitted
}: any) => {
  const shouldShowError = (fieldName: string, isRequired = false) => {
    if (!isRequired && !values[fieldName]) {
      return false;
    }
    if (isRequired && (formSubmitted || touched[fieldName])) {
      return !!errors[fieldName];
    }
    return !!(touched[fieldName] && errors[fieldName]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4 items-end">
        <div className="grid grid-cols-1 gap-4 ">
          <h3 className="font-semibold text-lg text-primary ">Scan Condition</h3>
          <SelectBox
            options={[
              { label: 'Image', value: 'image' },
              { label: '3D Scan', value: '3D_scan' },
            ]}
            label="Scan Type"
            required={true}
            value={values.scan_type}
            onValueChange={handleChange('scan_type')}
            inVaild={shouldShowError('scan_type', true)}
            error={errors.scan_type}
          />
        </div>
      </div>

      {/* Show only if Scan Type = 3D Scan */}
      {values.scan_type === '3D_scan' && (
        <>
          <h3 className="font-semibold text-lg text-primary">Scans Upload</h3>
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-3">
              <div className="grid grid-cols-2">
                <p className="mb-1 text-[14px]  flex items-center">Upload Scan</p>
                <div className="w-[190px] ml-8">
                  {/* <SelectBox
                    options={[{ 
                      value: 'Both', label: 'Left Foot/Right Foot '
                     }]}
                    value={values.foot_Amputation}
                    onValueChange={handleChange('foot_Amputation')}

                  />{shouldShowError('foot_Amputation', true) && (
                    <p className="text-xs text-red-500 mt-1">{errors.foot_Amputation}</p>
                  )} */}
                </div>
              </div>
            </div>

            {(values.foot_Amputation === 'Left_Foot' || values.foot_Amputation === 'Both') && (
              <div className="w-fit justify-center">
                <StlFilePicker
                  label="Upload  file (left foot)"
                  buttonText="Left Foot"
                  accept={['.stl']}
                  onFileSelect={(fileUrl) => {
                    if (fileUrl) {
                      setFieldValue("left_foot_file", fileUrl);  // ✅ update formik
                    } else {
                      setFieldValue("left_foot_file", null);     // ✅ clear if removed
                    }
                  }}
                // onFileSelect={(file) => console.log('Left Foot STL selected:', file?.name)}
                /> {shouldShowError('left_foot_file', true) && (
                  <p className="text-xs text-red-500 mt-1">{errors.left_foot_file}</p>
                )}
              </div>
            )}

            {(values.foot_Amputation === 'Right_Foot' || values.foot_Amputation === 'Both') && (
              <div className="w-fit">
                <StlFilePicker
                  label="Upload  file (Right foot)"
                  buttonText="Right Foot"
                  accept={['.stl']}
                  onFileSelect={(fileUrl) => {
                    if (fileUrl) {
                      setFieldValue("right_foot_file", fileUrl);  // ✅ update formik
                    } else {
                      setFieldValue("right_foot_file", null);     // ✅ clear if removed
                    }
                  }}
                // onFileSelect={(file) => console.log('Right Foot STL selected:', file?.name)}
                /> {shouldShowError('left_foot_file', true) && (
                  <p className="text-xs text-red-500 mt-1">{errors.left_foot_file}</p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-3">
              <p className="mb-0 text-[14px] ">Upload Additional Files</p>
              <span className="mb-1 text-[12px] ">(Design / Rough calculations etc.)</span>
            </div>
            <div className="w-fit">
              <GenericFileViewer
                allowedTypes={['.zip']}
                maxSizeMB={50}
                label="Select Image"
                buttonText="Left Leg"
                onFileSelect={(fileUrl) => {
                  if (fileUrl) {
                    console.log(" File selected:", fileUrl);
                  } else {
                    console.log("No file selected or file removed");
                  }
                }}
              />
            </div>
            <div className="w-fit ml-2">
              <GenericFileViewer
                allowedTypes={['.zip']}
                maxSizeMB={50}
                label="Select Image"
                buttonText="Right Leg"
                onFileSelect={(fileUrl) => {
                  if (fileUrl) {
                    console.log(" File selected:", fileUrl);
                  } else {
                    console.log("No file selected or file removed");
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
      {values.scan_type === 'image' && (
        <>
          <h3 className="font-semibold text-lg text-primary">Scans Upload</h3>
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-3">
              <p className="mb-0 text-[14px] ">Upload Additional Files</p>
              <span className="mb-1 text-[12px] ">(Design / Rough calculations etc.)</span>
            </div>
            {/* Left Leg Upload */}
            <div className="w-fit">
              <GenericFileViewer
                allowedTypes={['.zip']}
                maxSizeMB={50}
                label="Select Image"
                buttonText="Left Leg"
                onFileSelect={(fileUrl) => {
                  setFieldValue("additional_file_1", fileUrl || null);
                }}
              />
              {shouldShowError("additional_file_1", true) && (
                <p className="text-xs text-red-500 mt-1">{errors.additional_file_1}</p>
              )}
            </div>

            {/* Right Leg Upload */}
            <div className="w-fit ml-2">
              <GenericFileViewer
                allowedTypes={['.zip']}
                maxSizeMB={50}
                label="Select Image"
                buttonText="Right Leg"
                onFileSelect={(fileUrl) => {
                  setFieldValue("additional_file_2", fileUrl || null);
                }}
              />
              {shouldShowError("additional_file_2", true) && (
                <p className="text-xs text-red-500 mt-1">{errors.additional_file_2}</p>
              )}
            </div>

          </div>
        </>
      )}




      <div className="flex flex-col-6 gap-4">
        <div className="col-span-3">
          <p className="mb-1 text-[14px]  ">Upload Link with Photos</p>
          <p className="mb-1 text-[12px] ">
            (Upload in Google /Cloud drive and give relevant permission)
          </p>
        </div>
        <div className="flex flex-col-6 gap-4">
          <Input
            placeholder="https://drive.google.com/..."
            className="mt-3 min-w-max ml-0 w-[410px]"
            value={values.custom_upload_link_with_photos}
            onChange={handleChange('custom_upload_link_with_photos')}
            required
            inVaild={shouldShowError('custom_upload_link_with_photos')}
            error={errors.custom_upload_link_with_photos}
          />
        </div>
      </div>
      <a
        href="https://www.youtube.com/watch?feature=shared&v=uWJvxQDm8Dk"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-semibold hover:underline"
      >
        How to use  Watch Video
      </a>
    </div>

  );
};

const Step4 = ({ values, handleChange, errors, touched, formSubmitted }: any) => {
  const shouldShowError = (fieldName: string, isRequired = false) => {
    // Handle nested fields like socket_design_details[0].cpo_input_mm
    const fieldValue = fieldName.includes('.')
      ? fieldName.split('.').reduce((obj, key) =>
        obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], values)
      : values[fieldName];

    if (!fieldValue) {
      if (!isRequired) return false;
      return formSubmitted || touched[fieldName];
    }
    const fieldError = fieldName.includes('.')
      ? fieldName.split('.').reduce((obj, key) =>
        obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], errors)
      : errors[fieldName];

    return !!fieldError && (touched[fieldName] || formSubmitted);
  };
  return (
    <div>
      {/* <h3 className="font-semibold text-lg">Stump Condition</h3> */}
      <p className="text-xs mt-2">
        Please specify the design considerations for each point from A to N. Use "-" to
        indicate Apply pressure (Reduction) and "+" to indicate Relief at the particular
        area. All values should be in millimetres (mm). For eg for applying reduction of 6 mm
        at Patela Tendon, please specify -6
      </p>
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="mb-6">
          <p className="text-xs">
            {' '}
            <span className="text-sm"> Global Volume Reduction </span>
            <br /> (please specify the percentage reduction in Volume without reducing the
            length of the socket)
          </p>
        </div>
        <Input
          placeholder="Default Value:2%"
          onChange={handleChange('global_volume_reduction')}
          value={values.global_volume_reduction || ''}
          inVaild={shouldShowError('global_volume_reduction')}
          error={errors.global_volume_reduction || ''}
        />
      </div>
      <div className="flex justify-center p-2 mr-20">
        <Image
          src={'/assets/order-forms/bk-order/SocketDesign-BK.jpg'}
          alt="Design Modications"
          width={520}
          height={400}
          className="object-cover"
        />
      </div>
    </div>
  );
};
const insoleOptions = [
  { value: 'City Comfort', label: 'Daily comfort for urban walking' },
  { value: 'Endurance', label: 'Support for long hours on foot' },
  { value: 'Sensitive', label: 'Extra soft cushioning support' },
  { value: 'Sports', label: 'Sports stability and shock absorption' },
  { value: 'Diabetics', label: 'Diabetic foot pressure protection' },
];
export default function InsolesOrderForm({ item_type, }: { item_type: string, }): React.JSX.Element {
  const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
  const [createInsoleOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateInsoleOrderMutation();
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  // console.log(" Logged-in user from Redux:", user);
  const [selectedItem, setSelectedItem] = React.useState<string>('');
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameInByDetailsMutation();
  // console.log("Selected Item Code:", selectedItem);
  const [getOrderDetails, { data: orderDetails, isLoading: isOrderDetailsLoading }] =
    useGetOrderDetailsMutation();
  // console.log("orderDetails>>yyy", data)
  const [formValues, setFormValues] = useState(initialValues);
  const [modelOpen, setModelOpen] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [socketTypeDialog, setSocketTypeDialog] = useState({
    open: false,
    data: null
  });
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const deviceTypeId = searchParams.get('deviceType');
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [showStep1Confirmation, setShowStep1Confirmation] = useState(false);
  const [showStep5Confirmation, setShowStep5Confirmation] = useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [thicknests, setThickness] = useState<string>('');
  const skipValidation = searchParams.get("skipValidation") === "true";
  // const { values, setFieldValue } = useFormikContext<any>(); // ✅ Formik hook

  //payment states 
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;



  useEffect(() => {
    // if (skipValidation) {
    //   console.log("Skipping prefill + validation because skipValidation=true");
    //   return;
    // }
    if (orderId && deviceTypeId) {
      getOrderDetails({
        order_type: deviceTypeId,
        order_id: orderId,
      })
        .unwrap()
        .then((response) => {
          // console.log("Full API response =>", response);

          if (response.data) {
            // console.log("API Keys =>", Object.keys(response.data));
            const insoleOptions = [
              { value: 'City Comfort', label: 'Daily comfort for urban walking' },
              { value: 'Endurance', label: 'Support for long hours on foot' },
              { value: 'Sensitive', label: 'Extra soft cushioning support' },
              { value: 'Sports', label: 'Sports stability and shock absorption' },
              { value: 'Diabetics', label: 'Diabetic foot pressure protection' },
            ];
            const matchedUsage = insoleOptions.find(opt => opt.value === response.data.usage);
            // console.log("✅ Matched Usage Option:", matchedUsage);

            const transformedData = {
              ...INSOLES_FORM_INITIAL_VALUES,
              patient_name: response.data.patient_name || "",
              gender: response.data.gender || "",
              activity_level: response.data.activity || "",
              date_of_birth: response.data.dob || "",
              height: response.data.custom_height ?? "",
              weight: response.data.weight ?? "",
              mobile_no: response.data.custom_mobile_no || "",
              email: response.data.custom_email || "",
              insole_model: response.data.custom_insoles_model || "",
              shoe_size: response.data.shoe_size_eu ?? "",
              foot_length: response.data.foot_length_cm ?? "",
              custom_metatarsal_to_heel_length: response.data.custom_metatarsal_to_heel_length ?? "",
              custom_metatarsal_width_cm: response.data.custom_metatarsal_width_cm ?? "",
              thickness: response.data.thickness_mm ?? "",
              insoletype: matchedUsage ? matchedUsage.value : "",
              insole_design_variation: response.data.layers || "",
              Design_by: response.data.custom_print_by || "",
              design_variation: response.data.custom_design_by || "",
              Print_by: response.data.custom_print_by || "",
              table_zbib: response.data.table_zbib?.length
                ? response.data.table_zbib.map((item: any) => ({
                  point_name: item.point_name || "",
                  pressure_mm: item.pressure_mm || "",
                }))
                : [{ point_name: "", pressure_mm: "" }],
              selected_foot_conditions: response.data.selected_foot_conditions?.length
                ? response.data.selected_foot_conditions
                : [""],

            };

            // console.log("Transformed Insole Data =>", transformedData);
            setFormValues(transformedData);

            if (response.data.item_code) {
              setSelectedItem(response.data.item_code);
            }

            setIsInitialDataLoaded(true);
          } else {
            // console.error("API returned no data");
            setIsInitialDataLoaded(false);
          }
        })
        .catch((error) => {
          // console.error("Failed to load insole order details:", error);
          setIsInitialDataLoaded(false);
        });
    }
  }, [orderId, deviceTypeId, skipValidation]);





  useEffect(() => {
    if (orderDetails?.data) {
      // if (skipValidation) {
      //   console.log("Skipping prefill + validation because skipValidation=true");
      //   return;
      // }
      const apiData = orderDetails.data;
      const insoleOptions = [
        { value: 'City Comfort', label: 'Daily comfort for urban walking' },
        { value: 'Endurance', label: 'Support for long hours on foot' },
        { value: 'Sensitive', label: 'Extra soft cushioning support' },
        { value: 'Sports', label: 'Sports stability and shock absorption' },
        { value: 'Diabetics', label: 'Diabetic foot pressure protection' },
      ];
      const matchedUsage = insoleOptions.find(opt => opt.value === apiData.usage);
      // console.log("✅ Matched Usages Option:", matchedUsage);

      setFormValues({
        ...INSOLES_FORM_INITIAL_VALUES,
        patient_name: apiData.patient_name || "",
        gender: apiData.gender || "",
        date_of_birth: apiData.dob || "",
        height: apiData.custom_height || "",
        activity_level: apiData.activity || "",
        weight: apiData.weight || "",
        mobile_no: apiData.custom_mobile_no || "",
        email: apiData.custom_email || "",
        shoe_size: apiData.shoe_size_eu || "",
        Design_by: apiData.custom_print_by || "",
        custom_metatarsal_to_heel_length: apiData.custom_metatarsal_to_heel_length ?? "",
        custom_metatarsal_width_cm: apiData.custom_metatarsal_width_cm ?? "",
        foot_length: apiData.foot_length_cm || "",
        insoletype: matchedUsage ? matchedUsage.value : "",
        thickness: apiData.thickness_mm || "",

        design_variation: apiData.custom_design_by || "",
        Print_by: apiData.custom_print_by || "",
        insole_model: apiData.custom_insoles_model || "",
        insole_design_variation: apiData.layers || "",
        table_zbib:
          apiData.table_zbib?.map((item: { point_name: string; pressure_mm: string }) => ({
            point_name: item.point_name || "",
            pressure_mm: item.pressure_mm || "",
          })) || INSOLES_FORM_INITIAL_VALUES.table_zbib,
        selected_foot_conditions:
          apiData.selected_foot_conditions || INSOLES_FORM_INITIAL_VALUES.selected_foot_conditions,
      });
    }
  }, [orderDetails, skipValidation]);


  useEffect(() => {
    console.log("Form Values Updated:", formValues);
    const activityLevel = mapActivityLevel(formValues.activity_level);
    const t = getThickness(
      formValues.insole_model,
      Number(formValues.weight) || 0,
      formValues.activity_level as "K1" | "K2" | "K3" | "K4",
    );
    console.log("Calculated Thickness (from getThickness):", t, typeof t);
    setThickness(String(t)); // convert number to string
    // if using Formik, also sync the form value:
    // formik.setFieldValue('thickness', t);

  }, [formValues.insole_model, formValues.weight, formValues.activity_level /* add formik if used */]);



  const FORM_OPTIONS = useMemo(() => {
    if (isFormOptionsLoading) return {};
    if (data) {
      return getFormOptionsObject(data?.order_from_details);
    }
    return {};
  }, [data, isFormOptionsLoading]);

  const handleConfirmOrder = () => {
    const payload: any = {};
    payload.item_type = 'IN';
    payload.customer = user?.customer_id;
    payload.order_details = formValues;
    payload.item_code = selectedItem;

    createInsoleOrder(payload);
  };

  // const OnSubmit = async (values: any) => {
  //   console.log("Form values on submit:", values);
  //   setFormValues(values);


  //   const payload = {
  //     item_type: 'IN',
  //     // socket_type: values.socket_type,
  //     insole_model: values.insole_model,
  //     design_variation: values.design_variation,
  //     activity_level: values.activity_level,
  //     model_name: values.model_name,
  //     stump_length: values.stump_length,
  //     weight: values.weight,
  //     insoletype: values.insoletype,
  //     // insoletype: values.insoleType,
  //     insole_design_variation: values.insole_design_variation,
  //   };
  //   console.log("Payload for item code fetch:", payload);
  //   const itemCode = await getItemCodeByValues(payload);
  //   setSelectedItem(itemCode);
  //   console.log("Final item code:", itemCode);

  //   // Submit the final form
  //   const orderPayload = {
  //     item_type: 'IN',
  //     customer: user?.customer_id,
  //     order_details: values,
  //     item_code: itemCode,
  //   };
  //   createOrder(orderPayload);
  // };



  // const OnSubmit = async (values: any) => {
  //   console.log("Form values on submit:", values);
  //   setFormValues(values);
  //   const payload = {
  //     item_type: 'IN',
  //     // socket_type: values.socket_type,
  //     insole_model: values.insole_model,
  //     design_variation: values.design_variation,
  //     activity_level: values.activity_level,
  //     model_name: values.model_name,
  //     stump_length: values.stump_length,
  //     weight: values.weight,
  //     insoletype: values.insoletype,
  //     // insoletype: values.insoleType,
  //     insole_design_variation: values.insole_design_variation,
  //     thickness: thicknests  //e.g. "3.5 MM"
  //   };
  //   console.log("Payload for item code fetch:", payload);

  //   const itemCode = await getItemCodeByValues(payload);
  //   setSelectedItem(itemCode);
  //   // ✅ Final payload
  //   const orderPayload = {
  //     item_type: "IN",
  //     customer: user?.customer_id,
  //     order_details: {
  //       ...values,
  //       thickness: thicknests, // e.g. "3.5 MM"
  //     },
  //     item_code: itemCode,
  //   };

  //   console.log("Final Order Payload:", orderPayload);
  //   console.log("Generated Item Code:", itemCode);
  //   createInsoleOrder(orderPayload);
  // };

  const OnSubmit = async (values: any) => {
    // console.log("Form values on submit:", values);
    setFormValues(values);

    const payload = {
      item_type: "IN",
      insole_model: values.insole_model,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight,
      insoletype: values.insoletype,
      insole_design_variation: values.insole_design_variation,
      thickness: thicknests, // e.g. "3.5 MM"
    };

    // console.log("Payload for item code fetch:", payload);

    const itemCode = await getItemCodeByValues(payload);
    setSelectedItem(itemCode);

    // console.log("Generated Item Code:", itemCode);

    // ❌ Don't create the order here
    // ✅ Just prepare and store payload for later
    const orderPayload = {
      item_type: "IN",
      customer: user?.customer_id,
      order_details: {
        ...values,
        thickness: thicknests,
      },
      item_code: itemCode,
    };

    // createInsoleOrder(orderPayload); // store for later payment step
    setShowStep5Confirmation(true); // open confirmation dialog
  };


  const getItemCodeByValues = async (payload: any) => {
    const res: any = await getItem(payload);
    // console.log("Item code fetch response:", res);
    return res?.data?.item_code;
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Order created successfully');
      setSelectedItem('');
      setFormValues(initialValues);
      router.push('/orders');
    }
  }, [isOrderCreating, isSuccess]);

  const validateCurrentStep = async (values: any) => {
    try {
      if (currentStep === 1) {
        await step1Validation.validate(values, { abortEarly: false });
      } else if (currentStep === 2) {
        await step2Validation.validate(values, { abortEarly: false });
      }
      else if (currentStep === 3) {
        await step3Validation.validate(values, { abortEarly: false });
      }
      else if (currentStep === 4) {
        await step4Validation.validate(values, { abortEarly: false });

      } else if (currentStep === 5) {
        await step5Validation.validate(values, { abortEarly: false });
      }
      return {};
    } catch (errors) {
      if (errors instanceof Yup.ValidationError) {
        return errors.inner.reduce((acc, error) => {
          return {
            ...acc,
            [error.path || '']: error.message,
          };
        }, {});
      }
      return {};
    }
  };

  // const nextStep = async (values: any, setErrors: any) => {

  //   setFormSubmitted(true);
  //   const errors = await validateCurrentStep(values);
  //   if (Object.keys(errors).length === 0) {
  //     if (currentStep === 1) {
  //       // Show confirmation dialog after Step 1
  //       setFormValues(values);
  //       const itemPayload = {
  //         item_type: 'BK',
  //         // socket_type: values.socket_type,
  //         insole_model: values.insole_model,
  //         design_variation: values.design_variation,
  //         activity_level: values.activity_level,
  //         model_name: values.model_name,
  //         stump_length: values.stump_length,
  //         weight: values.weight,
  //         itemCode: selectedItem
  //       };
  //       console.log("Item payload for code fetch:", itemPayload);
  //       const itemCode = await getItemCodeByValues(itemPayload);
  //       setSelectedItem(itemCode);
  //       setShowStep1Confirmation(true);
  //     } else {
  //       setCompletedSteps([...completedSteps, currentStep]);
  //       setCurrentStep(currentStep + 1);
  //       setFormSubmitted(false);
  //     }
  //   } else {
  //     setErrors(errors);
  //   }
  // };


  const nextStep = async (values: any, setErrors: any): Promise<boolean> => {
    console.log("Next step called with values:", values);
    setFormSubmitted(true);
    const errors = await validateCurrentStep(values);

    if (Object.keys(errors).length === 0) {
      setCompletedSteps([...completedSteps, currentStep]);
      setFormSubmitted(false);
      return true; // ✅ validation passed
    } else {
      setErrors(errors);
      return false; // ❌ validation failed
    }
  };


  const prevStep = () => {
    setFormSubmitted(false);
    setCurrentStep(currentStep - 1);
  };

  const handleStep1Confirmation = () => {
    setShowStep1Confirmation(false);
    setCompletedSteps([...completedSteps, 1]);
    setCurrentStep(2);
    setFormSubmitted(false);
  };
  const handleStep5Confirmation = () => {
    // when user confirms
    // handleSubmit();// 🔹 actually submit form here
    setShowStep5Confirmation(false);

    // step tracking logic
    setCompletedSteps([...completedSteps, 5]);
    setCurrentStep(5);
    setFormSubmitted(false);
  };

  return (
    <div className="pb-16 relative">
      <Formik
        initialValues={isInitialDataLoaded ? formValues : initialValues}
        onSubmit={OnSubmit}
        validationSchema={
          currentStep === 1 ? step1Validation :
            currentStep === 2 ? step2Validation :
              currentStep === 3 ? step3Validation :
                currentStep === 4 ? step4Validation :
                  currentStep === 5 ? step5Validation :
                    null
        }
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize
      >
        {({ values, handleChange, handleSubmit, errors, touched, setFieldValue, setErrors, isValid }) => (


          <div className="flex flex-col gap-6">
            <WatchFieldReset />
            {/* Socket Type Dialog */}
            <SocketTypeDialog
              open={socketTypeDialog.open}
              onOpenChange={(open) => setSocketTypeDialog(prev => ({ ...prev, open }))}
              data={socketTypeDialog.data}
            />
            {/* Step indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {[
                  { step: 1, name: 'Basic Details & Measurements', icon: '📋' },
                  { step: 2, name: 'Scan', icon: '📁' },
                  // { step: 3, name: 'Locking Mechanism', icon: '🔒' },
                  // { step: 4, name: 'Modifications', icon: '✏️' },
                  { step: 5, name: 'Finish', icon: '🎨' }
                ].map(({ step, name, icon }) => (
                  <React.Fragment key={step}>
                    <button
                      type="button"
                      onClick={async () => {
                        const errors = await validateCurrentStep(values);
                        if (Object.keys(errors).length === 0 || step < currentStep) {
                          setCurrentStep(step);
                          setFormSubmitted(false);
                        } else {
                          setErrors(errors);
                          setFormSubmitted(true);
                        }
                      }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`h-7 flex items-center justify-center text-sm transition-all duration-300 ease-in-out rounded-full ${currentStep === step
                          ? "bg-primary/88 text-white text-gray-900 scale-105 text-sm ring-0 bg-gray-200 px-4"
                          : completedSteps.includes(step)
                            ? "bg-gray-300 text-gray-800 border border-gray-200 hover:bg-gray-400 px-4"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 px-4"
                          } ${step > currentStep && !completedSteps.includes(step) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span className="flex items-center gap-2">
                          {currentStep === step && (
                            <></>
                          )}
                          {completedSteps.includes(step) && !(currentStep === step) && (
                            <svg
                              className="w-3 h-3 text-gray-500 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          <span className="whitespace-nowrap">{name}</span>
                        </span>
                      </div>
                    </button>
                    {step < 5 && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-all duration-500 ${completedSteps.includes(step)
                              ? 'stroke-primary'
                              : 'stroke-gray-300'
                              }`}
                          />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {currentStep === 1 && (
              <Step1
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
                setSocketTypeDialog={setSocketTypeDialog}
              />
            )}
            {currentStep === 2 && (
              <Step2
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
              />
            )}
            {currentStep === 3 && (
              <Step3
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
              />
            )}
            {currentStep === 4 && (
              <Step4
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
              />
            )}
            {currentStep === 5 && (

              <Step5
                values={values}
                thicknests={thicknests}
                selectedItem={selectedItem}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
                setSelectedOptions={setSelectedOptions}
                selectedOptions={selectedOptions}
              />


            )}


            <div className="sticky bottom-4 left-0 flex justify-between bg-white p-2 rounded-lg shadow-md">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => (prev === 5 ? 2 : prev - 1))}
                    type="button"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div>
                {currentStep < 5 ? (
                  // <Button
                  //   className="shadow-2xl"
                  //   onClick={async () => {
                  //     console.log("👉 Current Step:", currentStep);
                  //     console.log("👉 Selected Values:", values);
                  //     await nextStep(values, setErrors);
                  //     setCurrentStep((prev) => (prev === 2 ? 4 : prev + 1))
                  //   }}
                  //   // onClick={() => {
                  //   //   console.log("👉 Current Step:", currentStep);
                  //   //   console.log("👉 Selected Values:", values);
                  //   //   setCurrentStep((prev) => (prev === 2 ? 4 : prev + 1))
                  //   // }
                  //   // }
                  //   type="button"
                  // >
                  //   Next
                  // </Button>

                  <Button
                    type="button"
                    onClick={async () => {
                      const isValid = await nextStep(values, setErrors); // returns true only if valid
                      if (isValid) {
                        setCurrentStep(prev => (prev === 2 ? 5 : prev + 1)); // skip Step3 if needed
                      }
                    }}
                  >
                    Next
                  </Button>



                ) : (
                  // Step 5 Submit Button
                  <Button
                    className="shadow-2xl"
                    onClick={() => {
                      // console.log("Submitting...");
                      // console.log("Insole Type in parent:", values);
                      handleSubmit();
                      setFormValues(values);
                      setFormSubmitted(true);
                      // 🔹 open confirm dialog instead of submitting directly
                      setShowStep5Confirmation(true);
                    }}
                    type="button" // prevent direct submit
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Formik>

      {/* Confirmation dialog after Step 1 */}
      {/* <ConfirmOrderDialog
        open={showStep1Confirmation}
        onOpenChange={setShowStep5Confirmation}
        formValues={{
          socket_type: formValues.socket_type,
          // insoletype: formValues.insoletype,
          insole_model: formValues.insole_model,
          design_variation: formValues.design_variation,
          model_name: formValues.model_name,
          activity_level: formValues.activity_level,
        }}
        selectedItem={selectedItem}
        isItemFetching={isItemFetching}
        isOrderCreating={isOrderCreating}
        onConfirm={handleStep5Confirmation}
        showContinueButton={true}
      /> */}
      <ConfirmOrderDialog
        open={showStep5Confirmation} // ✅ fixed
        onOpenChange={setShowStep5Confirmation}
        formValues={{
          // socket_type: formValues.socket_type,
          insoletype: formValues.insoletype,
          selectedinsoletype: formValues.selectedinsoletype,
          insole_model: formValues.insole_model,
          // design_variation: formValues.design_variation,
          // model_name: formValues.model_name,
          activity_level: formValues.activity_level,
        }}
        insoleOptions={insoleOptions}
        selectedItem={selectedItem}
        isItemFetching={isItemFetching}
        isOrderCreating={isOrderCreating}
        onConfirm={handleStep5Confirmation} // ✅ wired properly
        showContinueButton={true}
      />
      {/* Final submission dialog (hidden in this case since we're submitting directly) */}
      <ConfirmOrderDialog
        open={modelOpen}
        onOpenChange={setModelOpen}
        formValues={{

          design_variation: formValues.design_variation,
          model_name: formValues.model_name,
          activity_level: formValues.activity_level,
        }}
        selectedItem={selectedItem}
        isItemFetching={isItemFetching}
        isOrderCreating={isOrderCreating}
        onConfirm={handleConfirmOrder}
        showContinueButton={false}
      />
    </div>
  );
}