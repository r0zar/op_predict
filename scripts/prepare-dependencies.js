const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');

// Get latest package version from npm
function getLatestVersion(packageName) {
  try {
    const result = execSync(`npm view ${packageName} version`, { encoding: 'utf8' }).trim();
    console.log(`Latest version of ${packageName}: ${result}`);
    return result;
  } catch (error) {
    console.warn(`Could not fetch latest version for ${packageName}, using 'latest' tag instead:`, error.message);
    return 'latest';
  }
}

// Prepare dependencies for deployment
function prepareDependencies() {
  try {
    console.log('Preparing dependencies for deployment...');
    
    // Read the current package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let modified = false;
    
    // Replace linked dependencies with published versions
    if (packageJson.dependencies) {
      if (packageJson.dependencies['signet-sdk'] && packageJson.dependencies['signet-sdk'].includes('link:')) {
        const version = getLatestVersion('signet-sdk');
        console.log(`Replacing linked signet-sdk with version ${version}`);
        packageJson.dependencies['signet-sdk'] = version;
        modified = true;
      }
      
      if (packageJson.dependencies['wisdom-sdk'] && packageJson.dependencies['wisdom-sdk'].includes('link:')) {
        const version = getLatestVersion('wisdom-sdk');
        console.log(`Replacing linked wisdom-sdk with version ${version}`);
        packageJson.dependencies['wisdom-sdk'] = version;
        modified = true;
      }
    }
    
    // Remove pnpm overrides section if it exists
    if (packageJson.pnpm && packageJson.pnpm.overrides) {
      console.log('Removing pnpm.overrides section');
      delete packageJson.pnpm;
      modified = true;
    }
    
    if (modified) {
      // Write the modified package.json back to disk
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Dependencies prepared successfully for deployment');
    } else {
      console.log('No changes needed to package.json');
    }
    
  } catch (error) {
    console.error('Error preparing dependencies:', error);
    process.exit(1);
  }
}

// Run the function
prepareDependencies();