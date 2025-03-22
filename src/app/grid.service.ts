import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  private apiUrl = 'http://localhost:3000/grid-response'; 


  constructor(private http: HttpClient) { }
  getAlphabetMatrix(): Observable<IGridGeneratorResponse> {
    return this.http.get<IGridGeneratorResponse>(this.apiUrl);
  }
}
