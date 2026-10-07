import readline from "readline";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

// Precomputed SHA-256 hashes of previous default/known keys (strictly blacklisted)
const BLACKLISTED_KEY_HASHES = new Set([
  "aa007f0624cb0bbbe2155790f4dc765ddc46df9de6cce019cf5ce77d3678a6a1",
  "e14b05c189b8e1f9c74acc45f65a1b445af82dc1c63b2e0231eb7a163717ceaa",
  "39d12776fdfba46e73475cff4df621f587d57228f68be0dc96e5832e31f1ff8d",
]);

/**
 * Prompts user for sensitive input without echoing keystrokes to terminal
 */
function promptHidden(questionText) {
  return new Promise((resolve) => {
    process.stdout.write(questionText);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    let input = "";
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      const onData = (chunk) => {
        const str = chunk.toString();
        for (const char of str) {
          if (char === "\r" || char === "\n") {
            process.stdin.removeListener("data", onData);
            process.stdin.setRawMode(false);
            process.stdout.write("\n");
            rl.close();
            resolve(input);
            return;
          } else if (char === "\u0003") {
            // Ctrl+C
            process.stdin.setRawMode(false);
            process.stdout.write("\nAborted.\n");
            process.exit(1);
          } else if (char === "\u0008" || char === "\x7f") {
            // Backspace
            input = input.slice(0, -1);
          } else {
            input += char;
          }
        }
      };
      process.stdin.on("data", onData);
    } else {
      // Non-TTY / scripted piped input support
      rl.question("", (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function verifyGitIgnored(filePath) {
  try {
    const out = execFileSync("git", ["check-ignore", filePath], { encoding: "utf-8" });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

export async function setAdminSecrets() {
  console.log("=================================================");
  console.log("       LOVEWRIT ADMIN SECRETS CONFIGURATION      ");
  console.log("=================================================");
  console.log("All input is masked. No secrets will be logged or echoed.\n");

  const envPath = path.resolve(process.cwd(), ".env");

  // 1. Verify that .env is gitignored
  const isIgnored = verifyGitIgnored(".env");
  if (!isIgnored) {
    console.error("❌ Refusing to write secrets: .env is not ignored by git.");
    process.exit(1);
  }

  // 2. Prompt for master key
  const key1 = (await promptHidden("Enter new admin master key (min 20 chars): ")).trim();

  if (key1.length < 20) {
    console.error("❌ Key too short: Admin master key must be at least 20 characters.");
    process.exit(1);
  }

  // 3. Blacklist verification
  const hash = crypto.createHash("sha256").update(key1).digest("hex");
  if (BLACKLISTED_KEY_HASHES.has(hash)) {
    console.error("❌ Key rejected: Matches a blacklisted legacy default value. Please choose a new unique key.");
    process.exit(1);
  }

  // 4. Prompt confirmation
  const key2 = (await promptHidden("Confirm admin master key: ")).trim();

  if (key1 !== key2) {
    console.error("❌ Confirmation mismatch: Keys do not match.");
    process.exit(1);
  }

  // 5. Generate cryptographically strong random ADMIN_SESSION_SECRET (32 bytes = 256 bits)
  const sessionSecret = crypto.randomBytes(32).toString("hex");

  // 6. Update or write to local .env
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const lines = envContent.split(/\r?\n/);
  const updatedLines = [];
  let foundKey = false;
  let foundSecret = false;

  for (const line of lines) {
    if (line.startsWith("ADMIN_MASTER_KEY=")) {
      updatedLines.push(`ADMIN_MASTER_KEY="${key1}"`);
      foundKey = true;
    } else if (line.startsWith("ADMIN_SESSION_SECRET=")) {
      updatedLines.push(`ADMIN_SESSION_SECRET="${sessionSecret}"`);
      foundSecret = true;
    } else {
      updatedLines.push(line);
    }
  }

  if (!foundKey) {
    updatedLines.push(`ADMIN_MASTER_KEY="${key1}"`);
  }
  if (!foundSecret) {
    updatedLines.push(`ADMIN_SESSION_SECRET="${sessionSecret}"`);
  }

  fs.writeFileSync(envPath, updatedLines.join("\n") + "\n", { encoding: "utf-8" });

  console.log("✅ Successfully generated ADMIN_SESSION_SECRET and saved owner ADMIN_MASTER_KEY to .env");
  console.log("   (Secrets are gitignored and never printed to console)");
}

// Auto-run if executed as script
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  setAdminSecrets().catch((err) => {
    console.error("Error setting admin secrets:", err.message);
    process.exit(1);
  });
}
