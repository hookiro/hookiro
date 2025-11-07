curl -X POST http://localhost:3420/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from curl", "timestamp": "2025-11-07", "status": "success"}'
  