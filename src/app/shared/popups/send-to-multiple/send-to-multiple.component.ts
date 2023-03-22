import { CaseTypes } from '@app/enums/case-types.enum';
import { ServiceDataService } from '@app/services/service-data.service';
import { AdminstrationDepartmentCodes } from './../../../enums/department-code.enum';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { InboxService } from '@app/services/inbox.service';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { QueryResult } from '@app/models/query-result';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@app/services/toast.service';
import { EmployeeService } from '@app/services/employee.service';
import { TeamService } from '@app/services/team.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { InternalUser } from '@app/models/internal-user';
import { InternalDepartment } from '@app/models/internal-department';
import { of, Subject, forkJoin } from 'rxjs';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, switchMap, take, takeUntil, map } from 'rxjs/operators';
import { ExpertsEnum } from '@app/enums/experts-enum';
import { CaseModel } from '@app/models/case-model';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'send-to-multiple',
  templateUrl: './send-to-multiple.component.html',
  styleUrls: ['./send-to-multiple.component.scss']
})
export class SendToMultipleComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      inboxService: InboxService,
      taskId: string,
      sendToResponse: WFResponseType,
      service: BaseGenericEService<any>,
      claimBefore: boolean,
      task: QueryResult | CaseModel<any, any>,
      extraInfo: any
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employee: EmployeeService,
    private teamService: TeamService,
    private intDepService: InternalDepartmentService,
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    private serviceDataService: ServiceDataService,
    public lang: LangService,
  ) {
    if (this.isSendToDepartments() && this.twoDepartmentsWFResponses.includes(this.data.sendToResponse)) {
      this.maxSelectionCount = 2; // as per business doc
    }
  }

  users: InternalUser[] = [];
  departments: InternalDepartment[] = [];
  form!: UntypedFormGroup;
  done$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  title: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  maxSelectionCount!: number;
  multiSendToDepartmentWFResponseList = [
    WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.INTERNAL_BANK_ACCOUNT_APPROVAL_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.AWARENESS_ACTIVITY_SUGGESTION_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.CHARITY_ORGANIZATION_UPDATE_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.REVIEW_NPO_MANAGEMENT,
    WFResponseType.FOREIGN_COUNTRIES_PROJECTS_LICENSING_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.PROJECT_FUNDRAISING_SEND_TO_DEPARTMENTS,
    WFResponseType.GENERAL_NOTIFICATION_SEND_TO_SINGLE_DEPARTMENTS,
    WFResponseType.ORGANIZATION_ENTITIES_SUPPORT_TO_MULTI_DEPARTMENTS,
  ];
  multiSendToUserWFResponseList = [
    WFResponseType.INTERNAL_PROJECT_SEND_TO_EXPERT
  ];
  twoDepartmentsWFResponses = [
    WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS,
    WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS,
  ];


  isSendToDepartments(): boolean {
    return this.multiSendToDepartmentWFResponseList.includes(this.data.sendToResponse);
  }

  isSendToUsers(): boolean {
    return this.multiSendToUserWFResponseList.includes(this.data.sendToResponse);
  }

  private _loadByServiceData(caseType: CaseTypes) {
    const serviceData = this.serviceDataService.loadByCaseType(caseType)
      .pipe(
        filter(result => !!result.concernedDepartmentsIds),
        map(result => <Number[]>JSON.parse(result.concernedDepartmentsIds!)),
      );

    const internalDepartments = this.intDepService.loadAsLookups()

    forkJoin([serviceData, internalDepartments])
      .subscribe(([ids, departments]) => {
        this.departments = departments.filter(dep => (!ids.length || ids?.includes(dep.id)) && dep.id !== this.employee.getInternalDepartment()?.id);
      })
  }
  private _loadInitData(): void {
    if (this.isSendToDepartments()) {
      this.title = 'send_to_multi_departments';
      this._loadByServiceData(this.data.task.getCaseType());
    } else if (this.isSendToUsers()) {
      if (this.data.extraInfo && this.data.extraInfo.teamType) {
        if (this.data.extraInfo.teamType === ExpertsEnum.DEVELOPMENTAL) {
          this.title = 'send_to_development_expert';
        } else if (this.data.extraInfo.teamType === ExpertsEnum.STRUCTURAL) {
          this.title = 'send_to_structure_expert';
        }
        this.loadUsersByTeamLookup(this.data.extraInfo.teamType);
      }
    }
  }

  ngOnInit(): void {
    this._loadInitData();
    this.buildForm();
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    let taskName: string = this.data.sendToResponse,
      departmentsValidators: ValidatorFn[] | null = null,
      usersValidators: ValidatorFn[] | null = null;

    if (taskName.startsWith('ask:')) {
      taskName = taskName.split('ask:')[1];
    } else if (taskName.startsWith('askSingle:')) {
      taskName = taskName.split('askSingle:')[1];
    }

    if (this.isSendToDepartments()) {
      departmentsValidators = [CustomValidators.required];
      usersValidators = null;
    } else if (this.isSendToUsers()) {
      usersValidators = [CustomValidators.required];
      departmentsValidators = null;
    }

    this.form = this.fb.group({
      taskName: [taskName, CustomValidators.required],
      departments: [[], departmentsValidators],
      users: [[], usersValidators]
    });
  }

  get taskNameControl(): AbstractControl {
    return this.form.get('taskName') as AbstractControl;
  }

  get departmentsControl(): AbstractControl {
    return this.form.get('departments') as AbstractControl;
  }

  get usersControl(): AbstractControl {
    return this.form.get('users') as AbstractControl;
  }

  isValidForm(): boolean {
    let isValid: boolean = !!(this.taskNameControl && this.taskNameControl.value);
    if (!isValid) {
      return false;
    }
    if (this.isSendToDepartments()) {
      isValid = this.departmentsControl.value && this.departmentsControl.value.length > 0;
    } else if (this.isSendToUsers()) {
      isValid = this.usersControl.value && this.usersControl.value.length > 0;
    }
    return isValid;
  }

  private listenToSave() {
    const send$ = this.done$.pipe(takeUntil(this.destroy$));
    // when form fail
    send$.pipe(filter(_ => !this.isValidForm()))
      .subscribe(() => {
        this.form.markAllAsTouched();
        this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      });
    // if form success
    send$
      .pipe(filter(_ => this.isValidForm()))
      .pipe(switchMap(_ => this.data.claimBefore ? this.data.task.claim() : of(null)))
      .subscribe(() => this.send());
  }

  private send(): void {
    let data = this.form.value;
    if (this.isSendToDepartments()) {
      delete data.users;
    } else if (this.isSendToUsers()) {
      delete data.departments;
    }
    this.data.inboxService.sendTaskToMultiple(this.data.task.getCaseId(), data, this.data.service)
      .pipe(take(1))
      .subscribe(() => {
        this.toast.success(this.lang.map.sent_successfully);
        this.dialogRef.close(true);
      });
  }

  loadDepartments(): void {
    this.intDepService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps.filter(dep => dep.id !== this.employee.getInternalDepartment()?.id));
  }

  loadUsersByTeamLookup(teamLookupKey: number): void {
    this.teamService
      .loadTeamMembers(teamLookupKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.users = users;
      });
  }

  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }
}
