import React from 'react';
export default function CustomTable({
  columns,
  data
}: {
  columns: Array<{
    header: string;
    accessorKey: string;
  }>;
  data: any;
}): React.JSX.Element {
  return (
    <table className="table-auto border">
      <thead className="bg-accent border">
        <tr>
          {columns.map((column) => (
            <th className="px-4 py-2 text-xs border" key={column.accessorKey}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any) => (
          <tr key={row.id} className="border">
            {columns.map((column) => (
              <td className="px-4 text-xs border py-2" key={column.accessorKey}>
                {row[column.accessorKey] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
