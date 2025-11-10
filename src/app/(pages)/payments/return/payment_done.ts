// app/payments/return/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * ENV you must set (server-side only):
 * - HDFC_RETURN_HMAC_KEY         => "Response Key" from HDFC (if Signed Response is enabled)
 * - HDFC_RETURN_SIG_HEADER       => header name with signature, default 'x-signature'
 * - NEXT_PUBLIC_APP_ORIGIN       => fallback site origin (optional)
 */
const HMAC_SECRET =
  process.env.HDFC_RETURN_HMAC_KEY || '94809BBCEB84735814C1C1F280A8F6'; // if empty, verification is skipped (allowed)
const SIG_HEADER =
  process.env.HDFC_RETURN_SIG_HEADER ||
  process.env.HDFC_RETURN_HMAC_HEADER ||
  'x-signature';

function siteOrigin(req: Request) {
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://uataddinext.addiwise.com';
  }
}

/** timing-safe verification; if secret is blank, treat as "verification disabled" */
function verifyHmac(raw: Buffer, secret: string, sig?: string | null) {
  if (!secret) return true;         // Signed Response disabled on gateway
  if (!sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex').toLowerCase();
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(sig.trim().toLowerCase(), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Robust body parse: HDFC sends application/x-www-form-urlencoded */
function parseBody(raw: Buffer, contentType: string | null) {
  const ct = (contentType || '').toLowerCase();
  const text = raw.toString('utf8');
  if (ct.includes('application/json')) {
    try { return JSON.parse(text || '{}') as Record<string, any>; } catch { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(text)) as Record<string, any>;
}

export async function POST(req: Request) {
  // 1) Read raw first (needed for HMAC)
  const raw = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get(SIG_HEADER);
  const ok  = verifyHmac(raw, HMAC_SECRET, sig);

  // 2) Parse body after reading raw
  const body = parseBody(raw, req.headers.get('content-type'));

  // 3) Extract common fields (be tolerant to naming)
  const providerRef =
    body.orderId || body.order_id || body.id || body.txnId || body.provider_ref || '';
  const status = String(
    body.status || body.transactionStatus || body.transactionState || ''
  ).toUpperCase();

  // 4) Build 303 redirect to a PAGE that can show the result to the user
  const origin = siteOrigin(req);
  const url = new URL('/payments/return', origin); // <-- this is your page.tsx route (GET)
  if (providerRef) url.searchParams.set('provider_ref', String(providerRef));
  if (status)      url.searchParams.set('status', status);
  url.searchParams.set('sig', ok ? '1' : '0');

  // (Optional) pass through your own merchant order id if you included it as udfX
  if (body.udf1) url.searchParams.set('udf1', String(body.udf1));

  // Never 500 the bank—always 303 to the UX page, even on bad sig
  return NextResponse.redirect(url.toString(), { status: 303 });
}
