import api from "./api";
import Plot from "react-plotly.js";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { useRemovesNullClass } from "@/hooks";
import { importFilter } from "@/utils/import";
import React, { useState, useMemo, useLayoutEffect } from "react";

export default function App() {
  const [status, setStatus] = useState("");
  const [downloads, setDownloads] = useState("");
  const [{ data, table, chart, groups }, setData] = useState({
    data: [],
    table: [],
    chart: [],
    groups: [],
  });
  const [parameters, setParameters] = useState({
    personal: false,
    csv: false,
    month: null,
    year: null,
    group: null,
    chart: ["pie", "bar"],
    category: null,
  });
  const properties = useMemo(() => {
    let idKey;
    let totalKey;
    let numberKey;
    table.forEach((item) => {
      for (const prop in item) {
        const loweCaseProp = prop.toLowerCase();
        if (loweCaseProp.includes("id")) idKey = prop;
        if (loweCaseProp.includes("total")) totalKey = prop;
        if (loweCaseProp.includes("number")) numberKey = prop;
      }
    });
    return {
      id: idKey,
      total: totalKey,
      number: numberKey,
    };
  }, [data]);
  const categories = useMemo(() => {
    return data
      .map((item) => item.category)
      .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);
  const expenses = useMemo(() => {
    let total = 0;
    if (parameters.category) {
      const found = categories.find(
        (item) => String(item.id) === String(parameters.category)
      );
      const filters = found
        ? data.filter((item) => item.category.name === found.name)
        : data;
      return table
        .filter((item) =>
          filters.map((item) => item.id).includes(item[properties.id])
        )
        .map((item, index) => {
          total = total += Number(
            filters[index][parameters.personal ? "user_cost" : "cost"]
          );
          return {
            ...item,
            [properties.number]: index + 1,
            [properties.total]: total.toLocaleString("en", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            }),
          };
        });
    } else return table;
  }, [data, parameters.category]);
  useLayoutEffect(() => {
    Promise.all([api.getGroups(), api.getDownloads()]).then(
      async ([groups, downloads]) => {
        setData({ data, table, chart, groups });
        setDownloads(downloads);
      }
    );
  }, []);
  const getData = (e) => {
    e.preventDefault();
    setData({ data, table, chart, groups });
    setStatus("loading");
    api
      .getExpanses(importFilter(parameters, ["category"], false))
      .then(({ data, table, chart }) => {
        setStatus(data.length ? "" : "No expanses");
        setData({ data, table, chart, groups });
      })
      .finally(() => {
        if (parameters.csv) {
          api.getDownloads().then((res) => setDownloads(res));
        }
        setParameters({
          ...parameters,
          ...(parameters.category && { category: null }),
        });
        e.target.reset();
      });
  };
  const selects = {
    groups: { label: "Group", options: groups },
    categories: { label: "Category", options: categories },
  };
  const inputs = Object.entries(
    importFilter(parameters, ["group", "chart", "category"], false)
  ).map(([key, value]) => {
    const state = { type: "", target: "", max: null, min: null };
    switch (key) {
      case "personal":
      case "csv":
        state.type = "checkbox";
        state.target = "checked";
        break;
      case "month":
        state.min = 1;
        state.max = 12;
      case "year":
        state.type = "number";
        state.target = "value";
        break;
    }
    return { label: key, name: key, value, ...state };
  });
  useRemovesNullClass();
  return (
    <div className="p-2 bg-green-400">
      <Select
        {...selects.groups}
        getSelectValue={(value) =>
          setParameters({ ...parameters, group: value })
        }
      />
      <form
        onSubmit={getData}
        className="flex flex-col items-start space-y-2.5"
      >
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
        <Select
          {...selects.categories}
          getSelectValue={(value) =>
            setParameters({ ...parameters, category: value })
          }
        />
        <Input type="submit" value="click me" />
      </form>
      <ul dangerouslySetInnerHTML={{ __html: downloads }} />
      {status || (
        <>
          <Table data={expenses} />
          <div className="mt-5">
            {Array.from({ length: chart.length }, (_, i) => (
              <Plot
                key={i}
                data={chart[i].data}
                layout={chart[i].layout}
                config={chart[i].config}
                useResizeHandler
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
