'use client';
import StlFilePicker from '@/components/app/common/StlPreviewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

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
import * as Yup from 'yup';
import { BK_FORM_INITIAL_VALUES } from './constants';
import PatientPicker from '@/components/app/common/PatientPicker';
import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';

const validationSchema = Yup.object().shape({
  patient_name: Yup.string()
    .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
    .max(FORMIK_ERRORS.MAX_50.VALUE ,FORMIK_ERRORS.MAX_50.MESSAGE)
    .required(FORMIK_ERRORS.REQUIRED),
  socket_type: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  design_variation: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  model_name: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  activity_level: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  stump_length: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  weight: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  date_of_birth: Yup.string().required(FORMIK_ERRORS.REQUIRED),
  email: Yup.string()
      .matches(FORMIK_ERRORS.INVALID_EMAIL.VALUE,FORMIK_ERRORS.INVALID_EMAIL.MESSAGE)
      .max(FORMIK_ERRORS.MAX_320.VALUE, FORMIK_ERRORS.MAX_320.MESSAGE)
      .required(FORMIK_ERRORS.REQUIRED),
  mobile_no: Yup.string()
      .matches(FORMIK_ERRORS.MOBILE_NUMBER.VALUE,FORMIK_ERRORS.MOBILE_NUMBER.MESSAGE)
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

export default function BkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
  const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
  const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  const [selectedItem, setSelectedItem] = React.useState<string>('');  
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
  const [formValues, setFormValues] = useState<BK_FORM_TYPE>(initialValues);
  const [modelOpen, setModelOpen] = useState(false);
  const router = useRouter();

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
      weight: values.weight 
    };  
    const itemCode = await getItemCodeByValues(itemPayload);
    setSelectedItem(itemCode);
  };

  const getItemCodeByValues = async (payload: any) => {
    const res: any = await getItem(payload);
    return res?.data?.item_code;
  };

  // after order success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Order created successfully');
      setSelectedItem('');
      setFormValues(initialValues);
      router.push('/orders');
    }
  }, [isOrderCreating, isSuccess]);

  return (
    <div className="pb-16 relative">
      <Formik initialValues={initialValues} onSubmit={OnSubmit} validationSchema={validationSchema}>
        {({ values, handleChange, handleSubmit, errors, touched, setFieldValue }) => (
          <div className="flex flex-col gap-6">
            <WatchFieldReset />

            <h3 className="font-semibold text-lg">Basic Details</h3>
            {/* line 1 */}
            <div className="grid grid-cols-3 gap-4">
              {/* <Input
                placeholder="Patient Name"
                label="Patient Name"
                value={values.patient_name}
                onChange={handleChange('patient_name')}
                inVaild={!!errors.patient_name && !!touched.patient_name}
                error={errors.patient_name}
                required
              /> */}
              <PatientPicker
                value={values.patient_name}
                onChange={handleChange('patient_name')}
                setFieldValue={setFieldValue}
                required
                inVaild={!!errors.patient_name && !!touched.patient_name}
                error={errors.patient_name}
              />
              <div className="grid grid-cols-3 gap-2 col-span-2">
                <Input
                  placeholder="Patient Name"
                  label="Date of Birth"
                  type="date"
                  value={values.date_of_birth}
                  onChange={handleChange('date_of_birth')}
                  required
                  inVaild={!!errors.date_of_birth && !!touched.date_of_birth}
                  error={errors.date_of_birth}
                />
                <Input
                  placeholder="65"
                  label="Height (feet)"
                  value={values.height}
                  onChange={handleChange('height')}
                />
                <Input
                  placeholder="50"
                  label="Weight (kg)"
                  value={values.weight}
                  onChange={handleChange('weight')}
                  required
                  inVaild={!!errors.weight && !!touched.weight}
                  error={errors.weight}
                />
              </div>
              <Input
                placeholder="10 digit phone number"
                label="Mobile Number"
                value={values.mobile_no}
                onChange={handleChange('mobile_no')}
                inVaild={!!errors.mobile_no && !!touched.mobile_no}
                error={errors.mobile_no}
              />
              <Input
                placeholder="Email"
                label="Email"
                value={values.email}
                onChange={handleChange('email')}
                inVaild={!!errors.email && !!touched.email}
                error={errors.email}
              />
              <SelectBox
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' }
                ]}
                label="Gender"
                required={true}
                value={values.gender}
                onValueChange={handleChange('gender')}
                inVaild={!!errors.gender && !!touched.gender}
                error={errors.gender}
              />
              {/* <DatePicker
                  label="Date of Birth"
                  value={values.date_of_birth}
                  onChange={(date: any) => setFieldValue('date_of_birth', date)}
                /> */}
            </div>
            <div className="divider"></div>

            {/* line2 */}
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
                inVaild={!!errors.activity_level && !!touched.activity_level}
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
                inVaild={!!errors.socket_type && !!touched.socket_type}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectBox
                  options={FORM_OPTIONS[values.socket_type + '_' + 'design_variation'] || []}
                  label="Design Variation"
                  value={values.design_variation}
                  onValueChange={handleChange('design_variation')}
                  inVaild={!!errors.design_variation && !!touched.design_variation}
                  required
                />
                <SelectBox
                  options={FORM_OPTIONS[values.socket_type + '_' + 'model_name'] || []}
                  label="Model"
                  value={values.model_name}
                  onValueChange={handleChange('model_name')}
                  inVaild={!!errors.model_name && !!touched.model_name}
                  required
                />
              </div>
            </div>

            <div className="divider"></div>

            <h3 className="font-semibold text-lg ">Measurements</h3>
            {/* measurements and images will go here */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <Image
                  src={'/assets/order-forms/bk-order/BK1.png'}
                  alt="measurements"
                  width={300}
                  height={300}
                  className="object-cover"
                />
              </div>
            <div className="flex flex-col gap-4">
              <Input
               label={`Value 𝗔 Stump Length (cm)`}
               placeholder="20"
               required
               value={values.stump_length}
               onChange={handleChange('stump_length')}
               inVaild={!!errors.stump_length && !!touched.stump_length}
               error={errors.stump_length}
               />
                <Input
                  placeholder="20"
                  label="Value B Stump Size (cm)"
                  value={values.stump_size}
                  onChange={handleChange('stump_size')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <SelectBox
                options={[
                  { value: 'Single_Axis', label: 'Single Axis' },
                  { value: 'Multi_Axis', label: 'Multi Axis' },
                  { value: 'Hydraulic', label: 'Hydraulic' },
                  { value: 'Sach_Foot', label: 'SACH Foot' },
                  { value: 'Carbon', label: 'Carbon' },
                  { value: 'Energy', label: 'Energy' },
                ]}
                  // options={FORM_OPTIONS['foot_type'] ?? []}
                  label="Foot Type"
                  required={false}
                  value={values.foot_type}
                  onValueChange={handleChange('foot_type')}
                />
                <Input
                  placeholder="65"
                  label="Shoe Size (cm)"
                  value={values.shoe_size}
                  onChange={handleChange('shoe_size')}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Flexion Angle"
                  value={values.flexion_angle}
                  onChange={handleChange('flexion_angle')}
                />
                <Input
                  label="Add/Abd Angle"
                  value={values.abductionadduction_angle}
                  onChange={handleChange('abductionadduction_angle')}
                />
                <SelectBox
                  options={FORM_OPTIONS['stump_type'] ?? []}
                  label="Stump Type"
                  value={values.stump_type}
                  onValueChange={handleChange('stump_type')}
                />
              </div>
            </div>
            <div className="divider"></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="w-fit">
                <p className="mb-1 text-xs ">Upload Scan</p>
                <StlFilePicker />
              </div>
              <div className="w-fit">
                <p className="mb-1 text-xs ">Any Other Files</p>
                <StlFilePicker />
              </div>
            </div>
            <div className="w-full">
              <Input placeholder="Images Link" label="Any Upuloaded Images Link (optional)" />
            </div>

            <div className="divider"></div>

            <div className="grid grid-cols-2 gap-4">
              <Textarea
                label="Stump Condition"
                className="h-[100px] "
                value={values.stump_condition}
                onChange={handleChange('stump_condition')}
              />
              <Textarea
                label="Previous Prosthetic Experience"
                className="h-[100px] "
                value={values.previous_prosthetic_experience}
                onChange={handleChange('previous_prosthetic_experience')}
              />
            </div>

          

            <div className="divider"></div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="grid grid-cols-1 gap-4">
                <SelectBox
                  options={FORM_OPTIONS['locking_system'] ?? []}
                  label="Locking System / Adapter"
                  required={true}
                  value={values.locking_system}
                  onValueChange={handleChange('locking_system')}
                />
                <SelectBox
                  options={FORM_OPTIONS?.adapter_type || []}
                  label="Adapter Type"
                  value={values.adapter_type}
                  onValueChange={handleChange('adapter_type')}
                />
                {/* <Textarea
                  label="Adapter : 4 Hole Pyramid"
                  value={values.adapter_type}
                  onChange={handleChange('adapter_type')}
                /> */}
              </div>
              <div>
                <p className="font-semibold my-4">Scan Condition</p>
                <div className="grid grid-cols-2 gap-4">
                  <SelectBox
                    options={[{ value: 'Yes' }, { value: 'No' }]}
                    label="Direct Body"
                    required={true}
                    value={values.direct_body}
                    onValueChange={handleChange('direct_body')}
                  />
                  <Input label="With Liner (mm)" placeholder="3" />
                  <SelectBox
                    options={FORM_OPTIONS['liner_type'] ?? []}
                    label="Liner Type"
                    required={true}
                    value={values.liner_type}
                    onValueChange={handleChange('liner_type')}
                  />
                  <Input label="Marking Sock (mm)" placeholder="2" />
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold my-4">Socket Design</p>
              <p className="text-xs">
                For the attention of CPO: Please specify the design considerations for each point
                from A to N. Use “+” to indicate pressure sensitive areas where relief is required
                and “ - ” to indicate pressure tolerant areas where tension needs to be applied.
                Ensure that all measurements are provided in millimetres (mm).
              </p>
              <div className="flex justify-center">
                <Image
                  src={'/assets/order-forms/bk-order/BK2.png'}
                  alt="measurements"
                  width={500}
                  height={500}
                  className="object-cover"
                />
              </div>
              <p className="text-xs">
                Please note as a general guideline our design algorithm will consider an overall 2%
                reduction in the stump dimensions to design the Socket. The below values for “+”
                and”-” should be done based on this assumption.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-10">
              {values.socket_design_details.map((item, index) => (
                <div key={index} className="flex items-start gap-4 w-full">
                  <p className="font-semibold">{item?.area}. </p>
                  <div className="flex-1">
                    <Input
                      placeholder={'Default Value ' + item?.default_mm}
                      label={item?.area_name + ' ' + 'CPO Input (mm)'}
                      value={item?.cpo_input_mm}
                      name={`socket_design_details[${index}].cpo_input_mm`}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-4 left-0 flex justify-end">
              <Button className="shadow-2xl" type="button" onClick={() => handleSubmit()}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </Formik>

      <Dialog open={modelOpen} onOpenChange={setModelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
          </DialogHeader>

          <div className="text-xs">
            <div className="flex justify-between items-center border-t p-2">
              <span>Socket Type</span>
              <span>{formValues.socket_type}</span>
            </div>
            <div className="flex justify-between items-center border-t p-2">
              <span>Design Variation</span>
              <span>{formValues.design_variation}</span>
            </div>
            <div className="flex justify-between items-center border-t p-2">
              <span>Modal</span>
              <span>{formValues.model_name}</span>
            </div>
            <div className="flex justify-between items-center border-y p-2">
              <span>Activity Level</span>
              <span>{formValues.activity_level}</span>
            </div>
            <div className="flex justify-between items-center border-b p-2 font-semibold">
              <span>Item Code</span>
              {isItemFetching ? <span className="loader"></span> : <span>{selectedItem}</span>}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setModelOpen(false)} variant={'outline'}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={isItemFetching || isOrderCreating || !selectedItem}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
