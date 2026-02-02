'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AFOClinical({
                                      values,
                                      handleChange,
                                      errors,
                                      touched,
                                      shouldShowError,
                                    }: any) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mt-6 space-y-4">

      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Clinical Details
      </h3>

      {/* Assessment Date */}
      <Input
        type="date"
        label="Assessment Date"
        value={values.assessment_date}
        onChange={handleChange('assessment_date')}
      />

      {/* Medical Condition */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Medical Condition <span className="text-red-500">*</span>
        </label>

        <Textarea
          value={values.medical_condition || ''}
          onChange={handleChange('medical_condition')}
          className={`w-full ${
            shouldShowError('medical_condition')
              ? 'border-red-500 focus:border-red-500'
              : ''
          }`}
        />

        {shouldShowError('medical_condition') && (
          <p className="text-xs text-red-500 mt-1">
            {errors?.medical_condition}
          </p>
        )}
      </div>

      {/* Treatment Suggested */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Treatment Suggested <span className="text-red-500">*</span>
        </label>

        <Textarea
          value={values.treatment_suggested || ''}
          onChange={handleChange('treatment_suggested')}
          className={`w-full ${
            shouldShowError('treatment_suggested')
              ? 'border-red-500 focus:border-red-500'
              : ''
          }`}
        />

        {shouldShowError('treatment_suggested') && (
          <p className="text-xs text-red-500 mt-1">
            {errors?.treatment_suggested}
          </p>
        )}
      </div>

      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Special Instructions <span className="text-red-500">*</span>
        </label>

        <Textarea
          value={values.special_instructions || ''}
          onChange={handleChange('special_instructions')}
          className={`w-full ${
            shouldShowError('special_instructions')
              ? 'border-red-500 focus:border-red-500'
              : ''
          }`}
        />
        {shouldShowError('special_instructions') && (
            <p className="text-xs text-red-500 mt-1">
              {errors?.special_instructions}
            </p>
          )}
      </div>

    </div>
  );
}
