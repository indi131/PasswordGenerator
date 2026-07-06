chrome.tabs.onActivated.addListener(activeInfo => {
  updateBadge(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) updateBadgeForTab(tabId, changeInfo.url);
});

function updateBadge(tabId) {
  chrome.tabs.get(tabId, tab => {
    if (tab && tab.url) updateBadgeForTab(tabId, tab.url);
  });
}

function updateBadgeForTab(tabId, url) {
  try {
    const hostname = new URL(url).hostname;
    if (!hostname) { clearBadge(tabId); return; }
    chrome.storage.local.get(["pgSites"], result => {
      const sites = result.pgSites || {};
      if (sites[hostname] && sites[hostname].password) {
        chrome.action.setBadgeText({ text: "\u2713", tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#22c55e", tabId });
        chrome.action.setBadgeTextColor({ color: "#ffffff", tabId });
      } else {
        clearBadge(tabId);
      }
    });
  } catch {
    clearBadge(tabId);
  }
}

function clearBadge(tabId) {
  chrome.action.setBadgeText({ text: "", tabId });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) updateBadge(tabs[0].id);
  });
});