import { TestBed } from '@angular/core/testing';
import categoriesSample from '../../../../docs/api/samples/E2-categories.json';
import { Category } from '../../models/category';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { CategoryFilter } from './category-filter';

describe('CategoryFilter', () => {
  const categories = categoriesSample.items as unknown as Category[];

  function render(selectedId: string | null) {
    TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(CategoryFilter);
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('selectedId', selectedId);
    fixture.detectChanges();
    return fixture;
  }

  it('renders "All" first, then categories in editor order', () => {
    const el = render(null).nativeElement as HTMLElement;
    const labels = Array.from(el.querySelectorAll('button')).map((b) => b.textContent!.trim());
    expect(labels).toEqual(['All', 'Technology', 'Sports', 'Business']);
  });

  it('marks the selected option as pressed', () => {
    const el = render(categories[1].id).nativeElement as HTMLElement;
    const pressed = Array.from(el.querySelectorAll('button')).map((b) => b.getAttribute('aria-pressed'));
    expect(pressed).toEqual(['false', 'false', 'true', 'false']);
  });

  it('emits the category id, or null for "All"', () => {
    const fixture = render(categories[0].id);
    const emitted: (string | null)[] = [];
    fixture.componentInstance.selectedChange.subscribe((id) => emitted.push(id));
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    buttons[3].click();
    buttons[0].click();
    expect(emitted).toEqual([categories[2].id, null]);
  });

  it('shows the category colour swatch when present', () => {
    const el = render(null).nativeElement as HTMLElement;
    expect(el.querySelectorAll('button span[aria-hidden="true"]').length).toBe(
      categories.filter((c) => c.properties.colour).length,
    );
  });
});
