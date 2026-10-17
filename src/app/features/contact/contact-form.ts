import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideLoaderCircle, LucideRefreshCw } from '@lucide/angular';
import { map } from 'rxjs';
import { CONTACT_FIELDS, CONTACT_RULES, ContactField, ContactRequest } from '../../models/contact';
import { ContactService } from '../../services/contact.service';

type FormStatus = 'idle' | 'submitting' | 'success' | 'failure';
type FieldError = { raw: string } | { key: string; params: Record<string, number> };

/** Required, ignoring surrounding whitespace. */
const notBlank: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  String(c.value ?? '').trim() ? null : { required: true };

/** Length rule on the trimmed value, matching how the value is submitted. */
function lengthBetween(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const length = String(c.value ?? '').trim().length;
    if (length === 0) {
      return null;
    }
    if (length < min) {
      return { minlength: { requiredLength: min } };
    }
    return length > max ? { maxlength: { requiredLength: max } } : null;
  };
}

interface FieldConfig {
  name: ContactField;
  type: 'text' | 'email' | 'textarea';
  autocomplete: string;
}

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, TranslocoPipe, LucideLoaderCircle, LucideRefreshCw],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" novalidate (ngSubmit)="submit()" class="flex flex-col gap-5" aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" class="text-xl font-bold text-slate-900">{{ 'contact.form.title' | transloco }}</h2>

      @for (field of fields; track field.name) {
        @let err = error(field.name);
        <div class="flex flex-col gap-1">
          <label [for]="'contact-' + field.name" class="text-sm font-semibold text-slate-700">
            {{ 'contact.form.' + field.name | transloco }}
          </label>
          @if (field.type === 'textarea') {
            <textarea
              [id]="'contact-' + field.name"
              [formControlName]="field.name"
              rows="6"
              [attr.maxlength]="rules.message.max"
              [attr.aria-invalid]="err ? 'true' : null"
              [attr.aria-describedby]="describedBy(field.name, !!err)"
              [class]="inputClass(!!err)"
            ></textarea>
            <p id="contact-message-counter" class="text-end text-xs text-slate-500" aria-live="polite">
              {{ 'contact.form.counter' | transloco: { count: messageLength(), max: rules.message.max } }}
            </p>
          } @else {
            <input
              [id]="'contact-' + field.name"
              [type]="field.type"
              [formControlName]="field.name"
              [attr.autocomplete]="field.autocomplete"
              [attr.aria-invalid]="err ? 'true' : null"
              [attr.aria-describedby]="describedBy(field.name, !!err)"
              [class]="inputClass(!!err)"
            />
          }
          @if (err) {
            <p [id]="'contact-' + field.name + '-error'" class="text-sm text-red-700">
              @if ('raw' in err) {
                {{ err.raw }}
              } @else {
                {{ err.key | transloco: err.params }}
              }
            </p>
          }
        </div>
      }

      @for (message of otherErrors(); track message) {
        <p class="text-sm text-red-700" role="alert">{{ message }}</p>
      }

      @switch (status()) {
        @case ('success') {
          <p class="rounded-lg bg-green-50 px-4 py-3 text-green-800 ring-1 ring-green-200" role="status">
            {{ 'contact.form.success' | transloco }}
          </p>
        }
        @case ('failure') {
          <div class="flex flex-wrap items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-800 ring-1 ring-red-200" role="alert">
            <span>{{ 'contact.form.failure' | transloco }}</span>
            <button type="button" class="inline-flex items-center gap-1 font-semibold underline" (click)="send()">
              <svg lucideRefreshCw class="size-4" aria-hidden="true"></svg>
              {{ 'contact.form.retry' | transloco }}
            </button>
          </div>
        }
      }

      <div>
        <button
          type="submit"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="status() === 'submitting'"
        >
          @if (status() === 'submitting') {
            <svg lucideLoaderCircle class="size-4 animate-spin" aria-hidden="true"></svg>
            {{ 'contact.form.sending' | transloco }}
          } @else {
            {{ 'contact.form.submit' | transloco }}
          }
        </button>
      </div>
    </form>
  `,
})
export class ContactForm {
  private readonly contact = inject(ContactService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly rules = CONTACT_RULES;
  protected readonly fields: FieldConfig[] = [
    { name: 'name', type: 'text', autocomplete: 'name' },
    { name: 'email', type: 'email', autocomplete: 'email' },
    { name: 'subject', type: 'text', autocomplete: 'off' },
    { name: 'message', type: 'textarea', autocomplete: 'off' },
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [notBlank, lengthBetween(CONTACT_RULES.name.min, CONTACT_RULES.name.max)]],
    email: ['', [notBlank, Validators.email]],
    subject: ['', [notBlank, lengthBetween(CONTACT_RULES.subject.min, CONTACT_RULES.subject.max)]],
    message: ['', [notBlank, lengthBetween(CONTACT_RULES.message.min, CONTACT_RULES.message.max)]],
  });

  protected readonly status = signal<FormStatus>('idle');
  protected readonly otherErrors = signal<string[]>([]);
  private readonly submitted = signal(false);

  protected readonly messageLength = toSignal(
    this.form.controls.message.valueChanges.pipe(map((value) => value.length)),
    { initialValue: 0 },
  );

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }
    this.send();
  }

  /** Sends the current values; also used by Retry, so the visitor's input is never lost. */
  protected send(): void {
    if (this.status() === 'submitting') {
      return;
    }
    this.status.set('submitting');
    this.otherErrors.set([]);
    const raw = this.form.getRawValue();
    const request: ContactRequest = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      subject: raw.subject.trim(),
      message: raw.message.trim(),
    };
    this.contact.submit(request).subscribe((result) => {
      switch (result.kind) {
        case 'success':
          this.form.reset();
          this.submitted.set(false);
          this.status.set('success');
          break;
        case 'validation':
          for (const [field, messages] of Object.entries(result.fieldErrors) as [ContactField, string[]][]) {
            const control = this.form.controls[field];
            control.setErrors({ ...control.errors, server: messages });
            control.markAsTouched();
          }
          this.otherErrors.set(result.otherErrors);
          this.status.set('idle');
          this.focusFirstInvalid();
          break;
        case 'failure':
          this.status.set('failure');
          break;
      }
    });
  }

  /** Server messages and client rules render the same way, in the same slot (FR-032). */
  protected error(field: ContactField): FieldError | null {
    const control = this.form.controls[field];
    if (!control.invalid || !(control.touched || this.submitted())) {
      return null;
    }
    const errors = control.errors ?? {};
    if (errors['server']) {
      return { raw: (errors['server'] as string[]).join(' ') };
    }
    if (errors['required']) {
      return { key: 'contact.errors.required', params: {} };
    }
    if (errors['minlength']) {
      return { key: 'contact.errors.minLength', params: { min: errors['minlength'].requiredLength } };
    }
    if (errors['maxlength']) {
      return { key: 'contact.errors.maxLength', params: { max: errors['maxlength'].requiredLength } };
    }
    return { key: 'contact.errors.email', params: {} };
  }

  protected describedBy(field: ContactField, hasError: boolean): string | null {
    const ids = [
      ...(field === 'message' ? ['contact-message-counter'] : []),
      ...(hasError ? [`contact-${field}-error`] : []),
    ];
    return ids.length ? ids.join(' ') : null;
  }

  protected inputClass(hasError: boolean): string {
    const base = 'w-full rounded-lg border bg-white px-3 py-2 text-slate-900';
    return hasError ? `${base} border-red-500` : `${base} border-slate-300 focus:border-brand-600`;
  }

  private focusFirstInvalid(): void {
    const first = CONTACT_FIELDS.find((field) => this.form.controls[field].invalid);
    if (first) {
      this.host.nativeElement.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
    }
  }
}
