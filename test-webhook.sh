#!/bin/bash

# Simple script to test the webhook endpoint

echo "Testing Hookiro webhook endpoint..."
echo ""

curl -X POST http://localhost:3420/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test",
    "message": "Hello from test script!",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

echo ""
echo ""
echo "Webhook sent! Check your HTML viewer or ~/.hookiro/webhooks.json"
