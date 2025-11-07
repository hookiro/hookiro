# Hookiro MVP - Minimum Viable Product Requirements

## Overview
The absolute minimum version of Hookiro to validate the concept and get it in users' hands quickly.

---

## MVP Scope

### What's IN the MVP ✅
1. Basic CLI that starts a webhook receiver
2. Single webhook endpoint (no custom endpoints)
3. Save webhooks to a single JSON file (array format)
4. Simple HTML page to view webhooks
5. File-based URL to view (file:// protocol)
6. ngrok tunnel integration
7. Basic terminal output

### What's OUT of MVP ❌
1. ~~Configuration system~~ (use hardcoded defaults)
2. ~~Multiple endpoints~~
3. ~~Authentication~~
4. ~~Rate limiting~~
5. ~~CORS~~
6. ~~Real-time updates~~ (manual refresh)
7. ~~JSON Hero integration~~ (use basic JSON viewer)
8. ~~Web server for UI~~ (use static HTML file)
9. ~~Database/SQLite~~
10. ~~Auto-cleanup~~
11. ~~Config commands~~
12. ~~List/clear commands~~
13. ~~Advanced CLI options~~

---

## Core Features (MVP)

### 1. CLI Tool (Simplified)

**Single Command:**
```bash
hookiro start
```

**Output:**
```
🎣 Hookiro MVP v0.1.0

✓ Webhook endpoint: http://localhost:3420/webhook
✓ Starting ngrok tunnel...
✓ Public URL: https://abc123.ngrok.io/webhook

📊 View webhooks: file:///Users/you/.hookiro/webhooks.html

Listening for webhooks... (Press Ctrl+C to stop)
```

**No options needed for MVP** - just get it working!

### 2. Webhook Receiver

**Single Endpoint:**
- `POST http://localhost:3420/webhook` - Receives all webhooks

**Functionality:**
- Accept POST requests only
- Parse JSON body
- Capture basic metadata:
  - Timestamp
  - Headers
  - Body
- Append to JSON file
- Log to console

**No need for:**
- Multiple HTTP methods
- Query parameters
- Source IP tracking
- Complex error handling

### 3. Data Storage (File-Based)

**Single JSON File:**
```
~/.hookiro/webhooks.json
```

**File Format (Array):**
```json
[
  {
    "id": "abc123",
    "timestamp": "2025-11-07T14:32:15.123Z",
    "headers": {
      "content-type": "application/json"
    },
    "body": {
      "event": "payment.success"
    }
  },
  {
    "id": "def456",
    "timestamp": "2025-11-07T14:35:42.456Z",
    "headers": {
      "content-type": "application/json"
    },
    "body": {
      "event": "user.created"
    }
  }
]
```

**Initialization:**
- On first start, create `~/.hookiro/` directory
- Create `webhooks.json` with empty array: `[]`
- If file exists, load existing data
- Append new webhooks to array

**No need for:**
- Individual files per webhook
- Retention policies
- Max webhook limits
- Auto-cleanup

### 4. Viewing Interface (Static HTML)

**Single HTML File:**
```
~/.hookiro/webhooks.html
```

**Features:**
- Read from `webhooks.json` using JavaScript
- Display webhooks in a simple list
- Show timestamp, headers, body
- Basic JSON formatting (use `<pre>` tags)
- Manual refresh (F5)

**No need for:**
- Web server
- Real-time updates
- Search/filter
- Pagination
- JSON Hero
- Delete functionality
- Export functionality

### 5. ngrok Integration

**Basic Tunnel:**
- Start ngrok automatically
- Display public URL
- That's it!

**No need for:**
- Custom subdomains
- Region selection
- Reconnection handling
- Auth token configuration

---

## Technical Implementation (MVP)

### File Structure
```
hookiro/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server.ts             # Simple HTTP server
│   ├── storage.ts            # File operations
│   ├── tunnel.ts             # ngrok wrapper
│   └── template.ts           # HTML template string
├── package.json
├── tsconfig.json
└── README.md
```

### Dependencies (Minimal)
```json
{
  "dependencies": {
    "@ngrok/ngrok": "^1.0.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0"
  }
}
```

**No Fastify, no Commander, no validation libraries!**

### Core Code Structure

#### 1. Main Entry (`index.ts`)
```typescript
#!/usr/bin/env node

import { startServer } from './server';
import { startTunnel } from './tunnel';
import { initStorage } from './storage';

async function main() {
  console.log('🎣 Hookiro MVP v0.1.0\n');
  
  // Initialize storage
  await initStorage();
  
  // Start HTTP server
  const port = 3420;
  await startServer(port);
  console.log(`✓ Webhook endpoint: http://localhost:${port}/webhook`);
  
  // Start ngrok tunnel
  console.log('✓ Starting ngrok tunnel...');
  const publicUrl = await startTunnel(port);
  console.log(`✓ Public URL: ${publicUrl}/webhook\n`);
  
  // Show view URL
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  console.log(`📊 View webhooks: file://${homeDir}/.hookiro/webhooks.html\n`);
  
  console.log('Listening for webhooks... (Press Ctrl+C to stop)');
}

main().catch(console.error);
```

#### 2. HTTP Server (`server.ts`)
```typescript
import * as http from 'http';
import { saveWebhook } from './storage';

export async function startServer(port: number): Promise<void> {
  const server = http.createServer(async (req, res) => {
    // Only handle POST to /webhook
    if (req.method === 'POST' && req.url === '/webhook') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          await saveWebhook(req.headers, data);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          
          console.log(`✓ Webhook received at ${new Date().toISOString()}`);
        } catch (error) {
          res.writeHead(400);
          res.end();
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  return new Promise((resolve) => {
    server.listen(port, () => resolve());
  });
}
```

#### 3. Storage (`storage.ts`)
```typescript
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';

const HOME_DIR = process.env.HOME || process.env.USERPROFILE || '';
const HOOKIRO_DIR = path.join(HOME_DIR, '.hookiro');
const WEBHOOKS_FILE = path.join(HOOKIRO_DIR, 'webhooks.json');
const HTML_FILE = path.join(HOOKIRO_DIR, 'webhooks.html');

interface Webhook {
  id: string;
  timestamp: string;
  headers: Record<string, string | string[]>;
  body: any;
}

export async function initStorage(): Promise<void> {
  // Create directory if it doesn't exist
  await fs.mkdir(HOOKIRO_DIR, { recursive: true });
  
  // Create webhooks.json with empty array if it doesn't exist
  try {
    await fs.access(WEBHOOKS_FILE);
  } catch {
    await fs.writeFile(WEBHOOKS_FILE, '[]', 'utf-8');
  }
  
  // Create HTML viewer
  await fs.writeFile(HTML_FILE, getHTMLTemplate(), 'utf-8');
}

export async function saveWebhook(
  headers: Record<string, string | string[]>,
  body: any
): Promise<void> {
  // Read existing webhooks
  const data = await fs.readFile(WEBHOOKS_FILE, 'utf-8');
  const webhooks: Webhook[] = JSON.parse(data);
  
  // Create new webhook
  const webhook: Webhook = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    headers: headers as Record<string, string | string[]>,
    body,
  };
  
  // Append to array
  webhooks.push(webhook);
  
  // Save back to file
  await fs.writeFile(WEBHOOKS_FILE, JSON.stringify(webhooks, null, 2), 'utf-8');
}

function getHTMLTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Hookiro - Webhooks</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .webhook {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .timestamp {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
    pre {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .empty {
      text-align: center;
      color: #999;
      padding: 40px;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <h1>🎣 Hookiro Webhooks</h1>
  <button onclick="location.reload()">🔄 Refresh</button>
  <div id="webhooks"></div>
  
  <script>
    async function loadWebhooks() {
      try {
        // Read webhooks.json from same directory
        const response = await fetch('./webhooks.json');
        const webhooks = await response.json();
        
        const container = document.getElementById('webhooks');
        
        if (webhooks.length === 0) {
          container.innerHTML = '<div class="empty">No webhooks yet. Send a POST request to your webhook URL!</div>';
          return;
        }
        
        // Reverse to show newest first
        webhooks.reverse();
        
        container.innerHTML = webhooks.map(webhook => \`
          <div class="webhook">
            <div class="timestamp">\${new Date(webhook.timestamp).toLocaleString()}</div>
            <h3>Headers</h3>
            <pre>\${JSON.stringify(webhook.headers, null, 2)}</pre>
            <h3>Body</h3>
            <pre>\${JSON.stringify(webhook.body, null, 2)}</pre>
          </div>
        \`).join('');
      } catch (error) {
        document.getElementById('webhooks').innerHTML = 
          '<div class="empty">Error loading webhooks: ' + error.message + '</div>';
      }
    }
    
    loadWebhooks();
  </script>
</body>
</html>`;
}
```

#### 4. Tunnel (`tunnel.ts`)
```typescript
import ngrok from '@ngrok/ngrok';

export async function startTunnel(port: number): Promise<string> {
  const listener = await ngrok.forward({ addr: port, authtoken_from_env: true });
  return listener.url() || '';
}
```

---

## User Flow (MVP)

### Step 1: Install
```bash
npm install -g hookiro
```

### Step 2: Start
```bash
hookiro start

# Output:
# 🎣 Hookiro MVP v0.1.0
#
# ✓ Webhook endpoint: http://localhost:3420/webhook
# ✓ Starting ngrok tunnel...
# ✓ Public URL: https://abc123.ngrok.io/webhook
#
# 📊 View webhooks: file:///Users/you/.hookiro/webhooks.html
#
# Listening for webhooks... (Press Ctrl+C to stop)
```

### Step 3: Copy URL
Copy `https://abc123.ngrok.io/webhook` to your service (Stripe, GitHub, etc.)

### Step 4: View Webhooks
Open the file URL in your browser (copy/paste from terminal)

### Step 5: Refresh
Press F5 to see new webhooks

### Step 6: Stop
Press `Ctrl+C` to stop (webhooks are saved)

---

## What Users Get (MVP)

✅ **Working webhook receiver in 30 seconds**
✅ **Public URL via ngrok**
✅ **Simple viewer to inspect payloads**
✅ **Persistent storage**
✅ **Cross-platform (Mac, Linux, Windows)**

---

## What's Missing (Can Add Later)

- Configuration system
- Multiple endpoints
- Real-time updates
- JSON Hero
- Authentication
- Web server for UI
- CLI options
- Search/filter
- Delete webhooks
- Export functionality
- Pretty much everything else!

---

## Development Timeline (MVP)

| Task | Time | Description |
|------|------|-------------|
| Project setup | 1 hour | Initialize TypeScript project, dependencies |
| HTTP server | 2 hours | Basic server with POST endpoint |
| Storage | 2 hours | File operations, JSON array management |
| HTML template | 1 hour | Simple viewer with refresh |
| ngrok integration | 1 hour | Tunnel setup |
| CLI wrapper | 1 hour | Main entry point, console output |
| Testing | 2 hours | Manual testing with curl and real services |
| **Total** | **~10 hours** | **One full work day!** |

---

## Success Criteria (MVP)

**Must Work:**
1. ✅ Can receive webhook POST requests
2. ✅ Saves to JSON file correctly
3. ✅ File initializes as empty array `[]`
4. ✅ HTML viewer displays webhooks
5. ✅ ngrok tunnel works
6. ✅ Works on Mac/Linux/Windows

**Can Be Rough:**
- Error handling can be basic
- UI can be ugly
- No validation needed
- Hard crashes are okay (just restart)

---

## Post-MVP Roadmap

**Version 0.2.0 - Better UX:**
- Add web server (replace file:// URL)
- Real-time updates via SSE
- Better error handling

**Version 0.3.0 - More Features:**
- Configuration system
- Multiple endpoints
- CLI options

**Version 0.4.0 - Polish:**
- JSON Hero integration
- Authentication
- Search/filter

**Version 1.0.0 - Production Ready:**
- Everything from the full requirements doc

---

## Key Decisions (MVP)

1. **File:// URL instead of web server** - Simplifies everything
2. **Single JSON array** - Easiest to implement
3. **No real-time updates** - Manual refresh is fine for MVP
4. **No configuration** - Hardcoded defaults work
5. **POST only** - Covers 99% of webhook use cases
6. **No authentication** - Local development doesn't need it
7. **No JSON Hero** - Native `<pre>` tags with JSON.stringify work fine

---

## Files Generated
```
~/.hookiro/
├── webhooks.json          # Starts as: []
└── webhooks.html          # Static viewer
```

**That's it! Two files.**

---

## MVP Package.json
```json
{
  "name": "hookiro",
  "version": "0.1.0",
  "description": "Minimal webhook receiver for local development",
  "bin": {
    "hookiro": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --clean",
    "dev": "tsup src/index.ts --format esm --watch"
  },
  "dependencies": {
    "@ngrok/ngrok": "^1.0.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Getting Started (MVP Development)
```bash
# 1. Create project
mkdir hookiro && cd hookiro
npm init -y

# 2. Install dependencies
npm install @ngrok/ngrok nanoid
npm install -D typescript @types/node tsup

# 3. Create src files
mkdir src
touch src/index.ts src/server.ts src/storage.ts src/tunnel.ts

# 4. Build
npm run build

# 5. Test locally
node dist/index.js

# 6. Publish to npm
npm publish
```
