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
      gap: 1rem;
    }

    .logo-icon {
      background: var(--bg-primary);
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--accent-primary);
      width: 75px;
      height: 75px;
    }

    .logo-icon svg {
      width: 100%;
      height: 100%;
      color: var(--accent-primary);
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
      width: 14px;
      height: 14px;
    }

    .icon {
      width: 14px;
      height: 14px;
      display: inline-block;
      vertical-align: middle;
    }

    .icon-sm {
      width: 12px;
      height: 12px;
    }

    .icon-lg {
      width: 48px;
      height: 48px;
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
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      opacity: 0.3;
      color: var(--text-muted);
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
      display: flex;
      gap: 0.75rem;
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

    .webhook-number {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 700;
      min-width: 30px;
      text-align: right;
      padding-top: 0.1rem;
    }

    .webhook-item-content {
      flex: 1;
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
      padding: 0;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
      font-size: 0.75rem;
      line-height: 1.6;
    }

    .json-line {
      display: flex;
      padding: 0;
    }

    .json-line:hover {
      background: var(--bg-hover);
    }

    .line-number {
      color: var(--text-muted);
      user-select: none;
      text-align: right;
      padding: 0 1rem;
      min-width: 50px;
      border-right: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .line-content {
      padding: 0 1rem;
      white-space: pre-wrap;
      word-break: break-word;
      flex: 1;
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
        <div class="logo-icon">
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="100" cy="100" r="95" fill="#2563eb" opacity="0.1"/>
  
  <!-- Data streams/lines in background -->
  <path d="M 40 60 Q 60 65, 80 60 T 120 60" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.4"/>
  <path d="M 35 80 Q 55 75, 75 80 T 115 80" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.4"/>
  <path d="M 45 100 Q 65 105, 85 100 T 125 100" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.4"/>
  
  <!-- Hook shape -->
  <path d="M 140 50 
           L 140 90 
           Q 140 120, 110 120
           Q 80 120, 80 90
           L 80 85" 
        stroke="#2563eb" 
        stroke-width="8" 
        fill="none" 
        stroke-linecap="round"
        stroke-linejoin="round"/>
  
  <!-- Hook eye/loop at top -->
  <circle cx="140" cy="45" r="8" fill="none" stroke="#2563eb" stroke-width="8"/>
  
  <!-- Arrow at bottom of hook -->
  <path d="M 80 85 L 70 75 M 80 85 L 90 75" 
        stroke="#2563eb" 
        stroke-width="6" 
        stroke-linecap="round"/>
  
  <!-- Data dots/nodes -->
  <circle cx="50" cy="140" r="6" fill="#10b981"/>
  <circle cx="80" cy="150" r="6" fill="#10b981"/>
  <circle cx="110" cy="145" r="6" fill="#10b981"/>
  <circle cx="140" cy="155" r="6" fill="#10b981"/>
  
  <!-- Connecting lines between data points -->
  <path d="M 50 140 L 80 150 L 110 145 L 140 155" 
        stroke="#10b981" 
        stroke-width="2" 
        fill="none"
        opacity="0.6"/>
  
  <!-- Binary code effect -->
  <text x="155" y="70" font-family="monospace" font-size="12" fill="#6366f1" opacity="0.5">01</text>
  <text x="155" y="100" font-family="monospace" font-size="12" fill="#6366f1" opacity="0.5">10</text>
  <text x="155" y="130" font-family="monospace" font-size="12" fill="#6366f1" opacity="0.5">11</text>
</svg>

        </div>
        Hookiro
      </div>
      <span class="badge" id="webhook-count">0</span>
    </div>
    <div class="header-right">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" class="search-input" id="search" placeholder="Search webhooks...">
      </div>
      <button class="btn btn-primary" id="refresh-btn" onclick="refreshWebhooks()">
        <svg id="refresh-icon" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        <span id="refresh-text">Refresh</span>
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
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <div class="empty-title">No webhooks yet</div>
          <div class="empty-text">Send a POST request to /webhook to get started</div>
        </div>
      </div>

      <!-- Detail View -->
      <div class="webhook-detail" id="webhook-detail">
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
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

    let isRefreshing = false;

    async function loadWebhooks(showIndicator = false) {
      if (isRefreshing) return;

      try {
        if (showIndicator) {
          isRefreshing = true;
          const refreshIcon = document.getElementById('refresh-icon');
          const refreshText = document.getElementById('refresh-text');
          if (refreshIcon) refreshIcon.style.opacity = '0.5';
          if (refreshText) refreshText.textContent = 'Refreshing...';
        }

        const response = await fetch('/api/webhooks');
        const newWebhooks = await response.json();

        // Check if data actually changed
        const dataChanged = JSON.stringify(webhooks) !== JSON.stringify(newWebhooks);

        if (!dataChanged) {
          return; // No changes, don't re-render
        }

        webhooks = newWebhooks;
        renderWebhookList();

        // If selected webhook still exists, update its detail view
        if (selectedWebhook && webhooks.find(w => w.id === selectedWebhook)) {
          renderWebhookDetail();
        } else if (webhooks.length > 0 && !selectedWebhook) {
          // Auto-select first webhook only if nothing is selected
          selectWebhook(webhooks[webhooks.length - 1].id);
        } else if (selectedWebhook && !webhooks.find(w => w.id === selectedWebhook)) {
          // Selected webhook was deleted, select newest
          if (webhooks.length > 0) {
            selectWebhook(webhooks[webhooks.length - 1].id);
          } else {
            selectedWebhook = null;
            renderWebhookDetail();
          }
        }
      } catch (error) {
        console.error('Error loading webhooks:', error);
      } finally {
        if (showIndicator) {
          setTimeout(() => {
            isRefreshing = false;
            const refreshIcon = document.getElementById('refresh-icon');
            const refreshText = document.getElementById('refresh-text');
            if (refreshIcon) refreshIcon.style.opacity = '1';
            if (refreshText) refreshText.textContent = 'Refresh';
          }, 300);
        }
      }
    }

    function refreshWebhooks() {
      loadWebhooks(true);
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
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
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
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <div class="empty-title">No results found</div>
            <div class="empty-text">Try adjusting your search</div>
          </div>
        \`;
        return;
      }

      // Render webhook list items (newest first)
      const reversed = [...filtered].reverse();
      listContainer.innerHTML = reversed.map((webhook, index) => {
        const preview = getPreview(webhook.body);
        const number = index + 1;
        return \`
          <div class="webhook-item \${selectedWebhook === webhook.id ? 'selected' : ''}" onclick="selectWebhook('\${webhook.id}')">
            <div class="webhook-number">\${number}</div>
            <div class="webhook-item-content">
              <div class="webhook-item-header">
                <div class="webhook-time">\${formatDateTime(webhook.timestamp)}</div>
                <div class="webhook-time-ago">\${formatTimeAgo(new Date(webhook.timestamp))}</div>
              </div>
              <div class="webhook-preview">\${preview}</div>
              <div class="webhook-id-small">\${webhook.id}</div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function selectWebhook(id) {
      // Remove selected class from all items
      document.querySelectorAll('.webhook-item').forEach(item => {
        item.classList.remove('selected');
      });

      // Add selected class to clicked item
      const clickedItem = Array.from(document.querySelectorAll('.webhook-item')).find(item => {
        return item.onclick.toString().includes(id);
      });
      if (clickedItem) {
        clickedItem.classList.add('selected');
      }

      selectedWebhook = id;
      renderWebhookDetail();
    }

    function renderWebhookDetail() {
      const detailContainer = document.getElementById('webhook-detail');
      const webhook = webhooks.find(w => w.id === selectedWebhook);

      if (!webhook) {
        detailContainer.innerHTML = \`
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
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
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy All
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
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
            </div>
            <div class="json-container">\${syntaxHighlight(webhook.headers)}</div>
          </div>
          <div class="section">
            <div class="section-header">
              <div class="section-title">Body</div>
              <button class="copy-btn" onclick="copyToClipboard(\${JSON.stringify(JSON.stringify(webhook.body))})">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
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
      const highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
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

      // Split into lines and add line numbers
      const lines = highlighted.split('\\n');
      return lines.map((line, index) => {
        const lineNumber = index + 1;
        return \`<div class="json-line"><span class="line-number">\${lineNumber}</span><span class="line-content">\${line}</span></div>\`;
      }).join('');
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

    // Auto-refresh every 3 seconds (without showing indicator)
    setInterval(() => loadWebhooks(false), 3000);
  </script>
</body>
</html>`;
}
