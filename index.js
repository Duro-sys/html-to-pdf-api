const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
app.use(express.json({ limit: "10mb" }));

function rapidApiGuard(req, res, next) {
  const secret = req.headers["x-rapidapi-proxy-secret"];
  const expectedSecret = process.env.RAPIDAPI_PROXY_SECRET;
  if (!expectedSecret) return next();
  if (!secret || secret !== expectedSecret) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Access only allowed via RapidAPI.",
    });
  }
  next();
}

app.get("/", (req, res) => {
  res.json({
    status: "alive",
    service: "HTML to PDF API",
    message: "Server is running. Use POST /generate-pdf to convert HTML or a URL to PDF.",
  });
});

app.post("/generate-pdf", rapidApiGuard, async (req, res) => {
  const { html, url, format, landscape, margin, printBackground } = req.body;

  if (!html && !url) {
    return res.status(400).json({
      error: "Bad Request",
      message: "You must provide either 'html' or 'url'.",
    });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    if (url) {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    } else {
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    }

    const pdfBuffer = await page.pdf({
      format: format || "A4",
      landscape: landscape === true,
      printBackground: printBackground !== false,
      margin: margin || {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ HTML to PDF API running on port ${PORT}`);
});
