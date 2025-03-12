const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');

// Prepare dependencies for deployment
function prepareDependencies() {
  try {
    console.log('Preparing dependencies for deployment...');
    
    // Read the current package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
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
    
    // Remove pnpm overrides section if it exists and contains our linked packages
    if (packageJson.pnpm && packageJson.pnpm.overrides) {
      const overrides = packageJson.pnpm.overrides;
      
      if (overrides['signet-sdk'] && overrides['signet-sdk'].includes('link:')) {
        console.log('Removing signet-sdk from pnpm overrides');
        delete overrides['signet-sdk'];
      }
      
      // If overrides is now empty, remove the entire pnpm section
      if (Object.keys(overrides).length === 0) {
        console.log('Removing empty pnpm.overrides section');
        delete packageJson.pnpm;
      }
    }
    
    // Write the modified package.json back to disk
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Dependencies prepared successfully for deployment');
    
  } catch (error) {
    console.error('Error preparing dependencies:', error);
    process.exit(1);
  }
}

// Run the function
prepareDependencies();