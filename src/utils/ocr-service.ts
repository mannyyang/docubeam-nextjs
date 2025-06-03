import "server-only";
import { MistralOCRResponse, ProcessedOCRResult, ProcessedOCRPage, ProcessedImage } from "@/types/document";

/**
 * OCR Processing Service for Next.js
 * Adapted from the Cloudflare Workers version
 */
export class OCRService {
  /**
   * Process a PDF document using Mistral AI OCR
   */
  static async processDocument(
    documentId: string,
    buffer: ArrayBuffer
  ): Promise<ProcessedOCRResult> {
    console.log(`[OCR_START] document_id=${documentId} buffer_size=${buffer.byteLength} operation=ocr_processing`);

    const mistralApiKey = process.env.MISTRAL_AI_API_KEY;
    if (!mistralApiKey) {
      throw new Error("MISTRAL_AI_API_KEY environment variable is required");
    }

    try {
      // Convert ArrayBuffer to base64 (same as reference implementation)
      const uint8Array = new Uint8Array(buffer);
      const base64PDF = btoa(
        uint8Array.reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      
      console.log(`[OCR_API_PROGRESS] document_id=${documentId} step=pdf_converted_to_base64 base64_length=${base64PDF.length}`);

      // Create the API request using the correct Mistral OCR format
      const requestBody = {
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          document_url: `data:application/pdf;base64,${base64PDF}`
        },
        include_image_base64: true
      };

      console.log(`[OCR_API_START] document_id=${documentId} api_endpoint=mistral_ocr buffer_size=${buffer.byteLength}`);

      // Call Mistral OCR API
      const response = await fetch("https://api.mistral.ai/v1/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OCR_API_ERROR] document_id=${documentId} status=${response.status} error=${errorText}`);
        throw new Error(`Mistral OCR API error: ${response.status} - ${errorText}`);
      }

      const ocrResponse: MistralOCRResponse = await response.json();
      console.log(`[OCR_API_PROGRESS] document_id=${documentId} pages_processed=${ocrResponse.usage_info.pages_processed}`);

      // Process the OCR response
      const processedResult = this.processOCRResponse(documentId, ocrResponse);
      
      console.log(`[OCR_SUCCESS] document_id=${documentId} total_pages=${processedResult.totalPages} images_count=${processedResult.images.length} text_length=${processedResult.fullText.length}`);
      
      return processedResult;
    } catch (error) {
      console.error(`[OCR_ERROR] document_id=${documentId} error_type=ocr_processing_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Process Mistral OCR response into our format
   */
  private static processOCRResponse(
    documentId: string,
    ocrResponse: MistralOCRResponse
  ): ProcessedOCRResult {
    const pages: ProcessedOCRPage[] = [];
    const images: ProcessedImage[] = [];
    let fullText = "";

    // Process each page
    for (const page of ocrResponse.pages) {
      const pageNumber = page.index + 1; // Convert from 0-based to 1-based
      
      // Add page text to full text
      if (page.markdown) {
        fullText += page.markdown + "\n\n";
      }

      // Process images on this page
      const pageImages = page.images || [];
      for (let imageIndex = 0; imageIndex < pageImages.length; imageIndex++) {
        const image = pageImages[imageIndex];
        
        images.push({
          id: image.id,
          pageNumber,
          imageIndex,
          boundingBox: {
            topLeftX: image.top_left_x,
            topLeftY: image.top_left_y,
            bottomRightX: image.bottom_right_x,
            bottomRightY: image.bottom_right_y,
          },
          base64Data: image.image_base64,
        });
      }

      // Create processed page
      pages.push({
        pageNumber,
        markdown: page.markdown || "",
        images: pageImages,
        dimensions: page.dimensions,
      });
    }

    return {
      totalPages: ocrResponse.pages.length,
      fullText: fullText.trim(),
      pages,
      images,
      processedAt: new Date(),
    };
  }

  /**
   * Get OCR status for a document (placeholder for future implementation)
   */
  static async getOCRStatus(documentId: string): Promise<{
    status: 'not_started' | 'processing' | 'completed' | 'failed';
    totalPages?: number;
    processedAt?: Date;
    hasImages?: boolean;
    error?: string;
  }> {
    // This would typically check a database or storage for OCR status
    // For now, return a default status
    return {
      status: 'not_started'
    };
  }
}
