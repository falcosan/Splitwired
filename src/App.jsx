import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { useRemovesNullClass } from "@/hooks";
import { importFilter } from "@/utils/import";
import React, { useState, useMemo } from "react";

export default function App() {
  const [data, setData] = useState([]);
  const [parameters, setParameters] = useState({
    groups: false,
    personal: false,
    csv: false,
    month: null,
    year: null,
    category: null,
  });
  const inputs = useMemo(() => {
    return Object.entries(importFilter(parameters, ["category"], false)).map(
      ([key, value]) => {
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
      }
    );
  }, [parameters]);
  const categoryKey = useMemo(() => {
    let key;
    data.forEach((item) => {
      for (let prop in item) {
        if (/category/.test(prop.toLowerCase())) key = prop;
      }
    });
    return key;
  });
  const categories = useMemo(() => {
    return [...new Set(data.map((item) => item[categoryKey]))].map(
      (category, index) => ({
        name: category,
        id: index,
      })
    );
  }, [data]);
  const expenses = useMemo(() => {
    if (parameters.category)
      return data.filter(
        (item) => item[categoryKey] === categories[+parameters.category].name
      );
    else return data;
  });
  const getData = () => {
    fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(importFilter(parameters, "category", false)),
      headers: new Headers({
        "content-type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((data) => setData(data));
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
      </div>
      <button onClick={getData}>click me</button>
      <Table data={expenses} />
    </div>
  );
}
