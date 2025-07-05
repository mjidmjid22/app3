# Deployment Guide

## Overview
This guide covers deploying the Mantaevert app to GitHub, Railway (backend), and Expo (mobile app).

## 🔧 Pre-deployment Setup

### 1. Environment Configuration
- **Production**: Uses `.env` file with Railway URL
- **Local Development**: Uses `.env.local` file with local IP
- **Test Users**: Created via `server/create-test-users.js`

### 2. Test Accounts
After deployment, create test accounts using:
```bash
# Admin: admin@test.com / admin123
# Worker: 12345 / 12345  
# Supervisor: 67890 / 67890
```

## 🚀 Deployment Steps

### Step 1: GitHub Deployment
```bash
# 1. Add all changes
git add .

# 2. Commit changes
git commit -m "Fix: Authentication system and environment configuration"

# 3. Push to GitHub
git push origin main
```

### Step 2: Railway Backend Deployment
1. **Railway will auto-deploy** from GitHub when you push
2. **Environment Variables** (already configured):
   - `MONGO_URI`: MongoDB connection string
   - `PORT`: 5000 (Railway will override this)

3. **Verify deployment**:
   - Check Railway dashboard for successful build
   - Test API endpoint: `https://app2-production-8eea.up.railway.app`

### Step 3: Expo App Deployment

#### For Development Testing:
```bash
# 1. Start Expo development server
npx expo start

# 2. Use Expo Go app to scan QR code
# 3. App will connect to Railway backend automatically
```

#### For Production Build:
```bash
# 1. Build for Android
npx expo build:android

# 2. Build for iOS (requires Apple Developer account)
npx expo build:ios

# 3. Or create development build
npx expo install expo-dev-client
npx expo run:android
```

## 🔍 Verification Checklist

### Backend (Railway)
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] API endpoints respond correctly
- [ ] Test user creation works

### Frontend (Expo)
- [ ] App loads without crashes
- [ ] Login screen appears
- [ ] Can login with test accounts
- [ ] Navigation works correctly

### Test Login Credentials
- **Admin**: `admin@test.com` / `admin123`
- **Worker**: `12345` / `12345`
- **Supervisor**: `67890` / `67890`

## 🛠️ Troubleshooting

### Common Issues:
1. **Network Error**: Check if Railway backend is running
2. **Invalid Credentials**: Ensure test users are created
3. **Build Errors**: Run `npm run build` in server directory
4. **Environment Issues**: Verify `.env` files are correct

### Debug Commands:
```bash
# Check server logs
railway logs

# Test API directly
curl https://app2-production-8eea.up.railway.app/users

# Create test users
node server/create-test-users.js
```

## 📱 App Store Deployment (Future)

### Android (Google Play)
1. Build APK: `npx expo build:android`
2. Sign APK with keystore
3. Upload to Google Play Console

### iOS (App Store)
1. Build IPA: `npx expo build:ios`
2. Upload to App Store Connect
3. Submit for review

## 🔐 Security Notes
- MongoDB credentials are in environment variables
- `.env.local` is gitignored for local development
- Production uses Railway environment variables
- Test accounts should be removed in production

## 📞 Support
If you encounter issues:
1. Check Railway logs for backend errors
2. Check Expo console for frontend errors
3. Verify environment variables are set correctly
4. Ensure MongoDB Atlas IP whitelist includes Railway IPs