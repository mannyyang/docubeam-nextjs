# DocuBeam Project Plan

**Vision**: A SaaS platform that allows users to upload PDFs and chat with their documents using AI, with intelligent source linking to specific pages in a PDF viewer.

## 🎯 Current Sprint: Database Migration (D1 → Neon PostgreSQL)

**Goal**: Migrate from Cloudflare D1 to Neon PostgreSQL to support pgVector for embeddings
**Timeline**: 1-2 weeks
**Priority**: High (Foundation for vector capabilities)

### Tasks:
- [✅] Set up Neon PostgreSQL database
- [✅] Update Drizzle schema for PostgreSQL
- [✅] Update database connection logic
- [✅] Update Drizzle config for PostgreSQL
- [✅] Create migration scripts from D1 to Neon
- [✅] Update environment variables and connection logic
- [✅] Test database connection and table creation
- [✅] Fix Drizzle ORM compatibility issues (updated to v0.44.1)
- [✅] Resolve SQL syntax errors and deprecated pgTable signatures
- [✅] Verify sign-up and authentication flow working
- [ ] Deploy and verify production migration

---

## 📋 Milestone 1: Vector Pipeline Setup
**Status**: 📋 Planned
**Goal**: Add document chunking and vector embeddings to the upload pipeline
**Dependencies**: Database migration completed

### Key Deliverables:
- [ ] Add pgVector extension to Neon PostgreSQL
- [ ] Create embeddings table schema
- [ ] Implement text chunking service (chunk OCR results)
- [ ] Add embedding generation (OpenAI/Cloudflare AI)
- [ ] Update upload pipeline to include vector processing
- [ ] Create vector search utilities

### Technical Details:
- Chunk size: ~500-1000 tokens with overlap
- Store chunks with page references and bounding boxes
- Use OpenAI text-embedding-3-small or Cloudflare AI embeddings
- Index vectors for fast similarity search

---

## 📋 Milestone 2: Chat Interface & AI Agent
**Status**: 📋 Planned  
**Goal**: Build chat interface that queries vectors and returns sources
**Dependencies**: Vector pipeline completed

### Key Deliverables:
- [ ] Create chat UI component
- [ ] Implement vector similarity search
- [ ] Build AI agent that combines vector results with LLM
- [ ] Add source citation system (page numbers + confidence)
- [ ] Create chat history persistence
- [ ] Add streaming responses

### Technical Details:
- Use RAG pattern: vector search → context injection → LLM response
- Return sources with page numbers and relevance scores
- Support follow-up questions with conversation context
- Stream responses for better UX

---

## 📋 Milestone 3: PDF Viewer with Source Linking
**Status**: 📋 Planned
**Goal**: PDF viewer that highlights and jumps to source pages from chat
**Dependencies**: Chat interface completed

### Key Deliverables:
- [ ] Integrate PDF viewer component (PDF.js or react-pdf)
- [ ] Implement page navigation from chat sources
- [ ] Add text highlighting for specific chunks
- [ ] Create source overlay/annotations
- [ ] Add zoom and navigation controls
- [ ] Mobile-responsive PDF viewing

### Technical Details:
- Click source links in chat → jump to specific PDF page
- Highlight relevant text sections when possible
- Support page thumbnails for quick navigation
- Handle large PDFs efficiently

---

## 📋 Milestone 4: Document Management & UX
**Status**: 📋 Planned
**Goal**: Complete document management and user experience
**Dependencies**: PDF viewer completed

### Key Deliverables:
- [ ] Document library/dashboard
- [ ] Document sharing and permissions
- [ ] Chat history management
- [ ] Document deletion and cleanup
- [ ] Search across documents
- [ ] Usage analytics and limits

---

## 📋 Milestone 5: Performance & Polish
**Status**: 📋 Planned
**Goal**: Optimize performance and add production features
**Dependencies**: Core features completed

### Key Deliverables:
- [ ] Optimize vector search performance
- [ ] Add caching for embeddings and chat
- [ ] Implement background processing for large PDFs
- [ ] Add error handling and retry logic
- [ ] Performance monitoring and logging
- [ ] SEO and marketing page updates

---

## 🚀 Future Ideas (Parking Lot)

### Advanced Features:
- [ ] Multi-document chat (chat across multiple PDFs)
- [ ] Document comparison and analysis
- [ ] Export chat conversations
- [ ] API access for developers
- [ ] Collaborative annotations
- [ ] OCR accuracy improvements
- [ ] Support for other document types (DOCX, images)

### Integrations:
- [ ] Slack/Discord bot integration
- [ ] Browser extension for web PDFs
- [ ] Mobile app
- [ ] Zapier/webhook integrations

### Business Features:
- [ ] Team workspaces with shared documents
- [ ] Advanced analytics dashboard
- [ ] White-label solutions
- [ ] Enterprise SSO

---

## ✅ Completed

### Infrastructure Setup:
- ✅ Next.js SaaS template with Cloudflare Workers
- ✅ Authentication system (Lucia Auth)
- ✅ File upload to R2 storage
- ✅ OCR processing pipeline
- ✅ Basic document metadata storage
- ✅ Team management and billing system

---

## 📊 Technical Architecture

### Current Stack:
- **Frontend**: Next.js 15, React, Tailwind CSS, Shadcn UI
- **Backend**: Cloudflare Workers, OpenNext
- **Database**: Neon PostgreSQL ✅ (migrated from D1)
- **Storage**: Cloudflare R2
- **OCR**: Cloudflare AI Vision
- **Auth**: Lucia Auth with KV sessions

### Next Phase (Vector Pipeline):
- **Database**: Neon PostgreSQL with pgVector extension
- **Embeddings**: OpenAI text-embedding-3-small or Cloudflare AI
- **Vector Search**: pgVector with cosine similarity
- **LLM**: OpenAI GPT-4 or Cloudflare AI
- **PDF Viewer**: PDF.js or react-pdf

---

## 🎯 Success Metrics

### MVP Success:
- [ ] Users can upload PDFs and get OCR results
- [ ] Users can chat with their PDFs and get relevant answers
- [ ] Chat responses include source page references
- [ ] PDF viewer shows the referenced pages
- [ ] System handles PDFs up to 50 pages efficiently

### Growth Metrics:
- [ ] Document upload success rate > 95%
- [ ] Chat response time < 3 seconds
- [ ] User retention > 40% after first week
- [ ] Average session time > 10 minutes

---

## 🔧 Development Notes

### Database Migration Strategy:
1. Set up Neon PostgreSQL in parallel
2. Create migration scripts for existing data
3. Test thoroughly in development
4. Plan maintenance window for production migration
5. Keep D1 as backup during transition period

### Vector Pipeline Considerations:
- Chunk overlap to maintain context across boundaries
- Store original text + embeddings + metadata
- Consider chunking strategies for tables and images
- Plan for re-processing documents if chunking strategy changes

### Performance Targets:
- PDF upload: < 30 seconds for 20-page document
- Vector search: < 500ms for similarity queries
- Chat response: < 3 seconds end-to-end
- PDF viewer: < 2 seconds to load and navigate

---

**Last Updated**: January 3, 2025
**Next Review**: Weekly on Mondays
