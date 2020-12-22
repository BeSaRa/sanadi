import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[mouseEnterLeave]'
})
export class MouseEnterLeaveDirective {
  @Input('mouseEnterLeave') elementClass = '';

  constructor(private element: ElementRef) {
  }

  @HostListener('mouseenter')
  mouseEnter(): void {
    this.element.nativeElement.classList.add(this.elementClass);
  }

  @HostListener('mouseleave')
  mouseLeave(): void {
    this.element.nativeElement.classList.remove(this.elementClass);
  }
}
