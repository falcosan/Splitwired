import api from "@/api";
import Plot from "react-plotly.js";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { importFilter } from "@/utils/import";
import { useRemovesNullClass } from "@/hooks";
import React, {
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
  useEffect,
} from "react";

export default function Home() {
  const min = {
    year: 2020,
    month: 1,
  };
  const max = {
    year: new Date().getFullYear(),
    month: 12,
  };
  const [status, setStatus] = useState("");
  const [downloads, setDownloads] = useState("");
  const [{ data, table, chart, groups, average }, setData] = useState({
    data: [],
    table: [],
    chart: [],
    groups: [],
    average: 0,
  });
  const [parameters, setParameters] = useState({
    personal: true,
    csv: false,
    month: null,
    year: String(max.year),
    group: null,
    chart: ["pie", "bar"],
    category: null,
  });
  const currentYear = useRef(parameters.year);
  const currentMonth = useRef(parameters.month);
  const currentGroup = useRef(parameters.category);
  const currentPersonal = useRef(parameters.personal);
  useRemovesNullClass();
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
  const categoryCheck = useMemo(() => {
    return Boolean(parameters.personal)
      ? Boolean(parameters.personal) === Boolean(currentPersonal.current)
      : Boolean(parameters.personal) === Boolean(currentPersonal.current) &&
          String(parameters.group) === String(currentGroup.current);
  }, [
    parameters.group,
    parameters.personal,
    currentGroup.current,
    currentPersonal.current,
  ]);
  const categories = useMemo(() => {
    if (
      data.length &&
      categoryCheck &&
      String(parameters.year) === String(currentYear.current) &&
      String(parameters.month) === String(currentMonth.current)
    ) {
      return data
        .map((item) => item.category)
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
        .sort((a, b) => a.name.localeCompare(b.name));
    } else return [];
  }, [data, categoryCheck, parameters.year, parameters.month]);
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

  const query = useMemo(() => {
    function builderQuery(version) {
      const params = {
        ...(version === "static" && {
          year: currentYear.current,
          month: currentMonth.current,
          group: currentGroup.current,
          category: parameters.category,
          personal: currentPersonal.current,
        }),
        ...(version === "dynamic" && {
          year: parameters.year,
          month: parameters.month,
          group: parameters.group,
          category: parameters.category,
          personal: parameters.personal,
        }),
      };
      const group = (() => {
        if (params.personal) {
          return "DD";
        } else if (params.group) {
          const found = groups.find(
            (group) => String(group.id) === String(params.group)
          );
          return found ? found.name : "";
        } else return "Ago&Dan";
      })();
      const category = (() => {
        if (
          params.category &&
          (version === "dynamic" ? parameters.csv && categoryCheck : true)
        ) {
          const found = categories.find(
            (category) => String(category.id) === String(params.category)
          );
          return found ? ` - ${found.name}` : "";
        } else return "";
      })();
      const month =
        (() => {
          if (params.month) {
            const num = params.month;
            if (num >= min.month && num <= max.month) {
              const date = new Date();
              date.setMonth(num - 1);
              return ` - ${date.toLocaleString("en", { month: "long" })}${
                params.month && !params.year ? ` - ${max.year}` : ""
              }`;
            }
          }
        })() ?? "";
      const year = (() => {
        if (
          params.year &&
          +params.year >= min.year &&
          +params.year <= max.year
        ) {
          return ` - ${params.year}`;
        } else return "";
      })();
      return `${group}${category}${month}${year}`;
    }
    return {
      searched: builderQuery("dynamic"),
      current: builderQuery("static"),
    };
  }, [
    data,
    categoryCheck,
    parameters.csv,
    parameters.year,
    parameters.month,
    parameters.group,
    parameters.personal,
    parameters.category,
    currentYear.current,
    currentMonth.current,
  ]);
  useEffect(() => {
    setParameters({
      ...parameters,
      ...(parameters.category && { category: null }),
    });
  }, [categories]);
  useLayoutEffect(() => {
    Promise.all([api.getGroups(), api.getDownloads()]).then(
      async ([groups, downloads]) => {
        setData({ data, table, chart, groups, average });
        setDownloads(downloads);
      }
    );
  }, []);
  const getData = (e) => {
    e.preventDefault();
    setStatus("Loading");
    currentYear.current = parameters.year;
    currentGroup.current = parameters.group;
    currentMonth.current = parameters.month;
    currentPersonal.current = parameters.personal;
    setData({ data: [], table: [], chart: [], groups, average });
    api
      .getExpanses(importFilter(parameters, ["category", "csv"], false))
      .then(({ data, table, chart, average }) => {
        if (data) {
          if (table && chart) setData({ data, table, chart, groups, average });
          setStatus(data.length ? "" : "No expenses");
          if (data.length && parameters.csv) {
            api
              .getExpanses(parameters)
              .then(() => api.getDownloads().then((res) => setDownloads(res)));
          }
          setParameters({
            ...parameters,
            ...(parameters.category && { category: null }),
          });
        } else setStatus("Error");
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
        state.min = min.month;
        state.max = max.month;
        state.type = "number";
        state.target = "value";
        break;
      case "year":
        state.min = min.year;
        state.max = max.year;
        state.type = "number";
        state.target = "value";
        break;
    }
    return { label: key, name: key, value, ...state };
  });
  return (
    <section className="min-h-screen p-5 bg-zinc-900">
      <div className="container mx-auto">
        {downloads.length ? (
          <div>
            <span className="block mb-2.5 text-slate-300">Downloads</span>
            <ul
              className="p-2.5 overflow-y-auto rounded bg-slate-200"
              dangerouslySetInnerHTML={{ __html: downloads }}
            />
          </div>
        ) : null}
        <span className="block mt-5 font-semibold text-slate-300">
          {query.searched}
        </span>
        <form
          onSubmit={getData}
          className="flex flex-col items-start space-y-5 mt-5"
        >
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Object.values(selects).map((select, index) => (
              <Select
                {...select}
                key={index}
                className="min-w-[200px]"
                getSelectValue={(value) =>
                  setParameters({ ...parameters, [select.parameter]: value })
                }
              />
            ))}
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {inputs.map((input) => (
              <Input
                className={`justify-self-start self-start ${
                  input.type == null || /text|number/.test(input.type)
                    ? "w-full min-w-[200px]"
                    : "w-32"
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
            className="self-end p-2.5 rounded border-2 hover:bg-opacity-80 border-slate-200 text-zinc-900 bg-[#5dc4a7]"
            type="submit"
            value="Expenses"
          />
        </form>
        {data.length ? (
          <span className="block mt-5 text-slate-300">Average {average} €</span>
        ) : null}
        <span className="block mt-5 text-lg font-semibold text-slate-300">
          {data.length || status ? query.current : "No query"}
        </span>
        <hr className="mt-5 border-slate-600" />
        {status ? (
          <span className="block w-full mt-10 text-center text-lg font-semibold text-slate-300">
            {status}
          </span>
        ) : expenses.length ? (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full mt-10" data={expenses} />
            </div>
          </>
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
    </section>
  );
}
