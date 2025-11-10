// src/app/(pages)/(protected-routes)/payments/return/api/route.ts
import { NextResponse } from "next/server";

/**
 * ERP webhook URL + credentials.
 * Prefer env vars in production:
 *   BACKEND_WEBHOOK_URL, BACKEND_BASIC_USER, BACKEND_BASIC_PASS
 *
 * Defaults below are from your site_config.json; replace or set env vars.
 */
const BACKEND_WEBHOOK_URL =
  process.env.BACKEND_WEBHOOK_URL ??
  "https://uaterp.addiwise.com/api/method/addiwise.apis.webhook.hdfc";
const BACKEND_BASIC_USER = process.env.BACKEND_BASIC_USER ?? "addiwiseuatpg";
const BACKEND_BASIC_PASS = process.env.BACKEND_BASIC_PASS ?? "@DDi##4321";

/** Basic Auth header (typed) */
function getAuthHeader(): { Authorization?: string } {
  if (!BACKEND_BASIC_USER) return {};
  const token = Buffer.from(`${BACKEND_BASIC_USER}:${BACKEND_BASIC_PASS}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

export async function POST(req: Request) {
  try {
    console.log("API: POST hit at /payments/return/api", {
      verifiedHeader: req.headers.get("x-hdfc-verified"),
      contentType: req.headers.get("content-type"),
    });

    // parse body (JSON or form)
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    let bodyObj: Record<string, any> = {};
    if (ct.includes("application/json")) {
      try {
        bodyObj = await req.json();
      } catch (e) {
        console.warn("API: JSON parse failed", e);
        bodyObj = {};
      }
    } else {
      const form = await req.formData();
      form.forEach((v, k) => {
        bodyObj[k] = v;
      });
    }
    console.log("API: parsed body:", bodyObj);

    // Build headers safely (HeadersInit)
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const authHeader = getAuthHeader();
    if (authHeader.Authorization) {
      // TypeScript knows headers is HeadersInit and this assignment is valid
      (headers as Record<string, string>)["Authorization"] = authHeader.Authorization;
    }

    // Forward to ERP webhook (server-to-server)
    const resp = await fetch(BACKEND_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyObj),
    });

    const respText = await resp.text().catch(() => "");
    console.log("API: ERP response status:", resp.status, "body len:", respText?.length ?? 0);
    // Optionally log ERP response body for debugging (be careful with PII)
    if (!resp.ok) {
      console.warn("API: ERP returned non-2xx. Response body (truncated):", respText.slice(0, 1000));
    }

    // Build redirect for user (include query vars your page expects)
    const params = new URLSearchParams();
    const orderId = bodyObj.merchantTxnId || bodyObj.order_id || bodyObj.orderId;
    const txnId = bodyObj.txnId || bodyObj.txn_id || bodyObj.id;
    const status = bodyObj.status || bodyObj.transactionState || "";

    if (orderId) params.set("merchantTxnId", String(orderId));
    if (txnId) params.set("txnId", String(txnId));
    if (status) params.set("status", String(status));

    // Set verified only if ERP accepted the forwarded payload (2xx)
    if (resp.ok) {
      params.set("verified", "1");
    } else {
      params.set("verified", "0");
    }

    const redirect = `/payments/return${params.toString() ? "?" + params.toString() : ""}`;
    console.log("API: redirecting browser to:", redirect);

    return NextResponse.redirect(redirect);
  } catch (err) {
    console.error("API: unexpected error:", err);
    return new NextResponse("API Internal Server Error", { status: 500 });
  }
}
