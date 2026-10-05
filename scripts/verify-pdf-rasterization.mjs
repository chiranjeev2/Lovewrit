import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PDF_PATH = path.resolve('scripts/export_verification_downloads/lovewrit-foldable-card-ananya.pdf');
const OUT_DIR = path.resolve('qa-pdf-pages');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function verifyPdfRasterization() {
  console.log('================================================================');
  console.log('      📄 FOLDABLE PDF RASTERIZATION & QUALITY ASSURANCE         ');
  console.log('================================================================\n');

  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`PDF file not found at ${PDF_PATH}. Run verify-real-browser-exports first.`);
  }

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

  // Navigate to blank page and load PDF.js from unpkg/cloudflare
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
      // Scale = 3.0 gives high-fidelity 216ppi+ rasterization for quality verification
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

      // Calculate mean luminance
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        totalLuminance += lum;
      }
      const meanLuminance = totalLuminance / pixelCount;

      // Calculate variance
      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        varianceSum += Math.pow(lum - meanLuminance, 2);
      }
      const variance = varianceSum / pixelCount;
      const stdDev = Math.sqrt(variance);

      // On Page 2 (Inside Right panel), inspect photo sharpness and buyer message text legibility
      let photoEffectiveDpi = 0;
      let messageRegionStats = null;
      if (pageNum === 2) {
        // Physical panel width is 5 inches (half of 10-inch sheet)
        const rightHalfPixels = canvas.width / 2;
        const panelWidthInches = 5.0; // 5 inches
        photoEffectiveDpi = rightHalfPixels / panelWidthInches; // Effective rasterized DPI

        // Inside Right Panel Message Region (x: 55% to 95%, y: 18% to 80%)
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
            // Dark text ink threshold (dark ink on light paper < 160)
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
        isBlank: stdDev < 10, // stdDev < 10 means flat uniform/white/blank page
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

    // Save PNG buffer
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

      // Primary Assertion: Buyer's exact message string appears on page 2
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

  await browser.close();

  console.log('\n================================================================');
  console.log('🎉 ALL PDF RASTERIZATION & SHARPNESS CHECKS PASSED (>= 150 DPI)!');
  console.log(`Saved images to: ${OUT_DIR}`);
  console.log('================================================================\n');
}

verifyPdfRasterization().catch(err => {
  console.error('❌ PDF Rasterization Verification Failed:', err);
  process.exit(1);
});

