import {Directive, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {DialogRef} from '../models/dialog-ref';

@Directive({
  selector: '[fullscreenBtn]'
})
export class FullscreenBtnDirective implements OnInit {

  fullscreen: boolean = false;

  constructor(private dialogRef: DialogRef,
              private elementRef: ElementRef,
              private renderer2: Renderer2) {

  }

  @HostListener('click')
  toggle(): void {
    this.dialogRef.toggleFullscreen();
    this.generateIcon();
  }

  ngOnInit(): void {
    this.generateIcon();
  }

  fullscreenIcon() {
    return this.changeElementContent('<i class="mdi mdi-fullscreen"></i>');
  }

  narrowScreenIcon() {
    return this.changeElementContent('<i class="mdi mdi-fullscreen-exit"></i>');
  }

  private changeElementContent(icon: string): void {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'innerHTML', icon);
  }

  private generateIcon() {
    this.dialogRef.fullscreen ? this.narrowScreenIcon() : this.fullscreenIcon();
  }
}
