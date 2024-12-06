# Real-Time Chat Application

## Deployment Instructions for Vercel

### Backend Deployment

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure Environment Variables in Vercel:
   - `PORT`
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `VERCEL_URL` (will be automatically set by Vercel)

4. Deploy the backend:
```bash
cd backend
vercel
```

### Frontend Deployment

1. Update the API endpoint in your frontend code to point to your Vercel backend URL
2. Deploy the frontend:
```bash
cd frontend
vercel
```

### Environment Variables

Make sure to set up the following environment variables in your Vercel project:

Backend:
- `PORT`: Port number for the server (default: 3000)
- `MONGODB_URI`: Your MongoDB connection string
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `VERCEL_URL`: Automatically set by Vercel

Frontend:
- `VITE_API_URL`: Your backend API URL (e.g., https://your-backend.vercel.app)

### Development

1. Clone the repository
2. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Create `.env` files in both backend and frontend directories using the `.env.example` templates
4. Run the development servers:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```
