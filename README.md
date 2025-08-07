# Jotflowy

A modern, streamlined note-taking app for Workflowy using the official API. Quickly capture ideas, thoughts, and notes directly to your Workflowy workspace from any browser.

## Features

- **Official Workflowy API Integration** - Uses the stable, official API instead of reverse-engineered endpoints
- **Dual Text Areas** - Separate title and note fields for better organization
- **Smart Save Locations** - Predefined locations including automatic daily note creation
- **Timestamp Options** - Optional automatic timestamp insertion (YYYY-MM-DD HH:mm format)
- **Post History** - View and reuse recent posts (stored locally)
- **URL Title Extraction** - Automatically fetch page titles when pasting URLs
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
3. **Timestamp Option**: Check to automatically add current date/time to notes
4. **Save Location**: Choose where to save your note
5. **Submit**: Your note is instantly saved to Workflowy

## Configuration

### Save Locations
Save locations are stored in your browser's local storage. You can configure:
- Location name (displayed in dropdown)
- Workflowy URL (where notes will be saved)
- Daily note creation (for journal-style locations)

### API Settings
- **API Key**: Your Workflowy API key (stored securely in browser)
- **Default Location**: Your preferred save location
- **Timestamp Format**: YYYY-MM-DD HH:mm (local timezone)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

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