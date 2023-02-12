import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@services/lang.service';
import {IDialogData} from '@contracts/i-dialog-data';
import {FileNetDocument} from '@app/models/file-net-document';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {FormBuilder, FormGroup, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from '@helpers/common-utils';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {FileUploaderComponent} from '@app/shared/components/file-uploader/file-uploader.component';

@Component({
  selector: 'other-attachment-details-popup',
  templateUrl: './other-attachment-details-popup.component.html',
  styleUrls: ['./other-attachment-details-popup.component.scss']
})
export class OtherAttachmentDetailsPopupComponent implements OnInit, AfterViewInit {
  model!: FileNetDocument;
  operation!: OperationTypes;
  form!: FormGroup;
  validateFieldsVisible: boolean = true;
  saveVisible: boolean = true;
  allowedExtensions: string[] = [FileExtensionsEnum.PDF];
  attachmentFile?: File;

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild('fileUploaderComponent') fileUploaderRef!: FileUploaderComponent;

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
    if (!this.isValidForm(this.form)) {
      return;
    }

    let value;
    if (this.operation === OperationTypes.CREATE) {
      value = this._createOtherAttachment();
    } else {
      value = this._updateOtherAttachment();
    }

    this.dialogRef.close({attachment: value, file: this.fileUploaderRef.getCurrentFileList()});
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }

  isValidForm(form: UntypedFormGroup): boolean {
    if (this.readonly) {
      return true;
    }
    return form.valid && !!this.attachmentFile;
  }

  setAttachmentFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.attachmentFile = file;
    } else {
      this.attachmentFile = file[0];
    }
  }

  private _buildForm(controls: boolean = false): void {
    const {description, documentTitle} = this.model;
    this.form = this.fb.group({
      documentTitle: controls ? [documentTitle, [CustomValidators.required, CustomValidators.maxLength(200)]] : documentTitle,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(500)]] : description
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
