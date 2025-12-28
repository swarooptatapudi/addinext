import { useState } from "react";
import { wikyApi } from "./wikyApi";
import { WikyProduct, WikyStep, WikyFile } from "./types";

type StartPayload = {
  patient: any;
  shoeSize: number;
};

export function useWikySession(orderId: string, product: WikyProduct, startPayload: StartPayload) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<WikyFile[]>([]);
  const [step, setStep] = useState<WikyStep>("START");
  const [error, setError] = useState<string | null>(null);

  async function start() {
    try {
      setError(null);
      const res = await wikyApi.startScan({
        insole_order_id: orderId,
        product,
        patient: startPayload.patient,
        shoe_size: startPayload.shoeSize,
      });
      setSessionId(res.session_id);
      setStep("UPLOAD");
    } catch (e: any) {
      setError(e.message || "Failed to start Wiky session");
    }
  }

  async function uploadZipFile(file: File) {
    if (!sessionId) return;
    try {
      await wikyApi.uploadZip(sessionId, file);
      setStep("CLEANING");
    } catch (e: any) {
      setError(e.message || "ZIP upload failed");
    }
  }

  async function openIframe(action: "CLEANING" | "DESIGN") {
    if (!sessionId) return;
    try {
      const res = await wikyApi.getIframe(sessionId, action, product);
      setIframeUrl(res.iframe_url);
      setStep(action);
    } catch (e: any) {
      setError(e.message || "Failed to open Wiky iframe");
    }
  }

  async function submitForm(scanId: string, formResponseId: string) {
    if (!sessionId) return;
    try {
      await wikyApi.submitCustomForm(sessionId, scanId, formResponseId);
      setStep("FILES");
      const res = await wikyApi.syncFiles(sessionId);
      setFiles(res.files || []);
    } catch (e: any) {
      setError(e.message || "Failed to sync Wiky files");
    }
  }

  return {
    start,
    uploadZip: uploadZipFile,
    openIframe,
    submitForm,
    iframeUrl,
    step,
    files,
    error,
  };
}
