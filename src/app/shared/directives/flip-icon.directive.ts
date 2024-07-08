import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {LangService} from '../../services/lang.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[flipIcon]'
})
export class FlipIconDirective implements OnDestroy, OnInit {
  takeUntil$: Subject<void> = new Subject<void>();
  flipClass: string = 'mdi-flip-h';
  @Input()
  flipWhen: string = 'ar';

  constructor(private element: ElementRef,
              private renderer2: Renderer2,
              private langService: LangService) {
  }

  private listenToLanguageChanges() {
    this.langService
      .onLanguageChange$
      .pipe(takeUntil(this.takeUntil$))
      .subscribe(value => {
        if (this.flipWhen === value.code) {
          this.addFlipClass();
        } else {
          this.removeFlipClass();
        }
      });
  }

  ngOnDestroy(): void {
    this.takeUntil$.next();
    this.takeUntil$.complete();
    this.takeUntil$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToLanguageChanges();
  }

  addFlipClass(): void {
    this.renderer2.addClass(this.element.nativeElement, this.flipClass);
  }

  removeFlipClass(): void {
    this.renderer2.removeClass(this.element.nativeElement, this.flipClass);
  }

}
