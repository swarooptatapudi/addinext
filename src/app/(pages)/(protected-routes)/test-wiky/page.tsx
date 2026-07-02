'use client';

/**
 * LeoShape Integration Test Page
 *
 * Use this page to verify the LeoShape token + init payload pipeline
 * without going through the full design session flow.
 *
 * Steps this page exercises:
 *   1. GET  leoshape_workflow.get_leoshape_iframe  → validate token + iframe URL
 *   2. GET  leoshape_workflow.get_leoshape_init_payload → validate STL URLs + patient data
 */

import { useEffect, useState } from 'react';

const ERP_BASE = process.env.NEXT_PUBLIC_ERP_BASE_URL ?? '';

type TestResult = {
  label: string;
  status: 'idle' | 'loading' | 'ok' | 'error';
  data?: string;
};

export default function TestLeoShapePage() {
  const [sessionId, setSessionId] = useState('');
  const [results, setResults] = useState<TestResult[]>([
    { label: 'Get iframe URL (token auth)',  status: 'idle' },
    { label: 'Get init payload (STL + patient)', status: 'idle' },
  ]);

  function setResult(idx: number, patch: Partial<TestResult>) {
    setResults(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function runTests() {
    if (!sessionId.trim()) {
      alert('Enter a Session ID (Wiky Session DocType name) first.');
      return;
    }

    // Reset
    setResults(prev => prev.map(r => ({ ...r, status: 'loading', data: undefined })));

    // Test 1 – iframe URL
    try {
      setResult(0, { status: 'loading' });
      const r = await fetch(
        `${ERP_BASE}/api/method/addiwise.apis.wiky_scan.leoshape_workflow.get_leoshape_iframe?session_id=${sessionId}`,
        { credentials: 'include' }
      );
      const d = await r.json();
      if (d?.message?.iframe_url) {
        setResult(0, { status: 'ok', data: d.message.iframe_url });
      } else {
        setResult(0, { status: 'error', data: JSON.stringify(d, null, 2) });
      }
    } catch (e: any) {
      setResult(0, { status: 'error', data: e.message });
    }

    // Test 2 – init payload
    try {
      setResult(1, { status: 'loading' });
      const r = await fetch(
        `${ERP_BASE}/api/method/addiwise.apis.wiky_scan.leoshape_workflow.get_leoshape_init_payload?session_id=${sessionId}`,
        { credentials: 'include' }
      );
      const d = await r.json();
      if (d?.message?.EVENT_NAME === 'init_data') {
        setResult(1, { status: 'ok', data: JSON.stringify(d.message, null, 2) });
      } else {
        setResult(1, { status: 'error', data: JSON.stringify(d, null, 2) });
      }
    } catch (e: any) {
      setResult(1, { status: 'error', data: e.message });
    }
  }

  const badge = (status: TestResult['status']) => {
    switch (status) {
      case 'ok':      return 'bg-green-100 text-green-700';
      case 'error':   return 'bg-red-100   text-red-700';
      case 'loading': return 'bg-yellow-100 text-yellow-700';
      default:        return 'bg-gray-100  text-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">
        LeoShape Integration Test
      </h1>

      {/* Session input */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            Session ID (Wiky Session DocType name)
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            placeholder="WIKY-SES-00001"
          />
        </div>
        <button
          onClick={runTests}
          className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
        >
          Run Tests
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="border rounded-lg bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  badge(r.status)
                }`}
              >
                {r.status === 'loading' ? '…' : r.status.toUpperCase()}
              </span>
              <span className="text-sm font-medium text-gray-700">{r.label}</span>
            </div>
            {r.data && (
              <pre className="px-4 py-3 text-xs text-gray-600 overflow-auto max-h-64 bg-white">
                {r.data}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
