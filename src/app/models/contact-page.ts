import { BlockList, ContentItem } from './delivery-api';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ContactPageProps {
  intro: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  officeHours: string | null;
  /** `"lat,lng"`. */
  mapCoordinates: string | null;
  socialLinks: BlockList<SocialLink>;
}

export type ContactPage = ContentItem<'contactUsPage', ContactPageProps>;
