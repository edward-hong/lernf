/**
 * Validates that required environment variables are set before build.
 * Run this before deploying to catch configuration issues early.
 */

const requiredEnvVars = ['VITE_API_URL'];

const missing = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these in your .env file or Vercel dashboard.');
  process.exit(1);
}

console.log('All required environment variables are set');
console.log('\nCurrent configuration:');
requiredEnvVars.forEach((varName) => {
  console.log(`   ${varName}=${process.env[varName]}`);
});
