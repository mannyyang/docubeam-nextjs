"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocumentAction } from "@/app/(marketing)/upload-document.action";
import { UploadedDocument } from "@/types/document";
import { formatFileSize } from "@/utils/document-utils";

interface PdfUploadProps {
  onUploadSuccess?: (document: UploadedDocument) => void;
}

export function PdfUpload({ onUploadSuccess }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadedFile, setUploadedFile] = useState<UploadedDocument | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || isUploading) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const [result, error] = await uploadDocumentAction({ file });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (result) {
        setUploadedFile(result);
        setUploadStatus("success");
        onUploadSuccess?.(result);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadStatus("idle");
    setUploadedFile(null);
    setErrorMessage("");
    setCopied(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async (text: string, urlType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(urlType);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const getFullUrl = (url: string) => {
    return `${window.location.origin}${url}`;
  };

  return (
    <div className="w-full space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {uploadStatus === "idle" && (
        <div
          onClick={handleFileSelect}
          className={`relative group ${
            isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-white/40 transition-colors bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isUploading ? "Uploading PDF..." : "Upload your PDF"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {isUploading
                    ? "Please wait while we process your document"
                    : "Drag and drop or click to select a PDF file"}
                </p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
              {!isUploading && (
                <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
              )}
            </div>
          </div>
        </div>
      )}

      {uploadStatus === "success" && uploadedFile && (
        <div className="border border-green-500/20 rounded-xl p-8 text-center bg-green-500/5 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Successful!
              </h3>
              <div className="flex items-center justify-center space-x-2 text-gray-300 mb-4">
                <FileText className="h-4 w-4" />
                <span className="font-medium">
                  {uploadedFile.name || "Unknown file"}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  {formatFileSize(uploadedFile.size)}
                </span>
              </div>

              {/* Document URLs */}
              <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10 space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Original PDF:</p>
                  <div className="flex items-center space-x-2">
                    <a
                      href={getFullUrl(uploadedFile.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm bg-black/20 px-3 py-2 rounded border border-white/10 text-green-400 font-mono break-all hover:bg-black/30 transition-colors"
                    >
                      {getFullUrl(uploadedFile.url)}
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                      onClick={() =>
                        copyToClipboard(getFullUrl(uploadedFile.url), "pdf")
                      }
                    >
                      {copied === "pdf" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <a
                      href={getFullUrl(uploadedFile.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Extracted Text:</p>
                  <div className="flex items-center space-x-2">
                    <a
                      href={getFullUrl(uploadedFile.textUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm bg-black/20 px-3 py-2 rounded border border-white/10 text-blue-400 font-mono break-all hover:bg-black/30 transition-colors"
                    >
                      {getFullUrl(uploadedFile.textUrl)}
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
                      onClick={() =>
                        copyToClipboard(getFullUrl(uploadedFile.textUrl), "text")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-4">
                Your PDF has been uploaded and is ready for processing
              </p>
              <Button
                onClick={resetUpload}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Upload Another File
              </Button>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="border border-red-500/20 rounded-xl p-8 text-center bg-red-500/5 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Failed
              </h3>
              <p className="text-red-400 mb-4">{errorMessage}</p>
              <Button
                onClick={resetUpload}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
