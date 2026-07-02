'use client';

/**
 * NOTE: This route (/design-sessions/[id]/design) is a protected-layout
 * fallback. The primary LeoShape editor lives at the fullscreen route
 * /design/[id] (src/app/(fullscreen)/design/[id]/page.tsx).
 *
 * This page simply redirects to the fullscreen route so any direct
 * navigation here still works correctly.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DesignSessionDesignRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/design/${id}`);
    }
  }, [id, router]);

  return (
    <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
      Opening 3D editor…
    </div>
  );
}
