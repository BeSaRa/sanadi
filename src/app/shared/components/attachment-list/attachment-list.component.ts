import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {SubventionRequest} from '@app/models/subvention-request';
import {SanadiAttachment} from '@app/models/sanadi-attachment';
import {CustomValidators} from '@app/validators/custom-validators';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {LookupService} from '@app/services/lookup.service';
import {AttachmentService} from '@app/services/attachment.service';
import {ToastService} from '@app/services/toast.service';
import {catchError, filter, switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {DateUtils} from '@app/helpers/date-utils';
import {AttachmentTypeEnum} from '@app/enums/attachment-type.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent implements OnInit, OnDestroy {
  constructor(public langService: LangService,
              private fb: UntypedFormBuilder,
              private toast: ToastService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private attachmentService: AttachmentService) {
  }

  ngOnInit(): void {
    this._checkRequiredInputs();
    this.listenToReload();
    this.listenToAddAid();
    this.attachmentList$.next(this.attachmentList);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  _request!: SubventionRequest;
  private destroy$: Subject<void> = new Subject();

  @Input()
  set request(val: SubventionRequest | undefined) {
    if (val) {
      this._request = val;
    }
  }

  get request(): SubventionRequest | undefined {
    return this._request;
  }

  @Input() readOnly: boolean = false;
  @Input() attachmentList: SanadiAttachment[] = [];
  @Input() multiUpload: boolean = false;
  @Input() buttonKey: keyof ILanguageKeys = {} as keyof ILanguageKeys;

  @Output() updateList = new EventEmitter<SanadiAttachment[]>();
  @Output() onFormToggle = new EventEmitter<boolean>();

  attachmentList$ = new BehaviorSubject<SanadiAttachment[]>([]);
  attachedFiles: any[] = [];
  showForm: boolean = false;
  currentAttachment: any;
  allowedExtensions: string[] = [
    FileExtensionsEnum.PDF,
    FileExtensionsEnum.JPG,
    FileExtensionsEnum.JPEG,
    FileExtensionsEnum.PNG,
    FileExtensionsEnum.DOC,
    FileExtensionsEnum.DOCX,
    FileExtensionsEnum.TIFF
  ];
  addAttachment$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>('init');
  displayedColumns = ['documentTitle', 'attachmentType', 'lastModified', 'actions'];
  headerColumn: string[] = ['extra-header'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  attachmentTypeEnum = AttachmentTypeEnum;

  editItem?: SanadiAttachment;
  form!: UntypedFormGroup;

  @ViewChild('fileUploader') fileUploader!: ElementRef;

  actions: IMenuItem<SanadiAttachment>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: SanadiAttachment) => this.editAttachment(item),
      show: (item: SanadiAttachment) => this.allowEdit(item),
      disabled: () => this.isFormShown()
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: SanadiAttachment) => this.deleteAttachment(item),
      show: (item: SanadiAttachment) => this.allowDelete(item),
      disabled: () => this.isFormShown()

    },
    // download
    {
      type: 'action',
      icon: ActionIconsEnum.DOWNLOAD,
      label: 'btn_download',
      onClick: (item: SanadiAttachment) => item.downloadAttachment(),
      disabled: () => this.isFormShown()
    }
  ];

  sortingCallbacks = {
    lastModified: (a: SanadiAttachment, b: SanadiAttachment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.lastModified!),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.lastModified!);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    attachmentType: (a: SanadiAttachment, b: SanadiAttachment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.attachmentTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.attachmentTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  isFormShown(): boolean {
    return this.showForm;
  }

  allowReload(): boolean {
    if (this.isFormShown()) {
      return false;
    }
    if (!this._request.id) {
      return false;
    } else {
      return !this.readOnly;
    }
    /* // if new request or new partial request, don't allow reload
     return !(!this._request.id || this._request.isNewPartialRequest());*/
  }

  allowAdd(): boolean {
    if (!this._request.id) {
      return false;
    } else {
      return !this.readOnly;
    }
  }

  allowEdit(attachment: SanadiAttachment): boolean {
    if (!attachment.vsId) {
      return true;
    } else {
      if (attachment.attachmentType === AttachmentTypeEnum.DISCLOSURE_FORM) {
        return false;
      }
      if (this._request.isNewPartialRequest()) {
        return !attachment.vsId;
      } else {
        return !this.readOnly;
      }
    }
  }

  allowDelete(attachment: SanadiAttachment): boolean {
    if (!attachment.vsId) {
      return true;
    } else {
      if (attachment.attachmentType === AttachmentTypeEnum.DISCLOSURE_FORM) {
        return false;
      }
      if (this._request.isNewPartialRequest()) {
        return !attachment.vsId;
      } else {
        return !this.readOnly;
      }
    }
  }

  _checkRequiredInputs(): void {
    if (!this._request) {
      throw new Error('Missing attribute or value - request');
    }
  }

  private listenToAddAid() {
    this.addAttachment$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.addAttachment();
      });
  }

  listenToReload(): void {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init'),
      switchMap(() => {
        return this.attachmentService.loadByRequestId(this._request.id);
      })
    ).subscribe((attachments) => {
      this.attachmentList = attachments;
      this.attachmentList$.next(this.attachmentList);
      this.updateList.emit(this.attachmentList);
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
      documentTitle: [attachment.documentTitle, [CustomValidators.required, CustomValidators.maxLength(100), CustomValidators.pattern('ENG_AR_NUM_ONLY')]],
      attachmentType: [attachment.attachmentType, CustomValidators.required],
      requestId: [attachment.requestId],
      requestFullSerial: [attachment.requestFullSerial]
    });
  }

  get isNewAttachment(): boolean {
    return this.currentAttachment && !this.currentAttachment.vsId;
  }

  get isValidAttachment(): boolean {
    if (this.isNewAttachment) {
      return this.form.valid && (this.attachedFiles && this.attachedFiles.length > 0);
    }
    return this.form.valid;
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.fileUploader?.nativeElement.click();
  }

  addAttachment($event?: MouseEvent): void {
    $event?.preventDefault();
    this.editItem = undefined;
    this.setDisplayForm();
  }

  editAttachment(attachment: SanadiAttachment, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = attachment;
    this.setDisplayForm(attachment);
  }

  deleteAttachment(attachment: SanadiAttachment, $event?: MouseEvent) {
    $event?.preventDefault();
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: attachment.getName()}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          if (!this._request.id) {
            let index = this.attachmentList.findIndex(x => x === this.editItem);
            this.attachmentList.splice(index, 1);
            this.attachmentList$.next(this.attachmentList);
            this.updateList.emit(this.attachmentList);
            this.editItem = undefined;
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: attachment.getName()}));
            return;
          }
          attachment.deleteByVsId().subscribe(() => {
            this.editItem = undefined;
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: attachment.getName()}));
            this.reload$.next(null);
          });
        }
      });
  }

  private setDisplayForm(attachment?: SanadiAttachment) {
    this.showForm = true;
    this.buildForm(attachment);
    this.onFormToggle.emit(true);
  }

  cancelAttachment($event?: MouseEvent) {
    $event?.preventDefault();
    this.form.reset();
    this.showForm = false;
    this.onFormToggle.emit(false);
    this.setUploadedFiles(undefined);
    this.currentAttachment = null;
    this.editItem = undefined;
  }

  saveAttachment(_$event: MouseEvent) {
    if (this.isNewAttachment && (!this.attachedFiles || this.attachedFiles.length === 0)) {
      this.toast.info(this.langService.map.msg_missing_attachment);
      return;
    }
    let data = (new SanadiAttachment()).clone(this.currentAttachment) as SanadiAttachment;
    data.documentTitle = this.form.value.documentTitle;
    data.attachmentType = this.form.value.attachmentType;

    if (!this._request.id) {
      if (this.isNewAttachment) {
        this.attachmentList.push(data);
      } else {
        let index = this.attachmentList.findIndex(x => x === this.editItem);
        this.attachmentList.splice(index, 1, data);
      }
      this.attachmentList$.next(this.attachmentList);
      this.updateList.emit(this.attachmentList);
      this.toast.success(this.langService.map.msg_save_success);
      this.cancelAttachment();
      return;
    }


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

  setUploadedFiles(file: File | File[] | undefined) {
    this.attachedFiles = [];
    if (!file) {
      return;
    }
    this.attachedFiles = (file instanceof File) ? [file] : file;
  }

}
