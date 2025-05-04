import React from 'react';

export default function CustomTable({
  columns,
  data,
  headerBgColor = '#d3d3d3',
  lastColBgColor = ''
}: {
  columns: Array<{
    header: string;
    accessorKey: string;
  }>;
  data: any;
  headerBgColor?: string;
  lastColBgColor?: string;
}): React.JSX.Element {
  return (
    <table className="table-auto border">
      <thead className="bg-accent border">
        <tr style={{ backgroundColor: headerBgColor }}>
          {columns.map((column) => (
            <th
              key={column.accessorKey}
              className="px-4 py-2 text-xs border border-gray-400"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id} className="border border-black">
            {columns.map((column, idx) => (
              <td
                key={column.accessorKey}
                className={`px-4 py-2 text-xs border  border-gray-400 text-left`}
                style={idx === columns.length - 1 ? { backgroundColor: lastColBgColor } : {}}
              >
                {row[column.accessorKey] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

//---------simple table for----------------------
// import React from 'react';
// export default function CustomTable({
//   columns,
//   data
// }: {
//   columns: Array<{
//     header: string;
//     accessorKey: string;
//   }>;
//   data: any;
// }): React.JSX.Element {
//   return (
//     <table className="table-auto border">
//       <thead className="bg-accent border">
//         <tr>
//           {columns.map((column) => (
//             <th className="px-4 py-2 text-xs border" key={column.accessorKey}>
//               {column.header}
//             </th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row: any) => (
//           <tr key={row.id} className="border">
//             {columns.map((column) => (
//               <td className="px-4 text-xs border py-2" key={column.accessorKey}>
//                 {row[column.accessorKey] ?? '-'}
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
