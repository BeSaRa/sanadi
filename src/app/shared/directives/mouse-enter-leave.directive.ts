import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[mouseEnterLeave]'
})
export class MouseEnterLeaveDirective {
  @Input('mouseEnterLeave') elementClass = '';
  /**
   * @description Reference to the target element to be affected by mouseEnterLeave
   */
  @Input() targetElementRef?: HTMLElement;

  constructor(private element: ElementRef) {
  }

  @HostListener('mouseenter')
  mouseEnter(): void {
    if (this.targetElementRef) {
      this.targetElementRef.classList.add(this.elementClass);
      return;
    }
    this.element.nativeElement.classList.add(this.elementClass);
  }

  @HostListener('mouseleave')
  mouseLeave(): void {
    if (this.targetElementRef) {
      this.targetElementRef.classList.remove(this.elementClass);
      return;
    }
    this.element.nativeElement.classList.remove(this.elementClass);
  }
}
