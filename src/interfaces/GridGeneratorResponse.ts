export interface ApiStatus {
  code: number;
  message: string;
  success: boolean;
  error?: string;
}

export interface IGridGeneratorResponse {
  status: ApiStatus;
  data: {
    gridContents: string[][];
    gridCode: number;
    metadata: {
      dimensions: {
        rows: number;
        columns: number;
      };
      biasCharacter?: string;
      biasPercentage?: number;
      timestamp: string;
      version: string;
    };
  };
}

export interface ErrorResponse {
  status: ApiStatus;
  data: null;
}
