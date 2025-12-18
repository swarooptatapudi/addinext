'use client';

import React, { useEffect, useRef, useState } from 'react';
import PatientPicker from '@/components/app/common/PatientPicker';
import { AddCranialPatientDialog } from '@/components/app/common/AddCranialPatientDialog';
import { Button } from '@/components/ui/button';

export default function HkafoPatientDetails({
  values,
  errors,
  touched: _touched,
  setFieldValue,
  handleChange,
  shouldShowError,
  UI,
}: any) {
  const { Input, SelectBox } = UI;

  const mappedSetFieldValue = (field: string, val: any) => {
    switch (field) {
      case 'patient_name': {
        const full = (val ?? '').toString().trim();
        setFieldValue('patient_name', full, true);
        if (full) {
          const parts = full.split(/\s+/);
          const first = parts[0] ?? '';
          const last = parts.slice(1).join(' ') || '';
          setFieldValue('first_name', first, true);
          setFieldValue('last_name', last, true);
        }
        return;
      }
      case 'mobile_no':
        return setFieldValue('parent_mobile', val ?? '', true);
      case 'height':
        return setFieldValue('height_cm', val ?? '', true);
      case 'weight':
        return setFieldValue('weight_kg', val ?? '', true);
      case 'first_name':
      case 'last_name':
      case 'parent_name':
      case 'date_of_birth':
      case 'email':
      case 'gender':
      case 'clinic_name':
        return setFieldValue(field, val ?? '', true);
      default:
        return;
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const handleNewPatientConfirm = (p: any) => {
    setAddOpen(false);
    const pn = p?.patient_name || `${p?.first_name ?? ''} ${p?.last_name ?? ''}`.trim();
    if (pn) mappedSetFieldValue('patient_name', pn);
    if (p?.first_name) mappedSetFieldValue('first_name', p.first_name);
    if (p?.last_name) mappedSetFieldValue('last_name', p.last_name);
    if (p?.parent_name) mappedSetFieldValue('parent_name', p.parent_name);

    mappedSetFieldValue('date_of_birth', p?.date_of_birth);
    mappedSetFieldValue('height', p?.height);
    mappedSetFieldValue('weight', p?.weight);
    mappedSetFieldValue('mobile_no', p?.mobile_no);
    mappedSetFieldValue('email', p?.email);
    mappedSetFieldValue('gender', p?.gender);
    mappedSetFieldValue('clinic_name', p?.clinic_name);
  };

  const prevFLRef = useRef<string>('');
  useEffect(() => {
    const full = `${values.first_name ?? ''}${values.last_name ? ` ${values.last_name}` : ''}`.trim();
    const prevFL = prevFLRef.current;
    if (full && full !== values.patient_name) {
      setFieldValue('patient_name', full);
    }
    prevFLRef.current = full;
  }, [values.first_name, values.last_name]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Patient Details</h2>

      <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <PatientPicker
            label="Patient Name"
            placeholder="Patient Name"
            value={values.patient_name || ''}
            onChange={handleChange('patient_name')}
            setFieldValue={mappedSetFieldValue}
            required
            inVaild={shouldShowError('patient_name', true)}
            error={errors.patient_name}
          />
        </div>

        <div className="md:ml-auto">
          <Button type="button" onClick={() => setAddOpen(true)}>
            Add New Patient
          </Button>
        </div>
      </div>

      <AddCranialPatientDialog open={addOpen} onOpenChange={setAddOpen} onConfirm={handleNewPatientConfirm} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Input
          label="Patient First Name"
          value={values.first_name || ''}
          onChange={handleChange('first_name')}
          required
          inVaild={shouldShowError('first_name', true)}
          error={errors?.first_name}
          placeholder="First name"
        />
        <Input
          label="Patient Last Name"
          value={values.last_name || ''}
          onChange={handleChange('last_name')}
          required
          placeholder="Last name"
          inVaild={shouldShowError('last_name', true)}
          error={errors?.last_name}
        />
        <Input
          label="Parent / Guardian"
          value={values.parent_name || ''}
          onChange={handleChange('parent_name')}
          placeholder="Parent or Guardian"
        />
        <Input
          label="Date of Birth"
          type="date"
          value={values.date_of_birth || ''}
          onChange={handleChange('date_of_birth')}
          required
          inVaild={shouldShowError('date_of_birth', true)}
          error={errors?.date_of_birth}
          max={(() => {
            const now = new Date();
            const d = new Date(now);
            d.setMonth(d.getMonth() - 18);
            const year = d.getFullYear();
            const month = `${d.getMonth() + 1}`.padStart(2, '0');
            const day = `${d.getDate()}`.padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()}
        />
        <SelectBox
          options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
          ]}
          label="Gender"
          value={values.gender ?? ''}
          onValueChange={handleChange('gender')}
          inVaild={shouldShowError('gender')}
          error={errors?.gender}
        />
        <Input
          label="Height (cm)"
          value={values.height_cm || ''}
          onChange={handleChange('height_cm')}
          placeholder="cm"
        />
        <Input
          label="Weight (kg)"
          value={values.weight_kg || ''}
          onChange={handleChange('weight_kg')}
          placeholder="kg"
          required
          inVaild={shouldShowError('weight_kg', true)}
          error={errors?.weight_kg}
        />
        <Input
          label="Mobile"
          value={values.parent_mobile || ''}
          onChange={handleChange('parent_mobile')}
          placeholder="+91xxxxxxxxxx"
          required
          inVaild={shouldShowError('parent_mobile', true)}
          error={errors?.parent_mobile}
        />
        <Input
          label="Email"
          type="email"
          value={values.email || ''}
          onChange={handleChange('email')}
          required
          placeholder="name@example.com"
          inVaild={shouldShowError('email', true)}
          error={errors?.email}
        />
        <Input
          label="Clinic / Hospital"
          value={values.clinic_name || ''}
          onChange={handleChange('clinic_name')}
          required
          placeholder="Clinic name"
          inVaild={shouldShowError('clinic_name', true)}
          error={errors?.clinic_name}
        />
        <Input
          label="Consultant"
          value={values.consultant || ''}
          onChange={handleChange('consultant')}
          placeholder="Doctor name"
        />
      </div>
    </div>
  );
}
