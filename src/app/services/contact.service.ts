import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import {
  CONTACT_FIELDS,
  ContactField,
  ContactRequest,
  ContactResult,
  ContactSuccessResponse,
  ContactValidationResponse,
} from '../models/contact';

/** E13 — the only write. The returned observable never errors; every outcome is a ContactResult. */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly api = inject(ApiService);

  submit(request: ContactRequest): Observable<ContactResult> {
    return this.api.post<ContactSuccessResponse>('/api/contact', request).pipe(
      map((res): ContactResult => ({ kind: 'success', submittedAt: res.body?.submittedAt ?? '' })),
      catchError((error: unknown) => of(toFailure(error))),
    );
  }
}

function toFailure(error: unknown): ContactResult {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400 || !isValidationBody(error.error)) {
    return { kind: 'failure' };
  }
  const fieldErrors: Partial<Record<ContactField, string[]>> = {};
  const otherErrors: string[] = [];
  for (const [key, messages] of Object.entries(error.error.errors)) {
    // Server keys are PascalCase (`Name`); match fields case-insensitively.
    const field = CONTACT_FIELDS.find((f) => f === key.toLowerCase());
    if (field) {
      fieldErrors[field] = messages;
    } else {
      otherErrors.push(...messages);
    }
  }
  return { kind: 'validation', fieldErrors, otherErrors };
}

function isValidationBody(body: unknown): body is ContactValidationResponse {
  const candidate = body as Partial<ContactValidationResponse> | null;
  return candidate?.status === 'validationError' && typeof candidate.errors === 'object' && candidate.errors !== null;
}
