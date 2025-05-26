import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import api from "@/api";
import { importFilter } from "@/utils/import";

export const useExpenses = () => {
  const min = { year: 2020, month: 1 };
  const max = { year: new Date().getFullYear(), month: 12 };

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState("");
  const [data, setData] = useState({
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

  const currentState = useRef({
    year: parameters.year,
    month: parameters.month,
    group: parameters.category,
    personal: parameters.personal,
  });

  const properties = useMemo(() => {
    let idKey, totalKey, numberKey;
    data.table.forEach((item) => {
      for (const prop in item) {
        const lowerCaseProp = prop.toLowerCase();
        if (lowerCaseProp.includes("id")) idKey = prop;
        if (lowerCaseProp.includes("total")) totalKey = prop;
        if (lowerCaseProp.includes("number")) numberKey = prop;
      }
    });
    return { id: idKey, total: totalKey, number: numberKey };
  }, [data.table]);

  const categoryCheck = useMemo(() => {
    return Boolean(parameters.personal)
      ? Boolean(parameters.personal) === Boolean(currentState.current.personal)
      : Boolean(parameters.personal) ===
          Boolean(currentState.current.personal) &&
          String(parameters.group) === String(currentState.current.group);
  }, [parameters.group, parameters.personal]);

  const categories = useMemo(() => {
    if (
      data.data.length &&
      categoryCheck &&
      String(parameters.year) === String(currentState.current.year) &&
      String(parameters.month) === String(currentState.current.month)
    ) {
      return data.data
        .map((item) => item.category)
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  }, [data.data, categoryCheck, parameters.year, parameters.month]);
  const expenses = useMemo(() => {
    if (!parameters.category) {
      return data.table.map((item) =>
        importFilter(item, properties.id, false, true)
      );
    }

    const found = categories.find(
      (item) => String(item.id) === String(parameters.category)
    );
    const filters = found
      ? data.data.filter((item) => item.category.name === found.name)
      : data.data;

    let total = 0;
    return data.table
      .filter((item) =>
        filters.map((item) => item.id).includes(item[properties.id])
      )
      .map((item, index) => {
        total += Number(
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
  }, [
    data.data,
    data.table,
    parameters.category,
    parameters.personal,
    categories,
    properties,
  ]);

  const summaryInfo = useMemo(() => {
    if (data.data.length > 0) {
      const costKey = parameters.personal ? "user_cost" : "cost";

      let filteredData = data.data;
      if (parameters.category) {
        const found = categories.find(
          (item) => String(item.id) === String(parameters.category)
        );
        if (found) {
          filteredData = data.data.filter(
            (item) => item.category.name === found.name
          );
        }
      }

      const total = filteredData.reduce((acc, item) => {
        return acc + Number(item[costKey] || 0);
      }, 0);

      const now = new Date();
      let averageDivider = 1;

      if (parameters.personal) {
        const currentMonth = parseInt(parameters.month);
        const currentYear = parseInt(parameters.year);

        if (currentMonth && currentYear) {
          const inputDate = new Date(currentYear, currentMonth - 1, 1);
          if (
            inputDate.getFullYear() === now.getFullYear() &&
            inputDate.getMonth() === now.getMonth()
          ) {
            averageDivider = now.getDate();
          } else {
            const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
            averageDivider = lastDayOfMonth.getDate();
          }
        }
      } else {
        averageDivider = data.groups.length || 1;
      }

      return {
        total: total.toLocaleString("en", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false,
        }),
        average: (total / averageDivider).toLocaleString("en", {
          useGrouping: false,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    }
    return null;
  }, [
    data.data,
    data.groups,
    parameters.personal,
    parameters.category,
    parameters.month,
    parameters.year,
    categories,
  ]);
  const initializeData = useCallback(async () => {
    setLoading(true);
    setStatus("Loading");
    try {
      const [groups, downloads] = await Promise.all([
        api.getGroups(),
        api.getDownloads(),
      ]);
      setData((prev) => ({ ...prev, groups }));
      setDownloads(downloads);
      setStatus("Ready");
    } catch (error) {
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpenses = useCallback(
    async (formData = null) => {
      const searchParams = formData || parameters;
      setStatus("Loading");

      currentState.current = {
        year: searchParams.year,
        month: searchParams.month,
        group: searchParams.group,
        personal: searchParams.personal,
      };

      setData((prev) => ({ ...prev, data: [], table: [], chart: [] }));

      try {
        const {
          data: expenseData,
          table,
          chart,
        } = await api.getExpenses(
          importFilter(searchParams, ["category", "csv"], false)
        );

        if (expenseData) {
          if (table && chart) {
            setData((prev) => ({ ...prev, data: expenseData, table, chart }));
          }
          setStatus(expenseData.length ? "" : "No expenses");

          if (expenseData.length && searchParams.csv) {
            setLoading(true);
            try {
              await api.getExpenses(searchParams);
              const newDownloads = await api.getDownloads();
              setDownloads(newDownloads);
            } finally {
              setLoading(false);
            }
          }

          if (searchParams.category) {
            setParameters((prev) => ({ ...prev, category: null }));
          }
        } else {
          setStatus("Error");
        }
      } catch (error) {
        setStatus("Error");
      }
    },
    [parameters]
  );

  const updateParameters = useCallback((updates) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleDateChange = useCallback(
    (dateValue) => {
      updateParameters({
        month: dateValue.month,
        year: dateValue.year,
      });
    },
    [updateParameters]
  );
  useEffect(() => {
    if (parameters.category) {
      setParameters((prev) => ({ ...prev, category: null }));
    }
  }, [categories.length]);

  return {
    status,
    loading,
    downloads,
    data,
    parameters,
    expenses,
    categories,
    summaryInfo,
    min,
    max,
    setParameters: updateParameters,
    handleDateChange,
    initializeData,
    fetchExpenses,
    properties,
    categoryCheck,
  };
};
