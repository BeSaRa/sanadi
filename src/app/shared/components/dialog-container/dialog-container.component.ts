import {Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {ConfigurableFocusTrapFactory} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';
import {ConfigurableFocusTrap} from '@angular/cdk/a11y/focus-trap/configurable-focus-trap';

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
export class DialogContainerComponent implements OnInit, OnDestroy {
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet | undefined;
  @HostBinding('class') classList = 'rounded shadow';
  @HostBinding('@dialogContainer') animationState: 'void' | 'exit' | 'enter' = 'enter';
  @HostBinding('cdkTrapFocus') trap = 'true';
  @Output() animationExitDone: EventEmitter<boolean> = new EventEmitter<boolean>();
  private elementFocusedBeforeDialogWasOpened: HTMLElement | undefined;
  private focusTrap: ConfigurableFocusTrap | undefined;

  constructor(private element: ElementRef,
              private focusTrapFactory: ConfigurableFocusTrapFactory,
              @Inject(DOCUMENT) private document: HTMLDocument) {
  }


  private _capturePreviousFocusedElement(): void {
    this.elementFocusedBeforeDialogWasOpened = this.document.activeElement as HTMLElement;
  }

  private _focusOnDialogContainer(): void {
    this.element.nativeElement.focus();
  }

  startExitAnimation(): void {
    this.animationState = 'exit';
  }

  @HostListener('@dialogContainer.done', ['$event'])
  _onAnimationDone({toState}: AnimationEvent): void {
    if (toState === 'enter') {
      this.focusInsideContainer();
    } else if (toState === 'exit' || toState === 'void') {
      this.focusOnPreviousElement();
      this.animationExitDone.emit(true);
    }
  }

  focusOnPreviousElement(): void {
    this.elementFocusedBeforeDialogWasOpened?.focus();
  }

  focusInsideContainer(): void {
    this.focusTrap?.focusInitialElementWhenReady();
  }

  createFocusTrap(): void {
    this.focusTrap = this.focusTrapFactory.create(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.focusTrap?.destroy();
  }


  ngOnInit(): void {
    this._capturePreviousFocusedElement();
    this.createFocusTrap();
    this._focusOnDialogContainer();
  }
}
