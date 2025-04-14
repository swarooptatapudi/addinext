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
import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';
import { useCreateOrderMutation } from '@/rtk-query/apis/orders';
import { USER } from '@/uttils/Types';
import { getFormOptionsObject } from '@/uttils/UttilFuncations';
import { Formik } from 'formik';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { AK_FORM_INITIAL_VALUES } from './constants';
import CustomTable from '@/components/app/common/CustomTable';
import PatientPicker from '@/components/app/common/PatientPicker';
import { Textarea } from '@/components/ui/textarea';
import { useGetItemNameByDetailsMutation } from '@/rtk-query/apis/products';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const validationSchema = Yup.object().shape({
  patient_name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Patient Name is required'),
  socket_type: Yup.string().required('This field is required'),
  design_variation: Yup.string().required('This field is required'),
  model_name: Yup.string().required('This field is required'),
  activity_level: Yup.string().required('This field is required'),
  stump_length: Yup.string().required('This field is required'),
  weight: Yup.string().required('This field is required'),
  date_of_birth: Yup.string().required('This field is required')
});

const initialValues = AK_FORM_INITIAL_VALUES;

export default function AkOrderForm({ item_type }: { item_type: string }): React.JSX.Element {
  const { data, isLoading: isFormOptionsLoading } = useGetFormSettingsQuery(item_type);
  const [createOrder, { isLoading: isOrderCreating, isSuccess }] = useCreateOrderMutation();
  const { user }: { user: USER } = useSelector((state: any) => state.userReducer);
  const [selectedItem, setSelectedItem] = React.useState<string>('');
  const [getItem, { isLoading: isItemFetching }] = useGetItemNameByDetailsMutation();
  const [formValues, setFormValues] = useState<any>(initialValues);
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
    payload.item_type = 'AK';
    payload.customer = user?.customer_id;
    payload.order_details = formValues;
    payload.item_code = selectedItem;

    createOrder(payload);
  };

  const OnSubmit = async (values: any) => {
    setFormValues(values);
    setModelOpen(true);

    const itemPayload = {
      item_type: 'AK',
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
            <h3 className="font-semibold text-lg">Basic Details</h3>
            {/* line 1 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid grid-cols-3 gap-2 col-span-2">
                <PatientPicker
                  value={values.patient_name}
                  onChange={handleChange('patient_name')}
                  setFieldValue={setFieldValue}
                  required
                  inVaild={!!errors.patient_name && !!touched.patient_name}
                  error={errors.patient_name}
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
              />
              <Input
                placeholder="Email"
                label="Email"
                value={values.email}
                onChange={handleChange('email')}
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
            </div>
            <div className="divider"></div>

            {/* line 2 */}
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

            {/* line 3 */}
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
            <div>
              <p className="font-semibold my-4">Measurements</p>
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="/assets/order-forms/ak-order/AK1.png"
                  alt="measurements"
                  width={400}
                  height={400}
                />
                <div>
                  <b>A</b>
                  <CustomTable
                    columns={[
                      { header: 'Circumference at (cm)', accessorKey: 'circumference_at_cm' },
                      { header: 'Standard Reduction (%)', accessorKey: 'standard_reduction_' },
                      { header: 'Desired Reduction (%)', accessorKey: 'desired_reduction_' }
                    ]}
                    data={values?.ak_socket_measurements?.map((item, index) => ({
                      id: index,
                      circumference_at_cm: item?.circumference_at_cm,
                      standard_reduction_: item?.standard_reduction_,
                      desired_reduction_: (
                        <Input
                          name={`ak_socket_measurements[${index}].desired_reduction_`}
                          value={item?.desired_reduction_}
                          onChange={handleChange}
                          placeholder="5cm"
                        />
                      )
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-2 mt-6">
                  <div className="grid grid-cols-2 gap-4 h-fit">
                    <Input
                      label="Stump Length (cm)"
                      boldKey="B"
                      value={values?.stump_length}
                      onChange={handleChange('stump_length')}
                      required
                      inVaild={!!errors.stump_length && !!touched.stump_length}
                      error={errors.stump_length}
                    />
                    <Input label="IT to MPT distance (cm)" boldKey="C" />
                    <Input label="MPT to floor distance (cm)" boldKey="D" />
                    <Input label="Waist Circumference (cm)" boldKey="E" />
                    <Input label="Foot Length (cm)" boldKey="F" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-fit">
                    <Input
                      label="Flexion Angle (°)"
                      value={values?.flexion_angle}
                      onChange={handleChange('flexion_angle')}
                    />
                    <Input
                      label="Abduction Angle (°)"
                      value={values?.abduction_angle}
                      onChange={handleChange('abduction_angle')}
                    />
                    <Input
                      label="Adduction Angle (°)"
                      value={values?.adduction_angle}
                      onChange={handleChange('adduction_angle')}
                    />
                    <Input
                      label="M-L (Vernier)"
                      value={values?.ml_vernier}
                      onChange={handleChange('ml_vernier')}
                    />
                    <Input
                      label="A-P (Vernier)"
                      value={values?.ap_vernier}
                      onChange={handleChange('ap_vernier')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider"></div>
            <div className="w-fit">
              <p className="mb-1 text-xs ">Upload Scan</p>

              <StlFilePicker />
            </div>
            <div className="divider"></div>

            <div className="grid grid-cols-2 gap-4">
              <SelectBox
                options={FORM_OPTIONS?.reason_for_amputation || []}
                label="Reason of Amputation"
                value={values.reason_for_amputation}
                onValueChange={handleChange('reason_for_amputation')}
              />
              <SelectBox
                options={FORM_OPTIONS?.medical_history || []}
                label="Medical History"
                value={values.medical_history}
                onValueChange={handleChange('medical_history')}
              />
            </div>
            <div className="divider"></div>
            <div className="grid grid-cols-2 gap-4">
              <SelectBox
                options={FORM_OPTIONS?.reason_for_amputation || []}
                label="Residual Limb Condition (Shape)"
                value={values.shape}
                onValueChange={handleChange('shape')}
              />
              <SelectBox
                options={FORM_OPTIONS?.skin_condition || []}
                label="Skin Condition"
                value={values.skin_condition}
                onValueChange={handleChange('skin_condition')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectBox
                options={FORM_OPTIONS?.locking_system || []}
                label="Locking System Proposed"
                value={values.locking_system}
                onValueChange={handleChange('locking_system')}
              />
              <SelectBox
                options={FORM_OPTIONS?.adapter_type || []}
                label="Adapter"
                value={values.adapter_type}
                onValueChange={handleChange('adapter_type')}
              />
            </div>
            <div className="divider"></div>
            <div>
              <p className="font-semibold my-4">Scan Condition</p>
              <div className="grid grid-cols-4 gap-4">
                <SelectBox
                  options={[{ value: 'Yes' }, { value: 'No' }]}
                  label="Direct Body"
                  required={true}
                />
                <Input label="With Liner (mm)" placeholder="3" />
                <SelectBox
                  options={FORM_OPTIONS?.liner_type || []}
                  label="Liner Type"
                  value={values.liner_type}
                  onValueChange={handleChange('liner_type')}
                  required={true}
                />
                <Input
                  label="Marking Sock (mm)"
                  placeholder="2"
                  value={values?.marking_sock_thickness}
                  onChange={handleChange('marking_sock_thickness')}
                />
              </div>
            </div>

            <div className="divider"></div>
            <div>
              <p className="font-semibold my-4">Socket Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-6">
                  <Image
                    src="/assets/order-forms/ak-order/AK2.png"
                    alt="measurements"
                    width={500}
                    height={500}
                  />
                  <div>
                    <Textarea
                      label="Other Customization Requirements"
                      value={values?.other_customization_requirements}
                      onChange={handleChange('other_customization_requirements')}
                      className="min-h-[300px]"
                      placeholder="Start writing here"
                    />
                  </div>
                </div>
                <div>
                  <CustomTable
                    columns={[
                      { header: 'S NO.', accessorKey: 's_no' },
                      { header: 'Point', accessorKey: 'point_name' },
                      { header: 'Pressure (mm)', accessorKey: 'pressure_mm' }
                    ]}
                    data={values?.table_zbib?.map((item, index) => ({
                      id: index,
                      s_no: index + 1,
                      point_name: item?.point_name,
                      pressure_mm: (
                        <Input
                          name={`ak_socket_measurements[${index}].pressure_mm`}
                          value={item?.pressure_mm}
                          onChange={handleChange}
                        />
                      )
                    }))}
                  />
                </div>
              </div>
            </div>
            <div className="divider"></div>

            <div className="sticky bottom-4 left-0 flex justify-end ">
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
