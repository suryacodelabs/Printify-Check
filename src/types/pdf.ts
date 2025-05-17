
export enum PdfFlavour {
  PDFA_1B = "1b",
  PDFA_1A = "1a",
  PDFA_2B = "2b",
  PDFA_2A = "2a",
  PDFA_3B = "3b",
  PDFA_3A = "3a",
  PDFA_4 = "4",
  PDFUA_1 = "ua1",
  PDFX_1A = "x1a",
  PDFX_4 = "x4",
  WCAG_21_AA = "wcag21aa"
}

export enum PDFTagType {
  DOCUMENT = "Document",
  SECTION = "Sect",
  PARAGRAPH = "P",
  HEADING_1 = "H1",
  HEADING_2 = "H2",
  HEADING_3 = "H3",
  HEADING_4 = "H4",
  HEADING_5 = "H5",
  HEADING_6 = "H6",
  TABLE = "Table",
  TABLE_ROW = "TR",
  TABLE_HEADER = "TH",
  TABLE_DATA = "TD",
  LIST = "L",
  LIST_ITEM = "LI",
  LIST_BODY = "LBody",
  FIGURE = "Figure",
  FORMULA = "Formula",
  FORM = "Form",
  LINK = "Link",
  NOTE = "Note",
  REFERENCE = "Reference",
  SPAN = "Span"
}

export enum PDFIssueSeverity {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info"
}

export interface PDFIssue {
  id: string;
  type: string;
  severity: string;
  message: string;
  description?: string;
  page?: number;
  location?: string | {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  autoFixable: boolean;
  fixDescription?: string;
  ruleId?: string;
  clause?: string;
  testNumber?: string;
  category?: string;
  status?: string;
}

export interface PDFTagIssue extends PDFIssue {
  tagType?: PDFTagType;
  missingAttributes?: string[];
  suggestedFix?: string;
}

export interface PDFAccessibilitySummary {
  isTagged: boolean;
  hasLanguage: boolean;
  hasTitle: boolean;
  missingAltText: number;
  tableIssues: number;
  headingIssues: number;
  totalIssues: number;
  score: number;
}

export interface PDFValidationOptions {
  levels?: PdfFlavour[];
  includeTagValidation?: boolean;
  includeMetadata?: boolean;
}

export interface PDFFixOptions {
  addLanguage?: {
    enabled: boolean;
    language: string;
  };
  enhanceAccessibility?: boolean;
  fixMetadata?: boolean;
  convertToPdfA?: {
    enabled: boolean;
    flavour: PdfFlavour;
  };
}
