import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[onlyNumbers]'
})
export class OnlyNumbersDirective {
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const key = (event.key).trim();
    if (!key || isNaN(key as unknown as number)) {
      event.preventDefault();
    }
  }

}
