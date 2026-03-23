export interface IngestionResult {
  success: boolean;
  filesProcessed: number;
  chunksIndexed: number;
  fileNames: string[];
  errors: string[];
  processedAt: string;
}

export interface CollectionStatus {
  exists: boolean;
  vectorCount: number;
  collectionName: string;
}

export interface SearchResult {
  items: SearchResultItem[];
}

export interface SearchResultItem {
  fileName: string;
  content: string;
  score: number;
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}
