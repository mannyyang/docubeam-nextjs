"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { PdfUpload } from "@/components/pdf-upload";
import { UploadedDocument } from "@/types/document";

export function Hero() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUploadSuccess = (document: UploadedDocument) => {
    console.log('Document uploaded successfully:', document);
    // You can add additional logic here, like redirecting to a chat page
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement waitlist API call
      console.log('Joining waitlist with email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${email} has been added to our waitlist. We'll notify you when we launch!`);
      setEmail("");
    } catch (error) {
      console.error('Waitlist submission error:', error);
      alert('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="hero" className="relative w-full min-h-screen flex items-center justify-center text-center bg-black">
      <div className="mx-auto max-w-[80rem] px-6 md:px-8 py-20 relative z-10 flex flex-col items-center justify-center text-center">
        {/* Small badge/pill */}
        <div className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white dark:text-white transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1">
          <p className="mx-auto max-w-md text-white/80 dark:text-white/80 inline-flex items-center justify-center">
            <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
            <span>Introducing PDF Comment Extraction</span>
            <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </p>
        </div>

        {/* Main heading */}
        <h1 className="py-6 text-5xl font-medium leading-none tracking-tighter text-white text-balance sm:text-6xl md:text-7xl lg:text-8xl leading-[1.3]">
          <span className="text-white">Stop Chasing Comments,</span>
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] bg-clip-text text-transparent leading-[1.2]">
            Get Actionable Insights
          </span>
        </h1>

        {/* Subheading */}
        <p className="mb-8 text-lg tracking-tight text-gray-400 md:text-xl text-balance">
          Prioritize key discussions and centrally organize all data
        </p>

        {/* CTA with email input */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="relative w-full max-w-xs">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-1 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Join Waiting List</span>
                <ArrowRight className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        {/* PDF Upload Section */}
        <div className="w-full relative mt-[8rem]">
          <div className="rounded-xl border border-white/10 bg-transparent">
            <div className="relative z-10 bg-transparent p-8">
              <PdfUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
