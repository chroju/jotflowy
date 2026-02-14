import { applyTemplate, parseContent, escapeRegex, escapeHtml, stripHtml } from "./utils.js";

// State
let settings = loadSettings();
let isAuthenticated = false;

// DOM elements
const editor = document.getElementById("editor");
const btnSend = document.getElementById("btn-send");
const btnHistory = document.getElementById("btn-history");
const btnSettings = document.getElementById("btn-settings");
const destinationSelector = document.getElementById("destination-selector");
const destinationLabel = document.getElementById("destination-label");
const destinationDropdown = document.getElementById("destination-dropdown");
const toast = document.getElementById("toast");

// Settings modal
const modalSettings = document.getElementById("modal-settings");
const apiKeyInput = document.getElementById("api-key-input");
const btnSaveApikey = document.getElementById("btn-save-apikey");
const btnClearApikey = document.getElementById("btn-clear-apikey");
const btnEditApikey = document.getElementById("btn-edit-apikey");
const destinationList = document.getElementById("destination-list");
const btnAddDestination = document.getElementById("btn-add-destination");

// Add destination panel
const panelAddDest = document.getElementById("panel-add-destination");
const nodeTree = document.getElementById("node-tree");
const destNameInput = document.getElementById("dest-name-input");
const destDailyNote = document.getElementById("dest-daily-note");
const destDefaultText = document.getElementById("dest-default-text");
const btnSaveDestination = document.getElementById("btn-save-destination");
const btnCancelDestination = document.getElementById("btn-cancel-destination");

// History modal
const modalHistory = document.getElementById("modal-history");
const historyList = document.getElementById("history-list");

let selectedNodeId = null;

// Init
async function init() {
  updateDestinationLabel();
  handleShareTarget();
  registerServiceWorker();
  bindEvents();
  setupMobileViewport();
  await checkAuth();
}

// Handle mobile keyboard viewport
function setupMobileViewport() {
  if (window.visualViewport) {
    const app = document.getElementById("app");
    const updateViewport = () => {
      app.style.height = `${window.visualViewport.height}px`;
    };
    window.visualViewport.addEventListener("resize", updateViewport);
    updateViewport();
  }
}

function bindEvents() {
  btnSend.addEventListener("click", handleSend);
  btnHistory.addEventListener("click", () => openModal(modalHistory, loadHistory));
  btnSettings.addEventListener("click", () => {
    updateApiKeyUI();
    renderDestinationList();
    openModal(modalSettings);
  });

  // Destination selector dropdown
  destinationSelector.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDestinationDropdown();
  });
  document.addEventListener("click", () => {
    destinationDropdown.classList.add("hidden");
  });

  btnSaveApikey.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      if (!res.ok) throw new Error("Failed to save API key");
      isAuthenticated = true;
      updateApiKeyUI();
      showToast("API key saved");
    } catch (e) {
      showToast(e.message, true);
    }
  });

  btnClearApikey.addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      isAuthenticated = false;
      updateApiKeyUI();
      showToast("API key cleared");
    } catch (e) {
      showToast(e.message, true);
    }
  });

  btnEditApikey.addEventListener("click", () => {
    apiKeyInput.value = "";
    apiKeyInput.disabled = false;
    apiKeyInput.placeholder = "Enter new API key";
    btnSaveApikey.classList.remove("hidden");
    btnEditApikey.classList.add("hidden");
    btnClearApikey.classList.remove("hidden");
    apiKeyInput.focus();
  });

  btnAddDestination.addEventListener("click", () => {
    panelAddDest.classList.remove("hidden");
    selectedNodeId = null;
    nodeTreePath = [];
    destNameInput.value = "";
    destDailyNote.checked = false;
    destDefaultText.value = "";
    loadNodeTree();
  });

  btnSaveDestination.addEventListener("click", saveDestination);
  btnCancelDestination.addEventListener("click", () => panelAddDest.classList.add("hidden"));

  document.querySelectorAll(".modal-backdrop").forEach((el) => {
    el.addEventListener("click", () => el.closest(".modal").classList.add("hidden"));
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", () => {
      document.getElementById(el.dataset.closeModal).classList.add("hidden");
    });
  });

  // Keyboard shortcut: Cmd/Ctrl + Enter to send
  editor.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });
}

// Destination dropdown
function toggleDestinationDropdown() {
  if (!destinationDropdown.classList.contains("hidden")) {
    destinationDropdown.classList.add("hidden");
    return;
  }
  if (!settings.destinations.length) {
    destinationDropdown.classList.add("hidden");
    return;
  }

  destinationDropdown.innerHTML = "";
  for (const dest of settings.destinations) {
    const isActive = dest.id === settings.selectedDestinationId;
    const item = document.createElement("div");
    item.className = "destination-dropdown-item" + (isActive ? " active" : "");
    item.textContent = dest.name;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      settings.selectedDestinationId = dest.id;
      saveSettings();
      updateDestinationLabel();
      destinationDropdown.classList.add("hidden");
      editor.value = "";
        });
    destinationDropdown.appendChild(item);
  }
  destinationDropdown.classList.remove("hidden");
}

// Settings persistence
function loadSettings() {
  try {
    const raw = localStorage.getItem("jotflowy_settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { destinations: [], selectedDestinationId: "" };
}

function saveSettings() {
  localStorage.setItem("jotflowy_settings", JSON.stringify(settings));
}

function getSelectedDestination() {
  return settings.destinations.find((d) => d.id === settings.selectedDestinationId) || null;
}

function updateDestinationLabel() {
  const dest = getSelectedDestination();
  destinationLabel.textContent = dest ? dest.name : "No destination";
}


// Auth check
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    isAuthenticated = data.authenticated;
  } catch {
    isAuthenticated = false;
  }
}

// Update API Key UI based on auth state
function updateApiKeyUI() {
  if (isAuthenticated) {
    apiKeyInput.value = "••••••••";
    apiKeyInput.disabled = true;
    apiKeyInput.placeholder = "";
    btnSaveApikey.classList.add("hidden");
    btnClearApikey.classList.add("hidden");
    btnEditApikey.classList.remove("hidden");
  } else {
    apiKeyInput.value = "";
    apiKeyInput.disabled = false;
    apiKeyInput.placeholder = "Workflowy API Key";
    btnSaveApikey.classList.remove("hidden");
    btnClearApikey.classList.add("hidden");
    btnEditApikey.classList.add("hidden");
  }
}

// API helpers
async function apiRequest(path, options = {}) {
  if (!isAuthenticated) {
    throw new Error("Not authenticated. Open settings to set your API key.");
  }
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}


// Expand URLs to markdown links
async function expandUrls(text) {
  const urlRegex = /(?<!\[.*?\]\()(?<!\()(https?:\/\/[^\s\)]+)/g;
  const urls = [...text.matchAll(urlRegex)].map((m) => m[0]);
  if (!urls.length) return text;

  const uniqueUrls = [...new Set(urls)];
  const titles = await Promise.all(uniqueUrls.map((url) => fetchTitle(url)));

  let result = text;
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    const title = titles[i] || url;
    const regex = new RegExp(`(?<!\\[.*?\\]\\()(?<!\\()${escapeRegex(url)}`, "g");
    result = result.replace(regex, `[${title}](${url})`);
  }
  return result;
}


// Send
async function handleSend() {
  const text = editor.value.trim();
  if (!text) return;

  const dest = getSelectedDestination();
  if (!dest) {
    showToast("No destination selected", true);
    return;
  }

  btnSend.disabled = true;
  try {
    const expandedText = await expandUrls(text);
    const { name, note } = parseContent(expandedText);
    const finalName = dest.defaultText ? applyTemplate(dest.defaultText, name) : name;

    // ローカル日付を生成（サーバー側UTCとの差異を回避）
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    await apiRequest("/send", {
      method: "POST",
      body: JSON.stringify({
        destinationId: dest.nodeId,
        name: finalName,
        note,
        dailyNoteEnabled: dest.dailyNoteEnabled,
        localDate: dest.dailyNoteEnabled ? localDate : undefined,
      }),
    });

    editor.value = "";
    showToast("Sent!");
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btnSend.disabled = false;
  }
}

// History
async function loadHistory() {
  const dest = getSelectedDestination();
  if (!dest) {
    historyList.innerHTML = '<p class="text-muted">No destination selected</p>';
    return;
  }

  historyList.innerHTML = '<div class="spinner"></div>';
  try {
    const groups = await apiRequest(
      `/history?parent_id=${encodeURIComponent(dest.nodeId)}&daily_note=${dest.dailyNoteEnabled}`
    );
    if (!groups.length) {
      historyList.innerHTML = '<p class="text-muted">No items found</p>';
      return;
    }

    let html = "";
    for (const group of groups) {
      if (group.date) {
        html += `<div class="history-date-header">${escapeHtml(stripHtml(group.date))}</div>`;
      }
      if (!group.items.length) continue;
      html += group.items
        .map((node) => {
          const text = stripHtml(node.name || "").slice(0, 100);
          const wfUrl = `https://workflowy.com/#/${node.id}`;
          return `
            <div class="history-item">
              <div class="history-item-text">${escapeHtml(text)}</div>
              <a href="${wfUrl}" target="_blank" class="history-item-link" title="Open in Workflowy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          `;
        })
        .join("");
    }
    historyList.innerHTML = html || '<p class="text-muted">No items found</p>';
  } catch (e) {
    historyList.innerHTML = `<p class="text-muted">${escapeHtml(e.message)}</p>`;
  }
}

// Node tree for destination selection
let nodeTreePath = []; // [{ id, name }] breadcrumb trail

async function loadNodeTree(parentId) {
  nodeTree.innerHTML = '<div class="spinner"></div>';
  try {
    const pid = parentId || "None";
    const nodes = await apiRequest(`/nodes?parent_id=${encodeURIComponent(pid)}`);
    renderNodeTree(nodes);
  } catch (e) {
    nodeTree.innerHTML = `<p class="text-muted">${escapeHtml(e.message)}</p>`;
  }
}

function renderNodeTree(nodes) {
  nodeTree.innerHTML = "";

  // Breadcrumb navigation
  if (nodeTreePath.length > 0) {
    const breadcrumb = document.createElement("div");
    breadcrumb.className = "node-tree-breadcrumb";

    const rootLink = document.createElement("span");
    rootLink.className = "breadcrumb-link";
    rootLink.textContent = "Home";
    rootLink.addEventListener("click", () => {
      nodeTreePath = [];
      selectedNodeId = null;
      destNameInput.value = "";
      loadNodeTree();
    });
    breadcrumb.appendChild(rootLink);

    for (let i = 0; i < nodeTreePath.length; i++) {
      const sep = document.createElement("span");
      sep.className = "breadcrumb-sep";
      sep.textContent = " / ";
      breadcrumb.appendChild(sep);

      const crumb = nodeTreePath[i];
      if (i < nodeTreePath.length - 1) {
        const link = document.createElement("span");
        link.className = "breadcrumb-link";
        link.textContent = crumb.name;
        link.addEventListener("click", () => {
          nodeTreePath = nodeTreePath.slice(0, i + 1);
          selectedNodeId = crumb.id;
          destNameInput.value = crumb.name;
          loadNodeTree(crumb.id);
        });
        breadcrumb.appendChild(link);
      } else {
        const current = document.createElement("span");
        current.className = "breadcrumb-current";
        current.textContent = crumb.name;
        breadcrumb.appendChild(current);
      }
    }

    nodeTree.appendChild(breadcrumb);
  }

  if (!nodes.length) {
    const msg = document.createElement("p");
    msg.className = "text-muted";
    msg.textContent = "No child nodes";
    nodeTree.appendChild(msg);
    return;
  }

  for (const node of nodes) {
    const text = stripHtml(node.name || "(untitled)");
    const div = document.createElement("div");
    div.className = "node-tree-item" + (selectedNodeId === node.id ? " selected" : "");

    const nameSpan = document.createElement("span");
    nameSpan.className = "node-tree-item-name";
    nameSpan.textContent = text;
    div.appendChild(nameSpan);

    const drillBtn = document.createElement("span");
    drillBtn.className = "node-tree-drill";
    drillBtn.textContent = "▶";
    drillBtn.title = "Show children";
    div.appendChild(drillBtn);

    // Click name to select
    nameSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedNodeId = node.id;
      destNameInput.value = text;
      nodeTree.querySelectorAll(".node-tree-item").forEach((el) => el.classList.remove("selected"));
      div.classList.add("selected");
    });

    // Click drill button to navigate into children
    drillBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedNodeId = node.id;
      destNameInput.value = text;
      nodeTreePath.push({ id: node.id, name: text });
      loadNodeTree(node.id);
    });

    nodeTree.appendChild(div);
  }
}

// Destination management
function renderDestinationList() {
  destinationList.innerHTML = "";
  if (!settings.destinations.length) {
    destinationList.innerHTML = '<p class="text-muted">No destinations configured</p>';
    return;
  }
  for (const dest of settings.destinations) {
    const isActive = dest.id === settings.selectedDestinationId;
    const div = document.createElement("div");
    div.className = "destination-item" + (isActive ? " active" : "");
    div.innerHTML = `
      <span class="destination-item-name">${escapeHtml(dest.name)}</span>
      ${dest.dailyNoteEnabled ? '<span class="destination-item-badge">Daily</span>' : ""}
      <button class="destination-item-delete" data-id="${dest.id}">&times;</button>
    `;
    div.addEventListener("click", (e) => {
      if (e.target.closest(".destination-item-delete")) return;
      settings.selectedDestinationId = dest.id;
      saveSettings();
      updateDestinationLabel();
      renderDestinationList();
      editor.value = "";
        });
    div.querySelector(".destination-item-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      settings.destinations = settings.destinations.filter((d) => d.id !== dest.id);
      if (settings.selectedDestinationId === dest.id) {
        settings.selectedDestinationId = settings.destinations[0]?.id || "";
      }
      saveSettings();
      updateDestinationLabel();
      renderDestinationList();
    });
    destinationList.appendChild(div);
  }
}

function saveDestination() {
  if (!selectedNodeId) {
    showToast("Select a node first", true);
    return;
  }
  const name = destNameInput.value.trim();
  if (!name) {
    showToast("Enter a name", true);
    return;
  }

  const dest = {
    id: crypto.randomUUID(),
    nodeId: selectedNodeId,
    name,
    dailyNoteEnabled: destDailyNote.checked,
    defaultText: destDefaultText.value,
  };
  settings.destinations.push(dest);
  if (!settings.selectedDestinationId) {
    settings.selectedDestinationId = dest.id;
  }
  saveSettings();
  updateDestinationLabel();
  renderDestinationList();
  panelAddDest.classList.add("hidden");
  showToast("Destination added");
}

// Web Share Target
function handleShareTarget() {
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  const text = params.get("text");
  const title = params.get("title");

  if (!url && !text) return;

  if (url) {
    // Fetch title for URL
    fetchTitle(url).then((fetchedTitle) => {
      const displayTitle = title || fetchedTitle || url;
      const current = editor.value;
      editor.value = current + `[${displayTitle}](${url})`;
      editor.focus();
    });
  } else if (text) {
    editor.value = (editor.value || "") + text;
    editor.focus();
  }

  // Clean URL
  window.history.replaceState({}, "", "/");
}

async function fetchTitle(url) {
  try {
    const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.title;
  } catch {
    return null;
  }
}

// Modal helpers
function openModal(modal, onOpen) {
  modal.classList.remove("hidden");
  if (onOpen) onOpen();
}

// Toast
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = "toast" + (isError ? " error" : "");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}


// Service Worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

// Start
init();
