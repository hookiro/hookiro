# 🎣 Hookiro MVP

A minimal webhook receiver for local development. Receive, store, and inspect webhook payloads instantly.

## Features

✅ **One Command Start** - Just run `hookiro start`
✅ **Public URL via ngrok** - Instant webhook endpoint
✅ **Local Storage** - Webhooks saved to `~/.hookiro/webhooks.json`
✅ **Web Interface** - View webhooks at `http://localhost:3420`
✅ **REST API** - Access webhooks via `/api/webhooks`
✅ **Zero Configuration** - Works out of the box

## Quick Start

### Installation

**Global Installation (Recommended):**

```bash
# Install globally from npm (when published)
npm install -g hookiro

# Run hookiro from anywhere
hookiro
```

**Local Development:**

```bash
# Clone the repository
git clone <repository-url>
cd hookiro

# Install dependencies
npm install

# Build the project
npm run build

# Link globally for local testing
npm link

# Run hookiro
hookiro
```

**Or run without installing:**

```bash
# After building
node dist/index.js
```

### Development Mode

```bash
# Watch mode (rebuilds on file changes)
npm run dev

# In another terminal, run hookiro
hookiro
# or
node dist/index.js
```

### Usage

1. Start Hookiro:
```bash
hookiro
```

2. You'll see output like:
```
🎣 Hookiro MVP v0.1.0

✓ Webhook endpoint: http://localhost:3420/webhook
✓ Starting ngrok tunnel...
✓ Public URL: https://abc123.ngrok.io/webhook

📊 View webhooks: http://localhost:3420

Listening for webhooks... (Press Ctrl+C to stop)
```

3. Copy the public URL to your webhook service (Stripe, GitHub, etc.)

4. Open `http://localhost:3420` in your browser to view webhooks

5. Send test webhooks:
```bash
curl -X POST http://localhost:3420/webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": "hello world"}'
```

6. View webhooks in your browser - they update when you refresh the page

## How It Works

```
External Service (Stripe, GitHub, etc.)
         │
         │ HTTP POST
         ▼
    ngrok Tunnel
         │
         ▼
   Hookiro Server (localhost:3420)
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
  JSON    HTML Page   REST API
Storage   (GET /)   (GET /api/webhooks)
```

## Endpoints

- **GET /** - Web interface to view webhooks
- **GET /api/webhooks** - REST API returning webhooks as JSON
- **POST /webhook** - Receive webhook POST requests

## File Structure

```
hookiro/
├── src/
│   ├── index.ts       # Main CLI entry point
│   ├── server.ts      # HTTP server
│   ├── storage.ts     # File operations & HTML template
│   └── tunnel.ts      # ngrok integration
├── dist/
│   └── index.js       # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Generated Files

When you run Hookiro, it creates:

```
~/.hookiro/
└── webhooks.json      # All captured webhooks (JSON array)
```

The HTML viewer is served directly from the HTTP server at `http://localhost:3420` (not saved to disk).

### Webhook Format

Each webhook is stored with:

```json
{
  "id": "abc123",
  "timestamp": "2025-11-07T14:32:15.123Z",
  "headers": {
    "content-type": "application/json",
    "user-agent": "Stripe/1.0"
  },
  "body": {
    "event": "payment.success",
    "amount": 1000
  }
}
```

## ngrok Setup (Optional)

For the public URL to work, you need ngrok installed:

1. Sign up at [ngrok.com](https://ngrok.com)
2. Install ngrok: `npm install -g ngrok`
3. Set your authtoken:
```bash
export NGROK_AUTHTOKEN=your_token_here
```

Or run without ngrok:
- Hookiro will still work on `localhost:3420`
- Use your own reverse proxy (cloudflared, localtunnel, etc.)

## Troubleshooting

### Port Already in Use

If port 3420 is taken, the app will fail. Currently the port is hardcoded, but you can edit `src/index.ts` to change it.

### ngrok Fails

If ngrok doesn't start:
- Check your internet connection
- Verify `NGROK_AUTHTOKEN` is set
- The app will still work locally at `http://localhost:3420/webhook`

### Webhooks Not Appearing

1. Check the webhook URL is correct
2. Verify the request is a POST to `/webhook`
3. Ensure the body is valid JSON
4. Refresh the HTML viewer (F5)

## MVP Limitations

This is a minimal viable product. What's **NOT** included:

❌ Configuration system (ports, paths, etc.)
❌ Multiple webhook endpoints
❌ Real-time updates (manual refresh needed)
❌ CLI commands (list, clear, config)
❌ Authentication
❌ JSON Hero integration
❌ Rate limiting
❌ CORS

## Next Steps (Iteration Plan)

### v0.2.0 - Better UX
- [x] Web server for HTML viewer
- [x] REST API endpoint for webhooks
- [ ] Real-time updates via Server-Sent Events
- [ ] Better error handling
- [ ] CLI commands: `hookiro list`, `hookiro clear`

### v0.3.0 - Configuration
- [ ] Configuration file support
- [ ] Custom port via CLI flag
- [ ] Custom storage path
- [ ] Multiple endpoints

### v0.4.0 - Polish
- [ ] JSON Hero integration
- [ ] Authentication
- [ ] Search/filter webhooks
- [ ] Delete individual webhooks

### v1.0.0 - Production Ready
- [ ] Full feature set from requirements.md
- [ ] TypeScript strict mode
- [ ] Test coverage
- [ ] Documentation
- [ ] npm package

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Project Structure

- **index.ts** - Entry point, coordinates all modules
- **server.ts** - HTTP server using Node's built-in `http` module
- **storage.ts** - File I/O for webhooks.json and HTML template
- **tunnel.ts** - ngrok tunnel wrapper

## License

MIT

## Contributing

This is an MVP! Contributions welcome for:
- Bug fixes
- Performance improvements
- Documentation
- New features (see iteration plan)

Open an issue or PR to get started.

---

**Built with:**
- TypeScript
- Node.js http module
- @ngrok/ngrok
- nanoid
