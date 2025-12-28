import { WikyProduct } from "./types";

type StartScanReq = {
  insole_order_id: string;
  product: WikyProduct;
  patient: any;
  shoe_size: number;
};

export const wikyApi = {
  async startScan(req: StartScanReq) {
    const res = await fetch(
      "/api/method/addiwise.apis.wiky_scan.wiky_scan.start_scan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "start_scan failed");
    return json?.message || json; // frappe sometimes wraps
  },

  async uploadZip(sessionId: string, file: File) {
    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append("zip_file", file);

    const res = await fetch(
      "/api/method/addiwise.apis.wiky_scan.wiky_scan.upload_zip",
      { method: "POST", body: fd }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "upload_zip failed");
    return json?.message || json;
  },

  async getIframe(sessionId: string, action: "CLEANING" | "DESIGN", product: WikyProduct) {
    const res = await fetch(
      "/api/method/addiwise.apis.wiky_scan.wiky_scan.get_iframe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, action, product }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "get_iframe failed");
    return json?.message || json;
  },

  async submitCustomForm(sessionId: string, scanId: string, formResponseId: string) {
    const res = await fetch(
      "/api/method/addiwise.apis.wiky_scan.wiky_scan.custom_form_submitted",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          scan_id: scanId,
          form_response_id: formResponseId,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "custom_form_submitted failed");
    return json?.message || json;
  },

  async syncFiles(sessionId: string) {
    const res = await fetch(
      "/api/method/addiwise.apis.wiky_scan.wiky_scan.sync_files",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "sync_files failed");
    return json?.message || json;
  },
};
