# Hookiro Usage Guide

## Installation

### Via npm (Recommended)
```bash
npm install -g hookiro
```

### Via Homebrew
```bash
brew install hookiro
```

### Via Download Script
```bash
curl -L hookiro.io/install.sh | sh
```

### Via Direct Binary Download
Download the latest binary for your platform from [GitHub Releases](https://github.com/hookiro/hookiro/releases)

---

## Quick Start

### Basic Usage
```bash
# Start Hookiro with defaults
hookiro start

# Output:
# ✓ Hookiro running on http://localhost:3420
# ✓ Public URL: https://abc123.ngrok.io/webhook
# ✓ Browser opened at http://localhost:3420
# 
# Ready to receive webhooks!
# Press Ctrl+C to stop
```

That's it! You now have:
- A local webhook receiver at `http://localhost:3420`
- A public webhook URL at `https://abc123.ngrok.io/webhook`
- A web dashboard to view incoming webhooks

---

## CLI Commands

### Start Server
```bash
hookiro start [options]
```

Start the webhook receiver and web interface.

**Options:**
- `--port, -p <port>` - Port for web interface (default: 3420)
- `--no-tunnel` - Disable ngrok tunnel
- `--no-browser` - Don't auto-open browser
- `--auth <user:pass>` - Enable basic authentication
- `--storage <path>` - Custom storage directory
- `--endpoints <names>` - Comma-separated custom endpoint names
- `--ngrok-token <token>` - ngrok authtoken
- `--retention <days>` - Auto-delete webhooks after N days
- `--cors` - Enable CORS for all origins
- `--quiet, -q` - Minimal output
- `--verbose, -v` - Detailed logging
- `--config <path>` - Path to custom config file
- `--no-config` - Ignore config files, use defaults only

### List Webhooks
```bash
hookiro list [options]
```

List all captured webhooks in the terminal.

**Options:**
- `--limit, -l <number>` - Number of webhooks to show (default: 10)
- `--endpoint <name>` - Filter by endpoint
- `--json` - Output as JSON

### Clear Webhooks
```bash
hookiro clear [options]
```

Delete stored webhooks.

**Options:**
- `--all, -a` - Clear all webhooks (default)
- `--endpoint <name>` - Clear webhooks from specific endpoint
- `--older-than <days>` - Clear webhooks older than N days
- `--yes, -y` - Skip confirmation

### Configuration Management
```bash
# View all configuration
hookiro config list

# Get specific value
hookiro config get <key>

# Set configuration value
hookiro config set <key> <value>

# Reset to defaults
hookiro config reset

# Reset specific key
hookiro config reset <key>

# Validate config file
hookiro config validate

# Show config file locations
hookiro config path
```

### Other Commands
```bash
# Show version
hookiro version

# Show help
hookiro help

# Show help for specific command
hookiro help start
```

---

## Usage Examples

### Example 1: Testing Stripe Webhooks
```bash
# Start with custom endpoint
hookiro start --endpoints stripe

# Copy the URL (e.g., https://abc123.ngrok.io/webhook/stripe)
# Paste into Stripe Dashboard → Webhooks → Add endpoint
# Trigger test events in Stripe
# View payloads in your browser at http://localhost:3420
```

### Example 2: Multiple Services
```bash
# Create separate endpoints for different services
hookiro start --endpoints github,stripe,sendgrid,twilio

# You'll get:
# - https://abc123.ngrok.io/webhook/github
# - https://abc123.ngrok.io/webhook/stripe
# - https://abc123.ngrok.io/webhook/sendgrid
# - https://abc123.ngrok.io/webhook/twilio
```

### Example 3: Secure Testing with Auth
```bash
# Enable basic authentication
hookiro start --auth myuser:mypassword

# Webhook URL will require authentication:
# https://myuser:mypassword@abc123.ngrok.io/webhook
```

### Example 4: Corporate Network (No ngrok)
```bash
# Run without ngrok tunnel
hookiro start --no-tunnel --port 8080

# Use your own reverse proxy (nginx, cloudflared, etc.)
# Point it to http://localhost:8080
```

### Example 5: Project-Specific Storage
```bash
# Store webhooks in project directory
hookiro start --storage ./test-webhooks

# Perfect for sharing test data with team
# Add ./test-webhooks/ to .gitignore
```

### Example 6: Auto-Cleanup Old Webhooks
```bash
# Automatically delete webhooks older than 3 days
hookiro start --retention 3

# Or set it globally
hookiro config set storage.retentionDays 3
hookiro config set storage.autoCleanup true
hookiro start
```

### Example 7: Custom Port & Theme
```bash
# Set preferences globally
hookiro config set server.port 8080
hookiro config set ui.theme dark
hookiro config set server.autoBrowser false

# Now all future starts use these settings
hookiro start
```

### Example 8: Debugging with Verbose Logging
```bash
# See detailed logs
hookiro start --verbose

# Or minimal output
hookiro start --quiet
```

---

## Configuration

### Configuration Files

Hookiro supports multiple configuration files with priority order:

1. **CLI flags** (highest priority)
2. **Environment variables** (`Hookiro_*`)
3. **Project config** (`.hookiro.json` in current directory)
4. **Global config** (`~/.hookiro/config.json`)
5. **Default values** (lowest priority)

### Global Configuration

Set your personal defaults:
```bash
# Location: ~/.hookiro/config.json
hookiro config set server.port 8080
hookiro config set ui.theme dark
hookiro config set tunnel.authToken YOUR_NGROK_TOKEN
hookiro config set storage.retentionDays 7
```

Or edit `~/.hookiro/config.json` directly:
```json
{
  "server": {
    "port": 8080,
    "autoBrowser": false
  },
  "tunnel": {
    "authToken": "your-ngrok-token",
    "region": "eu"
  },
  "storage": {
    "retentionDays": 7,
    "autoCleanup": true
  },
  "ui": {
    "theme": "dark",
    "itemsPerPage": 100
  }
}
```

### Project Configuration

Create `.hookiro.json` in your project root for team-shared settings:
```json
{
  "endpoints": {
    "custom": ["github", "stripe", "sendgrid"]
  },
  "storage": {
    "path": "./webhooks"
  },
  "security": {
    "auth": {
      "enabled": true,
      "username": "team",
      "password": "${Hookiro_PASSWORD}"
    }
  }
}
```

### Environment Variables

All configuration values can be set via environment variables:
```bash
export Hookiro_SERVER_PORT=9000
export Hookiro_TUNNEL_ENABLED=false
export Hookiro_SECURITY_AUTH_USERNAME=myuser
export Hookiro_SECURITY_AUTH_PASSWORD=mypass
export Hookiro_STORAGE_PATH=/custom/path

hookiro start
```

### Configuration Schema

See the full [configuration reference](./config-reference.md) for all available options.

---

## Architecture
```
┌─────────────────────────────────────────────────┐
│                 Hookiro CLI Tool                │
│              (TypeScript/Node.js)               │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │ Fastify │  │  ngrok   │  │  File    │
   │  Web    │  │  Tunnel  │  │ Storage  │
   │ Server  │  │ Manager  │  │ (JSON)   │
   └─────────┘  └──────────┘  └──────────┘
        │             │             │
        ▼             ▼             ▼
   ┌─────────────────────────────────────┐
   │      Web Dashboard (Browser)        │
   │   ├── Webhook List                  │
   │   ├── JSON Hero Viewer              │
   │   └── Real-time Updates (SSE)       │
   └─────────────────────────────────────┘
```

**Components:**
- **CLI Tool**: Single TypeScript application
- **Fastify Server**: Handles HTTP requests and serves UI
- **ngrok Integration**: Creates public tunnel automatically
- **File Storage**: Saves webhooks as JSON files locally
- **JSON Hero**: Interactive JSON visualization
- **SSE**: Server-Sent Events for real-time updates

---

## User Flow

### Standard Workflow
```
1. Developer runs `hookiro start`
   ↓
2. Hookiro starts local server (http://localhost:3420)
   ↓
3. ngrok creates public tunnel (https://abc123.ngrok.io)
   ↓
4. Browser opens automatically to dashboard
   ↓
5. Developer copies webhook URL to external service
   ↓
6. External service sends webhook to ngrok URL
   ↓
7. ngrok forwards to local Hookiro server
   ↓
8. Hookiro saves webhook to disk
   ↓
9. Dashboard updates in real-time via SSE
   ↓
10. Developer inspects payload with JSON Hero
```

### Data Flow
```
External Service (Stripe, GitHub, etc.)
         │
         │ HTTP POST
         ▼
    ngrok Tunnel
         │
         ▼
   Hookiro Server
         │
    ┌────┴────┐
    ▼         ▼
  Disk     Dashboard
Storage    (Browser)
```

---

## File Structure

### Storage Layout
```
~/.hookiro/
├── config.json                          # Global configuration
└── webhooks/                            # Default webhook storage
    ├── 2025-11-07_14-32-15_abc123.json
    ├── 2025-11-07_14-35-42_def456.json
    └── 2025-11-07_15-01-18_ghi789.json
```

### Webhook File Format

Each webhook is stored as a JSON file:
```json
{
  "id": "abc123",
  "timestamp": "2025-11-07T14:32:15.123Z",
  "method": "POST",
  "endpoint": "/webhook/stripe",
  "headers": {
    "content-type": "application/json",
    "stripe-signature": "t=1234567890,v1=abc..."
  },
  "query": {},
  "body": {
    "id": "evt_1234567890",
    "type": "payment_intent.succeeded",
    "data": {
      "object": { ... }
    }
  },
  "sourceIp": "54.187.174.169"
}
```

### Project Configuration
```
/your-project/
├── .hookiro.json                        # Project-specific config
├── webhooks/                            # Project webhook storage
│   ├── 2025-11-07_14-32-15_abc123.json
│   └── 2025-11-07_14-35-42_def456.json
└── .gitignore                           # Add webhooks/ here
```

---

## Web Dashboard

### Dashboard Features

**Webhook List View:**
- Real-time updates as webhooks arrive
- Filter by endpoint, method, date
- Search within payloads
- Sort by timestamp
- Pagination (configurable items per page)
- Click any webhook to view details

**Webhook Detail View:**
- Full request metadata (headers, query params, etc.)
- Interactive JSON Hero visualization
  - Collapsible tree view
  - Type annotations
  - Search within JSON
  - Copy path or value
  - Syntax highlighting
- Export webhook as JSON file
- Delete webhook
- Share webhook (copy link)

**Settings View:**
- Current active configuration
- Config file locations
- Storage statistics
- Version information

---

## Endpoints

### Default Endpoint
```
POST https://your-tunnel.ngrok.io/webhook
```

Receives all webhook POST requests.

### Custom Endpoints
```bash
hookiro start --endpoints github,stripe,sendgrid
```

Creates multiple endpoints:
- `POST https://your-tunnel.ngrok.io/webhook/github`
- `POST https://your-tunnel.ngrok.io/webhook/stripe`
- `POST https://your-tunnel.ngrok.io/webhook/sendgrid`

### API Endpoints

Hookiro also exposes a REST API:
```
GET    /api/webhooks           # List all webhooks
GET    /api/webhooks/:id       # Get specific webhook
DELETE /api/webhooks/:id       # Delete webhook
DELETE /api/webhooks           # Clear all webhooks
GET    /api/config             # Get current config (sanitized)
GET    /api/health             # Health check
```

---

## Security

### Basic Authentication
```bash
# Enable auth via CLI
hookiro start --auth username:password

# Or via config
hookiro config set security.auth.enabled true
hookiro config set security.auth.username myuser
hookiro config set security.auth.password mypass
```

Authentication protects:
- Webhook endpoints
- Web dashboard
- API endpoints

### IP Allowlist
```json
{
  "security": {
    "allowedIps": ["192.168.1.0/24", "10.0.0.50"]
  }
}
```

### CORS Configuration
```bash
# Enable CORS for all origins
hookiro start --cors

# Or configure specific origins
hookiro config set security.allowedOrigins '["https://myapp.com"]'
```

### Rate Limiting
```json
{
  "server": {
    "rateLimit": {
      "enabled": true,
      "maxRequests": 100,
      "windowMs": 60000
    }
  }
}
```

---

## Tips & Best Practices

### Development Workflow

1. **Start Hookiro at the beginning of your dev session**
```bash
   hookiro start
```

2. **Keep it running in a dedicated terminal tab**
   - Webhooks persist even if you restart your app

3. **Use project-specific configuration**
   - Commit `.hookiro.json` to share settings with team
   - Add `webhooks/` to `.gitignore`

4. **Use multiple endpoints for different services**
```bash
   hookiro start --endpoints github,stripe,sendgrid
```

5. **Enable auto-cleanup for long-running sessions**
```bash
   hookiro config set storage.retentionDays 3
   hookiro config set storage.autoCleanup true
```

### Testing Webhooks

1. **Test with real services** (recommended)
   - Use Stripe test mode
   - Use GitHub test webhooks
   - Most services have test/sandbox modes

2. **Manually trigger webhooks**
```bash
   curl -X POST https://your-tunnel.ngrok.io/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
```

3. **Replay captured webhooks**
   - Export webhook from dashboard
   - Replay using `curl` or API client

### Performance Tips

1. **Clean up old webhooks regularly**
```bash
   hookiro clear --older-than 7
```

2. **Use local-only mode for high-volume testing**
```bash
   hookiro start --no-tunnel
```

3. **Adjust storage limits**
```json
   {
     "storage": {
       "maxWebhooks": 5000,
       "autoCleanup": true
     }
   }
```

---

## Troubleshooting

### Port Already in Use
```bash
# Error: Port 3420 is already in use

# Solution: Use different port
hookiro start --port 8080
```

### ngrok Connection Issues
```bash
# Error: ngrok failed to connect

# Solution 1: Check internet connection
# Solution 2: Use ngrok authtoken
hookiro config set tunnel.authToken YOUR_TOKEN

# Solution 3: Use different region
hookiro config set tunnel.region eu

# Solution 4: Skip ngrok and use your own tunnel
hookiro start --no-tunnel
```

### Browser Doesn't Open
```bash
# Disable auto-open
hookiro config set server.autoBrowser false

# Manually open http://localhost:3420
```

### Webhooks Not Appearing

1. **Check webhook URL is correct**
   - Verify in terminal output
   - Ensure using `/webhook` path

2. **Check authentication**
   - If auth enabled, include credentials

3. **Check logs**
```bash
   hookiro start --verbose
```

4. **Verify external service configuration**
   - Check webhook URL in service dashboard
   - Verify service can reach ngrok tunnel

### Storage Issues
```bash
# Check storage location
hookiro config get storage.path

# Clear all webhooks
hookiro clear --all --yes

# Use different storage location
hookiro start --storage ./new-location
```

---

## Key Benefits

✅ **Zero Infrastructure Setup**
- No Docker, servers, or cloud accounts needed
- Single command to start

✅ **Privacy-First**
- All data stays on your machine
- No third-party services (except optional ngrok)

✅ **Developer-Friendly**
- Beautiful JSON visualization
- Real-time updates
- Type-safe TypeScript codebase

✅ **Flexible Configuration**
- Global, project, and environment-based config
- CLI flags override everything

✅ **Cross-Platform**
- Works on macOS, Linux, and Windows
- Single binary or npm package

✅ **Perfect for Local Development**
- Test webhooks without deployment
- Debug webhook payloads easily
- No production impact

✅ **Team-Ready**
- Commit `.hookiro.json` for shared settings
- Consistent environment across team

✅ **Offline Capable**
- Works without internet (use `--no-tunnel`)
- Data persists locally

---

## Next Steps

- **Read the full [Requirements Document](./requirements.md)**
- **Explore [Configuration Reference](./config-reference.md)**
- **Check out [API Documentation](./api.md)**
- **View [Examples](./examples/)**
- **Contribute on [GitHub](https://github.com/hookiro/hookiro)**

---

## Support

- **Issues**: [GitHub Issues](https://github.com/hookiro/hookiro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hookiro/hookiro/discussions)
- **Documentation**: [hookiro.io/docs](https://hookiro.io/docs)
- **Twitter**: [@hookiro_dev](https://twitter.com/hookiro_dev)
