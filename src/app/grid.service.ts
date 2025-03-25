import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, catchError } from 'rxjs';
import { IGridGeneratorResponse } from '../interfaces/GridGeneratorResponse';
import { environment } from '../environments/environment';
import {
  GridValidationException,
  GridApiException,
} from './models/grid-exception.model';
import { BIAS_VALIDATION_ERRORS } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class GridService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/grid`;

  private validateBias(bias: string): void {
    if (!bias) {
      throw new GridValidationException(
        BIAS_VALIDATION_ERRORS.EMPTY_EXCEPTION,
        {
          bias,
        }
      );
    }

    if (bias.length !== 1) {
      throw new GridValidationException(
        BIAS_VALIDATION_ERRORS.SINGLE_CHARACTER_EXCEPTION,
        {
          bias,
        }
      );
    }

    if (bias.match(/[A-Z]/)) {
      throw new GridValidationException(
        BIAS_VALIDATION_ERRORS.UPPERCASE_EXCEPTION,
        {
          bias,
        }
      );
    }

    if (bias.match(/[0-9]/)) {
      throw new GridValidationException(
        BIAS_VALIDATION_ERRORS.NUMBER_EXCEPTION,
        { bias }
      );
    }

    if (!bias.match(/^[a-z]$/)) {
      throw new GridValidationException(
        BIAS_VALIDATION_ERRORS.UPPERCASE_EXCEPTION,
        {
          bias,
        }
      );
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
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

  getAlphabetMatrix(bias?: string): Observable<IGridGeneratorResponse> {
    // Validate bias first, before making any HTTP request
    if (bias) {
      try {
        this.validateBias(bias);
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

    // Only make HTTP request if validation passes
    const url = bias ? `${this.baseUrl}?bias=${bias}` : this.baseUrl;
    return this.http
      .get<IGridGeneratorResponse>(url)
      .pipe(catchError(this.handleError.bind(this)));
  }
}
