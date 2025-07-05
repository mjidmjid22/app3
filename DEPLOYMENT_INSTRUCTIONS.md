# 🚀 Complete Deployment Instructions

## Step 1: Upload to GitHub

Since `git push` is having network issues, upload manually:

1. **Create a ZIP file of your project:**
   - Right-click on the `my-company-app` folder
   - Select "Send to" > "Compressed (zipped) folder"

2. **Upload to GitHub:**
   - Go to: https://github.com/rx7-boop/app2
   - Click "uploading an existing file" or drag and drop the ZIP
   - Extract and commit the files

## Step 2: Deploy to Railway

1. **Sign up/Login to Railway:**
   - Visit: https://railway.app
   - Sign up with your GitHub account

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `rx7-boop/app2`

3. **Configure Deployment:**
   - Set root directory to: `/server`
   - Railway will auto-detect Node.js

4. **Set Environment Variables:**
   In Railway dashboard, add these variables:
   ```
   MONGO_URI=mongodb+srv://mantaevert:mantaevert123@cluster0.i5x7ktk.mongodb.net/mantaevert-app?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for completion
   - Copy your Railway URL (e.g., `https://app2-production-xxxx.up.railway.app`)

## Step 3: Update Your App Configuration

1. **Update production URL:**
   ```bash
   cd d:\mantaevert-app\my-company-app
   node update-production-url.js https://your-actual-railway-url.railway.app
   ```

2. **Create test users:**
   ```bash
   cd d:\mantaevert-app\my-company-app\server
   node create-test-users.js
   ```

3. **Restart your app:**
   ```bash
   cd d:\mantaevert-app\my-company-app
   npx expo start --clear
   ```

## Step 4: Test Your App

1. **Test the API directly:**
   - Visit: `https://your-railway-url.railway.app/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test login in your app:**
   - **Admin:** Email: `admin@test.com`, Password: `admin123`
   - **Worker:** ID: `12345`, Password: `12345`

## Troubleshooting

### If Railway deployment fails:
- Check Railway logs in the dashboard
- Ensure MongoDB Atlas allows Railway IP ranges
- Verify environment variables are set correctly

### If app still shows "Network Error":
- Verify the Railway URL is correct in `.env.production`
- Clear Expo cache: `npx expo start --clear`
- Check if Railway service is running

### If login fails:
- Run the test user creation script
- Check MongoDB connection in Railway logs
- Verify API endpoints are responding

## Quick Commands Reference

```bash
# Update production URL
node update-production-url.js https://your-railway-url.railway.app

# Create test users
cd server && node create-test-users.js

# Restart Expo with clear cache
npx expo start --clear

# Test API health
curl https://your-railway-url.railway.app/health
```

## Files Created/Modified

- ✅ `server/railway.json` - Railway deployment config
- ✅ `server/create-test-users.js` - Script to create test users
- ✅ `update-production-url.js` - Script to update production URLs
- ✅ `server/src/index.ts` - Added health check endpoint
- ✅ `.env.production` - Updated with placeholder URL
- ✅ `config/api.config.ts` - Ready for production deployment

Your app is now ready for deployment! 🎉