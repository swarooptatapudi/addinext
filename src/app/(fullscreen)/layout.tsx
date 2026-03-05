'use client';

import { useEffect } from 'react';

export default function FullscreenLayout({
                                           children
                                         }: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const el = document.documentElement;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    }

    const exit = () => {
      if (!document.fullscreenElement) {
        window.history.back();
      }
    };

    document.addEventListener('fullscreenchange', exit);

    return () => {
      document.removeEventListener('fullscreenchange', exit);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {children}
    </div>
  );
}
