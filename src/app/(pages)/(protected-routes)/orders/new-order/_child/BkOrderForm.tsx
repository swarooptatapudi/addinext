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
  DialogDescription
} from '@/components/ui/dialog';
// API Hooks
import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
import { useCreateOrderMutation, useGetOrderDetailIdsMutation } from '@/rtk-query/apis/orders';
import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';

// Constants & Utils
import { BK_FORM_TYPE, USER } from '@/uttils/Types';
import { getFormOptionsObject } from '@/uttils/UttilFuncations';
import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
import { BK_FORM_INITIAL_VALUES } from './constants';
import { Step5 } from '@/components/form/bkForm/Step5Finishing';
import { PatientPortalDialog } from '@/components/app/common/ResidualLimbForm';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type Order = {
  order_id: string;
  customer: string;
  clinic_name: string | null;
  patient_name: string;
  device_type: string;
  order_date: string;
  delivery_date: string;
  order_value: number;
  status: string;
  symbol?: string;
};

const step1Validation = Yup.object().shape({
  patient_name: Yup.string()
    .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
    .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
    .required(FORMIK_ERRORS.REQUIRED),
  socket_type: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  design_variation: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  model_name: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  activity_level: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  height: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true
    })
    .test('min-height', 'Minimum height is 91cm', (value) => !value || parseFloat(value) >= 91)
    .test(
      'max-height',
      'Maximum height is 213.00cm',
      (value) => !value || parseFloat(value) <= 213.0
    ),
  // weight: Yup.string()
  //   .required('Weight is required')
  //   .matches(/^\d+(\.\d{1,2})?$/, {
  //     message: 'Must be a number (e.g. 65.5 or 70)',
  //     excludeEmptyString: false,
  //   })
  //   .test('min-weight', 'Minimum weight is 10kg', (value) => parseFloat(value) >= 10)
  //   .test('max-weight', 'Maximum weight is 180kg', (value) => parseFloat(value) <= 180),
  stump_length: Yup.string()
    .required(FORMIK_ERRORS.REQUIRED)
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true
    })
    .test('min-height', 'Minimum height is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-height', 'Maximum height', (value) => !value || parseFloat(value) <= 100.0),
  stump_size: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true
    })
    .test('min-value', 'Minimum value is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-value', 'Maximum value is 100cm', (value) => !value || parseFloat(value) <= 100),
  shoe_size: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true
    })
    .test('min-height', 'Minimum height is 1cm', (value) => !value || parseFloat(value) >= 0)
    .test('max-height', 'Maximum height', (value) => !value || parseFloat(value) <= 100.0),
  flexion_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Flexion angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  add_abd_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Abd/adduct angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  value_c_detailss: Yup.array()
    .of(
      Yup.object().shape({
        value: Yup.string()
          .nullable()
          .notRequired()
          .matches(/^\d+(\.\d{1,2})?$/, 'Must be a number (e.g. 12 or 12.5)')
          .test('min-value', 'Minimum value is 1', (value) => !value || parseFloat(value) >= 1)
          .test('max-value', 'Maximum value is 100', (value) => !value || parseFloat(value) <= 100)
      })
    )
    .notRequired()
  // value_c_details: Yup.array().of(
  //   Yup.object().shape({
  //     value: Yup.string()
  //       .matches(/^\d+(\.\d{1,2})?$/, 'Must be a number (e.g. 12 or 12.5)')
  //       .test(
  //         'is-valid-number',
  //         'Must be a number between 0 and 100',
  //         (value) => {
  //           if (!value || value.trim() === '') return true;
  //           if (!/^-?\d+$/.test(value)) return false;
  //           const num = parseInt(value, 10);
  //           return num >= 1 && num <= 100;
  //         }
  //       )   })
  //     )
});

// const step2Validation = Yup.object().shape({
//   upload_link: Yup.string()
//     .url('Must be a valid URL (e.g., https://drive.google.com/...)')
//     .nullable(),
//   direct_body: Yup.string().required('Scan condition is required'),
//   foot_Amputation: Yup.string().nullable(),
// }).test(
//   'either-scan-or-link',
//   'Either upload scans or provide a photo link is required',
//   function (value) {
//     const { foot_Amputation, upload_link } = value;

//     if (!foot_Amputation && !upload_link) {
//       return this.createError({
//         path: 'upload_link',
//         message: 'Either upload scans or provide a photo link is required'
//       });
//     }

//     return true;
//   }
// );

const step2Validation = Yup.object()
  .shape({
    upload_link: Yup.string()
      .url('Must be a valid URL (e.g., https://drive.google.com/...)')
      .nullable(),
    direct_body: Yup.string().required('Scan condition is required'),
    foot_Amputation: Yup.string().nullable(),
    liner_thickness: Yup.string().nullable(),
    liner_type: Yup.string().nullable(),
    leftFootFile: Yup.mixed().nullable(),
    rightFootFile: Yup.mixed().nullable()
  })
  .test(
    'file-upload-validation',
    'File upload validation',
    function (value) {
      const { foot_Amputation, upload_link, leftFootFile, rightFootFile } = value as {
        foot_Amputation: string | null;
        upload_link: string | null;
        leftFootFile: File | null;
        rightFootFile: File | null;
      };

      console.log('Validation Values:', { foot_Amputation, upload_link, leftFootFile, rightFootFile });

      // If upload_link is provided, validation passes
      if (upload_link && upload_link.trim()) {
        return true;
      }

      // If foot_Amputation is not selected, require upload_link
      if (!foot_Amputation) {
        return this.createError({
          path: 'upload_link',
          message: 'Either upload scans or provide a photo link is required'
        });
      }

      // If foot_Amputation is selected, check for required files
      if (foot_Amputation === 'Left_Foot' && !leftFootFile) {
        return this.createError({
          path: 'leftFootFile',
          message: 'File for Left Foot is required'
        });
      }

      if (foot_Amputation === 'Right_Foot' && !rightFootFile) {
        return this.createError({
          path: 'rightFootFile',
          message: 'File for Right Foot is required'
        });
      }

      // if (foot_Amputation === 'Both') {
      //   if (!leftFootFile && !rightFootFile) {
      //     // Create errors for both files
      //     // this.createError({
      //     //   path: 'leftFootFile',
      //     //   message: 'STL file for Left Foot is required'
      //     // });
      //     return this.createError({
      //       path: 'rightFootFile',
      //       message: 'Both file for Right and Left Foot is required'
      //     });
      //   } else if (!leftFootFile) {
      //     return this.createError({
      //       path: 'leftFootFile',
      //       message: 'File for Left Foot is required'
      //     });
      //   } else if (!rightFootFile) {
      //     return this.createError({
      //       path: 'rightFootFile',
      //       message: 'File for Right Foot is required'
      //     });
      //   }
      // }

      return true;
    }
  )
  .test(
    'validate-liner-fields',
    'Liner fields are required when "With Liner" is selected',
    function (value) {
      const { direct_body, liner_thickness, liner_type } = value as {
        direct_body: string;
        liner_thickness: string | null;
        liner_type: string | null;
      };

      if (direct_body === 'With_Liner') {
        if (!liner_thickness) {
          return this.createError({
            path: 'liner_thickness',
            message: 'Liner thickness is required when "With Liner" is selected'
          });
        }
        if (!liner_type) {
          return this.createError({
            path: 'liner_type',
            message: 'Liner type is required when "With Liner" is selected'
          });
        }
      }

      return true;
    }
  );

const step4Validation = Yup.object().shape({
  global_volume_reduction: Yup.string()
    .nullable()
    .test('is-valid-percentage', 'Must be a percentage between 0% and 5% (e.g. 2%)', (value) => {
      if (!value) return true;

      const regex = /^\d{1,2}%$/;
      if (!regex.test(value)) return false;

      const num = parseInt(value.replace('%', ''));
      return num >= 0 && num <= 5;
    }),
  socket_design_details: Yup.array().of(
    Yup.object().shape({
      cpo_input_mm: Yup.string().test(
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
  locking_system: Yup.string().required(FORMIK_ERRORS.REQUIRED)
});

const step5Validation = Yup.object().shape({
  finishing_type: Yup.string(),
  delivery_date: Yup.string()
});

const initialValues = BK_FORM_INITIAL_VALUES;
const SocketTypeDialog = ({
  open,
  onOpenChange,
  data
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
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
                <p className="text-sm text-gray-600 mt-2">{data.description || ' '}</p>
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
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DesignVariationDialog = ({
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
      'standard (sx)': {
        title: 'Standard (SX)',
        description: 'Sockets with Core functionality and durability',
        image: '/assets/order-forms/bk-order/foot-type/SX.png'
      },
      'adjustable (ax)': {
        title: 'Adjustable (AX)',
        description: 'Sockets with volume control for limb fluctuations',
        image: '/assets/order-forms/bk-order/foot-type/AX.png'
      },
      
    };

    // Try exact match first
    if (contentMap[normalizedVariation]) {
      return contentMap[normalizedVariation];
    }

    // Try partial match (without parentheses)
    const baseVariation = normalizedVariation.split(' (')[0];
    const partialMatch = Object.entries(contentMap).find(([key]) => key.startsWith(baseVariation));

    if (partialMatch) {
      return partialMatch[1];
    }

    // Default fallback
    return {
      title: variation.trim(),
      description: ' ',
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
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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
      addieaseeco: {
        title: 'AddiEaseEco',
        description: 'Standard Sockets printed on AddiPrint',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseEco.png'
      },
      addiease: {
        title: 'AddiEase',
        description: 'Premium Sockets printed on MJF',
        image: '/assets/order-forms/bk-order/foot-type/AddiEase.png'
      },
     
      addieasel: {
        title: 'AddiEaseL',
        description: 'Premium Sockets printed on SLS',
        image: '/assets/order-forms/bk-order/foot-type/AddiEase.png'
      },
       addieasemould: {
        title: 'AddiEaseMould',
        description: 'Standard Moulds printed on AddiPrint',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould.png'
      },
      'addieasemould-hr': {
        title: 'AddiEaseMould-HR',
        description: 'Heat Resistant Sockets printed on AddiPrint',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould-HR.png'
      }
    };

    // Try exact match first
    if (contentMap[normalizedVariation]) {
      return contentMap[normalizedVariation];
    }

    // Try partial match (without parentheses)
    const baseVariation = normalizedVariation.split(' (')[0];
    const partialMatch = Object.entries(contentMap).find(([key]) => key.startsWith(baseVariation));

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
      <DialogContent className="max-w-[800px] w-full overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-primary">Select Design Variation</DialogTitle>
          <DialogDescription>
            Choose your preferred design variation from the options below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 justify-items-center ">

          {options.map((option) => {
            const variationText = option.label || option.value;
            console.log('variationText', variationText);
            const content = getDynamicContent(variationText);

            return (
              <div
                key={option.value}
                className="border rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
              >
                <h4 className="font-sm text-lg">{content.title}</h4>
                <p className="text-[12px] text-gray-700 mt-1">{content.description}</p>
                <div className="mt-2">
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
  setSocketTypeDialog,
  deviceTypeId,
  orderId
}: any) => {
  const [designVariationDialog, setDesignVariationDialog] = useState({
    open: false,
    options: []
  });

  const [modelDialog, setModelDialog] = useState({
    open: false,
    options: []
  });

  const shouldShowError = (fieldName: string, isRequired = false) => {
    const fieldValue = fieldName.includes('.')
      ? fieldName
          .split('.')
          .reduce((obj, key) => obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], values)
      : values[fieldName];

    const fieldError = fieldName.includes('.')
      ? fieldName
          .split('.')
          .reduce((obj, key) => obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], errors)
      : errors[fieldName];

    if (
      fieldName === 'upload_link' &&
      fieldError === 'Either upload scans or provide a photo link is required'
    ) {
      return true;
    }

    if (isRequired) {
      return (
        (!fieldValue && (formSubmitted || touched[fieldName])) || 
        (!!fieldError && (touched[fieldName] || formSubmitted))
      );
    }

    return !!fieldError && (touched[fieldName] || formSubmitted);
  };

  const socketTypeOptions = useMemo(() => {
    return (FORM_OPTIONS?.socket_type || []).map((option: { value: any }) => ({
      ...option
    }));
  }, [FORM_OPTIONS?.socket_type]);

  // Enhanced design variation options
  const designVariationOptions = useMemo(() => {
    if (!values.socket_type) return [];
    const baseOptions = FORM_OPTIONS[values.socket_type + '_design_variation'] || [];

    return baseOptions.map((option: { value: string; label: string }) => ({
      ...option
    }));
  }, [values.socket_type, FORM_OPTIONS]);

  const modelOptions = useMemo(() => {
    if (!values.socket_type || !values.design_variation) return [];
    const baseOptions =
      FORM_OPTIONS[values.socket_type + '_' + values.design_variation + '_' + 'model_name'] || [];

    return baseOptions.map((option: { value: string; label: string }) => ({
      ...option
    }));
  }, [values.socket_type, values.design_variation, FORM_OPTIONS]);

  return (
    <div className="flex flex-col gap-6 px-5">
      {deviceTypeId && orderId ? (
        <>
          <PatientPortalDialog />
        </>
      ) : (
        ''
      )}
      <h3 className="font-semibold text-lg text-primary">Basic Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <Input
          label="Date of Birth"
          type="date"
          name="date_of_birth"
          value={values.date_of_birth|| 'date'}
          onChange={handleChange('date_of_birth')}
          required
          inVaild={shouldShowError('date_of_birth', true)}
          error={errors.date_of_birth}
          disabled
        />
        <Input
          label="Height (cm)"
          placeholder="65"
          onChange={handleChange('height')}
          value={values.height}
          inVaild={shouldShowError('height')}
          error={errors.height}
          disabled
        />
        <Input
          label="Weight (kgs)"
          placeholder="50"
          value={values.weight}
          onChange={handleChange('weight')}
          inVaild={shouldShowError('weight', true)}
          error={errors.weight}
          disabled
        />
        <Input
          label="Mobile Number"
          placeholder="10 digit phone number"
          value={values.mobile_no}
          onChange={handleChange('mobile_no')}
          error={errors.mobile_no}
          disabled
        />
        <Input
          label="Email"
          placeholder="Email"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          disabled
        />
        <SelectBox
          options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' }
          ]}
          label="Gender"
          value={values.gender}
          onValueChange={handleChange('gender')}
          inVaild={shouldShowError('gender', true)}
          required
          error={errors.gender}
          disabled
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          placeholder="Patient Name"
          label="Amputation Date"
          type="date"
          value={values.amputation_date || ''}
          onChange={handleChange('amputation_date')}
        />
        <SelectBox
          options={FORM_OPTIONS?.amputated_leg || []}
          label="Amputation Leg"
          value={values.amputated_leg || ''}
          onValueChange={handleChange('amputated_leg')}
        />
        <SelectBox
          options={FORM_OPTIONS?.reason_for_amputation || []}
          label="Reason of Amputation"
          value={values.reason_for_amputation || ''}
          onValueChange={handleChange('reason_for_amputation')}
        />
        <SelectBox
          options={FORM_OPTIONS?.activity_level || []}
          label="Activity Level"
          value={values.activity_level || ''}
          onValueChange={handleChange('activity_level')}
          required
          inVaild={shouldShowError('activity_level', true)}
          error={errors.activity_level}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
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
                onClick={() =>
                  setDesignVariationDialog({
                    open: true,
                    options: designVariationOptions
                  })
                }
              >
                {values.design_variation
                  ? designVariationOptions.find(
                      (opt: { value: string }) => opt.value === values.design_variation
                    )?.label
                  : 'Select Design Variation'}
              </Button>
              {shouldShowError('design_variation', true) && (
                <p className="text-xs text-red-500 mt-1">{errors.design_variation}</p>
              )}
            </>
          ) : (
            <Input placeholder="Select socket type first" disabled />
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
                onClick={() =>
                  setModelDialog({
                    open: true,
                    options: modelOptions
                  })
                }
              >
                {values.model_name
                  ? modelOptions.find((opt: { value: string }) => opt.value === values.model_name)
                      ?.label
                  : 'Select Model'}
              </Button>
              {shouldShowError('model_name', true) && (
                <p className="text-xs text-red-500 mt-1">{errors.model_name}</p>
              )}
            </>
          ) : (
            <Input
              placeholder={
                !values.socket_type ? 'Select socket type first' : 'Select design variation first'
              }
              disabled
            />
          )}
        </div>
      </div>

      <div className="divider"></div>

      <h3 className="font-semibold text-lg text-primary">Measurements</h3>
      <div className="grid grid-cols-3 gap-4 items-center ml-1">
        <div>
          <Image
            src={'/assets/order-forms/bk-order/stupm.png'}
            alt="measurements"
            width={500}
            height={300}
            className="object-cover"
            loading="lazy"
            priority={false}
            unoptimized={true}
          />
        </div>
        <div className="flex flex-col col-span-2 gap-4 ml-5">
          <div className="grid grid-cols-2 gap-4 ">
            <div className="mb-2">
              <label className="block text-xs font-medium text-black">
                Value <strong>A</strong> Stump Size (cm) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="10"
                value={values.stump_length || ''}
                onChange={handleChange('stump_length')}
                inVaild={shouldShowError('stump_length', false)}
                error={errors.stump_length}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-2">
              <label className="block text-xs font-medium text-black">
                Value <strong>B</strong> Stump Size (cm)
              </label>
              <Input
                placeholder="20"
                value={values.stump_size || ''}
                onChange={handleChange('stump_size')}
                required
                inVaild={shouldShowError('stump_size')}
                error={errors.stump_size}
              />
            </div>
          </div>
          {/* // Update the measurements section in Step1 component */}
          <div className="">
            <p className="text-xs">
              Value <strong>C</strong> - Circumference of Stump at 5 cm gap (cm)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 w-[500px]">
            {values.value_c_details?.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-1 w-full">
                <p className="text-[10px] whitespace-nowrap">{item.gap}</p>
                <div className="flex-1">
                  <Input
                    value={item?.value || ''}
                    name={`value_c_details[${index}].value`}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '' || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
                        const numValue = parseFloat(inputValue);
                        if (
                          inputValue === '' ||
                          (numValue >= 0 &&
                            numValue <= 100 &&
                            (inputValue.match(/\./g) || []).length <= 1)
                        ) {
                          const newValueCDetails = [...values.value_c_details];
                          newValueCDetails[index].value = inputValue;
                          setFieldValue('value_c_details', newValueCDetails);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        const newValueCDetails = [...values.value_c_details];
                        newValueCDetails[index].value = '0';
                        setFieldValue('value_c_details', newValueCDetails);
                      } else if (inputValue.endsWith('.')) {
                        const newValueCDetails = [...values.value_c_details];
                        newValueCDetails[index].value = inputValue.slice(0, -1);
                        setFieldValue('value_c_details', newValueCDetails);
                      } else if (inputValue.startsWith('.')) {
                        const newValueCDetails = [...values.value_c_details];
                        newValueCDetails[index].value = '0' + inputValue;
                        setFieldValue('value_c_details', newValueCDetails);
                      }
                    }}
                    placeholder="cm"
                    inVaild={shouldShowError(`value_c_details.[${index}].value`)}
                    error={errors?.value_c_details?.[index]?.value}
                    step="any"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4 mt-5">
        <div className="col-span-1">
          <SelectBox
            options={FORM_OPTIONS['foot_type'] ?? []}
            label="Foot Type"
            required={false}
            value={values.foot_type || ''}
            onValueChange={handleChange('foot_type')}
            className="w-full"
          />
        </div>

        <div className="col-span-1">
          <Input
            placeholder="0"
            label="Shoe Size (cm)"
            value={values.shoe_size || ''}
            onChange={handleChange('shoe_size')}
            inVaild={shouldShowError('shoe_size')}
            error={errors.shoe_size}
            className="w-full placeholder:text-[12px]"
          />
        </div>

        <div className="col-span-1">
          <Input
            label="Flexion Angle (Deg)"
            placeholder="(Deg)"
            value={values.flexion_angle || ''}
            onChange={handleChange('flexion_angle')}
            inVaild={shouldShowError('flexion_angle')}
            error={errors.flexion_angle}
            className="w-full placeholder:text-[12px]"
          />
        </div>

        <div className="col-span-1">
          <Input
            label="Add/Abd Angle (Deg)"
            placeholder="(Deg)"
            value={values.add_abd_angle || ''}
            onChange={handleChange('add_abd_angle')}
            inVaild={shouldShowError('add_abd_angle')}
            error={errors.add_abd_angle}
            className="w-full placeholder:text-[12px]"
          />
        </div>

        <div className="col-span-1">
          <SelectBox
            options={FORM_OPTIONS['stump_type'] ?? []}
            label="Stump Type"
            value={values.stump_type || ''}
            onValueChange={handleChange('stump_type')}
            className="w-full"
          />
        </div>
      </div>

      <h3 className="font-semibold text-lg text-primary">Stump Condition</h3>
      <div className="grid grid-cols-3 gap-4 items-center ml-1">
        <div>
          <Image
            src={'/assets/order-forms/bk-order/stumpcondtion.png'}
            alt="measurements"
            width={300}
            height={250}
            className="object-cover"
          />
        </div>
        <div className="grid col-span-2">
          <Textarea
            label="Stump Condition (please describe any specific condition of the stump example bony prominence etc.)"
            className="h-[200px] "
            value={values.stump_condition || ''}
            onChange={handleChange('stump_condition')}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Textarea
          label="Previous Prosthetic Experience (Please describe any previous experience of Prosthetics used, Make, Model,
                 Type, Issues with it and expectation from the new Prosthetic socket)"
          className="h-[100px]"
          value={values.previous_prosthetic_experience || ''}
          onChange={handleChange('previous_prosthetic_experience')}
        />
      </div>

      <DesignVariationDialog
        open={designVariationDialog.open}
        onOpenChange={(open) => setDesignVariationDialog((prev) => ({ ...prev, open }))}
        options={designVariationOptions}
        onSelect={(value) => setFieldValue('design_variation', value)}
        socketType={values.socket_type}
      />

      <ModelDialog
        open={modelDialog.open}
        onOpenChange={(open) => setModelDialog((prev) => ({ ...prev, open }))}
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
  setErrors,
  FORM_OPTIONS,
  formSubmitted
}: any) => {
  const shouldShowError = (fieldName: string, isRequired = false) => {
    const fieldValue = fieldName.includes('.')
      ? fieldName
          .split('.')
          .reduce((obj, key) => obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], values)
      : values[fieldName];

    const fieldError = fieldName.includes('.')
      ? fieldName
          .split('.')
          .reduce((obj, key) => obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], errors)
      : errors[fieldName];

    if (fieldName === 'direct_body' && fieldValue && fieldError) {
      return false;
    }

    if (
      fieldName === 'upload_link' &&
      fieldError === 'Either upload scans or provide a photo link is required'
    ) {
      return true;
    }

    if (isRequired) {
      return (
        (!fieldValue && (formSubmitted || touched[fieldName])) ||
        (!!fieldError && (touched[fieldName] || formSubmitted))
      );
    }

    return !!fieldError && (touched[fieldName] || formSubmitted);
  };

  // Enhanced error checking for file fields
  const shouldShowFileError = (fieldName: string) => {
    const fieldError = errors[fieldName];
    
    // Show error if there's an error AND any of these conditions:
    // 1. Form was submitted
    // 2. Field was touched
    // 3. foot_Amputation selection requires this file (auto-trigger validation)
    const shouldShow = !!fieldError && (
      formSubmitted || 
      touched[fieldName] || 
      (values.foot_Amputation && (
        (fieldName === 'leftFootFile' && (values.foot_Amputation === 'Left_Foot' || values.foot_Amputation === 'Both')) ||
        (fieldName === 'rightFootFile' && (values.foot_Amputation === 'Right_Foot' || values.foot_Amputation === 'Both'))
      ))
    );
    
    console.log(`shouldShowFileError for ${fieldName}:`, {
      fieldError,
      formSubmitted,
      touched: touched[fieldName],
      foot_Amputation: values.foot_Amputation,
      shouldShow
    });
    
    return shouldShow;
  };

  const showEitherOrError =
    formSubmitted &&
    !values.foot_Amputation &&
    !values.upload_link &&
    errors.upload_link === 'Either upload scans or provide a photo link is required';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4 items-end">
        <div className="grid grid-cols-1 gap-4 ">
          <h3 className="font-semibold text-lg text-primary ">Scan Condition</h3>
          <SelectBox
            options={[
              { label: 'Direct Body', value: 'Direct_Body ' },
              { label: 'With Liner', value: 'With_Liner' }
            ]}
            label="Scan Type"
            required={true}
            value={values.direct_body || ''}
            onValueChange={(value) => {
              handleChange('direct_body')(value);
              // Clear any existing errors when a value is selected
              if (value && errors.direct_body) {
                setErrors({ ...errors, direct_body: undefined });
              }
              if (value !== 'With_Liner') {
                setFieldValue('liner_thickness', '');
                setFieldValue('liner_type', '');
              }
            }}
            inVaild={!!errors.direct_body && (touched.direct_body || formSubmitted)}
            error={errors.direct_body}
          />
          {values.direct_body === 'With_Liner' && <div style={{ marginBottom: '55px' }}></div>}
        </div>
        <div>
          <div className="grid grid-cols gap-4">
            {values.direct_body === 'With_Liner' && (
              <div className="relative">
                <SelectBox
                  options={FORM_OPTIONS['liner_thickness'] ?? []}
                  label="Liner Thickness"
                  value={values.liner_thickness || ''}
                  onValueChange={(value) => {
                    handleChange('liner_thickness')(value);
                    setFieldValue('liner_type', '');
                    // Clear liner_thickness error when value is selected
                    if (value && errors.liner_thickness) {
                      setErrors({ ...errors, liner_thickness: undefined });
                    }
                  }}
                  required={values.direct_body === 'With_Liner'}
                  inVaild={shouldShowError('liner_thickness', values.direct_body === 'With_Liner')}
                  error={errors.liner_thickness}
                />
                <div style={{ marginBottom: '70px' }}></div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols gap-4">
          {values.direct_body === 'With_Liner' && (
            <>
              <SelectBox
                options={FORM_OPTIONS[values.liner_thickness + '_' + 'variation'] || []}
                label="Liner Type"
                value={values.liner_type || ''}
                onValueChange={(value) => {
                  handleChange('liner_type')(value);
                  // Clear liner_type error when value is selected
                  if (value && errors.liner_type) {
                    setErrors({ ...errors, liner_type: undefined });
                  }
                }}
                required={values.direct_body === 'With_Liner'}
                inVaild={shouldShowError('liner_type', values.direct_body === 'With_Liner')}
                error={errors.liner_type}
              />
              <div style={{ marginBottom: '55px' }}></div>
            </>
          )}
        </div>
      </div>
      
      <h3 className="font-semibold text-lg text-primary">Scans Upload</h3>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-3">
          <div className="grid grid-cols-2">
            <p className="mb-1 text-[14px]  flex items-center">Upload Scan</p>
            <div className="w-[150px] ml-8">
              <SelectBox
                options={[
                  { value: 'Left_Foot', label: 'Left Foot ' },
                  { value: 'Right_Foot', label: 'Right Foot' },
                  { value: 'Both', label: 'Both' }
                ]}
                className={`mt-3 min-w-max ml-0 w-[410px] ${showEitherOrError ? 'border-red-500' : ''}`}
                value={values.foot_Amputation || ''}
                onValueChange={(value) => {
                  handleChange('foot_Amputation')(value);
                  
                  // When foot_Amputation is selected, mark relevant file fields as touched
                  // This will trigger validation display for required files
                  if (value) {
                    // Clear upload_link related errors
                    setErrors({
                      ...errors,
                      upload_link: undefined
                    });
                    setFieldValue('leftFootFile', null);
                    setFieldValue('rightFootFile', null);
                    setFieldValue('upload_link', '');
                    
                    // Mark file fields as touched to trigger validation display
                    setTimeout(() => {
                      if (value === 'Left_Foot' || value === 'Both') {
                        // This will trigger the validation and error display for leftFootFile
                        setFieldValue('leftFootFile', null);
                      }
                      if (value === 'Right_Foot' || value === 'Both') {
                        // This will trigger the validation and error display for rightFootFile
                        setFieldValue('rightFootFile', null);
                      }
                    }, 100);
                  }
                }}
                inVaild={shouldShowError('upload_link')}
                // error={errors.upload_link}
              />
            </div>
          </div>
        </div>
        
        {(values.foot_Amputation === 'Left_Foot' || values.foot_Amputation === 'Both') && (
          <div className="w-fit justify-center">
            <StlFilePicker
              label="Upload STL file (left foot)"
              buttonText="Left Foot"
              onFileSelect={(file) => {
                setFieldValue('leftFootFile', file);
                console.log('Left Foot STL selected:', file?.name);
                
                // Mark field as touched and clear errors when file is selected
                if (file) {
                  setErrors({ 
                    ...errors, 
                    leftFootFile: undefined, 
                    upload_link: undefined 
                  });
                }
              }}
              // @ts-ignore 
              inVaild={shouldShowFileError('leftFootFile')}
               // @ts-ignore 
              error={errors.leftFootFile}
            />
            
            {/* Custom error display for better control */}
            {shouldShowFileError('leftFootFile') && errors.leftFootFile && (
              <div className="text-red-500 text-xs mt-1">
                {errors.leftFootFile}
              </div>
            )}
          </div>
        )}

        {(values.foot_Amputation === 'Right_Foot' || values.foot_Amputation === 'Both') && (
          <div className="w-fit">
            <StlFilePicker
              label="Upload STL file (Right foot)"
              buttonText="Right Foot"
              onFileSelect={(file) => {
                setFieldValue('rightFootFile', file);
                console.log('Right Foot STL selected:', file?.name);
                
                // Mark field as touched and clear errors when file is selected
                if (file) {
                  setErrors({ 
                    ...errors, 
                    rightFootFile: undefined, 
                    upload_link: undefined 
                  });
                }
              }}
               // @ts-ignore 
              inVaild={shouldShowFileError('rightFootFile')}
               // @ts-ignore 
              error={errors.rightFootFile}
            />
            
            {/* Custom error display for better control */}
            {shouldShowFileError('rightFootFile') && errors.rightFootFile && (
              <div className="text-red-500 text-xs mt-1">
                {errors.rightFootFile}
              </div>
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
            allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
            maxSizeMB={5}
            label="Select Image"
            buttonText="File 1"
            onFileSelect={(file) => console.log('File 1 selected:', file?.name)}
          />
        </div>
        <div className="w-fit ml-2">
          <GenericFileViewer
            allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
            maxSizeMB={5}
            label="Select Image"
            buttonText="File 2"
            onFileSelect={(file) => console.log('File 2 selected:', file?.name)}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="col-span-3">
          <p className="mb-1 text-[14px]">Upload Link with Photos</p>
          <p className="mb-1 text-[12px] ">
            (Upload in Google /Cloud drive and give relevant permission)
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="https://drive.google.com/..."
            className={`mt-3 min-w-max ml-0 w-[410px] ${showEitherOrError ? 'border-red-500' : ''}`}
            value={values.upload_link || ''}
            onChange={(value) => {
              handleChange('upload_link')(value);
              // Clear file-related errors if upload_link is provided
              // if (value && (errors.leftFootFile || errors.rightFootFile || errors.upload_link)) {
              //   setErrors({
              //     ...errors,
              //     upload_link: undefined,
              //     leftFootFile: undefined,
              //     rightFootFile: undefined
              //   });
              //   setFieldValue('leftFootFile', null);
              //   setFieldValue('rightFootFile', null);
              //   setFieldValue('foot_Amputation', '');
              // }
            }}
            inVaild={shouldShowError('upload_link')}
            // error={errors.upload_link}
          />
        </div>
      </div>
      {showEitherOrError && (
        <div className="text-red-500 text-[12px] mt-1">
          <span>Either Upload scans or Upload Link with Photos is required</span>
        </div>
      )}
    </div>
  );
};

const Step4 = ({ values, handleChange, errors, touched, formSubmitted }: any) => {
  const shouldShowError = (fieldName: string, isRequired = false) => {
    const fieldValue = fieldName.includes('.')
      ? fieldName
          .split('.')
          .reduce((obj, key) => obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], values)
      : values[fieldName];

    if (!fieldValue) {
      if (!isRequired) return false;
      return formSubmitted || touched[fieldName];
    }
    const fieldError = fieldName.includes('.')
      ? fieldName
          .split('.')
          .reduce((obj, key) => obj && obj[key.replace(/\[(\d+)\]/, (_, i) => `.${i}`)], errors)
      : errors[fieldName];

    return !!fieldError && (touched[fieldName] || formSubmitted);
  };
  return (
    <div>
      {/* <h3 className="font-semibold text-lg">Stump Condition</h3> */}
      <p className="text-xs mt-2">
        Please specify the design considerations for each point from A to N. Use "-" to indicate
        Apply pressure (Reduction) and "+" to indicate Relief at the particular area. All values
        should be in millimetres (mm). For eg for applying reduction of 6 mm at Patela Tendon,
        please specify -6
      </p>
      <div className="flex justify-center p-2 mr-20">
        <Image
          src={'/assets/order-forms/bk-order/SocketDesign-BK.jpg'}
          alt="Design Modications"
          width={520}
          height={400}
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="mb-6">
          <p className="text-xs">
            
            <span className="text-sm"> Global Volume Reduction </span>
            <br /> (please specify the percentage reduction in Volume without reducing the length of
            the socket)
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
      <div className="grid grid-cols-3 gap-10">
        {values.socket_design_details?.map((item: any, index: number) => {
          return (
            <div key={index} className="flex items-start gap-4 w-full">
              <p className="font-semibold">{item?.area}. </p>
              <div className="flex-1">
                <Input
                  placeholder={'Default Value ' + item?.default_mm}
                  label={item?.area_name + ' (mm)'}
                  value={item?.cpo_input_mm || ''}
                  name={`socket_design_details[${index}].cpo_input_mm`}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
                      if (value === '' || value === '-') {
                        handleChange(e);
                        return;
                      }
                      const num = Number(value);
                      if (num >= -20 && num <= 20) {
                        if (!(value.startsWith('-') && num === 0)) {
                          handleChange(e);
                        }
                      }
                    }
                  }}
                  className="placeholder:text-[12px]"
                  inVaild={shouldShowError(`socket_design_details[${index}].cpo_input_mm`)}
                  error={errors?.socket_design_details?.[index]?.cpo_input_mm}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function BkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
  const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
  const [createOrder, { isLoading: isOrderCreating }] = useCreateOrderMutation();
  const [getOrderDetails, { data: orderDetails, isLoading: isOrderDetailsLoading }] =
    useGetOrderDetailIdsMutation();
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  const [selectedItem, setSelectedItem] = React.useState<string>('');
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
  const [formValues, setFormValues] = useState(initialValues);
  const [modelOpen, setModelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();



  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [estimateConform, setEstimateConform] = useState(false);
  const [socketTypeDialog, setSocketTypeDialog] = useState({
    open: false,
    data: null
  });
  const [showStep1Confirmation, setShowStep1Confirmation] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const deviceTypeId = searchParams.get('deviceType');

  // Add these state variables to your component
const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    if (orderId && deviceTypeId) {
      getOrderDetails({
        order_type: deviceTypeId,
        order_id: orderId
      })
        .unwrap()
        .then((response) => {
          const transformedData = {
            ...initialValues,
            ...response.data,

            value_c_details:
              response.data?.value_c_details?.map((item: { gap: any; value: any }) => ({
                gap: item.gap || '',
                value: item.value || ''
              })) || initialValues.value_c_details,

            socket_design_details:
              response.data?.socket_design_details?.map(
                (item: { area: any; area_name: any; default_mm: any; cpo_input_mm: any }) => ({
                  area: item.area || '',
                  area_name: item.area_name || '',
                  default_mm: item.default_mm || '',
                  cpo_input_mm: item.cpo_input_mm || ''
                })
              ) || initialValues.socket_design_details
          };
          // console.log('response:', response);
          setFormValues(transformedData);
          if (response.data.item_code) {
            setSelectedItem(response.data.item_code);
          }
          setIsInitialDataLoaded(true); // Set to true after data is loaded
        })
        .catch((error) => {
          console.error('Failed to load order details:', error);
          setIsInitialDataLoaded(false); // Ensure it’s false on failure
        });
    }
  }, [orderId, deviceTypeId]);

  useEffect(() => {
    if (orderDetails?.data) {
      setFormValues({
        ...initialValues,
        ...orderDetails.data
      });
    }
  }, [orderDetails]);

  // Add this useEffect to load Razorpay script
useEffect(() => {
  const loadRazorpayScript = async () => {
    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => {
        setIsRazorpayLoaded(false);
        toast.error('Failed to load payment gateway. Please refresh the page.');
      };

      document.body.appendChild(script);
    } catch (err) {
      setIsRazorpayLoaded(false);
    }
  };

  loadRazorpayScript();
}, []);


  const FORM_OPTIONS = useMemo(() => {
    if (isFormOptionsLoading) return {};
    if (data) {
      return getFormOptionsObject(data?.order_from_details);
      
    }
    return {};
  
  }, [data, isFormOptionsLoading]);

// Main function for Pay & Place Order
const handlePayAndPlaceOrder = async (values: any) => {
  if (!razorpayKey || !isRazorpayLoaded) {
    toast.error('Payment gateway is not available. Please try again.');
    return;
  }

  setIsPaymentProcessing(true);
  setFormValues(values);

  try {
    // Prepare the order data (same as "Order Now, Pay Later")
    const payload = {
      item_type: 'BK',
      socket_type: values.socket_type,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight
    };

    const itemCode = await getItemCodeByValues(payload);
    setSelectedItem(itemCode);

    // Create order payload
    const orderPayload = {
      item_type: 'BK',
      customer: user?.customer_id,
      order_details: values,
      item_code: itemCode,
      addicoins: values.Design_by === "Self" ? 10 : 0
    };

    // You'll need to create an API endpoint that calculates order amount
    // This should return the order amount for payment
    // const orderAmountResponse = await getOrderAmount(orderPayload).unwrap();
    
    // if (orderAmountResponse?.status !== "success") {
    //   throw new Error(orderAmountResponse?.message || "Failed to calculate order amount");
    // }

    // const orderAmount = orderAmountResponse.data.order_amount;
    const amountInPaise = 10000;

    // Configure Razorpay options
    const options = {
      key: razorpayKey,
      amount: amountInPaise.toString(),
      currency: 'INR',
      name: 'Addiwise Company',
      description: `Payment for BK Order`,
      handler: async function (response: any) {
        console.log('Payment Success:', response);
        
        try {
          // After successful payment, create the order with payment details
          const finalOrderPayload = {
            ...orderPayload,
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            payment_status: 'paid'
          };

          const orderResponse = await createOrder(finalOrderPayload).unwrap();
          // @ts-ignore 
          if (orderResponse?.message?.status === "success") {
            toast.success("Payment successful! Order created successfully.");
            setSelectedItem('');
            setFormValues(initialValues);
            setIsPaymentProcessing(false);
            router.push("/orders");
          } else {
            // @ts-ignore 
            throw new Error(orderResponse?.message?.message || "Order creation failed");
          }
          
        } catch (orderError) {
          console.error("Order creation error:", orderError);
          toast.error("Payment successful but order creation failed. Please contact support with payment ID: " + response.razorpay_payment_id);
          setIsPaymentProcessing(false);
        }
      },
      // prefill: {
      //   name: user?.name || '',
      //   email: user?.email || '',
      //   contact: user?.mobile || '',
      // },
      // notes: {
      //   item_type: 'BK',
      //   customer_id: user?.customer_id,
      // },
      theme: { color: '#3399cc' },
      modal: {
        ondismiss: function() {
          setIsPaymentProcessing(false);
          toast.info("Payment cancelled");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response);
      setIsPaymentProcessing(false);
      toast.error(`Payment failed: ${response.error.description}`);
    });

    rzp.open();

  } catch (error) {
    console.error("Payment preparation error:", error);
    setIsPaymentProcessing(false);
    toast.error("Failed to prepare payment. Please try again.");
  }
};

  const handleConfirmOrder = () => {
    const payload: any = {};
    payload.item_type = 'BK';
    payload.customer = user?.customer_id;
    payload.order_details = formValues;
    payload.item_code = selectedItem;
    createOrder(payload);
  };

  const OnSubmit = async (values: any) => {
    setFormValues(values);
    
    const payload = {
      item_type: 'BK',
      socket_type: values.socket_type,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight
    };  
    const itemCode = await getItemCodeByValues(payload);
   
    setSelectedItem(itemCode);

    // Submit the final form
    const orderPayload = {
      item_type: 'BK',
      customer: user?.customer_id,
      order_details: values,
      item_code: itemCode,
      // @ts-ignore
      addicoins: values.Design_by === "Self" ? 10 : 0
    };

    console.log("Create Order orderPayload:'", orderPayload)

    try {
    const res = await createOrder(orderPayload).unwrap();
      // @ts-ignore
    if (res?.message?.status === "success") {
      toast.success("Order created successfully");
      setSelectedItem('');
      setFormValues(initialValues);
      router.push("/orders");
    } else {
      // @ts-ignore
      toast.error(` ${res?.message?.message || "Order creation failed"}`);
    }
  } catch (err) {
    console.error("Mutation error:", err);
    toast.error("Server error. Please try again.");
  }
  };

  const getItemCodeByValues = async (payload: any) => {
    const res: any = await getItem(payload);
  //    const itemCode = res?.data?.item_code;





  //   if (itemCode) {
  //   console.log(" Generated item code:", itemCode);
  // } else {
  //   console.warn(" Item code not found for given payload.");
  // }
    
    return res?.data?.item_code;
  };

//  useEffect(() => {
//   if (isSuccess && data) {
//     if (data.message?.status === 'success') {
//       toast.success(data.message.message || 'Order created successfully');
//       setSelectedItem('');
//       setFormValues(initialValues);
//       router.push('/orders');
//     } else {
//       const errorMessage = data.message?.message || 'Order creation failed due to an unknown error';
//       toast.error(errorMessage);
//     }
//   } else if (error) {
//     // @ts-ignore
//     const errorMessage = error?.message || 'Failed to connect to the server';
//     toast.error(errorMessage);
//   }
// }, [isOrderCreating, isSuccess, data, error]);

  const validateCurrentStep = async (values: any) => {
    try {
      if (currentStep === 1 && orderId) {
        // For prefilled orders, check only critical fields
        const minimalValidation = Yup.object().shape({
          patient_name: Yup.string().required(FORMIK_ERRORS.REQUIRED),
          socket_type: Yup.string().required(FORMIK_ERRORS.REQUIRED),
          design_variation: Yup.string().required(FORMIK_ERRORS.REQUIRED),
          model_name: Yup.string().required(FORMIK_ERRORS.REQUIRED),
          activity_level: Yup.string().required(FORMIK_ERRORS.REQUIRED)
        });
        await minimalValidation.validate(values, { abortEarly: false });
        return {};
      } else if (currentStep === 1) {
        await step1Validation.validate(values, { abortEarly: false });
      } else if (currentStep === 2) {
        await step2Validation.validate(values, { abortEarly: false });
      } else if (currentStep === 3) {
        await step3Validation.validate(values, { abortEarly: false });
      } else if (currentStep === 4) {
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
            [error.path || '']: error.message
          };
        }, {});
      }
      return {};
    }
  };

  const nextStep = async (values: any, setErrors: any) => {
    setFormSubmitted(true);
    const errors = await validateCurrentStep(values);
    if (Object.keys(errors).length === 0) {
      if (currentStep === 1) {
        // Show confirmation dialog after Step 1
        setFormValues(values);
        const itemPayload = {
          item_type: 'BK',
          socket_type: values.socket_type,
          design_variation: values.design_variation,
          activity_level: values.activity_level,
          model_name: values.model_name,
          stump_length: values.stump_length,
          weight: values.weight

        };
        console.log('Item Payload:', itemPayload);
        const itemCode = await getItemCodeByValues(itemPayload);
        setSelectedItem(itemCode);
        setShowStep1Confirmation(true);
      } else {
        setCompletedSteps([...completedSteps, currentStep]);
        setCurrentStep(currentStep + 1);
        setFormSubmitted(false);
      }
    } else {
      setErrors(errors);
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
  useEffect(() => {}, [formValues]);

  useEffect(() => {
  }, [formValues, isInitialDataLoaded]);

  if (orderId && !orderDetails?.data) {
    return <div className="flex justify-center p-8">Loading order data...</div>;
  }

  return (
    <div className="pb-16 relative">
      <Formik
        initialValues={formValues}
        onSubmit={OnSubmit}
        validationSchema={
          currentStep === 1
            ? step1Validation
            : currentStep === 2
              ? step2Validation
              : currentStep === 3
                ? step3Validation
                : currentStep === 4
                  ? step4Validation
                  : currentStep === 5
                    ? step5Validation
                    : null
        }
        validateOnChange={true}
        validateOnBlur={true}
        // enableReinitialize
        enableReinitialize={true}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          errors,
          touched,
          setFieldValue,
          setErrors,
          isValid
        }) => (
          <div className="flex flex-col gap-6">
            
            <WatchFieldReset />
            {/* Socket Type Dialog */}
            <SocketTypeDialog
              open={socketTypeDialog.open}
              onOpenChange={(open) => setSocketTypeDialog((prev) => ({ ...prev, open }))}
              data={socketTypeDialog.data}
            />
            {/* Step indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {[
                  { step: 1, name: 'Basic Details & Measurements', icon: '📋' },
                  { step: 2, name: 'Scan', icon: '📁' },
                  { step: 3, name: 'Locking Mechanism', icon: '🔒' },
                  { step: 4, name: 'Modifications', icon: '✏️' },
                  { step: 5, name: 'Finishing', icon: '🎨' }
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
                        className={`h-7 flex items-center justify-center text-sm transition-all duration-300 ease-in-out rounded-full ${
                          currentStep === step
                            ? 'bg-primary/88 text-white text-gray-900 scale-105 text-sm ring-0 bg-gray-200 px-4'
                            : completedSteps.includes(step)
                              ? 'bg-gray-300 text-gray-800 border border-gray-200 hover:bg-gray-400 px-4'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 px-4'
                        } ${step > currentStep && !completedSteps.includes(step) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span className="flex items-center gap-2">
                          {currentStep === step && <></>}
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
                            className={`transition-all duration-500 ${
                              completedSteps.includes(step) ? 'stroke-primary' : 'stroke-gray-300'
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
                deviceTypeId={deviceTypeId}
                orderId={orderId}
              />
            )}
            {currentStep === 2 && (
              <Step2
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                setErrors={setErrors} // Add this line
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
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
                selectedItem={selectedItem}
                currentStep={currentStep}
                isActiveStep={currentStep === 5}
                setEstimateConform={setEstimateConform}
                orderId={orderId}
                deviceTypeId={deviceTypeId}
                user={user}
              />
            )}

            {/* Navigation buttons */}
            <div className="sticky bottom-4 left-0 flex justify-between bg-white p-2 rounded-lg shadow-md">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep} type="button">
                    Back
                  </Button>
                )}
              </div>
              <div>
                {currentStep < 5 ? (
                  <Button
                    className="shadow-2xl"
                    onClick={async () => {
                      await nextStep(values, setErrors);
                    }}
                    type="button"
                    disabled={
                      isOrderCreating ||
                      (orderId && !isInitialDataLoaded) ||
                      (formSubmitted && Object.keys(errors).length > 0)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <div className='flex gap-2.5'>
                    <Button
                    className="shadow-2xl"
                    onClick={() => handlePayAndPlaceOrder(formValues)}
                    disabled={!estimateConform || isOrderCreating || isPaymentProcessing || !isRazorpayLoaded}
                  >
                    {isPaymentProcessing ? 'Processing Payment...' : 'Pay & Place Order'}
                  </Button>
                  <Button
                    className="shadow-2xl"
                    onClick={() => handleSubmit()}
                    type="submit"
                    disabled={!estimateConform || isOrderCreating || isPaymentProcessing}
                  >
                    Order Now, Pay Later
                  </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Formik>
      {/* Confirmation dialog after Step 1 */}
      <ConfirmOrderDialog
        open={showStep1Confirmation}
        onOpenChange={setShowStep1Confirmation}
        formValues={{
          socket_type: formValues.socket_type,
          design_variation: formValues.design_variation,
          model_name: formValues.model_name,
          activity_level: formValues.activity_level
        }}
        selectedItem={selectedItem}
        isItemFetching={isItemFetching}
        isOrderCreating={isOrderCreating}
        onConfirm={handleStep1Confirmation}
        showContinueButton={true}
      />
      {/* Final submission dialog (hidden in this case since we're submitting directly) */}
      <ConfirmOrderDialog
        open={modelOpen}
        onOpenChange={setModelOpen}
        formValues={{
          socket_type: formValues.socket_type,
          design_variation: formValues.design_variation,
          model_name: formValues.model_name,
          activity_level: formValues.activity_level
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
