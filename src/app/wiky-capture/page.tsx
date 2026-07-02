/**
 * DEPRECATED – Wiky capture page.
 *
 * This page handled the Wiky custom-form iframe popup flow, which captured
 * scanId + formResponseId via a postMessage 'customFormSubmitted' event.
 *
 * LeoShape does NOT have a separate pre-form step. The editor is opened
 * directly from the design workspace via the iframe at /design/[id].
 *
 * This route is kept as a redirect so any existing deep-links or bookmarks
 * do not result in a hard 404.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WikyCapturePage() {
  const router = useRouter();

  useEffect(() => {
    // If this page was opened as a popup by old code, close it gracefully.
    if (window.opener) {
      window.opener?.postMessage(
        { type: 'WIKY_CAPTURE_DEPRECATED' },
        '*'
      );
      window.close();
      return;
    }

    // Otherwise redirect to the dashboard.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: '#888',
        fontSize: '14px',
      }}
    >
      Redirecting…
    </div>
  );
}
