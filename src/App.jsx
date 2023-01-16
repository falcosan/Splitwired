import { importFilter } from "@/utils/import";
import Input from "@/components/Input";
import React, { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parameters, setParameters] = useState({
    groups: false,
    personal: false,
    csv: false,
    month: 1,
    year: 2023,
    category: null,
    subcategory: null,
  });
  useEffect(() => {
    fetch("/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);
  const inputs = useMemo(() => {
    return Object.entries(
      importFilter(parameters, ["category", "subcategory"], false)
    ).map(([key, value]) => {
      let type = "";
      let target = "";
      switch (key) {
        case "groups":
        case "personal":
        case "csv":
          type = "checkbox";
          target = "checked";
          break;
        case "month":
        case "year":
          type = "number";
          target = "value";
          break;
      }
      return { key, name: key, type, target, value };
    });
  }, [parameters]);
  const subCategories = useMemo(() => {
    const choosesCategory = categories.find(
      (category) => String(category.id) === String(parameters.category)
    );
    return choosesCategory?.subcategories ?? [];
  }, [parameters.category]);
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
  const getExpenses = () => {
    fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(importFilter(parameters, "subcategory", false)),
      headers: new Headers({
        "content-type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data));
  };
  return (
    <div className="p-2 bg-red-500">
      {Object.values(inputs).map((param) => (
        <Input
          key={param.name}
          {...param}
          getInputValue={(value) =>
            setParameters({
              ...parameters,
              [param.name]: value,
            })
          }
        />
      ))}
      {categories.every((c) => c.id != null && c.name) && (
        <select
          onChange={(e) =>
            setParameters({ ...parameters, category: e.target.value })
          }
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
      {subCategories.every((s) => s.id != null && s.name) && (
        <select
          onChange={(e) =>
            setParameters({ ...parameters, category: e.target.value })
          }
        >
          {subCategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      )}
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
