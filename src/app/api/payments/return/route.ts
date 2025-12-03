// app/api/payments/return/route.ts
import { NextRequest } from 'next/server';

const BASE = 'https://addinxt.addiwise.com/';
const FRAPPE_CONFIRM = `${BASE}api/method/addiwise.apis.payments.hdfc_payments.confirm_payment`;

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

  // HTML page shown in popup — note: we DO NOT auto-close the window now
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payment Result</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; color: #111; background: #f9fafb; }
    .box { background: #fff; border: 1px solid #eee; padding: 16px; border-radius: 8px; white-space: pre-wrap; }
    .bar { margin-top: 14px; display:flex; gap:8px; }
    button { padding: 8px 14px; border-radius: 6px; background: #0b64d1; color: #fff; border: none; cursor: pointer; }
    .secondary { background: #6b7280; }
    .status { font-weight: 600; margin-bottom: 8px; }
    .small { font-size: 13px; color: #374151; }
  </style>
</head>
<body>
  <h2>Processing Payment Result</h2>
  <div class="box" id="log">Initializing...</div>

  <div class="bar">
    <button id="closeBtn">Close</button>
    <button id="copyBtn" class="secondary">Copy payload</button>
  </div>

  <script>
    (async function(){
      const payload = ${payloadJson};
      const logEl = document.getElementById('log');
      const closeBtn = document.getElementById('closeBtn');
      const copyBtn = document.getElementById('copyBtn');

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

      log('Extracted order_id=' + orderId + ', status=' + status);

      if (!orderId) {
        log('❌ No order_id found in payload.');
        if (window.opener) window.opener.postMessage({ type: 'HDFC_RETURN', payload: { raw: payload } }, '*');
        // keep the page open for debugging — user can close manually
        return;
      }

      const confirmBody = { order_id: orderId, status, signature_valid: true };

      try {
        const resp = await fetch('${FRAPPE_CONFIRM}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmBody)
        });
        const result = await resp.json();
        log('Confirm payment result: ' + JSON.stringify(result));

        // notify parent window that payment return has arrived
        if (window.opener) {
          window.opener.postMessage({ type: 'HDFC_RETURN', payload: { data: payload, confirm: result } }, '*');
          log('✅ Message posted to opener window.');
        } else {
          log('⚠️ No opener window to post message to.');
        }

        // DO NOT auto-close — let user inspect and manually close
        log('\\nYou may now close this window when ready.');
      } catch (err) {
        log('❌ confirm_payment error: ' + String(err));
        if (window.opener) {
          window.opener.postMessage({ type: 'HDFC_RETURN', payload: { data: payload, error: String(err) } }, '*');
        }
        log('There was an error confirming payment. Please copy payload for debugging and close manually.');
      }

      // wire up buttons
      closeBtn.addEventListener('click', () => {
        try { window.close(); } catch {}
      });

      copyBtn.addEventListener('click', () => {
        try {
          navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
          alert('Payload copied to clipboard');
        } catch (e) {
          alert('Copy failed: ' + String(e));
        }
      });
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}
