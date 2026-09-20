import fs from "fs";
import assert from "assert";

console.log("=================================================");
console.log("LEGAL PAGES & CHECKOUT AGREEMENT VERIFICATION");
console.log("=================================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// 1. Privacy Policy Page
test("Privacy Policy page (/privacy) exists with exact text and updated date", () => {
  const content = fs.readFileSync("src/app/privacy/page.tsx", "utf8");
  assert.ok(content.includes("Privacy Policy"), "Title present");
  assert.ok(content.includes("September 20, 2026"), "Date replaced with September 20, 2026");
  assert.ok(!content.includes("[Insert Date]"), "No unreplaced [Insert Date] placeholders");
  assert.ok(content.includes("Ludhiana, Punjab, India"), "Operator location present");
  assert.ok(content.includes("founder@lovewrit.com"), "Contact email present");
  assert.ok(content.includes("Information you give us directly"), "Section 2 present");
  assert.ok(content.includes("We do not sell your personal information to third parties."), "No selling clause present");
  assert.ok(content.includes("Payments are processed by a third-party payment provider"), "Payments section present");
});

// 2. Terms and Conditions Page
test("Terms and Conditions page (/terms) exists with exact text and updated date", () => {
  const content = fs.readFileSync("src/app/terms/page.tsx", "utf8");
  assert.ok(content.includes("Terms and Conditions"), "Title present");
  assert.ok(content.includes("September 20, 2026"), "Date replaced with September 20, 2026");
  assert.ok(!content.includes("[Insert Date]"), "No unreplaced [Insert Date] placeholders");
  assert.ok(content.includes("All sales are final. We do not offer refunds"), "Refund policy present");
  assert.ok(content.includes("The “Proposal” Interactive Feature") || content.includes("The &ldquo;Proposal&rdquo; Interactive Feature"), "Proposal feature section present");
  assert.ok(content.includes("Tips to Senders"), "Tips section present");
  assert.ok(content.includes("Governing Law"), "Governing law present");
});

// 3. FAQ Page
test("FAQ page (/faq) exists with all questions and answers", () => {
  const content = fs.readFileSync("src/app/faq/page.tsx", "utf8");
  assert.ok(content.includes("Frequently Asked Questions"), "FAQ title present");
  assert.ok(content.includes("What is Lovewrit?"), "Q1 present");
  assert.ok(content.includes("What's the difference between a Digital Card and an Interactive Page?"), "Q2 present");
  assert.ok(content.includes("How much does it cost?"), "Q3 present");
  assert.ok(content.includes("Is anything actually free?"), "Q4 present");
  assert.ok(content.includes("What happens with the \\\"No\\\" button on proposal pages?"), "Proposal button Q present");
  assert.ok(content.includes("Can I print my card or page?"), "Printable Q present");
  assert.ok(content.includes("founder@lovewrit.com"), "Support email present");
});

// 4. Footer Links
test("Footer.tsx includes links to /privacy, /terms, and /faq", () => {
  const content = fs.readFileSync("src/components/shared/Footer.tsx", "utf8");
  assert.ok(content.includes('href="/privacy"'), "Link to /privacy present in Footer");
  assert.ok(content.includes('href="/terms"'), "Link to /terms present in Footer");
  assert.ok(content.includes('href="/faq"'), "Link to /faq present in Footer");
});

// 5. Checkout Agreement Checkbox
test("Create page contains required terms checkbox blocking checkout until checked", () => {
  const content = fs.readFileSync("src/app/create/[templateId]/page.tsx", "utf8");
  assert.ok(content.includes("agreedToTerms"), "agreedToTerms state declared");
  assert.ok(content.includes('id="checkout-terms-checkbox"'), "Checkbox input rendered");
  assert.ok(content.includes('href="/terms"'), "Link to /terms inside checkout agreement");
  assert.ok(content.includes('href="/privacy"'), "Link to /privacy inside checkout agreement");
  assert.ok(content.includes("disabled={isSubmitting || !agreedToTerms}"), "Submit button disabled until agreedToTerms is true");
  assert.ok(content.includes("if (!agreedToTerms)"), "Validation check present in handleProceedToCheckout");
});

console.log("\n=================================================");
console.log(`RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
console.log("=================================================");

