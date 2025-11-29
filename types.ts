export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  groundingMetadata?: GroundingMetadata | null;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}