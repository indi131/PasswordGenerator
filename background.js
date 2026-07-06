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
        chrome.action.setIcon({
          path: { "16": "icons/icon-active16.png", "32": "icons/icon-active32.png", "48": "icons/icon-active48.png", "128": "icons/icon-active128.png" },
          tabId
        });
      } else {
        setDefaultIcon(tabId);
      }
    });
  } catch {
    setDefaultIcon(tabId);
  }
}

function setDefaultIcon(tabId) {
  chrome.action.setIcon({
    path: { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png", "128": "icons/icon128.png" },
    tabId
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) updateIcon(tabs[0].id);
  });
});