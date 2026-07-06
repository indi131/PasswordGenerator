var demoPassword = document.getElementById("demoPassword");
var demoCopyBtn = document.getElementById("demoCopyBtn");
var demoRefresh = document.getElementById("demoRefresh");
var demoSlider = document.getElementById("demoSlider");
var demoLength = document.getElementById("demoLength");
var demoBar = document.getElementById("demoBar");
var demoTitle = document.getElementById("demoTitle");

var CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

var demoOpts = document.querySelectorAll(".demo-opt");

demoOpts.forEach(function(el) {
  el.addEventListener("click", function() {
    el.classList.toggle("checked");
    generateDemo();
  });
});

function getDemoCharset() {
  var chars = "";
  demoOpts.forEach(function(el) {
    if (!el.classList.contains("checked")) return;
    var text = el.textContent.trim();
    if (text.indexOf("Верхний") === 0) chars += CHARS.uppercase;
    else if (text.indexOf("Нижний") === 0) chars += CHARS.lowercase;
    else if (text.indexOf("Цифры") === 0) chars += CHARS.numbers;
    else if (text.indexOf("Символы") === 0) chars += CHARS.symbols;
  });
  if (chars.length === 0) chars = CHARS.lowercase;
  return chars;
}

function generateDemo() {
  var charset = getDemoCharset();
  var len = parseInt(demoLength.value) || 10;
  var pw = "";
  var arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (var i = 0; i < len; i++) pw += charset[arr[i] % charset.length];
  demoPassword.value = pw;
  updateBar(len, charset.length);
}

function updateBar(length, size) {
  var entropy = length * Math.log2(size || 1);
  var w, c, label;
  if (entropy < 28)      { label = "Плохой";      w = "16%"; c = "#ef4444"; }
  else if (entropy < 40) { label = "Слабый";      w = "35%"; c = "#f59e0b"; }
  else if (entropy < 60) { label = "Хороший";     w = "60%"; c = "#eab308"; }
  else if (entropy < 80) { label = "Отличный";    w = "80%"; c = "#22c55e"; }
  else                   { label = "Невероятный"; w = "100%"; c = "#22c55e"; }
  demoBar.style.width = w;
  demoBar.style.background = c;
  demoTitle.textContent = label;
}

demoRefresh.addEventListener("click", generateDemo);

demoCopyBtn.addEventListener("click", function() {
  if (!demoPassword.value) return;
  navigator.clipboard.writeText(demoPassword.value);
  demoCopyBtn.textContent = "СКОПИРОВАНО!";
  setTimeout(function() { demoCopyBtn.textContent = "СКОПИРОВАТЬ"; }, 1500);
});

demoSlider.addEventListener("input", function() {
  demoLength.value = demoSlider.value;
  generateDemo();
});

demoLength.addEventListener("input", function() {
  var v = parseInt(demoLength.value);
  if (isNaN(v) || v < 4) v = 4;
  if (v > 64) v = 64;
  demoLength.value = v;
  demoSlider.value = v;
  generateDemo();
});

generateDemo();

document.querySelectorAll("a[href^=\"#\"]").forEach(function(a) {
  a.addEventListener("click", function(e) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
});
