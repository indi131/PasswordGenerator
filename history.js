const STORAGE_KEYS = {
  THEME: "pgTheme",
  HISTORY: "pgHistory",
  SITES: "pgSites"
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

function findEntryIndex(history, id) {
  for (let i = 0; i < history.length; i++) {
    if (history[i].id === id) return i;
  }
  return -1;
}

function saveEdit(id, newPassword) {
  if (!newPassword || !id) return;
  const history = getHistory();
  const idx = findEntryIndex(history, id);
  if (idx === -1) return;

  history[idx].password = newPassword;
  history[idx].length = newPassword.length;
  saveHistory(history);

  const host = history[idx].host;
  if (host) {
    try {
      const sites = JSON.parse(localStorage.getItem(STORAGE_KEYS.SITES) || "{}");
      if (sites[host]) {
        sites[host].password = newPassword;
        sites[host].length = newPassword.length;
        localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
      }
    } catch {}
  }

  render();
}

let editingId = null;

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

    const isEditing = editingId === item.id;

    if (isEditing) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "history-item-edit-input";
      editInput.value = item.password;
      main.appendChild(editInput);
    } else {
      const pw = document.createElement("span");
      pw.className = "history-item-pw";
      pw.textContent = item.password;
      main.appendChild(pw);
    }

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

    main.appendChild(meta);

    const btnGroup = document.createElement("div");
    btnGroup.className = "history-item-btns";

    if (isEditing) {
      const saveEditBtn = document.createElement("button");
      saveEditBtn.className = "history-item-btn save";
      saveEditBtn.title = "Сохранить";
      saveEditBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      saveEditBtn.addEventListener("click", function() {
        const input = main.querySelector(".history-item-edit-input");
        if (input) saveEdit(item.id, input.value);
      });

      const cancelEditBtn = document.createElement("button");
      cancelEditBtn.className = "history-item-btn cancel";
      cancelEditBtn.title = "Отмена";
      cancelEditBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      cancelEditBtn.addEventListener("click", function() { editingId = null; render(); });

      btnGroup.appendChild(saveEditBtn);
      btnGroup.appendChild(cancelEditBtn);
    } else {
      const editBtn = document.createElement("button");
      editBtn.className = "history-item-btn edit";
      editBtn.title = "Редактировать";
      editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      editBtn.addEventListener("click", function() { editingId = item.id; render(); });
      btnGroup.appendChild(editBtn);
    }

    const copy = document.createElement("button");
    copy.className = "history-item-btn copy";
    copy.title = "Копировать";
    copy.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    copy.addEventListener("click", function() {
      copyToClipboard(item.password);
      copy.classList.add("copied");
      setTimeout(function() { copy.classList.remove("copied"); }, 1200);
    });
    btnGroup.appendChild(copy);

    row.appendChild(main);
    row.appendChild(btnGroup);
    historyList.appendChild(row);
  });
}

searchInput.addEventListener("input", function() {
  editingId = null;
  render();
});

clearBtn.addEventListener("click", function() {
  if (confirm("Очистить всю историю паролей?")) {
    saveHistory([]);
    editingId = null;
    render();
  }
});

initTheme();
render();