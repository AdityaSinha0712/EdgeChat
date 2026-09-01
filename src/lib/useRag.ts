import { useCallback, useState } from 'react';
import { useEmbeddings, type EmbeddingStatus } from './useEmbeddings';
import { ragStore, type DocumentInfo, type SearchResult } from './ragStore';
import { extractText, chunkText, isSupportedFile } from './fileProcessor';

/**
 * Central hook for RAG (Retrieval-Augmented Generation).
 *
 * Manages the full flow: file upload → text extraction → chunking →
 * embedding → vector store. Also provides search for query-time retrieval.
 */
export function useRag() {
  const { status: embeddingStatus, progress: embeddingProgress, embed } = useEmbeddings();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  /**
   * Process a file: extract text, chunk it, embed chunks, store in vector store.
   */
  const addFile = useCallback(
    async (file: File): Promise<void> => {
      if (!isSupportedFile(file)) {
        console.warn(`Unsupported file type: ${file.name}`);
        return;
      }

      // Check if document is already loaded
      if (documents.some((d) => d.name === file.name)) {
        console.warn(`Document already loaded: ${file.name}`);
        return;
      }

      setProcessingFile(file.name);

      try {
        // 1. Extract text
        const text = await extractText(file);

        if (!text.trim()) {
          console.warn(`No text content found in: ${file.name}`);
          setProcessingFile(null);
          return;
        }

        // 2. Chunk text
        const chunks = chunkText(text);

        if (chunks.length === 0) {
          console.warn(`No chunks generated from: ${file.name}`);
          setProcessingFile(null);
          return;
        }

        // 3. Embed chunks
        const embeddings = await embed(chunks);

        // 4. Store in vector store
        ragStore.addDocument(file.name, chunks, embeddings);

        // 5. Update UI state
        setDocuments(ragStore.getDocuments());
      } catch (err) {
        console.error(`Failed to process file ${file.name}:`, err);
      } finally {
        setProcessingFile(null);
      }
    },
    [documents, embed],
  );

  /**
   * Remove a document from the vector store.
   */
  const removeDocument = useCallback((name: string): void => {
    ragStore.removeDocument(name);
    setDocuments(ragStore.getDocuments());
  }, []);

  /**
   * Search for relevant chunks given a query string.
   * Returns top-K results with their scores and source documents.
   */
  const searchContext = useCallback(
    async (query: string, topK = 5): Promise<SearchResult[]> => {
      if (!ragStore.hasDocuments()) return [];

      const queryEmbedding = await embed([query]);
      if (queryEmbedding.length === 0) return [];

      return ragStore.search(queryEmbedding[0], topK);
    },
    [embed],
  );

  /**
   * Build a RAG context string from search results,
   * suitable for prepending to the chat history as a system message.
   */
  const buildContextMessage = useCallback(
    async (query: string): Promise<string | null> => {
      if (!ragStore.hasDocuments()) return null;

      const lower = query.toLowerCase();
      const isBroadQuery =
        lower.includes('summarize') ||
        lower.includes('summary') ||
        lower.includes('overview') ||
        lower.includes('about') ||
        lower.includes('project') ||
        lower.includes('explain') ||
        lower.includes('what is');

      const topK = isBroadQuery ? 6 : 4;
      const results = await searchContext(query, topK);

      // Prepend initial introductory chunk of each loaded document if missing
      const initialChunks = ragStore.getInitialChunks();
      const combinedResults = [...results];

      for (const initChunk of initialChunks) {
        if (!combinedResults.some((r) => r.chunk === initChunk.chunk)) {
          combinedResults.unshift(initChunk);
        }
      }

      if (combinedResults.length === 0) return null;

      const contextChunks = combinedResults
        .map(
          (r, i) =>
            `[${i + 1}] (from ${r.source}${r.score ? `, relevance: ${(r.score * 100).toFixed(0)}%` : ''})\n${r.chunk}`,
        )
        .join('\n\n');

      return `Use the following context from the user's uploaded documents to answer their question. Be thorough, helpful, and accurate based on the context provided.

--- Context ---
${contextChunks}
--- End Context ---`;
    },
    [searchContext],
  );

  return {
    documents,
    embeddingStatus: embeddingStatus as EmbeddingStatus,
    embeddingProgress,
    processingFile,
    hasDocuments: documents.length > 0,
    addFile,
    removeDocument,
    buildContextMessage,
  };
}
