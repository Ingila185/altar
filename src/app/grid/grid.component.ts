import { Component, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgFor } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { GridService } from '../grid.service';
import { IGridGeneratorResponse } from '../../interfaces/GridGeneratorResponse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grid',
  standalone: true,
  imports: [
    CommonModule,
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
export class GridComponent implements OnInit {
 
  private gridService = inject(GridService);
  constructor() {}

  flattenedMatrix: string[] | null = null;
  emptyGrid: string[] = Array(100).fill(' '); 

  

  response: IGridGeneratorResponse = {
    gridContents: [],
    gridCode: 0,
  };


  ngOnInit(): void {
   
    console.log(this.emptyGrid);
  }
  generateMatrix(){
    this.gridService.getAlphabetMatrix().subscribe((response: IGridGeneratorResponse) => {
      this.response.gridContents = response.gridContents;
      this.flattenedMatrix = this.response.gridContents.flat();
    });
  }



}



