
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_PRO_FEATURES: string;
  readonly VITE_OCR_ENABLED: string;
  readonly VITE_MAX_OCR_FILE_SIZE: string;
  readonly VITE_REDACTION_ENABLED: string;
  readonly VITE_REDACTION_COLOR_DEFAULT: string;
  readonly VITE_REDACTION_TEXT_DEFAULT: string;
  readonly VITE_VERAPDF_VERSION: string;
  readonly VITE_GHOSTSCRIPT_VERSION: string;
  readonly VITE_MUPDF_VERSION: string;
  readonly VITE_SPRING_BOOT_VERSION: string;
  readonly VITE_JAVA_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
