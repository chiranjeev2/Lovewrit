import assert from "node:assert";
import { sanitizeGuestName, sanitizeText } from "../src/lib/sanitize.ts";

console.log("=== STARTING GUEST PERSONALIZATION & TEXT SANITIZATION SECURITY TEST ===");

let passed = 0;
let total = 0;

function checkEqual(actual, expected, message) {
  total++;
  assert.strictEqual(actual, expected, message);
  passed++;
}

// 1. Script injection test
const scriptInput = "<script>alert(1)</script>";
const cleanScript = sanitizeGuestName(scriptInput);
console.log(`[1] Script input: "${scriptInput}" => "${cleanScript}"`);
checkEqual(cleanScript, "", "Script tags must be stripped and leave empty string");

// 2. HTML / attribute breakout injection
const attrInput = '"><img src=x onerror=alert(1)>Test<div style="background:red">';
const cleanAttr = sanitizeGuestName(attrInput);
console.log(`[2] HTML injection: "${attrInput}" => "${cleanAttr}"`);
checkEqual(cleanAttr, "Test", "HTML tags and attributes must be stripped cleanly");

// 3. Emoji test
const emojiInput = "Priya & Raj ❤️✨🎉";
const cleanEmoji = sanitizeGuestName(emojiInput);
console.log(`[3] Emoji input: "${emojiInput}" => "${cleanEmoji}"`);
checkEqual(cleanEmoji, "Priya & Raj ❤️✨🎉", "Emojis must be preserved intact");

// 4. RTL Arabic / Hebrew test
const rtlInput = "مرحبا ضيفنا العزيز";
const cleanRtl = sanitizeGuestName(rtlInput);
console.log(`[4] RTL input: "${rtlInput}" => "${cleanRtl}"`);
checkEqual(cleanRtl, "مرحبا ضيفنا العزيز", "RTL Arabic text must be preserved intact");

// 5. Hindi & Punjabi text test
const hindiInput = "प्रिया शर्मा • सादर आमंत्रित";
const cleanHindi = sanitizeGuestName(hindiInput);
console.log(`[5] Hindi input: "${hindiInput}" => "${cleanHindi}"`);
checkEqual(cleanHindi, "प्रिया शर्मा • सादर आमंत्रित", "Hindi Devanagari text must be preserved");

const punjabiInput = "ਅਮਰਿੰਦਰ ਸਿੰਘ • ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ";
const cleanPunjabi = sanitizeGuestName(punjabiInput);
console.log(`[5b] Punjabi input: "${punjabiInput}" => "${cleanPunjabi}"`);
checkEqual(cleanPunjabi, "ਅਮਰਿੰਦਰ ਸਿੰਘ • ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ", "Punjabi Gurmukhi text must be preserved");

// 6. Whitespace-only test
const whitespaceInput = "   \t   \n   \r   ";
const cleanWhitespace = sanitizeGuestName(whitespaceInput);
console.log(`[6] Whitespace-only input => length: ${cleanWhitespace.length}`);
checkEqual(cleanWhitespace, "", "Whitespace-only input must result in empty string");

// 7. 5,000-character string capped at 60 characters
const longInput = "A".repeat(5000);
const cleanLong = sanitizeGuestName(longInput, 60);
console.log(`[7] 5,000-character input => capped length: ${cleanLong.length}`);
checkEqual(cleanLong.length, 60, "Must be capped strictly at 60 characters");
checkEqual(cleanLong, "A".repeat(60), "Capped content must match exactly first 60 characters");

// 8. General text sanitization (letters, tributes, reasons, notes)
const rawLetter = "<h1>Happy Birthday!</h1><p>You mean the world to me.<script>bad()</script></p>   ";
const cleanLetter = sanitizeText(rawLetter, 1000);
console.log(`[8] General text sanitization: "${cleanLetter}"`);
checkEqual(cleanLetter, "Happy Birthday!You mean the world to me.", "All tags stripped while preserving text");

console.log(`\n✅ ALL GUEST & TEXT SANITIZATION SECURITY ASSERTIONS PASSED GREEN! (${passed} / ${total} assertions verified)`);

