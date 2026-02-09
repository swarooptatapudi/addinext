// app/api/payments/return/route.ts
import { NextRequest } from 'next/server';

const BASE = 'http://localhost:4701/';
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
  <title>Payment Status</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .card {
      background: #fff;
      border-radius: 16px;
      padding: 32px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 25px rgba(0,0,0,.08);
      text-align: center;
    }

    .icon {
      font-size: 56px;
      margin-bottom: 12px;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 1.5rem;
    }

    p {
      color: #4b5563;
      font-size: 0.95rem;
      margin: 0 0 16px;
    }

    .order {
      font-size: 0.85rem;
      color: #374151;
      background: #f3f4f6;
      padding: 8px 12px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 20px;
    }

    button {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      border: none;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      background: #2563eb;
      color: #fff;
    }

    button:hover {
      opacity: .95;
    }

    details {
      margin-top: 20px;
      text-align: left;
      font-size: 0.8rem;
      color: #374151;
    }

    pre {
      background: #111827;
      color: #e5e7eb;
      padding: 12px;
      border-radius: 8px;
      overflow: auto;
      font-size: 0.75rem;
    }
  </style>
</head>

<body>
  <div class="card">
    <div id="icon" class="icon">⏳</div>

    <h2 id="title">Processing Payment</h2>
    <p id="message">Please wait while we confirm your payment.</p>

    <div id="order" class="order" style="display:none"></div>

    <button id="closeBtn">Continue</button>

    <details>
      <summary>View technical details</summary>
      <pre id="payload"></pre>
    </details>
  </div>

  <script>
    const payload = ${payloadJson};

    const icon = document.getElementById('icon');
    const title = document.getElementById('title');
    const message = document.getElementById('message');
    const orderBox = document.getElementById('order');
    const payloadBox = document.getElementById('payload');
    const closeBtn = document.getElementById('closeBtn');

    payloadBox.textContent = JSON.stringify(payload, null, 2);

    function getOrderId(obj) {
      return (
        obj?.data?.order_id ||
        obj?.order_id ||
        obj?.forwarded?.received?.body?.order_id ||
        obj?.forwarded?.body?.order_id ||
        null
      );
    }

    function getStatus(obj) {
      return String(
        obj?.data?.status ||
        obj?.status ||
        obj?.forwarded?.received?.body?.status ||
        ''
      ).toUpperCase();
    }

    const orderId = getOrderId(payload);
    const status = getStatus(payload);

    if (orderId) {
      orderBox.style.display = 'inline-block';
      orderBox.textContent = 'Order ID: ' + orderId;
    }

    if (status === 'CHARGED' || status === 'CAPTURED') {
      icon.textContent = '✅';
      title.textContent = 'Payment Successful';
      message.textContent = 'Your payment has been completed successfully.';
    } else if (status === 'FAILED') {
      icon.textContent = '❌';
      title.textContent = 'Payment Failed';
      message.textContent = 'The payment could not be completed.';
    } else {
      icon.textContent = '⏳';
      title.textContent = 'Payment Processing';
      message.textContent = 'Your payment is being processed. You may safely close this window.';
    }

    closeBtn.addEventListener('click', () => {
      try {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'PAYMENT_CLOSE_CLICKED' },

            '*'
          );
        }
        window.close();
      } catch {}
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}
