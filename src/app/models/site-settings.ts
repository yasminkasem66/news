import { SocialLink } from './contact-page';
import { BlockList, ContentItem, MediaPicker, RichText } from './delivery-api';

/** Block `link`. Internal URLs start with `/` (e.g. `/about-us`); others are absolute. */
export interface LinkBlock {
  label: string;
  url: string;
  openInNewTab: boolean;
}

/** Block `footerLinkColumn`. */
export interface FooterLinkColumn {
  columnTitle: string;
  links: BlockList<LinkBlock>;
}

export interface SiteSettingsProps {
  logo: MediaPicker;
  primaryNavigation: BlockList<LinkBlock>;
  footerAboutText: RichText | null;
  footerLinkColumns: BlockList<FooterLinkColumn>;
  socialLinks: BlockList<SocialLink>;
  copyrightText: string | null;
}

/** Singleton driving the header and footer (E10). */
export type SiteSettings = ContentItem<'siteSettings', SiteSettingsProps>;
