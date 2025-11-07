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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hookiro - Webhook Inspector</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg-primary: #000000;
      --bg-secondary: #0a0a0a;
      --bg-card: #0f0f0f;
      --bg-hover: #1a1a1a;
      --border-color: #1f1f1f;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --text-muted: #666666;
      --accent-primary: #00d9ff;
      --accent-secondary: #00ff88;
      --success: #00ff88;
      --warning: #ffaa00;
      --danger: #ff4444;
      --json-key: #00d9ff;
      --json-string: #00ff88;
      --json-number: #ffaa00;
      --json-boolean: #ff00aa;
      --json-null: #888888;
    }

    body {
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
      background: var(--bg-primary);
      color: var(--text-primary);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-size: 13px;
      letter-spacing: -0.01em;
    }

    /* Header */
    .header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      background: var(--accent-primary);
      padding: 0.5rem;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--accent-primary);
    }

    .badge {
      background: var(--bg-primary);
      color: var(--accent-primary);
      padding: 0.25rem 0.75rem;
      border-radius: 0;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid var(--accent-primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-box {
      position: relative;
    }

    .search-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      border-radius: 0;
      font-size: 0.75rem;
      width: 300px;
      transition: all 0.15s;
      font-family: 'JetBrains Mono', monospace;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: none;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .btn {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border-radius: 0;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .btn:hover {
      background: var(--bg-hover);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .btn-primary {
      background: var(--bg-primary);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .btn-primary:hover {
      background: var(--accent-primary);
      color: var(--bg-primary);
    }

    /* Main Content */
    .container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 280px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      padding: 1.5rem;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 0;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .filter-section {
      margin-top: 2rem;
    }

    .filter-title {
      color: var(--text-muted);
      font-size: 0.65rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* Main Area - Split Pane */
    .main-area {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .webhook-list {
      width: 40%;
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      background: var(--bg-secondary);
    }

    .webhook-detail {
      flex: 1;
      overflow-y: auto;
      background: var(--bg-primary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: var(--text-secondary);
      padding: 2rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .empty-text {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    /* Webhook List Item */
    .webhook-item {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.15s;
      background: var(--bg-secondary);
    }

    .webhook-item:hover {
      background: var(--bg-hover);
      border-left: 2px solid var(--accent-primary);
      padding-left: calc(1rem - 2px);
    }

    .webhook-item.selected {
      background: var(--bg-card);
      border-left: 2px solid var(--accent-primary);
      padding-left: calc(1rem - 2px);
    }

    .webhook-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .webhook-time {
      font-weight: 600;
      font-size: 0.75rem;
      color: var(--text-primary);
    }

    .webhook-time-ago {
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .webhook-preview {
      font-size: 0.7rem;
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .webhook-id-small {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* Detail View */
    .detail-header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .detail-title {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: var(--text-muted);
    }

    .detail-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--accent-primary);
    }

    .detail-actions {
      display: flex;
      gap: 0.5rem;
    }

    .detail-body {
      padding: 1.5rem;
    }

    .icon-btn {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0;
      transition: all 0.15s;
      font-size: 0.65rem;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .icon-btn:hover {
      background: var(--bg-hover);
      color: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .section {
      margin-bottom: 1.5rem;
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .section-title {
      color: var(--text-muted);
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
    }

    .copy-btn {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 0;
      font-size: 0.65rem;
      cursor: pointer;
      transition: all 0.15s;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .copy-btn:hover {
      background: var(--bg-hover);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    /* JSON Display */
    .json-container {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0;
      padding: 1rem;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
      font-size: 0.75rem;
      line-height: 1.6;
    }

    .json-key {
      color: var(--json-key);
    }

    .json-string {
      color: var(--json-string);
    }

    .json-number {
      color: var(--json-number);
    }

    .json-boolean {
      color: var(--json-boolean);
    }

    .json-null {
      color: var(--json-null);
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-primary);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 0;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--accent-primary);
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .webhook-item {
      animation: fadeIn 0.2s ease-out;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }

      .webhook-list {
        width: 100%;
        border-right: none;
      }

      .webhook-detail {
        display: none;
      }

      .search-input {
        width: 150px;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="logo">
        <div class="logo-icon">🎣</div>
        Hookiro
      </div>
      <span class="badge" id="webhook-count">0</span>
    </div>
    <div class="header-right">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" id="search" placeholder="Search webhooks...">
      </div>
      <button class="btn btn-primary" onclick="refreshWebhooks()">
        🔄 Refresh
      </button>
    </div>
  </div>

  <!-- Main Container -->
  <div class="container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="stat-card">
        <div class="stat-label">Total Webhooks</div>
        <div class="stat-value" id="total-count">0</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Last Received</div>
        <div class="stat-value" id="last-time" style="font-size: 1rem;">-</div>
      </div>

      <div class="filter-section">
        <div class="filter-title">Quick Actions</div>
        <button class="btn" style="width: 100%; justify-content: center; margin-top: 0.5rem;" onclick="clearSearch()">
          Clear Search
        </button>
      </div>
    </div>

    <!-- Main Area - Split Pane -->
    <div class="main-area">
      <!-- Webhook List -->
      <div class="webhook-list" id="webhook-list">
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">No webhooks yet</div>
          <div class="empty-text">Send a POST request to /webhook to get started</div>
        </div>
      </div>

      <!-- Detail View -->
      <div class="webhook-detail" id="webhook-detail">
        <div class="empty-state">
          <div class="empty-icon">👈</div>
          <div class="empty-title">Select a webhook</div>
          <div class="empty-text">Click on a webhook from the list to view details</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let webhooks = [];
    let searchTerm = '';
    let selectedWebhook = null;

    // Load webhooks on page load
    loadWebhooks();

    // Search functionality
    document.getElementById('search').addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase();
      renderWebhookList();
    });

    async function loadWebhooks() {
      try {
        const response = await fetch('/api/webhooks');
        webhooks = await response.json();
        renderWebhookList();

        // Auto-select first webhook if available
        if (webhooks.length > 0 && !selectedWebhook) {
          selectWebhook(webhooks[webhooks.length - 1].id);
        }
      } catch (error) {
        console.error('Error loading webhooks:', error);
      }
    }

    function refreshWebhooks() {
      loadWebhooks();
    }

    function clearSearch() {
      document.getElementById('search').value = '';
      searchTerm = '';
      renderWebhookList();
    }

    function renderWebhookList() {
      const listContainer = document.getElementById('webhook-list');
      const countBadge = document.getElementById('webhook-count');
      const totalCount = document.getElementById('total-count');
      const lastTime = document.getElementById('last-time');

      // Update counts
      countBadge.textContent = webhooks.length;
      totalCount.textContent = webhooks.length;

      if (webhooks.length === 0) {
        listContainer.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-title">No webhooks yet</div>
            <div class="empty-text">Send a POST request to /webhook</div>
          </div>
        \`;
        lastTime.textContent = '-';
        return;
      }

      // Update last received time
      const latest = webhooks[webhooks.length - 1];
      lastTime.textContent = formatTimeAgo(new Date(latest.timestamp));

      // Filter webhooks
      const filtered = webhooks.filter(webhook => {
        if (!searchTerm) return true;
        const searchStr = JSON.stringify(webhook).toLowerCase();
        return searchStr.includes(searchTerm);
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-title">No results found</div>
            <div class="empty-text">Try adjusting your search</div>
          </div>
        \`;
        return;
      }

      // Render webhook list items (newest first)
      const reversed = [...filtered].reverse();
      listContainer.innerHTML = reversed.map(webhook => {
        const preview = getPreview(webhook.body);
        return \`
          <div class="webhook-item \${selectedWebhook === webhook.id ? 'selected' : ''}" onclick="selectWebhook('\${webhook.id}')">
            <div class="webhook-item-header">
              <div class="webhook-time">\${formatDateTime(webhook.timestamp)}</div>
              <div class="webhook-time-ago">\${formatTimeAgo(new Date(webhook.timestamp))}</div>
            </div>
            <div class="webhook-preview">\${preview}</div>
            <div class="webhook-id-small">\${webhook.id}</div>
          </div>
        \`;
      }).join('');
    }

    function selectWebhook(id) {
      selectedWebhook = id;
      renderWebhookList();
      renderWebhookDetail();
    }

    function renderWebhookDetail() {
      const detailContainer = document.getElementById('webhook-detail');
      const webhook = webhooks.find(w => w.id === selectedWebhook);

      if (!webhook) {
        detailContainer.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">👈</div>
            <div class="empty-title">Select a webhook</div>
            <div class="empty-text">Click on a webhook from the list</div>
          </div>
        \`;
        return;
      }

      detailContainer.innerHTML = \`
        <div class="detail-header">
          <div>
            <div class="detail-title">Webhook Details</div>
            <div class="detail-id">\${webhook.id}</div>
          </div>
          <div class="detail-actions">
            <button class="icon-btn" onclick="copyWebhook('\${webhook.id}')">
              📋 Copy All
            </button>
          </div>
        </div>
        <div class="detail-body">
          <div class="section">
            <div class="section-header">
              <div class="section-title">Timestamp</div>
            </div>
            <div class="json-container">\${new Date(webhook.timestamp).toLocaleString()}</div>
          </div>
          <div class="section">
            <div class="section-header">
              <div class="section-title">Headers</div>
              <button class="copy-btn" onclick="copyToClipboard(\${JSON.stringify(JSON.stringify(webhook.headers))})">
                Copy
              </button>
            </div>
            <div class="json-container">\${syntaxHighlight(webhook.headers)}</div>
          </div>
          <div class="section">
            <div class="section-header">
              <div class="section-title">Body</div>
              <button class="copy-btn" onclick="copyToClipboard(\${JSON.stringify(JSON.stringify(webhook.body))})">
                Copy
              </button>
            </div>
            <div class="json-container">\${syntaxHighlight(webhook.body)}</div>
          </div>
        </div>
      \`;
    }

    function getPreview(body) {
      if (typeof body === 'string') return body.substring(0, 100);
      const str = JSON.stringify(body);
      return str.substring(0, 100) + (str.length > 100 ? '...' : '');
    }

    function copyWebhook(id) {
      const webhook = webhooks.find(w => w.id === id);
      copyToClipboard(JSON.stringify(webhook, null, 2));
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        // Could add a toast notification here
        console.log('Copied to clipboard');
      });
    }

    function syntaxHighlight(obj) {
      let json = JSON.stringify(obj, null, 2);
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }

    function formatDateTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      // If less than 1 minute ago
      if (diff < 60000) {
        return 'Just now';
      }

      // If today
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString();
      }

      // Otherwise
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function formatTimeAgo(date) {
      const now = new Date();
      const diff = now - date;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return seconds + 's ago';
      if (minutes < 60) return minutes + 'm ago';
      if (hours < 24) return hours + 'h ago';
      return days + 'd ago';
    }

    // Auto-refresh every 5 seconds
    setInterval(loadWebhooks, 5000);
  </script>
</body>
</html>`;
}
