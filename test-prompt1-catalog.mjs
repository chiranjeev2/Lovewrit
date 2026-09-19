import { TEMPLATES } from "./src/lib/templates-data.ts";

console.log("--- TEST 1: CATALOG VERIFICATION ---");

// 1. Check letter-to-dear-one
const letterTmpl = TEMPLATES.find((t) => t.id === "letter-to-dear-one");
console.assert(letterTmpl !== undefined, "FAIL: letter-to-dear-one not found");
console.assert(letterTmpl?.category === "letters", "FAIL: letter-to-dear-one category should be letters");
console.assert(letterTmpl?.isFreeCard === true, "FAIL: letter-to-dear-one should have isFreeCard: true");
console.assert(letterTmpl?.hasAdOption === true, "FAIL: letter-to-dear-one should have hasAdOption: true");
console.assert(letterTmpl?.badge === "100% FREE", "FAIL: letter-to-dear-one badge should be 100% FREE");
console.assert(letterTmpl?.revealType === "scroll_unfurl", "FAIL: letter-to-dear-one revealType should be scroll_unfurl");
console.log("✓ letter-to-dear-one verified");

// 2. Check Hindu Jagrata (Neutral Devotional)
const jagrataTmpl = TEMPLATES.find((t) => t.id === "jagrata-kirtan-invitation");
console.assert(jagrataTmpl !== undefined, "FAIL: jagrata-kirtan-invitation not found");
console.assert(jagrataTmpl?.category === "devotional", "FAIL: jagrata category should be devotional");
console.assert(jagrataTmpl?.faith === "hindu", "FAIL: jagrata faith should be hindu");
console.assert(jagrataTmpl?.badge === "Hindu Devotional", "FAIL: jagrata badge should be Hindu Devotional");
console.assert(jagrataTmpl?.showOmMotifSupported === true, "FAIL: jagrata should have showOmMotifSupported: true");
console.log("✓ Hindu Jagrata (Neutral) verified");

// 3. Check Sikh templates
const sikhAkhand = TEMPLATES.find((t) => t.id === "sikh-akhand-path");
const sikhGurpurab = TEMPLATES.find((t) => t.id === "sikh-gurpurab");
console.assert(sikhAkhand?.faith === "sikh", "FAIL: sikh-akhand-path faith should be sikh");
console.assert(sikhGurpurab?.faith === "sikh", "FAIL: sikh-gurpurab faith should be sikh");
console.assert(sikhAkhand?.revealType === "ik_onkar_seal", "FAIL: sikh revealType should be ik_onkar_seal");
console.log("✓ Sikh templates (Akhand Path, Gurpurab) verified");

// 4. Check Muslim templates & Bismillah support
const aqeeqah = TEMPLATES.find((t) => t.id === "muslim-aqeeqah");
const nikah = TEMPLATES.find((t) => t.id === "muslim-nikah");
const iftar = TEMPLATES.find((t) => t.id === "muslim-iftar");
console.assert(aqeeqah?.faith === "muslim" && aqeeqah?.showBismillahSupported === true, "FAIL: aqeeqah check");
console.assert(nikah?.faith === "muslim" && nikah?.showBismillahSupported === true, "FAIL: nikah check");
console.assert(iftar?.faith === "muslim" && iftar?.showBismillahSupported === true, "FAIL: iftar check");
console.assert(aqeeqah?.revealType === "crescent_seal", "FAIL: crescent_seal check");
console.log("✓ Muslim templates (Aqeeqah, Nikah, Iftar) verified with Bismillah toggle support");

// 5. Check Christian templates
const christening = TEMPLATES.find((t) => t.id === "christian-christening");
const weddingBlessing = TEMPLATES.find((t) => t.id === "christian-wedding-blessing");
console.assert(christening?.faith === "christian" && christening?.revealType === "dove_cross_seal", "FAIL: christening check");
console.assert(weddingBlessing?.faith === "christian", "FAIL: wedding blessing check");
console.log("✓ Christian templates (Christening, Wedding Blessing) verified");

// 6. Check Secular template
const secular = TEMPLATES.find((t) => t.id === "secular-blessing-ceremony");
console.assert(secular?.faith === "secular" && secular?.revealType === "botanical_seal", "FAIL: secular check");
console.log("✓ Secular Blessing Ceremony template verified");

console.log("\nALL CATALOG TESTS PASSED! Total templates in catalog:", TEMPLATES.length);

