import { TestBed } from '@angular/core/testing';
import { RichTextView } from './rich-text';

describe('RichTextView', () => {
  function render(markup: string | null) {
    const fixture = TestBed.createComponent(RichTextView);
    fixture.componentRef.setInput('value', markup === null ? null : { markup, blocks: [] });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('keeps safe markup', () => {
    const el = render('<p>Hello <strong>world</strong></p>');
    expect(el.querySelector('.rich-text p strong')!.textContent).toBe('world');
  });

  it('strips scripts and inline handlers', () => {
    const el = render('<p onclick="alert(1)">Hi</p><script>alert(1)</script>');
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('p')!.hasAttribute('onclick')).toBeFalse();
  });

  it('renders nothing for null or empty markup', () => {
    expect(render(null).querySelector('.rich-text')).toBeNull();
    expect(render('   ').querySelector('.rich-text')).toBeNull();
  });
});
