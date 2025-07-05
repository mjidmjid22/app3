const fs = require('fs');
const path = require('path');

// Get the Railway URL from command line argument
const railwayUrl = process.argv[2];

if (!railwayUrl) {
  console.error('❌ Please provide your Railway URL as an argument');
  console.log('Usage: node update-production-url.js https://your-app.railway.app');
  process.exit(1);
}

// Validate URL format
if (!railwayUrl.startsWith('https://') || !railwayUrl.includes('railway.app')) {
  console.error('❌ Invalid Railway URL format. Expected: https://your-app.railway.app');
  process.exit(1);
}

try {
  // Update .env.production
  const envProductionPath = path.join(__dirname, '.env.production');
  let envContent = fs.readFileSync(envProductionPath, 'utf8');
  envContent = envContent.replace(
    /EXPO_PUBLIC_API_URL=https:\/\/your-railway-app-url\.railway\.app/,
    `EXPO_PUBLIC_API_URL=${railwayUrl}`
  );
  fs.writeFileSync(envProductionPath, envContent);
  console.log('✅ Updated .env.production');

  // Update api.config.ts
  const apiConfigPath = path.join(__dirname, 'config', 'api.config.ts');
  let apiContent = fs.readFileSync(apiConfigPath, 'utf8');
  apiContent = apiContent.replace(
    /PRODUCTION_URL: process\.env\.EXPO_PUBLIC_API_URL \|\| '[^']+'/,
    `PRODUCTION_URL: process.env.EXPO_PUBLIC_API_URL || '${railwayUrl}'`
  );
  apiContent = apiContent.replace(
    /\? '[^']+'/,
    `? '${railwayUrl}'`
  );
  fs.writeFileSync(apiConfigPath, apiContent);
  console.log('✅ Updated config/api.config.ts');

  console.log('\n🎉 Production URL updated successfully!');
  console.log(`📡 API URL: ${railwayUrl}`);
  console.log('\nNext steps:');
  console.log('1. Restart your Expo development server: npx expo start --clear');
  console.log('2. Test the app with the new production API');
  console.log('3. Create test users by running: node server/create-test-users.js');

} catch (error) {
  console.error('❌ Error updating files:', error.message);
  process.exit(1);
}