import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {InboxService} from '@app/services/inbox.service';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {QueryResult} from '@app/models/query-result';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@app/services/toast.service';
import {EmployeeService} from '@app/services/employee.service';
import {TeamService} from '@app/services/team.service';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn} from '@angular/forms';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {InternalUser} from '@app/models/internal-user';
import {InternalDepartment} from '@app/models/internal-department';
import {of, Subject} from 'rxjs';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CustomValidators} from '@app/validators/custom-validators';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {ExpertsEnum} from '@app/enums/experts-enum';
import {CaseModel} from "@app/models/case-model";

@Component({
  selector: 'send-to-multiple',
  templateUrl: './send-to-multiple.component.html',
  styleUrls: ['./send-to-multiple.component.scss']
})
export class SendToMultipleComponent implements OnInit, OnDestroy {
  users: InternalUser[] = [];
  departments: InternalDepartment[] = [];
  form!: FormGroup;
  done$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  title: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  maxSelectionCount!: number;

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      inboxService: InboxService,
      taskId: string,
      sendToResponse: WFResponseType,
      service: EServiceGenericService<any>,
      claimBefore: boolean,
      task: QueryResult | CaseModel<any, any>,
      extraInfo: any
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employee: EmployeeService,
    private teamService: TeamService,
    private intDepService: InternalDepartmentService,
    private fb: FormBuilder,
    private dialog: DialogService,
    public lang: LangService
  ) {
    if (this.isSendToDepartments() && WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS) {
      this.maxSelectionCount = 2; // as per business doc
    }
  }

  isSendToDepartments(): boolean {
    return this.data.sendToResponse === WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS
       || this.data.sendToResponse === WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS;
  }

  isSendToUsers(): boolean {
    return this.data.sendToResponse === WFResponseType.INTERNAL_PROJECT_SEND_TO_EXPERT;
  }

  private _loadInitData(): void {
    if (this.isSendToDepartments()) {
      this.loadDepartments();
      this.title = 'send_to_multi_departments';
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
        this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)
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
    this.intDepService.loadDepartments()
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
