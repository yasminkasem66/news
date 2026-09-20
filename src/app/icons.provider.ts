import { Provider } from '@angular/core';
import {
  provideLucideIcons,
  LucideNewspaper,
  LucideSearch,
  LucideMenu,
  LucideX,
  LucideUser,
  LucideBookmark,
  LucideShare2,
  LucideClock,
  LucideChevronLeft,
  LucideChevronRight,
} from '@lucide/angular';

export const provideAppLucideIcons: Provider = provideLucideIcons(
  LucideNewspaper,
  LucideSearch,
  LucideMenu,
  LucideX,
  LucideUser,
  LucideBookmark,
  LucideShare2,
  LucideClock,
  LucideChevronLeft,
  LucideChevronRight,
);
