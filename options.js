const STORAGE_KEYS = {
  THEME: "pgTheme",
  ALIASES: "pgAliases"
};

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) document.body.classList.add("dark");
}

const aliasForm = document.getElementById("aliasForm");
const aliasPattern = document.getElementById("aliasPattern");
const aliasList = document.getElementById("aliasList");
const aliasEmpty = document.getElementById("aliasEmpty");

function normalizeAlias(item) {
  if (typeof item === "string") return item;
  if (item && typeof item.pattern === "string") return item.pattern;
  return "";
}

function getAliases() {
  let list;
  try { list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALIASES) || "[]"); }
  catch { list = []; }
  return list.map(normalizeAlias).filter(function(p) { return p.length > 0; });
}

function saveAliases(list) {
  localStorage.setItem(STORAGE_KEYS.ALIASES, JSON.stringify(list));
}

function addAlias(pattern) {
  const list = getAliases();
  if (list.indexOf(pattern) !== -1) return;
  list.push(pattern);
  saveAliases(list);
  render();
}

function deleteAlias(index) {
  const list = getAliases();
  list.splice(index, 1);
  saveAliases(list);
  render();
}

function render() {
  const list = getAliases();
  aliasList.innerHTML = "";

  if (list.length === 0) {
    aliasEmpty.style.display = "block";
    return;
  }
  aliasEmpty.style.display = "none";

  list.forEach(function(pattern, i) {
    const div = document.createElement("div");
    div.className = "alias-item";

    const p = document.createElement("span");
    p.className = "alias-item-pattern";
    p.textContent = pattern;

    const del = document.createElement("button");
    del.className = "alias-item-del";
    del.title = "Удалить";
    del.textContent = "\u00d7";
    del.addEventListener("click", function() { deleteAlias(i); });

    div.appendChild(p);
    div.appendChild(del);
    aliasList.appendChild(div);
  });
}

aliasForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const pattern = aliasPattern.value.trim();
  if (!pattern) return;
  addAlias(pattern);
  aliasPattern.value = "";
  aliasPattern.focus();
});

initTheme();
render();