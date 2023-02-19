import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective implements OnInit, OnDestroy {
  readonly toolTipModel: any = null;
  private ref: any = null;
  private _tooltip !: string;

  constructor(@Inject(DOCUMENT) private document: any, private elementRef: ElementRef) {
    this.toolTipModel = this.document.defaultView.bootstrap.Tooltip;
  }

  @Input() placement: 'top' | 'bottom' | 'right' | 'left' = 'top';

  @Input()
  set tooltip(value) {
    this._tooltip = value;

    if (this.ref && this.ref.tip) {
      const tip = this.ref.tip.querySelector('.tooltip-inner');
      const element = document.createElement('div')
      element.classList.add('tooltip-inner')
      tip ? (tip.innerText = value) : (() => {
        this.ref.tip.appendChild(element)
        this.ref.tip.querySelector('.tooltip-inner').innerText = value
      })()

    }
  }

  get tooltip() {
    return this._tooltip;
  }

  ngOnInit(): void {
    this.ref = new this.toolTipModel(this.elementRef.nativeElement, {
      delay: 100,
      trigger: 'hover',
      placement: this.placement,
      title: () => {
        return this.tooltip || "";
      }
    });
  }

  ngOnDestroy(): void {
    if (this.ref && this.ref._popper && typeof this.ref._popper.destroy !== 'undefined') {
      this.ref.dispose();
    }
  }

}
