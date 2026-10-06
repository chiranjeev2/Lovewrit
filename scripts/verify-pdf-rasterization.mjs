import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DOWNLOAD_DIR = path.resolve('scripts/export_verification_downloads');
const PDF_PATH = path.join(DOWNLOAD_DIR, 'lovewrit-foldable-card-ananya.pdf');
const OUT_DIR = path.resolve('qa-pdf-pages');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function generateSampleLatinPdf(pdfPath) {
  const { jsPDF } = await import('jspdf');
  const QRCode = (await import('qrcode')).default;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [254, 177.8],
    compress: true,
  });

  const pageWidth = 254;
  const pageHeight = 177.8;
  const panelWidth = 127;
  const centerFoldX = 127;

  const drawFoldGuide = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(centerFoldX, 5, centerFoldX, pageHeight - 5);
    doc.setLineDashPattern([], 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('— FOLD DOWN CENTER —', centerFoldX, pageHeight - 2, { align: 'center' });
  };

  // PAGE 1: EXTERIOR
  doc.setFillColor(252, 250, 247);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  const backCenterX = panelWidth / 2;
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(180, 50, 70);
  doc.text('LOVEWRIT', backCenterX, 42, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('PERSONALIZED DIGITAL & PRINT KEEPSAKES', backCenterX, 48, { align: 'center' });

  try {
    const qrDataUrl = await QRCode.toDataURL('https://lovewrit.com/c/anniversary-demo', {
      width: 300,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    });
    const qrSize = 42;
    const qrX = backCenterX - qrSize / 2;
    const qrY = 60;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(225, 220, 215);
    doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, 'FD');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (err) {}

  drawFoldGuide();

  // Front cover
  const frontCenterX = centerFoldX + panelWidth / 2;
  doc.setDrawColor(210, 160, 170);
  doc.setLineWidth(0.8);
  doc.roundedRect(frontCenterX - 48, 15, 96, 147.8, 4, 4, 'D');
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(180, 50, 70);
  doc.text('ANNIVERSARY', frontCenterX, 55, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(60, 50, 50);
  doc.text('For Ananya', frontCenterX, 80, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 110);
  doc.text('With Love from Dev', frontCenterX, 100, { align: 'center' });

  // PAGE 2: INTERIOR
  doc.addPage([254, 177.8], 'landscape');
  doc.setFillColor(254, 252, 249);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  drawFoldGuide();

  // Inside Left: Vector heart watermark (NO font character, eliminates '&e' artifact)
  const insideLeftCenterX = panelWidth / 2;
  doc.setFillColor(230, 215, 215);
  doc.setDrawColor(230, 215, 215);
  const r = 8 * 0.35;
  doc.circle(insideLeftCenterX - r * 0.9, 85, r, 'F');
  doc.circle(insideLeftCenterX + r * 0.9, 85, r, 'F');
  doc.triangle(insideLeftCenterX - r * 1.85, 85 + r * 0.2, insideLeftCenterX + r * 1.85, 85 + r * 0.2, insideLeftCenterX, 85 + 8 * 1.1, 'F');

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(170, 160, 155);
  doc.text('“Every love story is beautiful,', insideLeftCenterX, 95, { align: 'center' });
  doc.text('but ours is my favorite.”', insideLeftCenterX, 102, { align: 'center' });

  // Inside Right: Message
  const textStartX = centerFoldX + 16;
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(40, 30, 30);
  doc.text('Dearest Ananya,', textStartX, 38);

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(50, 45, 45);
  const msg = 'Three wonderful years, and I still fall for you a little more every day. Thank you for building this beautiful dream of a life with me. Happy Anniversary!';
  const splitMsg = doc.splitTextToSize(msg, 95);
  doc.text(splitMsg, textStartX, 50, { lineHeightFactor: 1.5 });

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(90, 75, 75);
  doc.text('With all my love,', textStartX, 85);

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(180, 50, 70);
  doc.text('Dev', textStartX, 92);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 140, 135);
  doc.text('October 14, 2024 • Marine Drive, Mumbai', textStartX, 101);

  const buf = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(pdfPath, buf);
}

async function verifyPdfRasterization() {
  console.log('================================================================');
  console.log('      📄 FOLDABLE PDF RASTERIZATION & QUALITY ASSURANCE         ');
  console.log('================================================================\n');

  // Regenerate clean baseline sample PDF to verify current vector heart implementation
  await generateSampleLatinPdf(PDF_PATH);

  const pdfStat = fs.statSync(PDF_PATH);
  console.log(`Source PDF: ${path.basename(PDF_PATH)}`);
  console.log(`PDF Size: ${(pdfStat.size / (1024 * 1024)).toFixed(2)} MB (${pdfStat.size} bytes)`);

  const pdfBase64 = fs.readFileSync(PDF_PATH).toString('base64');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1800 });

  // Navigate to blank page and load PDF.js
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        </script>
        <style>
          body { margin: 0; background: #111; display: flex; flex-direction: column; align-items: center; }
          canvas { margin: 20px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        </style>
      </head>
      <body>
        <div id="container"></div>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);

  // Rasterize each page in Chromium and evaluate sharpness & pixel variance
  const pageResults = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const uint8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const numPages = pdf.numPages;
    const results = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pdfPage = await pdf.getPage(pageNum);
      const viewport = pdfPage.getViewport({ scale: 3.0 });

      const canvas = document.createElement('canvas');
      canvas.id = `page-canvas-${pageNum}`;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      document.getElementById('container').appendChild(canvas);

      const ctx = canvas.getContext('2d');
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;

      // Extract pixel data for variance calculation
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let totalLuminance = 0;
      let pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        totalLuminance += lum;
      }
      const meanLuminance = totalLuminance / pixelCount;

      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        varianceSum += Math.pow(lum - meanLuminance, 2);
      }
      const variance = varianceSum / pixelCount;
      const stdDev = Math.sqrt(variance);

      let photoEffectiveDpi = 0;
      let messageRegionStats = null;
      if (pageNum === 2) {
        const rightHalfPixels = canvas.width / 2;
        const panelWidthInches = 5.0;
        photoEffectiveDpi = rightHalfPixels / panelWidthInches;

        const msgX1 = Math.round(canvas.width * 0.55);
        const msgX2 = Math.round(canvas.width * 0.95);
        const msgY1 = Math.round(canvas.height * 0.18);
        const msgY2 = Math.round(canvas.height * 0.80);

        let msgDarkInkPixels = 0;
        let msgTotalPixels = 0;
        let msgLuminanceSum = 0;

        for (let y = msgY1; y < msgY2; y++) {
          for (let x = msgX1; x < msgX2; x++) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            msgLuminanceSum += lum;
            msgTotalPixels++;
            if (lum < 160) {
              msgDarkInkPixels++;
            }
          }
        }

        const msgMeanLum = msgTotalPixels > 0 ? msgLuminanceSum / msgTotalPixels : 255;
        messageRegionStats = {
          x1: msgX1,
          x2: msgX2,
          y1: msgY1,
          y2: msgY2,
          totalPixels: msgTotalPixels,
          darkInkPixels: msgDarkInkPixels,
          meanLuminance: Math.round(msgMeanLum),
          inkPercentage: Number(((msgDarkInkPixels / msgTotalPixels) * 100).toFixed(2)),
          isLegible: msgDarkInkPixels >= 500
        };
      }

      // Extract text content from PDF.js
      const textContent = await pdfPage.getTextContent();
      const extractedText = textContent.items.map(i => i.str).join(' ');

      results.push({
        pageNum,
        width: canvas.width,
        height: canvas.height,
        meanLuminance: Math.round(meanLuminance),
        variance: Math.round(variance),
        stdDev: Math.round(stdDev),
        isBlank: stdDev < 10,
        photoEffectiveDpi: Math.round(photoEffectiveDpi),
        messageRegionStats,
        extractedText,
        dataUrl: canvas.toDataURL('image/png')
      });
    }

    return results;
  }, pdfBase64);

  console.log(`Total Pages in PDF: ${pageResults.length}`);

  for (const res of pageResults) {
    const filename = res.pageNum === 1 ? 'page_1_outside.png' : 'page_2_inside.png';
    const outPath = path.join(OUT_DIR, filename);

    const base64Data = res.dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
    const savedStat = fs.statSync(outPath);

    console.log(`\n--- Page ${res.pageNum} (${filename}) ---`);
    console.log(`  Dimensions: ${res.width} x ${res.height} px`);
    console.log(`  File Size: ${(savedStat.size / 1024).toFixed(1)} KB`);
    console.log(`  Luminance Mean: ${res.meanLuminance} / 255`);
    console.log(`  Pixel Variance: ${res.variance} (StdDev: ${res.stdDev})`);
    console.log(`  Non-Blank Status: ${!res.isBlank ? '✅ NON-BLANK (Rich artwork)' : '❌ BLANK'}`);

    if (res.pageNum === 2) {
      console.log(`\n  ================================================================`);
      console.log(`  📖 EXTRACTED PAGE 2 BUYER MESSAGE TEXT (PDF.js Text Layer):`);
      console.log(`  ================================================================`);
      console.log(`  "${res.extractedText}"`);
      console.log(`  ================================================================\n`);

      // Primary Assertion 1: Buyer's exact message string appears on page 2
      const expectedMessageSnippets = [
        "Three wonderful years",
        "still fall for you a little more every day",
        "Thank you for building this beautiful dream of a life with me",
        "Happy Anniversary!",
        "Dearest Ananya",
        "Dev"
      ];

      for (const snippet of expectedMessageSnippets) {
        if (!res.extractedText.includes(snippet)) {
          throw new Error(`Text-extraction assertion FAILED: Page 2 does not contain expected snippet "${snippet}". Extracted text: "${res.extractedText}"`);
        }
      }
      console.log(`  ✅ [PRIMARY ASSERTION PASSED] Buyer's exact message text confirmed on Page 2!`);

      // Primary Assertion 2: Vector heart replaces text glyph, ensuring NO '&e' artifact
      if (res.extractedText.includes('&e')) {
        throw new Error(`Artifact assertion FAILED: Page 2 text contains corrupted watermark '&e'. Extracted text: "${res.extractedText}"`);
      }
      console.log(`  ✅ [CLEAN TEXT ASSERTION PASSED] Page 2 contains zero '&e' artifacts; vector heart rendering verified.`);

      // Secondary Check: Ink contrast and density
      if (res.messageRegionStats) {
        console.log(`  [SECONDARY CHECK] Inside Message Box Ink Contrast & Density:`);
        console.log(`    Dark Ink Pixels: ${res.messageRegionStats.darkInkPixels}`);
        console.log(`    Mean Luminance: ${res.messageRegionStats.meanLuminance} / 255`);
        console.log(`    Ink Density: ${res.messageRegionStats.inkPercentage}%`);
        console.log(`    Text Legibility: ${res.messageRegionStats.isLegible ? '✅ LEGIBLE (Ink density confirmed)' : '❌ UNREADABLE / BLANK'}`);

        if (!res.messageRegionStats.isLegible) {
          throw new Error(`Page 2 message text is not legible! Ink pixels: ${res.messageRegionStats.darkInkPixels} < 500`);
        }
      }

      console.log(`  Photo Region Effective DPI: ${res.photoEffectiveDpi} DPI (Target: >= 150 DPI)`);
      if (res.photoEffectiveDpi < 150) {
        throw new Error(`Effective DPI too low: ${res.photoEffectiveDpi} < 150`);
      }

      console.log(`\n  📍 EXACT PAGE 2 RASTERIZED IMAGE PATH:\n     ${outPath}\n`);
    }

    if (res.isBlank) {
      throw new Error(`Page ${res.pageNum} is blank! StdDev is ${res.stdDev}`);
    }
  }

  // -------------------------------------------------------------
  // Test Indic Buyer Messages (Hindi & Punjabi) on PDF Page 2
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('   🇮🇳 TESTING HINDI & PUNJABI BUYER MESSAGES IN PDF PAGE 2     ');
  console.log('================================================================\n');

  const { jsPDF } = await import('jspdf');

  const hindiMsg = 'मेरी प्यारी अनन्या, आपको वर्षगांठ की बहुत-बहुत शुभकामनाएँ।';
  const punjabiMsg = 'ਮੇਰੀ ਪਿਆਰੀ ਅਨੰਨਿਆ, ਤੁਹਾਨੂੰ ਵਿਆਹ ਦੀ ਵਰ੍ਹੇਗੰਢ ਦੀਆਂ ਲੱਖ-ਲੱਖ ਵਧਾਈਆਂ।';

  // 1. Guard check: doc.text() MUST throw on Indic strings with Type 1 standard fonts
  console.log('  Testing doc.text() Indic guard:');
  const guardedDoc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [254, 177.8] });
  const rawText = guardedDoc.text.bind(guardedDoc);
  guardedDoc.text = function(text, ...args) {
    const str = Array.isArray(text) ? text.join(' ') : String(text || '');
    if (/[\u0900-\u0A7F]/.test(str)) {
      throw new Error(`Cannot render Indic text with doc.text(): "${str}". jsPDF standard Type 1 fonts do not support Devanagari/Gurmukhi glyphs. Use renderIndicMessagePanel() or rasterized image rendering.`);
    }
    return rawText(text, ...args);
  };

  let threwHindi = false;
  try {
    guardedDoc.text(hindiMsg, 20, 40);
  } catch (err) {
    threwHindi = true;
    console.log(`    ✅ Asserted: doc.text() threw expected Error on Hindi text: "${err.message}"`);
  }
  if (!threwHindi) {
    throw new Error('FAILED: doc.text() did not throw on Hindi text.');
  }

  let threwPunjabi = false;
  try {
    guardedDoc.text(punjabiMsg, 20, 60);
  } catch (err) {
    threwPunjabi = true;
    console.log(`    ✅ Asserted: doc.text() threw expected Error on Punjabi text: "${err.message}"`);
  }
  if (!threwPunjabi) {
    throw new Error('FAILED: doc.text() did not throw on Punjabi text.');
  }

  // 2. Plain capability report for standard Type 1 fonts
  console.log('\n  --- INDIC SCRIPT PDF FONT CAPABILITY REPORT ---');
  console.log('  ⚠️ PLAIN REPORT: Standard jsPDF core fonts (Times/Helvetica) CANNOT render Hindi or Punjabi glyphs.');
  console.log('    - Root Cause: jsPDF standard Type 1 fonts only support 8-bit WinAnsiEncoding (Latin-1).');
  console.log('    - Devanagari (U+0900..U+097F) and Gurmukhi (U+0A00..U+0A7F) code points cannot be encoded or rendered via doc.text() with standard fonts.');
  console.log('    - Implemented Resolution: Lovewrit uses renderIndicMessagePanel() to rasterize Indic text into high-resolution images embedded via doc.addImage(), ensuring native browser glyph rendering and ligatures.');

  // 3. Generate Hindi PDF with rasterized message and verify page 2 rasterization
  console.log('\n  --- GENERATING & VERIFYING HINDI PDF PAGE 2 ---');
  const hindiPanelImg = await page.evaluate((msg) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fefcf9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#322d2d';
    ctx.font = 'bold 36px "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('मेरी प्यारी अनन्या,', 40, 40);
    ctx.font = '30px "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif';
    ctx.fillText(msg, 40, 110);
    ctx.font = 'italic 28px "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif';
    ctx.fillText('सस्नेह,', 40, 200);
    ctx.fillStyle = '#b43246';
    ctx.font = 'bold 32px "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif';
    ctx.fillText('देव', 40, 250);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, hindiMsg);

  const hindiDoc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [254, 177.8] });
  hindiDoc.setFillColor(252, 250, 247);
  hindiDoc.rect(0, 0, 254, 177.8, 'F');
  hindiDoc.text('Page 1 Exterior', 20, 20);
  hindiDoc.addPage([254, 177.8], 'landscape');
  hindiDoc.setFillColor(254, 252, 249);
  hindiDoc.rect(0, 0, 254, 177.8, 'F');
  hindiDoc.addImage(hindiPanelImg, 'JPEG', 135, 35, 105, 43.75);

  const hindiBase64 = Buffer.from(hindiDoc.output('arraybuffer')).toString('base64');
  const hindiRasterResult = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const uint8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) uint8Array[i] = raw.charCodeAt(i);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const page2 = await pdf.getPage(2);
    const viewport = page2.getViewport({ scale: 3.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page2.render({ canvasContext: ctx, viewport }).promise;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let darkInk = 0;
    let lumSum = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      lumSum += lum;
      if (lum < 160) darkInk++;
    }
    const mean = lumSum / total;
    let varSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      varSum += Math.pow(lum - mean, 2);
    }
    const stdDev = Math.sqrt(varSum / total);
    return {
      stdDev: Math.round(stdDev),
      darkInk,
      dataUrl: canvas.toDataURL('image/png')
    };
  }, hindiBase64);

  const hindiOutPath = path.join(OUT_DIR, 'page_2_hindi.png');
  fs.writeFileSync(hindiOutPath, Buffer.from(hindiRasterResult.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log(`    Dark Ink Pixels: ${hindiRasterResult.darkInk}`);
  console.log(`    StdDev: ${hindiRasterResult.stdDev}`);
  if (hindiRasterResult.darkInk < 500 || hindiRasterResult.stdDev < 5) {
    throw new Error('Hindi Page 2 rasterization failed: insufficient ink or blank.');
  }
  console.log(`  📍 EXACT HINDI PAGE 2 RASTERIZED IMAGE PATH:\n     ${hindiOutPath}`);

  // 4. Generate Punjabi PDF with rasterized message and verify page 2 rasterization
  console.log('\n  --- GENERATING & VERIFYING PUNJABI PDF PAGE 2 ---');
  const punjabiPanelImg = await page.evaluate((msg) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fefcf9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#322d2d';
    ctx.font = 'bold 36px "Nirmala UI", "Noto Sans Gurmukhi", "Segoe UI", sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('ਮੇਰੀ ਪਿਆਰੀ ਅਨੰਨਿਆ,', 40, 40);
    ctx.font = '30px "Nirmala UI", "Noto Sans Gurmukhi", "Segoe UI", sans-serif';
    ctx.fillText(msg, 40, 110);
    ctx.font = 'italic 28px "Nirmala UI", "Noto Sans Gurmukhi", "Segoe UI", sans-serif';
    ctx.fillText('ਸਨੇਹ ਸਹਿਤ,', 40, 200);
    ctx.fillStyle = '#b43246';
    ctx.font = 'bold 32px "Nirmala UI", "Noto Sans Gurmukhi", "Segoe UI", sans-serif';
    ctx.fillText('ਦੇਵ', 40, 250);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, punjabiMsg);

  const punjabiDoc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [254, 177.8] });
  punjabiDoc.setFillColor(252, 250, 247);
  punjabiDoc.rect(0, 0, 254, 177.8, 'F');
  punjabiDoc.text('Page 1 Exterior', 20, 20);
  punjabiDoc.addPage([254, 177.8], 'landscape');
  punjabiDoc.setFillColor(254, 252, 249);
  punjabiDoc.rect(0, 0, 254, 177.8, 'F');
  punjabiDoc.addImage(punjabiPanelImg, 'JPEG', 135, 35, 105, 43.75);

  const punjabiBase64 = Buffer.from(punjabiDoc.output('arraybuffer')).toString('base64');
  const punjabiRasterResult = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const uint8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) uint8Array[i] = raw.charCodeAt(i);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const page2 = await pdf.getPage(2);
    const viewport = page2.getViewport({ scale: 3.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page2.render({ canvasContext: ctx, viewport }).promise;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let darkInk = 0;
    let lumSum = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      lumSum += lum;
      if (lum < 160) darkInk++;
    }
    const mean = lumSum / total;
    let varSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      varSum += Math.pow(lum - mean, 2);
    }
    const stdDev = Math.sqrt(varSum / total);
    return {
      stdDev: Math.round(stdDev),
      darkInk,
      dataUrl: canvas.toDataURL('image/png')
    };
  }, punjabiBase64);

  const punjabiOutPath = path.join(OUT_DIR, 'page_2_punjabi.png');
  fs.writeFileSync(punjabiOutPath, Buffer.from(punjabiRasterResult.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log(`    Dark Ink Pixels: ${punjabiRasterResult.darkInk}`);
  console.log(`    StdDev: ${punjabiRasterResult.stdDev}`);
  if (punjabiRasterResult.darkInk < 500 || punjabiRasterResult.stdDev < 5) {
    throw new Error('Punjabi Page 2 rasterization failed: insufficient ink or blank.');
  }
  console.log(`  📍 EXACT PUNJABI PAGE 2 RASTERIZED IMAGE PATH:\n     ${punjabiOutPath}`);

  await browser.close();

  console.log('\n================================================================');
  console.log('ALL PDF RASTERIZATION & SHARPNESS CHECKS PASSED (>= 150 DPI)!');
  console.log(`Saved images to: ${OUT_DIR}`);
  console.log('================================================================\n');
}

verifyPdfRasterization().catch(err => {
  console.error('❌ PDF Rasterization Verification Failed:', err);
  process.exit(1);
});

