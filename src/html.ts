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

        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .radio-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-secondary);
        }

        input[type="radio"] {
            width: 16px;
            height: 16px;
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

        /* Password input specific styling removed to prevent letter-spacing inconsistency */
        
        .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .password-input-wrapper input {
            padding-right: 45px !important; /* Space for eye icon */
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
            font-size: 16px;
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
                    Welcome! Jotflowy offers smart URL title extraction, intelligent daily note caching, and secure localStorage handling. Let's set up your API key and first save location to get started.
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
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fas fa-lightbulb"></i> Tip: Open Workflowy, navigate to where you want to save notes, and copy the URL from your browser. You can now use the global Daily Note toggle for flexible daily note creation.
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
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <button id="getApiKeyBtn" class="btn btn-link">
                            <i class="fas fa-key"></i> Get API Key from Workflowy
                        </button>
                        <button id="clearApiKeyBtn" class="btn btn-link" style="color: var(--danger-color);">
                            <i class="fas fa-trash"></i> Clear API Key
                        </button>
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">Security Settings</label>
                    <select id="expirationSelect" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);">
                        <option value="1hour">1 hour (high security)</option>
                        <option value="30days" selected>30 days (recommended)</option>
                        <option value="never">Never expire (stay signed in)</option>
                    </select>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fas fa-info-circle"></i> How long to keep you signed in. Shorter periods are more secure. You can always clear API key manually.
                    </div>
                    <div id="sessionStatus" style="font-size: 12px; color: var(--text-muted); margin-top: 8px; display: none;">
                        <i class="fas fa-clock"></i> Current session expires: <span id="sessionExpiry"></span>
                    </div>
                </div>
                
                <div class="input-group">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="urlExpansionCheckbox" checked>
                        <label for="urlExpansionCheckbox">Expand URLs to Markdown links</label>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fas fa-info-circle"></i> Automatically fetches page titles and converts URLs to Markdown format: "[Page Title](URL)". Skips social media to avoid rate limits.
                    </div>
                </div>
                
                <div class="input-group">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="timestampCheckbox" checked>
                        <label for="timestampCheckbox">Add timestamp to note (YYYY-MM-DD HH:MM)</label>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fas fa-info-circle"></i> Adds current date and time to your notes using your local timezone. Helps track when ideas were captured.
                    </div>
                </div>
                
                <div class="input-group">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="dailyNoteCheckbox">
                        <label for="dailyNoteCheckbox">Save to daily note (create if needed)</label>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        <i class="fas fa-info-circle"></i> Creates a daily note bullet with today's date (YYYY-MM-DD) under the selected location. Reuses existing daily notes for the same day to prevent duplicates.
                    </div>
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
                    <li><strong>Smart Daily Notes:</strong> Intelligent caching system creates/reuses daily note bullets with local timezone support</li>
                </ul>
                
            </div>
        </div>
    </div>

    <script>
        // Safe localStorage utilities
        function safeGetItem(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item !== null ? item : defaultValue;
            } catch (error) {
                console.warn('Failed to read from localStorage (key: ' + key + '):', error);
                return defaultValue;
            }
        }

        function safeParseJSON(jsonString, defaultValue = null) {
            if (!jsonString) return defaultValue;
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                console.warn('Failed to parse JSON:', error);
                return defaultValue;
            }
        }

        function safeSetItem(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (error) {
                console.error('Failed to write to localStorage (key: ' + key + '):', error);
                if (error.name === 'QuotaExceededError') {
                    showToast('Storage quota exceeded. Please clear browser data.', 'error');
                } else {
                    showToast('Failed to save settings. Check browser storage permissions.', 'error');
                }
                return false;
            }
        }

        // Initialize settings with safe defaults
        let settings = {
            apiKey: '', // Now handled by cookies, not localStorage
            locations: safeParseJSON(safeGetItem('jotflowy_locations'), []),
            history: safeParseJSON(safeGetItem('jotflowy_history'), []),
            dailyNoteCache: safeParseJSON(safeGetItem('jotflowy_dailyNoteCache'), {}),
            globalDailyNote: safeParseJSON(safeGetItem('jotflowy_globalDailyNote'), false)
        };

        // Settings validation and recovery
        function validateAndRecoverSettings() {
            let settingsChanged = false;
            
            // Validate locations array
            if (!Array.isArray(settings.locations)) {
                console.warn('Invalid locations array detected, resetting to empty array');
                settings.locations = [];
                settingsChanged = true;
            } else {
                // Validate each location object
                const originalLength = settings.locations.length;
                settings.locations = settings.locations.filter(location => {
                    return location && 
                           typeof location.name === 'string' && 
                           typeof location.url === 'string' &&
                           location.url.includes('workflowy.com');
                });
                if (settings.locations.length !== originalLength) {
                    settingsChanged = true;
                }
            }
            
            // Validate history array
            if (!Array.isArray(settings.history)) {
                console.warn('Invalid history array detected, resetting to empty array');
                settings.history = [];
                settingsChanged = true;
            }
            
            // Validate daily note cache
            if (typeof settings.dailyNoteCache !== 'object' || settings.dailyNoteCache === null) {
                console.warn('Invalid daily note cache detected, resetting to empty object');
                settings.dailyNoteCache = {};
                settingsChanged = true;
            }
            
            // Validate API key
            if (typeof settings.apiKey !== 'string') {
                console.warn('Invalid API key detected, resetting to empty string');
                settings.apiKey = '';
                settingsChanged = true;
            }
            
            if (settingsChanged) {
                console.log('Settings were corrupted and have been automatically repaired');
                saveSettings();
                // Use setTimeout to avoid showing toast during initial load
                setTimeout(() => {
                    showToast('Settings were automatically repaired due to corruption', 'success');
                }, 1000);
            }
        }

        // DOM elements
        const textArea = document.getElementById('textArea');
        const noteArea = document.getElementById('noteArea');
        const mainLocationSelect = document.getElementById('mainLocationSelect');
        const submitBtn = document.getElementById('submitBtn');
        
        // Settings state with safe localStorage access
        let currentLocationIndex = safeGetItem('jotflowy_selectedLocation', '');
        let timestampEnabled = safeGetItem('jotflowy_timestampEnabled', 'true') !== 'false';
        let urlExpansionEnabled = safeGetItem('jotflowy_urlExpansionEnabled', 'true') !== 'false';
        const historyLimit = 30; // Fixed limit

        // Initialize app
        document.addEventListener('DOMContentLoaded', async function() {
            // Validate and recover settings before doing anything else
            validateAndRecoverSettings();
            
            // Load saved location preference
            currentLocationIndex = safeGetItem('jotflowy_selectedLocation', '');
            timestampEnabled = safeGetItem('jotflowy_timestampEnabled', 'true') !== 'false';
            urlExpansionEnabled = safeGetItem('jotflowy_urlExpansionEnabled', 'true') !== 'false';
            
            initializeDefaultLocations();
            loadSettings();
            
            // Check authentication status
            const isAuthenticated = await checkAuthentication();
            if (isAuthenticated) {
                // Keep API key status for UI, but don't store the actual key
                settings.apiKey = 'authenticated';
            }
            updateMainUI();
            updateAuthenticationUI(isAuthenticated);
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
            // Don't load API key from localStorage - it's now handled by cookies
            document.getElementById('apiKeyInput').value = '';
            document.getElementById('urlExpansionCheckbox').checked = urlExpansionEnabled;
            document.getElementById('timestampCheckbox').checked = timestampEnabled;
            // Load global daily note setting
            if (settings.globalDailyNote !== undefined) {
                document.getElementById('dailyNoteCheckbox').checked = settings.globalDailyNote;
            }
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
        }

        // Authentication functions
        async function authenticateUser(apiKey, expiration = '30days', customDays = null) {
            try {
                const requestBody = {
                    apiKey,
                    expiration
                };
                
                // Only add customDays if it's not null
                if (customDays !== null) {
                    requestBody.customDays = customDays;
                }
                
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return { success: true, expiresAt: data.expiresAt };
                } else {
                    const errorData = await response.json();
                    return { success: false, error: errorData.error || 'Authentication failed' };
                }
            } catch (error) {
                console.error('Authentication error:', error);
                return { success: false, error: 'Network error: ' + error.message };
            }
        }

        async function checkAuthentication() {
            try {
                const response = await fetch('/api/auth/check');
                const data = await response.json();
                return data.authenticated;
            } catch (error) {
                console.error('Auth check error:', error);
                return false;
            }
        }

        async function logout() {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                });
                
                if (response.ok) {
                    // Clear local API key from settings
                    settings.apiKey = '';
                    updateAuthenticationUI(false);
                    showToast('Logged out successfully', 'success');
                    return true;
                } else {
                    showToast('Logout failed', 'error');
                    return false;
                }
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed', 'error');
                return false;
            }
        }

        function updateAuthenticationUI(isAuthenticated) {
            const sessionStatus = document.getElementById('sessionStatus');
            const apiKeyInput = document.getElementById('apiKeyInput');
            const passwordToggle = apiKeyInput.parentElement.querySelector('.password-toggle');
            
            if (isAuthenticated) {
                // Show that user is authenticated
                apiKeyInput.placeholder = '✓ Currently authenticated';
                // Hide eye icon when authenticated (it has no function)
                if (passwordToggle) {
                    passwordToggle.style.display = 'none';
                }
            } else {
                sessionStatus.style.display = 'none';
                apiKeyInput.placeholder = 'Enter your Workflowy API key';
                // Show eye icon when not authenticated (for password toggle)
                if (passwordToggle) {
                    passwordToggle.style.display = 'block';
                }
            }
        }

        function saveSettings() {
            // Note: API key is now handled by authentication, not localStorage
            const success = [
                safeSetItem('jotflowy_locations', JSON.stringify(settings.locations)),
                safeSetItem('jotflowy_history', JSON.stringify(settings.history)),
                safeSetItem('jotflowy_dailyNoteCache', JSON.stringify(settings.dailyNoteCache)),
                safeSetItem('jotflowy_globalDailyNote', JSON.stringify(settings.globalDailyNote || false))
            ].every(Boolean);
            
            if (!success) {
                console.error('Failed to save some settings to localStorage');
            }
            
            return success;
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
                safeSetItem('jotflowy_selectedLocation', currentLocationIndex);
                updateSubmitButtonState();
                updateSettingsModal(); // Sync with settings modal
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

            // Auto-save settings for each input
            document.getElementById('urlExpansionCheckbox').addEventListener('change', function() {
                urlExpansionEnabled = this.checked;
                safeSetItem('jotflowy_urlExpansionEnabled', urlExpansionEnabled.toString());
                updateMainUI();
                showToast('URL expansion setting saved', 'success');
            });
            
            document.getElementById('timestampCheckbox').addEventListener('change', function() {
                timestampEnabled = this.checked;
                safeSetItem('jotflowy_timestampEnabled', timestampEnabled.toString());
                updateMainUI();
                showToast('Timestamp setting saved', 'success');
            });
            
            document.getElementById('dailyNoteCheckbox').addEventListener('change', function() {
                settings.globalDailyNote = this.checked;
                saveSettings();
                updateMainUI();
                showToast('Daily note setting saved', 'success');
            });

            // API key authentication (manual save when user enters/changes API key)
            document.getElementById('apiKeyInput').addEventListener('blur', async function() {
                const apiKey = this.value.trim();
                if (apiKey && apiKey !== settings.apiKey) {
                    const selectedExpiration = document.getElementById('expirationSelect').value;
                    const authResult = await authenticateUser(apiKey, selectedExpiration, null);
                    if (authResult.success) {
                        settings.apiKey = apiKey;
                        updateAuthenticationUI(true);
                        updateMainUI();
                        updateSubmitButtonState();
                        showToast('API key authenticated successfully!', 'success');
                        
                        if (authResult.expiresAt) {
                            const expiryDate = new Date(authResult.expiresAt);
                            document.getElementById('sessionExpiry').textContent = 
                                expiryDate.toLocaleString();
                            document.getElementById('sessionStatus').style.display = 'block';
                        }
                    } else {
                        showToast('Authentication failed: ' + authResult.error, 'error');
                        updateAuthenticationUI(false);
                    }
                }
            });

            // Security settings change
            document.getElementById('expirationSelect').addEventListener('change', function() {
                showToast('Security setting saved', 'success');
            });


            // Setup modal controls
            bindSetupControls();

            // Get API key button
            document.getElementById('getApiKeyBtn').addEventListener('click', function() {
                window.open('https://workflowy.com/api-key', '_blank');
                showToast('Copy your API key from Workflowy and paste it here', 'success');
            });

            // Clear API key button
            document.getElementById('clearApiKeyBtn').addEventListener('click', async function() {
                if (confirm('Are you sure you want to clear your API key? You will need to re-authenticate.')) {
                    try {
                        // Call logout API to clear the cookie
                        await fetch('/api/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        
                        // Clear local API key state
                        settings.apiKey = '';
                        document.getElementById('apiKeyInput').value = '';
                        
                        // Update UI to unauthenticated state
                        updateAuthenticationUI(false);
                        updateMainUI();
                        
                        showToast('API key cleared successfully', 'success');
                    } catch (error) {
                        console.error('Error clearing API key:', error);
                        showToast('Failed to clear API key', 'error');
                    }
                }
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
            const includeTimestamp = timestampEnabled;
            

            if (!title || !location || !settings.apiKey) {
                showToast('Please configure settings first', 'error');
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                let finalSaveLocationUrl = location.url;
                let shouldCreateDaily = settings.globalDailyNote;
                // Keep original value for history recording
                const originalDailyNote = shouldCreateDaily;
                
                
                // Handle daily note caching
                if (shouldCreateDaily) {
                    const cachedDailyNoteUrl = getCachedDailyNoteUrl();
                    if (cachedDailyNoteUrl) {
                        // Use cached daily note URL
                        finalSaveLocationUrl = cachedDailyNoteUrl;
                        shouldCreateDaily = false; // Don't create new daily note
                        console.log('Using cached daily note for today');
                        showToast('Using existing daily note for today', 'success');
                    } else {
                        console.log('No cached daily note found, will create new one');
                    }
                }

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
                        expandUrls: urlExpansionEnabled,
                        dailyNoteCache: settings.dailyNoteCache,
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const responseData = await response.json();
                    showToast('Note saved successfully!', 'success');
                    
                    // Handle daily note caching for newly created daily notes
                    if (shouldCreateDaily && responseData.dailyNoteUrl) {
                        // Cache the daily note URL for future use
                        cacheDailyNoteUrl(responseData.dailyNoteUrl);
                        console.log('Cached new daily note URL for today');
                    }
                    
                    // Add to history with bullet URL
                    const historyItem = {
                        id: Date.now().toString(),
                        title,
                        note,
                        location: location.name,
                        timestamp: new Date().toISOString(),
                        bulletUrl: responseData.new_bullet_url || null,
                        isDailyNote: originalDailyNote,
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
                    
                    // Provide specific error messages based on status code and content
                    let errorMessage = 'Failed to save note';
                    if (response.status === 400) {
                        errorMessage = 'Invalid request data. Please check your input.';
                    } else if (response.status === 401) {
                        errorMessage = 'Please check your API key in Settings';
                    } else if (response.status === 403) {
                        errorMessage = 'Access denied. Please check your API key permissions';
                    } else if (response.status === 404) {
                        errorMessage = 'Save location not found. Please check the Workflowy URL';
                    } else if (response.status === 422) {
                        // WorkflowyAPIError from server
                        if (errorData.error) {
                            if (errorData.error.includes('401') || errorData.error.includes('Unauthorized')) {
                                errorMessage = 'Please check your API key in Settings';
                            } else if (errorData.error.includes('403') || errorData.error.includes('Forbidden')) {
                                errorMessage = 'Access denied. Please check your API key permissions';
                            } else if (errorData.error.includes('404') || errorData.error.includes('Not Found')) {
                                errorMessage = 'Save location not found. Please check the Workflowy URL';
                            } else if (errorData.error.includes('429') || errorData.error.includes('rate limit')) {
                                errorMessage = 'Workflowy API limit reached. Try again in a few minutes';
                            } else {
                                errorMessage = errorData.error;
                            }
                        }
                    } else if (response.status === 429) {
                        errorMessage = 'Workflowy API limit reached. Try again in a few minutes';
                    } else if (response.status >= 500) {
                        errorMessage = 'Workflowy server error. Please try again later';
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                    
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error('Submit error:', error);
                
                // Provide specific error messages for different error types
                let errorMessage = 'Failed to save note';
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'Connection failed. Check internet and try again';
                } else if (error.name === 'AbortError') {
                    errorMessage = 'Request timed out. Please try again';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showToast(errorMessage, 'error');
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

            if (!name || !url) {
                showToast('Please enter both name and URL', 'error');
                return;
            }

            if (!url.includes('workflowy.com')) {
                showToast('Please enter a valid Workflowy URL', 'error');
                return;
            }

            const newLocationIndex = settings.locations.length;
            settings.locations.push({ name, url, createDaily: false });
            
            // Auto-select the new location
            currentLocationIndex = newLocationIndex.toString();
            safeSetItem('jotflowy_selectedLocation', currentLocationIndex);
            
            saveSettings();
            updateMainUI();
            updateSaveLocationSelect();
            updateLocationsModal();
            updateSubmitButtonState();
            
            // Clear form
            document.getElementById('newLocationName').value = '';
            document.getElementById('newLocationUrl').value = '';

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
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">\${location.name}</div>
                        <a href="\${location.url}" target="_blank" rel="noopener noreferrer" 
                           style="font-size: 12px; color: var(--link-color); text-decoration: none; word-break: break-all; display: inline-flex; align-items: center; gap: 4px;" 
                           title="Open \${location.name} in Workflowy"
                           onmouseover="this.style.textDecoration='underline'" 
                           onmouseout="this.style.textDecoration='none'">
                            \${location.url}
                            <i class="fas fa-external-link-alt" style="font-size: 10px; opacity: 0.7;"></i>
                        </a>
                    </div>
                    <button onclick="removeLocation(\${index})" style="background: var(--error-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-left: 8px; flex-shrink: 0;">Remove</button>
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
                        \${item.isDailyNote ? ' • <span style="color: var(--success-color); font-weight: 500;"><i class="fas fa-calendar-alt"></i> Daily note</span>' : ''}
                    </div>
                    <div style="margin-top: 8px; display: flex; gap: 12px;">
                        \${item.bulletUrl ? \`<a href="\${item.bulletUrl}" target="_blank" rel="noopener" style="background: none; color: #d8dee9; border: none; padding: 4px 0; text-decoration: none; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'"><i class="fas fa-external-link-alt"></i> View</a>\` : ''}
                        <button onclick="deleteHistoryItem('\${item.id}')" style="background: none; color: #d08770; border: none; padding: 4px 0; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            \`).join('');
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

        async function completeSetup() {
            const apiKey = document.getElementById('setupApiKeyInput').value.trim();
            const locationName = document.getElementById('setupLocationNameInput').value.trim();
            const locationUrl = document.getElementById('setupLocationUrlInput').value.trim();
            

            // Authenticate API key first
            const authResult = await authenticateUser(apiKey, '30days', null); // Default to 30 days
            if (!authResult.success) {
                showToast('Authentication failed: ' + authResult.error, 'error');
                return;
            }

            // Save API key status for UI
            settings.apiKey = apiKey;

            // Add initial location
            settings.locations = [{
                name: locationName,
                url: locationUrl,
                createDaily: false  // No longer used, always false
            }];
            
            // Auto-select the initial location
            currentLocationIndex = '0';
            safeSetItem('jotflowy_selectedLocation', currentLocationIndex);
            timestampEnabled = true;
            safeSetItem('jotflowy_timestampEnabled', 'true');
            urlExpansionEnabled = true;
            safeSetItem('jotflowy_urlExpansionEnabled', 'true');

            saveSettings();
            updateMainUI();
            updateSaveLocationSelect();
            updateSubmitButtonState();
            updateAuthenticationUI(true); // Mark as authenticated

            closeModal('setupModal');
            showToast('Setup completed! You can now start using Jotflowy.', 'success');
            
            // Auto-focus on text area after setup
            setTimeout(() => textArea.focus(), 200);
        }

        function getTodayDateKey() {
            const today = new Date();
            // Use local date instead of UTC to avoid timezone issues
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
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