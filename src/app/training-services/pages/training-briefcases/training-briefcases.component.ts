import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {LangService} from '@app/services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {map, switchMap, take, takeUntil} from 'rxjs/operators';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';
import {TrainingProgramBriefcase} from '@app/models/training-program-briefcase';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {printBlobData} from '@app/helpers/utils';
import {IGridAction} from '@app/interfaces/i-grid-action';

@Component({
  selector: 'training-program-briefcases',
  templateUrl: './training-briefcases.component.html',
  styleUrls: ['./training-briefcases.component.scss']
})
export class TrainingBriefcasesComponent implements OnInit, OnDestroy {

  @Input() trainingProgramId!: number;
  @Input() bundlesList: TrainingProgramBriefcase[] = [];

  selectedRecords: TrainingProgramBriefcase[] = [];

  constructor(public lang: LangService,
              private dialogService: DialogService,
              private toast: ToastService,
              private trainingProgramBriefcaseService: TrainingProgramBriefcaseService) {
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
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
      callback: ($event: MouseEvent, action: IGridAction) => this.downloadBulkTrainingProgramBriefcase($event),
      show: (items: TrainingProgramBriefcase[]) => {
        return this.bundlesList.length > 0;
      }
    }
  ];

  showForm: boolean = false;
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  displayedColumns: string[] = ['icon', 'documentTitle', 'actions'];
  private destroy$: Subject<any> = new Subject<any>();

  @ViewChild('fileUploader') fileUploader!: ElementRef;
  uploadedFilePath: string = '';
  uploadedFile: any;
  allowedFileExtensions: string[] = ['.pdf', '.pptx'];

  @ViewChild('videoUploader') videoUploader!: ElementRef;
  uploadedVideoFilePath: string = '';
  uploadedVideoFile: any;
  allowedVideoExtensions: string[] = ['.mp4', '.mkv'];

  documentTitleControl = new FormControl('', [CustomValidators.required, CustomValidators.maxLength(50)]);
  trainingProgramBriefcaseVsId: string = '';
  isPdfFileRequired: boolean = false;

  listenToReload(): void {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.trainingProgramBriefcaseService.loadTrainingBriefcasesByTrainingProgramId(this.trainingProgramId);
      })
    ).subscribe((bundles) => {
      this.bundlesList = bundles;
    });
  }

  private fillAndShowForm(bundle?: any): void {
    this.trainingProgramBriefcaseVsId = bundle ? bundle.vsId : '';
    this.isPdfFileRequired = !this.trainingProgramBriefcaseVsId; // required only if adding new

    this.documentTitleControl.setValue(bundle ? bundle.documentTitle : '');
    this.documentTitleControl.updateValueAndValidity();

    this.showForm = true;
  }

  isValidForm(): boolean {
    let isValid = this.documentTitleControl.valid;
    if (isValid) {
      isValid = this.isPdfFileRequired ? !!this.uploadedFile : true;
    }
    return isValid;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fillAndShowForm();
      });
  }

  edit($event: MouseEvent, model: TrainingProgramBriefcase): void {
    $event.preventDefault();
    this.fillAndShowForm(model);
  }

  download($event: MouseEvent, model: TrainingProgramBriefcase): void {
    $event.preventDefault();
    this.trainingProgramBriefcaseService.downloadTrainingProgramBriefcase(model.vsId)
      .subscribe((data) => {
        printBlobData(data, 'download');
      })
  }

  downloadBulkTrainingProgramBriefcase($event: MouseEvent): void {
    $event.preventDefault();
    this.trainingProgramBriefcaseService.downloadBulkTrainingProgramBriefcase(this.trainingProgramId)
      .subscribe((data) => {
        printBlobData(data, 'download');
      })
  }

  delete($event: MouseEvent, model: TrainingProgramBriefcase): void {
    $event.preventDefault();
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_x.change({x: model.documentTitle}))
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.trainingProgramBriefcaseService.deleteTrainingProgramBriefcase(model.vsId)
            .subscribe(() => {
              this.reload$.next(null);
              this.toast.success(this.lang.map.msg_delete_success);
            })
        }
      });
  }

  saveBriefcase(): void {
    if (!this.isValidForm()) {
      return;
    }
    let data = {
      vsId: this.trainingProgramBriefcaseVsId,
      documentTitle: this.documentTitleControl.value,
      trainingProgramId: this.trainingProgramId
    };

    let files: any = {};
    files.pdf = this.uploadedFile || null;
    files.video = this.uploadedVideoFile || null;

    this.trainingProgramBriefcaseService.saveTrainingProgramBriefcase(data, files)
      .subscribe((result) => {
        let failed = Object.values(result).filter((x: any) => !x);
        if (failed.length === 0) {
          this.toast.success(this.lang.map.msg_save_success);
        } else if (failed.length === Object.keys(files).length) {
          this.toast.error(this.lang.map.msg_save_fail);
        } else {
          this.toast.info(this.lang.map.msg_save_success_except_some);
        }
        this.reload$.next(null);
        this.cancelBriefcase();
      });
  }

  cancelBriefcase(): void {
    this.showForm = false;
    this.trainingProgramBriefcaseVsId = '';
    this.removeFile();
    this.removeVideoFile();
  }

  openFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.fileUploader?.nativeElement.click();
  }

  openVideoFileBrowser($event: MouseEvent): void {
    $event?.stopPropagation();
    $event?.preventDefault();
    this.videoUploader?.nativeElement.click();
  }

  private _clearFileUploader(): void {
    this.uploadedFile = null;
    this.fileUploader.nativeElement.value = "";
  }

  private _clearVideoFileUploader(): void {
    this.uploadedVideoFile = null;
    this.videoUploader.nativeElement.value = "";
  }

  onFileSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.allowedFileExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.allowedFileExtensions.join(', ')}));
        this.uploadedFilePath = '';
        this._clearFileUploader();
        return;
      }

      var reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = (event) => {
        // @ts-ignore
        this.uploadedFile = files[0];
        this.uploadedFilePath = this.uploadedFile.name;
        // this.uploadedFilePath = event.target.result as string;
      };

    }
  }

  onVideoFileSelected($event: Event): void {
    let files = ($event.target as HTMLInputElement).files;
    if (files && files[0]) {
      const extension = files[0].name.getExtension().toLowerCase();
      if (this.allowedVideoExtensions.indexOf(extension) === -1) {
        this.dialogService.error(this.lang.map.msg_invalid_format_allowed_formats.change({formats: this.allowedVideoExtensions.join(', ')}));
        this.uploadedVideoFilePath = '';
        this._clearVideoFileUploader();
        return;
      }

      var reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.onload = (event) => {
        // @ts-ignore
        this.uploadedVideoFile = files[0];
        this.uploadedVideoFilePath = this.uploadedVideoFile.name;
        // this.uploadedVideoFilePath = event.target.result as string;
      };

    }
  }

  removeFile($event?: MouseEvent): void {
    $event?.preventDefault();
    this.uploadedFilePath = '';
    this._clearFileUploader();
  }

  removeVideoFile($event?: MouseEvent): void {
    $event?.preventDefault();
    this.uploadedVideoFilePath = '';
    this._clearVideoFileUploader();
  }
}
