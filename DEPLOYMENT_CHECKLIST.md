# 📋 Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Ready
- [x] MongoDB connection fixed
- [x] Vercel configuration ready
- [x] API routes working locally
- [x] Environment variables prepared

### Frontend Ready  
- [x] app.json configured
- [x] EAS project ID exists
- [x] Package bundle identifiers set
- [x] App icons and splash screen ready

## 🚀 Step-by-Step Execution

### 1. GitHub Setup (5 minutes)
```bash
cd d:\mantaevert-app\my-company-app
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/mantaevert-app.git
git push -u origin main
```

### 2. Deploy Backend (10 minutes)
```bash
cd server
vercel login
vercel --prod
vercel env add MONGO_URI
# Paste: mongodb+srv://manteauverte:T3rgElzTIdSG1SsT@cluster0.i5x7ktk.mongodb.net/mantaevert-production?retryWrites=true&w=majority&appName=Cluster0
vercel env add PORT
# Enter: 5000
```

### 3. Update App Config (2 minutes)
```bash
cd ..
# Edit .env file with new Vercel URL
```

### 4. Test API (1 minute)
```bash
curl https://your-vercel-url.vercel.app/health
```

### 5. Build App (15-30 minutes)
```bash
npm install -g @expo/eas-cli
eas login
eas build --platform android
```

## 📱 Expected Results

### After Backend Deployment:
- ✅ Vercel URL working
- ✅ /health endpoint returns OK
- ✅ MongoDB connected

### After App Build:
- ✅ APK file download link
- ✅ Installable on Android devices
- ✅ Login working with production API

## 🔧 Quick Fixes

### If Vercel deployment fails:
```bash
vercel logs
vercel env ls
```

### If build fails:
```bash
eas build:list
npx expo doctor
```

### If login doesn't work:
1. Check API URL in .env
2. Test API endpoints manually
3. Check MongoDB Atlas network access

## 📞 Final Test Steps

1. **Install APK on phone**
2. **Test worker login** (ID card number only)
3. **Test admin login** (email + password)
4. **Check data loading** (workers, receipts, etc.)
5. **Test offline behavior**

## 🎯 Success Criteria

- [ ] Backend deployed and accessible
- [ ] APK builds successfully  
- [ ] App installs on device
- [ ] Login works for both user types
- [ ] Data loads from production database
- [ ] No crashes on main features

## 📋 Post-Deployment

### For Production Release:
1. Test thoroughly on multiple devices
2. Create app store listings
3. Submit to Google Play Store
4. Set up analytics and crash reporting
5. Plan update strategy

### For Internal Use:
1. Share APK with team
2. Document user guide
3. Set up backup procedures
4. Monitor server performance