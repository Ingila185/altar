import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';

@Injectable({
  providedIn: 'root',
})
export class GridService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/grid-response';

  getAlphabetMatrix(baisChar?: string): Observable<IGridGeneratorResponse> {
    const url = baisChar ? `${this.apiUrl}?basisChar=${baisChar}` : this.apiUrl;
    return this.http.get<IGridGeneratorResponse>(url);
  }
}
