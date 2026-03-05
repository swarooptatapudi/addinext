'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function WikyDesignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function resendToIframe(data: any) {
    const iframe = document.getElementById('wiky_iframe') as HTMLIFrameElement | null;

    if (!iframe?.contentWindow || !iframe.src) return;

    const iframeOrigin = new URL(iframe.src).origin;
    iframe.contentWindow.postMessage(data, iframeOrigin);
  }

  useEffect(() => {
    function debugListener(e: MessageEvent) {
      console.log('[WIKY EVENT]', e.origin, e.data);

      if (e.origin !== 'https://edserinsole.leopoly.com') return;

      const data = e.data;

      // iframe ready
      if (data?.EVENT_NAME === 'loaded_IFrame') {
        resendToIframe(data);
      }

      // editor closed
      if (data?.EVENT_NAME === 'closed_IFrame') {
        window.location.href = `/design-sessions/${id}`;
      }
    }

    window.addEventListener('message', debugListener);

    return () => {
      window.removeEventListener('message', debugListener);
    };
  }, [router, id]);

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
        console.error(err);
        setError('Failed to connect to Wiky.');
      } finally {
        setLoading(false);
      }
    }

    loadIframe();
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-white">
        Loading 3D Design...
      </div>
    );
  }

  if (error || !iframeUrl) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 text-white">
        <div>{error}</div>

        <button
          onClick={() => router.push(`/design-sessions/${id}`)}
          className="px-4 py-2 border rounded"
        >
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <iframe
      id="wiky_iframe"
      src={iframeUrl}
      className="w-screen h-screen border-0"
      allow="camera; microphone; clipboard-write"
    />
  );
}
