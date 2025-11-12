// app/api/payments/return/route.ts
import { NextRequest } from 'next/server';

const FRAPPE_BASE = 'https://uataddinext.addiwise.com/';
const FRAPPE_CONFIRM = `${FRAPPE_BASE}/api/method/addiwise.apis.payments.hdfc_payments.confirm_payment`;

function jsSafe(obj: any) {
  try {
    return JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  } catch {
    return 'null';
  }
}

export async function POST(req: NextRequest) {
  // Read raw body (HDFC may send urlencoded or JSON)
  const raw = await req.text();

  let parsed: any = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      const params = new URLSearchParams(raw);
      parsed = Object.fromEntries(params.entries());
    } catch {
      parsed = { raw };
    }
  }

  const payloadJson = jsSafe(parsed);

  // HTML page shown in popup
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payment Result</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    .box { background: #f7f7f8; border: 1px solid #eee; padding: 16px; border-radius: 6px; white-space: pre-wrap; }
    button { margin-top: 18px; padding: 8px 14px; border-radius: 6px; background: #0b64d1; color: #fff; border: none; }
  </style>
</head>
<body>
  <h2>Processing Payment Result...</h2>
  <div class="box" id="log"></div>

  <script>
    (async function(){
      const payload = ${payloadJson};
      const logEl = document.getElementById('log');
      const log = (msg) => {
        logEl.textContent += (logEl.textContent ? "\\n" : "") + msg;
        console.log(msg);
      };

      function findOrderId(obj) {
        if (!obj) return null;
        return (
          obj?.data?.order_id ||
          obj?.order_id ||
          obj?.forwarded?.received?.body?.order_id ||
          obj?.forwarded?.body?.order_id ||
          null
        );
      }

      function findStatus(obj) {
        if (!obj) return '';
        return (
          String(obj?.data?.status ||
                 obj?.status ||
                 obj?.forwarded?.received?.body?.status ||
                 obj?.forwarded?.body?.status || '')
          .toUpperCase()
        );
      }

      const orderId = findOrderId(payload);
      const status = findStatus(payload) || 'UNKNOWN';
      const signature_valid = true;

      log('Extracted order_id=' + orderId + ', status=' + status);

      if (!orderId) {
        log('❌ No order_id found in payload.');
        if (window.opener) window.opener.postMessage({ type: 'HDFC_RETURN', payload: { raw: payload } }, '*');
        return;
      }

      const confirmBody = { order_id: orderId, status, signature_valid };

      try {
        const resp = await fetch('${FRAPPE_CONFIRM}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmBody)
        });
        const result = await resp.json();
        log('Confirm payment result: ' + JSON.stringify(result));

        if (window.opener) {
          window.opener.postMessage({ type: 'HDFC_RETURN', payload: { data: payload, confirm: result } }, '*');
        }

        log('✅ Message sent to main window.');
        setTimeout(() => window.close(), 2000);
      } catch (err) {
        log('❌ confirm_payment error: ' + String(err));
        if (window.opener) {
          window.opener.postMessage({ type: 'HDFC_RETURN', payload: { data: payload, error: String(err) } }, '*');
        }
      }
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}
