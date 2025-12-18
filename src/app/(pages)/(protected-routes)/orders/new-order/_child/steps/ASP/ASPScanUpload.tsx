'use client';
import React, { useState } from 'react';
import StlFilePicker from '@/components/app/common/StlPreviewer';

type UISet = { Input: any; Label: any; Card: any; Textarea: any };
type Props = { values: any; setFieldValue: (f: string, v: any) => void; UI: UISet; title?: string };

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export default function ASPScanUpload({ values, setFieldValue, UI, title }: Props) {
  const { Input, Label, Card, Textarea } = UI;
  const [fileError, setFileError] = useState<string | null>(null);

  const validateAndSet = (file: File | null) => {
    setFileError(null);

    if (!file) {
      // user cleared selection
      setFieldValue('uploaded_stl_file', null);
      return;
    }

    // extension check (basic)
    const name = file.name || '';
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.stl') {
      setFileError('Please upload a .stl file.');
      setFieldValue('uploaded_stl_file', null);
      return;
    }

    // size check
    if (file.size > MAX_BYTES) {
      setFileError('File is too large — maximum allowed size is 25 MB.');
      setFieldValue('uploaded_stl_file', null);
      return;
    }

    // passed validation
    setFieldValue('uploaded_stl_file', file);
  };

  const removeFile = () => {
    setFieldValue('uploaded_stl_file', null);
    setFileError(null);
  };

  const selectedName = values?.uploaded_stl_file?.name ?? null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">{title || 'Cranial Helmet — Scan & Upload'}</h2>

      {/* Row 1: STL Upload + Google Drive link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Upload STL file — max 25 MB</Label>

          <div className="w-fit">
            <StlFilePicker
              label="Upload STL file"
              buttonText="Upload STL"
              accept={['.stl']}
              onFileSelect={(file) => {
                // expects File | null
                validateAndSet(file ?? null);
              }}
            />
          </div>

          {/* Inline validation message */}
          {fileError && (
            <p className="text-xs text-red-600 mt-2">{fileError}</p>
          )}

          {/* selected file with remove */}
          {selectedName && !fileError && (
            <div className="mt-3 flex items-center gap-3">
              <div className="text-sm">
                <div className="font-medium">Selected file</div>
                <div className="text-xs text-gray-600">{selectedName}</div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-100"
              >
                Remove
              </button>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Google Drive Link (optional)</Label>
          <Input
            type="url"
            placeholder="https://drive.google.com/..."
            value={values.scan_gdrive_link || ''}
            onChange={(e: any) => setFieldValue('scan_gdrive_link', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            Paste a shareable link (anyone with link can view).
          </p>
        </Card>
      </div>

      {/* Row 2: Date of surgery + Surgical Complications + Other Dx/Syndromes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Date of Surgery</Label>
          <Input
            type="date"
            value={values.date_of_surgery || ''}
            onChange={(e: any) => setFieldValue('date_of_surgery', e.target.value)}
          />
        </Card>

        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Surgical Complications</Label>
          <Textarea
            placeholder="Describe any surgical complications"
            value={values.surgical_complications || ''}
            onChange={(e: any) => setFieldValue('surgical_complications', e.target.value)}
          />
        </Card>

        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Other Diagnosis and Syndromes</Label>
          <Textarea
            placeholder="List other diagnosis and syndromes"
            value={values.other_diagnosis_and_syndromes || ''}
            onChange={(e: any) => setFieldValue('other_diagnosis_and_syndromes', e.target.value)}
          />
        </Card>
      </div>
    </div>
  );
}
