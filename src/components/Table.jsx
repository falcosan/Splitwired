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
    <table className={`overflow-hidden rounded ${props.className ?? null}`}>
      <thead className="bg-slate-800 text-slate-300">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className="p-1 align-baseline whitespace-pre-wrap text-left"
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
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td className="p-1 bg-zinc-600 text-slate-300" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
