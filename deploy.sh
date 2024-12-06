#!/bin/bash

# Deploy Backend
echo "Deploying backend..."
cd backend
vercel --prod

# Get the production URL
BACKEND_URL=$(vercel --prod)
echo "Backend deployed at: $BACKEND_URL"

# Update frontend environment with backend URL
cd ../frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.production
echo "VITE_SOCKET_URL=$BACKEND_URL" >> .env.production

# Deploy frontend
echo "Deploying frontend..."
vercel --prod

echo "Deployment complete!"
