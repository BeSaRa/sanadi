import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {LangService} from '@app/services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';
import {TrainingProgramBriefcase} from '@app/models/training-program-briefcase';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {printBlobData} from '@app/helpers/utils';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';

@Component({
  selector: 'training-program-briefcase',
  templateUrl: './training-briefcase.component.html',
  styleUrls: ['./training-briefcase.component.scss']
})
export class TrainingBriefcaseComponent implements OnInit, OnDestroy {

  @Input() trainingProgramId!: number;
  @Input() bundlesList: TrainingProgramBriefcase[] = [];
  @Input() operation!: number;
  operationTypes = OperationTypes;
  videoUploaded: boolean = false;

  constructor(public lang: LangService,
              private dialogService: DialogService,
              private toast: ToastService,
              private trainingProgramBriefcaseService: TrainingProgramBriefcaseService) {
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.videoUploaded = this.isVideoFileExist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  bulkActions: IGridAction[] = [
    {
      icon: 'mdi-download',
      langKey: 'btn_download',
      callback: ($event: MouseEvent) => this.downloadBriefcase($event),
      show: (_items: TrainingProgramBriefcase[]) => {
        return this.bundlesList.length > 0;
      }
    }
  ];

  showForm: boolean = false;
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  displayedColumns: string[] = ['icon', 'documentTitle', 'actions'];
  private destroy$: Subject<void> = new Subject();

  @ViewChild('fileUploader') fileUploader!: ElementRef;
  uploadedFilePath: string = '';
  uploadedFile: any;

  allowedExtensions: string[] = [];
  private _allowedFileExtensions: string[] = [FileExtensionsEnum.PDF, FileExtensionsEnum.PPT, FileExtensionsEnum.PPTX];
  private _allowedVideoFileExtensions: string[] = [FileExtensionsEnum.MKV, FileExtensionsEnum.MP4];

  documentTitleControl = new UntypedFormControl('', [CustomValidators.required, CustomValidators.maxLength(50)]);
  trainingProgramBriefcaseItemVsId: string = '';
  isDocumentFileRequired: boolean = false;

  isVideoFileExist(): boolean {
    return (this.bundlesList.some(item => item.isVideoItem()));
  }

  listenToReload(): void {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.trainingProgramBriefcaseService.loadTrainingBriefcaseByTrainingProgramId(this.trainingProgramId);
      })
    ).subscribe((bundles) => {
      this.bundlesList = bundles;
    });
  }

  private _updateAllowedExtensions(bundleItem?: TrainingProgramBriefcase): void {
    this.videoUploaded = this.isVideoFileExist();
    if (!bundleItem) {
      this.allowedExtensions = this._allowedFileExtensions;
      if (!this.isVideoFileExist()) {
        this.allowedExtensions = this.allowedExtensions.concat(this._allowedVideoFileExtensions);
      }
    } else {
      if (bundleItem.isVideoItem()) {
        this.allowedExtensions = this._allowedVideoFileExtensions;
      } else {
        this.allowedExtensions = this._allowedFileExtensions;
      }
    }
  }

  private fillAndShowForm(bundleItem?: TrainingProgramBriefcase): void {
    this.isDocumentFileRequired = !bundleItem; // required only if adding new
    this.trainingProgramBriefcaseItemVsId = '';

    this._updateAllowedExtensions(bundleItem);

    if (bundleItem) {
      this.trainingProgramBriefcaseItemVsId = bundleItem.vsId;
      this.documentTitleControl.setValue(bundleItem.documentTitle);
      this.documentTitleControl.updateValueAndValidity();
    }
    this.showForm = true;
  }

  isValidForm(): boolean {
    let isValid = this.documentTitleControl.valid;
    if (isValid) {
      isValid = this.isDocumentFileRequired ? !!this.uploadedFile : true;
    }
    return isValid;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fillAndShowForm(undefined);
      });
  }

  edit($event: MouseEvent, item: TrainingProgramBriefcase): void {
    $event.preventDefault();
    this.fillAndShowForm(item);
  }

  downloadBriefcaseItem($event: MouseEvent, item: TrainingProgramBriefcase): void {
    $event.preventDefault();
    this.trainingProgramBriefcaseService.downloadBriefcaseItem(item.vsId)
      .subscribe((data) => {
        printBlobData(data, item.documentTitle + '_download');
      });
  }

  downloadBriefcase($event: MouseEvent): void {
    $event.preventDefault();
    this.trainingProgramBriefcaseService.downloadBriefcase(this.trainingProgramId)
      .subscribe((data) => {
        printBlobData(data, 'briefcase_download');
      });
  }

  delete($event: MouseEvent, item: TrainingProgramBriefcase): void {
    $event.preventDefault();
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_x.change({x: item.documentTitle}))
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.trainingProgramBriefcaseService.deleteTrainingProgramBriefcaseItem(item.vsId)
            .subscribe(() => {
              this.reload$.next(null);
              this.toast.success(this.lang.map.msg_delete_success);
            });
        }
      });
  }

  saveBriefcaseItem(): void {
    if (!this.isValidForm()) {
      return;
    }
    let data = {
      vsId: this.trainingProgramBriefcaseItemVsId,
      documentTitle: this.documentTitleControl.value,
      trainingProgramId: this.trainingProgramId
    };

    if(this.bundlesList.map(b => b.documentTitle).includes(data.documentTitle)) {
      this.toast.error(this.lang.map.can_not_add_element_with_the_same_title);
      return;
    }

    let files: { [key: string]: File } = {};
    this.uploadedFile ? (files.documentFile = this.uploadedFile) : null;

    this.trainingProgramBriefcaseService.saveTrainingProgramBriefcaseItem(data, files)
      .subscribe((result) => {
        // if requests were generated due to missing files
        if (result === 'NO_REQUESTS_AVAILABLE') {
          this.toast.error(this.lang.map.msg_save_fail);
          return;
        }
        // if failed metadata only update
        if (result.hasOwnProperty('metaDataOnly') && !result.metaDataOnly) {
          this.toast.error(this.lang.map.msg_save_fail);
          return;
        }

        let failed = Object.values(result).filter((x: any) => !x);
        if (failed.length === 0) {
          this.toast.success(this.lang.map.msg_save_success);
        } else if (failed.length === Object.keys(files).length) {
          this.toast.error(this.lang.map.msg_save_fail);
        } else {
          this.toast.info(this.lang.map.msg_save_success_except_some);
        }
        this.reload$.next(null);
        this.cancelBriefcaseItem();
      });
  }

  cancelBriefcaseItem(): void {
    this.documentTitleControl.reset();
    this.showForm = false;
    this.trainingProgramBriefcaseItemVsId = '';
    this.removeFile();
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.fileUploader?.nativeElement.click();
  }

  private _clearFileUploader(): void {
    this.uploadedFile = null;
    this.fileUploader.nativeElement.value = '';
  }

  onFileSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (!this.allowedExtensions.includes(extension)) {
        const message = this.videoAlreadyUploaded(extension) ? this.lang.map.video_has_been_already_added : this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.allowedExtensions.join(', ')});
        this.dialogService.error(message);
        this.uploadedFilePath = '';
        this._clearFileUploader();
        return;
      }

      var reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = (_event) => {
        // @ts-ignore
        this.uploadedFile = files[0];
        this.uploadedFilePath = this.uploadedFile.name;
        // this.uploadedFilePath = event.target.result as string;
      };

    }
  }

  videoAlreadyUploaded(extension: string): boolean {
    return this._allowedVideoFileExtensions.includes(extension) && this.videoUploaded;
  }

  removeFile($event?: MouseEvent): void {
    $event?.preventDefault();
    this.uploadedFilePath = '';
    this._clearFileUploader();
  }
}
