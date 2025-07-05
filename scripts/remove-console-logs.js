const fs = require('fs');
const path = require('path');

function removeConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      removeConsoleLogs(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove console.log statements but keep console.error and console.warn
      content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
      
      fs.writeFileSync(filePath, content);
      }
  });
}

// Run the cleanup
const projectDir = path.join(__dirname, '..');
removeConsoleLogs(projectDir);
