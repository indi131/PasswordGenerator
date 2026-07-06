var downloadLink = "https://github.com/indi131/PasswordGenerator/raw/main/dist/password-generator.crx";

var demoPassword = document.getElementById("demoPassword");
var demoCopyBtn = document.getElementById("demoCopyBtn");
var demoRefresh = document.getElementById("demoRefresh");
var demoSlider = document.getElementById("demoSlider");
var demoLength = document.getElementById("demoLength");
var demoBar = document.getElementById("demoBar");

var CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

function generateDemo() {
  var len = parseInt(demoLength.value) || 10;
  var charset = CHARS.uppercase + CHARS.lowercase + CHARS.numbers;
  var pw = "";
  var arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (var i = 0; i < len; i++) pw += charset[arr[i] % charset.length];
  demoPassword.value = pw;
  updateBar(len, charset.length);
}

function updateBar(length, size) {
  var entropy = length * Math.log2(size || 1);
  var w, c;
  if (entropy < 28)      { w = "16%"; c = "#ef4444"; }
  else if (entropy < 40) { w = "35%"; c = "#f59e0b"; }
  else if (entropy < 60) { w = "60%"; c = "#eab308"; }
  else if (entropy < 80) { w = "80%"; c = "#22c55e"; }
  else                   { w = "100%"; c = "#22c55e"; }
  demoBar.style.width = w;
  demoBar.style.background = c;
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
