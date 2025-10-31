'use client';
import React, { useRef, useState } from 'react';
import { usePreSignedUrlMutation } from '@/rtk-query/apis/orders';

type UISet = { Input:any; Label:any; Card:any; Textarea:any };
type Props = { values:any; setFieldValue:(f:string,v:any)=>void; UI:UISet };

export default function ScanUpload({ values, setFieldValue, UI }: Props) {
  const { Input, Label, Card, Textarea } = UI;
  const fileRef = useRef<HTMLInputElement>(null);

  const [preSignedUrl] = usePreSignedUrlMutation();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setMsg(null);
    setUploading(true);
    try {
      // 1) Ask your backend for a presigned URL
      const { message, data }: any = await preSignedUrl({
        file_name: file.name,
        file_type: file.type,
      }).unwrap();

      // Your endpoint may return `data.presigned_url` or `data.url`
      const presignedUrl = (data?.presigned_url || data?.url || data) as string;
      if (!presignedUrl) throw new Error('No presigned URL returned');

      // 2) Upload file to S3 with PUT
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`S3 upload failed: ${putRes.status}`);

      setMsg('File uploaded successfully!');
    } catch (e:any) {
      setMsg(e?.message || 'Upload failed');
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Scan & Upload</h2>

      {/* Row 1: STL upload + Google Drive link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Upload Scan (.stl) — max 25 MB</Label>
          <Input
            type="file"
            ref={fileRef}
            accept=".stl"
            onChange={async (e:any) => {
              const f = e.target.files?.[0];
              setFieldValue('scan_file', f || null);
              if (f) await handleUpload(f);
            }}
            disabled={uploading}
          />
          {msg && <p className="text-xs mt-2">{msg}</p>}
        </Card>

        <Card className="p-4 bg-gray-50">
          <Label className="mb-2 block">Google Drive Link (optional)</Label>
          <Input
            type="url"
            placeholder="https://drive.google.com/..."
            value={values.scan_gdrive_link || ''}
            onChange={(e:any) => setFieldValue('scan_gdrive_link', e.target.value)}
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
            onChange={(e:any) => setFieldValue('date_of_surgery', e.target.value)}
          />
        </Card>

        <Card className="p-4 bg-gray-50 md:col-span-1">
          <Label className="mb-2 block">Surgical Complications</Label>
          <Textarea
            placeholder="Describe any surgical complications"
            value={values.surgical_complications || ''}
            onChange={(e:any) => setFieldValue('surgical_complications', e.target.value)}
          />
        </Card>

        <Card className="p-4 bg-gray-50 md:col-span-1">
          <Label className="mb-2 block">Other Diagnosis and Syndromes</Label>
          <Textarea
            placeholder="List other diagnosis and syndromes"
            value={values.other_diagnosis_and_syndromes || ''}
            onChange={(e:any) => setFieldValue('other_diagnosis_and_syndromes', e.target.value)}
          />
        </Card>
      </div>
    </div>
  );
}