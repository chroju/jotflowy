import { applyTemplate, parseContent, escapeRegex, escapeHtml, stripHtml, sanitizeHtml, applyTypographySettings, FONT_FAMILY_MAP } from "./utils.js";

// State
let settings = loadSettings();
let isAuthenticated = false;

// DOM elements
const editor = document.getElementById("editor");
const btnSend = document.getElementById("btn-send");
const btnCompose = document.getElementById("btn-compose");
const btnSettings = document.getElementById("btn-settings");
const destinationSelector = document.getElementById("destination-selector");
const destinationLabel = document.getElementById("destination-label");
const destinationDropdown = document.getElementById("destination-dropdown");
const toast = document.getElementById("toast");

// Settings modal
const modalSettings = document.getElementById("modal-settings");
const fontSizeSlider = document.getElementById("font-size-slider");
const fontSizeValue = document.getElementById("font-size-value");
const lineHeightSlider = document.getElementById("line-height-slider");
const lineHeightValue = document.getElementById("line-height-value");
const fontFamilySelect = document.getElementById("font-family-select");
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

// Compose modal
const modalCompose = document.getElementById("modal-compose");

// History
const historyList = document.getElementById("history-list");

let selectedNodeId = null;

// Init
async function init() {
  applyTypographySettings(settings);
  updateDestinationLabel();
  handleShareTarget();
  registerServiceWorker();
  bindEvents();
  setupMobileViewport();
  await checkAuth();
  loadHistory();
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
  btnCompose.addEventListener("click", () => openModal(modalCompose, () => editor.focus()));
  btnSettings.addEventListener("click", () => {
    updateApiKeyUI();
    renderDestinationList();
    const fs = settings.fontSize ?? 16;
    const lh = settings.lineHeight ?? 1.8;
    fontSizeSlider.value = String(fs);
    fontSizeValue.textContent = `${fs}px`;
    lineHeightSlider.value = String(lh);
    lineHeightValue.textContent = String(lh);
    fontFamilySelect.value = settings.fontFamily || "gothic";
    openModal(modalSettings);
  });

  fontSizeSlider.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    fontSizeValue.textContent = `${val}px`;
    settings.fontSize = val;
    saveSettings();
    applyTypographySettings(settings);
  });

  lineHeightSlider.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    lineHeightValue.textContent = String(val);
    settings.lineHeight = val;
    saveSettings();
    applyTypographySettings(settings);
  });

  fontFamilySelect.addEventListener("change", (e) => {
    settings.fontFamily = e.target.value;
    saveSettings();
    applyTypographySettings(settings);
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
      loadHistory();
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
  return { destinations: [], selectedDestinationId: "", fontSize: 16, lineHeight: 1.8, fontFamily: "gothic" };
}

function saveSettings() {
  localStorage.setItem("jotflowy_settings", JSON.stringify(settings));
}

function getHistoryCache(destinationId) {
  try {
    const raw = localStorage.getItem("jotflowy_history_cache");
    if (!raw) return null;
    const entry = JSON.parse(raw)[destinationId];
    if (!entry || !entry.groups) return null;
    return entry.groups;
  } catch {
    return null;
  }
}

function setHistoryCache(destinationId, groups) {
  try {
    const raw = localStorage.getItem("jotflowy_history_cache");
    const cache = raw ? JSON.parse(raw) : {};
    cache[destinationId] = { groups, timestamp: Date.now() };
    localStorage.setItem("jotflowy_history_cache", JSON.stringify(cache));
  } catch {}
}

function clearHistoryCache(destinationId) {
  try {
    const raw = localStorage.getItem("jotflowy_history_cache");
    if (!raw) return;
    const cache = JSON.parse(raw);
    delete cache[destinationId];
    localStorage.setItem("jotflowy_history_cache", JSON.stringify(cache));
  } catch {}
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

    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const result = await apiRequest("/send", {
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
    modalCompose.classList.add("hidden");
    showToast("Sent!");

    optimisticInsert(dest, finalName, note || null, localDate, result.item_id);
    refreshHistoryInBackground(dest);
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btnSend.disabled = false;
  }
}

function optimisticInsert(dest, name, note, localDate, itemId) {
  const tempNode = {
    id: itemId || `temp-${Date.now()}`,
    name,
    note,
    priority: -1,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    completedAt: null,
  };

  let groups = getHistoryCache(dest.id) || [];

  if (dest.dailyNoteEnabled) {
    const todayIndex = groups.findIndex((g) => {
      if (!g.date) return false;
      return parseDateText(g.date) === localDate;
    });

    if (todayIndex >= 0) {
      groups[todayIndex].items.push(tempNode);
    } else {
      groups.unshift({
        date: `[${localDate}]`,
        dateId: null,
        items: [tempNode],
        hasMore: false,
      });
    }
  } else {
    if (groups.length > 0) {
      groups[0].items.unshift(tempNode);
    } else {
      groups = [{ date: null, dateId: null, items: [tempNode], hasMore: false }];
    }
  }

  setHistoryCache(dest.id, groups);
  renderHistoryFromGroups(groups, dest);

  const freshEl = historyList.querySelector(
    `.history-item[data-node-id="${CSS.escape(tempNode.id)}"]`
  );
  if (freshEl) {
    freshEl.classList.add("ink-fresh");
    freshEl.addEventListener(
      "animationend",
      () => freshEl.classList.remove("ink-fresh"),
      { once: true }
    );
  }
}

async function refreshHistoryInBackground(dest) {
  try {
    const groups = await apiRequest(
      `/history?parent_id=${encodeURIComponent(dest.nodeId)}&daily_note=${dest.dailyNoteEnabled}`
    );
    setHistoryCache(dest.id, groups);
    if (getSelectedDestination()?.id === dest.id) {
      renderHistoryFromGroups(groups, dest);
    }
  } catch {
    // Silent failure -- POST already succeeded, optimistic view is showing
  }
}

// History rendering
const trashIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6" />
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  <path d="M10 11v6M14 11v6" />
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
</svg>`;

function formatItemDateTime(ts) {
  if (!ts) return "";
  // Workflowy API returns seconds; optimistic tempNode uses Date.now() (ms)
  const d = new Date(ts > 1e12 ? ts : ts * 1000);
  if (isNaN(d.getTime())) return "";
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

function renderHistoryGroupsHtml(groups) {
  let html = "";
  for (const group of groups) {
    if (group.date) {
      const dateWfUrl = group.dateId ? `https://workflowy.com/#/${group.dateId}` : null;
      const dateText = escapeHtml(parseDateText(stripHtml(group.date)) || stripHtml(group.date));
      const dateDeleteBtn = group.dateId
        ? `<button class="history-date-delete" data-node-id="${group.dateId}" title="Delete date group">${trashIcon}</button>`
        : "";
      html += dateWfUrl
        ? `<div class="history-date-header">
            <span class="history-date-text">${dateText}</span>
            <a href="${dateWfUrl}" target="_blank" class="history-date-link" title="Open in Workflowy">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            ${dateDeleteBtn}
          </div>`
        : `<div class="history-date-header">${dateText}</div>`;
    }
    if (!group.items.length) continue;
    html += group.items
      .map((node) => {
        const rawName = node.name || "";
        const textContent = stripHtml(rawName);
        const text = textContent.length > 100 ? sanitizeHtml(stripHtml(rawName).slice(0, 100)) : sanitizeHtml(rawName);
        const note = node.note ? stripHtml(node.note) : "";
        const wfUrl = `https://workflowy.com/#/${node.id}`;
        const isCompleted = node.completedAt !== null;
        const completedClass = isCompleted ? " completed" : "";
        const hasNote = note.length > 0;

        const toggleBtn = hasNote
          ? `<button class="history-item-toggle" data-node-id="${node.id}" title="Toggle note">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="2,0 8,5 2,10" />
              </svg>
            </button>`
          : "";

        const time = formatItemDateTime(node.createdAt);
        const timeHtml = time ? `<span class="history-item-time">${time}</span>` : "";

        const noteHtml = hasNote
          ? `<div class="history-item-note hidden" data-note-for="${node.id}">${escapeHtml(note)}</div>`
          : "";

        const completeBtn = isCompleted
          ? `<button class="history-item-uncomplete" data-node-id="${node.id}" title="Mark as incomplete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0 -18 0" />
                <path d="M9 12l2 2l4 -4" />
              </svg>
            </button>`
          : `<button class="history-item-complete" data-node-id="${node.id}" title="Mark as complete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </button>`;

        return `
          <div class="history-item${completedClass}" data-node-id="${node.id}">
            <div class="history-item-meta">
              ${toggleBtn}
              ${timeHtml}
              <span class="history-item-actions">
                ${completeBtn}
                <a href="${wfUrl}" target="_blank" class="history-item-link" title="Open in Workflowy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <button class="history-item-delete" data-node-id="${node.id}" title="Delete">${trashIcon}</button>
              </span>
            </div>
            <div class="history-item-content">
              <div class="history-item-text">${text}</div>
              ${noteHtml}
            </div>
          </div>
        `;
      })
      .join("");
  }
  return html;
}

function renderHistoryFromGroups(groups, dest) {
  if (!groups.length) {
    historyList.innerHTML = '<p class="text-muted">No items found</p>';
    return;
  }
  const html = renderHistoryGroupsHtml(groups);
  historyList.innerHTML = html || '<p class="text-muted">No items found</p>';
  historyList.addEventListener("click", handleHistoryClick);

  if (historyObserver) { historyObserver.disconnect(); historyObserver = null; }
  const last = groups[groups.length - 1];
  if (last.hasMore && dest.dailyNoteEnabled) {
    const nextBeforeDate = parseDateText(last.date || "");
    if (nextBeforeDate) setupInfiniteScroll(nextBeforeDate);
  }
}

function showRefreshIndicator() {
  if (document.getElementById("history-refresh-indicator")) return;
  const indicator = document.createElement("div");
  indicator.id = "history-refresh-indicator";
  indicator.className = "history-refresh-indicator";
  indicator.innerHTML = '<div class="spinner"></div>';
  historyList.parentElement.insertBefore(indicator, historyList);
}

function hideRefreshIndicator() {
  document.getElementById("history-refresh-indicator")?.remove();
}

let historyObserver = null;

function setupInfiniteScroll(beforeDate) {
  if (historyObserver) historyObserver.disconnect();

  const sentinel = document.createElement("div");
  sentinel.className = "history-sentinel";
  historyList.appendChild(sentinel);

  let loading = false;
  historyObserver = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting || loading) return;
    loading = true;
    sentinel.innerHTML = '<div class="spinner"></div>';
    try {
      await loadMoreHistory(beforeDate);
    } finally {
      loading = false;
    }
  });
  historyObserver.observe(sentinel);
}

async function loadMoreHistory(beforeDate) {
  const dest = getSelectedDestination();
  if (!dest || !dest.dailyNoteEnabled) return;

  const sentinel = historyList.querySelector(".history-sentinel");
  try {
    const groups = await apiRequest(
      `/history?parent_id=${encodeURIComponent(dest.nodeId)}&daily_note=true&before_date=${encodeURIComponent(beforeDate)}`
    );
    if (sentinel) sentinel.remove();
    if (historyObserver) { historyObserver.disconnect(); historyObserver = null; }

    if (!groups.length) return;

    const html = renderHistoryGroupsHtml(groups);
    const container = document.createElement("div");
    container.innerHTML = html;
    historyList.append(...container.childNodes);

    const last = groups[groups.length - 1];
    if (last.hasMore) {
      const nextBeforeDate = parseDateText(last.date || "");
      if (nextBeforeDate) setupInfiniteScroll(nextBeforeDate);
    }
  } catch (e) {
    if (sentinel) sentinel.innerHTML = `<p class="text-muted">${escapeHtml(e.message)}</p>`;
  }
}

function parseDateText(text) {
  const bracketMatch = text.match(/\[(\d{4}-\d{2}-\d{2})\]/);
  if (bracketMatch) return bracketMatch[1];
  const wfMatch = text.match(/\w{3}, (\w{3}) (\d{1,2}), (\d{4})/);
  if (wfMatch) {
    const months = { Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12" };
    return `${wfMatch[3]}-${months[wfMatch[1]]}-${wfMatch[2].padStart(2,"0")}`;
  }
  return null;
}

// History
async function loadHistory() {
  const dest = getSelectedDestination();
  if (!dest) {
    historyList.innerHTML = '<p class="text-muted">No destination selected</p>';
    return;
  }

  if (historyObserver) { historyObserver.disconnect(); historyObserver = null; }

  const cached = getHistoryCache(dest.id);
  if (cached && cached.length > 0) {
    renderHistoryFromGroups(cached, dest);
    showRefreshIndicator();
    try {
      const groups = await apiRequest(
        `/history?parent_id=${encodeURIComponent(dest.nodeId)}&daily_note=${dest.dailyNoteEnabled}`
      );
      setHistoryCache(dest.id, groups);
      if (getSelectedDestination()?.id === dest.id) {
        renderHistoryFromGroups(groups, dest);
      }
    } catch {
      // Keep cached view visible
    } finally {
      hideRefreshIndicator();
    }
  } else {
    historyList.innerHTML = '<div class="spinner"></div>';
    try {
      const groups = await apiRequest(
        `/history?parent_id=${encodeURIComponent(dest.nodeId)}&daily_note=${dest.dailyNoteEnabled}`
      );
      setHistoryCache(dest.id, groups);
      renderHistoryFromGroups(groups, dest);
    } catch (e) {
      historyList.innerHTML = `<p class="text-muted">${escapeHtml(e.message)}</p>`;
    }
  }
}

function updateCacheItem(nodeId, updater) {
  const dest = getSelectedDestination();
  if (!dest) return;
  const groups = getHistoryCache(dest.id);
  if (!groups) return;
  for (const group of groups) {
    const item = group.items.find((i) => i.id === nodeId);
    if (item) { updater(item); break; }
  }
  setHistoryCache(dest.id, groups);
}

function removeCacheItem(nodeId) {
  const dest = getSelectedDestination();
  if (!dest) return;
  const groups = getHistoryCache(dest.id);
  if (!groups) return;
  for (const group of groups) {
    group.items = group.items.filter((i) => i.id !== nodeId);
  }
  setHistoryCache(dest.id, groups);
}

function removeCacheDateGroup(dateId) {
  const dest = getSelectedDestination();
  if (!dest) return;
  const groups = getHistoryCache(dest.id);
  if (!groups) return;
  setHistoryCache(dest.id, groups.filter((g) => g.dateId !== dateId));
}

// Handle clicks in history list (toggle notes and complete/uncomplete)
async function handleHistoryClick(e) {
  const toggleBtn = e.target.closest(".history-item-toggle");
  if (toggleBtn) {
    const nodeId = toggleBtn.dataset.nodeId;
    const noteEl = historyList.querySelector(`[data-note-for="${nodeId}"]`);
    if (noteEl) {
      noteEl.classList.toggle("hidden");
      toggleBtn.classList.toggle("expanded");
    }
    return;
  }

  const completeBtn = e.target.closest(".history-item-complete");
  if (completeBtn) {
    const nodeId = completeBtn.dataset.nodeId;
    completeBtn.disabled = true;
    try {
      await apiRequest(`/nodes/${encodeURIComponent(nodeId)}/complete`, { method: "POST" });
      updateCacheItem(nodeId, (item) => { item.completedAt = Date.now(); });
      const historyItem = historyList.querySelector(`.history-item[data-node-id="${nodeId}"]`);
      if (historyItem) {
        historyItem.classList.add("completed");
        completeBtn.outerHTML = `
          <button class="history-item-uncomplete" data-node-id="${nodeId}" title="Mark as incomplete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0 -18 0" />
              <path d="M9 12l2 2l4 -4" />
            </svg>
          </button>`;
      }
    } catch (err) {
      showToast(err.message, true);
    }
    return;
  }

  const uncompleteBtn = e.target.closest(".history-item-uncomplete");
  if (uncompleteBtn) {
    const nodeId = uncompleteBtn.dataset.nodeId;
    uncompleteBtn.disabled = true;
    try {
      await apiRequest(`/nodes/${encodeURIComponent(nodeId)}/uncomplete`, { method: "POST" });
      updateCacheItem(nodeId, (item) => { item.completedAt = null; });
      const historyItem = historyList.querySelector(`.history-item[data-node-id="${nodeId}"]`);
      if (historyItem) {
        historyItem.classList.remove("completed");
        uncompleteBtn.outerHTML = `
          <button class="history-item-complete" data-node-id="${nodeId}" title="Mark as complete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
            </svg>
          </button>`;
      }
    } catch (err) {
      showToast(err.message, true);
    }
    return;
  }

  const deleteBtn = e.target.closest(".history-item-delete");
  if (deleteBtn) {
    const nodeId = deleteBtn.dataset.nodeId;
    deleteBtn.disabled = true;
    try {
      await apiRequest(`/nodes/${encodeURIComponent(nodeId)}`, { method: "DELETE" });
      removeCacheItem(nodeId);
      historyList.querySelector(`.history-item[data-node-id="${nodeId}"]`)?.remove();
    } catch (err) {
      showToast(err.message, true);
      deleteBtn.disabled = false;
    }
    return;
  }

  const datDeleteBtn = e.target.closest(".history-date-delete");
  if (datDeleteBtn) {
    const nodeId = datDeleteBtn.dataset.nodeId;
    datDeleteBtn.disabled = true;
    try {
      await apiRequest(`/nodes/${encodeURIComponent(nodeId)}`, { method: "DELETE" });
      removeCacheDateGroup(nodeId);
      const header = datDeleteBtn.closest(".history-date-header");
      if (header) {
        let el = header.nextElementSibling;
        while (el && !el.classList.contains("history-date-header")) {
          const next = el.nextElementSibling;
          el.remove();
          el = next;
        }
        header.remove();
      }
    } catch (err) {
      showToast(err.message, true);
      datDeleteBtn.disabled = false;
    }
    return;
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
    const isCompleted = node.completedAt !== null;
    div.className = "node-tree-item" + (selectedNodeId === node.id ? " selected" : "") + (isCompleted ? " completed" : "");

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
      loadHistory();
        });
    div.querySelector(".destination-item-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      clearHistoryCache(dest.id);
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
  settings.selectedDestinationId = dest.id;
  saveSettings();
  updateDestinationLabel();
  renderDestinationList();
  panelAddDest.classList.add("hidden");
  showToast("Destination added");
  loadHistory();
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
      openModal(modalCompose, () => editor.focus());
    });
  } else if (text) {
    editor.value = (editor.value || "") + text;
    openModal(modalCompose, () => editor.focus());
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
