import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ProcessedOCRResult } from "@/types/document";

// Simple document ID validation
function validateDocumentId(documentId: string): void {
  if (!documentId || typeof documentId !== 'string' || documentId.length < 1) {
    throw new Error('Invalid document ID');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    validateDocumentId(documentId);

    console.log(`[TEXT_API_START] document_id=${documentId} operation=text_retrieval`);

    const { env } = getCloudflareContext();
    
    if (!env?.PDF_BUCKET) {
      console.error(`[TEXT_API_ERROR] document_id=${documentId} error=storage_not_configured`);
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      );
    }

    // Check if document metadata exists first
    const metadataKey = `documents/${documentId}/metadata.json`;
    const metadataObject = await env.PDF_BUCKET.get(metadataKey);
    
    if (!metadataObject) {
      console.log(`[TEXT_API_ERROR] document_id=${documentId} error=document_not_found`);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Try to get OCR results
    const ocrKey = `documents/${documentId}/ocr/results.json`;
    const ocrObject = await env.PDF_BUCKET.get(ocrKey);
    
    if (!ocrObject) {
      // Check if there's a status file indicating OCR failure
      const statusKey = `documents/${documentId}/status.json`;
      const statusObject = await env.PDF_BUCKET.get(statusKey);
      
      if (statusObject) {
        const statusData = JSON.parse(await statusObject.text());
        if (statusData.status === 'failed') {
          console.log(`[TEXT_API_ERROR] document_id=${documentId} error=ocr_processing_failed`);
          return NextResponse.json(
            { 
              error: "OCR processing failed", 
              details: statusData.error,
              status: "failed"
            },
            { status: 422 }
          );
        }
      }
      
      // OCR results not found, might still be processing
      console.log(`[TEXT_API_ERROR] document_id=${documentId} error=ocr_not_processed`);
      return NextResponse.json(
        { 
          error: "OCR results not found. Document may still be processing.",
          status: "processing"
        },
        { status: 202 }
      );
    }

    // Parse OCR results
    const ocrResult: ProcessedOCRResult = JSON.parse(await ocrObject.text());
    
    console.log(`[TEXT_API_SUCCESS] document_id=${documentId} text_length=${ocrResult.fullText.length} total_pages=${ocrResult.totalPages}`);
    
    // Return the full OCR results with metadata
    return NextResponse.json({
      documentId,
      status: "completed",
      ...ocrResult
    });
  } catch (error) {
    console.error(`[TEXT_API_ERROR] document_id=${params?.documentId} endpoint=/text error_type=unexpected error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.message === 'Invalid document ID') {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
