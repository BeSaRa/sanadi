import {Component, HostBinding, HostListener, OnInit} from '@angular/core';
import {animate, group, query, state, style, transition, trigger} from "@angular/animations";
import {LangService} from "@app/services/lang.service";
import {distinctUntilChanged, filter} from "rxjs/operators";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'lang-loader',
  templateUrl: './lang-loader.component.html',
  styleUrls: ['./lang-loader.component.scss'],
  animations: [
    trigger('languageAnimation', [
      state('Done', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('Start', style({
        transform: 'translateY(0%)',
        opacity: 1
      })),
      transition('Start => Done', animate('300ms ease-in-out')),
      transition('Done => Start', [
        style({transform: 'translateY(-100%)'}),
        query('.progress-bar', style({width: 0})),
        query('#progress-card', style({opacity: 0, transform: 'translateY(100%)'})),
        animate('350ms ease-in-out'),
        group([
          query('.progress-bar', animate(300, style({width: '100%'}))),
          query('#progress-card', animate(200, style({opacity: 1, transform: 'translateY(0)'}))),
        ])
      ])
    ])
  ]
})
export class LangLoaderComponent implements OnInit {
  @HostBinding('@languageAnimation')
  state: string = 'Done';
  inProgress: boolean = false;
  nextState: string = '';

  constructor(public lang: LangService) {
    // setTimeout(() => this.state = 'Start', 2000);
  }

  @HostListener('@languageAnimation.start')
  onAnimationStart(): void {
    this.inProgress = true;
  }

  @HostListener('@languageAnimation.done')
  onAnimationDone(): void {
    this.inProgress && this.nextState && (this.state = this.nextState);
    this.inProgress = false;
  }


  ngOnInit(): void {
    this.lang.changeStatus$
      .pipe(filter<"Start" | "Done" | "InProgress", "Start" | "Done">((val): val is "Start" | "Done" => val !== 'InProgress'))
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (!this.inProgress) {
          this.state = value;
        } else {
          this.nextState = value;
        }
      })
  }

}
