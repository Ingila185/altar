import { TestBed } from '@angular/core/testing';
import { GridService } from './grid.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';
import { environment } from '../environments/environment';
import {
  GridValidationException,
  GridApiException,
} from './models/grid-exception.model';
import { BIAS_VALIDATION_ERRORS } from '../constants';
import { HttpErrorResponse } from '@angular/common/http';

describe('GridService', () => {
  let service: GridService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + '/grid';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GridService],
    });

    service = TestBed.inject(GridService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make GET request without bias parameter', () => {
    const mockResponse: IGridGeneratorResponse = {
      status: {
        code: 200,
        message: 'OK',
        success: true,
      },
      data: {
        gridContents: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        gridCode: 42,
        metadata: {
          dimensions: {
            rows: 2,
            columns: 2,
          },
          timestamp: '2023-01-01T00:00:00Z',
          version: '1.0.0',
        },
      },
    };

    service.getAlphabetMatrix().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should make GET request with valid bias parameter', () => {
    const biasChar = 'z';
    const mockResponse: IGridGeneratorResponse = {
      status: {
        code: 200,
        message: 'OK',
        success: true,
      },
      data: {
        gridContents: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        gridCode: 42,
        metadata: {
          dimensions: {
            rows: 2,
            columns: 2,
          },
          biasCharacter: biasChar,
          biasPercentage: 50,
          timestamp: '2023-01-01T00:00:00Z',
          version: '1.0.0',
        },
      },
    };

    service.getAlphabetMatrix(biasChar).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}?bias=${biasChar}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should throw GridValidationException for capital letter bias', () => {
    const biasChar = 'Z';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error: GridValidationException) => {
        expect(error).toBeInstanceOf(GridValidationException);
        expect(error.message).toBe(BIAS_VALIDATION_ERRORS.UPPERCASE_EXCEPTION);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({ bias: biasChar });
      },
    });
  });

  it('should throw GridValidationException for numeric bias', () => {
    const biasChar = '1';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error: GridValidationException) => {
        expect(error).toBeInstanceOf(GridValidationException);
        expect(error.message).toBe(BIAS_VALIDATION_ERRORS.NUMBER_EXCEPTION);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({ bias: biasChar });
      },
    });
  });

  it('should throw GridValidationException for special character bias', () => {
    const biasChar = '@';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error: GridValidationException) => {
        expect(error).toBeInstanceOf(GridValidationException);
        expect(error.message).toBe(BIAS_VALIDATION_ERRORS.UPPERCASE_EXCEPTION);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({ bias: biasChar });
      },
    });
  });

  it('should throw GridValidationException for multiple character bias', () => {
    const biasChar = 'ab';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error: GridValidationException) => {
        expect(error).toBeInstanceOf(GridValidationException);
        expect(error.message).toBe(
          BIAS_VALIDATION_ERRORS.SINGLE_CHARACTER_EXCEPTION
        );
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({ bias: biasChar });
      },
    });
  });

  it('should handle API error with GridApiException', () => {
    const errorResponse = new ErrorEvent('Network error', {
      message: 'Network error occurred',
    });

    service.getAlphabetMatrix().subscribe({
      error: (error: GridApiException) => {
        expect(error).toBeInstanceOf(GridApiException);
        expect(error.code).toBe('API_ERROR');
        expect(error.details.originalError).toBeInstanceOf(HttpErrorResponse);
        expect(error.details.originalError.error).toBe(errorResponse);
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.error(errorResponse);
  });

  it('should handle non-HTTP errors with GridApiException', () => {
    // Mock a non-HTTP error by throwing a regular Error
    const originalError = new Error('Test error');
    spyOn(service as any, 'validateBias').and.throwError(originalError);

    service.getAlphabetMatrix('a').subscribe({
      error: (error: GridApiException) => {
        expect(error).toBeInstanceOf(GridApiException);
        expect(error.code).toBe('API_ERROR');
        expect(error.details.originalError).toBe(originalError);
      },
    });
  });

  it('should handle non-letter single character bias', () => {
    // Mock the validation to throw error before HTTP request
    spyOn(service as any, 'validateBias').and.throwError(
      new GridValidationException(BIAS_VALIDATION_ERRORS.UPPERCASE_EXCEPTION, {
        bias: '!',
      })
    );

    service.getAlphabetMatrix('!').subscribe({
      error: (error: GridValidationException) => {
        expect(error).toBeInstanceOf(GridValidationException);
        expect(error.message).toBe(BIAS_VALIDATION_ERRORS.UPPERCASE_EXCEPTION);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({ bias: '!' });
      },
    });
  });
});
