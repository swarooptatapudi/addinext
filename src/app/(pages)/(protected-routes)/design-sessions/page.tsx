'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DesignSessionRow = {
  product: string | '';
  name: string;
  patient_name: string;
  sales_order_id: string;
  status:
    | 'CREATED'
    | 'FORM_SUBMITTED'
    | 'FILES_PROCESSING'
    | 'FILES_READY'
    | 'DESIGN_STARTED'
    | 'DESIGN_COMPLETED'
    | 'FAILED';
  modified: string;
};

const statusClass: Record<string, string> = {
  FILES_READY:      'bg-blue-100 text-blue-700',
  DESIGN_STARTED:   'bg-yellow-100 text-yellow-800',
  DESIGN_COMPLETED: 'bg-green-100 text-green-700',
  FAILED:           'bg-red-100 text-red-700',
  FORM_SUBMITTED:   'bg-gray-100 text-gray-700',
  CREATED:          'bg-gray-100 text-gray-600',
};

export default function DesignSessionsListPage() {
  const [rows, setRows] = useState<DesignSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const ERP_BASE = process.env.NEXT_PUBLIC_ERP_BASE_URL ?? '';

  useEffect(() => {
    fetch(
      `${ERP_BASE}/api/method/addiwise.apis.wiky_scan.leoshape_workflow.list_sessions`,
      { credentials: 'include' }
    )
      .then(res => res.json())
      .then(res => {
        if (!res?.message) throw new Error('Invalid response');
        setRows(res.message);
      })
      .catch(() => setError('No Design Sessions available'))
      .finally(() => setLoading(false));
  }, [ERP_BASE]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Design Sessions</h1>

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Session ID</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Sales Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading Design Sessions…
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No Design Sessions found
                  <div className="text-xs mt-1">
                    Start a design from an order to see it here
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map(row => (
                <tr
                  key={row.name}
                  onClick={() => router.push(`/design-sessions/${row.name}`)}
                  className="cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {row.product || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.name}</td>
                  <td className="px-4 py-3">{row.patient_name}</td>
                  <td className="px-4 py-3 text-gray-700">{row.sales_order_id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        statusClass[row.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.modified}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
