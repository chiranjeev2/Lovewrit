import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { toPng } from "html-to-image";

export interface FoldablePdfOptions {
  senderName: string;
  recipientName: string;
  occasion: string;
  message: string;
  secondaryMessage?: string | null;
  fontFamily?: string;
  colorTheme?: string;
  borderStyle?: string;
  location?: string | null;
  eventDate?: string | null;
  shareUrl: string;
  cardRef?: HTMLElement | null;
}

/**
 * Generates a 2-page, 4-panel foldable greeting card PDF in standard 10x7" flat sheet format
 * (Folded size: 5x7 inches / 127x177.8 mm).
 *
 * Page 1 (Exterior):
 *   - Left panel (5x7"): Back Cover with Lovewrit branding, digital keepsake QR code, and website.
 *   - Center: Subtle folding line guide.
 *   - Right panel (5x7"): Front Cover with photos, occasion title, decorative borders & names.
 *
 * Page 2 (Interior):
 *   - Left panel (5x7"): Inside Left panel with secondary bilingual message or decorative watermark.
 *   - Center: Subtle folding line guide.
 *   - Right panel (5x7"): Inside Right panel with the heartfelt message, closing signoff, date & location.
 */
export async function generateFoldableCardPdf(options: FoldablePdfOptions): Promise<void> {
  const {
    senderName,
    recipientName,
    occasion,
    message,
    secondaryMessage,
    location,
    eventDate,
    shareUrl,
    cardRef,
  } = options;

  // 10 x 7 inches in landscape (254 x 177.8 mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [254, 177.8],
  });

  const pageWidth = 254;
  const pageHeight = 177.8;
  const panelWidth = 127; // Half width for each 5x7" page
  const centerFoldX = 127;

  // Helper for fold guide line
  const drawFoldGuide = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(centerFoldX, 5, centerFoldX, pageHeight - 5);
    doc.setLineDashPattern([], 0); // reset to solid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text("— FOLD DOWN CENTER —", centerFoldX, pageHeight - 2, { align: "center" });
  };

  // -------------------------------------------------------------
  // PAGE 1: EXTERIOR (Back Cover on Left, Front Cover on Right)
  // -------------------------------------------------------------

  // Exterior background fill (soft warm ivory / neutral tone)
  doc.setFillColor(252, 250, 247);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // --- Left Half: BACK COVER (x: 0 to 127) ---
  const backCenterX = panelWidth / 2; // 63.5 mm

  // Back cover branding emblem
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(180, 50, 70); // Rose emblem color
  doc.text("LOVEWRIT", backCenterX, 42, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("PERSONALIZED DIGITAL & PRINT KEEPSAKES", backCenterX, 48, { align: "center" });

  // Generate QR Code for back panel
  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl || "https://lovewrit.com", {
      width: 300,
      margin: 1,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    const qrSize = 42; // 42mm x 42mm
    const qrX = backCenterX - qrSize / 2;
    const qrY = 60;

    // Draw white card backing for QR code
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(225, 220, 215);
    doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, "FD");
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // QR instructions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("Scan to Experience Online", backCenterX, qrY + qrSize + 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    const caption = "Open your camera to play music, view photos & hear voice notes";
    doc.text(caption, backCenterX, qrY + qrSize + 13, { align: "center" });
  } catch (err) {
    console.error("Failed to render QR on PDF back cover", err);
  }

  // Footer on back cover
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text("Crafted with love • www.lovewrit.com", backCenterX, pageHeight - 12, { align: "center" });

  // Draw Center Fold Guide on Page 1
  drawFoldGuide();

  // --- Right Half: FRONT COVER (x: 127 to 254) ---
  const frontCenterX = centerFoldX + panelWidth / 2; // 190.5 mm

  if (cardRef) {
    try {
      // Capture the card preview node directly
      const frontPng = await toPng(cardRef, {
        pixelRatio: 3,
        cacheBust: true,
      });

      // Embed into front panel with 10mm margins
      const margin = 10;
      const frontX = centerFoldX + margin;
      const frontY = margin;
      const frontW = panelWidth - margin * 2; // 107mm
      const frontH = pageHeight - margin * 2; // 157.8mm

      doc.addImage(frontPng, "PNG", frontX, frontY, frontW, frontH);
    } catch (err) {
      console.warn("Could not capture cardRef, falling back to vector front", err);
      renderVectorFrontCover(doc, frontCenterX, recipientName, senderName, occasion);
    }
  } else {
    renderVectorFrontCover(doc, frontCenterX, recipientName, senderName, occasion);
  }

  // -------------------------------------------------------------
  // PAGE 2: INTERIOR (Inside Left on Left, Inside Right on Right)
  // -------------------------------------------------------------
  doc.addPage([254, 177.8], "landscape");

  // Interior warm paper background
  doc.setFillColor(254, 252, 249);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Center Fold Guide on Page 2
  drawFoldGuide();

  // --- Inside Left Panel (x: 0 to 127) ---
  const insideLeftCenterX = panelWidth / 2;

  if (secondaryMessage && secondaryMessage.trim().length > 0) {
    // Bilingual Secondary Message Panel
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(160, 100, 110);
    doc.text("A Note in Our Language", insideLeftCenterX, 35, { align: "center" });

    // Decorative inner box
    doc.setDrawColor(230, 215, 205);
    doc.setLineDashPattern([1, 2], 0);
    doc.roundedRect(16, 45, panelWidth - 32, 90, 4, 4, "D");
    doc.setLineDashPattern([], 0);

    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(60, 50, 50);
    const splitSecondary = doc.splitTextToSize(secondaryMessage.trim(), panelWidth - 44);
    doc.text(splitSecondary, insideLeftCenterX, 65, { align: "center", lineHeightFactor: 1.5 });
  } else {
    // Decorative watermark / monogram when no secondary bilingual message
    doc.setFont("times", "italic");
    doc.setFontSize(28);
    doc.setTextColor(230, 215, 215);
    doc.text("♥", insideLeftCenterX, 85, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(170, 160, 155);
    doc.text("“Every love story is beautiful,", insideLeftCenterX, 95, { align: "center" });
    doc.text("but ours is my favorite.”", insideLeftCenterX, 102, { align: "center" });
  }

  // --- Inside Right Panel (x: 127 to 254) ---
  const insideRightCenterX = centerFoldX + panelWidth / 2; // 190.5 mm
  const rightMargin = 16;
  const contentWidth = panelWidth - rightMargin * 2; // 95 mm
  const textStartX = centerFoldX + rightMargin;

  // Salutation
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 30, 30);
  doc.text(`Dearest ${recipientName},`, textStartX, 38);

  // Main Heartfelt Message
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(50, 45, 45);

  const cleanMessage = message || "Thank you for bringing so much warmth and light into my life.";
  const splitMessage = doc.splitTextToSize(cleanMessage, contentWidth);
  doc.text(splitMessage, textStartX, 50, { lineHeightFactor: 1.5 });

  // Calculate signature Y position
  const estimatedMessageHeight = splitMessage.length * 5.5;
  const signoffY = Math.min(135, Math.max(85, 50 + estimatedMessageHeight + 10));

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(90, 75, 75);
  doc.text("With all my love,", textStartX, signoffY);

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(180, 50, 70);
  doc.text(senderName, textStartX, signoffY + 7);

  // Optional date and location footer on inside right
  if (location || eventDate) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 140, 135);
    const metaParts = [eventDate, location].filter(Boolean).join(" • ");
    doc.text(metaParts, textStartX, signoffY + 16);
  }

  // Save / Trigger Download
  const safeName = (recipientName || "keepsake").toLowerCase().replace(/[^a-z0-9]/g, "-");
  doc.save(`lovewrit-foldable-card-${safeName}.pdf`);
}

/** Fallback vector front cover if DOM capture is unavailable */
function renderVectorFrontCover(
  doc: jsPDF,
  centerX: number,
  recipientName: string,
  senderName: string,
  occasion: string
) {
  doc.setDrawColor(210, 160, 170);
  doc.setLineWidth(0.8);
  doc.roundedRect(centerX - 48, 15, 96, 147.8, 4, 4, "D");

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(180, 50, 70);
  const title = occasion.replace(/_/g, " ").toUpperCase();
  doc.text(title, centerX, 55, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(60, 50, 50);
  doc.text(`For ${recipientName}`, centerX, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 110);
  doc.text(`With Love from ${senderName}`, centerX, 100, { align: "center" });
}
