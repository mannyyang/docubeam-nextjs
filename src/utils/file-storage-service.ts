/**
 * Create a folder path for a document
 * @param documentId The document ID
 * @returns The folder path
 */
export function createDocumentPath(documentId: string): string {
  return `documents/${documentId}`;
}

/**
 * Service for handling file storage operations with R2
 */
export class FileStorageService {
  /**
   * Store a file in R2 with organized structure
   * @param documentId The document ID
   * @param fileName The file name
   * @param buffer The file buffer
   * @param contentType The content type
   * @param bucket The R2 bucket
   * @param subPath Optional sub-path (e.g., 'original', 'ocr')
   */
  static async storeFile(
    documentId: string,
    fileName: string,
    buffer: ArrayBuffer,
    contentType: string,
    bucket: R2Bucket,
    subPath: string = 'original'
  ): Promise<string> {
    console.log(`[STORAGE_START] document_id=${documentId} file_name=${fileName} sub_path=${subPath} size=${buffer.byteLength} content_type=${contentType}`);
    
    const documentPath = createDocumentPath(documentId);
    const fullPath = `${documentPath}/${subPath}/${fileName}`;
    
    try {
      await bucket.put(fullPath, buffer, {
        httpMetadata: {
          contentType: contentType,
        },
      });
      
      console.log(`[STORAGE_SUCCESS] document_id=${documentId} path=${fullPath} operation=file_stored`);
      return fullPath;
    } catch (error) {
      console.error(`[STORAGE_ERROR] document_id=${documentId} error_type=storage_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Store JSON data in R2
   * @param documentId The document ID
   * @param fileName The file name
   * @param data The data to store
   * @param bucket The R2 bucket
   * @param subPath Optional sub-path
   */
  static async storeJSON(
    documentId: string,
    fileName: string,
    data: unknown,
    bucket: R2Bucket,
    subPath: string = ''
  ): Promise<string> {
    console.log(`[STORAGE_START] document_id=${documentId} file_name=${fileName} sub_path=${subPath} operation=json_store`);
    
    const documentPath = createDocumentPath(documentId);
    const fullPath = subPath ? `${documentPath}/${subPath}/${fileName}` : `${documentPath}/${fileName}`;
    
    try {
      await bucket.put(
        fullPath,
        JSON.stringify(data, null, 2),
        {
          httpMetadata: {
            contentType: "application/json",
          },
        }
      );
      
      console.log(`[STORAGE_SUCCESS] document_id=${documentId} path=${fullPath} operation=json_stored`);
      return fullPath;
    } catch (error) {
      console.error(`[STORAGE_ERROR] document_id=${documentId} error_type=json_storage_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Store text data in R2
   * @param documentId The document ID
   * @param fileName The file name
   * @param text The text to store
   * @param contentType The content type
   * @param bucket The R2 bucket
   * @param subPath Optional sub-path
   */
  static async storeText(
    documentId: string,
    fileName: string,
    text: string,
    contentType: string,
    bucket: R2Bucket,
    subPath: string = ''
  ): Promise<string> {
    console.log(`[STORAGE_START] document_id=${documentId} file_name=${fileName} sub_path=${subPath} text_length=${text.length} operation=text_store`);
    
    const documentPath = createDocumentPath(documentId);
    const fullPath = subPath ? `${documentPath}/${subPath}/${fileName}` : `${documentPath}/${fileName}`;
    
    try {
      await bucket.put(fullPath, text, {
        httpMetadata: {
          contentType: contentType,
        },
      });
      
      console.log(`[STORAGE_SUCCESS] document_id=${documentId} path=${fullPath} operation=text_stored`);
      return fullPath;
    } catch (error) {
      console.error(`[STORAGE_ERROR] document_id=${documentId} error_type=text_storage_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Retrieve a file from R2
   * @param path The file path
   * @param bucket The R2 bucket
   * @returns The R2 object or null if not found
   */
  static async getFile(path: string, bucket: R2Bucket): Promise<R2Object | null> {
    console.log(`[STORAGE_START] path=${path} operation=file_retrieve`);
    
    try {
      const object = await bucket.get(path);
      
      if (object) {
        console.log(`[STORAGE_SUCCESS] path=${path} operation=file_retrieved`);
      } else {
        console.log(`[STORAGE_NOT_FOUND] path=${path} operation=file_not_found`);
      }
      
      return object;
    } catch (error) {
      console.error(`[STORAGE_ERROR] path=${path} error_type=retrieval_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Retrieve JSON data from R2
   * @param path The file path
   * @param bucket The R2 bucket
   * @returns The parsed JSON data or null if not found
   */
  static async getJSON<T>(path: string, bucket: R2Bucket): Promise<T | null> {
    console.log(`[STORAGE_START] path=${path} operation=json_retrieve`);
    
    try {
      const object = await bucket.get(path);
      
      if (!object) {
        console.log(`[STORAGE_NOT_FOUND] path=${path} operation=json_not_found`);
        return null;
      }

      const data = await object.json<T>();
      console.log(`[STORAGE_SUCCESS] path=${path} operation=json_retrieved`);
      return data;
    } catch (error) {
      console.error(`[STORAGE_ERROR] path=${path} error_type=json_retrieval_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Retrieve text data from R2
   * @param path The file path
   * @param bucket The R2 bucket
   * @returns The text content or null if not found
   */
  static async getText(path: string, bucket: R2Bucket): Promise<string | null> {
    console.log(`[STORAGE_START] path=${path} operation=text_retrieve`);
    
    try {
      const object = await bucket.get(path);
      
      if (!object) {
        console.log(`[STORAGE_NOT_FOUND] path=${path} operation=text_not_found`);
        return null;
      }

      const text = await object.text();
      console.log(`[STORAGE_SUCCESS] path=${path} text_length=${text.length} operation=text_retrieved`);
      return text;
    } catch (error) {
      console.error(`[STORAGE_ERROR] path=${path} error_type=text_retrieval_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Delete a file from R2
   * @param path The file path
   * @param bucket The R2 bucket
   */
  static async deleteFile(path: string, bucket: R2Bucket): Promise<void> {
    console.log(`[STORAGE_START] path=${path} operation=file_delete`);
    
    try {
      await bucket.delete(path);
      console.log(`[STORAGE_SUCCESS] path=${path} operation=file_deleted`);
    } catch (error) {
      console.error(`[STORAGE_ERROR] path=${path} error_type=deletion_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
