/**
 * Document types for PDF upload functionality
 */

export interface UploadedDocument {
  documentId: string;
  name: string;
  pageCount: number;
  size: number;
  url: string;
  textUrl: string;
  ocrUrl: string;
  statusUrl: string;
  imagesUrl: string;
}

export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  uploadDate: Date;
  path: string;
}

export interface ProcessedOCRResult {
  totalPages: number;
  fullText: string;
  pages: ProcessedOCRPage[];
  images: ProcessedImage[];
  processedAt: Date;
}

export interface ProcessedOCRPage {
  pageNumber: number;
  markdown: string;
  images: MistralOCRImage[];
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
}

export interface ProcessedImage {
  id: string;
  pageNumber: number;
  imageIndex: number;
  boundingBox: {
    topLeftX: number;
    topLeftY: number;
    bottomRightX: number;
    bottomRightY: number;
  };
  base64Data: string;
}

export interface MistralOCRImage {
  id: string;
  top_left_x: number;
  top_left_y: number;
  bottom_right_x: number;
  bottom_right_y: number;
  image_base64: string;
}

export interface MistralOCRResponse {
  pages: MistralOCRPage[];
  model: string;
  usage_info: {
    pages_processed: number;
    doc_size_bytes: number | null;
  };
}

export interface MistralOCRPage {
  index: number;
  markdown: string;
  images?: MistralOCRImage[];
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
}
