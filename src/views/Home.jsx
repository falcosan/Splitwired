import api from "@/api";
import Table from "@/components/Table";
import { importFilter } from "@/utils/import";
import { useRemovesNullClass } from "@/hooks";
import FormComponent from "@/components/FormComponent";
import ChartsComponent from "@/components/ChartsComponent";
import SummaryComponent from "@/components/SummaryComponent";
import DownloadsComponent from "@/components/DownloadsComponent";
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
  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState("");
  const [{ data, table, chart, groups }, setData] = useState({
    data: [],
    table: [],
    chart: [],
    groups: [],
  });
  const [parameters, setParameters] = useState({
    personal: true,
    csv: false,
    month: String(new Date().getMonth() + 1),
    year: String(max.year),
    group: null,
    chart: ["pie", "bar"],
    category: null,
  });
  const currentYear = useRef(parameters.year);
  const currentMonth = useRef(parameters.month);
  const currentGroup = useRef(parameters.category);
  const currentPersonal = useRef(parameters.personal);
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
            ...importFilter(item, properties.id, false, true),
            [properties.number]: index + 1,
            [properties.total]: total.toLocaleString("en", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: false,
            }),
          };
        });
    } else
      return table.map((item) =>
        importFilter(item, properties.id, false, true)
      );
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
          return "Personal";
        } else if (params.group) {
          const found = groups.find(
            (group) => String(group.id) === String(params.group)
          );
          return found ? found.name : "";
        } else return "Home";
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
  const info = useMemo(() => {
    if (expenses.length) {
      const now = new Date();
      let averageDivider = expenses.length;
      const date = [+currentYear.current, +currentMonth.current];
      const total = expenses[expenses.length - 1][properties.total];
      if (date[0] && date[1]) {
        const inputDate = new Date(date[0], date[1] - 1, 1);
        if (inputDate.getMonth() === now.getMonth()) {
          averageDivider = now.getDate();
        } else {
          const lastDayOfMonth = new Date(date[0], date[1], 0);
          averageDivider = lastDayOfMonth.getDate();
        }
      } else if (date[0]) {
        averageDivider = new Date(data[0], 1, 29).getDate() === 29 ? 366 : 365;
      } else if (expenses[0]["Date"]) {
        const start_year = new Date(expenses[0]["Date"]).getFullYear();
        const end_year = new Date(
          expenses[expenses.length - 1]["Date"]
        ).getFullYear();
        const start_date = new Date(start_year, 0, 1);
        const end_date = new Date(end_year, 11, 31);
        const difference = end_date - start_date;
        averageDivider = difference / (1000 * 60 * 60 * 24);
      }
      return {
        total,
        average: (+total / averageDivider).toLocaleString("en", {
          useGrouping: false,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    } else {
      return null;
    }
  }, [expenses, currentYear.current, currentMonth.current]);
  useEffect(() => {
    setParameters({
      ...parameters,
      ...(parameters.category && { category: null }),
    });
  }, [categories]);
  useLayoutEffect(() => {
    setLoading(true);
    setStatus("Loading");
    Promise.all([api.getGroups(), api.getDownloads()])
      .then(([groups, downloads]) => {
        setData({ data, table, chart, groups });
        setDownloads(downloads);
        setStatus("Ready");
        setLoading(false);
      })
      .catch(() => setStatus("Error"));
  }, []);
  const getData = async (e) => {
    e.preventDefault();
    setStatus("Loading");
    currentYear.current = parameters.year;
    currentGroup.current = parameters.group;
    currentMonth.current = parameters.month;
    currentPersonal.current = parameters.personal;
    setData({ data: [], table: [], chart: [], groups });
    await api
      .getExpenses(importFilter(parameters, ["category", "csv"], false))
      .then(async ({ data, table, chart }) => {
        if (data) {
          if (table && chart) setData({ data, table, chart, groups });
          setStatus(data.length ? "" : "No expenses");
          if (data.length && parameters.csv) {
            setLoading(true);
            await api
              .getExpenses(parameters)
              .then(
                async () =>
                  await api.getDownloads().then((res) => setDownloads(res))
              )
              .finally(() => setLoading(false));
          }
          setParameters({
            ...parameters,
            ...(parameters.category && { category: null }),
          });
        } else setStatus("Error");
      });
  };
  const getLogout = async () => await api.getLogout();
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
    const state = { label: key, type: "", target: "", max: null, min: null };
    switch (key.toLowerCase()) {
      case "personal":
        state.type = "checkbox";
        state.target = "checked";
        break;
      case "csv":
        state.type = "checkbox";
        state.target = "checked";
        state.label = key.toUpperCase();
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
    return { value, name: key, ...state };
  });
  useRemovesNullClass();

  const formSelects = {
    groups: { label: "Group", options: groups, parameter: "group" },
    categories: {
      label: "Category",
      options: categories,
      parameter: "category",
    },
  };

  const formInputs = Object.entries(
    importFilter(parameters, ["group", "chart", "category"], false)
  ).map(([key, value]) => {
    const state = { label: key, type: "", target: "", max: null, min: null };
    switch (key.toLowerCase()) {
      case "personal":
        state.type = "checkbox";
        state.target = "checked";
        break;
      case "csv":
        state.type = "checkbox";
        state.target = "checked";
        state.label = key.toUpperCase();
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
    return { value, name: key, ...state };
  });

  return (
    <div className="container mx-auto">
      <div className="flex">
        <input
          className="p-2.5 font-semibold rounded border-2 hover:bg-opacity-80 border-slate-300 text-zinc-900 bg-[#5dc4a7]"
          type="submit"
          onClick={getLogout}
          value="Logout"
        />
      </div>

      <DownloadsComponent downloads={downloads} loading={loading} />

      <div className="mt-5">
        <h2 className="text-2xl font-semibold text-slate-200 mb-3">
          Filter Options
        </h2>
        <span className="block text-[16px] font-semibold text-slate-300 mb-3">
          {query.searched}
        </span>
        <FormComponent
          parameters={parameters}
          setParameters={setParameters}
          status={status}
          getData={getData}
          selects={formSelects}
          inputs={formInputs}
        />
      </div>

      <SummaryComponent info={info} />

      <div className="mt-5">
        {(data.length > 0 || status) && (
          <>
            <span className="block text-[16px] font-semibold text-slate-300">
              {query.current}
            </span>
            <hr className="my-3 border-slate-600" />
          </>
        )}

        {status && status !== "Loading" && status !== "Ready" && (
          <p className="w-full my-4 text-center text-[16px] font-semibold text-slate-300">
            {status}
          </p>
        )}

        {!status && expenses.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <Table className="w-full" data={expenses} />
          </div>
        )}
        <ChartsComponent chart={chart} status={status} />
      </div>
    </div>
  );
}
