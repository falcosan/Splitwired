import api from "@/api";
import Plot from "react-plotly.js";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { importFilter } from "@/utils/import";
import { useRemovesNullClass } from "@/hooks";
import React, { useState, useMemo, useLayoutEffect } from "react";

export default function Home() {
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
    year: new Date().getFullYear(),
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
        setStatus(data.length ? "" : "No expenses");
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
    groups: { label: "Group", options: groups, parameter: "group" },
    categories: {
      label: "Category",
      options: categories,
      parameter: "category",
    },
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
        state.type = "number";
        state.target = "value";
        break;
      case "year":
        state.min = 2020;
        state.max = new Date().getFullYear();
        state.type = "number";
        state.target = "value";
        break;
    }
    return { label: key, name: key, value, ...state };
  });
  useRemovesNullClass();
  return (
    <div className="p-5">
      <div className="container mx-auto">
        {downloads.length ? (
          <div>
            <span className="block mb-2.5">Downloads</span>
            <ul
              className="p-2.5 overflow-y-auto rounded bg-slate-200"
              dangerouslySetInnerHTML={{ __html: downloads }}
            />
          </div>
        ) : null}
        <div className="space-y-5 mt-5">
          <form
            onSubmit={getData}
            className="flex flex-col items-start space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.values(selects).map((select, index) => (
                <Select
                  {...select}
                  key={index}
                  getSelectValue={(value) =>
                    setParameters({ ...parameters, [select.parameter]: value })
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Object.values(inputs).map((input) => (
                <Input
                  className={`justify-self-start self-start ${
                    input.type == null || /text|number/.test(input.type)
                      ? "min-w-[200px]"
                      : null
                  }`}
                  key={input.name}
                  {...input}
                  getInputValue={(value) =>
                    setParameters({
                      ...parameters,
                      [input.name]: value,
                    })
                  }
                />
              ))}
            </div>
            <Input
              className="self-end p-2.5 rounded text-white bg-blue-800"
              type="submit"
              value="generate expense"
            />
          </form>
        </div>
        {status ? (
          <span className="block w-full mt-10 text-center text-lg font-bold">
            {status}
          </span>
        ) : expenses.length ? (
          <>
            <hr className="mt-10" />
            <div className="overflow-x-auto">
              <Table className="w-full mt-10" data={expenses} />
            </div>
          </>
        ) : null}

        {chart.length && !status ? (
          <>
            <hr className="mt-10" />
            <div className="overflow-x-auto">
              {Array.from({ length: chart.length }, (_, i) => (
                <Plot
                  className="w-full mt-10"
                  key={i}
                  data={chart[i].data}
                  layout={chart[i].layout}
                  config={chart[i].config}
                  useResizeHandler
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
