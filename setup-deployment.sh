#!/bin/bash

# Plattsburgh RideShare - Deployment Setup Script
# This script updates the API URLs in mobile apps for deployment

echo "🚀 Plattsburgh RideShare - Deployment Setup"
echo "==========================================="
echo ""

# Get the API URL from user
read -p "Enter your Railway API URL (e.g., https://plattsburgh-api.up.railway.app): " API_URL

if [ -z "$API_URL" ]; then
    echo "❌ API URL is required"
    exit 1
fi

# Ensure URL ends with /api
if [[ ! "$API_URL" == *"/api" ]]; then
    API_URL="${API_URL}/api"
fi

echo "📝 Updating API URLs to: $API_URL"
echo ""

# Update Rider App
echo "🚗 Updating Rider App..."
find /home/ubuntu/plattsburgh-rideshare/apps/rider/screens -name "*.tsx" -type f | while read file; do
    sed -i "s|const API_URL = 'http://localhost:3000/api';|const API_URL = '$API_URL';|g" "$file"
    echo "  ✓ Updated $file"
done

# Update Driver App
echo "🚕 Updating Driver App..."
find /home/ubuntu/plattsburgh-rideshare/apps/driver/screens -name "*.tsx" -type f | while read file; do
    sed -i "s|const API_URL = 'http://localhost:3000/api';|const API_URL = '$API_URL';|g" "$file"
    echo "  ✓ Updated $file"
done

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit these changes: git add -A && git commit -m 'Update API URLs for deployment'"
echo "2. Push to GitHub: git push"
echo "3. Railway will automatically redeploy"
echo "4. Build APKs for your phone"
echo ""
