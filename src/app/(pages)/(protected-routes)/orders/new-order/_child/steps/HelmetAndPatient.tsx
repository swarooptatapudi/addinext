'use client';

import React, { useEffect, useRef, useState } from 'react';
import PatientPicker from '@/components/app/common/PatientPicker';
import { AddCranialPatientDialog } from '@/components/app/common/AddCranialPatientDialog';
import { Button } from '@/components/ui/button';
import { useGetOrderDetailsMutation } from '@/rtk-query/apis/orders';

export type HelmetType = 'ASP' | 'ASEP' | 'ASEPA';

const ITEM_CODE_TO_HELMET: Record<string, HelmetType> = {
  'ASH-P': 'ASP',
  'ASH-EP': 'ASEP',
  'ASH-EP-A': 'ASEPA',
};
const HELMET_LABELS: Record<HelmetType, string> = {
  ASP: 'AddiShield Pro',
  ASEP: 'AddiShield EpiPro',
  ASEPA: 'AddiShield EpiPro Active',
};

type Props = {
  values: any;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
  handleChange: any;
  shouldShowError: (field: string) => boolean;
  UI: any;
  onSaveAndNext?: (helmet: HelmetType, values: any) => void;

  orderId?: string;
  deviceTypeId?: string;
};

export default function HelmetAndPatient({
                                           values,
                                           errors,
                                           touched,
                                           setFieldValue,
                                           handleChange,
                                           shouldShowError,
                                           UI,
                                           onSaveAndNext,
                                           orderId,
                                           deviceTypeId,
                                         }: Props) {
  const { Input, SelectBox } = UI;

  const [helmetType, setHelmetType] = useState<HelmetType>('ASP');
  const [addOpen, setAddOpen] = useState(false);

  const [getOrderDetails] = useGetOrderDetailsMutation();
  const hydratedRef = useRef(false);

  /* ---------------- MAP FIELD HELPERS ---------------- */
  const mappedSetFieldValue = (field: string, val: any) => {
    switch (field) {
      case 'patient_name': {
        const full = (val ?? '').trim();
        setFieldValue('patient_name', full);
        if (full) {
          const parts = full.split(/\s+/);
          setFieldValue('first_name', parts[0] ?? '');
          setFieldValue('last_name', parts.slice(1).join(' ') || '');
        }
        break;
      }
      case 'mobile_no':
        setFieldValue('parent_mobile', val ?? '');
        break;
      case 'height':
        setFieldValue('height_cm', val ?? '');
        break;
      case 'weight':
        setFieldValue('weight_kg', val ?? '');
        break;
      default:
        setFieldValue(field, val ?? '');
    }
  };

  /* ---------------- HYDRATE FROM API ---------------- */
  useEffect(() => {
    if (!orderId || !deviceTypeId || hydratedRef.current) return;

    hydratedRef.current = true;

    const hydrate = async () => {
      const resp: any = await getOrderDetails({
        order_id: orderId,
        order_type: deviceTypeId,
      }).unwrap();

      const d = resp?.message?.data;
      if (!d) return;

      const helmet = ITEM_CODE_TO_HELMET[d.item_code] ?? 'ASP';

      setHelmetType(helmet);
      setFieldValue('helmet_type', helmet);

      setFieldValue(
        'patient_name',
        d.patient_name || `${d.first_name || ''} ${d.last_name || ''}`.trim()
      );
      setFieldValue('first_name', d.first_name || '');
      setFieldValue('last_name', d.last_name || '');
      setFieldValue('parent_name', d.parent_name || '');
      setFieldValue('parent_mobile', d.parent_mobile || '');
      setFieldValue('date_of_birth', d.date_of_birth || '');
      setFieldValue('gender', d.gender || '');
      setFieldValue('height_cm', d.height_cm || '');
      setFieldValue('weight_kg', d.weight_kg || '');
      setFieldValue('email', d.email || '');
      setFieldValue('clinic_name', d.clinic_name || '');
      setFieldValue('consultant', d.consultant || '');
    };

    hydrate();
  }, [orderId, deviceTypeId]);

  /* ---------------- KEEP FORM & UI IN SYNC ---------------- */
  useEffect(() => {
    if (values.helmet_type && values.helmet_type !== helmetType) {
      setHelmetType(values.helmet_type);
    }
  }, [values.helmet_type]);

  useEffect(() => {
    if (helmetType !== values.helmet_type) {
      setFieldValue('helmet_type', helmetType);
    }
  }, [helmetType]);

  /* ---------------- ADD PATIENT ---------------- */
  const handleNewPatientConfirm = (p: any) => {
    setAddOpen(false);
    if (!p) return;

    mappedSetFieldValue(
      'patient_name',
      p.patient_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
    );
    mappedSetFieldValue('first_name', p.first_name);
    mappedSetFieldValue('last_name', p.last_name);
    mappedSetFieldValue('parent_name', p.parent_name);
    mappedSetFieldValue('date_of_birth', p.date_of_birth);
    mappedSetFieldValue('height', p.height);
    mappedSetFieldValue('weight', p.weight);
    mappedSetFieldValue('mobile_no', p.mobile_no);
    mappedSetFieldValue('email', p.email);
    mappedSetFieldValue('gender', p.gender);
    mappedSetFieldValue('clinic_name', p.clinic_name);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <h2 className="font-semibold text-primary">Helmet Selection</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {(Object.keys(HELMET_LABELS) as HelmetType[]).map((h) => (
          <label
            key={h}
            className={`border p-4 rounded-lg cursor-pointer flex items-center gap-3
        ${helmetType === h ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
          >
            <input
              type="radio"
              name="helmetType"
              value={h}
              checked={helmetType === h}
              onChange={() => setHelmetType(h)}
            />
            <span className="font-medium">
        {HELMET_LABELS[h]}
      </span>
          </label>
        ))}
      </div>

      <h2 className="font-semibold text-primary">Patient Details</h2>

      <PatientPicker
        label="Patient Name"
        value={values.patient_name || ''}
        onChange={handleChange('patient_name')}
        setFieldValue={mappedSetFieldValue}
        required
        inVaild={shouldShowError('patient_name')}
        error={errors.patient_name}
      />

      <Button type="button" onClick={() => setAddOpen(true)}>
        Add New Patient
      </Button>

      <AddCranialPatientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onConfirm={handleNewPatientConfirm}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Input
          label="Patient First Name"
          value={values.first_name || ''}
          onChange={handleChange('first_name')}
          required
          inVaild={shouldShowError('first_name')}
          error={errors?.first_name}
          placeholder="First name"
        />
        <Input
          label="Patient Last Name"
          value={values.last_name || ''}
          onChange={handleChange('last_name')}
          required
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
          inVaild={shouldShowError('date_of_birth')}
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
          placeholder="+91xxxxxxxxxx"
          required
        />
        <Input
          label="Email"
          type="email"
          value={values.email || ''}
          onChange={handleChange('email')}
          required
          placeholder="name@example.com"
          error={errors?.email}
        />
        <Input
          label="Clinic / Hospital"
          value={values.clinic_name || ''}
          onChange={handleChange('clinic_name')}
          required
          placeholder="Clinic name"
        />
        <Input
          label="Consultant"
          value={values.consultant || ''}
          onChange={handleChange('consultant')}
          placeholder="Doctor name"
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={() => onSaveAndNext?.(helmetType, values)}>
          Save & Next
        </Button>
      </div>
    </div>
  );
}
