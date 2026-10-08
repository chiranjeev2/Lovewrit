import { execSync } from 'child_process';
import path from 'path';

const tsScriptPath = path.resolve('scripts', 'test-sim-session-security.ts');

try {
  const output = execSync(`npx tsx "${tsScriptPath}"`, { encoding: 'utf-8' });
  process.stdout.write(output);
} catch (err) {
  if (err.stdout) process.stdout.write(err.stdout.toString());
  if (err.stderr) process.stderr.write(err.stderr.toString());
  process.exit(1);
}

