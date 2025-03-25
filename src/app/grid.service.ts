import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';
import { environment } from '../environments/environment';
import {
  GridValidationException,
  GridApiException,
} from './models/grid-exception.model';
import { GRID_EXCEPTIONS } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class GridService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/grid-response`;

  private validateBias(bias: string): void {
    if (!bias) return;

    if (bias.length !== 1) {
      throw new GridValidationException(
        GRID_EXCEPTIONS.SINGLE_CHARACTER_EXCEPTION,
        {
          bias,
        }
      );
    }

    if (bias.match(/[A-Z]/)) {
      throw new GridValidationException(GRID_EXCEPTIONS.UPPERCASE_EXCEPTION, {
        bias,
      });
    }

    if (bias.match(/[0-9]/)) {
      throw new GridValidationException(GRID_EXCEPTIONS.NUMBER_EXCEPTION, {
        bias,
      });
    }

    if (!bias.match(/^[a-z]$/)) {
      throw new GridValidationException(GRID_EXCEPTIONS.UPPERCASE_EXCEPTION, {
        bias,
      });
    }
  }

  getAlphabetMatrix(bias?: string): Observable<IGridGeneratorResponse> {
    try {
      if (bias) {
        this.validateBias(bias);
      }
      const url = bias ? `${this.baseUrl}?bias=${bias}` : this.baseUrl;
      return this.http.get<IGridGeneratorResponse>(url);
    } catch (error) {
      if (error instanceof GridValidationException) {
        return throwError(() => error);
      }
      return throwError(
        () =>
          new GridApiException('Failed to fetch grid data', {
            originalError: error,
          })
      );
    }
  }
}
