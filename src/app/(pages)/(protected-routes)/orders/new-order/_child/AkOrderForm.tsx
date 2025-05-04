// AkOrderForm
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
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
import { useCreateOrderMutation } from '@/rtk-query/apis/orders';
import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';

// Constants & Utils
import { BK_FORM_TYPE, USER } from '@/uttils/Types';
import { getFormOptionsObject } from '@/uttils/UttilFuncations';
import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
import { AKB_FORM_INITIAL_VALUES } from './constants';
import { Step5 } from '@/components/form/bkForm/Step5Finishing';
import CustomTable from '@/components/app/common/CustomTable';

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
  stump_length: Yup.string()
    .required(FORMIK_ERRORS.REQUIRED)
    .matches(/^\d+$/, 'Must contain only numbers')
    .test('min-value', 'stupm length must be at least 1', (value) => Number(value) >= 1),
    shoe_size: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true,
    })
    .test('min-height', 'Minimum height is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-height', 'Maximum height', (value) => !value || parseFloat(value) <= 200.0),
    mpt_distance: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true,
    })
    .test('min-height', 'Minimum height is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-height', 'Maximum height', (value) => !value || parseFloat(value) <= 150.0),
    floor_distance: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true,
    })
    .test('min-floor', 'Minimum floor distance is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-floor', 'Maximum floor distance is 150cm', (value) => !value || parseFloat(value) <= 150.0),
    
  waist_circumference: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true,
    })
    .test('min-waist', 'Minimum waist circumference is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-waist', 'Maximum waist circumference is 150cm', (value) => !value || parseFloat(value) <= 150.0),
    
  Foot_length: Yup.string()
    .matches(/^\d+(\.\d{1,2})?$/, {
      message: 'Must be a number (e.g. 92.57 or 95)',
      excludeEmptyString: true,
    })
    .test('min-foot', 'Minimum foot length is 1cm', (value) => !value || parseFloat(value) >= 1)
    .test('max-foot', 'Maximum foot length is 150cm', (value) => !value || parseFloat(value) <= 150.0),
  flexion_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Flexion angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  abductionadduction_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Abd/adduct angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  date_of_birth: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  ak_socket_measurements: Yup.array().of(
    Yup.object().shape({
      measurement_cm: Yup.string()
        .nullable()
        .transform(value => value === '' ? null : value)
        .matches(/^\d+(\.\d{1,2})?$/, 'Must be a number (e.g. 10.5 or 12)')
        .test(
          'min-measurement',
          'Minimum measurement is 0cm',
          (value) => !value || parseFloat(value) >= 0
        )
        .test(
          'max-measurement',
          'Maximum measurement is 150cm',
          (value) => !value || parseFloat(value) <= 150
        ),
      desired_reduction_: Yup.string()
        .nullable()
        .transform(value => value === '' ? null : value)
        .test(
          'is-valid-percentage',
          'Must be a number between -10% and 10% (e.g., 5%, -1%, 7.5%)',
          (value) => {
            if (!value) return true; // Skip validation if empty
            if (!/^-?\d+(\.\d+)?%$/.test(value)) return false;
            const numericValue = parseFloat(value.replace('%', ''));
            return numericValue >= -10 && numericValue <= 10;
          }
        ),
    })
  ),
});

const step2Validation = Yup.object().shape({
  images_link: Yup.string()
    .url('Must be a valid URL (e.g., https://drive.google.com/...)')
    .nullable(),
  direct_body: Yup.string().required('Scan condition is required'),
});
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
          )   })
        ),
        table_zbib: Yup.array().of(
          Yup.object().shape({
            pressure_mm: Yup.string()
              .nullable()
              .test(
                'is-valid-number',
                'Must be a number between 0 and 10',
                (value) => {
                  if (!value || value.trim() === '') return true; // Allow empty
                  if (!/^\d+$/.test(value)) return false; // Only positive numbers
                  const num = parseInt(value, 10);
                  return num >= 0 && num <= 10;
                }
              )
          })
        ),
});

const step3Validation = Yup.object().shape({
  locking_mechanism: Yup.string(),
});

const step5Validation = Yup.object().shape({
  finishing_type: Yup.string(),
  delivery_date: Yup.string(),
});

const initialValues = AKB_FORM_INITIAL_VALUES;
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
                  {data.description || ' '}
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
    const partialMatch = Object.entries(contentMap).find(([key]) => 
      key.startsWith(baseVariation)
    );

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
          <DialogTitle>Select Design Variation</DialogTitle>
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
        description: 'Standard Sockets printed on AddiPrint',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseEco.png'
      },
      'addiease': {
        title: 'AddiEase',
        description: 'Premium Sockets printed on MJF',
        image: '/assets/order-forms/bk-order/foot-type/AddiEase.png'

      },
      'addieasemould': {
        title: 'AddiEaseMould',
        description: 'Standard Moulds printed on AddiPrint',
        image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould.png'
      },
      'addieasemould-hr': {
        title: 'AddiEaseMould-HR',
        description: 'Heat Resistant Sockets printed on AddiPrint',
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
      description: ' ',
      image: '/assets/order-forms/bk-order/foot-type/AddiEaseMould-HR.png'
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Design Variation</DialogTitle>
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
  
  const [designVariationDialog, setDesignVariationDialog] = useState({
    open: false,
    options: []
  });
  
  const [modelDialog, setModelDialog] = useState({
    open: false,
    options: []
  });

  const shouldShowError = (fieldName: string, isRequired = false) => {
    const fieldValue = fieldName.includes('[') 
    ? fieldName.split(/[\[\].]+/).reduce((obj, key) => 
        obj && obj[key], values)
    : values[fieldName];

  if (!fieldValue) {
    if (!isRequired) return false;
    return formSubmitted || touched[fieldName];
  }
  const fieldError = fieldName.includes('[')
  ? fieldName.split(/[\[\].]+/).reduce((obj, key) => 
      obj && obj[key], errors)
  : errors[fieldName];
  
return !!fieldError && (touched[fieldName] || formSubmitted);
};

  const socketTypeOptions = useMemo(() => {
    return (FORM_OPTIONS?.socket_type || []).map((option: { value: any }) => ({
      ...option,
    }));
  }, [FORM_OPTIONS?.socket_type]);
  
  // Enhanced design variation options
  const designVariationOptions = useMemo(() => {
    if (!values.socket_type) return [];
    const baseOptions = FORM_OPTIONS[values.socket_type + '_design_variation'] || [];
    
    return baseOptions.map((option: { value: string; label: string }) => ({
      ...option,
    }));
  }, [values.socket_type, FORM_OPTIONS]);

  const modelOptions = useMemo(() => {
    if (!values.socket_type || !values.design_variation) return [];
    const baseOptions  = FORM_OPTIONS[values.socket_type + '_' + values.design_variation +'_'+'model_name'] || [];
    
    return baseOptions.map((option: { value: string; label: string }) => ({
      ...option,
    }));
  }, [values.socket_type, values.design_variation, FORM_OPTIONS]);
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-lg">Basic Details</h3>
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
        <Input
          placeholder="Patient Name"
          label="Amputation Date"
          type="date"
          value={values.amputation_date}
          onChange={handleChange('amputation_date')}
        />
        <SelectBox
          options={FORM_OPTIONS?.amputated_leg || []}
          label="Amputation Leg"
          value={values.amputated_leg}
          onValueChange={handleChange('amputated_leg')}
        />
        <SelectBox
          options={FORM_OPTIONS?.reason_for_amputation || []}
          label="Reason of Amputation"
          value={values.reason_for_amputation}
          onValueChange={handleChange('reason_for_amputation')}
        />
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

      <div className="divider"></div>
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
      </div>

      <div className="divider"></div>

      <h3 className="font-semibold text-lg ">Measurements</h3>
      <div className="grid grid-cols-3 gap-4 items-center ml-1">
        <div>
           <Image
                            src="/assets/order-forms/ak-order/AK1.png"
                            alt="measurements"
                            width={400}
                            height={400}
            className="object-cover"
            loading="lazy"
            priority={false}
            unoptimized={true}
                          />
        </div>
        <div className='ml-8'  style={{ width: '651px' }}>
                          <div>
                            <b className='pag-4'>A - Circumference of Stump at 5 cm level</b>
                            </div>
                          <CustomTable
  columns={[
    // { header: 'S.No.', accessorKey: 's_no' },
    { header: 'Circumference (cm)', accessorKey: 'circumference_at_cm' },
    { header: 'Measurement (cm)', accessorKey: 'measurement_cm' }, 
    { header: 'Standard Reduction (%)', accessorKey: 'standard_reduction_' },
    { header: 'Desired Reduction (%)', accessorKey: 'desired_reduction_' }
  ]}
  data={values?.ak_socket_measurements?.map((item: { circumference_at_cm: any; measurement_cm: any; standard_reduction_: any; desired_reduction_: any; }, index: number) => ({
    id: index,
    // s_no: index + 1,
    circumference_at_cm: item?.circumference_at_cm,
    measurement_cm: (
      <Input
        name={`ak_socket_measurements[${index}].measurement_cm`}
        value={item?.measurement_cm || ''}
        onChange={handleChange}
        style={{ height: '35px', width: '190px' }}
        type="text"
        placeholder='(cm)'
        className="w-full placeholder:text-[12px]"
        inVaild={shouldShowError(`ak_socket_measurements[${index}].measurement_cm`)}
        error={errors?.ak_socket_measurements?.[index]?.measurement_cm }
      />
    ),
    standard_reduction_: item?.standard_reduction_,
    desired_reduction_: (
      <Input
        name={`ak_socket_measurements[${index}].desired_reduction_`}
        value={item?.desired_reduction_ || ''}
        onChange={handleChange}
        style={{ height: '35px', width: '190px' }}
        placeholder='(%)'
        className="w-full placeholder:text-[12px]"
        inVaild={shouldShowError(`ak_socket_measurements[${index}].desired_reduction_`)}
        error={errors?.ak_socket_measurements?.[index]?.desired_reduction_ }
      />
    )
  }))}
/>
                        </div>
      </div>
                        <div className="grid grid-cols-5 gap-4 h-fit">
                    <Input
                      label="- Stump Length (cm)"
                      boldKey="B"
                      value={values?.stump_length}
                      onChange={handleChange('stump_length')}
                      required
                      inVaild={shouldShowError('stump_length', true)}
                      error={errors.stump_length}
                    />
                    <Input
                      label="- IT to MPT distance (cm)" 
                      boldKey="C"
                      value={values?.mpt_distance}
                      onChange={handleChange('mpt_distance')}
                      inVaild={shouldShowError('mpt_distance', false)}
                      error={errors.mpt_distance}
                    />
                    <Input
                      label="- MPT to floor distance (cm)" 
                      boldKey="D"
                      value={values?.floor_distance}
                      onChange={handleChange('floor_distance')}
                      inVaild={shouldShowError('floor_distance', false)}
                      error={errors.floor_distance}
                    />
                    <Input
                      label="- Waist Circumference (cm)" 
                      boldKey="E" 
                      value={values?.waist_circumference}
                      onChange={handleChange('waist_circumference')}
                      inVaild={shouldShowError('waist_circumference', false)}
                      error={errors.waist_circumference}
                    />
                    <Input
                      label="- Foot Length (cm)" 
                      boldKey="F"  
                      value={values?.Foot_length}
                      onChange={handleChange('Foot_length')}
                      inVaild={shouldShowError('Foot_length', false)}
                      error={errors.Foot_length}
                    />
                  </div>
      <div className="grid grid-cols-5 gap-4 mt-5">
        <div className="col-span-1">
          <SelectBox
            options={FORM_OPTIONS['foot_type'] ?? []}
            label="Foot Type"
            required={false}
            value={values.foot_type}
            onValueChange={handleChange('foot_type')}
            className="w-full"
          />
        </div>

        <div className="col-span-1">
          <Input
            placeholder="0"
            label="Shoe Size (cm)"
            value={values.shoe_size}
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
            value={values.flexion_angle}
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
            value={values.abductionadduction_angle}
            onChange={handleChange('abductionadduction_angle')}
            inVaild={shouldShowError('abductionadduction_angle')}
            error={errors.abductionadduction_angle}
            className="w-full placeholder:text-[12px]"
          />
        </div>

        <div className="col-span-1">
          <SelectBox
            options={FORM_OPTIONS['stump_type'] ?? []}
            label="Stump Type"
            value={values.stump_type}
            onValueChange={handleChange('stump_type')}
            className="w-full"
          />
        </div>
      </div>

      <h3 className="font-semibold text-lg">Stump Condition</h3>
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
            value={values.stump_condition}
            onChange={handleChange('stump_condition')}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Textarea
          label="Previous Prosthetic Experience (Please describe any previous experience of Prosthetics used, Make, Model,
                 Type, Issues with it and expectation from the new Prosthetic socket)"
          className="h-[100px] "
          value={values.previous_prosthetic_experience}
          onChange={handleChange('previous_prosthetic_experience')}
        />
      </div>

      <DesignVariationDialog
        open={designVariationDialog.open}
        onOpenChange={(open) => setDesignVariationDialog(prev => ({...prev, open}))}
        options={designVariationOptions}
        onSelect={(value) => setFieldValue('design_variation', value)}
        socketType={values.socket_type}
      />

      <ModelDialog
        open={modelDialog.open}
        onOpenChange={(open) => setModelDialog(prev => ({...prev, open}))}
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
          <h3 className="font-semibold text-lg ">Scan Condition</h3>
          <SelectBox
            options={[
              { label: 'Direct Body', value: 'Direct_Body ' },
              { label: 'With Liner', value: 'With_Liner' },
            ]}
            label="Direct Body"
            required={true}
            value={values.direct_body}
            onValueChange={handleChange('direct_body')}
            inVaild={shouldShowError('direct_body', true)}
            error={errors.direct_body}
          />
          {values.direct_body === 'With_Liner' && (
            <div style={{ marginBottom: '55px' }}></div>
          )}
        </div>
        <div>
          <div className="grid grid-cols gap-4">
            {values.direct_body === 'With_Liner' && (
              <>
                <SelectBox
                  options={FORM_OPTIONS['liner_thickness'] ?? []}
                  label="Liner Thickness"
                  value={values.liner_thickness}
                  onValueChange={handleChange('liner_thickness')}
                />
                <div style={{ marginBottom: '55px' }}></div>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols gap-4">
          {values.direct_body === 'With_Liner' && (
            <>
              <SelectBox
                options={FORM_OPTIONS[values.liner_thickness + '_' + 'variation'] || []}
                label="Liner Type"
                value={values.liner_type}
                onValueChange={handleChange('liner_type')}
              />
              <div style={{ marginBottom: '55px' }}></div>
            </>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg">Scans Upload</h3>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-3">
          <div className="grid grid-cols-2">
            <p className="mb-1 text-[14px]  flex items-center">Upload Scan</p>
            <div className="w-[150px] ml-8">
              <SelectBox
                options={[
                  { value: 'Left_Foot', label: 'Left Foot ' },
                  { value: 'Right_Foot', label: 'Right Foot' },
                  { value: 'Both', label: 'Both' },
                ]}
                value={values.foot_Amputation}
                onValueChange={handleChange('foot_Amputation')}
              />
            </div>
          </div>
        </div>
        {(values.foot_Amputation === 'Left_Foot' || values.foot_Amputation === 'Both') && (
          <div className="w-fit justify-center">
            <StlFilePicker
              label="Upload STL file (left foot)"
              buttonText="Left Foot"
              onFileSelect={(file) => console.log('Model A selected:', file?.name)}
            />
          </div>
        )}

        {(values.foot_Amputation === 'Right_Foot' || values.foot_Amputation === 'Both') && (
          <div className="w-fit ml-2">
            <StlFilePicker
              label="Upload STL file (Rgiht foot)"
              buttonText="Right Foot"
              onFileSelect={(file) => console.log('Model A selected:', file?.name)}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-3">
          <p className="mb-0 text-[14px] ">Upload Addtional Files</p>
          <span className="mb-1 text-[12px] ">(Design / Rough calculations etc.)</span>
        </div>

        <div className="w-fit">
          <GenericFileViewer
            allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
            maxSizeMB={5}
            label="Select Image"
            buttonText="File 1"
            onFileSelect={(file) => console.log('Model A selected:', file?.name)}
          />
        </div>
        <div className="w-fit ml-2">
          <GenericFileViewer
            allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
            maxSizeMB={5}
            label="Select Image"
            buttonText="File 2"
            onFileSelect={(file) => console.log('Model A selected:', file?.name)}
          />
        </div>
      </div>
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
            value={values.images_link}
            onChange={handleChange('images_link')}
            inVaild={shouldShowError('images_link')}
            error={errors.images_link}
          />
        </div>
      </div>
    </div>
  );
};

const Step4 = ({ values, handleChange, errors, touched, formSubmitted }: any) => {
  const shouldShowError = (fieldName: string, isRequired = false) => {
    const fieldValue = fieldName.includes('[') 
    ? fieldName.split(/[\[\].]+/).reduce((obj, key) => 
        obj && obj[key], values)
    : values[fieldName];

  if (!fieldValue) {
    if (!isRequired) return false;
    return formSubmitted || touched[fieldName];
  }
  const fieldError = fieldName.includes('[')
  ? fieldName.split(/[\[\].]+/).reduce((obj, key) => 
      obj && obj[key], errors)
  : errors[fieldName];
  
return !!fieldError && (touched[fieldName] || formSubmitted);
};
  return (
    <div>
      <p className="text-xs mt-2">
      Please mark the below points on the stump along with the Trimline before the Scan. Please also mention extra pressure /
      relief (in mm) at below points. (- for pressure and + for relief)
      </p>
      <div className="grid grid-cols-3 gap-4 mt-4">
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
                    <div className='mt-30'>

        <Image
          src={'/assets/order-forms/ak-order/AK2.png'}
          alt="Design Modications"
          width={520}
          height={400}
          className="object-cover"
          />
          </div>
          <div>
             <div className='mt-10 ml-10'>

             <CustomTable
            
  columns={[
    { header: 'S NO.', accessorKey: 's_no' },
    { header: 'Point', accessorKey: 'point_name' },
    { header: 'Pressure (mm)', accessorKey: 'pressure_mm' }
  ]}
  data={values?.table_zbib?.map((item: any, index: number) => ({
    id: index,
    s_no: index + 1,
    point_name: item?.point_name,
    pressure_mm: (
      <Input
        name={`table_zbib[${index}].pressure_mm`}
        value={item?.pressure_mm || ''}
        onChange={handleChange}
        style={{ height: '35px', width: '200px' }}
        type="text"
        placeholder='(cm)'
        className="w-full placeholder:text-[12px]"
        inVaild={shouldShowError(`table_zbib[${index}].pressure_mm`)}
        error={errors?.table_zbib?.[index]?.pressure_mm || ''}
      />
    ),
  }))}
/>
                            </div>
          </div>
      </div>
    </div>
  );
};

export default function AkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
  const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
  const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  const [selectedItem, setSelectedItem] = React.useState<string>('');
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
  const [formValues, setFormValues] = useState<BK_FORM_TYPE>(initialValues);
  const [modelOpen, setModelOpen] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [socketTypeDialog, setSocketTypeDialog] = useState({
    open: false,
    data: null
  });
  const [showStep1Confirmation, setShowStep1Confirmation] = useState(false);
  const FORM_OPTIONS = useMemo(() => {
    if (isFormOptionsLoading) return {};
    if (data) {
      return getFormOptionsObject(data?.order_from_details);
    }
    return {};
  }, [data, isFormOptionsLoading]);

  const handleConfirmOrder = () => {
    const payload: any = {};
    payload.item_type = 'AK';
    payload.customer = user?.customer_id;
    payload.order_details = formValues;
    payload.item_code = selectedItem;

    createOrder(payload);
  };

  const OnSubmit = async (values: BK_FORM_TYPE) => {
    setFormValues(values);
    const payload = {
      item_type: 'AK',
      socket_type: values.socket_type,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight,
    };
    const itemCode = await getItemCodeByValues(payload);
    setSelectedItem(itemCode);
    
    // Submit the final form
    const orderPayload = {
      item_type: 'AK',
      customer: user?.customer_id,
      order_details: values,
      item_code: itemCode,
    };
    createOrder(orderPayload);
  };

  const getItemCodeByValues = async (payload: any) => {
    const res: any = await getItem(payload);
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
            [error.path || '']: error.message,
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
          item_type: 'AK',
          socket_type: values.socket_type,
          design_variation: values.design_variation,
          activity_level: values.activity_level,
          model_name: values.model_name,
          stump_length: values.stump_length,
          weight: values.weight,
        };
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

  return (
    <div className="pb-16 relative">
      <Formik 
        initialValues={initialValues} 
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
              onOpenChange={(open) => setSocketTypeDialog(prev => ({...prev, open}))}
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
                 ].map(({step, name, icon}) => (
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
                            className={`transition-all duration-500 ${
                              completedSteps.includes(step) 
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
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
              />
            )}

            {/* Navigation buttons */}
            <div className="sticky bottom-4 left-0 flex justify-between bg-white p-2 rounded-lg shadow-md">
              <div>
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    type="button"
                  >
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
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    className="shadow-2xl" 
                    onClick={() => handleSubmit()}
                    type="submit"
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
      <ConfirmOrderDialog 
        open={showStep1Confirmation}
        onOpenChange={setShowStep1Confirmation}
        formValues={{
          socket_type: formValues.socket_type,
          design_variation: formValues.design_variation,
          model_name: formValues.model_name,
          activity_level: formValues.activity_level,
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
//----this is AK form ---------------------------------------------------
//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

// 'use client';
// import StlFilePicker from '@/components/app/common/StlPreviewer';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { SelectBox } from '@/components/ui/selectbox';
// import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
// import { useCreateOrderMutation } from '@/rtk-query/apis/orders';
// import { USER } from '@/uttils/Types';
// import { getFormOptionsObject } from '@/uttils/UttilFuncations';
// import { Formik } from 'formik';
// import Image from 'next/image';
// import React, { useEffect, useMemo, useState } from 'react';
// import { useSelector } from 'react-redux';
// import * as Yup from 'yup';
// import { AK_FORM_INITIAL_VALUES } from './constants';
// import CustomTable from '@/components/app/common/CustomTable';
// import PatientPicker from '@/components/app/common/PatientPicker';
// import { Textarea } from '@/components/ui/textarea';
// import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';
// import { toast } from 'react-toastify';
// import { useRouter } from 'next/navigation';

// const validationSchema = Yup.object().shape({
//   patient_name: Yup.string()
//     .min(2, 'Too Short!')
//     .max(50, 'Too Long!')
//     .required('Patient Name is required'),
//   socket_type: Yup.string().required('This field is required'),
//   design_variation: Yup.string().required('This field is required'),
//   model_name: Yup.string().required('This field is required'),
//   activity_level: Yup.string().required('This field is required'),
//   stump_length: Yup.string().required('This field is required'),
//   weight: Yup.string().required('This field is required'),
//   date_of_birth: Yup.string().required('This field is required')
// });

// const initialValues = AK_FORM_INITIAL_VALUES;

// export default function AkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
//   const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
//   const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
//   const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  
//   const [selectedItem, setSelectedItem] = React.useState<string>('');
//   const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
//   const [formValues, setFormValues] = useState<any>(initialValues);
//   console.log("$$$$$$$>>",formValues);
//   const [modelOpen, setModelOpen] = useState(false);
//   const router = useRouter();

//   const FORM_OPTIONS = useMemo(() => {
//     if (isFormOptionsLoading) return {};
//     if (data) {
//       return getFormOptionsObject(data?.order_from_details);
//     }
//     return {};
//   }, [data, isFormOptionsLoading]);
//   const handleConfirmOrder = () => {
//     const payload: any = {};
//     payload.item_type = 'AK';
//     payload.customer = user?.customer_id;
//     payload.order_details = formValues;
//     payload.item_code = selectedItem;

//     createOrder(payload);
//   };

//   const OnSubmit = async (values: any) => {
//     setFormValues(values);
//     setModelOpen(true);

//     const itemPayload = {
//       item_type: 'AK',
//       socket_type: values.socket_type,
//       design_variation: values.design_variation,
//       activity_level: values.activity_level,
//       model_name: values.model_name,
//       stump_length: values.stump_length,
//       weight: values.weight
//     };
//     const itemCode = await getItemCodeByValues(itemPayload);
//     setSelectedItem(itemCode);
//   };

//   const getItemCodeByValues = async (payload: any) => {
//     const res: any = await getItem(payload);
//     return res?.data?.item_code;
//   };

//   // after order success
//   useEffect(() => {
//     if (isSuccess) {
//       toast.success('Order created successfully');
//       setSelectedItem('');
//       setFormValues(initialValues);
//       router.push('/orders');
//     }
//   }, [isOrderCreating, isSuccess]);

//   return (
//     <div className="pb-16 relative">
//       <Formik initialValues={initialValues} onSubmit={OnSubmit} validationSchema={validationSchema}>
//         {({ values, handleChange, handleSubmit, errors, touched, setFieldValue }) => (
//           <div className="flex flex-col gap-6">
//             <h3 className="font-semibold text-lg">Basic Details</h3>
//             {/* line 1 */}
//             <div className="grid grid-cols-3 gap-4">
//               <div className="grid grid-cols-3 gap-2 col-span-2">
//                 <PatientPicker
//                   value={values.patient_name}
//                   onChange={handleChange('patient_name')}
//                   setFieldValue={setFieldValue}
//                   required
//                   inVaild={!!errors.patient_name && !!touched.patient_name}
//                   error={errors.patient_name}
//                 />
//                 <Input
//                   placeholder="65"
//                   label="Height (feet)"
//                   value={values.height}
//                   onChange={handleChange('height')}
//                 />
//                 <Input
//                   placeholder="50"
//                   label="Weight (kg)"
//                   value={values.weight}
//                   onChange={handleChange('weight')}
//                   required
//                   inVaild={!!errors.weight && !!touched.weight}
//                   error={errors.weight}
//                 />
//               </div>
//               <Input
//                 placeholder="10 digit phone number"
//                 label="Mobile Number"
//                 value={values.mobile_no}
//                 onChange={handleChange('mobile_no')}
//               />
//               <Input
//                 placeholder="Email"
//                 label="Email"
//                 value={values.email}
//                 onChange={handleChange('email')}
//               />
//               <SelectBox
//                 options={[
//                   { value: 'Male', label: 'Male' },
//                   { value: 'Female', label: 'Female' }
//                 ]}
//                 label="Gender"
//                 required={true}
//                 value={values.gender}
//                 onValueChange={handleChange('gender')}
//                 inVaild={!!errors.gender && !!touched.gender}
//                 error={errors.gender}
//               />
//             </div>
//             <div className="divider"></div>

//             {/* line 2 */}
//             <div className="grid grid-cols-4 gap-4">
//               <Input
//                 placeholder="Patient Name"
//                 label="Amputation Date"
//                 type="date"
//                 value={values.amputation_date}
//                 onChange={handleChange('amputation_date')}
//               />
//               <SelectBox
//                 options={FORM_OPTIONS?.amputated_leg || []}
//                 label="Amputation Leg"
//                 value={values.amputated_leg}
//                 onValueChange={handleChange('amputated_leg')}
//               />
//               <SelectBox
//                 options={FORM_OPTIONS?.reason_for_amputation || []}
//                 label="Reason of Amputation"
//                 value={values.reason_for_amputation}
//                 onValueChange={handleChange('reason_for_amputation')}
//               />
//               <SelectBox
//                 options={FORM_OPTIONS?.activity_level || []}
//                 label="Activity Level"
//                 value={values.activity_level}
//                 onValueChange={handleChange('activity_level')}
//                 required
//                 inVaild={!!errors.activity_level && !!touched.activity_level}
//                 error={errors.activity_level}
//               />
//             </div>

//             <div className="divider"></div>

//             {/* line 3 */}
//             <div className="grid grid-cols-2 gap-4">
//               <SelectBox
//                 options={FORM_OPTIONS?.socket_type || []}
//                 label="Socket Type"
//                 value={values.socket_type}
//                 onValueChange={handleChange('socket_type')}
//                 inVaild={!!errors.socket_type && !!touched.socket_type}
//                 required
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <SelectBox
//                   options={FORM_OPTIONS[values.socket_type + '_' + 'design_variation'] || []}
//                   label="Design Variation"
//                   value={values.design_variation}
//                   onValueChange={handleChange('design_variation')}
//                   inVaild={!!errors.design_variation && !!touched.design_variation}
//                   required
//                 />
//                 <SelectBox
//                   options={FORM_OPTIONS[values.socket_type + '_' + 'model_name'] || []}
//                   label="Model"
//                   value={values.model_name}
//                   onValueChange={handleChange('model_name')}
//                   inVaild={!!errors.model_name && !!touched.model_name}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="divider"></div>
//             <div>
//               <p className="font-semibold my-4">Measurements</p>
//               <div className="grid grid-cols-2 gap-4">
//                 <Image
//                   src="/assets/order-forms/ak-order/AK1.png"
//                   alt="measurements"
//                   width={400}
//                   height={400}
//                 />
//                 <div>
//                   <b>A</b>
//                   <CustomTable
//                     columns={[
//                       { header: 'Circumference at (cm)', accessorKey: 'circumference_at_cm' },
//                       { header: 'Standard Reduction (%)', accessorKey: 'standard_reduction_' },
//                       { header: 'Desired Reduction (%)', accessorKey: 'desired_reduction_' }
//                     ]}
//                     data={values?.ak_socket_measurements?.map((item, index) => ({
//                       id: index,
//                       circumference_at_cm: item?.circumference_at_cm,
//                       standard_reduction_: item?.standard_reduction_,
//                       desired_reduction_: (
//                         <Input
//                           name={`ak_socket_measurements[${index}].desired_reduction_`}
//                           value={item?.desired_reduction_}
//                           onChange={handleChange}
//                           placeholder="5cm"
//                         />
//                       )
//                     }))}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 col-span-2 mt-6">
//                   <div className="grid grid-cols-2 gap-4 h-fit">
//                     <Input
//                       label="Stump Length (cm)"
//                       boldKey="B"
//                       value={values?.stump_length}
//                       onChange={handleChange('stump_length')}
//                       required
//                       inVaild={!!errors.stump_length && !!touched.stump_length}
//                       error={errors.stump_length}
//                     />
//                     <Input label="IT to MPT distance (cm)" boldKey="C" />
//                     <Input label="MPT to floor distance (cm)" boldKey="D" />
//                     <Input label="Waist Circumference (cm)" boldKey="E" />
//                     <Input label="Foot Length (cm)" boldKey="F" />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4 h-fit">
//                     <Input
//                       label="Flexion Angle (°)"
//                       value={values?.flexion_angle}
//                       onChange={handleChange('flexion_angle')}
//                     />
//                     <Input
//                       label="Abduction Angle (°)"
//                       value={values?.abduction_angle}
//                       onChange={handleChange('abduction_angle')}
//                     />
//                     <Input
//                       label="Adduction Angle (°)"
//                       value={values?.adduction_angle}
//                       onChange={handleChange('adduction_angle')}
//                     />
//                     <Input
//                       label="M-L (Vernier)"
//                       value={values?.ml_vernier}
//                       onChange={handleChange('ml_vernier')}
//                     />
//                     <Input
//                       label="A-P (Vernier)"
//                       value={values?.ap_vernier}
//                       onChange={handleChange('ap_vernier')}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="divider"></div>
//             <div className="w-fit">
//               <p className="mb-1 text-xs ">Upload Scan</p>

//               <StlFilePicker />
//             </div>
//             <div className="divider"></div>

//             <div className="grid grid-cols-2 gap-4">
//               <SelectBox
//                 options={FORM_OPTIONS?.reason_for_amputation || []}
//                 label="Reason of Amputation"
//                 value={values.reason_for_amputation}
//                 onValueChange={handleChange('reason_for_amputation')}
//               />
//               <SelectBox
//                 options={FORM_OPTIONS?.medical_history || []}
//                 label="Medical History"
//                 value={values.medical_history}
//                 onValueChange={handleChange('medical_history')}
//               />
//             </div>
//             <div className="divider"></div>
//             <div className="grid grid-cols-2 gap-4">
//               <SelectBox
//                 options={FORM_OPTIONS?.reason_for_amputation || []}
//                 label="Residual Limb Condition (Shape)"
//                 value={values.shape}
//                 onValueChange={handleChange('shape')}
//               />
//               <SelectBox
//                 options={FORM_OPTIONS?.skin_condition || []}
//                 label="Skin Condition"
//                 value={values.skin_condition}
//                 onValueChange={handleChange('skin_condition')}
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <SelectBox
//                 options={FORM_OPTIONS?.locking_system || []}
//                 label="Locking System Proposed"
//                 value={values.locking_system}
//                 onValueChange={handleChange('locking_system')}
//               />
//               <SelectBox
//                 options={FORM_OPTIONS?.adapter_type || []}
//                 label="Adapter"
//                 value={values.adapter_type}
//                 onValueChange={handleChange('adapter_type')}
//               />
//             </div>
//             <div className="divider"></div>
//             <div>
//               <p className="font-semibold my-4">Scan Condition</p>
//               <div className="grid grid-cols-4 gap-4">
//                 <SelectBox
//                   options={[{ value: 'Yes' }, { value: 'No' }]}
//                   label="Direct Body"
//                   required={true}
//                 />
//                 <Input label="With Liner (mm)" placeholder="3" />
//                 <SelectBox
//                   options={FORM_OPTIONS?.liner_type || []}
//                   label="Liner Type"
//                   value={values.liner_type}
//                   onValueChange={handleChange('liner_type')}
//                   required={true}
//                 />
//                 <Input
//                   label="Marking Sock (mm)"
//                   placeholder="2"
//                   value={values?.marking_sock_thickness}
//                   onChange={handleChange('marking_sock_thickness')}
//                 />
//               </div>
//             </div>

//             <div className="divider"></div>
//             <div>
//               <p className="font-semibold my-4">Socket Details</p>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex flex-col gap-6">
//                   <Image
//                     src="/assets/order-forms/ak-order/AK2.png"
//                     alt="measurements"
//                     width={500}
//                     height={500}
//                   />
//                   <div>
//                     <Textarea
//                       label="Other Customization Requirements"
//                       value={values?.other_customization_requirements}
//                       onChange={handleChange('other_customization_requirements')}
//                       className="min-h-[300px]"
//                       placeholder="Start writing here"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <CustomTable
//                     columns={[
//                       { header: 'S NO.', accessorKey: 's_no' },
//                       { header: 'Point', accessorKey: 'point_name' },
//                       { header: 'Pressure (mm)', accessorKey: 'pressure_mm' }
//                     ]}
//                     data={values?.table_zbib?.map((item, index) => ({
//                       id: index,
//                       s_no: index + 1,
//                       point_name: item?.point_name,
//                       pressure_mm: (
//                         <Input
//                           name={`ak_socket_measurements[${index}].pressure_mm`}
//                           value={item?.pressure_mm}
//                           onChange={handleChange}
//                         />
//                       )
//                     }))}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="divider"></div>

//             <div className="sticky bottom-4 left-0 flex justify-end ">
//               <Button className="shadow-2xl" type="button" onClick={() => handleSubmit()}>
//                 Submit
//               </Button>
//             </div>
//           </div>
//         )}
//       </Formik>

//       <Dialog open={modelOpen} onOpenChange={setModelOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Order</DialogTitle>
//           </DialogHeader>

//           <div className="text-xs">
//             <div className="flex justify-between items-center border-t p-2">
//               <span>Socket Type</span>
//               <span>{formValues.socket_type}</span>
//             </div>
//             <div className="flex justify-between items-center border-t p-2">
//               <span>Design Variation</span>
//               <span>{formValues.design_variation}</span>
//             </div>
//             <div className="flex justify-between items-center border-t p-2">
//               <span>Modal</span>
//               <span>{formValues.model_name}</span>
//             </div>
//             <div className="flex justify-between items-center border-y p-2">
//               <span>Activity Level</span>
//               <span>{formValues.activity_level}</span>
//             </div>
//             <div className="flex justify-between items-center border-b p-2 font-semibold">
//               <span>Item Code</span>
//               {isItemFetching ? <span className="loader"></span> : <span>{selectedItem}</span>}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button onClick={() => setModelOpen(false)} variant={'outline'}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleConfirmOrder}
//               disabled={isItemFetching || isOrderCreating || !selectedItem}
//             >
//               Confirm
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
