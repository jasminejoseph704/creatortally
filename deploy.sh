#!/bin/bash

# Creator Tally Deploy Script
# Usage: ./deploy.sh

set -e

echo "🚀 Creator Tally Deployment"
echo "==========================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if user is logged in to Netlify
echo "🔐 Checking Netlify login status..."
netlify status || {
    echo "❌ Not logged in to Netlify. Please run: netlify login"
    exit 1
}

# Deploy
echo "📤 Deploying to Netlify..."
netlify deploy --prod --dir=.

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "   1. Set up custom domain in Netlify dashboard"
echo "   2. Configure environment variables:"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_ANON_KEY"
echo "      - STRIPE_PUBLISHABLE_KEY"
echo "   3. Set up Stripe product and webhook"
echo "   4. Buy domain and point to Netlify"