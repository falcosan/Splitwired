import React from "react";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";

export default function Table(props) {
  const table = useReactTable({
    columns: props.data.length
      ? Object.keys(props.data[0]).map((key) =>
          createColumnHelper().accessor(key, {
            cell: (info) => info.getValue(),
          })
        )
      : [],
    data: props.data,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <table
      className={`overflow-hidden rounded-lg shadow-lg ${
        props.className ?? null
      }`}
    >
      <thead className="bg-slate-700 text-slate-200">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-slate-600">
            {headerGroup.headers.map((header) => (
              <th
                className="px-4 py-3 align-baseline whitespace-pre-wrap text-left font-semibold uppercase tracking-wide text-sm"
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-slate-600">
        {table.getRowModel().rows.map((row, index) => (
          <tr
            key={row.id}
            className={`hover:bg-slate-700 transition-colors ${
              index % 2 === 0 ? "bg-slate-800" : "bg-slate-750"
            }`}
          >
            {row.getVisibleCells().map((cell) => (
              <td className="px-4 py-3 text-slate-300 text-sm" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
