import articles from '../../../../docs/api/samples/E1-articles.json';
import { availableLangs } from './cultures';

describe('availableLangs', () => {
  const byId = (id: string) => articles.items.find((item) => item.id === id);

  it('returns both languages for a translated article', () => {
    expect(availableLangs(byId('5b8e0d5f-b1a4-4518-816d-371f1300bbf9'))).toEqual(['en', 'ar']);
  });

  it('returns only English for an English-only article', () => {
    expect(availableLangs(byId('170e2282-6ae0-4f0d-b6f1-b080d6c10d2f'))).toEqual(['en']);
  });

  it('returns an empty list when cultures are missing', () => {
    expect(availableLangs({})).toEqual([]);
    expect(availableLangs(null)).toEqual([]);
  });
});
