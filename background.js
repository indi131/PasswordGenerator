chrome.tabs.onActivated.addListener(activeInfo => {
  updateIcon(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) updateIconForTab(tabId, changeInfo.url);
});

function updateIcon(tabId) {
  chrome.tabs.get(tabId, tab => {
    if (tab && tab.url) updateIconForTab(tabId, tab.url);
  });
}

function updateIconForTab(tabId, url) {
  try {
    const hostname = new URL(url).hostname;
    if (!hostname) { setDefaultIcon(tabId); return; }
    chrome.storage.local.get(["pgSites"], result => {
      const sites = result.pgSites || {};
      if (sites[hostname] && sites[hostname].password) {
        chrome.action.setIcon({ path: "icons/icon-active.svg", tabId });
      } else {
        setDefaultIcon(tabId);
      }
    });
  } catch {
    setDefaultIcon(tabId);
  }
}

function setDefaultIcon(tabId) {
  chrome.action.setIcon({ path: "icons/icon.svg", tabId });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) updateIcon(tabs[0].id);
  });
});