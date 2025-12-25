import { useEffect, useState } from "react";
import { wikyApi } from "./wikyApi";
import { WikyProduct, WikyStep } from "./types";

export function useWikySession(orderId: string, product: WikyProduct) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [step, setStep] = useState<WikyStep>("START");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    try {
      const res = await wikyApi.startScan(orderId) as { session_id: string; scan_id: string };
      setSessionId(res.session_id);
      setScanId(res.scan_id);
      setStep("UPLOAD");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function uploadZip(file: File) {
    if (!sessionId) return;
    await wikyApi.uploadZip(sessionId, file);
    setStep("PRESCRIPTION");
  }

  async function openIframe(action: "CLEANING" | "DESIGN") {
    if (!sessionId) return;
    const res = await wikyApi.getIframe(sessionId, action, product) as { iframe_url: string };
    setIframeUrl(res.iframe_url);
    setStep(action === "CLEANING" ? "CLEANING" : "DESIGN");
  }

  async function submitForm(scanId: string, formResponseId: string) {
    if (!sessionId) return;
    await wikyApi.submitForm(sessionId, scanId, formResponseId);
    setStep("CLEANING");
  }

  async function syncFiles() {
    if (!sessionId) return;
    const res = await wikyApi.syncFiles(sessionId) as { files?: any[] };
    setFiles(res.files || []);
    setStep("FILES");
  }

  return {
    sessionId,
    scanId,
    step,
    iframeUrl,
    files,
    error,
    start,
    uploadZip,
    openIframe,
    submitForm,
    syncFiles,
  };
}