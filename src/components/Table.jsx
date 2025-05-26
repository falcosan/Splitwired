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
                className="px-2 py-2 sm:px-4 sm:py-3 align-baseline whitespace-nowrap text-left font-semibold uppercase tracking-wide text-xs sm:text-sm"
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
              <td
                className="px-2 py-2 sm:px-4 sm:py-3 text-slate-300 text-xs sm:text-sm whitespace-nowrap"
                key={cell.id}
              >
                <div
                  className="truncate max-w-[120px] sm:max-w-none"
                  title={String(
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
