import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  function render(page: number, total: number, pageSize = 20) {
    TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
    return fixture;
  }

  it('hides itself when everything fits on one page', () => {
    expect(render(1, 8).nativeElement.querySelector('nav')).toBeNull();
  });

  it('shows page X of Y and disables prev on the first page', () => {
    const fixture = render(1, 45);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Page 1 of 3');
    const [prev, next] = Array.from(el.querySelectorAll('button'));
    expect(prev.disabled).toBeTrue();
    expect(next.disabled).toBeFalse();
    expect(el.querySelector('[aria-current="page"]')).not.toBeNull();
  });

  it('emits the requested page', () => {
    const fixture = render(2, 45);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));
    const [prev, next] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    prev.click();
    next.click();
    expect(emitted).toEqual([1, 3]);
  });
});
