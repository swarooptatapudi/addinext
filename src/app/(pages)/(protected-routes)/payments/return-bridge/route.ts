// DEBUG ONLY: src/app/(pages)/(protected-routes)/payments/return-bridge/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.HDFC_RETURN_HMAC_KEY ?? "94809BBCEB84735814C1C1F280A8F6";

function computeHmacBase64(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload, "utf8").digest("base64");
}
function mask(s: string) {
  if (!s) return "";
  if (s.length <= 8) return "****";
  return s.slice(0, 4) + "..." + s.slice(-4);
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const headers = Object.fromEntries(req.headers);
    const contentType = req.headers.get("content-type") || "";

    // signature from header or body
    const headerSig = (req.headers.get("x-signature") || req.headers.get("signature") || "").trim();
    let bodySig = "";
    if (!headerSig) {
      if (contentType.includes("application/json")) {
        try { bodySig = JSON.parse(raw).signature || ""; } catch {}
      } else {
        try { bodySig = new URLSearchParams(raw).get("signature") || ""; } catch {}
      }
    }
    const receivedSig = headerSig || bodySig;

    const computed = computeHmacBase64(raw);
    const verified = !!receivedSig && crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(receivedSig)) ? "YES" : "NO";

    // Build debug HTML
    const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>HDFC Debug</title></head>
<body style="font-family: system-ui, Arial; padding:20px">
  <h2>HDFC Return Debug</h2>
  <h3>Headers</h3>
  <pre>${JSON.stringify(headers, null, 2)}</pre>
  <h3>Content-Type</h3>
  <pre>${contentType}</pre>
  <h3>Raw Body (first 2000 chars)</h3>
  <pre>${raw.slice(0,2000).replace(/</g,'&lt;')}</pre>
  <h3>Signature (header or body)</h3>
  <pre>Present: ${!!receivedSig}  value: ${mask(receivedSig)}</pre>
  <h3>Computed HMAC (masked)</h3>
  <pre>${mask(computed)}</pre>
  <h3>Verified?</h3>
  <pre>${verified}</pre>
  <p>Next steps: if Verified = YES, we will forward to internal API. If NO, raw payload text used for computing HMAC might differ from what gateway signs (JSON vs form-encoded or ordering).</p>
</body>
</html>`;

    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
  } catch (err) {
    console.error("DEBUG BRIDGE error:", err);
    return new NextResponse("DEBUG BRIDGE ERROR", { status: 500 });
  }
}
