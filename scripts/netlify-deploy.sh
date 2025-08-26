#!/bin/bash

# Netlify Deployment Script
echo "🚀 Starting Netlify deployment..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📋 Next steps:"
    echo "1. Set environment variables in Netlify dashboard"
    echo "2. Deploy to Netlify"
    echo "3. Check ENVIRONMENT_VARIABLES.md for required variables"
else
    echo "❌ Build failed!"
    exit 1
fi
