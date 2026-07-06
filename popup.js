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
  SITES: "pgSites",
  ALIASES: "pgAliases"
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
const settingsBtn = $("settingsBtn");
const autoCopyToggle = $("autoCopyToggle");
const copyIndicator = $("copyIndicator");
const siteBadge = $("siteBadge");
const siteBadgeText = $("siteBadgeText");
const aliasNotify = $("aliasNotify");
const aliasNotifyLabel = $("aliasNotifyLabel");
const aliasNotifyPw = $("aliasNotifyPw");
const aliasNotifyCopy = $("aliasNotifyCopy");
const aliasNotifyClose = $("aliasNotifyClose");

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

/* ─── History (only save here, view is separate window) ─── */

function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"); }
  catch { return []; }
}

function addToHistory(password, length, charsetSize, host) {
  const history = getHistory();
  history.unshift({ password, length, charsetSize, host: host || "", date: Date.now() });
  if (history.length > 20) history.pop();
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

/* ─── Aliases ─── */

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

function findPasswordForHost(hostname) {
  const saved = getSavedSitePassword(hostname);
  if (saved && saved.password) return saved.password;
  const history = getHistory();
  for (let i = 0; i < history.length; i++) {
    if (history[i].host === hostname && history[i].password) return history[i].password;
  }
  return null;
}

function checkAliases(url, hostname) {
  if (!url || !hostname) { aliasNotify.style.display = "none"; return; }
  const aliases = getAliases();
  let triggered = false;
  for (let i = 0; i < aliases.length; i++) {
    if (aliases[i] && url.indexOf(aliases[i]) !== -1) { triggered = true; break; }
  }
  if (!triggered) { aliasNotify.style.display = "none"; return; }

  const pw = findPasswordForHost(hostname);
  if (pw) {
    aliasNotifyLabel.textContent = "Вы генерировали пароль для " + hostname + ":";
    aliasNotifyPw.textContent = pw;
    aliasNotify.style.display = "flex";
  } else {
    aliasNotify.style.display = "none";
  }
}

aliasNotifyClose.addEventListener("click", () => { aliasNotify.style.display = "none"; });

aliasNotifyCopy.addEventListener("click", () => {
  if (aliasNotifyPw.textContent) copyToClipboard(aliasNotifyPw.textContent);
});

/* ─── Open windows ─── */

function openOptionsWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("options.html"),
    type: "popup",
    width: 480,
    height: 620
  });
}

function openHistoryWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("history.html"),
    type: "popup",
    width: 520,
    height: 640
  });
}

settingsBtn.addEventListener("click", openOptionsWindow);
historyBtn.addEventListener("click", openHistoryWindow);

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
  else                   { label = "Невероятный"; value = "Максимальная"; className = "strong"; width = "100%"; color = "#22c55e"; }

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
      checkAliases(tabs[0].url, currentHost);

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