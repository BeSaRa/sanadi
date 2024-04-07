import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ActualInspection } from '@app/models/actual-inspection';
import { LicenseActivity } from '@app/models/license-activity';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LicenseActivityService } from '@app/services/license-activity.service';
import { Observable, Subject, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LicenseActivityPopupComponent } from '../../popups/license-activity-popup/license-activity-popup.component';
import { ToastService } from '@app/services/toast.service';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { GlobalSettings } from '@app/models/global-settings';
import { FileNetDocument } from '@app/models/file-net-document';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'manage-license-activities',
  templateUrl: 'manage-license-activities.component.html',
  styleUrls: ['manage-license-activities.component.scss']
})
export class ManageLicenseActivitiesComponent implements OnInit, OnDestroy {

  @Input()
  disabled: boolean = false;

  @Input() list: LicenseActivity[] = [];

  @Input() actualInspection!: ActualInspection
  destroy$ = new Subject<void>()
  displayedColumns: string[] = ['activityName', 'activityDescription', 'comment', 'status', 'actions'];
  addLicenseActivityDialog$: Subject<any> = new Subject<any>();


  constructor(public lang: LangService,
    private dialog: DialogService,
    private licenseActivityService: LicenseActivityService,
    private toast: ToastService,
    private globalSettingsService: GlobalSettingsService) {


  }
  actions: IMenuItem<LicenseActivity>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: LicenseActivity) => this.viewItem(item),
      show: () => this.disabled
    },
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: LicenseActivity, index) => this.editItem(item, index),
      show: () => !this.disabled
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: LicenseActivity, index) => this.deleteItem(item, index),
      show: () => !this.disabled
    },
    // complete
    {
      type: 'action',
      label: 'btn_complete',
      icon: ActionIconsEnum.APPROVED,
      onClick: (item: LicenseActivity, index) => this.complete(item, index),
      show: (item: LicenseActivity) => !item.status && !this.disabled,

    },
  ];

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$.subscribe()
  }

  ngOnInit(): void {
    this.listenToAdd()
  }

  listenToAdd() {
    this.addLicenseActivityDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.openAddDialog()
      })
  }

  openAddDialog() {
    this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
      model: new LicenseActivity(),
      readonly: this.disabled,
      operation: OperationTypes.CREATE,
    }).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value: LicenseActivity): value is LicenseActivity => !!value))
      .pipe(
        switchMap((value: LicenseActivity) => {
          value.actualInspection = new ActualInspection().clone({
            id: this.actualInspection.id
          })
          value.inspectionDate = new Date().toISOString()
          value.isDefined = true;
          return this.licenseActivityService.create(value)
        }), tap(() => {
          this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: this.lang.map.license_activity }));
        }),

      )
      .pipe(filter((value: LicenseActivity): value is LicenseActivity => !!value))

      .subscribe((item) => {

        this.list = this.list.concat(item)

      })
  }
  deleteItem(item: LicenseActivity, index: number) {
    this.dialog
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value): value is UserClickOn.YES => value === UserClickOn.YES))
      .pipe(
        switchMap((_) => {

          return this.licenseActivityService.delete(item.id)
        }),
        map(() => {
          this.toast.success(this.lang.map.msg_delete_success);
          return true
        }),
        catchError((_) => {
          this.toast.error(this.lang.map.msg_delete_fail);
          return of(false)
        })
      )
      .subscribe((success) => {
        if (success) {

          this.list = this.list.filter(x => x !== item)
        }

      })
  }

  viewItem(item: LicenseActivity) {
    this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
      model: new LicenseActivity().clone(item),
      operation: OperationTypes.VIEW,
      readonly: this.disabled
    })
  }
  editItem(item: LicenseActivity, index: number) {
    this.dialog.show<IDialogData<LicenseActivity>>(LicenseActivityPopupComponent, {
      model: new LicenseActivity().clone(item),
      operation: OperationTypes.UPDATE,

    }).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter((value: LicenseActivity): value is LicenseActivity => !!value))
      .pipe(
        switchMap((value: LicenseActivity) => {

          value.actualInspection = {
            id: this.actualInspection.id
          } as ActualInspection
          return this.licenseActivityService.updateLicense(value)
        }),
        tap(() => {
          this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: this.lang.map.license_activity }));
        }),
        catchError((_) => {
          this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: this.lang.map.license_activity }));
          return of(null)
        })
      )
      .subscribe((updatedItem) => {
        if (!!updatedItem) {
          this.list = this.list.map((item, i) => {
            return i === index ? new LicenseActivity().clone(updatedItem) : item
          })
        }

      })
  }

  selectedLicense?: LicenseActivity
  uploadAttachment(item: LicenseActivity, uploader: HTMLInputElement): void {
    if (!item.activityFolderId) {
      this.dialog.info(
        this.lang.map.this_action_cannot_be_performed_before_saving_the_request
      );
      return;
    }
    this.selectedLicense = item
    uploader.click();
  }

  viewFile(item: LicenseActivity): void {
    if (!item.uploadedDocId) {
      return;
    }
    const file = new FileNetDocument().clone({
      documentTitle: this.lang.map.lbl_final_report,
      description: this.lang.map.lbl_final_report,
    });
    this.licenseActivityService
      .downloadDocument(item.uploadedDocId)
      .pipe(
        take(1),
        map((model) => this.licenseActivityService.viewDocument(model, file)),

      )
      .subscribe();
  }
  allowedExtensions: string[] = [FileExtensionsEnum.PDF, FileExtensionsEnum.JPG, FileExtensionsEnum.PNG, FileExtensionsEnum.JPEG];

  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize
  uploaderFileChange($event: Event): void {
    const input = ($event.target as HTMLInputElement);
    const file = input.files?.item(0);
    const validFile = file ? (this.allowedExtensions.includes(file.name.getExtension())) : true;
    !validFile ? input.value = '' : null;
    if (!validFile) {
      this.dialog.error(this.lang.map.msg_only_those_files_allowed_to_upload.change({ files: this.allowedExtensions.join(', ') }));
      input.value = '';
      return;
    }
    const validFileSize = file ? (file.size <= this.allowedFileMaxSize * 1000 * 1024) : true;
    !validFileSize ? input.value = '' : null;
    if (!validFileSize) {
      this.dialog.error(this.lang.map.msg_only_this_file_size_or_less_allowed_to_upload.change({ size: this.allowedFileMaxSize }));
      input.value = '';
      return;
    }
    of(null)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(_ => {
          return this._createAttachmentFile(input.files!);
        })
      ).subscribe((attachment) => {
        input.value = '';
        this._afterSaveAttachmentFile(attachment);
      });


  }
  private _createAttachmentFile(filesList: FileList | undefined): Observable<FileNetDocument> {
    const document = new FileNetDocument().clone({
      documentTitle: this.lang.map.lbl_final_report,
      description: this.lang.map.lbl_final_report,
      attachmentTypeId: -1,
      required: false,
      isPublished: false,
      files: filesList
    })
    return this.licenseActivityService.saveDocument(this.selectedLicense!.activityFolderId, this.actualInspection.id, document);
  }
  private _afterSaveAttachmentFile(attachment: FileNetDocument) {
    this.selectedLicense!.uploadedDocId = attachment.id;
  }

  complete(updatedItem: LicenseActivity, index: number): void {
    this.licenseActivityService.openCompleteDialog(updatedItem).onAfterClose$
      .pipe(
        take(1),
        tap((completedItem) => {
          this.list = this.list.map((item, i) => {
            return i === index ? new LicenseActivity().clone(completedItem) : item
          })

        })
      ).subscribe()
  }

}
