import {Component, Inject, OnInit} from '@angular/core';
import {UrgentInterventionAttachment} from '@models/urgent-intervention-attachment';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {LangService} from '@services/lang.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {filter, map, switchMap, take, takeUntil} from 'rxjs/operators';
import {UrgentInterventionLicenseFollowupService} from '@services/urgent-intervention-license-followup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {FileExtensionsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {SharedService} from '@services/shared.service';
import {EmployeeService} from '@services/employee.service';
import {InternalUser} from '@models/internal-user';

@Component({
  selector: 'urgent-intervention-report-attachment-popup',
  templateUrl: './urgent-intervention-report-attachment-popup.component.html',
  styleUrls: ['./urgent-intervention-report-attachment-popup.component.scss']
})
export class UrgentInterventionReportAttachmentPopupComponent implements OnInit {

  list: UrgentInterventionAttachment[] = [];
  reportId: number;
  caseId: string;
  readonly: boolean = false;
  actionIconsEnum = ActionIconsEnum;

  constructor(public lang: LangService,
              private fb: UntypedFormBuilder,
              private dialogService: DialogService,
              private toastService: ToastService,
              private sharedService: SharedService,
              private employeeService: EmployeeService,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<UrgentInterventionAttachment>,
              private urgentInterventionLicenseFollowupService: UrgentInterventionLicenseFollowupService) {
    this.list = this.data.list;
    this.reportId = this.data.reportId;
    this.caseId = this.data.caseId;
    this.readonly = this.data.readonly ?? false;
  }

  customValidators = CustomValidators;
  fileExtensionsEnum = FileExtensionsEnum;
  attachmentFile: any;
  form!: UntypedFormGroup;
  showForm: boolean = false;
  viewOnly: boolean = false;
  editItem?: UrgentInterventionAttachment;
  private recordChanged$: Subject<UrgentInterventionAttachment | null> = new Subject<UrgentInterventionAttachment | null>();
  private currentRecord?: UrgentInterventionAttachment;

  reload$: BehaviorSubject<any> = new BehaviorSubject<any>('init');
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<UrgentInterventionAttachment> = new Subject<UrgentInterventionAttachment>();
  destroy$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();
  filterControl: UntypedFormControl = new UntypedFormControl('');
  displayedColumns: string[] = ['status', 'documentTitle', 'createdOn', 'actions'];

  sortingCallbacks = {
    createdOn: (a: UrgentInterventionAttachment, b: UrgentInterventionAttachment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.createdOn),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.createdOn);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  actions: IMenuItem<UrgentInterventionAttachment>[] = [
    // download
    {
      type: 'action',
      label: 'btn_download',
      icon: ActionIconsEnum.DOWNLOAD,
      onClick: (item) => this.downloadAttachment(item)
    },
    // approve
    {
      type: 'action',
      label: 'approve',
      icon: ActionIconsEnum.APPROVE,
      show: (item) => {
        if (this.readonly || this.employeeService.isExternalUser() || !item.creatorInfo || this.employeeService.isCurrentUser({generalUserId: item.creatorInfo.id} as InternalUser)) {
          return false;
        }
        return item.isApproved === null;
      },
      onClick: (item) => this.approveAttachment(item)
    },
    // reject
    {
      type: 'action',
      label: 'lbl_reject',
      icon: ActionIconsEnum.CANCEL,
      show: (item) => {
        if (this.readonly || this.employeeService.isExternalUser() || !item.creatorInfo || this.employeeService.isCurrentUser({generalUserId: item.creatorInfo.id} as InternalUser)) {
          return false;
        }
        return item.isApproved === null;
      },
      onClick: (item) => this.rejectAttachment(item)
    }
  ];

  ngOnInit(): void {
    this.buildForm();
    this.listenToReload();
    this.listenToAdd();
    this.listenToSave();
    this.listenToRecordChange();
  }


  buildForm(): void {
    this.form = this.fb.group(new UrgentInterventionAttachment().buildForm(true));
  }

  listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      filter((val) => val !== 'init'),
      switchMap((val) => this.urgentInterventionLicenseFollowupService.loadAttachmentsByReportId(this.reportId))
    ).subscribe((result: UrgentInterventionAttachment[]) => {
      this.list = result;
    });
  }

  listenToAdd() {
    this.add$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new UrgentInterventionAttachment());
    });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
      this.updateForm(this.currentRecord);
    });
  }

  private updateForm(record: UrgentInterventionAttachment | undefined) {
    if (record) {
      this.form.patchValue(record);
      if (this.readonly || this.viewOnly) {
        this.form.disable();
      }
    }
  }

  private displayRequiredFieldsMessage(): void {
    this.dialogService.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  save() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  private listenToSave() {
    this.save$.pipe(
      takeUntil(this.destroy$),
      filter(() => {
        let isValid = this.form.valid;
        if (isValid && !this.currentRecord?.id) {
          isValid = !!this.attachmentFile; // if new, file is mandatory
        }
        if (!isValid) {
          this.displayRequiredFieldsMessage();
        }
        return isValid;
      }),
      map(() => {
        return (new UrgentInterventionAttachment()).clone<UrgentInterventionAttachment>({
          ...this.currentRecord, ...this.form.getRawValue(),
          reportId: this.reportId
        });
      }),
      switchMap((value) => {
        return this.urgentInterventionLicenseFollowupService.saveAttachment(this.caseId, value, this.attachmentFile);
      })
    ).subscribe((result: UrgentInterventionAttachment) => {
      if (!result) {
        return;
      }
      this.reload$.next(null);
      this.toastService.success(this.lang.map.msg_save_success);
      this.recordChanged$.next(null);
      this.cancelForm();
    });
  }

  cancelForm() {
    this.resetForm();
    this.showForm = false;
    this.editItem = undefined;
    this.viewOnly = false;
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  edit(record: UrgentInterventionAttachment, $event?: MouseEvent) {
    $event?.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editItem = record;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }

  view(record: UrgentInterventionAttachment, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editItem = record;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  setAttachmentFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.attachmentFile = file;
    } else {
      this.attachmentFile = file[0];
    }
  }

  downloadAttachment(record: UrgentInterventionAttachment): void {
    this.urgentInterventionLicenseFollowupService.loadAttachmentAsBlob(record.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.sharedService.downloadFileToSystem(data.blob, 'UrgentInterventionAttachment');
      });
  }

  approveAttachment(record: UrgentInterventionAttachment): void {
    this.urgentInterventionLicenseFollowupService.approveAttachment(record.id).onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.reload$.next(null);
    });
  }

  rejectAttachment(record: UrgentInterventionAttachment): void {
    this.urgentInterventionLicenseFollowupService.rejectAttachment(record.id).onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.reload$.next(null);
    });
  }

}
