import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {TOAST_DATA_TOKEN} from '../../tokens/tokens';
import {animate, AnimationEvent, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({
          transform: 'translateY(-100%) scale(0)',
          opacity: 0
        }),
        animate('250ms ease-out', style({
          transform: 'translateY(0) scale(1)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          transform: 'translateY(0) scale(1)',
          opacity: 1
        }),
        animate('250ms ease-out', style({
          transform: 'translateY(-100%) scale(0)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  alertClass = 'alert-success';
  show = false;
  animationChanges = new EventEmitter<AnimationEvent>();

  constructor(@Inject(TOAST_DATA_TOKEN) public data: string) {

  }

  ngOnInit(): void {
    this.show = true;
  }

  closeToast(): void {
    const out = setTimeout(() => {
      this.show = false;
      clearTimeout(out);
    });
  }

}
