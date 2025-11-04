'use client';
import React, { useEffect, useRef, useState } from 'react';
import PatientPicker from '@/components/app/common/PatientPicker';
import { AddCranialPatientDialog } from '@/components/app/common/AddCranialPatientDialog';
import { Button } from '@/components/ui/button';

export default function PatientDetails({
                                         values,
                                         errors,
                                         touched,
                                         setFieldValue,
                                         handleChange,
                                         shouldShowError,
                                         UI
                                       }: any) {
  const { Input, Label, SelectBox, DatePicker, Textarea } = UI;

  // --- map PatientPicker field names -> Cranial form keys + derive names from patient_name ---
  const mappedSetFieldValue = (field: string, val: any) => {
    switch (field) {
      case 'patient_name': {
        const full = (val ?? '').toString().trim();
        // always set patient_name
        setFieldValue('patient_name', full);
        // derive first/last if possible
        if (full) {
          const parts = full.split(/\s+/);
          const first = parts[0] ?? '';
          const last = parts.slice(1).join(' ') || '';
          setFieldValue('first_name', first);
          setFieldValue('last_name', last);
        }
        return;
      }
      case 'mobile_no':
        return setFieldValue('parent_mobile', val ?? '');
      case 'height':
        return setFieldValue('height_cm', val ?? '');
      case 'weight':
        return setFieldValue('weight_kg', val ?? '');
      // direct mappings we actually use:
      case 'first_name':
      case 'last_name':
      case 'parent_name':
      case 'date_of_birth':
      case 'email':
      case 'gender':
      case 'clinic_name':
        return setFieldValue(field, val ?? '');
      // ignore anything else safely
      default:
        return;
    }
  };

  // --- Add New Patient dialog control ---
  const [addOpen, setAddOpen] = useState(false);
  const handleNewPatientConfirm = (p: any) => {
    setAddOpen(false);
    // Fill patient_name (and derive first/last) if available
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

  // --- Auto-fill patient_name from First/Last when user types them ---
  const prevFLRef = useRef<string>('');
  useEffect(() => {
    const full = `${values.first_name ?? ''}${values.last_name ? ` ${values.last_name}` : ''}`.trim();
    const prevFL = prevFLRef.current;
    // only update patient_name if first/last produced a different full name
    if (full && full !== values.patient_name) {
      setFieldValue('patient_name', full);
    }
    prevFLRef.current = full;
  }, [values.first_name, values.last_name]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Patient Details</h2>

      {/* PatientPicker + Add New Patient */}
      <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <PatientPicker
            label="Patient Name"
            placeholder="Patient Name"
            value={values.patient_name || ''}
            onChange={handleChange('patient_name')}
            setFieldValue={mappedSetFieldValue}   // <<< intercepts & maps fields + derives names
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

      {/* Manual fields */}
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
          placeholder="Last name"
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
        />
        <Input
          label="Mobile"
          value={values.parent_mobile || ''}
          onChange={handleChange('parent_mobile')}
          placeholder="10-digit"
        />
        <Input
          label="Email"
          type="email"
          value={values.email || ''}
          onChange={handleChange('email')}
          placeholder="name@example.com"
          error={errors?.email}
        />
        <Input
          label="Clinic / Hospital"
          value={values.clinic_name || ''}
          onChange={handleChange('clinic_name')}
          placeholder="Clinic name"
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
