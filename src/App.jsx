import React, { useState, useEffect, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState();
  const [parameters, setParameters] = useState({
    groups: false,
    personal: false,
    csv: false,
    month: 1,
    year: 2023,
    category: false,
  });
  useEffect(() => {
    fetch("/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
    return categories;
  }, []);
  const getExpenses = () => {
    fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: new Headers({
        "content-type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data));
  };
  const setInputs = (param) => {
    return /groups|personal|csv/.test(param);
  };
  const table = useReactTable({
    columns: expenses.length
      ? Object.keys(expenses[0]).map((key) =>
          createColumnHelper().accessor(key, {
            cell: (info) => info.getValue(),
          })
        )
      : [],
    data: expenses,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="p-2">
      {Object.keys(parameters).map((param, index) => (
        <div key={index}>
          {setInputs(param) && <label>{param}</label>}
          <input
            value={parameters[param]}
            type={setInputs(param) ? "checkbox" : "number"}
            placeholder={param}
            onChange={(e) =>
              setParameters({
                ...parameters,
                [param]: setInputs(param) ? e.target.checked : +e.target.value,
              })
            }
          />
        </div>
      ))}
      <button onClick={getExpenses}>click me</button>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
