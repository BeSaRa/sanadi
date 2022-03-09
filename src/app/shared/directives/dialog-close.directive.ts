import {Directive, ElementRef, HostListener, Input, Optional} from '@angular/core';
import {DialogRef} from '../models/dialog-ref';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Directive({
  selector: '[dialogClose]'
})
export class DialogCloseDirective {
  @Input('dialogClose') result: any;

  constructor(@Optional() private dialogRef: DialogRef, private element: ElementRef) {
  }

  @HostListener('click')
  _onClickClose(): void {
    if (this.dialogRef) {
      this.dialogRef.close(this.result);
    } else {
      console.error('i dont have parent dialog ref , please remove me [dialogClose] from the DOM ', this.element.nativeElement);
    }
  }

}
