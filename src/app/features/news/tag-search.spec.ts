import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { TagSearch } from './tag-search';

describe('TagSearch', () => {
  function render(value: string | null = null) {
    TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(TagSearch);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const emitted: string[] = [];
    fixture.componentInstance.search.subscribe((t) => emitted.push(t));
    const input = el.querySelector('input')!;
    const type = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
    };
    const submit = () => el.querySelector('form')!.dispatchEvent(new Event('submit'));
    return { el, input, type, submit, emitted };
  }

  it('is a labelled search form with a linked hint', () => {
    const { el, input } = render();
    expect(el.querySelector('form')!.getAttribute('role')).toBe('search');
    expect(el.querySelector('label')!.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe('tag-search-hint');
    expect(el.querySelector('#tag-search-hint')!.textContent).toContain('matched exactly');
  });

  it('emits the trimmed tag without changing its case', () => {
    const { type, submit, emitted } = render();
    type('  Demo ');
    submit();
    expect(emitted).toEqual(['Demo']);
  });

  it('emits nothing for an empty or blank value', () => {
    const { type, submit, emitted } = render();
    type('   ');
    submit();
    expect(emitted).toEqual([]);
  });

  it('starts with the active tag from the URL', () => {
    expect(render('news').input.value).toBe('news');
  });
});
