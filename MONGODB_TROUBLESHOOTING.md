# MongoDB Connection Troubleshooting

## Current Error
```
MongoNetworkError: connect ETIMEDOUT 65.62.17.239:27017
```

## Fixes Applied
1. ✅ Increased serverSelectionTimeoutMS to 30 seconds
2. ✅ Added proper connection options
3. ✅ Removed process.exit() to prevent server crash

## Additional Steps to Try

### 1. Check MongoDB Atlas Network Access
- Go to MongoDB Atlas Dashboard
- Navigate to "Network Access"
- Add your IP address or use 0.0.0.0/0 for all IPs

### 2. Alternative Connection String
Try this format if current one fails:
```
mongodb+srv://manteauverte:T3rgElzTIdSG1SsT@cluster0.i5x7ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Test Connection
```bash
node test-mongo.js
```

### 4. Check Firewall/VPN
- Disable VPN if using one
- Check Windows Firewall settings
- Try from different network

### 5. MongoDB Atlas Cluster Status
- Check if cluster is paused
- Verify cluster is in active state
- Check cluster region

## If All Else Fails
Use local MongoDB for development:
1. Install MongoDB locally
2. Update MONGO_URI to: `mongodb://localhost:27017/mantaevert-local`
3. Deploy to Vercel with Atlas URI