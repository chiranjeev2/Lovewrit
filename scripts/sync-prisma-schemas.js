const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SQLITE_SCHEMA_PATH = path.resolve(__dirname, '..', 'prisma', 'schema.sqlite.prisma');
const POSTGRES_SCHEMA_PATH = path.resolve(__dirname, '..', 'prisma', 'schema.postgresql.prisma');
const ACTIVE_SCHEMA_PATH = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');

function parseModelsAndEnums(schemaContent) {
  const lines = schemaContent.split('\n');
  const blocks = {};
  let currentBlockName = null;
  let currentBlockLines = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('model ') || line.startsWith('enum ')) {
      currentBlockName = line.split(/\s+/)[1];
      currentBlockLines = [];
    } else if (line === '}' && currentBlockName) {
      // Normalize lines: remove comments, normalize spaces
      const normalizedLines = currentBlockLines
        .map((l) => l.split('//')[0].trim())
        .filter((l) => l.length > 0)
        .sort(); // sort lines within model for deterministic comparison
      blocks[currentBlockName] = normalizedLines;
      currentBlockName = null;
    } else if (currentBlockName) {
      currentBlockLines.push(line);
    }
  }

  return blocks;
}

function verifyNoDrift() {
  if (!fs.existsSync(SQLITE_SCHEMA_PATH) || !fs.existsSync(POSTGRES_SCHEMA_PATH)) {
    throw new Error('Both schema.sqlite.prisma and schema.postgresql.prisma must exist');
  }

  const sqliteContent = fs.readFileSync(SQLITE_SCHEMA_PATH, 'utf8');
  const postgresContent = fs.readFileSync(POSTGRES_SCHEMA_PATH, 'utf8');

  const sqliteBlocks = parseModelsAndEnums(sqliteContent);
  const postgresBlocks = parseModelsAndEnums(postgresContent);

  const sqliteModelNames = Object.keys(sqliteBlocks).sort();
  const postgresModelNames = Object.keys(postgresBlocks).sort();

  // 1. Model count and names
  if (JSON.stringify(sqliteModelNames) !== JSON.stringify(postgresModelNames)) {
    throw new Error(
      `Model mismatch between SQLite and PostgreSQL schemas:\nSQLite: ${sqliteModelNames.join(', ')}\nPostgreSQL: ${postgresModelNames.join(', ')}`
    );
  }

  // 2. Model fields and attributes
  for (const modelName of sqliteModelNames) {
    const sLines = sqliteBlocks[modelName];
    const pLines = postgresBlocks[modelName];

    if (JSON.stringify(sLines) !== JSON.stringify(pLines)) {
      const sOnly = sLines.filter((x) => !pLines.includes(x));
      const pOnly = pLines.filter((x) => !sLines.includes(x));
      throw new Error(
        `Drift detected in model "${modelName}":\nSQLite only: ${sOnly.join('; ')}\nPostgres only: ${pOnly.join('; ')}`
      );
    }
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);
  const useArg = args.find((a) => a.startsWith('--use='));

  if (useArg) {
    const target = useArg.split('=')[1].toLowerCase().trim();
    if (target === 'postgres' || target === 'postgresql') {
      verifyNoDrift();
      fs.copyFileSync(POSTGRES_SCHEMA_PATH, ACTIVE_SCHEMA_PATH);
      console.log('Switched prisma/schema.prisma to PostgreSQL provider.');
      execSync('npx prisma generate', { stdio: 'inherit' });
    } else if (target === 'sqlite') {
      verifyNoDrift();
      fs.copyFileSync(SQLITE_SCHEMA_PATH, ACTIVE_SCHEMA_PATH);
      console.log('Switched prisma/schema.prisma to SQLite provider.');
      execSync('npx prisma generate', { stdio: 'inherit' });
    } else {
      console.error(`Unknown target provider: ${target}. Use --use=postgres or --use=sqlite`);
      process.exit(1);
    }
    return;
  }

  // Drift check mode
  try {
    verifyNoDrift();
    console.log('✓ Zero drift between SQLite and PostgreSQL schemas (models, fields, indexes and relations match 100%).');
  } catch (err) {
    console.error('❌ Schema drift detected:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyNoDrift, parseModelsAndEnums };
