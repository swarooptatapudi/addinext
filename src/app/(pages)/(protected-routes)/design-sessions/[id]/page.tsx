'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type TokenState = 'ACTIVE' | 'EXPIRING' | 'EXPIRED';

type WikyFileRow = {
  id?: string;
  name?: string;
  file_name?: string;
  type?: string; // STL/ZIP/etc
  side?: 'L' | 'R' | 'BOTH' | string;
  created_at?: string;
  url?: string;
};

type WikySession = {
  name: string;
  scan_id: string;
  sales_order_id: string;
  patient_name?: string;
  status: 'FILES_READY' | 'DESIGN_STARTED' | 'DESIGN_COMPLETED' | 'FAILED' | string;
  last_synced_on?: string;
  token_expiry_time?: string; // ISO string
};

export default function DesignSessionWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<WikySession | null>(null);
  const [files, setFiles] = useState<WikyFileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSession() {
    setError(null);
    const r = await fetch(
      `/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_wiky_session?name=${id}`
    );
    const d = await r.json();
    if (!d?.message) throw new Error('Invalid session response');
    setSession(d.message);
  }

  // async function launchIframe(type: 'clean' | 'design') {
  //   setActionLoading(true);
  //   try {
  //     const r = await fetch(
  //       `/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_wiky_iframe?session_id=${id}&iframe_type=${type}`
  //     );
  //     const d = await r.json();
  //
  //     if (d?.message?.iframe_url) {
  //       const route = type === 'clean' ? 'scan-cleaning' : 'design';
  //       router.push(`/design-sessions/${id}/${route}`);
  //     }
  //   } catch {
  //     setError(`Unable to launch ${type === 'clean' ? 'scan cleaning' : 'design'}.`);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // }

  async function launchIframe(type: 'clean' | 'design') {
    setActionLoading(true);
    try {
      const r = await fetch(
        `/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_wiky_iframe?session_id=${id}&iframe_type=${type}`
      );
      const d = await r.json();

      if (d?.message?.iframe_url) {
        const route = type === 'clean' ? 'scan-cleaning' : 'design';
        router.push(`/design-sessions/${id}/${route}`);
      } else {
        setError('Unable to generate iframe URL.');
      }
    } catch (err) {
      console.error('Failed to launch iframe:', err);
      setError(`Unable to launch ${type === 'clean' ? 'scan cleaning' : 'design'}.`);
    } finally {
      setActionLoading(false);
    }
  }


  async function loadFiles() {
    setFilesLoading(true);
    setError(null);

    try {
      const r = await fetch(
        `/api/method/addiwise.apis.wiky_scan.wiky_workflow.list_wiky_files?session_id=${id}`
      );
      if (r.status === 404) {
        setFiles([]);
        setError('No files found for this session.');
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

  const { tokenState, minutesLeft } = useMemo(() => {
    if (!session?.token_expiry_time) return { tokenState: 'EXPIRED' as TokenState, minutesLeft: 0 };

    const now = new Date();
    const expiry = new Date(session.token_expiry_time);
    const mins = Math.floor((expiry.getTime() - now.getTime()) / 60000);

    if (mins <= 0) return { tokenState: 'EXPIRED' as TokenState, minutesLeft: 0 };
    if (mins < 10) return { tokenState: 'EXPIRING' as TokenState, minutesLeft: mins };
    return { tokenState: 'ACTIVE' as TokenState, minutesLeft: mins };
  }, [session?.token_expiry_time]);

  const bandClass =
    tokenState === 'ACTIVE'
      ? 'bg-green-600'
      : tokenState === 'EXPIRING'
        ? 'bg-yellow-500'
        : 'bg-red-600';


  // async function refreshSession() {
  //   setActionLoading(true);
  //   try {
  //     await fetch(
  //       `/api/method/addiwise.apis.wiky_scan.wiky_workflow.login_to_wiky?session_id=${id}`,
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ session_id: id })
  //       }
  //     );
  //     await loadSession();
  //     await loadFiles();
  //   } catch {
  //     setError('Session refresh failed.');
  //   } finally {
  //     setActionLoading(false);
  //   }
  // }
  async function refreshSession() {
    setActionLoading(true);
    setError(null);

    try {
      await fetch(
        `/api/method/addiwise.apis.wiky_scan.wiky_workflow.login_to_wiky?session_id=${id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: id })
        }
      );

      // Reload session to get fresh token_expiry_time
      await loadSession();

    } catch (err) {
      console.error('Session refresh failed:', err);
      setError('Session refresh failed.');
    } finally {
      setActionLoading(false);
    }
  }

  function launchDesign() {
    // You can either push to an internal route that renders an iframe
    // or open a new window. Using route keeps app UX consistent.
    router.push(`/design-sessions/${id}/design`);
  }



  if (loading) {
    return <div className="p-6 text-gray-500">Loading Design Workspace…</div>;
  }

  if (!session) {
    return <div className="p-6 text-red-600">{error || 'Session not found'}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top band */}
      <div
        className={`rounded-lg px-4 py-3 text-white flex items-center justify-between ${bandClass}`}
      >
        <div className="text-sm font-medium">
          {tokenState === 'ACTIVE' && `Session Active (${minutesLeft} min left)`}
          {tokenState === 'EXPIRING' && `Session Expiring (${minutesLeft} min left)`}
          {tokenState === 'EXPIRED' && 'Session Expired'}
        </div>

        <div className="flex gap-4 text-sm">
          <button
            onClick={refreshSession}
            disabled={actionLoading}
            className="underline disabled:opacity-60"
          >
            Refresh Session
          </button>
          <button onClick={() => router.push('/design-sessions')} className="underline">
            Back
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="border rounded-lg bg-white p-4">
        <div className="text-lg font-semibold mb-3">Design Workspace</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="Patient" value={session.patient_name || '—'} />
          <Info label="Sales Order" value={session.sales_order_id} />
          <Info label="Scan ID" value={session.scan_id} mono />
          <Info label="Status" value={session.status} badge />
          <Info label="Last Synced" value={session.last_synced_on || '—'} />
        </div>
      </div>

      {/* Wiky Files */}
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

        {/* Error */}
        {error && <div className="px-4 py-3 text-sm text-red-600 border-b">{error}</div>}

        {/* Empty */}
        {!filesLoading && files.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No files available in  yet.
            <div className="text-sm mt-1">
              If you just uploaded, click <span className="font-medium">Refresh files</span>.
            </div>
          </div>
        )}

        {/* Table */}
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
                      <a className="text-primary hover:underline" href={f.url} target="_blank">
                        View
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
      <div className="border rounded-lg bg-white p-4 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => launchIframe('clean')}
          disabled={tokenState === 'EXPIRED' || actionLoading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Launch Scan Cleaning
        </button>

        <button
          onClick={() => launchIframe('design')}
          disabled={tokenState === 'EXPIRED' || actionLoading}
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
        >
          Launch 3D Design
        </button>

        {/*<button*/}
        {/*  onClick={markCompleted}*/}
        {/*  disabled={actionLoading}*/}
        {/*  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-60"*/}
        {/*>*/}
        {/*  Mark Design Completed*/}
        {/*</button>*/}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  badge
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {badge ? (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value}
        </span>
      ) : (
        <div className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</div>
      )}
    </div>
  );
}
