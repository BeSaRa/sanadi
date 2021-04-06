import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[dateFix]'
})
export class DateFixDirective {

  constructor() {
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.target?.dispatchEvent(new Event('blur'));
  }
}
