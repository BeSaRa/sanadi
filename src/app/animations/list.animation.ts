import {animate, query, stagger, style, transition, trigger} from '@angular/animations';

export const listAnimation = trigger('homeRouterAnimation', [
  transition('*<=>*', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(100%)'
      }),
      stagger(50, [
        animate('.1s', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ])
    ], {optional: true})
  ])
]);
