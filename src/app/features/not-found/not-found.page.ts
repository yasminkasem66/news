import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotFoundBlock } from '../../shared/state/not-found-block';

@Component({
  selector: 'app-not-found-page',
  imports: [NotFoundBlock, RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-not-found-block titleKey="notFound.title" bodyKey="notFound.body" linkTo="/" linkLabelKey="notFound.home" />
    <p class="pb-10 text-center">
      <a routerLink="/news" class="text-brand-700 underline underline-offset-2">{{ 'nav.news' | transloco }}</a>
    </p>
  `,
})
export default class NotFoundPage {}
