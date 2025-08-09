# Jotflowy

A modern, streamlined note-taking app for Workflowy using the official API. Quickly capture ideas, thoughts, and notes directly to your Workflowy workspace from any browser.

## Features

- **Official Workflowy API Integration** - Uses the stable, official API instead of reverse-engineered endpoints
- **Dual Text Areas** - Separate title and note fields for better organization
- **Global Daily Note Toggle** - Create daily notes from any location when enabled
- **Smart URL Title Extraction** - Automatically converts URLs to Markdown links with page titles
- **Daily Note Caching System** - Intelligent caching prevents duplicate daily notes
- **Timestamp Options** - Optional automatic timestamp insertion (YYYY-MM-DD HH:mm format)
- **Post History** - View and reuse recent posts with daily note indicators (stored locally)
- **Input Security Features** - Safe localStorage handling with automatic recovery
- **One-Click API Setup** - Direct link to Workflowy's API key page
- **Mobile Optimized** - Responsive design for all devices
- **No Server Storage** - All settings stored locally in your browser

## Quick Start

### 1. Get Your Workflowy API Key
1. Visit [Workflowy API Key page](https://workflowy.com/api-key)
2. Copy your API key

### 2. Deploy to Cloudflare Workers
```bash
# Clone the repository
git clone https://github.com/your-username/jotflowy.git
cd jotflowy

# Install dependencies
npm install

# Deploy to Cloudflare Workers
npm run deploy
```

### 3. Configure Your API Key
1. Open your deployed Jotflowy app
2. Click "Set Auth token"
3. Paste your API key and save

### 4. Set Up Save Locations
Configure your preferred Workflowy locations:
- **Today's Note**: Automatically creates daily notes in your journal
- **Quick Inbox**: Direct posting to your inbox
- **Custom locations**: Add any Workflowy URL

## Usage

1. **Title Field**: Enter the main content or title of your note
2. **Note Field** (optional): Add detailed information or context
3. **Settings**: Configure options in Settings modal:
   - **Timestamp**: Add current date/time to notes (YYYY-MM-DD HH:MM)
   - **Daily Note**: Save to today's daily note instead of selected location
   - **URL Expansion**: Convert URLs to Markdown links with page titles
4. **Save Location**: Choose where to save your note
5. **Submit**: Your note is instantly saved to Workflowy

## Advanced Features

### Smart URL Title Extraction

When URL expansion is enabled in Settings, Jotflowy automatically:

- **Detects URLs** in the title field when posting
- **Fetches page titles** from the target website
- **Converts to Markdown format**: `[Page Title](https://example.com)`
- **Preserves original URLs** if title extraction fails
- **Skips social media** like x.com to avoid rate limiting

**Example:**
```
Input:  https://github.com/workflowy/api
Output: [Workflowy API](https://github.com/workflowy/api)
```

### Daily Note Caching System

Jotflowy includes intelligent daily note management:

- **Automatic Detection** - Recognizes when daily notes already exist for today
- **Smart Caching** - Stores daily note URLs to prevent duplicates
- **Cross-Location Support** - Works with the global daily note toggle
- **Cache Cleanup** - Automatically removes old cache entries (7+ days)
- **Timezone Aware** - Uses your browser's local timezone for date calculation

**How it works:**
1. First daily note of the day creates a new `YYYY-MM-DD` titled bullet
2. Subsequent daily notes reuse the cached URL for the same day
3. Cache persists across browser sessions but cleans up automatically

### Input Security Features

Jotflowy includes comprehensive safety measures:

- **Safe localStorage Access** - Gracefully handles storage failures, corruption, and quota limits
- **JSON Parsing Safety** - Recovers from malformed JSON data automatically  
- **Settings Validation** - Validates and repairs corrupted configuration data
- **Error Recovery** - Continues functioning even when localStorage is unavailable
- **Data Integrity** - Prevents data loss from browser storage limitations

**Automatic Recovery:**
- Invalid location data is filtered out
- Corrupted settings revert to safe defaults
- History data is preserved even if some entries are damaged
- Users are notified when automatic repairs occur

## Configuration

### Settings Modal

Access all configuration through the Settings button:

**API Configuration:**
- **API Key**: Your Workflowy API key (stored securely in browser)
- Direct link to get API key from Workflowy

**Feature Toggles:**
- **URL Expansion**: Convert URLs to `[Title](URL)` Markdown format
- **Timestamp**: Add `YYYY-MM-DD HH:MM` timestamp to notes (uses local timezone)  
- **Daily Note**: Global toggle to save all notes to today's daily note

**Management:**
- **History**: View past notes with daily note indicators
- **Locations**: Manage save locations

### Save Locations

Configure your Workflowy save destinations:
- **Location name**: Displayed in the main dropdown
- **Workflowy URL**: Direct link to specific location (e.g., `https://workflowy.com/#/abc123`)
- Locations can be any valid Workflowy URL

**Tips:**
- Use specific URLs for better organization
- Daily note creation is now handled by the global toggle
- URLs are validated to ensure they point to workflowy.com

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Deploy to Cloudflare Workers
npm run deploy
```

### Testing

This project includes unit tests for critical functions:

- **Storage utilities**: localStorage error handling, JSON parsing safety
- **Settings validation**: Data corruption recovery and validation
- **Workflowy utilities**: Date handling, cache management, timestamp formatting

Tests use [Vitest](https://vitest.dev/) with jsdom environment for browser APIs.

## Architecture

- **Frontend**: Single-page application with vanilla JavaScript
- **Backend**: Cloudflare Workers (serverless)
- **Storage**: Browser LocalStorage (no server-side storage)
- **API**: Official Workflowy REST API

## Privacy & Security

- **No Data Collection**: All data stays in your browser
- **API Key Security**: Stored locally, never transmitted to our servers
- **Direct Communication**: Your browser talks directly to Workflowy's API
- **Open Source**: Full transparency of all code

## Requirements

- Modern web browser with LocalStorage support
- Workflowy account with API access
- Cloudflare Workers account (free tier available)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/jotflowy/issues)
- **Workflowy API**: [Official Documentation](https://workflowy.com/api-key)
- **Cloudflare Workers**: [Documentation](https://developers.cloudflare.com/workers/)