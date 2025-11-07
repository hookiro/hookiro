#!/usr/bin/env node

import { startServer } from './server.js';
import { startTunnel } from './tunnel.js';
import { initStorage } from './storage.js';

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
  if (publicUrl) {
    console.log(`✓ Public URL: ${publicUrl}/webhook\n`);
  } else {
    console.log('✓ Tunnel not available - using local endpoint only\n');
  }

  // Show web interface URL
  console.log(`📊 View webhooks: http://localhost:${port}\n`);

  console.log('Listening for webhooks... (Press Ctrl+C to stop)');
}

main().catch((error) => {
  console.error('Error starting Hookiro:', error);
  process.exit(1);
});
