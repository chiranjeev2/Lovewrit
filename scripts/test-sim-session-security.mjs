import { execSync } from 'child_process';
import path from 'path';

const tsScriptPath = path.resolve('scripts', 'test-sim-session-security.ts');

try {
  execSync(`npx tsx "${tsScriptPath}"`, { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
