export const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <title>Jotflowy - Quick Notes to Workflowy</title>
    <meta content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover,interactive-widget=resizes-content" name="viewport">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-primary: #2E3440;
            --bg-secondary: #3B4252;
            --bg-tertiary: #434C5E;
            --text-primary: #ECEFF4;
            --text-secondary: #D8DEE9;
            --text-muted: #81A1C1;
            --border-color: #4C566A;
            --accent-color: #5E81AC;
            --heading-color: #88C0D0;
            --link-color: #88C0D0;
            --success-color: #A3BE8C;
            --error-color: #BF616A;
        }

        *, *::before, *::after {
            box-sizing: border-box;
        }

        body, html {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            overflow-x: hidden;
            /* Support iOS Safari viewport changes on keyboard show */
            -webkit-overflow-scrolling: touch;
        }

        .container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding: 20px;
            padding-bottom: calc(20px + env(keyboard-inset-height, 0px));
            gap: 16px;
        }

        .form-section {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            gap: 12px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .input-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        textarea {
            width: 100%;
            padding: 16px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            resize: none;
            font-size: 16px;
            font-family: Hiragino Mincho ProN, Yu Mincho, serif;
            transition: border-color 0.2s ease;
        }

        textarea:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        #textArea {
            height: 120px;
        }

        #noteArea {
            height: 120px;
        }

        .controls-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: sticky;
            bottom: 0;
            background: var(--bg-primary);
            padding-top: 16px;
            margin-top: auto;
        }

        .control-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        select {
            flex-grow: 1;
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 16px;
        }

        select:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-secondary);
        }

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: var(--accent-color);
        }

        .button-row {
            display: flex;
            gap: 12px;
        }

        .btn {
            flex: 1;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn i {
            font-size: 14px;
            opacity: 0.9;
        }

        .btn-primary {
            background: var(--accent-color);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: #4C7098;
        }

        .btn-primary:disabled {
            background: var(--border-color);
            cursor: not-allowed;
        }

        .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            border: 2px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: var(--border-color);
        }

        .btn-link {
            background: transparent;
            color: var(--text-muted);
            font-size: 14px;
            text-decoration: underline;
        }

        .btn-link:hover {
            color: var(--accent-color);
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }

        .modal-content {
            background: var(--bg-primary);
            margin: 10% auto;
            padding: 24px;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            border: 2px solid var(--border-color);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
        }

        .close {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close:hover {
            color: var(--text-primary);
        }

        .modal-body {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        input[type="text"], input[type="url"], input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        input[type="text"]:focus, input[type="url"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        /* Password input specific styling */
        input[type="password"] {
            letter-spacing: 0.1em;
        }
        
        .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .password-toggle {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 14px;
            padding: 4px;
        }
        
        .password-toggle:hover {
            color: var(--text-primary);
        }

        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            transition: all 0.3s ease;
        }

        .toast.success {
            background: var(--success-color);
        }

        .toast.error {
            background: var(--error-color);
        }
        
        /* Help modal specific styles */
        #helpModal .modal-content {
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        #helpModal .modal-body {
            overflow-y: auto;
            flex: 1;
            padding-right: 8px;
        }
        
        #helpModal .modal-body h3 {
            color: var(--heading-color);
            margin-top: 24px;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        #helpModal .modal-body h3:first-child {
            margin-top: 0;
        }
        
        #helpModal .modal-body ul {
            margin: 0 0 16px 0;
            padding-left: 20px;
        }
        
        #helpModal .modal-body li {
            margin-bottom: 8px;
        }
        
        /* Custom scrollbar for help modal */
        #helpModal .modal-body::-webkit-scrollbar {
            width: 6px;
        }
        
        #helpModal .modal-body::-webkit-scrollbar-track {
            background: var(--bg-tertiary);
            border-radius: 3px;
        }
        
        #helpModal .modal-body::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }
        
        #helpModal .modal-body::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }

        .history-list {
            max-height: 300px;
            overflow-y: auto;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
        }

        .history-item {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .history-item:hover {
            background: var(--bg-tertiary);
        }

        .history-item:last-child {
            border-bottom: none;
        }

        .history-item-title {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .history-item-meta {
            font-size: 12px;
            color: var(--text-muted);
        }

        /* Mobile keyboard handling */
        @media (max-width: 767px) {
            .container {
                overflow-y: auto;
                max-height: 100vh;
            }
            
            body.keyboard-active .controls-section {
                position: fixed;
                bottom: 0;
                left: 20px;
                right: 20px;
                z-index: 100;
                padding: 16px 0;
                border-top: 1px solid var(--border-color);
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            }
            
            body.keyboard-active .form-section {
                padding-bottom: 80px;
            }
            
            /* Modal keyboard handling */
            body.keyboard-active .modal-content {
                position: relative;
                max-height: 70vh;
                overflow-y: auto;
                margin-top: 5%;
            }
            
            body.keyboard-active .modal-content .button-row {
                position: sticky;
                bottom: 0;
                background: var(--bg-primary);
                padding-top: 16px;
                margin-top: 16px;
                border-top: 1px solid var(--border-color);
            }
        }

        @media (min-width: 768px) {
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
            }

            #textArea {
                height: 160px;
            }

            #noteArea {
                height: 200px;
            }

            .btn {
                padding: 18px;
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="form-section">
            <div class="input-group">
                <label class="input-label" for="textArea">Text</label>
                <textarea id="textArea" placeholder="Enter your main content here..."></textarea>
            </div>

            <div class="input-group">
                <label class="input-label" for="noteArea">Note (Optional)</label>
                <textarea id="noteArea" placeholder="Add detailed information or context..."></textarea>
            </div>
        </div>

        <div class="controls-section">
            <div class="control-row">
                <div class="input-group" style="flex-grow: 1;">
                    <label class="input-label">Save Location</label>
                    <select id="mainLocationSelect">
                        <option value="">Select save location...</option>
                    </select>
                </div>
            </div>
            
            <div class="control-row">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="mainTimestampCheckbox" checked>
                    <label for="mainTimestampCheckbox">Add timestamp to note (YYYY-MM-DD HH:MM)</label>
                </div>
            </div>
            
            <div class="button-row">
                <button id="submitBtn" class="btn btn-primary" disabled>
                    <i class="fas fa-paper-plane"></i> Submit
                </button>
                <button id="settingsBtn" class="btn btn-secondary">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </div>
        </div>
    </div>

    <!-- Initial Setup Modal -->
    <div id="setupModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Welcome to Jotflowy</h2>
            </div>
            <div class="modal-body">
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Let's set up your Workflowy integration. You'll need an API key and a valid save location to get started.
                </p>
                
                <div class="input-group">
                    <label class="input-label">Step 1: Workflowy API Key</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="setupApiKeyInput" placeholder="Enter your Workflowy API key">
                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('setupApiKeyInput', this)"><i class="fas fa-eye"></i></button>
                    </div>
                    <button id="setupGetApiKeyBtn" class="btn btn-link">
                        <i class="fas fa-key"></i> Get API Key from Workflowy
                    </button>
                </div>

                <div class="input-group">
                    <label class="input-label">Step 2: Default Save Location</label>
                    <input type="text" id="setupLocationNameInput" placeholder="Location name (e.g., Daily Notes, Inbox)">
                    <input type="url" id="setupLocationUrlInput" placeholder="https://workflowy.com/#/your-location">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="setupLocationDaily">
                        <label for="setupLocationDaily">Create daily note automatically</label>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fas fa-lightbulb"></i> Tip: Open Workflowy, navigate to where you want to save notes, and copy the URL from your browser.
                    </div>
                </div>

                <div class="button-row">
                    <button id="completeSetupBtn" class="btn btn-primary" disabled>Complete Setup</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Settings Modal -->
    <div id="settingsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Settings</h2>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button id="helpBtn" class="btn btn-link" style="font-size: 14px; padding: 4px 8px;">
                        <i class="fas fa-question-circle"></i> Help
                    </button>
                    <button class="close" id="settingsClose">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label class="input-label">Workflowy API Key</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="apiKeyInput" placeholder="Enter your Workflowy API key">
                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('apiKeyInput', this)"><i class="fas fa-eye"></i></button>
                    </div>
                    <button id="getApiKeyBtn" class="btn btn-link">
                        <i class="fas fa-key"></i> Get API Key from Workflowy
                    </button>
                </div>
                
                <hr style="border-color: var(--border-color); margin: 20px 0;">
                
                <div class="button-row">
                    <button id="historyBtn" class="btn btn-secondary">
                        <i class="fas fa-history"></i> History
                    </button>
                    <button id="locationsBtn" class="btn btn-secondary">
                        <i class="fas fa-map-marker-alt"></i> Locations
                    </button>
                </div>
                
                <div class="button-row">
                    <button id="saveSettingsBtn" class="btn btn-primary">Save Settings</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Locations Modal -->
    <div id="locationsModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Save Locations</h2>
                <button class="close" id="locationsClose">×</button>
            </div>
            <div class="modal-body">
                <div id="locationsList"></div>
                <hr style="border-color: var(--border-color); margin: 20px 0;">
                <h3>Add New Location</h3>
                <div class="input-group">
                    <label class="input-label">Location Name</label>
                    <input type="text" id="newLocationName" placeholder="e.g., Today's Note, Work Inbox">
                </div>
                <div class="input-group">
                    <label class="input-label">Workflowy URL</label>
                    <input type="url" id="newLocationUrl" placeholder="https://workflowy.com/#/...">
                </div>
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="newLocationDaily">
                    <label for="newLocationDaily">Create daily note automatically</label>
                </div>
                <div class="button-row">
                    <button id="addLocationBtn" class="btn btn-primary">Add Location</button>
                </div>
            </div>
        </div>
    </div>

    <!-- History Modal -->
    <div id="historyModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Post History (up to 30)</h2>
                <button class="close" id="historyClose">×</button>
            </div>
            <div class="modal-body">
                <div id="historyList" class="history-list">
                    <div style="padding: 20px; text-align: center; color: var(--text-muted);">
                        No history available
                    </div>
                </div>
                <div class="button-row">
                    <button id="clearHistoryBtn" class="btn btn-secondary">Clear History</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Help Modal -->
    <div id="helpModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title"><i class="fas fa-question-circle"></i> Jotflowy Help</h2>
                <button class="close" id="helpClose">×</button>
            </div>
            <div class="modal-body">
                <h3>About</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin: 0 0 12px 0;">Jotflowy is a browser-based note-taking app that integrates with Workflowy's official API. Your settings are saved locally in your browser.</p>
                <p style="color: var(--text-secondary); line-height: 1.6; margin: 0 0 20px 0;">
                    <a href="https://github.com/chroju/jotflowy" target="_blank" rel="noopener" style="color: var(--link-color); text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fab fa-github"></i> Source https://github.com/chroju/jotflowy
                    </a>
                </p>
                
                <h3>Getting Started</h3>
                <ul style="color: var(--text-secondary); line-height: 1.6;">
                    <li><strong>First time?</strong> Configure your API key and save location in Settings</li>
                    <li><strong>API Key:</strong> Get it from <a href="https://workflowy.com/api-key" target="_blank" style="color: var(--link-color);">Workflowy API Settings</a></li>
                    <li><strong>Save Location:</strong> Open Workflowy, navigate to your desired bullet, copy the URL</li>
                </ul>
                
                <h3>Features</h3>
                <ul style="color: var(--text-secondary); line-height: 1.6;">
                    <li><strong>History:</strong> View past notes and jump to them in Workflowy</li>
                    <li><strong>Multiple Locations:</strong> Save to different Workflowy bullets</li>
                    <li><strong>Timestamp:</strong> Automatically adds YYYY-MM-DD HH:MM to your note</li>
                    <li><strong>Daily Notes:</strong> Automatically creates/reuses daily note bullets (YYYY-MM-DD format)</li>
                </ul>
                
            </div>
        </div>
    </div>

    <script>
        // Global state
        let settings = {
            apiKey: localStorage.getItem('jotflowy_apiKey') || '',
            locations: JSON.parse(localStorage.getItem('jotflowy_locations') || '[]'),
            history: JSON.parse(localStorage.getItem('jotflowy_history') || '[]'),
            dailyNoteCache: JSON.parse(localStorage.getItem('jotflowy_dailyNoteCache') || '{}')
        };

        // DOM elements
        const textArea = document.getElementById('textArea');
        const noteArea = document.getElementById('noteArea');
        const mainLocationSelect = document.getElementById('mainLocationSelect');
        const mainTimestampCheckbox = document.getElementById('mainTimestampCheckbox');
        const submitBtn = document.getElementById('submitBtn');
        
        // Settings state
        let currentLocationIndex = localStorage.getItem('jotflowy_selectedLocation') || '';
        let timestampEnabled = localStorage.getItem('jotflowy_timestampEnabled') !== 'false';
        const historyLimit = 30; // Fixed limit

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            // Load saved location preference
            currentLocationIndex = localStorage.getItem('jotflowy_selectedLocation') || '';
            timestampEnabled = localStorage.getItem('jotflowy_timestampEnabled') !== 'false';
            
            initializeDefaultLocations();
            loadSettings();
            updateMainUI();
            updateSaveLocationSelect();
            updateSubmitButtonState();
            bindEventListeners();
            
            // Show setup guide if no API key or locations
            if (!settings.apiKey || settings.locations.length === 0) {
                showSetupGuide();
            } else {
                // Auto-focus on text area when ready
                setTimeout(() => textArea.focus(), 100);
            }
        });

        function initializeDefaultLocations() {
            // No default locations - user must configure their own valid Workflowy URLs
            if (settings.locations.length === 0) {
                settings.locations = [];
                saveSettings();
            }
        }

        function loadSettings() {
            document.getElementById('apiKeyInput').value = settings.apiKey;
            updateSettingsModal();
        }
        
        function updateSettingsModal() {
            // Settings modal no longer has location/timestamp controls
            // They are now in the main UI
        }
        
        function updateMainUI() {
            // Update main location select
            mainLocationSelect.innerHTML = '<option value="">Select save location...</option>';
            settings.locations.forEach((location, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = location.name;
                if (index.toString() === currentLocationIndex) {
                    option.selected = true;
                }
                mainLocationSelect.appendChild(option);
            });
            
            // Set timestamp checkbox in main UI
            mainTimestampCheckbox.checked = timestampEnabled;
        }

        function saveSettings() {
            localStorage.setItem('jotflowy_apiKey', settings.apiKey);
            localStorage.setItem('jotflowy_locations', JSON.stringify(settings.locations));
            localStorage.setItem('jotflowy_history', JSON.stringify(settings.history));
            localStorage.setItem('jotflowy_dailyNoteCache', JSON.stringify(settings.dailyNoteCache));
        }

        function updateSaveLocationSelect() {
            // This function is no longer needed as we use settings modal
            updateSettingsModal();
        }

        function updateSubmitButtonState() {
            const hasText = textArea.value.trim().length > 0;
            const hasLocation = currentLocationIndex !== '' && settings.locations.length > 0;
            const hasApiKey = settings.apiKey.length > 0;
            
            submitBtn.disabled = !(hasText && hasLocation && hasApiKey);
        }

        function bindEventListeners() {
            // Form validation
            textArea.addEventListener('input', updateSubmitButtonState);

            // Main UI controls
            mainLocationSelect.addEventListener('change', function() {
                currentLocationIndex = mainLocationSelect.value;
                localStorage.setItem('jotflowy_selectedLocation', currentLocationIndex);
                updateSubmitButtonState();
                updateSettingsModal(); // Sync with settings modal
            });
            
            mainTimestampCheckbox.addEventListener('change', function() {
                timestampEnabled = mainTimestampCheckbox.checked;
                localStorage.setItem('jotflowy_timestampEnabled', timestampEnabled.toString());
            });

            // Submit form
            submitBtn.addEventListener('click', handleSubmit);
            
            // Keyboard shortcuts (Command+Enter on Mac, Ctrl+Enter on Windows/Linux)
            function handleKeyboardShortcut(event) {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    if (!submitBtn.disabled) {
                        handleSubmit();
                    }
                }
            }
            
            textArea.addEventListener('keydown', handleKeyboardShortcut);
            noteArea.addEventListener('keydown', handleKeyboardShortcut);

            // Mobile keyboard handling
            if (window.innerWidth <= 767) {
                setupMobileKeyboardHandling();
            }

            // Modal controls
            bindModalControls();

            // Settings
            document.getElementById('saveSettingsBtn').addEventListener('click', function() {
                settings.apiKey = document.getElementById('apiKeyInput').value.trim();
                
                saveSettings();
                updateMainUI(); // Update main UI with new settings
                updateSubmitButtonState();
                closeModal('settingsModal');
                showToast('Settings saved successfully!', 'success');
            });

            // Setup modal controls
            bindSetupControls();

            // Get API key button
            document.getElementById('getApiKeyBtn').addEventListener('click', function() {
                window.open('https://workflowy.com/api-key', '_blank');
                showToast('Copy your API key from Workflowy and paste it here', 'success');
            });

            // Locations management
            document.getElementById('addLocationBtn').addEventListener('click', addLocation);
            document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
        }

        function bindModalControls() {
            // Settings modal
            document.getElementById('settingsBtn').addEventListener('click', () => openModal('settingsModal'));
            document.getElementById('settingsClose').addEventListener('click', () => closeModal('settingsModal'));

            // Help modal
            document.getElementById('helpBtn').addEventListener('click', () => openModal('helpModal'));
            document.getElementById('helpClose').addEventListener('click', () => closeModal('helpModal'));

            // Locations modal
            document.getElementById('locationsBtn').addEventListener('click', () => {
                updateLocationsModal();
                openModal('locationsModal');
            });
            document.getElementById('locationsClose').addEventListener('click', () => closeModal('locationsModal'));

            // History modal
            document.getElementById('historyBtn').addEventListener('click', () => {
                updateHistoryModal();
                openModal('historyModal');
            });
            document.getElementById('historyClose').addEventListener('click', () => closeModal('historyModal'));

            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target.classList.contains('modal')) {
                    event.target.style.display = 'none';
                }
            });
        }

        async function handleSubmit() {
            if (submitBtn.disabled) return;

            const title = textArea.value.trim();
            const note = noteArea.value.trim();
            const locationIndex = parseInt(mainLocationSelect.value);
            const location = settings.locations[locationIndex];
            const includeTimestamp = mainTimestampCheckbox.checked;

            if (!title || !location || !settings.apiKey) {
                showToast('Please configure settings first', 'error');
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                let finalSaveLocationUrl = location.url;
                let shouldCreateDaily = location.createDaily;
                
                // Handle daily note caching
                if (location.createDaily) {
                    const cachedDailyNoteUrl = getCachedDailyNoteUrl();
                    if (cachedDailyNoteUrl) {
                        // Use cached daily note URL
                        finalSaveLocationUrl = cachedDailyNoteUrl;
                        shouldCreateDaily = false;
                        console.log('Using cached daily note URL:', cachedDailyNoteUrl);
                        showToast('Using existing daily note for today', 'success');
                    } else {
                        console.log('No cached daily note found, will create new one');
                    }
                }

                const response = await fetch('/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        note,
                        saveLocationUrl: finalSaveLocationUrl,
                        saveLocationName: location.name,
                        createDaily: shouldCreateDaily,
                        includeTimestamp,
                        apiKey: settings.apiKey,
                        dailyNoteCache: settings.dailyNoteCache,
                    }),
                });

                if (response.ok) {
                    const responseData = await response.json();
                    showToast('Note saved successfully!', 'success');
                    
                    // Handle daily note caching for newly created daily notes
                    if (location.createDaily && shouldCreateDaily && responseData.dailyNoteUrl) {
                        // Cache the daily note URL for future use
                        cacheDailyNoteUrl(responseData.dailyNoteUrl);
                        console.log('Cached new daily note URL:', responseData.dailyNoteUrl);
                    }
                    
                    // Add to history with bullet URL
                    const historyItem = {
                        id: Date.now().toString(),
                        title,
                        note,
                        location: location.name,
                        timestamp: new Date().toISOString(),
                        bulletUrl: responseData.new_bullet_url || null,
                    };
                    settings.history.unshift(historyItem);
                    if (settings.history.length > historyLimit) {
                        settings.history = settings.history.slice(0, historyLimit);
                    }
                    saveSettings();

                    // Clear form
                    textArea.value = '';
                    noteArea.value = '';
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to save note');
                }
            } catch (error) {
                console.error('Submit error:', error);
                showToast(error.message || 'Failed to save note', 'error');
                // Keep the text in the form when error occurs (text is NOT cleared)
            } finally {
                // Reset submit button
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
                updateSubmitButtonState();
            }
        }

        function addLocation() {
            const name = document.getElementById('newLocationName').value.trim();
            const url = document.getElementById('newLocationUrl').value.trim();
            const createDaily = document.getElementById('newLocationDaily').checked;

            if (!name || !url) {
                showToast('Please enter both name and URL', 'error');
                return;
            }

            if (!url.includes('workflowy.com')) {
                showToast('Please enter a valid Workflowy URL', 'error');
                return;
            }

            const newLocationIndex = settings.locations.length;
            settings.locations.push({ name, url, createDaily });
            
            // Auto-select the new location
            currentLocationIndex = newLocationIndex.toString();
            localStorage.setItem('jotflowy_selectedLocation', currentLocationIndex);
            
            saveSettings();
            updateMainUI();
            updateSaveLocationSelect();
            updateLocationsModal();
            updateSubmitButtonState();
            
            // Clear form
            document.getElementById('newLocationName').value = '';
            document.getElementById('newLocationUrl').value = '';
            document.getElementById('newLocationDaily').checked = false;

            showToast('Location added and selected!', 'success');
        }

        function removeLocation(index) {
            if (confirm('Are you sure you want to remove this location?')) {
                settings.locations.splice(index, 1);
                saveSettings();
                updateSaveLocationSelect();
                updateLocationsModal();
                showToast('Location removed', 'success');
            }
        }

        function updateLocationsModal() {
            const container = document.getElementById('locationsList');
            if (settings.locations.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No locations configured</div>';
                return;
            }

            container.innerHTML = settings.locations.map((location, index) => \`
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px; background: var(--bg-secondary);">
                    <div>
                        <div style="font-weight: 500; color: var(--text-primary);">\${location.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">\${location.url}</div>
                        \${location.createDaily ? '<div style="font-size: 11px; color: var(--success-color); font-weight: 500;"><i class="fas fa-calendar-alt"></i> Daily note enabled</div>' : ''}
                    </div>
                    <button onclick="removeLocation(\${index})" style="background: var(--error-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Remove</button>
                </div>
            \`).join('');
        }

        function updateHistoryModal() {
            const container = document.getElementById('historyList');
            if (settings.history.length === 0) {
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No history available</div>';
                return;
            }

            container.innerHTML = settings.history.map(item => \`
                <div class="history-item">
                    <div class="history-item-title">\${item.title}</div>
                    <div class="history-item-meta">
                        \${item.location} • \${new Date(item.timestamp).toLocaleString('ja-JP')}
                    </div>
                    <div style="margin-top: 8px; display: flex; gap: 8px;">
                        <button onclick="loadFromHistory('\${item.id}')" style="background: var(--accent-color); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Load</button>
                        \${item.bulletUrl ? \`<a href="\${item.bulletUrl}" target="_blank" rel="noopener" style="background: var(--success-color); color: white; border: none; padding: 4px 8px; border-radius: 4px; text-decoration: none; cursor: pointer; font-size: 12px;"><i class="fas fa-external-link-alt"></i> View</a>\` : ''}
                        <button onclick="deleteHistoryItem('\${item.id}')" style="background: var(--error-color); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;"><i class="fas fa-trash-alt"></i> Remove</button>
                    </div>
                </div>
            \`).join('');
        }

        function loadFromHistory(id) {
            const item = settings.history.find(h => h.id === id);
            if (item) {
                textArea.value = item.title;
                noteArea.value = item.note || '';
                
                // Find matching location
                const locationIndex = settings.locations.findIndex(l => l.name === item.location);
                if (locationIndex >= 0) {
                    currentLocationIndex = locationIndex.toString();
                    localStorage.setItem('jotflowy_selectedLocation', currentLocationIndex);
                }
                
                updateSubmitButtonState();
                closeModal('historyModal');
                showToast('Loaded from history', 'success');
            }
        }

        function deleteHistoryItem(id) {
            if (confirm('Remove from local history? (Workflowy post stays intact)')) {
                settings.history = settings.history.filter(item => item.id !== id);
                saveSettings();
                updateHistoryModal();
                showToast('Removed from history', 'success');
            }
        }

        function clearHistory() {
            if (confirm('Are you sure you want to clear all history?')) {
                settings.history = [];
                saveSettings();
                updateHistoryModal();
                showToast('History cleared', 'success');
            }
        }

        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function showSetupGuide() {
            if (!settings.apiKey || settings.locations.length === 0) {
                openModal('setupModal');
                updateSetupButtonState();
            }
        }

        function bindSetupControls() {
            // Setup API key button
            document.getElementById('setupGetApiKeyBtn').addEventListener('click', function() {
                window.open('https://workflowy.com/api-key', '_blank');
                showToast('Copy your API key from Workflowy and paste it here', 'success');
            });

            // Setup form validation
            const setupApiKeyInput = document.getElementById('setupApiKeyInput');
            const setupLocationNameInput = document.getElementById('setupLocationNameInput');
            const setupLocationUrlInput = document.getElementById('setupLocationUrlInput');
            
            setupApiKeyInput.addEventListener('input', updateSetupButtonState);
            setupLocationNameInput.addEventListener('input', updateSetupButtonState);
            setupLocationUrlInput.addEventListener('input', updateSetupButtonState);

            // Complete setup button
            document.getElementById('completeSetupBtn').addEventListener('click', completeSetup);
        }

        function updateSetupButtonState() {
            const apiKey = document.getElementById('setupApiKeyInput').value.trim();
            const locationName = document.getElementById('setupLocationNameInput').value.trim();
            const locationUrl = document.getElementById('setupLocationUrlInput').value.trim();
            
            const isValid = apiKey.length > 0 && 
                          locationName.length > 0 && 
                          locationUrl.length > 0 && 
                          locationUrl.includes('workflowy.com/#/');
            
            document.getElementById('completeSetupBtn').disabled = !isValid;
        }

        function completeSetup() {
            const apiKey = document.getElementById('setupApiKeyInput').value.trim();
            const locationName = document.getElementById('setupLocationNameInput').value.trim();
            const locationUrl = document.getElementById('setupLocationUrlInput').value.trim();
            const createDaily = document.getElementById('setupLocationDaily').checked;

            // Save API key
            settings.apiKey = apiKey;

            // Add initial location
            settings.locations = [{
                name: locationName,
                url: locationUrl,
                createDaily: createDaily
            }];
            
            // Auto-select the initial location
            currentLocationIndex = '0';
            localStorage.setItem('jotflowy_selectedLocation', currentLocationIndex);
            timestampEnabled = true;
            localStorage.setItem('jotflowy_timestampEnabled', 'true');

            saveSettings();
            updateMainUI();
            updateSaveLocationSelect();
            updateSubmitButtonState();

            closeModal('setupModal');
            showToast('Setup completed! You can now start using Jotflowy.', 'success');
            
            // Auto-focus on text area after setup
            setTimeout(() => textArea.focus(), 200);
        }

        function getTodayDateKey() {
            const today = new Date();
            return today.toISOString().split('T')[0]; // "2025-01-08"
        }

        function getCachedDailyNoteUrl() {
            const todayKey = getTodayDateKey();
            return settings.dailyNoteCache[todayKey] || null;
        }

        function cacheDailyNoteUrl(dailyNoteUrl) {
            const todayKey = getTodayDateKey();
            // Cache the actual daily note URL
            settings.dailyNoteCache[todayKey] = dailyNoteUrl;
            
            // Clean old cache entries (keep only 7 days)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            const cutoffKey = cutoffDate.toISOString().split('T')[0];
            
            Object.keys(settings.dailyNoteCache).forEach(dateKey => {
                if (dateKey < cutoffKey) {
                    delete settings.dailyNoteCache[dateKey];
                }
            });
            
            saveSettings();
        }


        function setupMobileKeyboardHandling() {
            // Include all input elements including those in modals
            const inputElements = [textArea, noteArea];
            
            function addKeyboardHandlingToInput(input) {
                input.addEventListener('focusin', () => {
                    document.body.classList.add('keyboard-active');
                    // Small delay to allow for keyboard animation
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
                
                input.addEventListener('focusout', () => {
                    // Delay to check if focus moved to another input
                    setTimeout(() => {
                        const focusedElement = document.activeElement;
                        const allInputs = document.querySelectorAll('input, textarea');
                        const isAnyInputFocused = Array.from(allInputs).includes(focusedElement);
                        if (!isAnyInputFocused) {
                            document.body.classList.remove('keyboard-active');
                        }
                    }, 100);
                });
            }
            
            // Add handling to main form inputs
            inputElements.forEach(addKeyboardHandlingToInput);
            
            // Add handling to all existing modal inputs
            const allInputs = document.querySelectorAll('input, textarea');
            allInputs.forEach(addKeyboardHandlingToInput);

            // Handle viewport changes for iOS Safari
            let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', () => {
                    const currentHeight = window.visualViewport.height;
                    const heightDifference = initialViewportHeight - currentHeight;
                    
                    if (heightDifference > 150) { // Keyboard likely shown
                        document.body.classList.add('keyboard-active');
                    } else {
                        document.body.classList.remove('keyboard-active');
                    }
                });
            }
        }

        function togglePasswordVisibility(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = \`toast \${type}\`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
        
        // showSuccessLink function removed - using history links only
    </script>
</body>
</html>
`;