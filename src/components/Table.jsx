import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";

export default function Table(props) {
  const table = useReactTable({
    data: props.data,
    columns: props.data.length
      ? Object.keys(props.data[0])
          .filter((key) => key.toLowerCase() !== "id")
          .map((key) =>
            createColumnHelper().accessor(key, {
              cell: (info) => info.getValue(),
            })
          )
      : [],
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <table
      className={`overflow-hidden rounded-lg shadow-lg ${
        props.className ?? null
      }`}
    >
      <thead className="bg-stone-700 text-stone-200">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-stone-600">
            {headerGroup.headers.map((header) => (
              <th
                className="px-2 py-2 md:px-4 md:py-3 align-baseline whitespace-nowrap text-left font-semibold uppercase tracking-wide text-xs md:text-sm"
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
      <tbody className="divide-y divide-stone-600">
        {table.getRowModel().rows.map((row, index) => (
          <tr
            key={row.id}
            className={`hover:bg-stone-700 transition-colors ${
              index % 2 === 0 ? "bg-stone-800" : "bg-stone-700"
            }`}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                className="px-2 py-2 md:px-4 md:py-3 text-stone-300 text-xs md:text-sm whitespace-nowrap"
                key={cell.id}
              >
                <div
                  className="truncate max-w-[120px] md:max-w-none"
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
