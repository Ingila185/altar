import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GridService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/grid-response`;

  getAlphabetMatrix(bias?: string): Observable<IGridGeneratorResponse> {
    const url = bias ? `${this.baseUrl}?bias=${bias}` : this.baseUrl;
    return this.http.get<IGridGeneratorResponse>(url);
  }
}
