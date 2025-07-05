# Railway Deployment Guide

## Step 1: Deploy to Railway

1. **Go to Railway.app and sign up/login**
   - Visit: https://railway.app
   - Sign up with GitHub account

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select the repository: `rx7-boop/app2`

3. **Configure the deployment**
   - Railway will automatically detect the Node.js server in the `/server` directory
   - Set the root directory to `/server`
   - Railway will use the `railway.json` configuration

4. **Set Environment Variables**
   Add these environment variables in Railway dashboard:
   ```
   MONGO_URI=mongodb+srv://mantaevert:mantaevert123@cluster0.i5x7ktk.mongodb.net/mantaevert-app?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Railway will provide you with a URL like: `https://your-app-name.railway.app`

## Step 2: Update Your Mobile App

Once deployed, update your mobile app's API configuration:

1. **Update .env.production file:**
   ```
   EXPO_PUBLIC_API_URL=https://your-railway-app-url.railway.app
   ```

2. **Update config/api.config.ts:**
   ```typescript
   const API_CONFIG = {
     development: {
       baseURL: 'http://localhost:5000',
     },
     production: {
       baseURL: 'https://your-railway-app-url.railway.app',
     }
   };
   ```

3. **Rebuild your Expo app:**
   ```bash
   cd d:\mantaevert-app\my-company-app
   npx expo start --clear
   ```

## Step 3: Test the Deployment

1. **Test the health endpoint:**
   ```
   https://your-railway-app-url.railway.app/health
   ```

2. **Test login with these accounts:**
   - Admin: `admin@test.com` / `admin123`
   - Worker: ID `12345` / `12345`

## Troubleshooting

- If deployment fails, check Railway logs
- Ensure MongoDB Atlas allows connections from Railway's IP ranges
- Verify all environment variables are set correctly
- Check that the health endpoint responds with status 200

## Alternative: Manual GitHub Upload

If git push fails due to network issues:

1. **Create a ZIP file of your project**
2. **Go to GitHub.com**
3. **Navigate to your repository: https://github.com/rx7-boop/app2**
4. **Upload files manually through the web interface**
5. **Then proceed with Railway deployment**