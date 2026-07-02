'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type LeoShapeFileRow = {
  id?: string;
  name?: string;
  file_name?: string;
  type?: string;
  side?: 'L' | 'R' | 'BOTH' | string;
  created_at?: string;
  url?: string;
};

type LeoShapeSession = {
  name: string;
  sales_order_id: string;
  patient_name?: string;
  status:
    | 'CREATED'
    | 'FILES_READY'
    | 'DESIGN_STARTED'
    | 'DESIGN_COMPLETED'
    | 'FAILED'
    | string;
  last_synced_on?: string;
};

export default function DesignSessionWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<LeoShapeSession | null>(null);
  const [files, setFiles] = useState<LeoShapeFileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ERP_BASE = process.env.NEXT_PUBLIC_ERP_BASE_URL ?? '';

  async function loadSession() {
    setError(null);
    const r = await fetch(
      `${ERP_BASE}/api/method/addiwise.apis.wiky_scan.leoshape_workflow.get_session?name=${id}`,
      { credentials: 'include' }
    );
    const d = await r.json();
    if (!d?.message) throw new Error('Invalid session response');
    setSession(d.message);
  }

  async function loadFiles() {
    setFilesLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `${ERP_BASE}/api/method/addiwise.apis.wiky_scan.leoshape_workflow.list_leoshape_files?session_id=${id}`,
        { credentials: 'include' }
      );
      if (r.status === 404) {
        setFiles([]);
        return;
      }
      const d = await r.json();
      setFiles(d?.message || []);
    } catch {
      setError('Unable to load design files right now.');
    } finally {
      setFilesLoading(false);
    }
  }

  async function launchDesign() {
    setActionLoading(true);
    setError(null);
    try {
      // Pre-warm the LeoShape token so the editor loads instantly
      const r = await fetch(
        `${ERP_BASE}/api/method/addiwise.apis.wiky_scan.leoshape_workflow.get_leoshape_iframe?session_id=${id}`,
        { credentials: 'include' }
      );
      const d = await r.json();
      if (d?.message?.iframe_url) {
        router.push(`/design/${id}`);
      } else {
        setError('Unable to start 3D Design editor.');
      }
    } catch {
      setError('Unable to launch 3D Design editor.');
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadSession();
        await loadFiles();
      } catch {
        setError('Workspace not available for this session.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'DESIGN_COMPLETED': return 'bg-green-100 text-green-700';
      case 'DESIGN_STARTED':   return 'bg-yellow-100 text-yellow-800';
      case 'FILES_READY':      return 'bg-blue-100 text-blue-700';
      case 'FAILED':           return 'bg-red-100 text-red-700';
      default:                 return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Design Workspace…</div>;
  }

  if (!session) {
    return <div className="p-6 text-red-600">{error || 'Session not found'}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Design Workspace</h1>
        <button
          onClick={() => router.push('/design-sessions')}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Sessions
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="border rounded-lg bg-white p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="Patient" value={session.patient_name || '—'} />
          <Info label="Sales Order" value={session.sales_order_id} />
          <Info label="Session" value={session.name} mono />
          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                statusBadgeClass(session.status)
              }`}
            >
              {session.status}
            </span>
          </div>
          <Info label="Last Synced" value={session.last_synced_on || '—'} />
        </div>
      </div>

      {/* Files */}
      <div className="border rounded-lg bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-medium">Design Files</div>
          <button
            onClick={loadFiles}
            disabled={filesLoading}
            className="text-sm text-primary hover:underline disabled:opacity-60"
          >
            {filesLoading ? 'Refreshing…' : 'Refresh files'}
          </button>
        </div>

        {!filesLoading && files.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No exported files yet.
            <div className="text-sm mt-1">
              Complete a design session and export to see files here.
            </div>
          </div>
        )}

        {files.length > 0 && (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f, idx) => (
                <tr key={f.id || f.name || idx} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-sm">{f.file_name || f.name || '—'}</td>
                  <td className="px-4 py-3 text-sm">{f.type || '—'}</td>
                  <td className="px-4 py-3 text-sm">{f.side || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{f.created_at || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {f.url ? (
                      <a
                        className="text-primary hover:underline"
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Actions */}
      <div className="border rounded-lg bg-white p-4 flex justify-end">
        <button
          onClick={launchDesign}
          disabled={
            actionLoading ||
            session.status === 'DESIGN_COMPLETED'
          }
          className="px-5 py-2 rounded bg-primary text-white disabled:opacity-50 hover:opacity-90 transition"
        >
          {actionLoading ? 'Opening…' : 'Launch 3D Design'}
        </button>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
