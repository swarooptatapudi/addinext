// src/components/wiky/wikyApi.ts

const BASE = process.env.NEXT_PUBLIC_ADDIWISE_BACKEND_BASE_URL!;

async function post<T>(method: string, body: any): Promise<T> {
  const res = await fetch(
    `${BASE}/api/method/addiwise.apis.wiky_scan.${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const wikyApi = {
  startScan: (orderId: string) =>
    post("start_scan", { insole_order_id: orderId }),

  uploadZip: (sessionId: string, file: File) => {
    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append("zip_file", file);
    return fetch(
      `${BASE}/api/method/addiwise.apis.wiky_scan.upload_zip`,
      { method: "POST", body: fd }
    ).then(r => r.json());
  },

  getIframe: (
    sessionId: string,
    action: "CLEANING" | "DESIGN",
    product: string
  ) =>
    post("get_iframe", { session_id: sessionId, action, product }),

  submitForm: (
    sessionId: string,
    scanId: string,
    formResponseId: string
  ) =>
    post("custom_form_submitted", {
      session_id: sessionId,
      scan_id: scanId,
      form_response_id: formResponseId,
    }),

  syncFiles: (sessionId: string) =>
    post("sync_files", { session_id: sessionId }),
};
