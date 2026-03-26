const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────────
// RapidAPI Security Middleware
// Blocks anyone who tries to call your API
// without going through RapidAPI.
// ─────────────────────────────────────────────
function rapidApiGuard(req, res, next) {
  const secret = req.headers["x-rapidapi-proxy-secret"];
  const expectedSecret = process.env.RAPIDAPI_PROXY_SECRET;

  // If no secret is set in env, allow all (useful for testing locally)
  if (!expectedSecret) return next();

  if (!secret || secret !== expectedSecret) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Access only allowed via RapidAPI.",
    });
  }
  next();
}

// ─────────────────────────────────────────────
// Health check — used by UptimeRobot to keep
// the server awake 24/7 on Render's free tier.
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "alive",
    service: "HTML to PDF API",
    message: "Server is running. Use POST /generate-pdf to convert HTML or a URL to PDF.",
  });
});

// ─────────────────────────────────────────────
// MAIN ENDPOINT: POST /generate-pdf
//
// Accepts JSON body with ONE of:
//   { "html": "<h1>Hello</h1>" }
//   { "url": "https://example.com" }
//
// Optional settings:
//   {
//     "format": "A4",          // A4, Letter, Legal, A3, A5
//     "landscape": false,       // true or false
//     "margin": {               // page margins in px or mm
//       "top": "20px",
//       "bottom": "20px",
//       "left": "20px",
//       "right": "20px"
//     },
//     "printBackground": true   // include background colors/images
//   }
// ─────────────────────────────────────────────
app.post("/generate-pdf", rapidApiGuard, async (req, res) => {
  const { html, url, format, landscape, margin, printBackground } = req.body;

  // Validate — must provide html OR url, not neither
  if (!html && !url) {
    return res.status(400).json({
      error: "Bad Request",
      message: "You must provide either 'html' (a string of HTML) or 'url' (a full URL like https://example.com).",
    });
  }

  let browser;
  try {
    // Launch a headless Chrome browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    if (url) {
      // Navigate to the given URL
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    } else {
      // Inject the raw HTML directly into the page
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    }

    // Generate the PDF with all settings
    const pdfBuffer = await page.pdf({
      format: format || "A4",
      landscape: landscape === true,
      printBackground: printBackground !== false, // default true
      margin: margin || {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    // Send the PDF back as a binary file download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=output.pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate PDF. " + err.message,
    });
  } finally {
    if (browser) await browser.close();
  }
});

// ─────────────────────────────────────────────
// Start the server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ HTML to PDF API running on port ${PORT}`);
});
