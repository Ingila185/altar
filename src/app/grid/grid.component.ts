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
import { NgFor } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { GridService } from '../grid.service';
import { IGridGeneratorResponse } from '../../interfaces/GridGeneratorResponse';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { InstantErrorStateMatcher } from '../error-state-matcher';

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
  providers: [GridService],
})
export class GridComponent implements OnDestroy {
  private gridService = inject(GridService);
  private fb = inject(FormBuilder);
  matcher = new InstantErrorStateMatcher();

  gridForm: FormGroup;

  constructor() {
    this.gridForm = this.fb.group({
      baisChar: ['', [Validators.pattern(/^[a-z]$/), Validators.maxLength(1)]],
    });
  }

  flattenedMatrix = signal<string[] | null>([]);
  emptyGrid = signal<string[]>(Array(100).fill(' '));
  isGenerating = signal<boolean>(false);
  // Ensure computed signal always returns a non-null array
  displayGrid = computed<string[]>(() => {
    const matrix = this.flattenedMatrix();
    return matrix && matrix.length > 0 ? matrix : this.emptyGrid();
  });

  private intervalSubscription?: Subscription;

  response = signal<IGridGeneratorResponse>({
    gridContents: [],
    gridCode: 0,
  });

  generateMatrix() {
    if (this.isGenerating()) {
      this.stopGeneration();
      return;
    }

    // Start new generation
    this.isGenerating.set(true);

    // Generate initial grid immediately
    this.updateGrid();

    // Then update every second
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.updateGrid();
    });
  }

  updateGrid() {
    if (this.gridForm.controls['baisChar'].value) {
      this.gridService
        .getAlphabetMatrix(this.gridForm.controls['baisChar'].value)
        .subscribe((response: IGridGeneratorResponse) => {
          this.response.set(response);
          this.flattenedMatrix.set(this.response().gridContents.flat());
        });
    } else {
      this.gridService
        .getAlphabetMatrix()
        .subscribe((response: IGridGeneratorResponse) => {
          this.response.set(response);
          this.flattenedMatrix.set(this.response().gridContents.flat());
        });
    }
  }

  stopGeneration() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = undefined;
    }
    this.isGenerating.set(false);
  }

  ngOnDestroy(): void {
    this.stopGeneration();
  }
}
