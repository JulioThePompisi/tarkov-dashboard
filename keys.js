const TIER_ORDER = ["S", "A", "B", "C", "D"];
const ALL_MAPS_LABEL = "All Keys";
const FALLBACK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="4.2"/><path d="M11 11 L20 20 M15.5 15.5 L18 13 M17.5 17.5 L20 15"/></svg>';

let allKeys = [];
let activeTab = ALL_MAPS_LABEL;

async function loadKeys() {
  let data;
  try {
    const res = await fetch("data/keys.json", { cache: "no-store" });
    data = await res.json();
  } catch (err) {
    document.getElementById("tier-groups").textContent =
      "Could not load key data.";
    return;
  }

  document.getElementById("last-checked").textContent = data.generatedAt
    ? "Last updated: " + formatTime(data.generatedAt)
    : "No data yet.";

  allKeys = data.keys || [];
  renderTabs();
  renderTiers();
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

function renderTabs() {
  const maps = [...new Set(allKeys.map((k) => k.map))].sort();
  const tabsEl = document.getElementById("map-tabs");
  tabsEl.innerHTML = "";

  const labels = [ALL_MAPS_LABEL, ...maps];
  for (const label of labels) {
    const btn = document.createElement("button");
    btn.className = "map-tab" + (label === activeTab ? " active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      activeTab = label;
      renderTabs();
      renderTiers();
    });
    tabsEl.appendChild(btn);
  }
}

function renderTiers() {
  const container = document.getElementById("tier-groups");
  container.innerHTML = "";

  if (allKeys.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = "No key data yet. The next scheduled run will populate this.";
    container.appendChild(p);
    return;
  }

  const visible =
    activeTab === ALL_MAPS_LABEL
      ? allKeys
      : allKeys.filter((k) => k.map === activeTab);

  for (const tier of TIER_ORDER) {
    const items = visible.filter((k) => k.tier === tier);
    if (items.length === 0) continue;

    const group = document.createElement("div");
    group.className = "tier-group";

    const heading = document.createElement("h2");
    heading.className = "tier-heading tier-" + tier;
    heading.textContent = "Tier " + tier;
    group.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "key-grid";

    for (const key of items) {
      grid.appendChild(buildKeyBox(key));
    }

    group.appendChild(grid);
    container.appendChild(group);
  }
}

function buildKeyBox(key) {
  const box = document.createElement("div");
  box.className = "key-box";
  box.tabIndex = 0;

  const iconWrap = document.createElement("div");
  iconWrap.className = "key-icon";

  if (key.icon) {
    const img = document.createElement("img");
    img.src = key.icon;
    img.alt = key.name;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.remove();
      iconWrap.innerHTML = FALLBACK_ICON;
      iconWrap.classList.add("fallback");
    });
    iconWrap.appendChild(img);
  } else {
    iconWrap.innerHTML = FALLBACK_ICON;
    iconWrap.classList.add("fallback");
  }
  box.appendChild(iconWrap);

  const label = document.createElement("p");
  label.className = "key-box-label";
  label.textContent = key.name;
  box.appendChild(label);

  const tooltip = document.createElement("div");
  tooltip.className = "key-tooltip";

  const tName = document.createElement("p");
  tName.className = "key-tooltip-name";
  tName.textContent = key.name;
  tooltip.appendChild(tName);

  const tMeta = document.createElement("p");
  tMeta.className = "key-tooltip-meta";
  tMeta.innerHTML =
    '<span class="tier-pill tier-' + key.tier + '">Tier ' + key.tier + "</span>" +
    (activeTab === ALL_MAPS_LABEL ? '<span class="key-map-tag">' + key.map + "</span>" : "");
  tooltip.appendChild(tMeta);

  if (key.note) {
    const tNote = document.createElement("p");
    tNote.className = "key-tooltip-note";
    tNote.textContent = key.note;
    tooltip.appendChild(tNote);
  }

  box.appendChild(tooltip);

  return box;
}

loadKeys();
