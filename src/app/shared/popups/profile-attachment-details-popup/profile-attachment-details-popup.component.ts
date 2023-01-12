import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { AdminResult } from '@app/models/admin-result';
import { FileNetDocument } from '@app/models/file-net-document';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'profile-attachment-details-popup',
  templateUrl: './profile-attachment-details-popup.component.html',
  styleUrls: ['./profile-attachment-details-popup.component.scss']
})
export class ProfileAttachmentDetailsPopupComponent implements OnInit, AfterViewInit {
  model!: FileNetDocument;
  operation!: OperationTypes;
  form!: FormGroup;
  validateFieldsVisible: boolean = true;
  saveVisible: boolean = true;

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<FileNetDocument>,
              public lang: LangService,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public dialogRef: DialogRef) {
    this.model = data.model;
    this.operation = data.operation;
  }

  ngOnInit() {
    this._buildForm(true);
  }

  ngAfterViewInit() {
    if (this.readonly) {
      this.validateFieldsVisible = false;
      this.saveVisible = false;
    }
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(null, this.dialogContent.nativeElement);
    }
    this.cd.detectChanges();
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.add_attachment_other;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.edit_attachment_other;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  save(): void {
    if (!this.form.valid) {
      return;
    }

    let value;
    if (this.operation === OperationTypes.CREATE) {
      value = this._createOtherAttachment();
    } else {
      value = this._updateOtherAttachment();
    }

    this.dialogRef.close(value);
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }

  private _buildForm(controls: boolean = false): void {
    const {description, documentTitle} = this.model;
    this.form = this.fb.group({
      documentTitle: controls ? [documentTitle, [CustomValidators.required, CustomValidators.maxLength(200)]] : documentTitle,
      description: controls ? [description, [CustomValidators.maxLength(500)]] : description
    });
  }

  private _createOtherAttachment(): FileNetDocument {
    return new FileNetDocument().clone({
      ...this.model,
      description: this.form.value.description,
      documentTitle: this.form.value.documentTitle,
      attachmentTypeStatus: true,
      attachmentTypeId: -1,
      attachmentTypeInfo: this._createOtherLookup(),
    });
  }

  private _updateOtherAttachment(): FileNetDocument {
    return new FileNetDocument().clone({
      ...this.model,
      description: this.form.value.description,
      documentTitle: this.form.value.documentTitle
    });
  }

  private _createOtherLookup(): AdminResult {
    return AdminResult.createInstance({
      arName: this.lang.getArabicLocalByKey('attachment_other'),
      enName: this.lang.getEnglishLocalByKey('attachment_other'),
    });
  }
}
