'use client';

/**
 * LeoShape does not have a separate scan-cleaning step.
 * The 3D editor handles raw scan import directly.
 *
 * This page informs the user and redirects back to the workspace.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ScanCleaningDeprecatedPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(`/design-sessions/${id}`);
    }, 3000);
    return () => clearTimeout(t);
  }, [id, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="text-4xl">ℹ️</div>
      <h2 className="text-lg font-semibold text-gray-800">
        Scan Cleaning is not required with LeoShape
      </h2>
      <p className="text-sm text-gray-500 max-w-sm">
        The LeoShape editor handles scan import directly. Use{' '}
        <strong>Launch 3D Design</strong> from the workspace to open the editor.
      </p>
      <p className="text-xs text-gray-400">Redirecting back to workspace…</p>
      <button
        onClick={() => router.replace(`/design-sessions/${id}`)}
        className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50 transition"
      >
        Back to Workspace
      </button>
    </div>
  );
}
