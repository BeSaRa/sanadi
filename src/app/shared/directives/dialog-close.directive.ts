import { LangService } from './../../services/lang.service';
import { UserClickOn } from './../../enums/user-click-on.enum';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from './../../services/factory.service';
import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { DialogRef } from '../models/dialog-ref';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Directive({
  selector: '[dialogClose]'
})
export class DialogCloseDirective {
  @Input('dialogClose') result: any;
  @Input() isConfirmClose?: boolean;
  dialogService!: DialogService;
  langService!: LangService;
  constructor(@Optional() private dialogRef: DialogRef, private element: ElementRef) {
    this.dialogService = FactoryService.getService('DialogService');
    this.langService = FactoryService.getService('LangService')
  }

  @HostListener('click')
  _onClickClose(): void {
    if (this.dialogRef) {
      if (this.isConfirmClose) {
        const sub = this.dialogService.confirm(this.langService.map.msg_confirm_continue)
          .onAfterClose$
          .subscribe((click: UserClickOn) => {
            sub.unsubscribe();
            if (click === UserClickOn.YES) {
              this.dialogRef.close(this.result);
            }
          });
      } else {
        this.dialogRef.close(this.result);
      }
    } else {
      console.error('i dont have parent dialog ref , please remove me [dialogClose] from the DOM ', this.element.nativeElement);
    }
  }

}
