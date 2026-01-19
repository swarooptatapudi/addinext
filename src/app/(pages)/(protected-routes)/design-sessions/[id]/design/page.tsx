'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function WikyDesignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIframe() {
      try {
        const r = await fetch(
          `/api/method/addiwise.apis.wiky_scan.wiky_workflow.get_wiky_iframe?session_id=${id}&iframe_type=design`
        );
        const d = await r.json();

        if (d?.message?.iframe_url) {
          setIframeUrl(d.message.iframe_url);
        } else {
          setError('Unable to load design iframe.');
        }
      } catch (err) {
        console.error('Failed to load iframe:', err);
        setError('Failed to connect to Wiky.');
      } finally {
        setLoading(false);
      }
    }

    loadIframe();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading 3D Design...</div>
      </div>
    );
  }

  if (error || !iframeUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-600">{error || 'No iframe URL available'}</div>
        <button
          onClick={() => router.push(`/design-sessions/${id}`)}
          className="px-4 py-2 rounded border hover:bg-gray-50"
        >
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="font-medium">Wiky 3D Design</div>
        <button
          onClick={() => router.push(`/design-sessions/${id}`)}
          className="text-sm text-primary hover:underline"
        >
          Back to Workspace
        </button>
      </div>

      <div className="flex-1 relative">
        <iframe
          id="wiky_iframe"
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="camera; microphone; clipboard-write"
        />
      </div>
    </div>
  );
}
