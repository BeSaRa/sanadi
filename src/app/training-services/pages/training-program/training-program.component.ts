import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {TrainingProgram} from '@app/models/training-program';
import {TrainingProgramService} from '@app/services/training-program.service';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {cloneDeep as _deepClone} from 'lodash';
import {FilterEventTypes} from '@app/types/types';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonUtils} from '@app/helpers/common-utils';
import {ITrainingProgramCriteria} from '@app/interfaces/i-training-program-criteria';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {DateUtils} from '@app/helpers/date-utils';
import {of, Subject} from 'rxjs';
import {TrainingStatus} from '@app/enums/training-status';
import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';
import {IMyDateModel} from 'angular-mydatepicker';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {EmployeeService} from "@app/services/employee.service";
import {PermissionsEnum} from "@app/enums/permissions-enum";
import {SearchColumnConfigMap} from '@app/interfaces/i-search-column-config';
import {LookupService} from '@app/services/lookup.service';
import {FormBuilder} from '@angular/forms';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {TableComponent} from '@app/shared/components/table/table.component';

@Component({
  selector: 'training-program',
  templateUrl: './training-program.component.html',
  styleUrls: ['./training-program.component.scss']
})
export class TrainingProgramComponent extends AdminGenericComponent<TrainingProgram, TrainingProgramService> {

  constructor(public lang: LangService,
              public service: TrainingProgramService,
              private trainingProgramBriefcaseService: TrainingProgramBriefcaseService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private employeeService: EmployeeService,
              private toast: ToastService,
              private lookupService: LookupService,
              private fb: FormBuilder) {
    super();
  }

  view$: Subject<TrainingProgram> = new Subject<TrainingProgram>();
  displayedColumns: string[] = ['rowSelection', 'activityName', 'trainingType', 'acceptedTraineeNumber', 'trainingStatus', 'trainingDate', 'registrationDate', 'actions'];
  searchColumns: string[] = ['_', 'search_activityName', 'search_trainingType', 'search_acceptedTraineeNumber', 'search_trainingStatus', 'search_trainingDate', 'search_registrationDate', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_activityName: {
      key: 'activityName',
      controlType: 'text',
      property: 'activityName',
      label: 'training_program_activity_name',
    },
    search_trainingType: {
      key: 'trainingType',
      controlType: 'select',
      property: 'trainingType',
      label: 'training_type_name',
      selectOptions: {
        options: this.lookupService.listByCategory.TRAINING_TYPE,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    },
    search_trainingStatus: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'training_program_status',
      selectOptions: {
        options: this.lookupService.listByCategory.TRAINING_STATUS,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }
  @ViewChild('table') table!: TableComponent;

  selectedRecords: TrainingProgram[] = [];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  filterCriteria: Partial<ITrainingProgramCriteria> = {};
  trainingStatus = TrainingStatus;
  certification$: Subject<TrainingProgram> = new Subject<TrainingProgram>();
  permissions: typeof PermissionsEnum = PermissionsEnum;

  hasPermissionTo(permission: string): boolean {
    return this.employeeService.hasPermissionTo(permission);
  }

  protected _init(): void {
    this.buildFilterForm()
    this.listenToView();
    this.listenToCertification();
  }

  actions: IMenuItem<TrainingProgram>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      disabled: (item) => !this.canEditTrainingProgram(item),
      onClick: (item) => this.canEditTrainingProgram(item) && this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      disabled: (item) => !this.canDeleteTrainingProgram(item),
      onClick: (item) => this.canDeleteTrainingProgram(item) && this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item) => this.view$.next(item)
    },
    // Training Program Briefcase
    {
      type: 'action',
      label: 'training_program_briefcase',
      icon: ActionIconsEnum.BRIEFCASE,
      show: (item) => this.canShowBriefcases(item.status),
      onClick: (item) => this.openTrainingBriefcaseDialog(item)
    },
    // Training Add Candidates
    {
      type: 'action',
      label: 'training_program_add_candidates',
      icon: ActionIconsEnum.ADD_USER,
      show: (item) => this.canShowAddCandidates(item.status),
      onClick: (item) => this.candidates(item)
    },
    // Accept/Reject candidates
    {
      type: 'action',
      label: 'training_program_accept_reject_candidates',
      icon: ActionIconsEnum.USER_CHECK,
      show: (item) => this.canShowEvaluateCandidates(item.status),
      onClick: (item) => this.evaluateCandidates(item)
    },
    // Training Program Certification
    {
      type: 'action',
      label: 'training_program_certification',
      icon: ActionIconsEnum.CERTIFICATE,
      show: (item) => this.canShowCertificate(item),
      onClick: (item) => this.certification$.next(item)
    },
    // Attendance
    {
      type: 'action',
      label: 'attendance',
      icon: ActionIconsEnum.USER_CLOCK,
      show: (item) => this.isTrainingFinished(item.status),
      onClick: (item) => this.applyAttendance(item)
    },
    // Survey
    {
      type: 'action',
      label: (item) => {
        return !item.surveyPublished ? this.lang.map.publish_survey : this.lang.map.menu_surveys
      },
      class: (item) => (item.surveyPublished ? 'text-info' : 'text-primary'),
      icon: ActionIconsEnum.POLL,
      show: (item) => item.readyForSurvey() && this.employeeService.hasPermissionTo(PermissionsEnum.TRAINING_SURVEY_QUESTION),
      onClick: (item) => this.publishSurvey(item)
    },

  ];

  listenToCertification(): void {
    this.certification$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.certificationDialog(model).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.viewDialog(model).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  applyAttendance(trainingProgram: TrainingProgram, event?: MouseEvent) {
    event?.preventDefault();
    this.service.openAttendanceDialog(trainingProgram)
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  candidates(trainingProgram: TrainingProgram, event?: MouseEvent) {
    event?.preventDefault();
    const sub = this.service.openOrganizationCandidatesDialog(trainingProgram).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  openTrainingBriefcaseDialog(record: TrainingProgram, $event?: MouseEvent): void {
    $event?.preventDefault();
    let operationType = record.status == this.trainingStatus.TRAINING_FINISHED ? OperationTypes.VIEW : OperationTypes.CREATE
    const sub = this.trainingProgramBriefcaseService.openTrainingBriefcaseDialog(record, operationType).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  evaluateCandidates(trainingProgram: TrainingProgram, event?: MouseEvent) {
    event?.preventDefault();
    const sub = this.service.openEvaluateOrganizationCandidatesDialog(trainingProgram.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  private canEditTrainingProgram(trainingProgram: TrainingProgram): boolean {
    return !(trainingProgram.status == this.trainingStatus.TRAINING_CANCELED ||
      trainingProgram.status == this.trainingStatus.TRAINING_FINISHED) && this.employeeService.hasPermissionTo(PermissionsEnum.TRAINING_ADD_PUBLISH_PROGRAM);
  }

  isTrainingFinished(status: number): boolean {
    return status == this.trainingStatus.TRAINING_FINISHED && this.employeeService.hasPermissionTo(PermissionsEnum.TRAINING_MANAGE_TRAINEE);
  }

  canShowCertificate(trainingProgram: TrainingProgram): boolean {
    return this.isTrainingFinished(trainingProgram.status) && this.employeeService.hasPermissionTo(PermissionsEnum.TRAINING_CERTIFICATE_TRAINEE)
  }

  canShowAddCandidates(status: number): boolean {
    return status == this.trainingStatus.REGISTRATION_OPEN ||
      status == this.trainingStatus.TRAINING_PUBLISHED ||
      status == this.trainingStatus.EDITING_AFTER_PUBLISHING;
  }

  canShowEvaluateCandidates(status: number): boolean {
    return (status == this.trainingStatus.REGISTRATION_OPEN || status == this.trainingStatus.REGISTRATION_CLOSED) && this.employeeService.hasPermissionTo(PermissionsEnum.APPROVE_TRAINING_PROGRAM_CANDIDATES);
  }

  canShowBriefcases(status: number): boolean {
    return status != this.trainingStatus.TRAINING_CANCELED && this.employeeService.hasPermissionTo(PermissionsEnum.TRAINING_BUNDLE);
  }

  setStatusColumnClass(status: number) {
    switch (status) {
      case this.trainingStatus.REGISTRATION_OPEN:
        return {'status-container': true, 'open-for-registration-status': true};
      case this.trainingStatus.REGISTRATION_CLOSED:
        return {'status-container': true, 'closed-for-registration-status': true};
      case this.trainingStatus.TRAINING_FINISHED:
        return {'status-container': true, 'finished-status': true};
      case this.trainingStatus.TRAINING_CANCELED:
        return {'status-container': true, 'canceled-status': true};
      default:
        return {};
    }
  }

  canSelectProgram(item: TrainingProgram): boolean {
    return !(item.status != this.trainingStatus.DATA_ENTERED && item.status != this.trainingStatus.PROGRAM_APPROVED)
  }

  private canDeleteTrainingProgram(trainingProgram: TrainingProgram): boolean {
    return !(trainingProgram.status != this.trainingStatus.DATA_ENTERED
      && trainingProgram.status != this.trainingStatus.PROGRAM_APPROVED) && this.employeeService.hasPermissionTo(PermissionsEnum.TRAINING_ADD_PUBLISH_PROGRAM)
  }

  delete(model: TrainingProgram, event?: MouseEvent): void {
    event?.preventDefault();
    if (model.status != this.trainingStatus.DATA_ENTERED && model.status != this.trainingStatus.PROGRAM_APPROVED) {
      return;
    }
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.activityName});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.activityName}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.selectedRecords = [];
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  filterCallback = (type: FilterEventTypes = 'OPEN') => {
    if (type === 'CLEAR') {
      this.filterCriteria = {};
      this.reload$.next(null);
    } else if (type === 'OPEN') {
      this.filterCriteria = this.prepareFilterCriteriaForReceive(this.filterCriteria);
      const sub = this.service.openFilterDialog(this.filterCriteria)
        .subscribe((dialog: DialogRef) => {
          dialog.onAfterClose$.subscribe((result: UserClickOn | Partial<any>) => {
            if (!CommonUtils.isValidValue(result) || result === UserClickOn.CLOSE) {
              return;
            }
            this.filterCriteria = this.prepareFilterCriteriaForSend(result as Partial<ITrainingProgramCriteria>);
            this.reload$.next(null);
            sub.unsubscribe();
          });
        });
    }
  };

  prepareFilterCriteriaForSend(criteria: Partial<ITrainingProgramCriteria>) {
    if (criteria.targetOrganizationListIds && criteria.targetOrganizationListIds.length > 0) {
      criteria.targetOrganizationList = JSON.stringify(criteria.targetOrganizationListIds);
    }
    if (criteria.optionalTargetOrganizationListIds && criteria.optionalTargetOrganizationListIds.length > 0) {
      criteria.optionalTargetOrganizationList = JSON.stringify(criteria.optionalTargetOrganizationListIds);
    }
    delete criteria.targetOrganizationListIds;
    delete criteria.optionalTargetOrganizationListIds;
    criteria = this.deleteEmptyProperties(criteria);

    return criteria;
  }

  prepareFilterCriteriaForReceive(criteria: Partial<ITrainingProgramCriteria>) {
    if (criteria.targetOrganizationList) {
      criteria.targetOrganizationListIds = JSON.parse(this.filterCriteria.targetOrganizationList!);
    }
    if (criteria.optionalTargetOrganizationList) {
      criteria.optionalTargetOrganizationListIds = JSON.parse(this.filterCriteria.optionalTargetOrganizationList!);
    }
    if (criteria.startFromDate) {
      criteria.startFromDate = DateUtils.changeDateToDatepicker(this.filterCriteria.startFromDate);
    }
    if (criteria.startToDate) {
      criteria.startToDate = DateUtils.changeDateToDatepicker(this.filterCriteria.startToDate);
    }
    if (criteria.registerationFromDate) {
      criteria.registerationFromDate = DateUtils.changeDateToDatepicker(this.filterCriteria.registerationFromDate);
    }
    if (criteria.registerationToDate) {
      criteria.registerationToDate = DateUtils.changeDateToDatepicker(this.filterCriteria.registerationToDate);
    }

    return criteria;
  }

  deleteEmptyProperties(obj: any) {
    for (let propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        const load = this.service.filterTrainingPrograms(this.filterCriteria);
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: TrainingProgram[]) => {
        list.map(element => {
          element.registrationDate = this.getDateFromTo(element.registerationStartDate, element.registerationClosureDate);
          element.trainingDate = this.getDateFromTo(element.startDate, element.endDate);
        });
        this.models = list;
        this.afterReload();
      });
  }

  getDateFromTo(dateFrom: string | IMyDateModel, dateTo: string | IMyDateModel) {
    return DateUtils.getDateStringFromDate(dateFrom) + ' إلى ' + DateUtils.getDateStringFromDate(dateTo);
  }

  publishSurvey(program: TrainingProgram): void {
    if (program.surveyPublished) {
      // this.toast.error(this.lang.map.the_survey_for_this_program_has_been_published_before);
      program.viewProgramSurvey().subscribe(() => this.reload$.next(null));
      return;
    }
    program.publishSurvey()
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.reload$.next(null));
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      activityName: [''], trainingType: [null], status: [null]
    })
  }

  allSelected() {
    return this.table.selection.selected.length === this.table.dataSource.data.filter(item => this.canSelectProgram(item)).length;
  }

  toggleAllSelectable(): void {
    const allSelected = this.allSelected();
    if (allSelected) {
      this.table.clearSelection();
    } else {
      this.table.dataSource.data.forEach((item: TrainingProgram) => this.canSelectProgram(item) && this.table.selection.select(item));
    }
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
  }
}
