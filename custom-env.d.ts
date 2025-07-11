interface CloudflareEnv {
  // TODO Remove them from here because we are not longer loading them from the Cloudflare Context
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  BREVO_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  
  // R2 Storage bindings
  PDF_BUCKET?: R2Bucket;
  
  // API Keys
  MISTRAL_AI_API_KEY?: string;
}
