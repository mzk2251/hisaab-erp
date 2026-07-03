import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');
const schemaPath = path.join(projectRoot, 'backend', 'prisma', 'schema.prisma');

console.log('--- Converting database config to SQLite ---');

// 1. Handle .env
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('Created .env from .env.example');
  } else {
    fs.writeFileSync(envPath, 'PORT=4000\nDATABASE_URL="file:./dev.db"\nJWT_SECRET=dev-secret-key-123\nJWT_EXPIRES_IN=7d\nNODE_ENV=development\nVITE_API_URL=http://localhost:4000/api\n');
    console.log('Created new .env file');
  }
}

let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/DATABASE_URL=["'].*?["']/g, 'DATABASE_URL="file:./dev.db"');
fs.writeFileSync(envPath, envContent);
console.log('Updated DATABASE_URL in .env to SQLite');

// 2. Handle schema.prisma
if (!fs.existsSync(schemaPath)) {
  console.error('Error: schema.prisma not found at ' + schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace datasource provider
schema = schema.replace(/provider\s*=\s*["']postgresql["']/g, 'provider = "sqlite"');
// Replace url to file directly or keep env
schema = schema.replace(/url\s*=\s*env\(\s*["']DATABASE_URL["']\s*\)/g, 'url = "file:./dev.db"');

// Strip out @db.Decimal(x, y) attributes
schema = schema.replace(/@db\.Decimal\([^)]*\)/g, '');
schema = schema.replace(/@db\.Decimal/g, '');

fs.writeFileSync(schemaPath, schema);
console.log('Updated schema.prisma to SQLite and removed @db.Decimal descriptors');

console.log('Database conversion to SQLite completed successfully!');
