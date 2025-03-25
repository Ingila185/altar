import { TestBed } from '@angular/core/testing';
import { GridService } from './grid.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';
import { environment } from '../environments/environment';
import { GRID_EXCEPTIONS } from '../constants';

describe('GridService', () => {
  let service: GridService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + '/grid-response';

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
      gridContents: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      gridCode: 42,
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
      gridContents: [
        ['a', 'b'],
        ['c', 'd'],
      ],
      gridCode: 42,
    };

    service.getAlphabetMatrix(biasChar).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}?bias=${biasChar}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should throw error for capital letter bias', () => {
    const biasChar = 'Z';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error) => {
        expect(error.message).toBe(GRID_EXCEPTIONS.UPPERCASE_EXCEPTION);
      },
    });
  });

  it('should throw error for numeric bias', () => {
    const biasChar = '1';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error) => {
        expect(error.message).toBe(GRID_EXCEPTIONS.NUMBER_EXCEPTION);
      },
    });
  });

  it('should throw error for special character bias', () => {
    const biasChar = '@';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error) => {
        expect(error.message).toBe(GRID_EXCEPTIONS.UPPERCASE_EXCEPTION);
      },
    });
  });

  it('should throw error for multiple character bias', () => {
    const biasChar = 'ab';

    service.getAlphabetMatrix(biasChar).subscribe({
      error: (error) => {
        expect(error.message).toBe(GRID_EXCEPTIONS.SINGLE_CHARACTER_EXCEPTION);
      },
    });
  });

  it('should handle error response', () => {
    const errorResponse = new ErrorEvent('Network error', {
      message: 'Network error occurred',
    });

    service.getAlphabetMatrix().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.error(errorResponse);
  });
});
