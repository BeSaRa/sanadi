import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: 'input[type="checkbox"][indeterminate]'
})
export class IndeterminateDirective implements OnInit, OnDestroy {
  private _indeterminate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private destroy$: Subject<void> = new Subject();

  @Input()
  set indeterminate(val: boolean) {
    this._indeterminate.next(val);
  };

  get indeterminate(): boolean {
    return this._indeterminate.value;
  }

  constructor(private element: ElementRef<HTMLInputElement>, private renderer: Renderer2) {

  }

  ngOnInit(): void {
    this.listenToIndeterminateChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToIndeterminateChanges() {
    this._indeterminate
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.renderer.setProperty(this.element.nativeElement, 'indeterminate', value);
      });
  }
}
