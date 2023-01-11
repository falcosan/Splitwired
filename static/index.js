const app = document.querySelector("#app");
const button = document.createElement("button");
const container = document.createElement("div");
button.textContent = "click";
button.addEventListener("click", () => {
  fetch("/choose_expanses")
    .then((res) => res.json())
    .then((data) => {
      container.textContent = data;
    });
});
container.appendChild(button);
app.appendChild(container);
