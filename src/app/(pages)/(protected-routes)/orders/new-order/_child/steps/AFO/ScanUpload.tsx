'use client';

import React, { useState } from 'react';
import StlFilePicker from '@/components/app/common/StlPreviewer';

type UISet = { Input: any; Label: any; Card: any; Textarea: any };

type Props = {
  values: any;
  setFieldValue: (f: string, v: any) => void;
  UI: UISet;
  title?: string;
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export default function ScanUpload({
                                     values,
                                     setFieldValue,
                                     UI,
                                     title
                                   }: Props) {

  const { Input, Label, Card, Textarea } = UI;

  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);

  /* ---------------- Validation ---------------- */

  const validateAndSet = (
    file: File | null,
    side: 'left' | 'right'
  ) => {

    const setError = side === 'left' ? setLeftError : setRightError;
    const field = side === 'left' ? 'left_leg_file' : 'right_leg_file';

    setError(null);

    if (!file) {
      setFieldValue(field, null);
      return;
    }

    /* Extension */
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (ext !== '.stl') {
      setError('Only .stl files are allowed');
      setFieldValue(field, null);
      return;
    }

    /* Size */
    if (file.size > MAX_BYTES) {
      setError('Max file size is 25 MB');
      setFieldValue(field, null);
      return;
    }

    setFieldValue(field, file);
  };

  /* ---------------- Remove ---------------- */

  const removeFile = (side: 'left' | 'right') => {

    if (side === 'left') {
      setFieldValue('left_leg_file', null);
      setLeftError(null);
    } else {
      setFieldValue('right_leg_file', null);
      setRightError(null);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">

      <h2 className="text-primary text-lg font-semibold border-b pb-2">
        {title || 'AFO — Scan & Upload'}
      </h2>

      {/* ---------------- Laterality ---------------- */}

      <div className="mt-4 max-w-xs">

        <Label className="mb-2 block">Laterality</Label>

        <select
          value={values.laterality || ''}
          onChange={(e) => {
            const v = e.target.value;

            setFieldValue('laterality', v);

            // Reset files when changed
            setFieldValue('left_leg_file', null);
            setFieldValue('right_leg_file', null);

            setLeftError(null);
            setRightError(null);
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select</option>
          <option value="Unilateral">Unilateral</option>
          <option value="Bilateral">Bilateral</option>
        </select>

      </div>

      {/* ---------------- Upload Section ---------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

        {/* ========== LEFT LEG ========== */}

        {(values.laterality === 'Unilateral' ||
          values.laterality === 'Bilateral') && (

          <Card className="p-4 bg-gray-50">

            <Label className="mb-2 block">
              Upload Left Leg STL — max 25 MB
            </Label>

            <StlFilePicker
              label="Upload Left STL"
              buttonText="Upload"
              accept={['.stl']}
              onFileSelect={(file) =>
                validateAndSet(file ?? null, 'left')
              }
            />

            {leftError && (
              <p className="text-xs text-red-600 mt-2">
                {leftError}
              </p>
            )}

            {values.left_leg_file && !leftError && (
              <div className="mt-3 flex items-center gap-3">

                <div className="text-sm">
                  <div className="font-medium">Selected</div>
                  <div className="text-xs text-gray-600">
                    {values.left_leg_file.name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile('left')}
                  className="text-xs px-2 py-1 border rounded"
                >
                  Remove
                </button>

              </div>
            )}

          </Card>
        )}

        {/* ========== RIGHT LEG ========== */}

        {values.laterality === 'Bilateral' && (

          <Card className="p-4 bg-gray-50">

            <Label className="mb-2 block">
              Upload Right Leg STL — max 25 MB
            </Label>

            <StlFilePicker
              label="Upload Right STL"
              buttonText="Upload"
              accept={['.stl']}
              onFileSelect={(file) =>
                validateAndSet(file ?? null, 'right')
              }
            />

            {rightError && (
              <p className="text-xs text-red-600 mt-2">
                {rightError}
              </p>
            )}

            {values.right_leg_file && !rightError && (
              <div className="mt-3 flex items-center gap-3">

                <div className="text-sm">
                  <div className="font-medium">Selected</div>
                  <div className="text-xs text-gray-600">
                    {values.right_leg_file.name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile('right')}
                  className="text-xs px-2 py-1 border rounded"
                >
                  Remove
                </button>

              </div>
            )}

          </Card>
        )}

      </div>

      {/* ---------------- Google Drive ---------------- */}

      <div className="mt-5 max-w-xl">

        <Label className="mb-2 block">
          Google Drive Link (Optional)
        </Label>

        <Input
          type="url"
          placeholder="https://drive.google.com/..."
          value={values.drive_url || ''}
          onChange={(e: any) =>
            setFieldValue('drive_url', e.target.value)
          }
        />

      </div>

    </div>
  );
}
