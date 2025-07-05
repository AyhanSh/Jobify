#!/bin/bash

# Icon generation script for UnJob
# This script helps generate PNG icons from the SVG favicon

echo "🎨 Generating icons for UnJob..."

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found, generating PNG icons..."
    
    # Generate different sizes
    convert public/favicon.svg -resize 16x16 public/favicon-16x16.png
    convert public/favicon.svg -resize 32x32 public/favicon-32x32.png
    convert public/favicon.svg -resize 180x180 public/apple-touch-icon.png
    convert public/favicon.svg -resize 192x192 public/android-chrome-192x192.png
    convert public/favicon.svg -resize 512x512 public/android-chrome-512x512.png
    
    echo "✅ Icons generated successfully!"
    echo "📁 Generated files:"
    ls -la public/*.png
else
    echo "⚠️  ImageMagick not found. Please install it or use an online converter:"
    echo "   - Install ImageMagick: brew install imagemagick (macOS)"
    echo "   - Or use online tools like: https://convertio.co/svg-png/"
    echo "   - Or use: https://favicon.io/favicon-converter/"
    echo ""
    echo "📋 Required PNG files:"
    echo "   - public/favicon-16x16.png"
    echo "   - public/favicon-32x32.png"
    echo "   - public/apple-touch-icon.png"
    echo "   - public/android-chrome-192x192.png"
    echo "   - public/android-chrome-512x512.png"
fi

echo ""
echo "🎯 Your SVG favicon is ready at: public/favicon.svg"
echo "🌐 The website will use the SVG icon by default" 