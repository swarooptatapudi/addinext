"use client";

import { useEffect } from "react";

interface Props {
  iframeUrl: string;
  onCaptured: (data: {
    scanId: string;
    formResponseId: string;
  }) => void;
}

export function WikyCaptureIframe({ iframeUrl, onCaptured }: Props) {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://scan.wikyapps.com") return;

      if (e.data?.event === "customFormSubmitted") {
        const { scanId, formResponseId } = e.data;
        if (scanId && formResponseId) {
          onCaptured({ scanId, formResponseId });
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onCaptured]);

  return (
    <iframe
      src={iframeUrl}
      allow="camera *; microphone *"
      className="w-full h-full border-none"
    />
  );
}
