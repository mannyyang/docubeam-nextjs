import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { validateDocumentId } from "@/utils/document-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    validateDocumentId(documentId);

    const { env } = getCloudflareContext();
    
    if (!env?.PDF_BUCKET) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      );
    }

    // Get document metadata to find the original file name
    const metadataKey = `documents/${documentId}/metadata.json`;
    const metadataObject = await env.PDF_BUCKET.get(metadataKey);
    
    if (!metadataObject) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const metadata = JSON.parse(await metadataObject.text());
    const originalKey = `documents/${documentId}/original/${metadata.name}`;
    
    const fileObject = await env.PDF_BUCKET.get(originalKey);
    
    if (!fileObject) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${metadata.name}"`);
    headers.set("Cache-Control", "public, max-age=31536000");

    return new NextResponse(fileObject.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
