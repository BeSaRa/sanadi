import {Directive, ElementRef, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';

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

  @Input()
  set tooltip(value) {
    this._tooltip = value;
    if (this.ref && this.ref.tip) {
      this.ref.tip.querySelector('.tooltip-inner').innerText = value;
    }
  }

  get tooltip() {
    return this._tooltip;
  }

  ngOnInit(): void {
    this.ref = new this.toolTipModel(this.elementRef.nativeElement, {
      delay: 100,
      title: () => {
        return this.tooltip;
      }
    });
    console.log(this.ref);
  }

  ngOnDestroy(): void {
    console.log(this.ref);
    this.ref.tip = null;
    this.ref.dispose();
    this.ref = null;
  }

}
