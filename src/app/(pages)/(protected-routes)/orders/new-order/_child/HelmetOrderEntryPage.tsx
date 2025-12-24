'use client';

import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSearchParams } from 'next/navigation';

import HelmetAndPatient, { HelmetType } from './steps/HelmetAndPatient';
import ASPOrderForm from './ASPOrderForm';
import ASEPOrderForm from './ASEPOrderForm';
import ASEPAOrderForm from './ASEPAOrderForm';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectBox } from '@/components/ui/selectbox';
import { Textarea } from '@/components/ui/textarea';

const PatientSchema = Yup.object({
  patient_name: Yup.string().required(),
  first_name: Yup.string().required(),
  last_name: Yup.string().required(),
  parent_mobile: Yup.string().required(),
  date_of_birth: Yup.string().required(),
});

export default function HelmetOrderEntryPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') ?? undefined;
  const deviceTypeId = searchParams.get('deviceType') ?? undefined;

  const [helmet, setHelmet] = useState<HelmetType | null>(null);
  const [patientSeed, setPatientSeed] = useState<any>(null);

  if (!patientSeed) {
    return (
      <Formik
        initialValues={{
          helmet_type: '',
          patient_name: '',
          first_name: '',
          last_name: '',
          parent_name: '',
          parent_mobile: '',
          date_of_birth: '',
          gender: '',
          height_cm: '',
          weight_kg: '',
          email: '',
          clinic_name: '',
          consultant: '',
        }}
        validationSchema={PatientSchema}
        onSubmit={() => {}}
      >
        {(formik) => {
          const { errors, touched } = formik;

          const shouldShowError = (field: string) =>
            !!(touched as any)[field] && !!(errors as any)[field];

          return (
            <HelmetAndPatient
              {...formik}
              orderId={orderId}
              deviceTypeId={deviceTypeId}
              shouldShowError={shouldShowError}
              UI={{ Input, Label, SelectBox, Textarea }}
              onSaveAndNext={(h, values) => {
                setHelmet(h);
                setPatientSeed(values);
              }}
            />
          );
        }}
      </Formik>
    );
  }

  switch (helmet) {
    case 'ASP':
      return <ASPOrderForm initialPatient={patientSeed} />;
    case 'ASEP':
      return <ASEPOrderForm initialPatient={patientSeed} />;
    case 'ASEPA':
      return <ASEPAOrderForm initialPatient={patientSeed} />;
    default:
      return null;
  }
}
