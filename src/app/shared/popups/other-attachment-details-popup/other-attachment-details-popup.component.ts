import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@services/lang.service';
import {IDialogData} from '@contracts/i-dialog-data';
import {FileNetDocument} from '@app/models/file-net-document';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {AbstractControl, FormBuilder, FormGroup, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from '@helpers/common-utils';
import {FileUploaderComponent} from '@app/shared/components/file-uploader/file-uploader.component';
import {GlobalSettingsService} from '@app/services/global-settings.service';
import {map} from 'rxjs/operators';
import {GlobalSettings} from '@app/models/global-settings';
import {DialogService} from '@app/services/dialog.service';
import {EmployeeService} from '@services/employee.service';

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

  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedExtensions: string[] = [];
  allowedFileMaxSize: number = this.globalSettings.fileSize;

  attachmentFile?: File;

  @ViewChild('dialogContent') dialogContent!: ElementRef;
  @ViewChild('fileUploaderComponent') fileUploaderRef!: FileUploaderComponent;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<FileNetDocument>,
              public lang: LangService,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public dialogRef: DialogRef,
              private globalSettingsService: GlobalSettingsService,
              private employeeService: EmployeeService,
              private dialog: DialogService) {
    this.model = data.model;
    this.operation = data.operation;
  }

  ngOnInit() {
    this.setAllowedFiles();
    this._buildForm(true);
  }

  setAllowedFiles() {
    this.globalSettingsService.getAllowedFileTypes()
      .pipe(
        map(fileTypes => fileTypes.map(fileType => '.' + (fileType.extension ?? '').toLowerCase()))
      )
      .subscribe(list => {
        this.allowedExtensions = list
      })
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

    const validFileSize = file ? (this.attachmentFile!.size <= this.allowedFileMaxSize * 1000 * 1024) : true;
    !validFileSize ? this.attachmentFile = undefined : null;
    if (!validFileSize) {
      this.dialog.error(this.lang.map.msg_only_this_file_size_or_less_allowed_to_upload.change({size: this.allowedFileMaxSize}));
      this.attachmentFile = undefined
      return;
    }
  }

  get isPublished(): AbstractControl {
    return this.form.get('isPublished') as AbstractControl;
  }

  private canChangePublished(): boolean {
    if (this.readonly || this.employeeService.isExternalUser()) {
      return false;
    }
    return !this.model.id;
  }

  private _buildForm(controls: boolean = false): void {
    const {description, documentTitle, isPublished} = this.model;
    this.form = this.fb.group({
      documentTitle: controls ? [documentTitle, [CustomValidators.required, CustomValidators.maxLength(200)]] : documentTitle,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(500)]] : description,
      isPublished: controls ? [{
        value: this.employeeService.isExternalUser() ? true : isPublished,
        disabled: !this.canChangePublished()
      }] : isPublished
    });
  }

  private _createOtherAttachment(): FileNetDocument {
    const value = this.form.getRawValue();
    return new FileNetDocument().clone({
      ...this.model,
      description: value.description,
      documentTitle: value.documentTitle,
      attachmentTypeStatus: true,
      attachmentTypeId: -1,
      isPublished: value.isPublished,
      attachmentTypeInfo: this._createOtherLookup(),
    });
  }

  private _updateOtherAttachment(): FileNetDocument {
    const value = this.form.getRawValue();
    return new FileNetDocument().clone({
      ...this.model,
      description: value.description,
      documentTitle: value.documentTitle
    });
  }

  private _createOtherLookup(): AdminResult {
    return AdminResult.createInstance({
      arName: this.lang.getArabicLocalByKey('attachment_other'),
      enName: this.lang.getEnglishLocalByKey('attachment_other'),
    });
  }
}
