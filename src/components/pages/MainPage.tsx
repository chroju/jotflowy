import type { FC } from "hono/jsx";

export const MainPage: FC = () => (
  <div id="app">
    <div id="toast" class="toast hidden"></div>
    <main class="main">
      <textarea
        id="editor"
        class="editor"
        placeholder="Type your note here...&#10;&#10;(Empty line separates name and note)"
        autofocus
      ></textarea>
    </main>
    <footer class="toolbar">
      <div class="toolbar-left">
        <button id="destination-selector" class="destination-selector" title="Change destination">
          <svg class="destination-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          <span id="destination-label">No destination</span>
          <svg class="destination-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div id="destination-dropdown" class="destination-dropdown hidden"></div>
      </div>
      <div class="toolbar-right">
        <button id="btn-settings" class="btn" title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button id="btn-history" class="btn" title="History">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button id="btn-send" class="btn btn-send" title="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          Send
        </button>
      </div>
    </footer>

    {/* Settings Modal */}
    <div id="modal-settings" class="modal hidden">
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Settings</h2>
          <button class="modal-close" data-close-modal="modal-settings">&times;</button>
        </div>
        <div class="modal-body">
          <section class="settings-section">
            <h3>API Key</h3>
            <div class="input-group">
              <input id="api-key-input" type="password" placeholder="Workflowy API Key" class="input" />
              <button id="btn-save-apikey" class="btn btn-small btn-primary">Save</button>
              <button id="btn-clear-apikey" class="btn btn-small hidden">Clear</button>
              <button id="btn-edit-apikey" class="btn btn-small hidden">Edit</button>
            </div>
            <p class="text-muted text-small">
              <a href="https://workflowy.com/api-key" target="_blank" rel="noopener">Get your API key</a>
            </p>
          </section>

          <section class="settings-section">
            <h3>Destinations</h3>
            <div id="destination-list" class="destination-list"></div>
            <button id="btn-add-destination" class="btn btn-small">+ Add destination</button>
          </section>

          {/* Add destination sub-panel */}
          <div id="panel-add-destination" class="sub-panel hidden">
            <h3>Add Destination</h3>
            <div id="node-tree" class="node-tree">
              <p class="text-muted">Loading nodes...</p>
            </div>
            <div class="input-group">
              <input id="dest-name-input" type="text" placeholder="Display name" class="input" />
            </div>
            <div class="checkbox-group">
              <label>
                <input id="dest-daily-note" type="checkbox" />
                Enable Daily Note
              </label>
            </div>
            <div class="input-group">
              <label class="input-label">Template</label>
              <input id="dest-default-text" type="text" placeholder={'e.g. **{HH}:{mm}** {content}'} class="input" />
              <p class="text-muted text-small">{'{content} = input text. Date: {YYYY}, {MM}, {DD}, {HH}, {mm}, {ss}'}</p>
            </div>
            <div class="btn-group">
              <button id="btn-save-destination" class="btn btn-primary btn-small">Save</button>
              <button id="btn-cancel-destination" class="btn btn-small">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* History Modal */}
    <div id="modal-history" class="modal hidden">
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>History</h2>
          <button class="modal-close" data-close-modal="modal-history">&times;</button>
        </div>
        <div class="modal-body">
          <div id="history-list" class="history-list">
            <p class="text-muted">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
