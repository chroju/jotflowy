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
          <iconify-icon class="destination-icon" icon="heroicons:map-pin" width="12" height="12"></iconify-icon>
          <span id="destination-label">No destination</span>
          <iconify-icon class="destination-chevron" icon="heroicons:chevron-down" width="12" height="12"></iconify-icon>
        </button>
        <div id="destination-dropdown" class="destination-dropdown hidden"></div>
      </div>
      <div class="toolbar-right">
        <button id="btn-settings" class="btn" title="Settings">
          <iconify-icon icon="heroicons:cog-6-tooth" width="20" height="20"></iconify-icon>
        </button>
        <button id="btn-history" class="btn" title="History">
          <iconify-icon icon="heroicons:clock" width="20" height="20"></iconify-icon>
        </button>
        <button id="btn-send" class="btn btn-send" title="Send">
          <iconify-icon icon="heroicons:paper-airplane" width="16" height="16"></iconify-icon>
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
            <p class="text-muted text-small">
              WARN: Your API key and data are processed by this server. <a href="https://github.com/chroju/jotflowy" target="_blank" rel="noopener">Deploy your own</a> for full privacy.
            </p>
          </section>

          <section class="settings-section">
            <h3>Destinations</h3>
            <div id="destination-list" class="destination-list"></div>
            <button id="btn-add-destination" class="btn btn-small">+ Add destination</button>
          </section>

          <section class="settings-section">
            <h3>Typography</h3>
            <div class="slider-group">
              <div class="slider-header">
                <label class="input-label" for="font-size-slider">Font Size</label>
                <span id="font-size-value" class="slider-value">16px</span>
              </div>
              <input id="font-size-slider" class="slider" type="range" min="12" max="24" step="1" value="16" />
            </div>
            <div class="slider-group">
              <div class="slider-header">
                <label class="input-label" for="line-height-slider">Line Height</label>
                <span id="line-height-value" class="slider-value">1.8</span>
              </div>
              <input id="line-height-slider" class="slider" type="range" min="1.2" max="2.4" step="0.1" value="1.8" />
            </div>
            <div class="input-group">
              <label class="input-label" for="font-family-select">Font Family</label>
              <select id="font-family-select" class="select">
                <option value="gothic">游ゴシック (Gothic)</option>
                <option value="hiragino">ヒラギノ角ゴ (Gothic)</option>
                <option value="mincho">游明朝 (Mincho)</option>
              </select>
            </div>
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
