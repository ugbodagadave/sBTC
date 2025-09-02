const fs = require('fs');
const path = require('path');

console.log('Running simple tests for sBTCPay Widget...\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Check if dist files exist
totalTests++;
try {
  const widgetFile = fs.existsSync(path.join(__dirname, 'dist', 'widget.min.js'));
  const paymentLinksFile = fs.existsSync(path.join(__dirname, 'dist', 'payment-links.min.js'));
  const indexFile = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
  
  if (widgetFile && paymentLinksFile && indexFile) {
    console.log('✓ All distribution files exist');
    passedTests++;
  } else {
    console.error('✗ Some distribution files are missing');
    console.log('  widget.min.js:', widgetFile);
    console.log('  payment-links.min.js:', paymentLinksFile);
    console.log('  index.html:', indexFile);
  }
} catch (error) {
  console.error('✗ Error checking distribution files:', error.message);
}

// Test 2: Check file sizes
totalTests++;
try {
  const widgetStats = fs.statSync(path.join(__dirname, 'dist', 'widget.min.js'));
  const paymentLinksStats = fs.statSync(path.join(__dirname, 'dist', 'payment-links.min.js'));
  
  if (widgetStats.size > 0 && paymentLinksStats.size > 0) {
    console.log('✓ Distribution files have content');
    console.log(`  widget.min.js: ${widgetStats.size} bytes`);
    console.log(`  payment-links.min.js: ${paymentLinksStats.size} bytes`);
    passedTests++;
  } else {
    console.error('✗ Distribution files are empty');
  }
} catch (error) {
  console.error('✗ Error checking file sizes:', error.message);
}

// Test 3: Check source files
totalTests++;
try {
  const sourceFiles = [
    'src/widget.js',
    'src/payment-links.js',
    'src/widget.html',
    'src/payment-links.html'
  ];
  
  let allExist = true;
  for (const file of sourceFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    if (!exists) {
      console.error(`✗ Source file missing: ${file}`);
      allExist = false;
    }
  }
  
  if (allExist) {
    console.log('✓ All source files exist');
    passedTests++;
  }
} catch (error) {
  console.error('✗ Error checking source files:', error.message);
}

// Test 4: Check configuration files
totalTests++;
try {
  const configFiles = [
    'package.json',
    'webpack.config.js'
  ];
  
  let allExist = true;
  for (const file of configFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    if (!exists) {
      console.error(`✗ Configuration file missing: ${file}`);
      allExist = false;
    }
  }
  
  if (allExist) {
    console.log('✓ All configuration files exist');
    passedTests++;
  }
} catch (error) {
  console.error('✗ Error checking configuration files:', error.message);
}

console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! The build was successful and all files are in place.');
} else {
  console.log('❌ Some tests failed. Please check the issues above.');
}