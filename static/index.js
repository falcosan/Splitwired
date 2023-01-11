const app = document.querySelector("#app");
const button = document.createElement("button");
const container = document.createElement("div");
const paragraph = document.createElement("p");
button.textContent = "click";
button.addEventListener("click", () => {
  fetch("/choose_expanses")
    .then((res) => res.json())
    .then((data) => {
      paragraph.textContent = JSON.stringify(data);
    });
});
container.append(button, paragraph);
app.appendChild(container);
