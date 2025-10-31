#!/bin/bash
# Traditional deployment script using gh-pages
# This is a backup method if you prefer the old approach

set -e

echo "🏗️  Building the project..."
npm run build

echo "🚀 Deploying to GitHub Pages..."
npx gh-pages -d public -b gh-pages

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://algorithms-with-predictions.github.io"
