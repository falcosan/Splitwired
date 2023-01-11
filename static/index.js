const app = document.querySelector("#app");
const button = document.createElement("button");
const container = document.createElement("div");
button.textContent = "click";
const parameter = {
  groups: false,
  csv: false,
  month: null,
  year: 2022,
};
button.addEventListener("click", () => {
  fetch("/choose_expanses", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(parameter),
    cache: "no-cache",
    headers: new Headers({
      "content-type": "application/json",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
});
container.append(button);
app.appendChild(container);
