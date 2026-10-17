import settings from '../../../../docs/api/samples/E10-site-settings.json';
import { BlockList } from '../../models/delivery-api';
import { blocks } from './blocks';

interface Link {
  label: string;
  url: string;
  openInNewTab: boolean;
}

interface Column {
  columnTitle: string;
  links: BlockList<Link>;
}

describe('blocks', () => {
  const props = settings.items[0].properties;

  it('unwraps navigation links', () => {
    const nav = blocks(props.primaryNavigation as BlockList<Link>);
    expect(nav.map((link) => link.label)).toEqual(['Home', 'About']);
    expect(nav[1].url).toBe('/about-us');
  });

  it('unwraps nested footer columns', () => {
    const columns = blocks(props.footerLinkColumns as unknown as BlockList<Column>);
    expect(columns[0].columnTitle).toBe('Company');
    expect(blocks(columns[0].links).map((link) => link.label)).toEqual(['About']);
  });

  it('returns an empty array for null or missing values', () => {
    expect(blocks(null)).toEqual([]);
    expect(blocks(undefined)).toEqual([]);
  });
});
