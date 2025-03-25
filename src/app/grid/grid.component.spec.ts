import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { GridComponent } from './grid.component';
import { GridService } from '../grid.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { IGridGeneratorResponse } from '../../interfaces/GridGeneratorResponse';
import {
  GridValidationException,
  GridApiException,
} from '../models/grid-exception.model';
import { GRID_EXCEPTIONS } from '../../constants';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let gridService: jasmine.SpyObj<GridService>;

  // Generate random lowercase alphabets for the grid
  const generateRandomGrid = (rows: number, cols: number): string[][] => {
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    return Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => alphabets[Math.floor(Math.random() * alphabets.length)])
      );
  };

  const mockResponse: IGridGeneratorResponse = {
    status: {
      code: 200,
      message: 'OK',
      success: true,
    },
    data: {
      gridContents: generateRandomGrid(10, 10),
      gridCode: 42,
      metadata: {
        dimensions: {
          rows: 10,
          columns: 10,
        },
        timestamp: '2023-01-01T00:00:00Z',
        version: '1.0.0',
      },
    },
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('GridService', ['getAlphabetMatrix']);
    spy.getAlphabetMatrix.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      imports: [GridComponent, HttpClientTestingModule],
      providers: [
        provideNoopAnimations(),
        { provide: GridService, useValue: spy },
      ],
    }).compileComponents();

    gridService = TestBed.inject(GridService) as jasmine.SpyObj<GridService>;
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Grid Generation', () => {
    it('should handle API error', fakeAsync(() => {
      const error = new GridApiException('Failed to fetch grid data', {
        originalError: new Error('Network error'),
      });
      gridService.getAlphabetMatrix.and.returnValue(throwError(() => error));

      component.generateMatrix();
      flush();

      expect(component.response().data.gridCode).toBe(0);
      expect(component.displayGrid()).toEqual(component.emptyGrid());
      expect(component.isGenerating()).toBeFalse();
      discardPeriodicTasks();
    }));

    it('should handle validation error', fakeAsync(() => {
      const error = new GridValidationException(
        GRID_EXCEPTIONS.UPPERCASE_EXCEPTION,
        {
          bias: 'Z',
        }
      );
      gridService.getAlphabetMatrix.and.returnValue(throwError(() => error));

      component.gridForm.patchValue({ biasChar: 'Z' });
      component.generateMatrix();
      flush();

      expect(component.response().data.gridCode).toBe(0);
      expect(component.displayGrid()).toEqual(component.emptyGrid());
      expect(component.isGenerating()).toBeFalse();
      discardPeriodicTasks();
    }));

    it('should handle empty response', fakeAsync(() => {
      const emptyResponse: IGridGeneratorResponse = {
        status: {
          code: 200,
          message: 'OK',
          success: true,
        },
        data: {
          gridContents: [],
          gridCode: 0,
          metadata: {
            dimensions: {
              rows: 0,
              columns: 0,
            },
            timestamp: '2023-01-01T00:00:00Z',
            version: '1.0.0',
          },
        },
      };
      gridService.getAlphabetMatrix.and.returnValue(of(emptyResponse));

      component.generateMatrix();
      flush();

      expect(component.response()).toEqual(emptyResponse);
      expect(component.displayGrid()).toEqual(component.emptyGrid());
      discardPeriodicTasks();
    }));

    it('should toggle generation state', fakeAsync(() => {
      expect(component.isGenerating()).toBeFalse();

      component.generateMatrix();
      flush();
      expect(component.isGenerating()).toBeTrue();

      component.generateMatrix();
      flush();
      expect(component.isGenerating()).toBeFalse();
    }));

    it('should call getAlphabetMatrix without parameters when no bias is provided', fakeAsync(() => {
      gridService.getAlphabetMatrix.calls.reset();

      component.generateMatrix();
      flush();

      expect(gridService.getAlphabetMatrix).toHaveBeenCalledWith();
      tick(1000);
      discardPeriodicTasks();
    }));

    it('should call getAlphabetMatrix with bias parameter when bias is provided', fakeAsync(() => {
      gridService.getAlphabetMatrix.calls.reset();

      const biasChar = 'z';
      component.gridForm.patchValue({ biasChar });
      fixture.detectChanges();

      component.generateMatrix();
      flush();

      expect(gridService.getAlphabetMatrix).toHaveBeenCalledWith(biasChar);
      tick(1000);
      discardPeriodicTasks();
    }));

    afterEach(() => {
      component.stopGeneration();
    });
  });
});
