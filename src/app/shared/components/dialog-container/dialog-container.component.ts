import {Component, HostBinding, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-dialog-container',
  templateUrl: './dialog-container.component.html',
  styleUrls: ['./dialog-container.component.scss'],
  animations: [
    trigger('dialogContainer', [
      state('void, exit', style({opacity: 0, transform: 'scale(0.7)'})),
      state('enter', style({transform: 'none'})),
      transition('* => enter', animate('150ms cubic-bezier(0, 0, 0.2, 1)',
        style({transform: 'none', opacity: 1}))),
      transition('* => void, * => exit',
        animate('75ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({opacity: 0}))),
    ])
  ]
})
export class DialogContainerComponent implements OnInit {
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet | undefined;
  @HostBinding('class') classList = 'rounded shadow';
  @HostBinding('@dialogContainer') animationState: 'void' | 'exit' | 'enter' = 'enter';

  constructor() {
  }

  ngOnInit(): void {
  }

}
