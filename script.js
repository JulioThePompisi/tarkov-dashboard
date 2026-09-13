async function loadDashboard() {
  let data;
  try {
    const res = await fetch("data/briefing.json", { cache: "no-store" });
    data = await res.json();
  } catch (err) {
    document.getElementById("briefing-summary").textContent =
      "Could not load briefing data.";
    return;
  }

  renderLastChecked(data.lastChecked);
  renderBriefing(data.date, data.briefing);
  renderUpdates(data.updates);
}

function formatTime(iso) {
  if (!iso) return "never";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderLastChecked(iso) {
  document.getElementById("last-checked").textContent =
    "Last checked: " + formatTime(iso);
}

function renderBriefing(date, briefing) {
  const dateEl = document.getElementById("briefing-date");
  const summaryEl = document.getElementById("briefing-summary");
  const categoriesEl = document.getElementById("briefing-categories");

  dateEl.textContent = date ? "For " + date : "";
  summaryEl.textContent = briefing?.summary || "No briefing yet.";

  categoriesEl.innerHTML = "";
  const categories = briefing?.categories || [];
  if (categories.length === 0) return;

  for (const cat of categories) {
    const div = document.createElement("div");
    div.className = "category";

    const h3 = document.createElement("h3");
    h3.textContent = cat.title;
    div.appendChild(h3);

    const ul = document.createElement("ul");
    for (const item of cat.items || []) {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    }
    div.appendChild(ul);

    categoriesEl.appendChild(div);
  }
}

function renderUpdates(updates) {
  const listEl = document.getElementById("updates-list");
  listEl.innerHTML = "";

  if (!updates || updates.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = "Nothing new since this morning's briefing.";
    listEl.appendChild(p);
    return;
  }

  const sorted = [...updates].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

  for (const update of sorted) {
    const div = document.createElement("div");
    div.className = "update-item";

    const time = document.createElement("span");
    time.className = "update-time";
    time.textContent = formatTime(update.time);
    div.appendChild(time);

    const title = document.createElement("p");
    title.className = "update-title";
    title.textContent = update.title;
    div.appendChild(title);

    const text = document.createElement("p");
    text.className = "update-text";
    text.textContent = update.text;
    div.appendChild(text);

    listEl.appendChild(div);
  }
}

loadDashboard();
