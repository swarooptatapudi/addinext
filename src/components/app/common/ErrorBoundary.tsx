'use client';
import { useEffect } from 'react';

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleChunkError = (error: any) => {
      if (error?.name === 'ChunkLoadError') {
        console.error('Chunk failed to load, reloading...', error);
        window.location.reload(); // Auto-refresh on chunk errors
      }
    };
    
    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);
  
  return <>{children}</>;
}