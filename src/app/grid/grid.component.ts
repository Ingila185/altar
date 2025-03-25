import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgFor, CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { GridService } from '../grid.service';
import { IGridGeneratorResponse } from '../../interfaces/GridGeneratorResponse';
import { interval, Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { InstantErrorStateMatcher } from '../error-state-matcher';
import { INTERVALS } from '../../constants';

@Component({
  selector: 'grid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    NgFor,
    MatBadgeModule,
  ],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
})
export class GridComponent implements OnDestroy {
  // Services and utilities
  private readonly gridService = inject(GridService);
  private readonly fb = inject(FormBuilder);
  readonly matcher = new InstantErrorStateMatcher();

  // Form related
  readonly gridForm: FormGroup;

  // Signals
  private intervalSubscription?: Subscription;
  readonly isInputDisabled = signal<boolean>(false);
  readonly flattenedMatrix = signal<string[] | null>([]);
  readonly emptyGrid = signal<string[]>(Array(100).fill(' '));
  readonly isGenerating = signal<boolean>(false);
  readonly response = signal<IGridGeneratorResponse>({
    status: {
      code: 0,
      message: '',
      success: false,
    },
    data: {
      gridContents: [],
      gridCode: 0,
      metadata: {
        dimensions: {
          rows: 0,
          columns: 0,
        },
        timestamp: '',
        version: '',
      },
    },
  });

  // Computed values to be used in the template
  readonly displayGrid = computed<string[]>(() => {
    const matrix = this.flattenedMatrix();
    return matrix && matrix.length > 0 ? matrix : this.emptyGrid();
  });

  constructor() {
    this.gridForm = this.createForm();
  }

  // Form initialization
  private createForm(): FormGroup {
    return this.fb.group({
      biasChar: ['', [Validators.pattern(/^[a-z]$/), Validators.maxLength(1)]],
    });
  }

  // Grid generation methods
  public generateMatrix(): void {
    if (this.isGenerating()) {
      this.stopGeneration();
      return;
    }

    this.startGeneration();
  }

  private startGeneration(): void {
    this.isGenerating.set(true);
    this.updateGrid();
    this.startPeriodicUpdate();
  }

  private startPeriodicUpdate(): void {
    this.intervalSubscription = interval(INTERVALS.UPDATE_INTERVAL).subscribe(
      () => {
        this.updateGrid();
      }
    );
  }

  private updateGrid(): void {
    const biasChar = this.gridForm.controls['biasChar'].value;

    const handleResponse = (response: IGridGeneratorResponse) => {
      this.response.set(response);
      this.flattenedMatrix.set(response.data.gridContents.flat());
    };

    const handleError = (error: any) => {
      console.error('Error fetching grid:', error);
      this.response.set({
        status: {
          code: 0,
          message: '',
          success: false,
        },
        data: {
          gridContents: [],
          gridCode: 0,
          metadata: {
            dimensions: { rows: 0, columns: 0 },
            timestamp: '',
            version: '',
          },
        },
      });
      this.flattenedMatrix.set([]);
      this.stopGeneration();
    };

    if (biasChar) {
      this.gridService.getAlphabetMatrix(biasChar).subscribe({
        next: handleResponse,
        error: handleError,
      });
      this.handleBiasCharInput();
    } else {
      this.gridService.getAlphabetMatrix().subscribe({
        next: handleResponse,
        error: handleError,
      });
    }
  }

  private handleBiasCharInput(): void {
    this.startInputCooldown();
    this.gridForm.reset();
  }

  private startInputCooldown(): void {
    this.isInputDisabled.set(true);
    setTimeout(() => {
      this.isInputDisabled.set(false);
    }, INTERVALS.COOLDOWN_TIME);
  }

  stopGeneration(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    this.isGenerating.set(false);
  }

  // Lifecycle methods
  ngOnDestroy(): void {
    this.stopGeneration();
  }
}
