const fs = require('fs');
const path = require('path');

// 1. Load environment variables from frontend/.env file if present
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  try {
    require('dotenv').config({ path: envPath });
  } catch (e) {
    // fallback
  }
}

// 2. Read API_BASE_URL and NODE_ENV from environment variables (or fallback to defaults)
const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001/api';
const apiUrl = baseUrl.endsWith('/invoices') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/invoices`;
const isProd = process.env.NODE_ENV === 'production';

// Single environment file target
const targetPath = path.join(__dirname, '../src/environments/environment.ts');

const envContent = `// Auto-generated single environment file by scripts/set-env.js from .env
export const environment = {
  production: ${isProd},
  apiUrl: '${apiUrl}'
};
`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, envContent);

console.log(`✅ Single environment file generated at src/environments/environment.ts with apiUrl: "${apiUrl}"`);
