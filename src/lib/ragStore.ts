/**
 * In-memory vector store for RAG retrieval.
 *
 * Stores document chunks with their embeddings and provides
 * cosine-similarity search for finding relevant context.
 */

interface StoredChunk {
  text: string;
  embedding: number[];
  source: string; // document filename
}

export interface DocumentInfo {
  name: string;
  chunkCount: number;
}

export interface SearchResult {
  chunk: string;
  score: number;
  source: string;
}

/**
 * Simple in-memory vector store.
 * All data lives in memory — cleared on refresh.
 */
class RagStore {
  private chunks: StoredChunk[] = [];

  /**
   * Add a document's chunks and their embeddings to the store.
   */
  addDocument(name: string, texts: string[], embeddings: number[][]): void {
    if (texts.length !== embeddings.length) {
      throw new Error('Texts and embeddings arrays must have the same length');
    }
    for (let i = 0; i < texts.length; i++) {
      this.chunks.push({
        text: texts[i],
        embedding: embeddings[i],
        source: name,
      });
    }
  }

  /**
   * Remove all chunks belonging to a specific document.
   */
  removeDocument(name: string): void {
    this.chunks = this.chunks.filter((c) => c.source !== name);
  }

  /**
   * Get a list of loaded documents with their chunk counts.
   */
  getDocuments(): DocumentInfo[] {
    const counts = new Map<string, number>();
    for (const chunk of this.chunks) {
      counts.set(chunk.source, (counts.get(chunk.source) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, chunkCount]) => ({
      name,
      chunkCount,
    }));
  }

  /**
   * Check if any documents are loaded.
   */
  hasDocuments(): boolean {
    return this.chunks.length > 0;
  }

  /**
   * Search for the most relevant chunks given a query embedding.
   */
  search(queryEmbedding: number[], topK = 3): SearchResult[] {
    if (this.chunks.length === 0) return [];

    const scored = this.chunks.map((chunk) => ({
      chunk: chunk.text,
      source: chunk.source,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Get the initial introductory chunk of each loaded document.
   */
  getInitialChunks(): SearchResult[] {
    const docFirstChunks = new Map<string, string>();
    for (const chunk of this.chunks) {
      if (!docFirstChunks.has(chunk.source)) {
        docFirstChunks.set(chunk.source, chunk.text);
      }
    }
    return Array.from(docFirstChunks.entries()).map(([source, chunk]) => ({
      chunk,
      score: 1.0,
      source,
    }));
  }

  /**
   * Clear all stored documents and chunks.
   */
  clear(): void {
    this.chunks = [];
  }
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// Singleton instance
export const ragStore = new RagStore();
