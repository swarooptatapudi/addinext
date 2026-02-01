'use client';

import React, { useEffect, useRef, useState } from 'react';

import PatientPicker from '@/components/app/common/PatientPicker';
import { AddCranialPatientDialog } from '@/components/app/common/AddCranialPatientDialog';
import { Button } from '@/components/ui/button';

export default function AfoPatientDetails({
                                            values,
                                            errors,
                                            touched,
                                            setFieldValue,
                                            handleChange,
                                            shouldShowError,
                                            UI,
                                          }: any) {
  const { Input, SelectBox } = UI;

  /* ============================
      FIELD MAPPING
  ============================ */

  const mappedSetFieldValue = (field: string, val: any) => {
    switch (field) {
      case 'patient_name': {
        const full = (val ?? '').toString().trim();

        setFieldValue('patient_name', full);

        if (full) {
          const parts = full.split(/\s+/);
          setFieldValue('first_name', parts[0] || '');
          setFieldValue('last_name', parts.slice(1).join(' ') || '');
        }
        return;
      }

      case 'mobile_no':
        return setFieldValue('parent_mobile', val ?? '');

      case 'height':
        return setFieldValue('height_cm', val ?? '');

      case 'weight':
        return setFieldValue('weight_kg', val ?? '');

      case 'first_name':
      case 'last_name':
      case 'parent_name':
      case 'date_of_birth':
      case 'email':
      case 'gender':
      case 'clinic_name':
        return setFieldValue(field, val ?? '');

      default:
        return;
    }
  };

  /* ============================
      ADD PATIENT
  ============================ */

  const [addOpen, setAddOpen] = useState(false);

  const handleNewPatientConfirm = (p: any) => {
    setAddOpen(false);

    const name =
      p?.patient_name ||
      `${p?.first_name || ''} ${p?.last_name || ''}`.trim();

    if (name) mappedSetFieldValue('patient_name', name);

    mappedSetFieldValue('first_name', p?.first_name);
    mappedSetFieldValue('last_name', p?.last_name);
    mappedSetFieldValue('parent_name', p?.parent_name);
    mappedSetFieldValue('date_of_birth', p?.date_of_birth);
    mappedSetFieldValue('height', p?.height);
    mappedSetFieldValue('weight', p?.weight);
    mappedSetFieldValue('mobile_no', p?.mobile_no);
    mappedSetFieldValue('email', p?.email);
    mappedSetFieldValue('gender', p?.gender);
    mappedSetFieldValue('clinic_name', p?.clinic_name);
  };

  /* ============================
      AUTO FULL NAME
  ============================ */

  const prevRef = useRef('');

  useEffect(() => {
    const full = `${values.first_name || ''}${
      values.last_name ? ` ${values.last_name}` : ''
    }`.trim();

    if (full && full !== prevRef.current) {
      setFieldValue('patient_name', full);
    }

    prevRef.current = full;
  }, [values.first_name, values.last_name]);

  /* ============================
      RENDER
  ============================ */

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">

      {/* ======================================================
            PRODUCT TYPE
      ====================================================== */}

      <div className="mb-8">

        <h2 className="text-lg font-semibold text-primary border-b pb-2">
          Product Type <span className="text-red-500">*</span>
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-4">

          {/* AFO */}
          <div
            onClick={() => setFieldValue('product_type', 'AFO')}
            className={`
              cursor-pointer rounded-lg border p-4 text-center transition
              ${
              values.product_type === 'AFO'
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary'
            }
            `}
          >
            <div className="font-semibold">AFO</div>
          </div>

          {/* DAFO */}
          <div
            onClick={() => setFieldValue('product_type', 'DAFO')}
            className={`
              cursor-pointer rounded-lg border p-4 text-center transition
              ${
              values.product_type === 'DAFO'
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary'
            }
            `}
          >
            <div className="font-semibold">DAFO</div>
          </div>

        </div>

        {/* Product Type Error */}
        {shouldShowError('product_type') && (
          <p className="text-sm text-red-500 mt-2">
            {errors.product_type}
          </p>
        )}

      </div>

      {/* ======================================================
            PATIENT DETAILS
      ====================================================== */}

      <h2 className="text-lg font-semibold text-primary border-b pb-2">
        Patient Details
      </h2>

      {/* ================= PATIENT PICKER ================= */}

      <div className="mt-4 flex flex-col md:flex-row gap-3 items-end">

        <div className="flex-1">

          <PatientPicker
            label="Patient Name"
            placeholder="Select Patient"
            value={values.patient_name || ''}
            onChange={handleChange('patient_name')}
            setFieldValue={mappedSetFieldValue}
            required
            inVaild={shouldShowError('patient_name')}
            error={errors.patient_name}
          />

        </div>

        <Button
          type="button"
          onClick={() => setAddOpen(true)}
        >
          Add New Patient
        </Button>

      </div>

      <AddCranialPatientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onConfirm={handleNewPatientConfirm}
      />

      {/* ================= FORM ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

        <Input
          label="First Name"
          value={values.first_name || ''}
          onChange={handleChange('first_name')}
          required
          inVaild={shouldShowError('first_name')}
          error={errors.first_name}
        />

        <Input
          label="Last Name"
          value={values.last_name || ''}
          onChange={handleChange('last_name')}
          required
          inVaild={shouldShowError('last_name')}
          error={errors.last_name}
        />

        <Input
          label="Parent / Guardian"
          value={values.parent_name || ''}
          onChange={handleChange('parent_name')}
        />

        <Input
          type="date"
          label="Date of Birth"
          value={values.date_of_birth || ''}
          onChange={handleChange('date_of_birth')}
          required
          inVaild={shouldShowError('date_of_birth')}
          error={errors.date_of_birth}
        />

        <SelectBox
          label="Gender"
          value={values.gender || ''}
          options={[
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
          ]}
          onValueChange={handleChange('gender')}
          inVaild={shouldShowError('gender')}
          error={errors.gender}
        />

        <Input
          label="Height (cm)"
          value={values.height_cm || ''}
          onChange={handleChange('height_cm')}
        />

        <Input
          label="Weight (kg)"
          value={values.weight_kg || ''}
          onChange={handleChange('weight_kg')}
        />

        <Input
          label="Mobile"
          value={values.parent_mobile || ''}
          onChange={handleChange('parent_mobile')}
          required
          inVaild={shouldShowError('parent_mobile')}
          error={errors.parent_mobile}
        />

        <Input
          type="email"
          label="Email"
          value={values.email || ''}
          onChange={handleChange('email')}
          required
          inVaild={shouldShowError('email')}
          error={errors.email}
        />

        <Input
          label="Clinic / Hospital"
          value={values.clinic_name || ''}
          onChange={handleChange('clinic_name')}
          required
          inVaild={shouldShowError('clinic_name')}
          error={errors.clinic_name}
        />

        <Input
          label="Consultant"
          value={values.consultant || ''}
          onChange={handleChange('consultant')}
        />

      </div>

    </div>
  );
}
