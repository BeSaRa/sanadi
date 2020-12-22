import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  /**
   * @description header element to use it later to attach/detach
   */
  @ViewChild('header') element: ElementRef | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

  /**
   * @description eventListener callback to listen to scroll event on the window.
   */
  @HostListener('window:scroll')
  onScroll(): void {
    const {pageYOffset: scroll} = window;
    if (scroll >= 40) {
      this._attachSticky();
    } else {
      this._detachSticky();
    }
  }

  /**
   * @description private method to attach "Sticky" class to main navbar.
   * @private
   */
  private _attachSticky(): void {
    if (!this.element?.nativeElement.classList.contains('sticky')) {
      this.element?.nativeElement.classList.add('sticky');
    }
  }

  /**
   * @description private method to detach "Sticky" class from main navbar.
   * @private
   */
  private _detachSticky(): void {
    if (this.element?.nativeElement.classList.contains('sticky')) {
      this.element?.nativeElement.classList.remove('sticky');
    }
  }

}
