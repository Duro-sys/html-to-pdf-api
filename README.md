
The HTML to PDF Generator API lets you convert raw HTML strings or publicly accessible URLs into downloadable PDF documents in seconds. This can be used for invoices, reports, contracts, receipts, webpage archiving, and broader document automation workflows. The API is designed to handle common PDF generation needs with options for page size, orientation, margins, and background rendering.

Disclaimer  
The HTML to PDF Generator API is intended for lawful and legitimate use only. Users are responsible for ensuring they have the right to convert and distribute any HTML or web content they process, and must comply with all applicable laws, regulations, and third‑party terms of service when using this API.

HTML to PDF Generator API is a developer-focused service that provides a simple way to create high-quality PDFs from HTML or URLs without managing rendering infrastructure yourself. The service is exposed via RapidAPI and requires an API key for authenticated access.

HTML to PDF Generator API Documentation  

Overview  
The HTML to PDF Generator API converts raw HTML content or public URLs into binary PDF files that can be downloaded or stored. It supports configurable page size (A4, Letter, Legal, A3, A5), landscape or portrait orientation, optional custom margins, and the option to include or exclude background colors and images. You must supply either an HTML payload or a URL in each request, but not both.

Phone Number Format  
Not applicable for this service. Instead, requests are made using standard HTTP payloads:  
- HTML is passed as a string field in the JSON body.  
- URLs must be fully qualified, publicly accessible addresses (for example, `https://example.com`) without requiring login or local access.

Endpoints  

1. Generate PDF from HTML or URL  
Endpoint: `/generate-pdf`  
Method: `POST`  
Description: Generates a PDF file from either a raw HTML string or a publicly accessible URL.  
Parameters (JSON body):  
- `html` (string, required*) – Raw HTML content to convert into PDF.  
- `url` (string, required*) – Public webpage URL to capture as PDF.  
- `format` (string, optional) – Page size (`A4`, `Letter`, `Legal`, `A3`, `A5`; default `A4`).  
- `landscape` (boolean, optional) – Use landscape orientation when `true` (default `false`).  
- `margin` (object, optional) – Custom page margins (for example `top`, `bottom`, `left`, `right` as strings like `"40px"`).  
- `printBackground` (boolean, optional) – Include background colors and images when `true` (default `true`).  
Response:  
A binary PDF file returned in the HTTP response with headers indicating `application/pdf` content and an attachment filename.

Usage Example  
To use the HTML to PDF Generator API, you typically make a POST request to the `/generate-pdf` endpoint with a JSON body specifying either `html` or `url` plus any optional formatting parameters:

- Generate from HTML:  
  `POST /generate-pdf`  
  Body:  
  ```json
  {
    "html": "<h1>Invoice #001</h1><p>Amount due: $500</p>",
    "format": "A4",
    "landscape": false
  }
  ```

- Generate from URL:  
  `POST /generate-pdf`  
  Body:  
  ```json
  {
    "url": "https://example.com",
    "format": "A4",
    "landscape": false
  }
  ```

Important Notes  
Ensure that each request includes either `html` or `url`, but never both and never neither. HTML content should be valid and preferably wrapped in full document tags (for example `&lt;html&gt;&lt;body&gt;...&lt;/body&gt;&lt;/html&gt;`) and styled via inline CSS or `&lt;style&gt;` blocks, since external stylesheets may not load. URLs must be publicly accessible, and pages with heavy client-side JavaScript may require additional rendering time before the PDF is produced.
