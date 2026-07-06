const STORAGE_KEYS = {
  THEME: "pgTheme",
  HISTORY: "pgHistory"
};

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) document.body.classList.add("dark");
}

const searchInput = document.getElementById("searchInput");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearBtn = document.getElementById("clearBtn");

function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"); }
  catch { return []; }
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
}

function escapeHtml(str) {
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return d + " дн. назад";
  if (h > 0) return h + " ч назад";
  if (m > 0) return m + " мин назад";
  return "только что";
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {});
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const history = getHistory();

  const filtered = q
    ? history.filter(function(item) {
        return (item.host && item.host.toLowerCase().indexOf(q) !== -1) ||
               (item.password && item.password.toLowerCase().indexOf(q) !== -1);
      })
    : history;

  historyList.innerHTML = "";

  if (filtered.length === 0) {
    historyEmpty.style.display = "block";
    historyEmpty.textContent = q ? "Ничего не найдено" : "История пуста";
    return;
  }
  historyEmpty.style.display = "none";

  filtered.forEach(function(item) {
    const row = document.createElement("div");
    row.className = "history-item";

    const main = document.createElement("div");
    main.className = "history-item-main";

    const pw = document.createElement("div");
    pw.className = "history-item-pw";
    pw.textContent = item.password;

    const meta = document.createElement("div");
    meta.className = "history-item-meta";

    if (item.host) {
      const site = document.createElement("span");
      site.className = "history-item-site";
      site.textContent = item.host;
      meta.appendChild(site);
    }

    const time = document.createElement("span");
    time.textContent = timeAgo(item.date);
    meta.appendChild(time);

    const len = document.createElement("span");
    len.textContent = item.length + " симв.";
    meta.appendChild(len);

    main.appendChild(pw);
    main.appendChild(meta);

    const copy = document.createElement("button");
    copy.className = "history-item-copy";
    copy.title = "Копировать";
    copy.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\" ry=\"2\"/><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"/></svg>";
    copy.addEventListener("click", function() {
      copyToClipboard(item.password);
      copy.classList.add("copied");
      setTimeout(function() { copy.classList.remove("copied"); }, 1200);
    });

    row.appendChild(main);
    row.appendChild(copy);
    historyList.appendChild(row);
  });
}

searchInput.addEventListener("input", render);

clearBtn.addEventListener("click", function() {
  if (confirm("Очистить всю историю паролей?")) {
    saveHistory([]);
    render();
  }
});

initTheme();
render();