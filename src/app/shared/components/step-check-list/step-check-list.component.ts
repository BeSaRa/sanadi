import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {OpenFrom} from "@app/enums/open-from.enum";
import {ChecklistItem} from "@app/models/checklist-item";
import {animate, AnimationBuilder, AnimationMetadata, AnimationPlayer, style} from "@angular/animations";
import {of, Subject} from "rxjs";
import {delay, skip, take, takeUntil} from "rxjs/operators";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'step-check-list',
  templateUrl: './step-check-list.component.html',
  styleUrls: ['./step-check-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepCheckListComponent implements OnDestroy, OnInit {
  @Input()
  openFrom!: OpenFrom
  @Input()
  checklist: ChecklistItem[] = [];

  @Input()
  set currentLang(val: string) {
    this.direction = val === 'en' ? 'ltr' : 'rtl';
  };

  @HostBinding('class')
  direction: string = 'rtl';

  private player?: AnimationPlayer

  isOpened: boolean = false;

  @Output()
  checkListChanges: EventEmitter<StepCheckListComponent> = new EventEmitter<StepCheckListComponent>();

  destroy$: Subject<void> = new Subject();

  afterMarkAllCallback?: () => void

  constructor(public lang: LangService,
              private element: ElementRef,
              private animationBuilder: AnimationBuilder) {

  }

  ngOnInit(): void {
    this.listenToLanguageChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.player && this.player.destroy();
    this.player = undefined;
  }

  markAllDone() {
    this.checklist.forEach((item) => {
      item.checked = true;
    });
    of(null).pipe(delay(100), take(1)).subscribe(() => this.closeSlide());
  }

  toggleSlide() {
    this.buildPlayer();
    this.player && this.player.onDone(() => {
      this.isOpened = !this.isOpened;
      !this.isOpened && this.runAfterMarkAllCallback()
    })
    this.player && this.player.play();
  }

  private buildRTLAnimation(): AnimationMetadata | AnimationMetadata[] {
    return [
      style({
        transform: `translateX(${this.isOpened ? `0%` : `-100%`})`
      }),
      animate('200ms ease-in-out', style({
        transform: `translateX(${this.isOpened ? `-100%` : `0`})`
      }))
    ]
  }

  private buildLTRAnimation(): AnimationMetadata | AnimationMetadata[] {
    return [
      style({
        transform: `translateX(${this.isOpened ? `0%` : `100%`})`
      }),
      animate('200ms ease-in-out', style({
        transform: `translateX(${this.isOpened ? `100%` : `0`})`
      }))
    ]
  }

  private buildPlayer(): void {
    this.player && this.player.destroy();
    this.player = this.animationBuilder
      .build(this.direction === 'rtl' ? this.buildRTLAnimation() : this.buildLTRAnimation())
      .create(this.element.nativeElement.querySelector('#check-list-wrapper'));
  }

  isAllMarked(): boolean {
    return this.checklist.length ? (!this.checklist.some(item => !item.checked)) : true;
  }

  openSlide(callback?: () => void): void {
    this.afterMarkAllCallback = callback;
    !this.isOpened && this.toggleSlide();
  }

  closeSlide(): void {
    this.isOpened && this.toggleSlide();
  }

  toggleItem(item: ChecklistItem) {
    item.checked = !item.checked;
    if (this.isAllMarked()) {
      this.closeSlide();
    }
  }

  private runAfterMarkAllCallback(): void {
    (this.afterMarkAllCallback && this.afterMarkAllCallback()) || (this.afterMarkAllCallback = undefined);
  }

  private listenToLanguageChanges() {
    this.lang
      .onLanguageChange$
      .pipe(skip(1))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.correctPositions();
      })
  }

  private correctPositions() {
    this.player = this.animationBuilder
      .build(this.direction === 'rtl' ? this.buildRTLCorrectPositions() : this.buildLTRCorrectPositions())
      .create(this.element.nativeElement.querySelector('#check-list-wrapper'));
    this.player.play();
  }

  // rtl => closed => -100% - opened => 0
  private buildRTLCorrectPositions(): AnimationMetadata | AnimationMetadata[] {
    return this.isOpened ? [style({
      transform: 'translateX(0%)'
    })] : [style({transform: 'translateX(-100%)'})];
  }

  // ltr => closed => 100% - opened => 0
  private buildLTRCorrectPositions(): AnimationMetadata | AnimationMetadata[] {
    return this.isOpened ? [style({transform: 'translateX(0%)'})] : [style({
      transform: 'translateX(100%)'
    })];
  }
}
