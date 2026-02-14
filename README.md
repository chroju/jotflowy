# Jotflowy

<img src="public/icon-192.png" alt="Jotflowy" width="64" />

A modern, streamlined note-taking app for Workflowy using the official API. Quickly capture ideas, thoughts, and notes directly to your Workflowy workspace from any browser.

> [!CAUTION]
> Your Workflowy API key and data pass through the backend worker. **Please self-host your own instance** to keep them secure.

## Features

- **Official Workflowy API Integration** - Uses the stable, official API
- **Multiple Destinations** - Configure multiple save locations with custom names
- **Daily Note Support** - Automatically organize notes under daily date headers
- **Template System** - Customize note format with date/time placeholders
- **Smart URL Expansion** - Automatically converts URLs to Markdown links with page titles on send
- **PWA Support** - Install as a standalone app, works offline, supports Web Share Target
- **Post History** - View recent posts grouped by date with links to Workflowy
- **Mobile Optimized** - Responsive design with virtual keyboard support
- **Secure Cookie-based Auth** - API key stored securely in HTTP-only cookies

## Quick Start

### 1. Get Your Workflowy API Key
1. Visit [Workflowy API Key page](https://workflowy.com/api-key)
2. Copy your API key

### 2. Deploy to Cloudflare Workers
```bash
# Clone the repository
git clone https://github.com/chroju/jotflowy.git
cd jotflowy

# Install dependencies
npm install

# Deploy to Cloudflare Workers
npm run deploy
```

### 3. Configure Your API Key
1. Open your deployed Jotflowy app
2. Click the Settings icon
3. Paste your API key and click Save

### 4. Set Up Destinations
1. In Settings, click "+ Add destination"
2. Navigate to your desired Workflowy location
3. Enter a display name
4. Optionally enable Daily Note and customize the template
5. Click Save

## Usage

1. **Write your note** in the main editor
   - First paragraph becomes the note title
   - Empty line separates title from note body
2. **Select destination** from the dropdown in the toolbar
3. **Click Send** - Your note is saved to Workflowy

### Template System

Customize how notes are formatted with placeholders:

- `{content}` - Your input text
- `{YYYY}` - Year (e.g., 2026)
- `{MM}` - Month (01-12)
- `{DD}` - Day (01-31)
- `{HH}` - Hour (00-23)
- `{mm}` - Minute (00-59)
- `{ss}` - Second (00-59)

**Example:** `**{HH}:{mm}** {content}` → `**14:30** Your note text`

### Smart URL Expansion

When you send a note containing URLs, Jotflowy automatically:

- Detects plain URLs in your text
- Fetches page titles from the target websites
- Converts to Markdown format: `[Page Title](https://example.com)`
- Preserves URLs already in Markdown link format

### Daily Note

When Daily Note is enabled for a destination:

- Notes are automatically organized under a daily header (YYYY-MM-DD format)
- Multiple notes on the same day go under the same header
- Compatible with [Workflowy Calendar](https://workflowy.com/learn/calendar/) - daily notes appear in your calendar view
- Great for journaling, daily logs, or time-based organization

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

## Architecture

- **Frontend**: Hono JSX with vanilla JavaScript client
- **Backend**: Cloudflare Workers (serverless)
- **Storage**: Browser localStorage for settings, HTTP-only cookies for API key
- **API**: Official Workflowy REST API

## Privacy & Security

- **No Data Collection**: All settings stay in your browser
- **Secure API Key Storage**: Stored in HTTP-only cookies, not accessible to JavaScript
- **Open Source**: Full transparency of all code

## Requirements

- Modern web browser with localStorage support
- Workflowy account with API access
- Cloudflare Workers account (free tier available)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Support

- **Issues**: [GitHub Issues](https://github.com/chroju/jotflowy/issues)
- **Workflowy API**: [Official Documentation](https://workflowy.com/api-key)
- **Cloudflare Workers**: [Documentation](https://developers.cloudflare.com/workers/)
