"use server";

import { createServerAction, ZSAError } from "zsa";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { documentUploadSchema } from "@/schemas/document.schema";
import { generateDocumentId, validateFile, generateDocumentURLs } from "@/utils/document-utils";
import { OCRService } from "@/utils/ocr-service";
import { UploadedDocument, PDFDocument } from "@/types/document";

export const uploadDocumentAction = createServerAction()
  .input(documentUploadSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        const { file } = input;
        
        console.log(`[UPLOAD_START] document=${file?.name || 'undefined'} size=${file?.size || 0} type=${file?.type || 'undefined'} operation=document_upload`);
        
        try {
          // Step 1: Validate the file
          validateFile(file);
          
          // Step 2: Generate document ID
          const documentId = generateDocumentId();
          console.log(`[UPLOAD_PROGRESS] document_id=${documentId} step=id_generated`);
          
          // Step 3: Get file buffer
          const buffer = await file.arrayBuffer();
          if (buffer.byteLength < 100) {
            throw new ZSAError("INPUT_PARSE_ERROR", "File is too small or corrupted");
          }
          
          // Step 4: Store the original file in R2
          const { env } = getCloudflareContext();
          
          if (!env?.PDF_BUCKET) {
            throw new ZSAError("INTERNAL_SERVER_ERROR", "File storage not configured");
          }

          const originalKey = `documents/${documentId}/original/${file.name}`;
          await env.PDF_BUCKET.put(originalKey, buffer, {
            httpMetadata: {
              contentType: file.type,
            },
            customMetadata: {
              documentId,
              folder: 'original',
              uploadedAt: new Date().toISOString(),
            },
          });
          
          console.log(`[UPLOAD_PROGRESS] document_id=${documentId} step=file_stored`);
          
          // Step 5: Create document metadata
          const document: PDFDocument = {
            id: documentId,
            name: file.name,
            size: file.size,
            pageCount: 0, // Will be updated after OCR
            uploadDate: new Date(),
            path: originalKey,
          };
          
          // Store metadata in R2 as JSON
          const metadataKey = `documents/${documentId}/metadata.json`;
          const metadataBuffer = new TextEncoder().encode(JSON.stringify(document, null, 2));
          await env.PDF_BUCKET.put(metadataKey, metadataBuffer, {
            httpMetadata: {
              contentType: "application/json",
            },
          });
          
          console.log(`[UPLOAD_PROGRESS] document_id=${documentId} step=metadata_created`);
          
          // Step 6: Process OCR
          console.log(`[UPLOAD_PROGRESS] document_id=${documentId} step=starting_ocr`);
          let pageCount = 0;
          
          try {
            const processedOCR = await OCRService.processDocument(documentId, buffer);
            pageCount = processedOCR.totalPages;
            
            // Store OCR results
            const ocrKey = `documents/${documentId}/ocr/results.json`;
            const ocrBuffer = new TextEncoder().encode(JSON.stringify(processedOCR, null, 2));
            await env.PDF_BUCKET.put(ocrKey, ocrBuffer, {
              httpMetadata: {
                contentType: "application/json",
              },
            });
            
            // Store extracted text
            const textKey = `documents/${documentId}/ocr/extracted_text.txt`;
            const textBuffer = new TextEncoder().encode(processedOCR.fullText);
            await env.PDF_BUCKET.put(textKey, textBuffer, {
              httpMetadata: {
                contentType: "text/plain",
              },
            });
            
            // Store images if any
            if (processedOCR.images.length > 0) {
              const imagesKey = `documents/${documentId}/ocr/images.json`;
              const imagesBuffer = new TextEncoder().encode(JSON.stringify(processedOCR.images, null, 2));
              await env.PDF_BUCKET.put(imagesKey, imagesBuffer, {
                httpMetadata: {
                  contentType: "application/json",
                },
              });
            }
            
            // Update metadata with page count
            const updatedDocument = { ...document, pageCount };
            const updatedMetadataBuffer = new TextEncoder().encode(JSON.stringify(updatedDocument, null, 2));
            await env.PDF_BUCKET.put(metadataKey, updatedMetadataBuffer, {
              httpMetadata: {
                contentType: "application/json",
              },
            });
            
            console.log(`[UPLOAD_PROGRESS] document_id=${documentId} step=ocr_completed pages=${pageCount}`);
          } catch (ocrError) {
            console.error(`[UPLOAD_ERROR] document_id=${documentId} step=ocr_failed error_name=${ocrError instanceof Error ? ocrError.name : 'Unknown'} error_message=${ocrError instanceof Error ? ocrError.message : String(ocrError)}`);
            
            // Store error status but don't fail the upload
            const statusKey = `documents/${documentId}/status.json`;
            const statusBuffer = new TextEncoder().encode(JSON.stringify({
              status: 'failed',
              error: ocrError instanceof Error ? ocrError.message : "OCR processing failed",
              timestamp: new Date().toISOString(),
            }, null, 2));
            await env.PDF_BUCKET.put(statusKey, statusBuffer, {
              httpMetadata: {
                contentType: "application/json",
              },
            });
          }
          
          // Step 7: Generate resource URLs
          const urls = generateDocumentURLs(documentId);
          
          const result: UploadedDocument = {
            documentId: documentId,
            name: file.name,
            pageCount: pageCount,
            size: file.size,
            url: urls.documentUrl,
            textUrl: urls.textUrl,
            ocrUrl: urls.ocrUrl,
            statusUrl: urls.statusUrl,
            imagesUrl: urls.imagesUrl,
          };
          
          console.log(`[UPLOAD_SUCCESS] document_id=${documentId} operation=document_upload_completed`);
          return result;
        } catch (error) {
          console.error(`[UPLOAD_ERROR] error_type=upload_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
          
          if (error instanceof ZSAError) {
            throw error;
          }
          
          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            error instanceof Error ? error.message : "Upload failed"
          );
        }
      },
      RATE_LIMITS.DOCUMENT_UPLOAD
    );
  });
