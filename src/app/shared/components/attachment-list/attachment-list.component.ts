import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {SubventionRequest} from '../../../models/subvention-request';
import {FormManager} from '../../../models/form-manager';
import {SanadiAttachment} from '../../../models/sanadi-attachment';
import {CustomValidators} from '../../../validators/custom-validators';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LookupService} from '../../../services/lookup.service';
import {AttachmentService} from '../../../services/attachment.service';
import {ToastService} from '../../../services/toast.service';
import {catchError, switchMap} from 'rxjs/operators';
import {BehaviorSubject, of, Subject, Subscription} from 'rxjs';
import {ConfigurationService} from '../../../services/configuration.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {isValidValue} from '../../../helpers/utils';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent implements OnInit, OnDestroy {
  _request!: SubventionRequest;
  @Input()
  set request(val: SubventionRequest | undefined) {
    if (val)
      this._request = val;
  }
  get request(): SubventionRequest | undefined {
    return this._request;
  }

  @Input() readOnly: boolean = false;
  @Input() attachmentList: SanadiAttachment[] = [];
  @Input() multiUpload: boolean = false;
  @Input() buttonKey: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() showList: boolean = true;

  @Output() updateList = new EventEmitter<SanadiAttachment[]>();
  attachmentList$ = new BehaviorSubject<SanadiAttachment[]>([]);
  attachedFiles: any[] = [];
  showForm: boolean = false;
  currentAttachment: any;
  allowedExtensions: string[] = this.configService.CONFIG.ATTACHMENT_EXTENSIONS;
  reload$ = new Subject<any>();
  reloadSubscription!: Subscription;
  displayedColumns = ['documentTitle', 'attachmentType', 'lastModified', 'actions'];

  fm!: FormManager;
  form!: FormGroup;
  @ViewChild('fileUploader') fileUploader!: ElementRef;

  constructor(public langService: LangService,
              private fb: FormBuilder,
              private toast: ToastService,
              private dialogService: DialogService,
              private configService: ConfigurationService,
              public lookupService: LookupService,
              private attachmentService: AttachmentService) {
  }

  _checkRequiredInputs(): void {
    if (!this._request) {
      throw new Error('Missing attribute or value - request');
    }
  }

  ngOnInit(): void {
    this._checkRequiredInputs();
    this.listenToReload();
    this.attachmentList$.next(this.attachmentList);
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.attachmentService.loadByRequestId(this._request.id);
      })
    ).subscribe((attachments) => {
      this.attachmentList$.next(attachments);
      this.updateList.emit(attachments);
    });
  }

  private buildForm(attachment?: SanadiAttachment) {
    if (!attachment) {
      attachment = new SanadiAttachment();
      attachment.requestId = this._request.id;
      attachment.requestFullSerial = this._request.requestFullSerial;
    }
    this.currentAttachment = attachment;
    this.form = this.fb.group({
      documentTitle: [attachment.documentTitle, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('ENG_AR_NUM_ONLY')]],
      attachmentType: [attachment.attachmentType, CustomValidators.required],
      requestId: [attachment.requestId, CustomValidators.required],
      requestFullSerial: [attachment.requestFullSerial, CustomValidators.required],
      vsId: [attachment.vsId]
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  get buttonText(): string {
    return this.langService.map[this.buttonKey] || this.langService.map.select;
  }

  get attachmentVsIdField(): FormControl {
    return this.fm.getFormField('vsId') as FormControl
  }

  get isNewAttachment(): boolean {
    return isValidValue(this.attachmentVsIdField?.value);
  }

  get isValidAttachment(): boolean {
    if (this.isNewAttachment) {
      return this.form.valid;
    }
    return this.form.valid && (this.attachedFiles && this.attachedFiles.length > 0);
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.fileUploader?.nativeElement.click();
  }

  getUploadedFileName(): string {
    if (!this.attachedFiles || this.attachedFiles.length === 0) {
      return '';
    }
    if (!this.multiUpload) {
      return this.attachedFiles[0].name;
    } else {
      if (this.attachedFiles.length > 5) {
        return this.langService.map.x_files_chosen.change({count: '5+'}) || ''
      }
      return this.attachedFiles.map(file => file.name).join(', ');
    }
  }

  private setAttachedFiles(files: File[] | null | undefined): void {
    this.attachedFiles = [];
    if (files && files.length > 0) {
      this.attachedFiles = Array.from(files);
    }
    this.fileUploader.nativeElement.value = "";
  }

  private filterValidFiles(files: File[], showInvalidMessage: boolean = false): File[] {
    let validFiles = files.filter((file) => {
      return this.allowedExtensions.indexOf(file.name.getExtension().toLowerCase()) > -1;
    });
    if (showInvalidMessage) {
      if (validFiles.length === 0) {

      } else if (validFiles.length < files.length) {

      }
    }
    return validFiles;
  }

  onFileSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files,
      validFiles: File[] = [];
    if (files && files.length > 0) {
      validFiles = this.filterValidFiles(Array.from(files), true);
    }
    this.setAttachedFiles(validFiles);
  }

  removeAttachedFile($event: MouseEvent): void {
    $event.preventDefault();
    this.setAttachedFiles(null);
  }

  addAttachment($event: MouseEvent): void {
    $event.preventDefault();
    this.setDisplayForm();
  }

  editAttachment($event: MouseEvent, attachment: SanadiAttachment) {
    $event.preventDefault();
    this.setDisplayForm(attachment);
  }

  deleteAttachment($event: MouseEvent, attachment: SanadiAttachment) {
    $event.preventDefault();
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: attachment.getName()}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          attachment.deleteByVsId().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: attachment.getName()}));
            this.reload$.next(null);
          });
        }
      });
  }

  private setDisplayForm(attachment?: SanadiAttachment) {
    this.showForm = true;
    this.buildForm(attachment);
  }

  cancelAttachment($event?: MouseEvent) {
    $event?.preventDefault();
    this.form.reset();
    this.showForm = false;
    this.setAttachedFiles(null);
    this.currentAttachment = null;
  }

  saveAttachment($event: MouseEvent) {
    if (!this.isNewAttachment && (!this.attachedFiles || this.attachedFiles.length === 0)) {
      this.toast.info(this.langService.map.msg_missing_attachment);
      return;
    }
    let data = (new SanadiAttachment()).clone(this.currentAttachment) as SanadiAttachment;
    data.documentTitle = this.form.value.documentTitle;
    data.attachmentType = this.form.value.attachmentType;

    this.attachmentService.saveAttachment(data, this.attachedFiles[0])
      .pipe(catchError(() => {
        return of('FAILED_SAVE');
      }))
      .subscribe((result: string) => {
        if (result === 'FAILED_SAVE' || result === 'MISSING_DATA') {
          return;
        }
        this.toast.success(this.langService.map.msg_save_success);
        this.reload$.next(null);
        this.cancelAttachment();
      });
  }


}
