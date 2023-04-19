import { UntypedFormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { DialogRef } from '@app/shared/models/dialog-ref';

@Component({
  selector: 'app-template-type-popup',
  templateUrl: './template-type-popup.component.html',
  styleUrls: ['./template-type-popup.component.scss']
})
export class TemplateTypePopupComponent implements OnInit {
  approvalTemplateTypes: Lookup[] = this.lookupService.listByCategory.ApprovalTemplateType;
  typeControl: UntypedFormControl = new UntypedFormControl(null, [CustomValidators.required]);

  constructor(
    public lang: LangService,
    private dialogRef: DialogRef,
    private lookupService: LookupService
  ) { }
  ngOnInit() {
  }
  save() {
    this.dialogRef.close(this.typeControl.value);
  }
  close() {
    this.dialogRef.close(null)
  }
}
