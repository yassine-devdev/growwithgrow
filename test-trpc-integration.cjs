// Simple test to verify tRPC integration works
console.log('🧪 Testing tRPC Integration...');

// Test 1: Check if files exist and are readable
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'services/trpc/client.ts',
  'services/trpc/Provider.tsx',
  'services/config.ts',
  'types/app-router.ts'
];

console.log('📁 Checking tRPC files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check if TypeScript compilation works
console.log('\n🔧 Testing TypeScript compilation...');
const { execSync } = require('child_process');

try {
  execSync('npx tsc --noEmit --project tsconfig.trpc.json --skipLibCheck', { 
    stdio: 'pipe',
    timeout: 30000 
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.error(error.stdout?.toString() || error.message);
  allFilesExist = false;
}

// Test 3: Check package.json dependencies
console.log('\n📦 Checking tRPC dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredDeps = [
  '@trpc/client',
  '@trpc/react-query', 
  '@tanstack/react-query',
  'zod'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allFilesExist = false;
  }
});

// Test 4: Check environment configuration
console.log('\n🌍 Checking environment setup...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'VITE_TRPC_HTTP_URL',
    'VITE_TRPC_WS_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`✅ ${varName} configured`);
    } else {
      console.log(`❌ ${varName} - MISSING`);
    }
  });
} else {
  console.log('❌ .env.example file missing');
}

// Final result
console.log('\n📊 tRPC Integration Test Results:');
console.log('===================================');

if (allFilesExist) {
  console.log('🎉 ✅ ALL TESTS PASSED!');
  console.log('');
  console.log('🚀 tRPC integration is ready for use!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Copy .env.example to .env and configure your URLs');
  console.log('2. Start your backend server');
  console.log('3. Use tRPC hooks in your React components');
  console.log('');
  console.log('Example usage:');
  console.log('```tsx');
  console.log('import { trpc } from \"./services/trpc/client\";');
  console.log('');
  console.log('function MyComponent() {');
  console.log('  const { data, isLoading } = trpc.dashboard.getStats.useQuery();');
  console.log('  return <div>{data?.totalUsers}</div>;');
  console.log('}');
  console.log('```');
} else {
  console.log('❌ Some tests failed. Please review the issues above.');
}

process.exit(allFilesExist ? 0 : 1);