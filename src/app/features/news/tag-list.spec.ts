import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { TagList } from './tag-list';

describe('TagList', () => {
  function render(tags: string[] | null) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(TagList);
    fixture.componentRef.setInput('tags', tags);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('links each tag to the list filtered by that tag', () => {
    const links = Array.from(render(['demo', 'news']).querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/news?tag=demo', '/news?tag=news']);
  });

  it('renders nothing without tags', () => {
    expect(render(null).querySelector('ul')).toBeNull();
    TestBed.resetTestingModule();
    expect(render([]).querySelector('ul')).toBeNull();
  });
});
