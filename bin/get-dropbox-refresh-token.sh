#!/bin/bash

set -e

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DROPBOX_APP_KEY" ] || [ -z "$DROPBOX_APP_SECRET" ]; then
  echo "Error: DROPBOX_APP_KEY and DROPBOX_APP_SECRET must be set in .env file"
  exit 1
fi

APP_KEY="$DROPBOX_APP_KEY"
APP_SECRET="$DROPBOX_APP_SECRET"

echo "Open this URL in your browser:"
echo "https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&token_access_type=offline&response_type=code"
echo ""
read -p "Enter authorization code: " AUTH_CODE

RESPONSE=$(curl -s -X POST https://api.dropbox.com/oauth2/token \
  -d code="$AUTH_CODE" \
  -d grant_type=authorization_code \
  -d client_id="$APP_KEY" \
  -d client_secret="$APP_SECRET")

REFRESH_TOKEN=$(echo "$RESPONSE" | sed -n 's/.*"refresh_token": *"\([^"]*\)".*/\1/p')

if [ -z "$REFRESH_TOKEN" ]; then
  echo "Error: Failed to get refresh token"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "Refresh token: $REFRESH_TOKEN"
