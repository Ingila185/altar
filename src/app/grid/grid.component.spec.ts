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
    gridContents: generateRandomGrid(10, 10), // 10x10 grid
    gridCode: 42,
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
      const error = new Error('API Error');
      gridService.getAlphabetMatrix.and.returnValue(throwError(() => error));

      // Subscribe to the error case
      component.generateMatrix();

      // Flush all pending async operations
      flush();

      // Verify the component state after error
      expect(component.response().gridCode).toBe(0);
      expect(component.displayGrid()).toEqual(component.emptyGrid());
      expect(component.isGenerating()).toBeFalse();
      discardPeriodicTasks();
    }));

    it('should handle empty response', fakeAsync(() => {
      const emptyResponse: IGridGeneratorResponse = {
        gridContents: [],
        gridCode: 0,
      };
      gridService.getAlphabetMatrix.and.returnValue(of(emptyResponse));

      component.generateMatrix();

      // Flush all pending async operations
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
      // Reset the spy call count
      gridService.getAlphabetMatrix.calls.reset();

      // Start generation
      component.generateMatrix();

      // Flush all pending async operations
      flush();

      // Verify the service was called without parameters
      expect(gridService.getAlphabetMatrix).toHaveBeenCalledWith();

      // Wait for the interval subscription
      tick(1000);

      // Clean up timers
      discardPeriodicTasks();
    }));

    it('should call getAlphabetMatrix with bias parameter when bias is provided', fakeAsync(() => {
      // Reset the spy call count
      gridService.getAlphabetMatrix.calls.reset();

      // Set bias character
      const biasChar = 'z';
      component.gridForm.patchValue({ biasChar });
      fixture.detectChanges();

      // Start generation
      component.generateMatrix();

      // Flush all pending async operations
      flush();

      // Verify the service was called with bias parameter
      expect(gridService.getAlphabetMatrix).toHaveBeenCalledWith(biasChar);

      // Wait for the interval subscription
      tick(1000);

      // Clean up timers
      discardPeriodicTasks();
    }));

    afterEach(() => {
      // Stop generation to clean up interval subscription
      component.stopGeneration();
    });
  });
});
