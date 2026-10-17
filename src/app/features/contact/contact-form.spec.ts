import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { ContactRequest, ContactResult } from '../../models/contact';
import { ContactService } from '../../services/contact.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  let fixture: ComponentFixture<ContactForm>;
  let el: HTMLElement;
  let submitSpy: jasmine.Spy<(req: ContactRequest) => Observable<ContactResult>>;

  function render(respond: () => Observable<ContactResult>) {
    submitSpy = jasmine.createSpy('submit').and.callFake(respond);
    TestBed.configureTestingModule({
      providers: [provideTranslocoTesting(), { provide: ContactService, useValue: { submit: submitSpy } }],
    });
    fixture = TestBed.createComponent(ContactForm);
    fixture.autoDetectChanges();
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el); // so focus() works
  }

  afterEach(() => el?.remove());

  const field = (name: string) => el.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#contact-${name}`)!;
  const errorText = (name: string) => el.querySelector(`#contact-${name}-error`)?.textContent?.trim() ?? null;
  function type(name: string, value: string) {
    const input = field(name);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
  function fillValid() {
    type('name', 'Jane Doe');
    type('email', 'jane@example.com');
    type('subject', 'Hello there');
    type('message', 'This is a test message that is definitely long enough.');
  }
  const submit = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  it('labels every field and links errors with aria-describedby', () => {
    render(() => of({ kind: 'failure' }));
    for (const name of ['name', 'email', 'subject', 'message']) {
      expect(el.querySelector(`label[for="contact-${name}"]`)).not.toBeNull();
    }
    submit();
    expect(field('email').getAttribute('aria-invalid')).toBe('true');
    expect(field('email').getAttribute('aria-describedby')).toContain('contact-email-error');
  });

  it('shows client errors on all four fields, focuses Name, and sends nothing', () => {
    render(() => of({ kind: 'failure' }));
    type('name', 'J');
    type('email', 'not-an-email');
    type('subject', 'Hi');
    type('message', 'short');
    submit();

    expect(errorText('name')).toBe('Please enter at least 2 characters.');
    expect(errorText('email')).toBe('Please enter a valid email address.');
    expect(errorText('subject')).toBe('Please enter at least 3 characters.');
    expect(errorText('message')).toBe('Please enter at least 10 characters.');
    expect(document.activeElement).toBe(field('name'));
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('treats whitespace-only input as missing', () => {
    render(() => of({ kind: 'failure' }));
    type('name', '    ');
    submit();
    expect(errorText('name')).toBe('This field is required.');
  });

  it('sends trimmed values; on success shows confirmation and clears the form', () => {
    render(() => of({ kind: 'success', submittedAt: '2026-10-17T00:00:00Z' }));
    fillValid();
    type('name', '  Jane Doe  ');
    submit();

    expect(submitSpy).toHaveBeenCalledOnceWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Hello there',
      message: 'This is a test message that is definitely long enough.',
    });
    expect(el.querySelector('[role="status"]')!.textContent).toContain('Your message has been sent');
    expect(field('name').value).toBe('');
    expect(errorText('name')).toBeNull();
  });

  it('puts server validation messages under their fields and keeps the input', () => {
    render(() =>
      of({ kind: 'validation', fieldErrors: { email: ['The Email field is not a valid e-mail address.'] }, otherErrors: [] }),
    );
    fillValid();
    submit();

    expect(errorText('email')).toBe('The Email field is not a valid e-mail address.');
    expect(field('email').value).toBe('jane@example.com');
    expect(document.activeElement).toBe(field('email'));
  });

  it('on failure shows a retry that resubmits the same values', () => {
    render(() => of({ kind: 'failure' }));
    fillValid();
    submit();

    const alert = el.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain("couldn't be sent");
    expect(field('subject').value).toBe('Hello there');
    (alert.querySelector('button') as HTMLButtonElement).click();
    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(submitSpy.calls.mostRecent().args[0].subject).toBe('Hello there');
  });

  it('disables the button while sending and ignores repeat submits', () => {
    const pending = new Subject<ContactResult>();
    render(() => pending);
    fillValid();
    submit();
    submit();

    const button = el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Sending');
    expect(submitSpy).toHaveBeenCalledTimes(1);

    pending.next({ kind: 'success', submittedAt: '' });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('counts message characters', () => {
    render(() => of({ kind: 'failure' }));
    type('message', 'hello');
    expect(el.querySelector('#contact-message-counter')!.textContent!.trim()).toBe('5 / 2000');
  });
});
