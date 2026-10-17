import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { EmptyBlock } from './empty-block';
import { ErrorBlock } from './error-block';
import { LoadingBlock } from './loading-block';
import { NotFoundBlock } from './not-found-block';

describe('state blocks', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideTranslocoTesting()],
    });
  });

  it('LoadingBlock announces loading politely', () => {
    const fixture = TestBed.createComponent(LoadingBlock);
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Loading');
  });

  it('EmptyBlock renders the given message key', () => {
    const fixture = TestBed.createComponent(EmptyBlock);
    fixture.componentRef.setInput('message', 'news.noResults');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No articles match your search.');
  });

  it('ErrorBlock is an alert and emits retry', () => {
    const fixture = TestBed.createComponent(ErrorBlock);
    fixture.detectChanges();
    let retried = 0;
    fixture.componentInstance.retry.subscribe(() => retried++);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    el.querySelector('button')!.click();
    expect(retried).toBe(1);
  });

  it('NotFoundBlock renders a heading and a link', () => {
    const fixture = TestBed.createComponent(NotFoundBlock);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')!.textContent).toContain("We couldn't find that page.");
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/news');
  });
});
