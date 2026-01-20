'use client';

import React, { useEffect, useRef, useState } from 'react';
import PatientPicker from '@/components/app/common/PatientPicker';
import { AddCranialPatientDialog } from '@/components/app/common/AddCranialPatientDialog';
import { Button } from '@/components/ui/button';

export default function ProductPatientStep({
                                             values,
                                             errors,
                                             touched,
                                             setFieldValue,
                                             handleChange,
                                             shouldShowError,
                                             UI,
                                           }: any) {
  const { Input, SelectBox } = UI;

  /* ---------------- Patient Picker Mapping ---------------- */
  const mappedSetFieldValue = (field: string, val: any) => {
    switch (field) {
      case 'patient_name':
        setFieldValue('patient_name', val || '');
        return;
      case 'first_name':
      case 'last_name':
      case 'parent_name':
      case 'date_of_birth':
      case 'gender':
      case 'email':
      case 'clinic_name':
        return setFieldValue(field, val || '');
      case 'mobile_no':
        return setFieldValue('parent_mobile', val || '');
      case 'weight':
        return setFieldValue('weight_kg', val || '');
      default:
        return;
    }
  };

  /* ---------------- Add Patient Dialog ---------------- */
  const [addOpen, setAddOpen] = useState(false);

  const handleNewPatientConfirm = (p: any) => {
    setAddOpen(false);
    mappedSetFieldValue('patient_name', p.patient_name);
    mappedSetFieldValue('first_name', p.first_name);
    mappedSetFieldValue('last_name', p.last_name);
    mappedSetFieldValue('parent_name', p.parent_name);
    mappedSetFieldValue('date_of_birth', p.date_of_birth);
    mappedSetFieldValue('gender', p.gender);
    mappedSetFieldValue('mobile_no', p.mobile_no);
    mappedSetFieldValue('email', p.email);
    mappedSetFieldValue('clinic_name', p.clinic_name);
    mappedSetFieldValue('weight', p.weight);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        Product & Patient Details
      </h2>

      {/* ---------------- Product Type ---------------- */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectBox
          label="Product Type *"
          value={values.product_type}
          onValueChange={(v: string) => setFieldValue('product_type', v)}
          options={[
            { label: 'AFO', value: 'AFO' },
            { label: 'DAFO', value: 'DAFO' },
          ]}
          inVaild={shouldShowError('product_type')}
          error={errors?.product_type}
        />

        <Input
          label="Age (Years) *"
          value={values.age || ''}
          onChange={handleChange('age')}
          type="number"
          inVaild={shouldShowError('age')}
          error={errors?.age}
        />
      </div>

      {/* ---------------- Patient Picker ---------------- */}
      <div className="mt-6 flex gap-3 items-end">
        <div className="flex-1">
          <PatientPicker
            label="Patient Name *"
            value={values.patient_name || ''}
            onChange={handleChange('patient_name')}
            setFieldValue={mappedSetFieldValue}
            inVaild={shouldShowError('patient_name')}
            error={errors?.patient_name}
          />
        </div>

        <Button type="button" onClick={() => setAddOpen(true)}>
          Add New Patient
        </Button>
      </div>

      <AddCranialPatientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onConfirm={handleNewPatientConfirm}
      />

      {/* ---------------- Patient Fields ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Input label="First Name *" value={values.first_name} onChange={handleChange('first_name')} />
        <Input label="Last Name *" value={values.last_name} onChange={handleChange('last_name')} />
        <Input label="Parent / Guardian" value={values.parent_name} onChange={handleChange('parent_name')} />
        <Input label="DOB" type="date" value={values.date_of_birth} onChange={handleChange('date_of_birth')} />
        <SelectBox
          label="Gender"
          value={values.gender}
          onValueChange={handleChange('gender')}
          options={[
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
          ]}
        />
        <Input label="Weight (kg)" value={values.weight_kg} onChange={handleChange('weight_kg')} />
        <Input label="Mobile *" value={values.parent_mobile} onChange={handleChange('parent_mobile')} />
        <Input label="Email" value={values.email} onChange={handleChange('email')} />
        <Input label="Clinic / Hospital" value={values.clinic_name} onChange={handleChange('clinic_name')} />
      </div>
    </div>
  );
}
