import React, { useState, useMemo, useLayoutEffect, useRef, useEffect } from "react";
import api from "@/api";
import Plot from "react-plotly.js";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { importFilter } from "@/utils/import";
import { useRemovesNullClass } from "@/hooks";

export default function Home() {
  const min = { year: 2020, month: 1 };
  const max = { year: new Date().getFullYear(), month: 12 };

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState("");
  const [{ data, table, chart, groups }, setData] = useState({
    data: [], table: [], chart: [], groups: []
  });

  const [parameters, setParameters] = useState({
    personal: true,
    csv: false,
    group: null,
    category: null,
    chart: ["pie", "bar"],
    monthYear: `${max.year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    year: new Date().getFullYear(),
  });

  const currentYear = useRef(parameters.year);
  const currentMonthYear = useRef(parameters.monthYear);
  const currentGroup = useRef(parameters.group);
  const currentPersonal = useRef(parameters.personal);

  const properties = useMemo(() => {
    const keys = { id: "", total: "", number: "" };
    table.forEach((item) => {
      Object.keys(item).forEach((prop) => {
        const lowerCaseProp = prop.toLowerCase();
        if (lowerCaseProp.includes("id")) keys.id = prop;
        if (lowerCaseProp.includes("total")) keys.total = prop;
        if (lowerCaseProp.includes("number")) keys.number = prop;
      });
    });
    return keys;
  }, [table]);

  const categoryCheck = useMemo(() => {
    return Boolean(parameters.personal) === Boolean(currentPersonal.current) && (parameters.personal || String(parameters.group) === String(currentGroup.current));
  }, [parameters.group, parameters.personal, currentGroup, currentPersonal]);

  const categories = useMemo(() => {
    if (data.length && categoryCheck && (parameters.monthYear === currentMonthYear.current || currentYear.current)) {
      return data
        .map((item) => item.category)
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  }, [data, categoryCheck, parameters.monthYear, parameters.year]);

  const expenses = useMemo(() => {
    if (!parameters.category) {
      return table.map((item) => importFilter(item, properties.id, false, true));
    }

    const categoryItem = categories.find(
      (item) => String(item.id) === String(parameters.category)
    );

    const filteredData = categoryItem
      ? data.filter((item) => item.category.name === categoryItem.name) 
      : data;

    let total = 0;
    return table
      .filter((item) => filteredData.map((dataItem) => dataItem.id).includes(item[properties.id]))
      .map((item, index) => {
        total += Number(filteredData[index][parameters.personal ? "user_cost" : "cost"]);
        return {
          ...importFilter(item, properties.id, false, true),
          [properties.number]: index + 1,
          [properties.total]: total.toLocaleString("en", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false,
          }),
        };
      });
  }, [data, parameters.category, parameters.personal, table, categories]);

  const query = useMemo(() => {
    const buildQuery = (version) => {
      const params = {
        ...(version === "static" && {
          group: currentGroup.current,
          category: parameters.category,
          year: currentYear.current,
          personal: currentPersonal.current,
          monthYear: currentMonthYear.current,
        }),
        ...(version === "dynamic" && {
          group: parameters.group,
          category: parameters.category,
          personal: parameters.personal,
          year: parameters.year,
          monthYear: parameters.monthYear,
        }),
      };

      const group = params.personal 
        ? "Personal" 
        : params.group 
          ? groups.find((g) => String(g.id) === String(params.group))?.name || "" 
          : "Home";

      const category = params.category && 
        (version === "dynamic" ? parameters.csv && categoryCheck : true)
        ? ` - ${categories.find((c) => String(c.id) === String(params.category))?.name || ""}`
        : "";

      let dateString = "";
      if (params.monthYear) {
        const [year, month] = params.monthYear.split('-');
        const selectedDate = new Date(year, month - 1);
        const monthName = selectedDate.toLocaleString("en", { month: "long" });
        dateString = ` - ${monthName} - ${year}`;
      } else if (params.year) {
        dateString = ` - ${params.year}`;
      } else {
        dateString = " - All time";
      }

      return `${group}${category}${dateString}`;
    };

    return {
      searched: buildQuery("dynamic"),
      current: buildQuery("static"),
    };
  }, [data, categoryCheck, parameters, currentMonthYear, currentGroup, currentPersonal, groups, categories]);

  const info = useMemo(() => {
    if (!expenses.length) return null;
    const total = expenses[expenses.length - 1][properties.total];
    let averageDivider;

    if (parameters.monthYear) {
      const [year, month] = parameters.monthYear.split('-');
      const date = new Date(year, month - 1);
      const now = new Date();
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        averageDivider = now.getDate();
      } else {
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        averageDivider = lastDayOfMonth.getDate();
      }
    } else if (parameters.year) {
      const selectedYear = new Date().getFullYear();
      if (parameters.year === selectedYear) {
        averageDivider = new Date().getDate() + new Date().getMonth() * 30;
      } else {
        averageDivider = 365;
      }
    } else {
      const firstExpense = new Date(expenses[0].Date);
      const lastExpense = new Date(expenses[expenses.length - 1].Date);
      averageDivider = (lastExpense - firstExpense) / (1000 * 60 * 60 * 24) + 1;
    }

    return {
      total,
      average: (+total / averageDivider).toLocaleString("en", {
        useGrouping: false,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  }, [expenses, parameters.monthYear, parameters.year]);

  useEffect(() => {
    setParameters((prevParams) => ({
      ...prevParams,
      category: null,
    }));
  }, [categories]);

  useLayoutEffect(() => {
    setLoading(true);
    setStatus("Loading");
    Promise.all([api.getGroups(), api.getDownloads()])
      .then(([groups, downloads]) => {
        setData((prevData) => ({ ...prevData, groups }));
        setDownloads(downloads);
        setStatus("Ready");
        setLoading(false);
      })
      .catch(() => setStatus("Error"));
  }, []);

  const getData = async (e) => {
    e.preventDefault();
    setStatus("Loading");
    currentMonthYear.current = parameters.monthYear;
    currentYear.current = parameters.year;
    currentGroup.current = parameters.group;
    currentPersonal.current = parameters.personal;

    try {
      const requestParams = {
        ...importFilter(parameters, ["category", "csv"], false),
      };

      if (parameters.monthYear) {
        const [year, month] = parameters.monthYear.split('-');
        requestParams.year = year;
        requestParams.month = month;
      } else if (parameters.year) {
        requestParams.year = parameters.year;
      }

      const { data, table, chart } = await api.getExpenses(requestParams);

      if (data) {
        setData({ data, table, chart, groups });
        setStatus(data.length ? "" : "No expenses");

        if (data.length && parameters.csv) {
          setLoading(true);
          await api.getExpenses(parameters);
          const newDownloads = await api.getDownloads();
          setDownloads(newDownloads);
          setLoading(false);
        }

        setParameters((prevParams) => ({
          ...prevParams,
          category: null,
        }));
      } else {
        setStatus("Error");
      }
    } catch (error) {
      setStatus("Error");
    }
  };

  const getLogout = async () => await api.getLogout();

  const selects = {
    groups: { label: "Group", options: groups, parameter: "group" },
    categories: { label: "Category", options: categories, parameter: "category" },
  };

  const inputs = Object.entries(
    importFilter(parameters, ["group", "chart", "category"], false)
  ).map(([key, value]) => {
    const state = { label: key, type: "", target: "", max: null, min: null };

    switch (key.toLowerCase()) {
      case "personal":
      case "csv":
        state.type = "checkbox";
        state.target = "checked";
        state.label = key === "csv" ? key.toUpperCase() : key;
        break;
      case "monthyear":
        state.type = "month";
        state.target = "value";
        state.min = `${min.year}-01`;
        state.max = `${max.year}-12`;
        break;
      case "year":
        state.type = "number";
        state.target = "value";
        state.min = min.year;
        state.max = max.year;
        break;
    }

    return { value, name: key, ...state };
  });

  useRemovesNullClass();

  return (
    <div className="container mx-auto">
      <div className="flex">
        <Input
          className="p-2.5 font-semibold rounded border-2 hover:bg-opacity-80 border-slate-300 text-zinc-900 bg-[#5dc4a7]"
          type="submit"
          onClick={getLogout}
          value="Logout"
        />
      </div>
      <div
        className={`relative flex mt-5 overflow-hidden rounded ${
          downloads.length ? null : "border-4 border-dashed"
        }`}
      >
        {loading && (
          <div
            className={`${
              downloads.length ? "absolute inset-0" : "p-2.5"
            } w-full h-full flex items-center justify-center bg-opacity-70 bg-gray-600`}
          >
            <span className="text-[16px] font-semibold text-slate-300">
              Loading
            </span>
          </div>
        )}
        {downloads.length ? (
          <ul
            className="w-full p-2.5 overflow-y-auto rounded bg-slate-300"
            dangerouslySetInnerHTML={{ __html: downloads }}
          />
        ) : (
          !loading && (
            <span className="block p-2.5 mx-auto text-[16px] font-semibold text-slate-300">
              Downloads
            </span>
          )
        )}
      </div>
      <span className="block mt-5 text-[16px] font-semibold text-slate-300">
        {query.searched}
      </span>
      <form onSubmit={getData} className="flex flex-col items-start space-y-5 mt-5">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Object.values(selects).map((select, index) => (
            <Select
              {...select}
              key={index}
              className="min-w-[200px]"
              getSelectValue={(value) =>
                setParameters((prevParams) => ({
                  ...prevParams,
                  [select.parameter]: value,
                }))
              }
            />
          ))}
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {inputs.map((input) => (
            <Input
              className={`justify-self-start self-start ${
                input.type == null || /text|number|month/.test(input.type)
                  ? "w-full min-w-[200px] col-start-3 col-end-5"
                  : "w-32"
              }`}
              key={input.name}
              {...input}
              disabled={input.name === 'year' ? !!parameters.monthYear : false}
              getInputValue={(value) => setParameters((prevParams) => ({ ...prevParams, [input.name]: value }))}
            />
          ))}
        </div>
        <Input
          className={`self-end p-2.5 font-semibold rounded border-2 border-slate-300 text-zinc-900 ${
            status.toLowerCase() === "loading"
              ? "bg-slate-300"
              : "hover:bg-opacity-80 bg-[#5dc4a7]"
          }`}
          type="submit"
          disabled={status.toLowerCase() === "loading"}
          value="Calculate"
        />
      </form>
      {info && (
        <>
          <span className="block mt-5 text-slate-300">
            Total {info.total} €
          </span>
          <span className="block mt-5 text-slate-300">
            Average {info.average} €
          </span>
        </>
      )}
      <span className="block mt-5 text-[16px] font-semibold text-slate-300">
        {data.length || status ? query.current : ""}
      </span>
      <hr className="mt-5 border-slate-600" />
      {status ? (
        <span className="block w-full mt-10 text-center text-[16px] font-semibold text-slate-300">
          {status}
        </span>
      ) : expenses.length ? (
        <div className="overflow-x-auto">
          <Table className="w-full mt-10" data={expenses} />
        </div>
      ) : null}
      {chart.length && !status ? (
        <>
          <hr className="mt-10 border-slate-600" />
          <div className="overflow-x-auto">
            {Array.from({ length: chart.length }, (_, i) => (
              <Plot
                className="w-full mt-10 rounded overflow-hidden"
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
  );
}
