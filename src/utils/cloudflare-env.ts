/**
 * Get Cloudflare environment bindings for Next.js
 * This is a simplified version that works with the Next.js runtime
 */
export function getCloudflareEnv(): {
  PDF_BUCKET?: R2Bucket;
  MISTRAL_AI_API_KEY?: string;
} {
  // In Next.js with Cloudflare Pages, environment bindings are available on process.env
  // For R2, we need to access it through the runtime context
  if (typeof process !== 'undefined' && process.env) {
    return {
      MISTRAL_AI_API_KEY: process.env.MISTRAL_AI_API_KEY,
      // PDF_BUCKET will be available through the Cloudflare runtime
      // We'll handle this in the server action
    };
  }
  
  return {};
}

/**
 * Check if we're running in a Cloudflare environment
 */
export function isCloudflareEnvironment(): boolean {
  return typeof process !== 'undefined' && 
         process.env.CF_PAGES === '1' || 
         typeof globalThis !== 'undefined' && 
         'PDF_BUCKET' in globalThis;
}
