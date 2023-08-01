export interface Quotes {
  chat: {
    prompt: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
}

export interface AuthorStats {
  totalAuthors: number;
  totalQuoteCount: number;
}
