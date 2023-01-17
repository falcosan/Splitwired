import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { useRemovesNullClass } from "@/hooks";
import { importFilter } from "@/utils/import";
import React, { useState, useLayoutEffect, useMemo } from "react";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parameters, setParameters] = useState({
    groups: false,
    personal: false,
    csv: false,
    month: null,
    year: null,
    category: null,
    subcategory: null,
  });
  useLayoutEffect(() => {
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
      return { label: key, name: key, type, target, value };
    });
  }, [parameters]);
  const subCategories = useMemo(() => {
    const choosesCategory = categories.find(
      (category) => String(category.id) === String(parameters.category)
    );
    return choosesCategory?.subcategories ?? [];
  }, [parameters.category]);
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
  useRemovesNullClass();
  return (
    <div className="p-2 bg-green-500">
      <div className="flex flex-col items-start space-y-2.5">
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
          <Select
            options={categories}
            getSelectValue={(value) =>
              setParameters({ ...parameters, category: value })
            }
          />
        )}
        {subCategories.every((s) => s.id != null && s.name) && (
          <Select
            options={subCategories}
            getSelectValue={(value) =>
              setParameters({ ...parameters, subcategory: value })
            }
          />
        )}
      </div>
      <button onClick={getExpenses}>click me</button>
      <Table data={expenses} />
    </div>
  );
}
