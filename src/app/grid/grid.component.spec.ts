import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
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
    it('should handle empty response', () => {
      const emptyResponse: IGridGeneratorResponse = {
        gridContents: [],
        gridCode: 0,
      };
      gridService.getAlphabetMatrix.and.returnValue(of(emptyResponse));

      component.generateMatrix();

      expect(component.response()).toEqual(emptyResponse);
      expect(component.displayGrid()).toEqual(component.emptyGrid());
    });

    it('should handle API error', () => {
      const error = new Error('API Error');
      gridService.getAlphabetMatrix.and.returnValue(throwError(() => error));

      component.generateMatrix();

      expect(component.response().gridCode).toBe(0);
      expect(component.displayGrid()).toEqual(component.emptyGrid());
    });

    it('should toggle generation state', () => {
      expect(component.isGenerating()).toBeFalse();

      component.generateMatrix();
      expect(component.isGenerating()).toBeTrue();

      component.generateMatrix();
      expect(component.isGenerating()).toBeFalse();
    });
  });
});
