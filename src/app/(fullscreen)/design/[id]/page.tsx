'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LeoShapeEvent =
  | 'loaded_IFrame'
  | 'init_data'
  | 'model_export_start'
  | 'model_export_approved'
  | 'export_finished'
  | 'closed_IFrame';

interface LeoShapeMessage {
  EVENT_NAME: LeoShapeEvent;
  message_ID?: string;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ERP_BASE =
  process.env.NEXT_PUBLIC_ERP_BASE_URL ?? '';

async function erpGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${ERP_BASE}${path}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`ERP request failed [${res.status}]: ${text}`);
  }

  const json = await res.json();
  return json?.message as T;
}

async function erpPost<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${ERP_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`ERP POST failed [${res.status}]: ${text}`);
  }

  const json = await res.json();
  return json?.message as T;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LeoShapeDesignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<
    'idle' | 'pending' | 'done'
  >('idle');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // -------------------------------------------------------------------------
  // Step 1: load iframe URL from backend
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function loadIframe() {
      try {
        const data = await erpGet<{ iframe_url: string }>(
          `/api/method/addiwise.apis.wiky_scan.leoshape_workflow.get_leoshape_iframe?session_id=${id}`
        );

        if (data?.iframe_url) {
          setIframeUrl(data.iframe_url);
        } else {
          setError('Unable to load the LeoShape editor.');
        }
      } catch (err) {
        console.error('[LeoShape] Failed to get iframe URL', err);
        setError('Failed to connect to LeoShape. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadIframe();
  }, [id]);

  // -------------------------------------------------------------------------
  // Step 2: LeoShape postMessage event bus
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!iframeUrl) return;

    // Derive the allowed origin from the iframe URL
    let leoshapeOrigin: string;
    try {
      leoshapeOrigin = new URL(iframeUrl).origin;
    } catch {
      console.error('[LeoShape] Invalid iframe URL, cannot set up event bus');
      return;
    }

    function postToIframe(payload: LeoShapeMessage) {
      iframeRef.current?.contentWindow?.postMessage(
        payload,
        leoshapeOrigin
      );
    }

    async function handleMessage(e: MessageEvent<LeoShapeMessage>) {
      // Only handle messages from the LeoShape origin
      if (e.origin !== leoshapeOrigin) return;

      const { EVENT_NAME, message_ID, data } = e.data ?? {};

      console.log('[LeoShape EVENT]', EVENT_NAME, e.data);

      // -------------------------------------------------------------------
      // iframe is ready – fetch init_data payload and send it
      // -------------------------------------------------------------------
      if (EVENT_NAME === 'loaded_IFrame') {
        try {
          const payload = await erpGet<LeoShapeMessage>(
            `/api/method/addiwise.apis.wiky_scan.leoshape_workflow.get_leoshape_init_payload?session_id=${id}`
          );

          if (payload) {
            postToIframe(payload);
          } else {
            setError('LeoShape editor loaded but init data is unavailable.');
          }
        } catch (err) {
          console.error('[LeoShape] Failed to fetch init payload', err);
          setError('Failed to initialise LeoShape editor data.');
        }
      }

      // -------------------------------------------------------------------
      // User clicked Export – approve it
      // -------------------------------------------------------------------
      if (EVENT_NAME === 'model_export_start') {
        setExportStatus('pending');
        postToIframe({
          EVENT_NAME: 'model_export_approved',
          message_ID: message_ID,
        });
      }

      // -------------------------------------------------------------------
      // Export finished – persist to backend
      // -------------------------------------------------------------------
      if (EVENT_NAME === 'export_finished') {
        try {
          await erpPost(
            '/api/method/addiwise.apis.wiky_scan.leoshape_workflow.mark_export_complete',
            {
              session_id: id,
              files_json: JSON.stringify(data ?? {}),
            }
          );
          setExportStatus('done');
        } catch (err) {
          console.error('[LeoShape] Failed to save export', err);
          // Non-fatal: the export already succeeded in LeoShape,
          // we just failed to persist the metadata.
        }
      }

      // -------------------------------------------------------------------
      // User closed the editor
      // -------------------------------------------------------------------
      if (EVENT_NAME === 'closed_IFrame') {
        router.push(`/design-sessions/${id}`);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, iframeUrl, router]);

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3 bg-black text-white">
        <svg
          className="animate-spin h-8 w-8 text-white opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm opacity-60">Loading 3D Editor…</span>
      </div>
    );
  }

  if (error || !iframeUrl) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-red-400 text-sm max-w-sm text-center">
          {error ?? 'Something went wrong loading the editor.'}
        </p>
        <button
          onClick={() => router.push(`/design-sessions/${id}`)}
          className="px-4 py-2 text-sm border border-white/30 rounded hover:bg-white/10 transition"
        >
          ← Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Export pending overlay */}
      {exportStatus === 'pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="bg-white text-black text-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exporting model…
          </div>
        </div>
      )}

      {/* Export done toast */}
      {exportStatus === 'done' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm px-6 py-3 rounded-full shadow-lg">
          ✓ Export saved successfully
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={iframeUrl}
        id="leoshape_iframe"
        className="w-screen h-screen border-0"
        allow="camera; microphone; clipboard-write"
        title="LeoShape 3D Editor"
      />
    </>
  );
}
