import { TestBed } from '@angular/core/testing';
import { GridService } from './grid.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';
import { environment } from '../environments/environment';

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

  it('should make GET request with bias parameter', () => {
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
