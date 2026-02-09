'use client';

import React from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';

export default function AFOMeasurement({
                                         values = {},
                                         errors = {},
                                         touched = {},
                                         shouldShowError = () => false,
                                         handleChange = () => {},
                                         setFieldValue,
                                         afoOptions = [],
                                         setAnkleValue,
                                       }: any) {
  const type = values?.product_type || 'AFO';

  /* ---------------------------------- */
  const handleAnkleChange = (e: any) => {
    handleChange('ankle_circumference_cm')(e);

    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setAnkleValue(val);
    }
  };
  /* ---------------------------------- */

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ================= LEFT FORM ================= */}
      <div className="space-y-4 bg-white border rounded-lg p-5 shadow-sm">

        <h3 className="font-semibold text-primary border-b pb-2">
          Measurement Details ({type})
        </h3>

        {/* Heel */}
        <Input
          label="Heel to Sulcus (cm)"
          value={values.heel_to_sulcus_cm || ''}
          onChange={handleChange('heel_to_sulcus_cm')}
          required
          inVaild={shouldShowError('heel_to_sulcus_cm')}
          error={errors?.heel_to_sulcus_cm}
        />

        <Input
          label="Heel to Toe (cm)"
          value={values.heel_to_toe_cm || ''}
          onChange={handleChange('heel_to_toe_cm')}
          required
          inVaild={shouldShowError('heel_to_toe_cm')}
          error={errors?.heel_to_toe_cm}
        />

        {/* Fibula */}
        <Input
          label="Fibula Head Circumference (cm)"
          value={values.fibula_head_circumference_cm || ''}
          onChange={handleChange('fibula_head_circumference_cm')}
          required
          inVaild={shouldShowError('fibula_head_circumference_cm')}
          error={errors?.fibula_head_circumference_cm}
        />

        <Input
          label="Fibula Head ML (cm)"
          value={values.fibula_head_ml_cm || ''}
          onChange={handleChange('fibula_head_ml_cm')}
          required
          inVaild={shouldShowError('fibula_head_ml_cm')}
          error={errors?.fibula_head_ml_cm}
        />

        <Input
          label="Fibula to Ankle Height (cm)"
          value={values.fibula_head_to_ankle_cm || ''}
          onChange={handleChange('fibula_head_to_ankle_cm')}
          required
          inVaild={shouldShowError('fibula_head_to_ankle_cm')}
          error={errors?.fibula_head_to_ankle_cm}
        />

        {/* Calf */}
        <Input
          label="Widest Calf Circumference (cm)"
          value={values.widest_calf_circumference_cm || ''}
          onChange={handleChange('widest_calf_circumference_cm')}
          required
          inVaild={shouldShowError('widest_calf_circumference_cm')}
          error={errors?.widest_calf_circumference_cm}
        />

        <Input
          label="Widest Calf ML (cm)"
          value={values.widest_calf_ml_cm || ''}
          onChange={handleChange('widest_calf_ml_cm')}
          required
          inVaild={shouldShowError('widest_calf_ml_cm')}
          error={errors?.widest_calf_ml_cm}
        />

        {/* Ankle */}
        <Input
          label="Ankle Circumference (cm)"
          value={values.ankle_circumference_cm || ''}
          onChange={handleAnkleChange}
          required
          inVaild={shouldShowError('ankle_circumference_cm')}
          error={errors?.ankle_circumference_cm}
        />

        <Input
          label="Ankle ML (cm)"
          value={values.ankle_ml_cm || ''}
          onChange={handleChange('ankle_ml_cm')}
          required
          inVaild={shouldShowError('ankle_ml_cm')}
          error={errors?.ankle_ml_cm}
        />

        <Input
          label="Ankle to Ground Height (cm)"
          value={values.ankle_to_ground_cm || ''}
          onChange={handleChange('ankle_to_ground_cm')}
          required
          inVaild={shouldShowError('ankle_to_ground_cm')}
          error={errors?.ankle_to_ground_cm}
        />

        {/* Forefoot */}
        <Input
          label="Forefoot ML (cm)"
          value={values.forefoot_ml_cm || ''}
          onChange={handleChange('forefoot_ml_cm')}
          required
          inVaild={shouldShowError('forefoot_ml_cm')}
          error={errors?.forefoot_ml_cm}
        />

        {/* ================= AFO MODEL ================= */}
        {afoOptions.length > 0 && (
          <SelectBox
            label="Select AFO Model"
            value={values.afo_item_code || ''}
            inVaild={shouldShowError('afo_item_code')}
            error={errors?.afo_item_code}
            options={afoOptions.map((i: any) => ({
              label: `${i.item_name} (₹${i.design_rate})`,
              value: i.item_code,
            }))}
            onValueChange={(val: string) => {
              const sel = afoOptions.find(
                (i: any) => i.item_code === val
              );

              setFieldValue('afo_item_code', val);
              setFieldValue('afo_item_name', sel?.item_name || '');
            }}
          />
        )}

        {/* ================= DAFO ONLY ================= */}
        {type === 'DAFO' && (
          <SelectBox
            label="Ankle Joint Type"
            value={values.ankle_joint_type || ''}
            options={[
              { label: 'Tamrack Flexure', value: 'Tamrack flexure' },
              { label: 'Oklahoma', value: 'Oklahoma' },
              { label: 'Camber Axis', value: 'Camber axis' },
            ]}
            onValueChange={handleChange('ankle_joint_type')}
            required
            inVaild={shouldShowError('ankle_joint_type')}
            error={errors?.ankle_joint_type}
          />
        )}

      </div>


      {/* ================= RIGHT IMAGES ================= */}
      <div className="border rounded-lg p-5 bg-white shadow-sm space-y-8">

        {/* AFO */}
        <div className="text-center space-y-2 pb-6 border-b">
          <Image
            src="/assets/order-forms/afo/12.jpg"
            alt="AFO Diagram"
            width={360}
            height={360}
            className="rounded border mx-auto"
          />
        </div>

        {/* DAFO */}
        <div className="text-center space-y-2 pt-6">
          <Image
            src="/assets/order-forms/afo/9.jpg"
            alt="DAFO Diagram"
            width={360}
            height={360}
            className="rounded border mx-auto"
          />
        </div>

      </div>

    </div>
  );
}
