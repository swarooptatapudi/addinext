"use client";

import { useEffect, useMemo } from "react";
import { WikyCaptureIframeProps } from '@/lib/CaptureProps';

export function WikyCaptureIframe(props: WikyCaptureIframeProps) {
  const {
    iframeBaseUrl,
    customFormId,
    clientId,
    userId,
    onCaptured,
    onCancel,
  } = props;

  const iframeUrl = useMemo(() => {
    const url = new URL(
      `/custom-form/view-custom-form/${customFormId}`,
      iframeBaseUrl
    );

    url.searchParams.set("clientID", clientId);

    if (userId) {
      url.searchParams.set("userID", userId);
    }

    return url.toString();
  }, [iframeBaseUrl, customFormId, clientId, userId]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
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
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
      allow="camera *; microphone *"
    />
  );
}
