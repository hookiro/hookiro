import * as http from 'http';
import { saveWebhook, getHTMLTemplate, getWebhooks } from './storage.js';

export async function startServer(port: number): Promise<void> {
  const server = http.createServer(async (req, res) => {
    // GET / - Serve HTML viewer
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getHTMLTemplate());
      return;
    }

    // GET /api/webhooks - Serve webhooks data
    if (req.method === 'GET' && req.url === '/api/webhooks') {
      try {
        const webhooks = await getWebhooks();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(webhooks));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to load webhooks' }));
      }
      return;
    }

    // POST /webhook - Receive webhook
    if (req.method === 'POST' && req.url === '/webhook') {
      let body = '';

      req.on('data', (chunk) => {
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
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // 404 for all other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve());
  });
}
