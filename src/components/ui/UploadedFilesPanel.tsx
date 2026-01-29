'use client';

import { getDownloadUrl } from '@/baseurl';

type MaybeFile = string | File | null | undefined;

type Props = {
  leftFootFile?: MaybeFile;
  rightFootFile?: MaybeFile;
  additionalFile1?: MaybeFile;
  additionalFile2?: MaybeFile;
  driveLink?: string | null;
  // ✅ NEW — semantic overrides
  leftLabel?: string;
  rightLabel?: string;
};

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

const isFile = (v: unknown): v is File =>
  typeof File !== 'undefined' && v instanceof File;

const resolveHref = (path: string): string => {
  // already full URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // already frappe method/proxy url
  if (path.startsWith('/api/method/')) return path;

  // raw key → wrap using your existing helper
  return getDownloadUrl(path);
};

function FileRow({ label, value }: { label: string; value?: MaybeFile }) {
  if (!value) return null;

  // New upload (File) → show name only (no href)
  if (isFile(value)) {
    return (
      <div className="block rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-gray-500 break-all">New upload: {value.name}</div>
      </div>
    );
  }

  // Existing saved string → show anchor
  if (isNonEmptyString(value)) {
    const href = resolveHref(value);
    const fileName = value.split('/').pop() || value;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded border border-blue-500 bg-white px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
      >
        <div className="font-medium">{label}</div>
        <div className="text-xs text-blue-500/80">Click to download</div>
      </a>
    );
  }

  return null;
}

export function UploadedFilesPanel({
  leftFootFile,
  rightFootFile,
  additionalFile1,
  additionalFile2,
  driveLink,
  leftLabel,
  rightLabel,
}: Props) {
  const hasAny =
    Boolean(leftFootFile) ||
    Boolean(rightFootFile) ||
    Boolean(additionalFile1) ||
    Boolean(additionalFile2) ||
    Boolean(driveLink && driveLink.trim());
  console.warn('Rendered UploadedFilesPanel with files:',leftFootFile, rightFootFile, additionalFile1, additionalFile2, driveLink);
  const isValidStoredFile = (v?: string | null) => {
    if (!v) return false;
    if (v.startsWith('blob:')) return false;          // ❌ frontend-only
    if (v.trim() === '') return false;
    return true;                                      // uploads/… or http(s)
  };


  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">Uploaded Files</h4>

      {!hasAny ? (
        <p className="text-sm italic text-gray-500">No files available for this patient</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isValidStoredFile(leftFootFile as string) && (
            // <FileRow label="Left Foot STL" value={leftFootFile} />
            <FileRow
              label={leftLabel ?? 'Left Foot STL'}
              value={leftFootFile}
            />
          )}

          {isValidStoredFile(rightFootFile as string) && (
            // <FileRow label="Right Foot STL" value={rightFootFile} />
            <FileRow
              label={rightLabel ?? 'Right Foot STL'}
              value={rightFootFile}
            />
          )}

          {isValidStoredFile(additionalFile1 as string) && (
            <FileRow label="Additional File (Left)" value={additionalFile1} />
          )}

          {isValidStoredFile(additionalFile2 as string) && (
            <FileRow label="Additional File (Right)" value={additionalFile2} />
          )}

          {isValidStoredFile(driveLink) && (
            <a
              href={driveLink!}
              target="_blank"
              rel="noopener noreferrer"
              className="md:col-span-2 block rounded border border-green-600 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              📁 Open Google Drive Link
            </a>
          )}

          {/*<FileRow label="Left Foot STL" value={leftFootFile} />*/}
          {/*<FileRow label="Right Foot STL" value={rightFootFile} />*/}
          {/*<FileRow label="Additional File (Left)" value={additionalFile1} />*/}
          {/*<FileRow label="Additional File (Right)" value={additionalFile2} />*/}

          {/*{driveLink && driveLink.trim() && (*/}
          {/*  <a*/}
          {/*    href={driveLink}*/}
          {/*    target="_blank"*/}
          {/*    rel="noopener noreferrer"*/}
          {/*    className="md:col-span-3 block rounded border border-green-500 bg-white px-3 py-2 text-sm text-green-700 hover:bg-green-50"*/}
          {/*  >*/}
          {/*    Open Google Drive Link*/}
          {/*  </a>*/}
          {/*)}*/}
        </div>
      )}
    </div>
  );
}
