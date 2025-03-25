export class GridException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'GridException';
  }
}

export class GridValidationException extends GridException {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'GridValidationException';
  }
}

export class GridApiException extends GridException {
  constructor(message: string, details?: any) {
    super(message, 'API_ERROR', details);
    this.name = 'GridApiException';
  }
}
