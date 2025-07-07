# 🚀 Complete Deployment Guide: GitHub → Vercel → Expo Build

## Part 1: Push to GitHub

### Step 1: Initialize Git (if not already done)
```bash
cd d:\mantaevert-app\my-company-app
git init
```

### Step 2: Create .gitignore
```bash
# Add to .gitignore
node_modules/
.env.local
.env
dist/
.vercel/
*.log
.expo/
```

### Step 3: Add and Commit Files
```bash
git add .
git commit -m "Initial commit - React Native app with backend"
```

### Step 4: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name: `mantaevert-app`
4. Make it **Private** (recommended)
5. Don't initialize with README (you already have files)
6. Click "Create Repository"

### Step 5: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/mantaevert-app.git
git branch -M main
git push -u origin main
```

## Part 2: Deploy Backend to Vercel

### Step 1: Navigate to Server Directory
```bash
cd d:\mantaevert-app\my-company-app\server
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Server
```bash
vercel --prod
```
- Project name: `mantaevert-api`
- Choose your account
- Don't link to existing project

### Step 4: Set Environment Variables
```bash
vercel env add MONGO_URI
```
Value: `mongodb+srv://manteauverte:T3rgElzTIdSG1SsT@cluster0.i5x7ktk.mongodb.net/mantaevert-production?retryWrites=true&w=majority&appName=Cluster0`

```bash
vercel env add PORT
```
Value: `5000`

### Step 5: Get Your API URL
After deployment, copy the URL (e.g., `https://mantaevert-api-xxx.vercel.app`)

## Part 3: Update App Configuration

### Step 1: Update API URL in App
```bash
cd d:\mantaevert-app\my-company-app
```

Edit `.env`:
```env
EXPO_PUBLIC_API_URL=https://your-vercel-url.vercel.app
EXPO_PUBLIC_APP_ENV=production
```

### Step 2: Test API Connection
```bash
curl https://your-vercel-url.vercel.app/health
```

## Part 4: Prepare for Expo Build

### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Update app.json/app.config.js
Make sure your app.json includes:
```json
{
  "expo": {
    "name": "Mantaevert App",
    "slug": "mantaevert-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.mantaevert"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.mantaevert"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Part 5: Build the App

### Step 1: Build for Android
```bash
eas build --platform android
```

### Step 2: Build for iOS (if you have Apple Developer account)
```bash
eas build --platform ios
```

### Step 3: Build for Both Platforms
```bash
eas build --platform all
```

## Part 6: Download and Install

### For Android:
1. After build completes, you'll get a download link
2. Download the `.apk` file
3. Install on Android device (enable "Install from unknown sources")

### For iOS:
1. You need Apple Developer account ($99/year)
2. Build will create `.ipa` file
3. Install via TestFlight or direct installation

## Part 7: Alternative - Expo Development Build

### Step 1: Create Development Build
```bash
eas build --profile development --platform android
```

### Step 2: Install Expo Dev Client
```bash
npx expo install expo-dev-client
```

### Step 3: Start Development Server
```bash
npx expo start --dev-client
```

## Part 8: Production Release

### Step 1: Build Production APK
```bash
eas build --profile production --platform android
```

### Step 2: Submit to Google Play Store
```bash
eas submit --platform android
```

### Step 3: Submit to Apple App Store
```bash
eas submit --platform ios
```

## Quick Commands Summary

```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy ready" && git push

# 2. Deploy Backend
cd server && vercel --prod

# 3. Build App
cd .. && eas build --platform android

# 4. Start Development
npx expo start
```

## Troubleshooting

### If build fails:
1. Check `eas.json` configuration
2. Verify all dependencies are compatible
3. Check Expo SDK version compatibility

### If API doesn't work:
1. Test Vercel deployment: `curl https://your-url.vercel.app/health`
2. Check environment variables in Vercel dashboard
3. Verify MongoDB connection

### If app crashes:
1. Check logs: `npx expo logs`
2. Test in Expo Go first: `npx expo start`
3. Verify all native dependencies are included

## Additional Files You May Need

### Create eas.json (if not exists)
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### Update package.json scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "build:all": "eas build --platform all"
  }
}
```