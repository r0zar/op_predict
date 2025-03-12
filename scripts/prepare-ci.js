const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');

// Prepare package.json for CI
function preparePackageJson() {
  console.log('Preparing package.json for CI...');
  
  try {
    // Read current package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Replace linked dependencies with published versions
    if (packageJson.dependencies) {
      if (packageJson.dependencies['signet-sdk'] && packageJson.dependencies['signet-sdk'].includes('link:')) {
        console.log('Replacing linked signet-sdk with published version');
        packageJson.dependencies['signet-sdk'] = 'latest';
      }
      
      if (packageJson.dependencies['wisdom-sdk'] && packageJson.dependencies['wisdom-sdk'].includes('link:')) {
        console.log('Replacing linked wisdom-sdk with published version');
        packageJson.dependencies['wisdom-sdk'] = 'latest';
      }
    }
    
    // Remove pnpm section if it exists
    if (packageJson.pnpm) {
      console.log('Removing pnpm section from package.json');
      delete packageJson.pnpm;
    }
    
    // Write back to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json modified successfully for CI');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

preparePackageJson();