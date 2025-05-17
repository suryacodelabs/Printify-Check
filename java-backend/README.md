
# Printify Check Backend

This is the Java backend component for the Printify Check application, an open-source PDF preflight and correction SaaS.

## Features

- PDF Preflight Checks (18 different checks)
- Automatic Fixes
- OCR for Scanned PDFs
- Redaction of Sensitive Information
- PDF/A-3u Compliance

## Tech Stack

- Java 21
- Spring Boot
- iText Core 9.1.0 (AGPL)
- iText-pdfocr-java (AGPL)
- iText-pdfsweep-java (AGPL)
- Tesseract OCR
- Supabase

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Supabase account
- Oracle Cloud account (for production deployment)

### Local Development Setup

1. Clone the repository
2. Create a `.env` file from the `.env.template` file:
   ```
   cp .env.template .env
   ```
3. Fill in your Supabase credentials in the `.env` file
4. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```
5. The API will be available at `http://localhost:8080`

### Oracle Cloud VM Deployment

1. SSH into your Oracle Cloud VM
2. Install Docker and Docker Compose
3. Clone the repository
4. Create a `.env` file with your credentials
5. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```

## API Endpoints

### Preflight

- `POST /api/preflight/check` - Upload and check a PDF file
- `GET /api/preflight/results/{checkId}` - Get preflight check results
- `POST /api/preflight/fix/{checkId}` - Apply fixes to a PDF
- `GET /api/preflight/annotated/{checkId}` - Get annotated PDF with issues highlighted
- `GET /api/preflight/fixed/{fixId}` - Download fixed PDF

### OCR

- `POST /api/ocr/process` - Process a PDF file with OCR
- `GET /api/ocr/status/{jobId}` - Get OCR job status and result
- `GET /api/ocr/download/{jobId}` - Download OCR-processed PDF
- `GET /api/ocr/extract-text/{jobId}` - Extract text from a PDF using OCR

### Redaction

- `POST /api/redaction/redact` - Redact sensitive information from a PDF
- `POST /api/redaction/strip-metadata` - Strip metadata from a PDF
- `GET /api/redaction/status/{jobId}` - Get redaction job status
- `GET /api/redaction/download/{jobId}` - Download redacted PDF

## License

This project is licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html).

### iText Licensing

This project uses iText libraries which are licensed under AGPL. According to the AGPL license, if you modify or distribute this software, you must make your source code available under the same license.

## Source Code Access

The complete source code for this application is available at [GitHub](https://github.com/your-username/printify-check).
