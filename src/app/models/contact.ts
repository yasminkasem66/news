/** E13 request body. */
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** HTTP 201. */
export interface ContactSuccessResponse {
  status: 'success';
  submittedAt: string;
}

/** HTTP 400. Keys are PascalCase in practice (`Name`, `Email`, …) — research §11, M1. */
export interface ContactValidationResponse {
  status: 'validationError';
  errors: Record<string, string[]>;
}

export type ContactField = 'name' | 'email' | 'subject' | 'message';

export const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'subject', 'message'];

export type ContactResult =
  | { kind: 'success'; submittedAt: string }
  | { kind: 'validation'; fieldErrors: Partial<Record<ContactField, string[]>>; otherErrors: string[] }
  | { kind: 'failure' };

/** Mirrors the server rules: name 2–100, valid email, subject 3–150, message 10–2000 (all required). */
export const CONTACT_RULES = {
  name: { min: 2, max: 100 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 2000 },
} as const;
