import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';
import { IncomingHttpHeaders } from 'http';

const HOME_DIR = process.env.HOME || process.env.USERPROFILE || '';
const HOOKIRO_DIR = path.join(HOME_DIR, '.hookiro');
const WEBHOOKS_FILE = path.join(HOOKIRO_DIR, 'webhooks.json');

interface Webhook {
  id: string;
  timestamp: string;
  headers: IncomingHttpHeaders;
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
}

export async function saveWebhook(
  headers: IncomingHttpHeaders,
  body: any
): Promise<void> {
  // Read existing webhooks
  const data = await fs.readFile(WEBHOOKS_FILE, 'utf-8');
  const webhooks: Webhook[] = JSON.parse(data);

  // Create new webhook
  const webhook: Webhook = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    headers,
    body,
  };

  // Append to array
  webhooks.push(webhook);

  // Save back to file
  await fs.writeFile(WEBHOOKS_FILE, JSON.stringify(webhooks, null, 2), 'utf-8');
}

export async function getWebhooks(): Promise<Webhook[]> {
  try {
    const data = await fs.readFile(WEBHOOKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getHTMLTemplate(): string {
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
    h1 {
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
    }
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
    .webhook-id {
      color: #999;
      font-size: 12px;
      font-family: monospace;
    }
    pre {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 13px;
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
      font-size: 14px;
    }
    button:hover {
      background: #0056b3;
    }
    h3 {
      margin-top: 15px;
      margin-bottom: 10px;
      color: #555;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .count {
      background: #007bff;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: normal;
    }
  </style>
</head>
<body>
  <h1>🎣 Hookiro Webhooks <span id="count" class="count">0</span></h1>
  <button onclick="location.reload()">🔄 Refresh</button>
  <div id="webhooks"></div>

  <script>
    async function loadWebhooks() {
      try {
        // Fetch webhooks from API
        const response = await fetch('/api/webhooks');
        const webhooks = await response.json();

        const container = document.getElementById('webhooks');
        const countEl = document.getElementById('count');

        countEl.textContent = webhooks.length;

        if (webhooks.length === 0) {
          container.innerHTML = '<div class="empty">No webhooks yet. Send a POST request to your webhook URL!</div>';
          return;
        }

        // Reverse to show newest first
        webhooks.reverse();

        container.innerHTML = webhooks.map(webhook => \`
          <div class="webhook">
            <div class="timestamp">\${new Date(webhook.timestamp).toLocaleString()}</div>
            <div class="webhook-id">ID: \${webhook.id}</div>
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
