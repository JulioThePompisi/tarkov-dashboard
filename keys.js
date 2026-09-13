const TIER_ORDER = ["S", "A", "B", "C", "D"];
const ALL_MAPS_LABEL = "All Keys";

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

    const list = document.createElement("div");
    list.className = "key-list";

    for (const key of items) {
      const card = document.createElement("div");
      card.className = "key-card";

      const name = document.createElement("p");
      name.className = "key-name";
      name.textContent = key.name;
      if (activeTab === ALL_MAPS_LABEL) {
        const mapTag = document.createElement("span");
        mapTag.className = "key-map-tag";
        mapTag.textContent = key.map;
        name.appendChild(mapTag);
      }
      card.appendChild(name);

      if (key.note) {
        const note = document.createElement("p");
        note.className = "key-note";
        note.textContent = key.note;
        card.appendChild(note);
      }

      list.appendChild(card);
    }

    group.appendChild(list);
    container.appendChild(group);
  }
}

loadKeys();
