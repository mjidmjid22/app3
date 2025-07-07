# Vercel Deployment Steps

## ✅ Pre-Deployment Checklist
- [x] vercel.json configured
- [x] api/index.ts exists and properly exports
- [x] Environment variables ready
- [x] Dependencies installed

## Step-by-Step Deployment

### 1. Navigate to Server Directory
```bash
cd d:\mantaevert-app\my-company-app\server
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Initialize and Deploy
```bash
vercel
```
Answer prompts:
- Set up and deploy? → **Y**
- Which scope? → **Your account**
- Link to existing project? → **N**
- Project name? → **mantaevert-api**
- Directory? → **Press Enter**
- Override settings? → **N**

### 4. Set Environment Variables
```bash
vercel env add MONGO_URI
```
Value: `mongodb+srv://manteauverte:T3rgElzTIdSG1SsT@cluster0.i5x7ktk.mongodb.net/mantaevert-production?retryWrites=true&w=majority&appName=Cluster0`
Environment: **Production**

```bash
vercel env add PORT
```
Value: `5000`
Environment: **Production**

### 5. Deploy to Production
```bash
vercel --prod
```

### 6. Test Deployment
```bash
curl https://your-new-url.vercel.app/health
```

### 7. Update App Configuration
Update `d:\mantaevert-app\my-company-app\.env`:
```env
EXPO_PUBLIC_API_URL=https://your-new-url.vercel.app
EXPO_PUBLIC_APP_ENV=production
```

### 8. Test Login
- Restart your React Native app
- Test both admin and worker login

## Troubleshooting

### If deployment fails:
1. Check vercel logs: `vercel logs`
2. Verify environment variables: `vercel env ls`
3. Check function logs in Vercel dashboard

### If API returns errors:
1. Check MongoDB connection
2. Verify environment variables are set
3. Check function timeout (currently set to 30s)

### If authentication page appears:
- Make sure you're accessing the correct URL
- Verify the deployment completed successfully
- Check Vercel dashboard for any security settings