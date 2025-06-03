import { createId } from "@paralleldrive/cuid2";

/**
 * Generate a unique document ID
 */
export function generateDocumentId(): string {
  return createId();
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): void {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF");
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB");
  }

  if (file.size === 0) {
    throw new Error("File cannot be empty");
  }
}

/**
 * Validate document ID format
 */
export function validateDocumentId(documentId: string): void {
  if (!documentId || typeof documentId !== "string") {
    throw new Error("Invalid document ID");
  }

  if (documentId.length < 10) {
    throw new Error("Document ID too short");
  }
}

/**
 * Generate document URLs for different resources
 */
export function generateDocumentURLs(documentId: string) {
  const baseUrl = `/api/documents/${documentId}`;
  
  return {
    documentUrl: `${baseUrl}/file`,
    textUrl: `${baseUrl}/text`,
    ocrUrl: `${baseUrl}/ocr`,
    statusUrl: `${baseUrl}/status`,
    imagesUrl: `${baseUrl}/images`,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
