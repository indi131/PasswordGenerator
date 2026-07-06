const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

const STORAGE_KEYS = {
  THEME: "pgTheme",
  AUTO_COPY: "pgAutoCopy",
  HISTORY: "pgHistory",
  SITES: "pgSites"
};

let currentHost = "";

const $ = id => document.getElementById(id);

const passwordEl = $("password");
const refreshBtn = $("refreshBtn");
const copyBtn = $("copyBtn");
const lengthInput = $("lengthInput");
const lengthSlider = $("lengthSlider");
const uppercaseCheck = $("uppercase");
const lowercaseCheck = $("lowercase");
const numbersCheck = $("numbers");
const symbolsCheck = $("symbols");
const strengthTitle = $("strengthTitle");
const strengthBar = $("strengthBar");
const strengthValue = $("strengthValue");
const themeBtn = $("themeBtn");
const historyBtn = $("historyBtn");
const historyPanel = $("historyPanel");
const historyList = $("historyList");
const historyEmpty = $("historyEmpty");
const clearHistoryBtn = $("clearHistoryBtn");
const autoCopyToggle = $("autoCopyToggle");
const copyIndicator = $("copyIndicator");
const siteBadge = $("siteBadge");
const siteBadgeText = $("siteBadgeText");

/* ─── Theme ─── */

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) document.body.classList.add("dark");
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(STORAGE_KEYS.THEME, document.body.classList.contains("dark") ? "dark" : "light");
}

themeBtn.addEventListener("click", toggleTheme);

/* ─── Site detection ─── */

function getSavedSitePassword(host) {
  try {
    const sites = JSON.parse(localStorage.getItem(STORAGE_KEYS.SITES) || "{}");
    return sites[host] || null;
  } catch { return null; }
}

function saveSitePassword(host, password, length, charsetSize) {
  if (!host) return;
  try {
    const sites = JSON.parse(localStorage.getItem(STORAGE_KEYS.SITES) || "{}");
    sites[host] = { password, length, charsetSize, date: Date.now() };
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
  } catch {}
}

function showSite(host) {
  if (!host) { siteBadge.style.display = "none"; return; }
  siteBadge.style.display = "flex";
  siteBadgeText.textContent = host;
}

/* ─── Auto copy ─── */

function initAutoCopy() {
  autoCopyToggle.checked = localStorage.getItem(STORAGE_KEYS.AUTO_COPY) === "true";
}

autoCopyToggle.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.AUTO_COPY, autoCopyToggle.checked ? "true" : "false");
});

function showCopyIndicator() {
  copyIndicator.classList.add("show");
  setTimeout(() => copyIndicator.classList.remove("show"), 1500);
}

function copyToClipboard(text) {
  if (!text) return Promise.resolve();
  return navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "СКОПИРОВАНО!";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "КОПИРОВАТЬ";
      copyBtn.classList.remove("copied");
    }, 1500);
  });
}

/* ─── History ─── */

function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"); }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function addToHistory(password, length, charsetSize, host) {
  const history = getHistory();
  history.unshift({ password, length, charsetSize, host: host || "", date: Date.now() });
  if (history.length > 20) history.pop();
  saveHistory(history);
  if (historyPanel.classList.contains("open")) renderHistory();
}

function clearHistory() {
  saveHistory([]);
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyEmpty.style.display = "block";
    return;
  }
  historyEmpty.style.display = "none";

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";

    const pw = document.createElement("span");
    pw.className = "history-item-pw";
    pw.textContent = item.password;

    const meta = document.createElement("span");
    meta.className = "history-item-meta";
    const d = new Date(item.date);
    const time = d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    meta.textContent = item.length + " " + String.fromCharCode(183) + " " + time;

    const copyIcon = document.createElement("button");
    copyIcon.className = "history-item-copy";
    copyIcon.innerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\" ry=\"2\"/><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\"/></svg>";
    copyIcon.addEventListener("mousedown", e => { e.stopPropagation(); copyToClipboard(item.password); });

    div.addEventListener("click", () => { passwordEl.value = item.password; copyToClipboard(item.password); });

    div.appendChild(pw);
    if (item.host) {
      const hostEl = document.createElement("span");
      hostEl.className = "history-item-site";
      hostEl.textContent = item.host;
      div.appendChild(hostEl);
    }
    div.appendChild(meta);
    div.appendChild(copyIcon);
    historyList.appendChild(div);
  });
}

clearHistoryBtn.addEventListener("click", clearHistory);

historyBtn.addEventListener("click", () => {
  historyPanel.classList.toggle("open");
  if (historyPanel.classList.contains("open")) renderHistory();
});

/* ─── Generate ─── */

function getCharset() {
  let chars = "";
  if (uppercaseCheck.checked) chars += CHARS.uppercase;
  if (lowercaseCheck.checked) chars += CHARS.lowercase;
  if (numbersCheck.checked) chars += CHARS.numbers;
  if (symbolsCheck.checked) chars += CHARS.symbols;
  return chars;
}

function generatePassword(saveForSite) {
  const charset = getCharset();
  const length = parseInt(lengthInput.value) || 10;

  if (charset.length === 0) { passwordEl.value = ""; return; }

  let password = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) password += charset[array[i] % charset.length];

  passwordEl.value = password;
  updateStrength(charset.length, length);

  if (autoCopyToggle.checked) copyToClipboard(password).then(() => showCopyIndicator());

  addToHistory(password, length, charset.length, currentHost);

  if (saveForSite !== false && currentHost) {
    saveSitePassword(currentHost, password, length, charset.length);
  }
}

function updateStrength(charsetSize, length) {
  const entropy = length * Math.log2(charsetSize || 1);
  let label, value, className, width, color;

  if (entropy < 28)      { label = "Плохой";     value = "Очень слабая";  className = "weak";   width = "16%"; color = "#ef4444"; }
  else if (entropy < 40) { label = "Слабый";     value = "Слабая";        className = "fair";   width = "35%"; color = "#f59e0b"; }
  else if (entropy < 60) { label = "Хороший";    value = "Средняя";       className = "good";   width = "60%"; color = "#eab308"; }
  else if (entropy < 80) { label = "Отличный";   value = "Надёжная";      className = "strong"; width = "80%"; color = "#22c55e"; }
  else                   { label = "Невероятный"; value = "Максимальная";  className = "strong"; width = "100%"; color = "#22c55e"; }

  strengthTitle.textContent = label;
  strengthTitle.className = "title " + className;
  strengthBar.style.width = width;
  strengthBar.style.background = color;
  strengthValue.textContent = value;
  strengthValue.style.color = color;
}

/* ─── Slider ─── */

function syncSlider() {
  const val = parseInt(lengthInput.value) || 10;
  const pct = ((val - 4) / 60) * 100;
  lengthSlider.style.setProperty("--slider-pct", pct + "%");
}

lengthInput.addEventListener("input", () => {
  let val = parseInt(lengthInput.value);
  if (isNaN(val) || val < 4) val = 4;
  if (val > 64) val = 64;
  lengthInput.value = val;
  lengthSlider.value = val;
  syncSlider();
  generatePassword();
});

lengthSlider.addEventListener("input", () => {
  lengthInput.value = lengthSlider.value;
  syncSlider();
  generatePassword();
});

refreshBtn.addEventListener("click", () => {
  refreshBtn.style.transform = "rotate(360deg)";
  setTimeout(() => { refreshBtn.style.transform = ""; }, 400);
  generatePassword();
});

copyBtn.addEventListener("click", () => {
  if (passwordEl.value) { copyToClipboard(passwordEl.value); showCopyIndicator(); }
});

[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck].forEach(cb => {
  cb.addEventListener("change", () => {
    if (!uppercaseCheck.checked && !lowercaseCheck.checked && !numbersCheck.checked && !symbolsCheck.checked) {
      cb.checked = true; return;
    }
    generatePassword();
  });
});

/* ─── Init ─── */

initTheme();
initAutoCopy();
syncSlider();

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (tabs && tabs[0] && tabs[0].url) {
    try {
      const url = new URL(tabs[0].url);
      currentHost = url.hostname;
      showSite(currentHost);

      const saved = getSavedSitePassword(currentHost);
      if (saved && saved.password) {
        passwordEl.value = saved.password;
        lengthInput.value = saved.length || 10;
        lengthSlider.value = saved.length || 10;
        syncSlider();
        updateStrength(saved.charsetSize || 62, saved.length || 10);
        return;
      }
    } catch {}
  }
  generatePassword();
});
