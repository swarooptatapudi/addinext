'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type WikySessionRow = {
  product: string | '';
  name: string;
  scan_id: string;
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
  token_status: 'ACTIVE' | 'EXPIRED';
  modified: string;
};

export default function WikySessionsListPage() {
  const [rows, setRows] = useState<WikySessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/method/addiwise.apis.wiky_scan.wiky_workflow.list_user_wiky_scan_sessions')
      .then(res => res.json())
      .then(res => {
        if (!res?.message) {
          throw new Error('Invalid response');
        }
        setRows(res.message);
      })
      .catch(() => setError('No Wiky Sessions available'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Wiky Scan Sessions</h1>

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Scan ID</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Sales Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading */}
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading Wiky Sessions…
                </td>
              </tr>
            )}

            {/* Error */}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {/* Empty */}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No Wiky Sessions found
                  <div className="text-xs mt-1">Start a scan from an order to see it here</div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading &&
              !error &&
              rows.map((row) => (
                <tr
                  key={row.name}
                  onClick={() => router.push(`/wiky-sessions/${row.name}`)}
                  className="cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {row.product ?? '—'}
                  </td> {/* 👈 NEW */}
                  <td className="px-4 py-3 font-mono">{row.scan_id}</td>

                  <td className="px-4 py-3">{row.patient_name}</td>

                  <td className="px-4 py-3 text-gray-700">{row.sales_order_id}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                        ${row.status === 'FILES_READY' && 'bg-blue-100 text-blue-700'}
                        ${row.status === 'DESIGN_STARTED' && 'bg-yellow-100 text-yellow-800'}
                        ${row.status === 'DESIGN_COMPLETED' && 'bg-green-100 text-green-700'}
                        ${row.status === 'FAILED' && 'bg-red-100 text-red-700'}
                        ${row.status === 'FORM_SUBMITTED' && 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {row.token_status === 'ACTIVE' ? (
                      <span className="text-green-600 font-medium">● Active</span>
                    ) : (
                      <span className="text-red-500 font-medium">● Expired</span>
                    )}
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




// // /app/wiky-sessions/page.tsx
// 'use client';
//
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
//
// type WikySessionRow = {
//   name: string;
//   scan_id: string;
//   patient_name: string;
//   sales_order_id: string;
//   status: string;
//   token_status?: 'ACTIVE' | 'EXPIRED';
//   modified: string;
// };
//
// export default function WikySessionsListPage() {
//   const [rows, setRows] = useState<WikySessionRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//
//   useEffect(() => {
//     fetch('/api/method/addiwise.apis.wiky_sessions.list')
//       .then(r => r.json())
//       .then(d => {
//         if (!d?.message) throw new Error('Invalid response');
//         setRows(d.message);
//       })
//       .catch(() => setError('No  Wiky Sessions available!'))
//       .finally(() => setLoading(false));
//   }, []);
//
//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">Wiky Sessions</h1>
//
//       <div className="border rounded-lg overflow-hidden bg-white">
//         <table className="w-full border-collapse">
//           <thead className="bg-gray-50 border-b">
//           <tr className="text-left text-sm font-medium text-gray-600">
//             <th className="px-4 py-3">Scan ID</th>
//             <th className="px-4 py-3">Patient</th>
//             <th className="px-4 py-3">Sales Order</th>
//             <th className="px-4 py-3">Status</th>
//             <th className="px-4 py-3">Session</th>
//             <th className="px-4 py-3">Updated</th>
//           </tr>
//           </thead>
//
//           <tbody>
//           {/* Loading */}
//           {loading && (
//             <tr>
//               <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
//                 Loading Wiky Sessions…
//               </td>
//             </tr>
//           )}
//
//           {/* Error */}
//           {!loading && error && (
//             <tr>
//               <td colSpan={6} className="px-4 py-6 text-center text-red-600">
//                 {error}
//               </td>
//             </tr>
//           )}
//
//           {/* Empty */}
//           {!loading && !error && rows.length === 0 && (
//             <tr>
//               <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
//                 No Wiky Sessions found
//                 <div className="text-sm mt-1">
//                   Start a scan from an order to see it here.
//                 </div>
//               </td>
//             </tr>
//           )}
//
//           {/* Rows */}
//           {!loading &&
//             !error &&
//             rows.map(row => (
//               <tr
//                 key={row.name}
//                 onClick={() => router.push(`/wiky-sessions/${row.name}`)}
//                 className="cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
//               >
//                 <td className="px-4 py-3 font-mono text-sm">
//                   {row.scan_id}
//                 </td>
//
//                 <td className="px-4 py-3">
//                   {row.patient_name}
//                 </td>
//
//                 <td className="px-4 py-3 text-sm text-gray-700">
//                   {row.sales_order_id}
//                 </td>
//
//                 <td className="px-4 py-3">
//                     <span
//                       className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
//                         ${row.status === 'FILES_READY' && 'bg-blue-100 text-blue-700'}
//                         ${row.status === 'DESIGN_STARTED' && 'bg-yellow-100 text-yellow-800'}
//                         ${row.status === 'DESIGN_COMPLETED' && 'bg-green-100 text-green-700'}
//                         ${row.status === 'FAILED' && 'bg-red-100 text-red-700'}
//                         ${row.status === 'FORM_SUBMITTED' && 'bg-gray-100 text-gray-700'}
//                       `}
//                     >
//                       {row.status}
//                     </span>
//                 </td>
//
//                 <td className="px-4 py-3">
//                   {row.token_status === 'ACTIVE' ? (
//                     <span className="text-green-600 font-medium">● Active</span>
//                   ) : (
//                     <span className="text-red-500 font-medium">● Expired</span>
//                   )}
//                 </td>
//
//                 <td className="px-4 py-3 text-sm text-gray-500">
//                   {row.modified}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
