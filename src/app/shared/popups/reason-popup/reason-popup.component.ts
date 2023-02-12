import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from "@angular/forms";
import { LangService } from "@services/lang.service";
import { ReasonContract } from "@contracts/reason-contract";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { CustomValidators } from "@app/validators/custom-validators";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { UserClickOn } from "@app/enums/user-click-on.enum";

@Component({
  selector: 'reason-popup',
  templateUrl: './reason-popup.component.html',
  styleUrls: ['./reason-popup.component.scss']
})
export class ReasonPopupComponent implements OnInit {
  control: UntypedFormControl = new UntypedFormControl()

  constructor(public lang: LangService,
              private dialogRef: DialogRef,
              @Inject(DIALOG_DATA_TOKEN) public data: ReasonContract) { }

  ngOnInit(): void {
    this.control.setValidators(this.data.required ? CustomValidators.required : null)
    this.control.addValidators(CustomValidators.minLength(4))
    this.control.addValidators(CustomValidators.maxLength(100))
    this.control.setValue(this.data.reason || '')
    this.data.view ? this.control.disable() : null
  }

  sendReason(): void {
    if (this.control.invalid)
      return;

    this.dialogRef.close({
      click: UserClickOn.YES,
      comment: this.control.value
    })
  }

  close(): void {
    this.dialogRef.close({
      click: UserClickOn.CANCEL,
      comment: ''
    })
  }
}
