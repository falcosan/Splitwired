(function () {
  "use strict";

  const MIN_YEAR = 2020;
  const MAX_YEAR = new Date().getFullYear();
  const DOWNLOAD_SECRET = window.__DOWNLOAD_SECRET__ || "";

  let params = {
    csv: false,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    group: null,
    personal: true,
    chart: ["pie"],
    category: null,
  };

  const appData = { data: [], table: [], chart: [], groups: [] };

  let searchState = {
    year: params.year,
    month: params.month,
    group: null,
    category: null,
    personal: true,
  };

  const chartInstances = [];

  const $ = (id) => document.getElementById(id);
  const show = (el) => el.classList.remove("hidden");
  const hide = (el) => el.classList.add("hidden");
  const escAttr = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  async function apiGetGroups() {
    const r = await fetch("/groups");
    return r.json();
  }

  async function apiGetDownloads() {
    const r = await fetch("/download", {
      headers: { secret: DOWNLOAD_SECRET },
    });
    return r.text();
  }

  async function apiPostExpenses(payload) {
    const r = await fetch("/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return r.json();
  }

  function findProperties() {
    let idKey, totalKey, numberKey;

    for (const item of appData.table) {
      for (const prop in item) {
        const lp = prop.toLowerCase();
        if (lp.includes("id")) idKey = prop;
        if (lp.includes("total")) totalKey = prop;
        if (lp.includes("number")) numberKey = prop;
      }
    }

    return {
      id: idKey,
      total: totalKey || "Total",
      number: numberKey || "Number",
    };
  }

  function getCategories() {
    if (
      appData.data.length &&
      String(params.group) === String(searchState.group) &&
      String(params.year) === String(searchState.year) &&
      String(params.month) === String(searchState.month)
    ) {
      const seen = {};
      return appData.data
        .map((item) => item.category)
        .filter((cat) => {
          if (seen[cat.id]) return false;
          seen[cat.id] = true;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return [];
  }

  const fmtNum = (n) =>
    n.toLocaleString("en", {
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function getExpenses() {
    const props = findProperties();

    if (!params.category) {
      return appData.table.map((item, i) => ({
        ...item,
        [props.number]: i + 1,
      }));
    }

    const categories = getCategories();
    const found = categories.find(
      (c) => String(c.id) === String(params.category),
    );

    const filters = found
      ? appData.data.filter((item) => item.category.name === found.name)
      : appData.data;

    const isPersonal = params.personal;
    let total = 0;
    const filterIds = filters.map((f) => f.id);

    return appData.table
      .filter((item) => filterIds.includes(item[props.id]))
      .map((item, i) => {
        total += Number(filters[i][isPersonal ? "user_cost" : "cost"]);
        return {
          ...item,
          [props.number]: i + 1,
          [props.total]: fmtNum(total),
        };
      });
  }

  function getSummary() {
    if (appData.data.length === 0) return null;

    const isPersonal = searchState.personal;
    const costKey = isPersonal ? "user_cost" : "cost";
    const categories = getCategories();

    let filteredData = appData.data;
    if (params.category) {
      const found = categories.find(
        (c) => String(c.id) === String(params.category),
      );
      if (found) {
        filteredData = appData.data.filter(
          (item) => item.category.name === found.name,
        );
      }
    }

    const total = filteredData.reduce(
      (acc, item) => acc + Number(item[costKey] || 0),
      0,
    );

    let avgDiv;
    const now = new Date();

    if (searchState.year && searchState.month) {
      if (
        searchState.year === now.getFullYear() &&
        searchState.month === now.getMonth() + 1
      ) {
        avgDiv = now.getDate();
      } else {
        avgDiv = new Date(searchState.year, searchState.month, 0).getDate();
      }
    } else if (searchState.year && !searchState.month) {
      const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      avgDiv = isLeap(searchState.year) ? 366 : 365;
    } else {
      if (
        filteredData.length > 0 &&
        appData.table.length > 0 &&
        appData.table[0].Date
      ) {
        const startYear = new Date(appData.table[0].Date).getFullYear();
        const endYear = new Date(
          appData.table[appData.table.length - 1].Date,
        ).getFullYear();
        const startDate = new Date(startYear, 0, 1);
        const endDate = new Date(endYear, 11, 31);
        avgDiv = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
        );
      } else {
        avgDiv = filteredData.length || 1;
      }
    }

    avgDiv = Math.max(1, avgDiv);

    return { total: fmtNum(total), average: fmtNum(total / avgDiv) };
  }

  function buildQueryString() {
    const { year, month, group, category, personal } = params;
    const categories = getCategories();

    const groupName = (() => {
      if (personal) return "Personal";
      if (group === "home") return "Home";
      if (group) {
        const found = appData.groups.find(
          (g) => String(g.id) === String(group),
        );
        return found ? found.name : "";
      }
      return "Personal";
    })();

    const catName = (() => {
      if (category) {
        const found = categories.find((c) => String(c.id) === String(category));
        return found ? " | " + found.name : "";
      }
      return "";
    })();

    const monthName = (() => {
      if (!year) return "";
      if (month && month >= 1 && month <= 12) {
        const d = new Date();
        d.setMonth(month - 1);
        return " | " + d.toLocaleString("en", { month: "long" });
      }
      if (!month) return " | All months";
      return "";
    })();

    const yearStr = (() => {
      if (year && +year >= MIN_YEAR && +year <= MAX_YEAR) {
        return " | " + year;
      }
      if (!year) return " | All time";
      return "";
    })();

    return (groupName + catName + monthName + yearStr).trim();
  }

  function renderDownloads(html) {
    const loading = $("downloads-loading");
    const list = $("downloads-list");
    const empty = $("downloads-empty");

    hide(loading);

    if (html && html.trim()) {
      list.innerHTML = html;
      show(list);
      hide(empty);
    } else {
      hide(list);
      show(empty);
    }
  }

  function renderTable(expenses) {
    const container = $("expenses-table");
    const thead = $("table-head");
    const tbody = $("table-body");

    if (!expenses.length) {
      hide(container);
      return;
    }

    const keys = Object.keys(expenses[0]).filter(
      (k) => k.toLowerCase() !== "id",
    );

    thead.innerHTML =
      '<tr class="border-b border-stone-600">' +
      keys
        .map(
          (k) =>
            '<th class="px-2 py-2 md:px-4 md:py-3 align-baseline whitespace-nowrap text-left font-semibold uppercase tracking-wide text-xs md:text-sm">' +
            escAttr(k) +
            "</th>",
        )
        .join("") +
      "</tr>";

    tbody.innerHTML = expenses
      .map((row, i) => {
        const cls = i % 2 === 0 ? "bg-stone-800" : "bg-stone-700";
        return (
          '<tr class="hover:bg-stone-600 transition-colors ' +
          cls +
          '">' +
          keys
            .map((k) => {
              const val = row[k] != null ? row[k] : "";
              return (
                '<td class="px-2 py-2 md:px-4 md:py-3 text-stone-300 text-xs md:text-sm whitespace-nowrap"><div class="truncate max-w-[120px] md:max-w-none" title="' +
                escAttr(val) +
                '">' +
                escAttr(val) +
                "</div></td>"
              );
            })
            .join("") +
          "</tr>"
        );
      })
      .join("");

    show(container);
  }

  function cleanupCharts() {
    chartInstances.forEach(({ plotDiv, observer, resizeHandler }) => {
      try {
        if (observer) observer.disconnect();
      } catch (_) {}

      try {
        if (resizeHandler) {
          window.removeEventListener("resize", resizeHandler);
        }
      } catch (_) {}

      try {
        if (plotDiv) Plotly.purge(plotDiv);
      } catch (_) {}
    });

    chartInstances.length = 0;
  }

  function renderCharts(charts) {
    const section = $("charts-section");
    const container = $("charts-container");

    cleanupCharts();
    container.innerHTML = "";

    container.style.minWidth = "0";
    section.style.minWidth = "0";
    container.classList.add("min-w-0");

    if (!charts || !charts.length) {
      hide(section);
      return;
    }

    charts.forEach((figure, i) => {
      const isMobile = window.matchMedia("(max-width: 640px)").matches;

      const wrapper = document.createElement("div");
      wrapper.className =
        "w-full min-w-0 overflow-hidden p-3 md:p-4 bg-stone-700 rounded-lg shadow";
      wrapper.style.width = "100%";
      wrapper.style.minWidth = "0";
      wrapper.style.overflow = "hidden";

      const plotDiv = document.createElement("div");
      plotDiv.id = "chart-" + i;
      plotDiv.style.width = "100%";
      plotDiv.style.maxWidth = "100%";
      plotDiv.style.minWidth = "0";
      plotDiv.style.height = isMobile ? "320px" : "420px";

      wrapper.appendChild(plotDiv);
      container.appendChild(wrapper);

      const layout = {
        ...figure.layout,
        autosize: true,
        width: undefined,
        height: undefined,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          ...(figure.layout?.font || {}),
          color: "#e2e8f0",
        },
        margin: isMobile
          ? { l: 16, r: 16, t: 40, b: 72 }
          : { l: 40, r: 20, t: 40, b: 40 },
        legend: isMobile
          ? {
              ...(figure.layout?.legend || {}),
              orientation: "h",
              x: 0.5,
              xanchor: "center",
              y: -0.18,
            }
          : figure.layout?.legend,
      };

      Plotly.newPlot(plotDiv, figure.data, layout, {
        responsive: true,
        displayModeBar: false,
      }).then(() => {
        try {
          Plotly.Plots.resize(plotDiv);
        } catch (_) {}
      });

      let observer = null;
      let resizeHandler = null;

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          requestAnimationFrame(() => {
            try {
              Plotly.Plots.resize(plotDiv);
            } catch (_) {}
          });
        });
        observer.observe(wrapper);
      } else {
        resizeHandler = () => {
          try {
            Plotly.Plots.resize(plotDiv);
          } catch (_) {}
        };
        window.addEventListener("resize", resizeHandler);
      }

      chartInstances.push({ plotDiv, observer, resizeHandler });
    });

    show(section);
  }

  function renderSummary(info) {
    const section = $("summary");
    if (!info) {
      hide(section);
      return;
    }

    $("summary-total").textContent = "\u20AC" + info.total;
    $("summary-average").textContent = "\u20AC" + info.average;
    show(section);
  }

  function renderStatus(status) {
    const el = $("status-display");
    if (!status || status === "Loading" || status === "Ready") {
      hide(el);
      return;
    }
    $("status-text").textContent = status;
    show(el);
  }

  function updateFilterDisplay() {
    $("current-filter-text").textContent = buildQueryString();
  }

  function setSubmitLoading(isLoading) {
    const btn = $("submit-btn");

    if (isLoading) {
      btn.disabled = true;
      btn.textContent = "Searching...";
      btn.className =
        "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform bg-stone-600 text-stone-400 cursor-not-allowed";
    } else {
      btn.disabled = false;
      btn.textContent = "Search Expenses";
      btn.className =
        "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg hover:shadow-xl";
    }
  }

  function updateCategorySelect() {
    const categories = getCategories();
    const wrapper = $("category-wrapper");
    const select = $("category-select");

    if (categories.length === 0) {
      hide(wrapper);
      params.category = null;
      return;
    }

    select.innerHTML =
      '<option value="" class="bg-stone-700 text-stone-400">- Select Category -</option>';

    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      opt.className = "bg-stone-700 text-stone-200";
      select.appendChild(opt);
    });

    if (params.category) {
      select.value = params.category;
    }

    show(wrapper);
  }

  function populateGroups(groups) {
    const select = $("group-select");

    groups.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.name;
      opt.className = "bg-stone-700 text-stone-200";
      select.appendChild(opt);
    });
  }

  function populateYears() {
    const select = $("year-select");

    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      opt.className = "bg-stone-700 text-stone-200";
      select.appendChild(opt);
    }

    select.value = params.year;
  }

  function buildApiPayload() {
    return {
      personal: params.personal || false,
      month: params.month || null,
      year: params.year || null,
      chart: params.chart || ["pie", "bar"],
      category: params.category || null,
      csv: params.csv || false,
      group: /^(home|personal)$/.test(params.group)
        ? null
        : params.group || null,
    };
  }

  function onGroupChange() {
    const val = $("group-select").value;

    if (val === "personal") {
      params.group = null;
      params.personal = true;
    } else if (val === "home") {
      params.group = "home";
      params.personal = false;
    } else {
      params.group = val;
      params.personal = false;
    }

    updateCategorySelect();
    updateFilterDisplay();
  }

  function onYearChange() {
    const val = $("year-select").value;
    params.year = val ? parseInt(val, 10) : null;

    const monthSelect = $("month-select");
    if (!val) {
      monthSelect.disabled = true;
      monthSelect.value = "";
      params.month = null;
    } else {
      monthSelect.disabled = false;
    }

    updateCategorySelect();
    updateFilterDisplay();
  }

  function onMonthChange() {
    const val = $("month-select").value;
    params.month = val ? parseInt(val, 10) : null;
    updateCategorySelect();
    updateFilterDisplay();
  }

  function onCategoryChange() {
    const val = $("category-select").value;
    params.category = val || null;

    const expenses = getExpenses();
    renderTable(expenses);
    renderSummary(getSummary());
    updateFilterDisplay();
  }

  async function onFormSubmit(e) {
    e.preventDefault();

    setSubmitLoading(true);
    renderStatus("Loading");

    searchState = {
      year: params.year,
      month: params.month,
      group: params.group,
      category: params.category,
      personal: params.personal,
    };

    appData.data = [];
    appData.table = [];
    appData.chart = [];

    renderTable([]);
    renderCharts([]);
    renderSummary(null);

    const payload = buildApiPayload();

    try {
      const result = await apiPostExpenses(payload);

      if (result.data !== undefined) {
        if (result.table && result.chart) {
          appData.data = result.data;
          appData.table = result.table;
          appData.chart = result.chart;
        }

        if (result.data.length) {
          renderStatus("");
          const expenses = getExpenses();
          renderTable(expenses);
          renderCharts(appData.chart);
          renderSummary(getSummary());
          updateCategorySelect();

          if (params.csv) {
            const csvPayload = { ...payload, csv: true };
            await apiPostExpenses(csvPayload);
            const html = await apiGetDownloads();
            renderDownloads(html);
          }
        } else {
          renderStatus("No expenses");
        }

        if (params.category) {
          params.category = null;
          $("category-select").value = "";
        }
      } else {
        renderStatus("Error");
      }
    } catch (err) {
      console.error(err);
      renderStatus("Error");
    } finally {
      setSubmitLoading(false);
      updateFilterDisplay();
    }
  }

  async function init() {
    populateYears();

    $("month-select").value = params.month;
    $("group-select").value = "personal";

    $("expense-form").addEventListener("submit", onFormSubmit);
    $("group-select").addEventListener("change", onGroupChange);
    $("year-select").addEventListener("change", onYearChange);
    $("month-select").addEventListener("change", onMonthChange);
    $("category-select").addEventListener("change", onCategoryChange);
    $("csv-checkbox").addEventListener("change", (e) => {
      params.csv = e.target.checked;
    });

    window.addEventListener("beforeunload", cleanupCharts);

    updateFilterDisplay();

    try {
      const [groups, downloads] = await Promise.all([
        apiGetGroups(),
        apiGetDownloads(),
      ]);

      appData.groups = groups;
      populateGroups(groups);
      renderDownloads(downloads);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
