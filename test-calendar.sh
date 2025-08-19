#!/bin/bash

echo "=== Testing Calendar Integration ==="

echo "1. Checking calendar status..."
curl -s "http://localhost:5000/api/calendar/status" | head -c 200
echo ""

echo "2. Getting auth URL..."
AUTH_URL=$(curl -s "http://localhost:5000/api/calendar/auth-url" | grep -o '"authUrl":"[^"]*"' | cut -d'"' -f4)
echo "Auth URL (first 100 chars): ${AUTH_URL:0:100}..."
echo ""

echo "3. Testing assignment creation with calendar sync..."
curl -X POST "http://localhost:5000/api/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Calendar Assignment",
    "subject": "AP Biology",
    "dueDate": "2024-12-20T23:59",
    "syncToCalendar": true
  }' | head -c 300
echo ""

echo "4. Checking assignments list..."
curl -s "http://localhost:5000/api/assignments" | head -c 300
echo ""

echo "Calendar test complete!"