import { z } from "zod";

export const documentUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "File must be a PDF",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    })
    .refine((file) => file.size > 0, {
      message: "File cannot be empty",
    }),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
