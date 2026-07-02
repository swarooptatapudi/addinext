'use client';

/**
 * DEPRECATED – Wiky capture page.
 *
 * Wiky required a popup window to capture scanId + formResponseId via a
 * postMessage 'customFormSubmitted' event before opening the editor.
 *
 * LeoShape does NOT have a separate pre-form step. The editor is opened
 * directly from the design workspace via the fullscreen route /design/[id].
 *
 * This route is kept as a graceful redirect so any existing bookmarks or
 * old code paths do not result in a hard 404.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WikyCapturePage() {
  const router = useRouter();

  useEffect(() => {
    if (window.opener) {
      window.opener?.postMessage({ type: 'WIKY_CAPTURE_DEPRECATED' }, '*');
      window.close();
      return;
    }
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
