const app = document.querySelector("#app");
const currentDate = 25; // new Date().getDate(); // Or a specific date e.g. 25

const now = new Date();

const snowflakes = new Snowflakes({
  count: 100, // Default: 50
  minSize: 20, // Default: 10
  maxSize: 50, // Default: 25,
  speed: 1, // Default: 1
});

const createElement = (tagName, options) =>
  Object.assign(document.createElement(tagName), options);

const main = async () => {
  const layouts = await fetchLayouts();
  const flavors = await fetchFlavors();

  const title = `${now.getFullYear()} Advent Calendar`;

  const container = createElement("div", {
    className: "container",
  });

  const header = createElement("div", {
    className: "header",
    textContent: title,
  });

  Object.assign(document, { title });

  app.append(header);
  container.append(...layouts.map((layout) => createCell(layout, flavors)));
  app.append(container);

  document.querySelector(".container").addEventListener("click", onClick);
  document.querySelector(".modal-close").addEventListener("click", onHideModal);

  snowflakes.start();
};

const createCell = (layout, flavors) => {
  const { align, justify, type, value } = layout;
  const { flavor, details } = flavors[value - 1];
  const cell = createElement("div", {
    className: "cell",
    textContent: value,
  });
  cell.setAttribute("data-align", align);
  cell.setAttribute("data-justify", justify);
  cell.setAttribute("data-flavor", flavor);
  cell.setAttribute("data-details", JSON.stringify(details));
  cell.setAttribute("data-date", value);
  cell.setAttribute("data-type", type);
  if (value === currentDate) {
    cell.setAttribute("data-active", true);
  } else if (value < currentDate) {
    cell.setAttribute("data-past", true);
  }
  return cell;
};

const onClick = (event) => {
  const { target } = event;

  if (!target.classList.contains("cell")) {
    event.preventDefault();
    return;
  }

  const modal = document.querySelector(".modal");
  const date = +target.getAttribute("data-date");
  const flavor = target.getAttribute("data-flavor");
  const details = JSON.parse(target.getAttribute("data-details"));
  const title = formatTitle(date);
  const message = formatMessage(date, flavor, details);
  const image = `<img src="./src/resources/images/${date}.jpg" alt="${flavor}" width="300rem" />`;
  const content = date <= currentDate ? `${message}<br />${image}` : message;

  modal.querySelector(".modal-title").textContent = title;
  modal.querySelector(".modal-body").innerHTML = content;

  showModal(modal, true);
};

const nth = (n) =>
  ["st", "nd", "rd"][((((n + 90) % 100) - 10) % 10) - 1] || "th";

const showModal = (modal, show) => modal.classList.toggle("modal-active", show);

const onHideModal = (e) => {
  showModal(e.currentTarget.closest(".modal"), false);
};

const formatTitle = (date) =>
  new Date(now.getFullYear(), 11, date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatFlavor = (flavor, details) =>
  ((flavorHTML) =>
    details?.length ? `${flavorHTML}<br>(${details.join(", ")})` : flavorHTML)(
    `<strong>${flavor}</strong>`
  );

const formatMessage = (date, flavor, details) => {
  const nthDate = `${date}${nth(date)}`;
  if (date > currentDate) {
    return `<div>No peeking until the ${nthDate}!</div>`;
  } else {
    const formattedFlavor = formatFlavor(flavor, details);
    if (date === currentDate) {
      return `<div>Today's flavor is:</div><div>${formattedFlavor}</div>`;
    } else {
      return `<div>The flavor for the ${nthDate} was:</div><div>${formattedFlavor}</div>`;
    }
  }
};

const fetchFlavors = async () =>
  fetchJson("./src/data/flavors.json", [
    {
      flavor: "Mystery",
      details: [],
    },
  ]);

const fetchLayouts = async () =>
  fetchJson("./src/data/layout.json", [
    {
      value: 1,
      align: "center",
      justify: "center",
      type: "window",
    },
  ]);

const fetchJson = async (url, defaultValue = []) => {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return defaultValue;
  }
};

document.addEventListener("DOMContentLoaded", main);
