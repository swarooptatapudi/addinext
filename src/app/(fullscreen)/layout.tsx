'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FullscreenLayout({
                                           children
                                         }: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();

        const confirmExit = window.confirm(
          'Do you want to close the editor?'
        );

        if (confirmExit) {
          const currentPath = window.location.pathname;
          const parts = currentPath.split('/');
          const id = parts[2]; // /design/{id}

          router.push(`/design-sessions/${id}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black z-[9999]">
      {children}
    </div>
  );
}
