import { getBaseUrl } from "@/lib/base-url";
import { ColorThemeKey, FontFamilyKey, COLOR_THEMES } from "@/lib/templates-data";

export interface TimelineExportMilestone {
  date: string;
  title: string;
  description: string;
  photoUrl?: string;
}

export interface SecretNoteExportItem {
  id: string;
  triggerLabel: string;
  revealedMessage: string;
}

export interface InteractivePageExportOptions {
  senderName: string;
  recipientName: string;
  nickname?: string | null;
  occasion: string;
  letter: string;
  photoUrls?: string[];
  colorTheme?: ColorThemeKey;
  fontFamily?: FontFamilyKey;
  eventDate?: string | null;
  eventTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueMapUrl?: string | null;
  milestoneVenue?: string | null;
  musicTrackUrl?: string | null;
  voiceMessageUrl?: string | null;
  timeline?: TimelineExportMilestone[];
  secretNotes?: SecretNoteExportItem[];
  scenes?: Array<{
    id: string;
    type: string;
    title?: string;
    subtitle?: string;
    letter?: string;
    enabled?: boolean;
    [key: string]: unknown;
  }>;
  shareUrl?: string;
  isMemorial?: boolean;
  showOmMotif?: boolean;
  showBismillah?: boolean;
}

function sanitizeForHtml(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeFilename(name?: string | null): string {
  if (!name) return "keepsake";
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
}

/**
 * Generates and downloads a self-contained, fully responsive offline HTML interactive keepsake.
 * Designed to open seamlessly in any modern mobile, tablet, or desktop browser with zero internet connection required.
 */
export async function downloadInteractiveHtmlKeepsake(
  options: InteractivePageExportOptions
): Promise<void> {
  const {
    senderName,
    recipientName,
    nickname,
    occasion,
    letter,
    photoUrls = [],
    colorTheme = "rose",
    fontFamily = "serif",
    eventDate,
    eventTime,
    venueName,
    venueAddress,
    venueMapUrl,
    milestoneVenue,
    musicTrackUrl,
    voiceMessageUrl,
    timeline = [],
    secretNotes = [],
    scenes = [],
    shareUrl,
    isMemorial = false,
    showOmMotif = false,
    showBismillah = false,
  } = options;

  const displayedRecipient = nickname || recipientName;
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;
  const safeRecipient = sanitizeFilename(recipientName);

  // Generate QR code data URL for the footer link
  let qrDataUrl = "";
  try {
    const QRCodeModule = await import("qrcode");
    const QRCode = QRCodeModule.default || QRCodeModule;
    qrDataUrl = await QRCode.toDataURL(shareUrl || getBaseUrl(), {
      width: 256,
      margin: 1,
      color: { dark: "#0f0f10", light: "#ffffff" },
    });
  } catch (err) {
    console.warn("Could not generate QR code for offline HTML:", err);
  }

  // Derive theme colors
  const primaryAccent = theme.accentColor || "#f43f5e";
  const bgDark1 = isMemorial ? "#0a0a0a" : "#0d070b";
  const bgDark2 = isMemorial ? "#171717" : "#1c0d16";

  const fontStack =
    fontFamily === "handwriting"
      ? "'Caveat', 'Dancing Script', 'Brush Script MT', cursive, sans-serif"
      : fontFamily === "sans"
      ? "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      : "'Playfair Display', 'Georgia', 'Times New Roman', serif";

  const occasionLabel = isMemorial
    ? "Sacred In Memoriam"
    : occasion.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const effectiveAudioUrl = musicTrackUrl || voiceMessageUrl || null;
  const audioTitle = voiceMessageUrl ? "Voice Message & Soundtrack" : "Keepsake Soundtrack";

  const effectiveTimeline: TimelineExportMilestone[] =
    timeline.length > 0
      ? timeline
      : scenes
          .filter((s) => s.enabled !== false && s.type !== "opener" && s.type !== "finale")
          .map((s, idx) => ({
            date: `Chapter ${idx + 1}`,
            title: (typeof s.title === "string" ? s.title : "") || `Memory ${idx + 1}`,
            description:
              (typeof s.subtitle === "string" ? s.subtitle : "") ||
              (typeof s.letter === "string" ? s.letter : ""),
          }))
          .filter((item) => Boolean(item.title || item.description));

  const validPhotos = photoUrls.filter((u) => Boolean(u && typeof u === "string" && u.trim().length > 0));

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>${sanitizeForHtml(displayedRecipient)} • ${sanitizeForHtml(occasionLabel)} • Keepsake Story</title>
  <style>
    /* Reset & Base Setup */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    :root {
      --accent: ${primaryAccent};
      --bg-dark-1: ${bgDark1};
      --bg-dark-2: ${bgDark2};
      --font-family: ${fontStack};
      --text-main: #f5f5f4;
      --text-muted: #a8a29e;
      --card-bg: rgba(28, 25, 23, 0.7);
      --card-border: rgba(255, 255, 255, 0.12);
      --touch-min: 44px;
    }
    body {
      min-height: 100vh;
      font-family: var(--font-family);
      background: radial-gradient(circle at 50% 15%, var(--bg-dark-2) 0%, var(--bg-dark-1) 100%);
      color: var(--text-main);
      padding: 1.25rem 0.75rem;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    @media (min-width: 640px) {
      body {
        padding: 3rem 1.5rem;
      }
    }
    .container {
      width: 100%;
      max-width: 780px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    /* Hero Header */
    .hero-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 28px;
      padding: 2rem 1.25rem;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    @media (min-width: 640px) {
      .hero-card {
        padding: 3.5rem 2.5rem;
        border-radius: 36px;
      }
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.9rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 1.25rem;
      font-weight: 600;
    }
    .hero-title {
      font-size: clamp(1.75rem, 5vw, 3rem);
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 0.75rem;
    }
    .hero-subtitle {
      font-size: clamp(0.875rem, 2.5vw, 1.125rem);
      color: var(--text-muted);
      max-width: 520px;
      margin: 0 auto 1.5rem auto;
      font-weight: 300;
    }
    /* Cover Image */
    .cover-wrap {
      margin: 1.5rem auto 0 auto;
      max-width: 280px;
      border-radius: 24px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
    }
    @media (min-width: 640px) {
      .cover-wrap {
        max-width: 320px;
      }
    }
    .cover-wrap img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      aspect-ratio: 1 / 1;
    }
    /* Audio Player */
    .audio-panel {
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .audio-btn {
      min-height: var(--touch-min);
      min-width: var(--touch-min);
      border-radius: 50%;
      border: none;
      background: var(--accent);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .audio-btn:hover {
      opacity: 0.9;
      transform: scale(1.05);
    }
    .audio-btn:active {
      transform: scale(0.95);
    }
    .audio-info {
      text-align: left;
      flex: 1;
      overflow: hidden;
    }
    .audio-title {
      font-size: 0.825rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .audio-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    /* Heartfelt Letter */
    .letter-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 28px;
      padding: 2rem 1.25rem;
      position: relative;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
    }
    @media (min-width: 640px) {
      .letter-card {
        padding: 3rem 2.5rem;
        border-radius: 32px;
      }
    }
    .letter-heading {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .letter-body {
      font-size: clamp(0.95rem, 2.2vw, 1.15rem);
      line-height: 1.85;
      color: #fafaf9;
      white-space: pre-wrap;
      word-break: break-word;
      font-style: italic;
    }
    .letter-signoff {
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .letter-sender {
      color: #ffffff;
      font-weight: 700;
      font-size: 1.05rem;
    }
    /* Event & Venue Info */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 640px) {
      .info-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .info-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .info-label {
      font-size: 0.725rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      font-weight: 600;
    }
    .info-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #ffffff;
    }
    .info-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    /* Photo Gallery */
    .gallery-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 540px) {
      .gallery-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .gallery-item {
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      background: rgba(0, 0, 0, 0.4);
      aspect-ratio: 4 / 3;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease;
    }
    .gallery-item:hover {
      transform: translateY(-2px);
    }
    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    /* Interactive Secret Notes */
    .note-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 1.25rem;
      cursor: pointer;
      transition: border-color 0.2s ease, background 0.2s ease;
    }
    .note-card:hover {
      border-color: var(--accent);
    }
    .note-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.95rem;
      font-weight: 600;
      color: #ffffff;
      min-height: var(--touch-min);
    }
    .note-content {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.9rem;
      color: var(--accent);
      font-style: italic;
      display: none;
    }
    .note-card.open .note-content {
      display: block;
    }
    /* Interactive Celebration / Candle Lighting */
    .action-panel {
      text-align: center;
      padding: 2rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 28px;
    }
    .action-btn {
      min-height: var(--touch-min);
      padding: 0.85rem 2rem;
      border-radius: 9999px;
      border: none;
      background: linear-gradient(135deg, var(--accent) 0%, #e11d48 100%);
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(244, 63, 94, 0.35);
      transition: transform 0.2s ease, opacity 0.2s ease;
      touch-action: manipulation;
    }
    .action-btn:hover {
      opacity: 0.95;
      transform: scale(1.03);
    }
    .action-btn:active {
      transform: scale(0.97);
    }
    /* Footer QR Keepsake */
    .footer-card {
      text-align: center;
      padding: 2rem 1.25rem;
      color: var(--text-muted);
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .qr-frame {
      background: #ffffff;
      padding: 0.75rem;
      border-radius: 18px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-frame img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }
    .qr-link {
      color: #ffffff;
      text-decoration: underline;
      font-weight: 600;
      font-size: 0.825rem;
      min-height: var(--touch-min);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    /* Canvas for particles */
    #celebrate-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999;
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <canvas id="celebrate-canvas"></canvas>

  <main class="container">
    <!-- Top Hero Card -->
    <header class="hero-card">
      <div class="badge">
        <span>${showOmMotif ? "🕉️ ॐ" : showBismillah ? "﷽" : isMemorial ? "🕯️" : "✦"}</span>
        <span>${sanitizeForHtml(occasionLabel)}</span>
      </div>
      <h1 class="hero-title">${sanitizeForHtml(displayedRecipient)}</h1>
      <p class="hero-subtitle">
        ${
          isMemorial
            ? `In loving memory and eternal celebration of a life cherished by ${sanitizeForHtml(senderName)}.`
            : `A private interactive keepsake crafted with heartfelt love by ${sanitizeForHtml(senderName)}.`
        }
      </p>

      ${
        validPhotos[0]
          ? `<div class="cover-wrap">
               <img src="${sanitizeForHtml(validPhotos[0])}" alt="${sanitizeForHtml(displayedRecipient)}" loading="eager" />
             </div>`
          : ""
      }

      ${
        effectiveAudioUrl
          ? `<div class="audio-panel">
               <button class="audio-btn" id="audio-toggle-btn" aria-label="Play or pause audio soundtrack">
                 <span id="audio-icon">▶</span>
               </button>
               <div class="audio-info">
                 <div class="audio-title">${sanitizeForHtml(audioTitle)}</div>
                 <div class="audio-sub">Tap to play offline audio</div>
               </div>
               <audio id="keepsake-audio" src="${sanitizeForHtml(effectiveAudioUrl)}" preload="none"></audio>
             </div>`
          : ""
      }
    </header>

    <!-- Heartfelt Letter / Story -->
    <section class="letter-card">
      <h2 class="letter-heading">
        <span>${isMemorial ? "🕊️" : "💌"}</span>
        <span>${isMemorial ? "In Everlasting Memory" : "A Heartfelt Letter"}</span>
      </h2>
      <div class="letter-body">${sanitizeForHtml(letter)}</div>
      <footer class="letter-signoff">
        <span>Always with sincerity,</span>
        <span class="letter-sender">${sanitizeForHtml(senderName)}</span>
      </footer>
    </section>

    <!-- Event & Landmark Details (if present) -->
    ${
      eventDate || venueName || milestoneVenue
        ? `<section class="info-grid">
             ${
               eventDate
                 ? `<div class="info-box">
                      <span class="info-label">Special Moment</span>
                      <span class="info-value">${sanitizeForHtml(eventDate)}${
                        eventTime ? ` • ${sanitizeForHtml(eventTime)}` : ""
                      }</span>
                      <span class="info-desc">A date forever held close</span>
                    </div>`
                 : ""
             }
             ${
               venueName || milestoneVenue
                 ? `<div class="info-box">
                      <span class="info-label">Gathering Place</span>
                      <span class="info-value">${sanitizeForHtml(venueName || milestoneVenue)}</span>
                      <span class="info-desc">${sanitizeForHtml(venueAddress || "Special landmark of memory")}</span>
                      ${
                        venueMapUrl
                          ? `<a href="${sanitizeForHtml(venueMapUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-size: 0.8rem; text-decoration: underline; margin-top: 0.25rem; display: inline-block;">Open in Maps →</a>`
                          : ""
                      }
                    </div>`
                 : ""
             }
           </section>`
        : ""
    }

    <!-- Timeline Milestones (if present) -->
    ${
      effectiveTimeline.length > 0
        ? `<section class="letter-card">
             <h2 class="letter-heading">
               <span>⏳</span>
               <span>Cherished Milestones</span>
             </h2>
             <div style="display: flex; flex-direction: column; gap: 1.25rem;">
               ${effectiveTimeline
                 .map(
                   (item) => `
                 <div style="border-left: 2px solid var(--accent); padding-left: 1rem;">
                   <div style="font-size: 0.75rem; color: var(--accent); font-weight: 600;">${sanitizeForHtml(
                     item.date
                   )}</div>
                   <div style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0.15rem 0;">${sanitizeForHtml(
                     item.title
                   )}</div>
                   <div style="font-size: 0.85rem; color: var(--text-muted);">${sanitizeForHtml(
                     item.description
                   )}</div>
                 </div>`
                 )
                 .join("")}
             </div>
           </section>`
        : ""
    }

    <!-- Photo Moments Gallery (if more photos exist) -->
    ${
      validPhotos.length > 1
        ? `<section class="letter-card">
             <h2 class="letter-heading">
               <span>📸</span>
               <span>Moments In Time</span>
             </h2>
             <div class="gallery-grid">
               ${validPhotos
                 .map(
                   (photoUrl, idx) => `
                 <div class="gallery-item">
                   <img src="${sanitizeForHtml(photoUrl)}" alt="Memory moment ${idx + 1}" loading="lazy" />
                 </div>`
                 )
                 .join("")}
             </div>
           </section>`
        : ""
    }

    <!-- Interactive Secret Notes (if present) -->
    ${
      secretNotes.length > 0
        ? `<section class="letter-card">
             <h2 class="letter-heading">
               <span>🔐</span>
               <span>Hidden Notes (Tap to Reveal)</span>
             </h2>
             <div style="display: flex; flex-direction: column; gap: 0.75rem;">
               ${secretNotes
                 .map(
                   (note) => `
                 <div class="note-card" onclick="this.classList.toggle('open')">
                   <div class="note-trigger">
                     <span>${sanitizeForHtml(note.triggerLabel)}</span>
                     <span style="font-size: 0.8rem; opacity: 0.7;">Tap ▾</span>
                   </div>
                   <div class="note-content">
                     ${sanitizeForHtml(note.revealedMessage)}
                   </div>
                 </div>`
                 )
                 .join("")}
             </div>
           </section>`
        : ""
    }

    <!-- Celebration Interaction -->
    <section class="action-panel">
      <button class="action-btn" id="celebrate-btn">
        ${isMemorial ? "🕯️ Light a Memory Candle" : "✨ Celebrate This Story"}
      </button>
      <div id="celebrate-message" style="margin-top: 1rem; font-size: 0.875rem; color: var(--accent); display: none; font-style: italic;">
        ${
          isMemorial
            ? "A golden light burns bright in sacred memory..."
            : "Sent with all our love, joy, and highest wishes!"
        }
      </div>
    </section>

    <!-- Footer with Digital Keepsake QR Code -->
    <footer class="footer-card">
      ${
        qrDataUrl
          ? `<div class="qr-frame">
               <img src="${qrDataUrl}" alt="Digital keepsake QR code" />
             </div>
             <p>Scan to experience the live online page with real-time greetings</p>`
          : ""
      }
      ${
        shareUrl
          ? `<a class="qr-link" href="${sanitizeForHtml(shareUrl)}" target="_blank" rel="noopener noreferrer">
               Open Live Web Story →
             </a>`
          : ""
      }
      <p style="margin-top: 0.5rem; opacity: 0.6;">
        ${
          isMemorial
            ? "Forever preserved in quiet remembrance"
            : "Lovewrit Keepsakes • Forever Preserved"
        }
      </p>
    </footer>
  </main>

  <script>
    // Audio Player Toggle
    const audioEl = document.getElementById('keepsake-audio');
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioIcon = document.getElementById('audio-icon');
    if (audioEl && audioBtn && audioIcon) {
      audioBtn.addEventListener('click', () => {
        if (audioEl.paused) {
          audioEl.play().then(() => {
            audioIcon.textContent = '⏸';
          }).catch(err => console.log('Audio autoplay blocked', err));
        } else {
          audioEl.pause();
          audioIcon.textContent = '▶';
        }
      });
      audioEl.addEventListener('ended', () => {
        audioIcon.textContent = '▶';
      });
    }

    // Celebration Canvas Particles
    const celebrateBtn = document.getElementById('celebrate-btn');
    const celebrateMsg = document.getElementById('celebrate-message');
    const canvas = document.getElementById('celebrate-canvas');
    if (celebrateBtn && canvas) {
      const ctx = canvas.getContext('2d');
      let particles = [];
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      celebrateBtn.addEventListener('click', () => {
        if (celebrateMsg) celebrateMsg.style.display = 'block';
        for (let i = 0; i < 60; i++) {
          particles.push({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 160,
            y: window.innerHeight * 0.7,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 12 - 4,
            size: Math.random() * 6 + 4,
            color: ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#ffffff'][Math.floor(Math.random() * 5)],
            alpha: 1,
            decay: Math.random() * 0.015 + 0.01,
          });
        }
        if (particles.length === 60) animate();
      });

      function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.alpha > 0);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25; // gravity
          p.alpha -= p.decay;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (particles.length > 0) {
          requestAnimationFrame(animate);
        }
      }
    }
  </script>
</body>
</html>`;

  // Trigger file download in the browser
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lovewrit-${safeRecipient}-interactive-story.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a multi-page commemorative keepsake PDF document for an interactive page story.
 */
export async function downloadInteractivePagePdf(
  options: InteractivePageExportOptions
): Promise<void> {
  const {
    senderName,
    recipientName,
    nickname,
    occasion,
    letter,
    eventDate,
    eventTime,
    venueName,
    milestoneVenue,
    timeline = [],
    shareUrl,
    isMemorial = false,
  } = options;

  const { jsPDF } = await import("jspdf");
  const QRCodeModule = await import("qrcode");
  const QRCode = QRCodeModule.default || QRCodeModule;

  const displayedRecipient = nickname || recipientName;
  const safeRecipient = sanitizeFilename(recipientName);

  // A4 portrait: 210 x 297 mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2; // 170 mm

  // Background warm ivory/parchment tone
  doc.setFillColor(252, 250, 247);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Outer decorative border
  doc.setDrawColor(210, 195, 185);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, "D");
  doc.setLineWidth(0.3);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28, "D");

  // Header Title
  let currentY = 32;

  if (isMemorial) {
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(140, 110, 95);
    doc.text("IN SACRED REMEMBRANCE", pageWidth / 2, currentY, { align: "center" });
  } else {
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 50, 70);
    doc.text("A LOVEWRIT INTERACTIVE STORY KEEPSAKE", pageWidth / 2, currentY, { align: "center" });
  }

  currentY += 10;
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 25, 25);
  doc.text(`For ${displayedRecipient}`, pageWidth / 2, currentY, { align: "center" });

  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 105);
  const occText = occasion.replace(/_/g, " ").toUpperCase();
  doc.text(occText, pageWidth / 2, currentY, { align: "center" });

  currentY += 4;
  doc.setDrawColor(210, 190, 180);
  doc.line(pageWidth / 2 - 30, currentY, pageWidth / 2 + 30, currentY);

  currentY += 12;

  // Heartfelt Letter Body
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(45, 40, 40);

  // Check for non-Latin/Indic characters to prevent standard font crashes
  const isIndic = /[\u0900-\u0A7F]/.test(letter);
  if (isIndic) {
    doc.text("(Heartfelt message in native script — preserved in your interactive offline web version)", margin, currentY);
    currentY += 12;
  } else {
    const splitLetter = doc.splitTextToSize(letter, contentWidth);
    doc.text(splitLetter, margin, currentY, { lineHeightFactor: 1.6 });
    currentY += splitLetter.length * 7 + 10;
  }

  // Signoff
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 85, 85);
  doc.text("With heartfelt sincerity,", margin, currentY);
  currentY += 6;
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(180, 50, 70);
  doc.text(senderName, margin, currentY);

  currentY += 14;

  // Event & Venue Details (if present)
  if (eventDate || venueName || milestoneVenue) {
    doc.setFillColor(245, 240, 235);
    doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 70, 70);
    doc.text("GATHERING & LANDMARK DETAILS", margin + 6, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 45, 45);
    const detailLine = [
      eventDate ? `Date: ${eventDate}${eventTime ? ` at ${eventTime}` : ""}` : "",
      venueName || milestoneVenue ? `Location: ${venueName || milestoneVenue}` : "",
    ]
      .filter(Boolean)
      .join("  •  ");
    doc.text(detailLine, margin + 6, currentY + 15);

    currentY += 32;
  }

  // Timeline Milestones (if present and fits)
  if (timeline.length > 0 && currentY < 210) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 45, 45);
    doc.text("Special Milestones", margin, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(70, 65, 65);

    for (const item of timeline.slice(0, 4)) {
      if (currentY > 230) break;
      doc.text(`• ${item.date}: ${item.title} — ${item.description}`, margin + 2, currentY);
      currentY += 5.5;
    }
  }

  // Footer QR Code & Link on Page 1
  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl || getBaseUrl(), {
      width: 200,
      margin: 1,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    const qrSize = 32; // 32 x 32 mm
    const qrX = pageWidth / 2 - qrSize / 2;
    const qrY = pageHeight - 55;

    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 115, 115);
    doc.text("Scan to experience interactive unboxing, voice notes & music", pageWidth / 2, qrY + qrSize + 5, {
      align: "center",
    });

    doc.setFontSize(6.5);
    doc.text(
      isMemorial ? "Preserved in quiet remembrance" : "Crafted with love • Lovewrit Keepsakes",
      pageWidth / 2,
      pageHeight - 14,
      { align: "center" }
    );
  } catch (err) {
    console.warn("Could not render QR code on PDF:", err);
  }

  // Save the PDF
  doc.save(`lovewrit-${safeRecipient}-keepsake-story.pdf`);
}

/**
 * Captures a rendered DOM node as a high-resolution PNG or JPG image and triggers download.
 */
export async function downloadInteractivePageImage(
  nodeId: string,
  options: {
    filename?: string;
    format?: "png" | "jpeg";
    recipientName?: string;
  } = {}
): Promise<void> {
  const node = document.getElementById(nodeId);
  if (!node) {
    throw new Error(`Could not locate element with id "${nodeId}" for capture.`);
  }

  const { toPng, toJpeg } = await import("html-to-image");

  if (document.fonts) {
    await document.fonts.ready;
  }

  const rect = node.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const pixelRatio = 2; // 2x for sharp retina capture

  const captureOpts = {
    quality: 0.95,
    pixelRatio,
    width,
    height,
    canvasWidth: Math.round(width * pixelRatio),
    canvasHeight: Math.round(height * pixelRatio),
    backgroundColor: "#0a0a0a",
    cacheBust: false,
    style: {
      margin: "0",
      transform: "none",
    },
  };

  const isJpeg = options.format === "jpeg";
  const dataUrl = isJpeg ? await toJpeg(node, captureOpts) : await toPng(node, captureOpts);

  const ext = isJpeg ? "jpg" : "png";
  const safeName = sanitizeFilename(options.recipientName || "keepsake");
  const link = document.createElement("a");
  link.download = options.filename || `lovewrit-${safeName}-keepsake-poster.${ext}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
