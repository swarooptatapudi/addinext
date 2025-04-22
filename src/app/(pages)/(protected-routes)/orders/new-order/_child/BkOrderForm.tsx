'use client';
import StlFilePicker from '@/components/app/common/StlPreviewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { Textarea } from '@/components/ui/textarea';
import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
import { useCreateOrderMutation } from '@/rtk-query/apis/orders';
import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';
import { BK_FORM_TYPE, USER } from '@/uttils/Types';
import { getFormOptionsObject } from '@/uttils/UttilFuncations';
import { Formik, useFormikContext } from 'formik';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from 'yup';import {BK_FORM_INITIAL_VALUES} from './constants'; 
import PatientPicker from '@/components/app/common/PatientPicker';
import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
import { GenericFileViewer } from '@/components/app/common/GenericFileViewer';
import { ConfirmOrderDialog } from '@/components/app/common/ConfirmOrderDialog';

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
  flexion_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Flexion angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  abductionadduction_angle: Yup.string()
    .matches(/^\d*$/, 'Must contain only numbers')
    .test('value-range', 'Abd/adduct angle must be ≤ 60', (value) => !value || Number(value) <= 60),
  date_of_birth: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  // email: Yup.string()
  //   .matches(FORMIK_ERRORS.INVALID_EMAIL.VALUE, FORMIK_ERRORS.INVALID_EMAIL.MESSAGE)
  //   .max(FORMIK_ERRORS.MAX_320.VALUE, FORMIK_ERRORS.MAX_320.MESSAGE),
  // mobile_no: Yup.string().matches(
  //   FORMIK_ERRORS.MOBILE_NUMBER.VALUE,
  //   FORMIK_ERRORS.MOBILE_NUMBER.MESSAGE
  // ),
});

const step2Validation = Yup.object().shape({
  images_link: Yup.string()
    .url('Must be a valid URL (e.g., https://drive.google.com/...)')
    .nullable(),
  direct_body: Yup.string().required('Scan condition is required'),
});

const initialValues = BK_FORM_INITIAL_VALUES;

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
  formSubmitted 
}: any) => {
  const shouldShowError = (fieldName: string, isRequired = false) => {
    if (!values[fieldName]) {
      if (!isRequired) return false;
      return formSubmitted || touched[fieldName];
    }
    return !!errors[fieldName] && (touched[fieldName] || formSubmitted);
  };
  // const shouldShowError = (fieldName: string, isRequired = false) => {
  //   // Always show error for required fields when form is submitted
  //   if (formSubmitted && isRequired && !values[fieldName]) {
  //     return true;
  //   }
  //   // Show error if field has been touched or form is submitted
  //   return !!(errors[fieldName] && (touched[fieldName] || formSubmitted));
  // };


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
          ] }
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
      <div className="grid grid-cols-2 gap-4">
        <SelectBox
          options={FORM_OPTIONS?.socket_type || []}
          label="Socket Type"
          value={values.socket_type}
          onValueChange={handleChange('socket_type')}
          inVaild={shouldShowError('socket_type', true)}
          error={errors.socket_type}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectBox
            options={FORM_OPTIONS[values.socket_type + '_' + 'design_variation'] || []}
            label="Design Variation"
            value={values.design_variation}
            onValueChange={handleChange('design_variation')}
            inVaild={shouldShowError('design_variation', true)}
            required
          />
          <SelectBox
            options={FORM_OPTIONS[values.socket_type + '_' + 'model_name'] || []}
            label="Model"
            value={values.model_name}
            onValueChange={handleChange('model_name')}
            inVaild={shouldShowError('model_name', true)}
            required
          />
        </div>
      </div>

      <div className="divider"></div>

      <h3 className="font-semibold text-lg ">Measurements</h3>
      <div className="grid grid-cols-3 gap-4 items-center ml-1">
        <div>
          <Image
            src={'/assets/order-forms/bk-order/stupm.png'}
            alt="measurements"
            width={300}
            height={300}
            className="object-cover"
            loading="lazy"
            priority={false}
            unoptimized={true}
          />
        </div>
        <div className="flex flex-col col-span-2 gap-4">
                <div className="grid grid-cols-2 gap-4 ">
                  <Input
                   label={`Value 𝗔 Stump Length (cm)`}
                   placeholder="20"
                   required
                   value={values.stump_length}
                   onChange={handleChange('stump_length')}
                   inVaild={shouldShowError('stump_length', true)}
                   error={errors.stump_length}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="20"
                    label="Value B  Stump Size (cm)"
                    value={values.stump_size}
                    onChange={handleChange('stump_size')}
                  />
                </div>
                <div className="">
                  <p className='text-xs'>Value <strong>C</strong> - Circumfrence of Stmp at 5 cm gap (cm)</p>
                </div>
                <div className="grid grid-cols-2 gap-3 ">
                  <div className="grid sm:col-span-4 xl:col-span-2 gap-0">
                    <div className="grid grid-cols-2">
                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">0 Cm</p>
                        <Input />
                      </div>

                      <div className="flex gap-4 items-center ">
                        <p className="text-[10px]">15 Cm</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:col-span-3 xl:col-span-2">
                    <div className="grid grid-cols-2">
                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">0 Cm</p>
                        <Input />
                      </div>

                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">20 Cm</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:col-span-3 xl:col-span-2">
                    <div className="grid grid-cols-2">
                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">5 Cm</p>
                        <Input />
                      </div>

                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">25 Cm</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:col-span-3 xl:col-span-2">
                    <div className="grid grid-cols-2">
                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">10 Cm</p>
                        <Input />
                      </div>

                      <div className="flex gap-4 items-center">
                        <p className="text-[10px]">30 Cm</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectBox
            options={FORM_OPTIONS['foot_type'] ?? []}
            label="Foot Type"
            required={false}
            value={values.foot_type}
            onValueChange={handleChange('foot_type')}
          />
          <Input
            placeholder="0"
            label="Shoe Size (cm)"
            value={values.shoe_size}
            onChange={handleChange('shoe_size')}
            inVaild={shouldShowError('shoe_size')}
            error={errors.shoe_size}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Flexion Angle(Deg)"
            placeholder="(Deg)"
            value={values.flexion_angle}
            onChange={handleChange('flexion_angle')}
            inVaild={shouldShowError('flexion_angle')}
            error={errors.flexion_angle}
          />
          <Input
            label="Add/Abd Angle (Deg)"
            placeholder="(Deg)"
            value={values.abductionadduction_angle}
            onChange={handleChange('abductionadduction_angle')}
            inVaild={shouldShowError('abductionadduction_angle')}
            error={errors.abductionadduction_angle}
          />
          <SelectBox
            options={FORM_OPTIONS['stump_type'] ?? []}
            label="Stump Type"
            value={values.stump_type}
            onValueChange={handleChange('stump_type')}
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
        <Textarea
          label="Stump Condition (please describe any specific condition of the stump example bony prominence etc.)"
          className="h-[100px] "
          value={values.stump_condition}
          onChange={handleChange('stump_condition')}
        />
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
  
  // const shouldShowError = (fieldName: string, isRequired = false) => {
  //   if (formSubmitted && isRequired && !values[fieldName]) {
  //     return true;
  //   }
  //   return !!(errors[fieldName] && (touched[fieldName] || formSubmitted));
  // };

  return (
    <div className="flex flex-col gap-6">
       <div className="grid grid-cols-3 gap-4 items-end mb-10">
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
            <SelectBox
              options={FORM_OPTIONS['locking_system'] ?? []}
              label="Adapter/Locking System"
              value={values.locking_system}
              onValueChange={handleChange('locking_system')}
            />
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
                options={FORM_OPTIONS['liner_type'] ?? []}
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
            <p className="mb-1 text-base flex items-center">Upload Scan</p>
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
          <p className="mb-0 text-base ">Upload Addtional Files</p>
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
          <p className="mb-1 text-base ">Upload Link with Photos</p>
          <p className="mb-1 text-[12px] ">
            Upload in Google /Cloud drive and give relevant permission
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
      {/* <div className="divider"></div> */}
     
    </div>
  );
};

const Step3 = ({ values, handleChange }: any) => (
  <div>
    <p className="font-semibold my-4">Socket Design</p>
    <p className="text-xs">
      Please specify the design considerations for each point from A to N. Use "-" to
      indicate Apply pressure (Reduction) and "+" to indicate Relief at the particular
      area. All values should be in millimetres (mm). For eg for applying reduction of 6 mm
      at Patela Tendon, please specify -6
    </p>
    <div className="flex justify-center p-2 mr-20">
      <Image
        src={'/assets/order-forms/bk-order/SocketDesign-BK.jpg'}
        alt="measurements"
        width={800}
        height={900}
        className="object-cover"
      />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="mb-6">
        <p className="text-xs">
          {' '}
          <span className="text-sm"> Global Volume Reduction </span>
          <br /> (please specify the percentage reduction in Volume without reducing the
          length of the socket)
        </p>
      </div>
      <Input placeholder="Default Value:2%" type="text" />
    </div>
    <p className="text-xs">
      Please note as a general guideline our design algorithm will consider an overall 2%
      reduction in the stump dimensions to design the Socket. The below values for "+" and
      "-" should be done based on this assumption.
    </p>
    <div className="grid grid-cols-3 gap-10">
      {values.socket_design_details.map((item: any, index: number) => (
        <div key={index} className="flex items-start gap-4 w-full">
          <p className="font-semibold">{item?.area}. </p>
          <div className="flex-1">
            <Input
              placeholder={'Default Value ' + item?.default_mm}
              label={item?.area_name + ' ' + ' (mm)'}
              value={item?.cpo_input_mm}
              name={`socket_design_details[${index}].cpo_input_mm`}
              onChange={handleChange}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function BkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
  const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
  const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  // const [isPatientSelected, setIsPatientSelected] = useState(false);
  const [selectedItem, setSelectedItem] = React.useState<string>('');
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
  const [formValues, setFormValues] = useState<BK_FORM_TYPE>(initialValues);
  const [modelOpen, setModelOpen] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const FORM_OPTIONS = useMemo(() => {
    if (isFormOptionsLoading) return {};
    if (data) {
      return getFormOptionsObject(data?.order_from_details);
    }
    return {};
  }, [data, isFormOptionsLoading]);

  const handleConfirmOrder = () => {
    const payload: any = {};
    payload.item_type = 'BK';
    payload.customer = user?.customer_id;
    payload.order_details = formValues;
    payload.item_code = selectedItem;

    createOrder(payload);
  };

  const OnSubmit = async (values: BK_FORM_TYPE) => {
    setFormValues(values);
    setModelOpen(true);
    const itemPayload = {
      item_type: 'BK',
      socket_type: values.socket_type,
      design_variation: values.design_variation,
      activity_level: values.activity_level,
      model_name: values.model_name,
      stump_length: values.stump_length,
      weight: values.weight,
    };
    const itemCode = await getItemCodeByValues(itemPayload);
    setSelectedItem(itemCode);
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
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
      setFormSubmitted(false);
    } else {
      setErrors(errors);
    }
  };

  const prevStep = () => {
    setFormSubmitted(false);
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="pb-16 relative">
      <Formik 
        initialValues={initialValues} 
        onSubmit={OnSubmit} 
        validationSchema={currentStep === 1 ? step1Validation : currentStep === 2 ? step2Validation : null}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, handleChange, handleSubmit, errors, touched, setFieldValue, setErrors }) => (
          <div className="flex flex-col gap-6">
            <WatchFieldReset />
            
            {/* Step indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {[
                  { step: 1, name: 'Basic Details', icon: '📋' },
                  { step: 2, name: 'Scan', icon: '📁' }, 
                  { step: 3, name: 'Socket Design', icon: '🛠️' }
                ].map(({step, name, icon}) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1">
          
            <div
              className={`w-34 h-7 flex items-center justify-center text-sm transition-all duration-300 ease-in-out rounded-full ${
              currentStep === step
              ? "bg-primary/88 text-white text-gray-900 scale-105 text-sm ring-0 bg-gray-200 "
              : completedSteps.includes(step)
              ? "bg-gray-300 text-gray-800 border border-gray-200 hover:bg-gray-400"
              : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
            >
         <span className="flex items-center gap-2">
          {currentStep === step && (
            <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse"></span>
          )}
        {completedSteps.includes(step) && !(currentStep === step) && (
            <svg
              className="w-4 h-8 text-gray-500"
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
          {name}
       </span>
</div>
                    </div>
                    {step < 3 && (
                      <div className="flex items-center">
                      {step < 3 && (
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
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={1}
                      className={`transition-all duration-500 ${
                        completedSteps.includes(step) 
                          ? 'stroke-primary opacity-20' 
                          : 'stroke-transparent'
                      }`}
                    />
                    </svg>
                      )}
                    </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step content */}
            {currentStep === 1 && (
              <Step1
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                FORM_OPTIONS={FORM_OPTIONS}
                formSubmitted={formSubmitted}
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
              />
            )}

            {/* Navigation buttons */}
            <div className="sticky bottom-4 left-0 flex justify-between">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}
              </div>
              <div>
                {currentStep < 3 ? (
                  <Button 
                    className="shadow-2xl" 
                    onClick={() => nextStep(values, setErrors)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button className="shadow-2xl" onClick={() => handleSubmit()}>
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Formik>
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
      />
    </div>
  );
}

// 'use client';
// import StlFilePicker from '@/components/app/common/StlPreviewer';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { SelectBox } from '@/components/ui/selectbox';
// import { Textarea } from '@/components/ui/textarea';
// import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
// import { useCreateOrderMutation } from '@/rtk-query/apis/orders';
// import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';
// import { BK_FORM_TYPE, USER } from '@/uttils/Types';
// import { getFormOptionsObject } from '@/uttils/UttilFuncations';
// import { Formik, useFormikContext } from 'formik';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import React, { useEffect, useMemo, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import * as Yup from 'yup';
// import { BK_FORM_INITIAL_VALUES } from './constants';
// import PatientPicker from '@/components/app/common/PatientPicker';
// import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
// import { GenericFileViewer } from '@/components/app/common/GenericFileViewer';

// const step1Validation = Yup.object().shape({
//   patient_name: Yup.string()
//     .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
//     .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
//     .required(FORMIK_ERRORS.REQUIRED),
//   socket_type: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   design_variation: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   model_name: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   activity_level: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   height: Yup.string()
//     .matches(/^\d+(\.\d{1,2})?$/, {
//       message: 'Must be a number (e.g. 92.57 or 95)',
//       excludeEmptyString: true,
//     })
//     .test('min-height', 'Minimum height is 91cm', (value) => !value || parseFloat(value) >= 91)
//     .test('max-height', 'Maximum height is 213.00cm', (value) => !value || parseFloat(value) <= 213.0),
//   weight: Yup.string()
//     .required('Weight is required')
//     .matches(/^\d+(\.\d{1,2})?$/, {
//       message: 'Must be a number (e.g. 65.5 or 70)',
//       excludeEmptyString: false,
//     })
//     .test('min-weight', 'Minimum weight is 10kg', (value) => parseFloat(value) >= 10)
//     .test('max-weight', 'Maximum weight is 180kg', (value) => parseFloat(value) <= 180),
//   stump_length: Yup.string()
//     .required(FORMIK_ERRORS.REQUIRED)
//     .matches(/^\d+$/, 'Must contain only numbers')
//     .test('min-value', 'stupm length must be at least 1', (value) => Number(value) >= 1),
//   shoe_size: Yup.string()
//     .matches(/^\d+(\.\d{1,2})?$/, {
//       message: 'Must be a number (e.g. 92.57 or 95)',
//       excludeEmptyString: true,
//     })
//     .test('min-height', 'Minimum height is 1cm', (value) => !value || parseFloat(value) >= 1)
//     .test('max-height', 'Maximum height', (value) => !value || parseFloat(value) <= 200.0),
//   flexion_angle: Yup.string()
//     .matches(/^\d*$/, 'Must contain only numbers')
//     .test('value-range', 'Flexion angle must be ≤ 60', (value) => !value || Number(value) <= 60),
//   abductionadduction_angle: Yup.string()
//     .matches(/^\d*$/, 'Must contain only numbers')
//     .test('value-range', 'Abd/adduct angle must be ≤ 60', (value) => !value || Number(value) <= 60),
//   date_of_birth: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   email: Yup.string()
//     .matches(FORMIK_ERRORS.INVALID_EMAIL.VALUE, FORMIK_ERRORS.INVALID_EMAIL.MESSAGE)
//     .max(FORMIK_ERRORS.MAX_320.VALUE, FORMIK_ERRORS.MAX_320.MESSAGE),
//   mobile_no: Yup.string().matches(
//     FORMIK_ERRORS.MOBILE_NUMBER.VALUE,
//     FORMIK_ERRORS.MOBILE_NUMBER.MESSAGE
//   ),
// });

// const step2Validation = Yup.object().shape({
//   images_link: Yup.string()
//     .url('Must be a valid URL (e.g., https://drive.google.com/...)')
//     .nullable(),
//   direct_body: Yup.string().required('Scan condition is required'),
// });

// const initialValues = BK_FORM_INITIAL_VALUES;

// const WatchFieldReset = () => {
//   const { values, setFieldValue } = useFormikContext<any>();

//   useEffect(() => {
//     setFieldValue('design_variation', '');
//     setFieldValue('model_name', '');
//   }, [values.socket_type]);

//   return null;
// };

// const Step1 = ({ values, handleChange, errors, touched, setFieldValue, isPatientSelected, FORM_OPTIONS, validateForm,formSubmitted  }: any) => {
//   const shouldShowError = (fieldName: string) => {
//     // For required fields, show error immediately if empty when form is submitted
//     if (formSubmitted && errors[fieldName]) {
//       return true;
//     }
//     // Otherwise only show error if field has been touched
//     return !!(touched[fieldName] && errors[fieldName]);
//   };
//   return(
//   <div className="flex flex-col gap-6">
//     <h3 className="font-semibold text-lg">Basic Details</h3>
//     {/* line 1 */}
//     <div className="grid grid-cols-3 gap-4"> 
//       <PatientPicker
//         label="Patient Name"
//         placeholder="Patient Name"
//         value={values.patient_name}
//         onChange={handleChange('patient_name')}
//         setFieldValue={setFieldValue}
//         required
//         inVaild={shouldShowError('patient_name')}
//         // inVaild={!!errors.patient_name && !!touched.patient_name}
//         error={errors.patient_name}
//         setIsPatientSelected={() => {}}
//       />
//       <div className="grid grid-cols-3 gap-2 col-span-2">
//         <Input
//           label="Date of Birth"
//           type="date"
//           value={values.date_of_birth}
//           onChange={handleChange('date_of_birth')}
//           required
//           inVaild={shouldShowError('date_of_birth')}
//           // inVaild={!!errors.date_of_birth && !!touched.date_of_birth}
//           error={errors.date_of_birth}
//           disabled={true}
//           // disabled={isPatientSelected}
//         />
//         <Input
//           placeholder="65"
//           label="Height (cm)"
//           onChange={handleChange('height')}
//           value={values.height}
//           // inVaild={!!errors.height && !!touched.height}
//           error={errors.height}
//           inVaild={shouldShowError('height')}
//           disabled={true}
//           // disabled={isPatientSelected}
//         />
//         <Input
//           placeholder="50"
//           label="Weight (kgs)"
//           required
//           value={values.weight}
//           onChange={handleChange('weight')}
//           // inVaild={!!errors.weight && !!touched.weight}
//           error={errors.weight}
//           inVaild={shouldShowError('weight')}
//           // disabled={true}
//           // disabled={isPatientSelected}
//         />
//       </div>
//       <Input
//         placeholder="10 digit phone number"
//         label="Mobile Number"
//         value={values.mobile_no}
//         onChange={handleChange('mobile_no')}
//         inVaild={shouldShowError('mobile_no')}
//         // inVaild={!!errors.mobile_no && !!touched.mobile_no}
//         error={errors.mobile_no}
//         disabled={true}
//         // disabled={isPatientSelected}
//       />
//       <Input
//         placeholder="Email"
//         label="Email"
//         value={values.email}
//         onChange={handleChange('email')}
//         inVaild={shouldShowError('email')}
//         // inVaild={!!errors.email && !!touched.email}
//         error={errors.email}
//         disabled={true}
//         // disabled={isPatientSelected}
//       />
//       <SelectBox
//         options={[
//           { value: 'Male', label: 'Male' },
//           { value: 'Female', label: 'Female' },
//         ]}
//         label="Gender"
//         required={true}
//         value={values.gender}
//         onValueChange={handleChange('gender')}
//         inVaild={shouldShowError('gender')}
//         // inVaild={!!errors.gender && !!touched.gender}
//         error={errors.gender}
//         disabled={true}
//         // disabled={isPatientSelected}
//       />
//     </div>
//     <div className="divider"></div>

//     {/* line2 */}
//     <div className="grid grid-cols-4 gap-4">
//       <Input
//         placeholder="Patient Name"
//         label="Amputation Date"
//         type="date"
//         value={values.amputation_date}
//         onChange={handleChange('amputation_date')}
//       />
//       <SelectBox
//         options={FORM_OPTIONS?.amputated_leg || []}
//         label="Amputation Leg"
//         value={values.amputated_leg}
//         onValueChange={handleChange('amputated_leg')}
//       />
//       <SelectBox
//         options={FORM_OPTIONS?.reason_for_amputation || []}
//         label="Reason of Amputation"
//         value={values.reason_for_amputation}
//         onValueChange={handleChange('reason_for_amputation')}
//       />
//       <SelectBox
//         options={FORM_OPTIONS?.activity_level || []}
//         label="Activity Level"
//         value={values.activity_level}
//         onValueChange={handleChange('activity_level')}
//         required
//         inVaild={!!errors.activity_level && !!touched.activity_level}
//         error={errors.activity_level}
//       />
//     </div>

//     <div className="divider"></div>
//     <div className="grid grid-cols-2 gap-4">
//       <SelectBox
//         options={FORM_OPTIONS?.socket_type || []}
//         label="Socket Type"
//         value={values.socket_type}
//         onValueChange={handleChange('socket_type')}
//         inVaild={!!errors.socket_type && !!touched.socket_type}
//         required
//       />

//       <div className="grid grid-cols-2 gap-4">
//         <SelectBox
//           options={FORM_OPTIONS[values.socket_type + '_' + 'design_variation'] || []}
//           label="Design Variation"
//           value={values.design_variation}
//           onValueChange={handleChange('design_variation')}
//           inVaild={!!errors.design_variation && !!touched.design_variation}
//           required
//         />
//         <SelectBox
//           options={FORM_OPTIONS[values.socket_type + '_' + 'model_name'] || []}
//           label="Model"
//           value={values.model_name}
//           onValueChange={handleChange('model_name')}
//           inVaild={!!errors.model_name && !!touched.model_name}
//           required
//         />
//       </div>
//     </div>

//     <div className="divider"></div>

//     <h3 className="font-semibold text-lg ">Measurements</h3>
//     <div className="grid grid-cols-3 gap-4 items-center ml-1">
//       <div>
//         <Image
//           src={'/assets/order-forms/bk-order/stupm.png'}
//           alt="measurements"
//           width={300}
//           height={300}
//           className="object-cover"
//           loading="lazy"
//           priority={false}
//         />
//       </div>
//       <div className="flex flex-col gap-4">
//         <Input
//           label={`Value 𝗔 Stump Length (cm)`}
//           placeholder="20"
//           required
//           value={values.stump_length}
//           onChange={handleChange('stump_length')}
//           inVaild={shouldShowError('stump_length')}
//           // inVaild={!!errors.stump_length && !!touched.stump_length}
//           error={errors.stump_length}
//         />
//         <Input
//           placeholder="20"
//           label="Value B Stump Size (cm)"
//           value={values.stump_size}
//           onChange={handleChange('stump_size')}
//         />
//       </div>
//     </div>

//     <div className="grid grid-cols-2 gap-4">
//       <div className="grid grid-cols-2 gap-4">
//         <SelectBox
//           options={FORM_OPTIONS['foot_type'] ?? []}
//           label="Foot Type"
//           required={false}
//           value={values.foot_type}
//           onValueChange={handleChange('foot_type')}
//         />
//         <Input
//           placeholder="0"
//           label="Shoe Size (cm)"
//           value={values.shoe_size}
//           onChange={handleChange('shoe_size')}
//           inVaild={!!errors.shoe_size && !!touched.shoe_size}
//           error={errors.shoe_size}
//         />
//       </div>
//       <div className="grid grid-cols-3 gap-4">
//         <Input
//           label="Flexion Angle(Deg)"
//           placeholder="(Deg)"
//           value={values.flexion_angle}
//           onChange={handleChange('flexion_angle')}
//           inVaild={!!errors.flexion_angle && !!touched.flexion_angle}
//           error={errors.flexion_angle}
//         />
//         <Input
//           label="Add/Abd Angle (Deg)"
//           placeholder="(Deg)"
//           value={values.abductionadduction_angle}
//           onChange={handleChange('abductionadduction_angle')}
//           inVaild={!!errors.abductionadduction_angle && !!touched.abductionadduction_angle}
//           error={errors.abductionadduction_angle}
//         />
//         <SelectBox
//           options={FORM_OPTIONS['stump_type'] ?? []}
//           label="Stump Type"
//           value={values.stump_type}
//           onValueChange={handleChange('stump_type')}
//         />
//       </div>
//     </div>
//     <div className="grid grid-cols-3 gap-4 items-center ml-1">
//       <div>
//         <Image
//           src={'/assets/order-forms/bk-order/stumpcondtion.png'}
//           alt="measurements"
//           width={300}
//           height={300}
//           className="object-cover"
//         />
//       </div>
//     </div>
//     <div className="grid grid-cols-2 gap-4">
//       <Textarea
//         label="Stump Condition (please describe any specific condition of the stump example bony prominence etc.)"
//         className="h-[100px] "
//         value={values.stump_condition}
//         onChange={handleChange('stump_condition')}
//       />
//       <Textarea
//         label="Previous Prosthetic Experience (Please describe any previous experience of Prosthetics used, Make, Model,
//                Type, Issues with it and expectation from the new Prosthetic socket)"
//         className="h-[100px] "
//         value={values.previous_prosthetic_experience}
//         onChange={handleChange('previous_prosthetic_experience')}
//       />
//     </div>
//   </div> 
//   )
// };

// const Step2 = ({ values, handleChange, errors, touched, setFieldValue, FORM_OPTIONS }: any) => (
//   <div className="flex flex-col gap-6">
//     <h3 className="font-semibold text-lg ">File Upload</h3>
//     <div className="grid grid-cols-8 gap-4">
//       <div className="col-span-3">
//         <div className="grid grid-cols-2">
//           <p className="mb-1 text-base flex items-center">Upload Scan</p>
//           <div className="w-[150px] ml-8">
//             <SelectBox
//               options={[
//                 { value: 'Left_Foot', label: 'Left Foot ' },
//                 { value: 'Right_Foot', label: 'Right Foot' },
//                 { value: 'Both', label: 'Both' },
//               ]}
//               value={values.foot_Amputation}
//               onValueChange={handleChange('foot_Amputation')}
//             />
//           </div>
//         </div>
//       </div>
//       {(values.foot_Amputation === 'Left_Foot' || values.foot_Amputation === 'Both') && (
//         <div className="w-fit justify-center">
//           <StlFilePicker
//             label="Upload STL file (left foot)"
//             buttonText="Left Foot"
//             onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//           />
//         </div>
//       )}

//       {(values.foot_Amputation === 'Right_Foot' || values.foot_Amputation === 'Both') && (
//         <div className="w-fit ml-2">
//           <StlFilePicker
//             label="Upload STL file (Rgiht foot)"
//             buttonText="Right Foot"
//             onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//           />
//         </div>
//       )}
//     </div>
//     <div className="grid grid-cols-8 gap-4">
//       <div className="col-span-3">
//         <p className="mb-0 text-base ">Upload Addtional Files</p>
//         <span className="mb-1 text-[12px] ">(Design / Rough calculations etc.)</span>
//       </div>

//       <div className="w-fit">
//         <GenericFileViewer
//           allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
//           maxSizeMB={5}
//           label="Select Image"
//           buttonText="File 1"
//           onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//         />
//       </div>
//       <div className="w-fit ml-2">
//         <GenericFileViewer
//           allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
//           maxSizeMB={5}
//           label="Select Image"
//           buttonText="File 2"
//           onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//         />
//       </div>
//     </div>
//     <div className="flex flex-col-6 gap-4">
//       <div className="col-span-3">
//         <p className="mb-1 text-base ">Upload Link with Photos</p>
//         <p className="mb-1 text-[12px] ">
//           Upload in Google /Cloud drive and give relevant permission
//         </p>
//       </div>
//       <div className="flex flex-col-6 gap-4">
//         <Input
//           placeholder="https://drive.google.com/..."
//           className="mt-3 min-w-max ml-0 w-[410px]"
//           value={values.images_link}
//           onChange={handleChange('images_link')}
//           inVaild={!!errors.images_link && !!touched.images_link}
//           error={errors.images_link}
//         />
//       </div>
//     </div>
//     <div className="divider"></div>
//     <div className="grid grid-cols-3 gap-4 items-end">
//       <div className="grid grid-cols-1 gap-4 ">
//         <h3 className="font-semibold text-lg ">Scan Condition</h3>
//         <SelectBox
//           options={[
//             { label: 'Direct Body', value: 'Direct_Body ' },
//             { label: 'With Liner', value: 'With_Liner' },
//           ]}
//           label="Direct Body"
//           required={true}
//           value={values.direct_body}
//           onValueChange={handleChange('direct_body')}
//           inVaild={!!errors.direct_body && !!touched.direct_body}
//           error={errors.direct_body}
//         />
//         {values.direct_body === 'With_Liner' && (
//           <SelectBox
//             options={FORM_OPTIONS['locking_system'] ?? []}
//             label="Adapter/Locking System"
//             value={values.locking_system}
//             onValueChange={handleChange('locking_system')}
//           />
//         )}
//       </div>
//       <div>
//         <div className="grid grid-cols gap-4">
//           {values.direct_body === 'With_Liner' && (
//             <>
//               <SelectBox
//                 options={FORM_OPTIONS['liner_thickness'] ?? []}
//                 label="Liner Thickness"
//                 value={values.liner_thickness}
//                 onValueChange={handleChange('liner_thickness')}
//               />
//               <div style={{ marginBottom: '55px' }}></div>
//             </>
//           )}
//         </div>
//       </div>
//       <div className="grid grid-cols gap-4">
//         {values.direct_body === 'With_Liner' && (
//           <>
//             <SelectBox
//               options={FORM_OPTIONS['liner_type'] ?? []}
//               label="Liner Type"
//               value={values.liner_type}
//               onValueChange={handleChange('liner_type')}
//             />
//             <div style={{ marginBottom: '55px' }}></div>
//           </>
//         )}
//       </div>
//     </div>
//   </div>
// );

// const Step3 = ({ values, handleChange }: any) => (
//   <div>
//     <p className="font-semibold my-4">Socket Design</p>
//     <p className="text-xs">
//       Please specify the design considerations for each point from A to N. Use "-" to
//       indicate Apply pressure (Reduction) and "+" to indicate Relief at the particular
//       area. All values should be in millimetres (mm). For eg for applying reduction of 6 mm
//       at Patela Tendon, please specify -6
//     </p>
//     <div className="flex justify-center p-2 mr-20">
//       <Image
//         src={'/assets/order-forms/bk-order/SocketDesign-BK.jpg'}
//         alt="measurements"
//         width={800}
//         height={900}
//         className="object-cover"
//       />
//     </div>
//     <div className="grid grid-cols-3 gap-4">
//       <div className="mb-6">
//         <p className="text-xs">
//           {' '}
//           <span className="text-sm"> Global Volume Reduction </span>
//           <br /> (please specify the percentage reduction in Volume without reducing the
//           length of the socket)
//         </p>
//       </div>
//       <Input placeholder="Default Value:2%" type="text" />
//     </div>
//     <p className="text-xs">
//       Please note as a general guideline our design algorithm will consider an overall 2%
//       reduction in the stump dimensions to design the Socket. The below values for "+" and
//       "-" should be done based on this assumption.
//     </p>
//     <div className="grid grid-cols-3 gap-10">
//       {values.socket_design_details.map((item: any, index: number) => (
//         <div key={index} className="flex items-start gap-4 w-full">
//           <p className="font-semibold">{item?.area}. </p>
//           <div className="flex-1">
//             <Input
//               placeholder={'Default Value ' + item?.default_mm}
//               label={item?.area_name + ' ' + ' (mm)'}
//               value={item?.cpo_input_mm}
//               name={`socket_design_details[${index}].cpo_input_mm`}
//               onChange={handleChange}
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export default function BkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
//   const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
//   const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
//   const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
//   const [isPatientSelected, setIsPatientSelected] = useState(false);
//   const [selectedItem, setSelectedItem] = React.useState<string>('');
//   const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
//   const [formValues, setFormValues] = useState<BK_FORM_TYPE>(initialValues);
//   const [modelOpen, setModelOpen] = useState(false);
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [completedSteps, setCompletedSteps] = useState<number[]>([]);
//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const FORM_OPTIONS = useMemo(() => {
//     if (isFormOptionsLoading) return {};
//     if (data) {
//       return getFormOptionsObject(data?.order_from_details);
//     }
//     return {};
//   }, [data, isFormOptionsLoading]);

//   const handleConfirmOrder = () => {
//     const payload: any = {};
//     payload.item_type = 'BK';
//     payload.customer = user?.customer_id;
//     payload.order_details = formValues;
//     payload.item_code = selectedItem;

//     createOrder(payload);
//   };

//   const OnSubmit = async (values: BK_FORM_TYPE) => {
//     setFormValues(values);
//     setModelOpen(true);
//     const itemPayload = {
//       item_type: 'BK',
//       socket_type: values.socket_type,
//       design_variation: values.design_variation,
//       activity_level: values.activity_level,
//       model_name: values.model_name,
//       stump_length: values.stump_length,
//       weight: values.weight,
//     };
//     const itemCode = await getItemCodeByValues(itemPayload);
//     setSelectedItem(itemCode);
//   };

//   const getItemCodeByValues = async (payload: any) => {
//     const res: any = await getItem(payload);
//     return res?.data?.item_code;
//   };

//   useEffect(() => {
//     if (isSuccess) {
//       toast.success('Order created successfully');
//       setSelectedItem('');
//       setFormValues(initialValues);
//       router.push('/orders');
//     }
//   }, [isOrderCreating, isSuccess]);

//   const validateCurrentStep = async (values: any) => {
//     try {
//       if (currentStep === 1) {
//         await step1Validation.validate(values, { abortEarly: false });
//       } else if (currentStep === 2) {
//         await step2Validation.validate(values, { abortEarly: false });
//       }
//       return {};
//     } catch (errors) {
//       if (errors instanceof Yup.ValidationError) {
//         return errors.inner.reduce((acc, error) => {
//           return {
//             ...acc,
//             [error.path || '']: error.message,
//           };
//         }, {});
//       }
//       return {};
//     }
//   };

//   const nextStep = async (values: any, setErrors: any) => {
//     console.log(values);
//     setFormSubmitted(true);
//     const errors = await validateCurrentStep(values);
//     if (Object.keys(errors).length === 0) {
//       setCompletedSteps([...completedSteps, currentStep]);
//       setCurrentStep(currentStep + 1);
//       setFormSubmitted(false);
//     } else {
//       setErrors(errors);
//     }
//   };

//   const prevStep = () => {
//     setFormSubmitted(false);
//     setCurrentStep(currentStep - 1);
//   };

//   return (
//     <div className="pb-16 relative">
//       <Formik 
//         initialValues={initialValues} 
//         onSubmit={OnSubmit} 
//         validationSchema={currentStep === 1 ? step1Validation : currentStep === 2 ? step2Validation : null}
//       >
//         {({ values, handleChange, handleSubmit, errors, touched, setFieldValue, setErrors, validateForm }) => (
//           <div className="flex flex-col gap-6">
//             <WatchFieldReset />
// {/* Step indicator */}
// <div className="flex justify-center mb-8">
//   <div className="flex items-center gap-2">
//     {[
//       { step: 1, name: 'Basic Details ', icon: '📋' },
//       { step: 2, name: 'Files Upload', icon: '📁' }, 
//       { step: 3, name: 'Socket Design', icon: '🛠️' }
//     ].map(({step, name, icon}) => (
//       <React.Fragment key={step}>
//         <div className="flex flex-col items-center gap-1">
//           <div
//             className={`w-32 h-7 flex items-center text-sm justify-center transition-all ${
//               currentStep === step
//                 ? 'bg-primary text-white shadow-lg scale-100'
//                 : completedSteps.includes(step)
//                 ? 'bg-green-100 text-green-700 border-2 border-green-300'
//                 : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
//             }`}
//           >
//             {name}
//           </div>
//         </div>
//         {step < 3 && (
//           <div
//             className={`h-1 w-10 ${
//               completedSteps.includes(step) ? 'bg-green-300' : 'bg-gray-200'
//             }`}
//           ></div>
//         )}
//       </React.Fragment>
//     ))}
//   </div>
// </div>

//             {/* Step content */}
//             {currentStep === 1 && (
//               <Step1
//                 values={values}
//                 handleChange={handleChange}
//                 errors={errors}
//                 touched={touched}
//                 setFieldValue={setFieldValue}
//                 isPatientSelected={isPatientSelected}
//                 FORM_OPTIONS={FORM_OPTIONS}
//                 validateForm={validateForm}
//               />
//             )}
//             {currentStep === 2 && (
//               <Step2
//                 values={values}
//                 handleChange={handleChange}
//                 errors={errors}
//                 touched={touched}
//                 setFieldValue={setFieldValue}
//                 FORM_OPTIONS={FORM_OPTIONS}
//               />
//             )}
//             {currentStep === 3 && (
//               <Step3
//                 values={values}
//                 handleChange={handleChange}
//               />
//             )}

//             {/* Navigation buttons */}
//             <div className="sticky bottom-4 left-0 flex justify-between">
//   <div>
//     {currentStep > 1 && (
//       <Button variant="outline" onClick={prevStep}>
//         Previous
//       </Button>
//     )}
//   </div>
//   <div>
//     {currentStep < 3 ? (
//       <Button 
//         className="shadow-2xl" 
//         onClick={() => nextStep(values, setErrors)}
//       >
//         Next
//       </Button>
//     ) : (
//       <Button className="shadow-2xl" onClick={() => handleSubmit()}>
//         Submit
//       </Button>
//     )}
//   </div>
// </div>
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
//               {isItemFetching ? (
//                 <span className="loader"></span>
//               ) : (
//                 <span>{selectedItem}</span>
//               )}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button onClick={() => setModelOpen(false)} variant={'outline'}>
//               Amend
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

//--------- It is working ----------------------------------------------
// 'use client';
// import StlFilePicker from '@/components/app/common/StlPreviewer';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { SelectBox } from '@/components/ui/selectbox';
// import { Textarea } from '@/components/ui/textarea';
// import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
// import { useCreateOrderMutation } from '@/rtk-query/apis/orders';
// import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';
// import { BK_FORM_TYPE, USER } from '@/uttils/Types';
// import { getFormOptionsObject } from '@/uttils/UttilFuncations';
// import { Formik, useFormikContext } from 'formik';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import React, { useEffect, useMemo, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import * as Yup from 'yup';
// import { BK_FORM_INITIAL_VALUES } from './constants';
// import PatientPicker from '@/components/app/common/PatientPicker';
// import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
// import { GenericFileViewer } from '@/components/app/common/GenericFileViewer';

// const validationSchema = Yup.object().shape({
//   patient_name: Yup.string()
//     .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
//     .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
//     .required(FORMIK_ERRORS.REQUIRED),
//   socket_type: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   design_variation: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   model_name: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   activity_level: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   height: Yup.string()
//     .matches(/^\d+(\.\d{1,2})?$/, {
//       message: 'Must be a number (e.g. 92.57 or 95)',
//       excludeEmptyString: true,
//     })
//     .test('min-height', 'Minimum height is 91cm', (value) => !value || parseFloat(value) >= 91)
//     .test('max-height', 'Maximum height is 213.00cm', (value) => !value || parseFloat(value) <= 213.0),
//   weight: Yup.string()
//     .required('Weight is required')
//     .matches(/^\d+(\.\d{1,2})?$/, {
//       message: 'Must be a number (e.g. 65.5 or 70)',
//       excludeEmptyString: false,
//     })
//     .test('min-weight', 'Minimum weight is 10kg', (value) => parseFloat(value) >= 10)
//     .test('max-weight', 'Maximum weight is 180kg', (value) => parseFloat(value) <= 180),
//   stump_length: Yup.string()
//     .required(FORMIK_ERRORS.REQUIRED)
//     .matches(/^\d+$/, 'Must contain only numbers')
//     .test('min-value', 'stupm length must be at least 1', (value) => Number(value) >= 1),
//   shoe_size: Yup.string()
//     .matches(/^\d+(\.\d{1,2})?$/, {
//       message: 'Must be a number (e.g. 92.57 or 95)',
//       excludeEmptyString: true,
//     })
//     .test('min-height', 'Minimum height is 1cm', (value) => !value || parseFloat(value) >= 1)
//     .test('max-height', 'Maximum height', (value) => !value || parseFloat(value) <= 200.0),
//   flexion_angle: Yup.string()
//     .matches(/^\d*$/, 'Must contain only numbers')
//     .test('value-range', 'Flexion angle must be ≤ 60', (value) => !value || Number(value) <= 60),
//   abductionadduction_angle: Yup.string()
//     .matches(/^\d*$/, 'Must contain only numbers')
//     .test('value-range', 'Abd/adduct angle must be ≤ 60', (value) => !value || Number(value) <= 60),
//   date_of_birth: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//   email: Yup.string()
//     .matches(FORMIK_ERRORS.INVALID_EMAIL.VALUE, FORMIK_ERRORS.INVALID_EMAIL.MESSAGE)
//     .max(FORMIK_ERRORS.MAX_320.VALUE, FORMIK_ERRORS.MAX_320.MESSAGE),
//   mobile_no: Yup.string().matches(
//     FORMIK_ERRORS.MOBILE_NUMBER.VALUE,
//     FORMIK_ERRORS.MOBILE_NUMBER.MESSAGE
//   ),
//   images_link: Yup.string()
//     .url('Must be a valid URL (e.g., https://drive.google.com/...)')
//     .nullable(),
// });

// const initialValues = BK_FORM_INITIAL_VALUES;

// const WatchFieldReset = () => {
//   const { values, setFieldValue } = useFormikContext<any>();

//   useEffect(() => {
//     setFieldValue('design_variation', '');
//     setFieldValue('model_name', '');
//   }, [values.socket_type]);

//   return null;
// };

// export default function BkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
//   const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
//   const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
//   const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
//   const [isPatientSelected, setIsPatientSelected] = useState(false);
//   const [selectedItem, setSelectedItem] = React.useState<string>('');
//   const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
//   const [formValues, setFormValues] = useState<BK_FORM_TYPE>(initialValues);
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
//     payload.item_type = 'BK';
//     payload.customer = user?.customer_id;
//     payload.order_details = formValues;
//     payload.item_code = selectedItem;

//     createOrder(payload);
//   };

//   const OnSubmit = async (values: BK_FORM_TYPE) => {
//     setFormValues(values);
//     setModelOpen(true);
//     const itemPayload = {
//       item_type: 'BK',
//       socket_type: values.socket_type,
//       design_variation: values.design_variation,
//       activity_level: values.activity_level,
//       model_name: values.model_name,
//       stump_length: values.stump_length,
//       weight: values.weight,
//     };
//     const itemCode = await getItemCodeByValues(itemPayload);
//     setSelectedItem(itemCode);
//   };

//   const getItemCodeByValues = async (payload: any) => {
//     const res: any = await getItem(payload);
//     return res?.data?.item_code;
//   };

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
//             <WatchFieldReset />

//             <h3 className="font-semibold text-lg">Basic Details</h3>
//             {/* line 1 */}
//             <div className="grid grid-cols-3 gap-4">
//               <PatientPicker
//                 label="Patient Name"
//                 placeholder="Patient Name"
//                 value={values.patient_name}
//                 onChange={handleChange('patient_name')}
//                 setFieldValue={setFieldValue}
//                 required
//                 inVaild={!!errors.patient_name && !!touched.patient_name}
//                 error={errors.patient_name}
//                 setIsPatientSelected={setIsPatientSelected}
//               />
//               <div className="grid grid-cols-3 gap-2 col-span-2">
//                 <Input
//                   label="Date of Birth"
//                   type="date"
//                   value={values.date_of_birth}
//                   onChange={handleChange('date_of_birth')}
//                   required
//                   inVaild={!!errors.date_of_birth && !!touched.date_of_birth}
//                   error={errors.date_of_birth}
//                   disabled={isPatientSelected}
//                 />
//                 <Input
//                   placeholder="65"
//                   label="Height (cm)"
//                   onChange={handleChange('height')}
//                   value={values.height}
//                   inVaild={!!errors.height && !!touched.height}
//                   error={errors.height}
//                   disabled={isPatientSelected}
//                 />
//                 <Input
//                   placeholder="50"
//                   label="Weight (kgs)"
//                   required
//                   value={values.weight}
//                   onChange={handleChange('weight')}
//                   inVaild={!!errors.weight && !!touched.weight}
//                   error={errors.weight}
//                   disabled={isPatientSelected}
//                 />
//               </div>
//               <Input
//                 placeholder="10 digit phone number"
//                 label="Mobile Number"
//                 value={values.mobile_no}
//                 onChange={handleChange('mobile_no')}
//                 inVaild={!!errors.mobile_no && !!touched.mobile_no}
//                 error={errors.mobile_no}
//                 disabled={isPatientSelected}
//               />
//               <Input
//                 placeholder="Email"
//                 label="Email"
//                 value={values.email}
//                 onChange={handleChange('email')}
//                 inVaild={!!errors.email && !!touched.email}
//                 error={errors.email}
//                 disabled={isPatientSelected}
//               />
//               <SelectBox
//                 options={[
//                   { value: 'Male', label: 'Male' },
//                   { value: 'Female', label: 'Female' },
//                 ]}
//                 label="Gender"
//                 required={true}
//                 value={values.gender}
//                 onValueChange={handleChange('gender')}
//                 inVaild={!!errors.gender && !!touched.gender}
//                 error={errors.gender}
//                 disabled={isPatientSelected}
//               />
//             </div>
//             <div className="divider"></div>

//             {/* line2 */}
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

//             <h3 className="font-semibold text-lg ">Measurements</h3>
//             <div className="grid grid-cols-3 gap-4 items-center ml-1">
//               <div>
//                 <Image
//                   src={'/assets/order-forms/bk-order/stupm.png'}
//                   alt="measurements"
//                   width={300}
//                   height={300}
//                   className="object-cover"
//                   loading="lazy"
//                   priority={false}
//                 />
//               </div>
//               <div className="flex flex-col gap-4">
//                 <Input
//                   label={`Value 𝗔 Stump Length (cm)`}
//                   placeholder="20"
//                   required
//                   value={values.stump_length}
//                   onChange={handleChange('stump_length')}
//                   inVaild={!!errors.stump_length && !!touched.stump_length}
//                   error={errors.stump_length}
//                 />
//                 <Input
//                   placeholder="20"
//                   label="Value B Stump Size (cm)"
//                   value={values.stump_size}
//                   onChange={handleChange('stump_size')}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <SelectBox
//                   options={FORM_OPTIONS['foot_type'] ?? []}
//                   label="Foot Type"
//                   required={false}
//                   value={values.foot_type}
//                   onValueChange={handleChange('foot_type')}
//                 />
//                 <Input
//                   placeholder="65"
//                   label="Shoe Size (cm)"
//                   value={values.shoe_size}
//                   onChange={handleChange('shoe_size')}
//                   inVaild={!!errors.shoe_size && !!touched.shoe_size}
//                   error={errors.shoe_size}
//                 />
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <Input
//                   label="Flexion Angle(Deg)"
//                   placeholder="(Deg)"
//                   value={values.flexion_angle}
//                   onChange={handleChange('flexion_angle')}
//                   inVaild={!!errors.flexion_angle && !!touched.flexion_angle}
//                   error={errors.flexion_angle}
//                 />
//                 <Input
//                   label="Add/Abd Angle (Deg)"
//                   placeholder="(Deg)"
//                   value={values.abductionadduction_angle}
//                   onChange={handleChange('abductionadduction_angle')}
//                   inVaild={!!errors.abductionadduction_angle && !!touched.abductionadduction_angle}
//                   error={errors.abductionadduction_angle}
//                 />
//                 <SelectBox
//                   options={FORM_OPTIONS['stump_type'] ?? []}
//                   label="Stump Type"
//                   value={values.stump_type}
//                   onValueChange={handleChange('stump_type')}
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-3 gap-4 items-center ml-1">
//               <div>
//                 <Image
//                   src={'/assets/order-forms/bk-order/stumpcondtion.png'}
//                   alt="measurements"
//                   width={300}
//                   height={300}
//                   className="object-cover"
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <Textarea
//                 label="Stump Condition (please describe any specific condition of the stump example bony prominence etc.)"
//                 className="h-[100px] "
//                 value={values.stump_condition}
//                 onChange={handleChange('stump_condition')}
//               />
//               <Textarea
//                 label="Previous Prosthetic Experience (Please describe any previous experience of Prosthetics used, Make, Model,
//                        Type, Issues with it and expectation from the new Prosthetic socket)"
//                 className="h-[100px] "
//                 value={values.previous_prosthetic_experience}
//                 onChange={handleChange('previous_prosthetic_experience')}
//               />
//             </div>
//             <div className="divider"></div>
//             <h3 className="font-semibold text-lg ">File Upload</h3>
//             <div className="grid grid-cols-8 gap-4">
//               <div className="col-span-3">
//                 <div className="grid grid-cols-2">
//                   <p className="mb-1 text-base flex items-center">Upload Scan</p>
//                   <div className="w-[150px] ml-8">
//                     <SelectBox
//                       options={[
//                         { value: 'Left_Foot', label: 'Left Foot ' },
//                         { value: 'Right_Foot', label: 'Right Foot' },
//                         { value: 'Both', label: 'Both' },
//                       ]}
//                       value={values.foot_Amputation}
//                       onValueChange={handleChange('foot_Amputation')}
//                     />
//                   </div>
//                 </div>
//               </div>
//               {(values.foot_Amputation === 'Left_Foot' || values.foot_Amputation === 'Both') && (
//                 <div className="w-fit justify-center">
//                   <StlFilePicker
//                     label="Upload STL file (left foot)"
//                     buttonText="Left Foot"
//                     onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//                   />
//                 </div>
//               )}

//               {(values.foot_Amputation === 'Right_Foot' || values.foot_Amputation === 'Both') && (
//                 <div className="w-fit ml-2">
//                   <StlFilePicker
//                     label="Upload STL file (Rgiht foot)"
//                     buttonText="Right Foot"
//                     onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//                   />
//                 </div>
//               )}
//             </div>
//             <div className="grid grid-cols-8 gap-4">
//               <div className="col-span-3">
//                 <p className="mb-0 text-base ">Upload Addtional Files</p>
//                 <span className="mb-1 text-[12px] ">(Design / Rough calculations etc.)</span>
//               </div>

//               <div className="w-fit">
//                 <GenericFileViewer
//                   allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
//                   maxSizeMB={5}
//                   label="Select Image"
//                   buttonText="File 1"
//                   onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//                 />
//               </div>
//               <div className="w-fit ml-2">
//                 <GenericFileViewer
//                   allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
//                   maxSizeMB={5}
//                   label="Select Image"
//                   buttonText="File 2"
//                   onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//                 />
//               </div>
//             </div>
//             <div className="flex flex-col-6 gap-4">
//               <div className="col-span-3">
//                 <p className="mb-1 text-base ">Upload Link with Photos</p>
//                 <p className="mb-1 text-[12px] ">
//                   Upload in Google /Cloud drive and give relevant permission
//                 </p>
//               </div>
//               <div className="flex flex-col-6 gap-4">
//                 <Input
//                   placeholder="https://drive.google.com/..."
//                   className="mt-3 min-w-max ml-0 w-[410px]"
//                   value={values.images_link}
//                   onChange={handleChange('images_link')}
//                   inVaild={!!errors.images_link && !!touched.images_link}
//                   error={errors.images_link}
//                 />
//               </div>
//             </div>
//             <div className="divider"></div>
//             <div className="grid grid-cols-3 gap-4 items-end">
//               <div className="grid grid-cols-1 gap-4 ">
//                 <h3 className="font-semibold text-lg ">Scan Condition</h3>
//                 <SelectBox
//                   options={[
//                     { label: 'Direct Body', value: 'Direct_Body ' },
//                     { label: 'With Liner', value: 'With_Liner' },
//                   ]}
//                   label="Direct Body"
//                   required={true}
//                   value={values.direct_body}
//                   onValueChange={handleChange('direct_body')}
//                 />
//                 {values.direct_body === 'With_Liner' && (
//                   <SelectBox
//                     options={FORM_OPTIONS['locking_system'] ?? []}
//                     label="Adapter/Locking System"
//                     value={values.locking_system}
//                     onValueChange={handleChange('locking_system')}
//                   />
//                 )}
//               </div>
//               <div>
//                 <div className="grid grid-cols gap-4">
//                   {values.direct_body === 'With_Liner' && (
//                     <>
//                       <SelectBox
//                         options={FORM_OPTIONS['liner_thickness'] ?? []}
//                         label="Liner Thickness"
//                         value={values.liner_thickness}
//                         onValueChange={handleChange('liner_thickness')}
//                       />
//                       <div style={{ marginBottom: '55px' }}></div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="grid grid-cols gap-4">
//                 {values.direct_body === 'With_Liner' && (
//                   <>
//                     <SelectBox
//                       options={FORM_OPTIONS['liner_type'] ?? []}
//                       label="Liner Type"
//                       value={values.liner_type}
//                       onValueChange={handleChange('liner_type')}
//                     />
//                     <div style={{ marginBottom: '55px' }}></div>
//                   </>
//                 )}
//               </div>
//             </div>
//             <div className="divider"></div>
//             <div>
//               <p className="font-semibold my-4">Socket Design</p>
//               <p className="text-xs">
//                 Please specify the design considerations for each point from A to N. Use "-" to
//                 indicate Apply pressure (Reduction) and "+" to indicate Relief at the particular
//                 area. All values should be in millimetres (mm). For eg for applying reduction of 6 mm
//                 at Patela Tendon, please specify -6
//               </p>
//               <div className="flex justify-center p-2 mr-20">
//                 <Image
//                   src={'/assets/order-forms/bk-order/SocketDesign-BK.jpg'}
//                   alt="measurements"
//                   width={800}
//                   height={900}
//                   className="object-cover"
//                 />
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="mb-6">
//                   <p className="text-xs">
//                     {' '}
//                     <span className="text-sm"> Global Volume Reduction </span>
//                     <br /> (please specify the percentage reduction in Volume without reducing the
//                     length of the socket)
//                   </p>
//                 </div>
//                 <Input placeholder="Default Value:2%" type="text" />
//               </div>
//               <p className="text-xs">
//                 Please note as a general guideline our design algorithm will consider an overall 2%
//                 reduction in the stump dimensions to design the Socket. The below values for "+" and
//                 "-" should be done based on this assumption.
//               </p>
//             </div>
//             <div className="grid grid-cols-3 gap-10">
//               {values.socket_design_details.map((item, index) => (
//                 <div key={index} className="flex items-start gap-4 w-full">
//                   <p className="font-semibold">{item?.area}. </p>
//                   <div className="flex-1">
//                     <Input
//                       placeholder={'Default Value ' + item?.default_mm}
//                       label={item?.area_name + ' ' + ' (mm)'}
//                       value={item?.cpo_input_mm}
//                       name={`socket_design_details[${index}].cpo_input_mm`}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="sticky bottom-4 left-0 flex justify-end">
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
//               {isItemFetching ? (
//                 <span className="loader"></span>
//               ) : (
//                 <span>{selectedItem}</span>
//               )}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button onClick={() => setModelOpen(false)} variant={'outline'}>
//             Amend
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
