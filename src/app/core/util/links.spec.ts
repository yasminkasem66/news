import { isInternalLink } from './links';

describe('isInternalLink', () => {
  it('treats root-relative paths as internal', () => {
    expect(isInternalLink('/')).toBeTrue();
    expect(isInternalLink('/about-us')).toBeTrue();
  });

  it('treats protocol-relative, absolute and other schemes as external', () => {
    expect(isInternalLink('//cdn.example.com')).toBeFalse();
    expect(isInternalLink('https://x.com/example')).toBeFalse();
    expect(isInternalLink('mailto:hello@example.com')).toBeFalse();
  });
});
