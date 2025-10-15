#!/bin/bash

# Stripe Webhook Testing Script
# This script helps test Stripe webhooks locally

echo "🔵 Stripe Webhook Testing Helper"
echo "=================================="
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed."
    echo ""
    echo "Install it with:"
    echo "  macOS:  brew install stripe/stripe-cli/stripe"
    echo "  Linux:  See https://stripe.com/docs/stripe-cli"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI is installed"
echo ""

# Check if logged in
if ! stripe config --list &> /dev/null; then
    echo "⚠️  Not logged in to Stripe. Running 'stripe login'..."
    stripe login
fi

echo "✅ Logged in to Stripe"
echo ""

# Get the webhook endpoint
WEBHOOK_URL="${1:-http://localhost:3000/api/stripe/webhook}"

echo "📡 Webhook endpoint: $WEBHOOK_URL"
echo ""
echo "Starting webhook listener..."
echo "Copy the webhook signing secret (whsec_xxx) to your .env.local"
echo ""

# Start listening
stripe listen --forward-to "$WEBHOOK_URL"

