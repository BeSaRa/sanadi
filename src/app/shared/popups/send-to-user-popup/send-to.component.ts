import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {InboxService} from '../../../services/inbox.service';
import {EmployeeService} from '../../../services/employee.service';
import {TeamService} from '../../../services/team.service';
import {InternalUser} from '../../../models/internal-user';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {InternalDepartmentService} from '../../../services/internal-department.service';
import {of, Subject} from 'rxjs';
import {InternalDepartment} from '../../../models/internal-department';
import {EServiceGenericService} from '../../../generics/e-service-generic-service';
import {WFResponseType} from '../../../enums/wfresponse-type.enum';
import {ToastService} from '../../../services/toast.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogRef} from '../../models/dialog-ref';
import {QueryResult} from '../../../models/query-result';
import {IWFResponse} from '../../../interfaces/i-w-f-response';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'send-to-user-popup',
  templateUrl: './send-to.component.html',
  styleUrls: ['./send-to.component.scss']
})
export class SendToComponent implements OnInit, OnDestroy {
  users: InternalUser[] = [];
  departments: InternalDepartment[] = [];
  group!: FormGroup;
  done$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  WFResponse: typeof WFResponseType = WFResponseType;
  controlName: string = '';
  title: keyof ILanguageKeys = 'send_to_user';

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      inboxService: InboxService,
      taskId: string,
      sendToResponse: WFResponseType,
      service: EServiceGenericService<any>,
      claimBefore: boolean,
      task: QueryResult
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employee: EmployeeService,
    private teamService: TeamService,
    private intDepService: InternalDepartmentService,
    private fb: FormBuilder,
    private dialog: DialogService,
    public lang: LangService) {
  }

  ngOnInit(): void {
    this.buildForm();

    switch (this.data.sendToResponse) {
      case WFResponseType.TO_USER:
        this.title = 'send_to_user';
        this.loadUsers();
        break;
      case WFResponseType.TO_COMPETENT_DEPARTMENT:
        this.title = 'send_to_competent_dep';
        this.loadDepartments();
        break;
      case WFResponseType.TO_MANAGER:
        this.title = 'send_to_manager';
        break;
      case WFResponseType.TO_GM:
        this.title = 'send_to_general_manager';
        break;
      default:
        this.title = 'send';
    }
    this.listenToSave();


    /*if (this.data.sendToResponse === WFResponseType.TO_USER) {
      this.loadUsers();
      this.title = 'send_to_user';
    } else if (this.data.sendToResponse === WFResponseType.TO_COMPETENT_DEPARTMENT) {
      this.loadDepartments();
      this.title = 'send_to_competent_dep';
    } else {
      this.title = 'send_to_manager';
    }
    this.listenToSave();*/
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    const id = this.employee.getInternalDepartment()?.mainTeam.id!;
    this.teamService
      .loadTeamMembers(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.users = users;
      });
  }

  loadDepartments(): void {
    this.intDepService.loadDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps.filter(dep => dep.id !== this.employee.getInternalDepartment()?.id));
  }

  private buildForm(): void {
    this.group = this.fb.group({
      comment: [null]
    });

    switch (this.data.sendToResponse) {
      case WFResponseType.TO_USER:
        this.group.addControl('user', this.fb.control(null, CustomValidators.required));
        this.controlName = 'user';
        break;
      case WFResponseType.TO_COMPETENT_DEPARTMENT:
        this.group.addControl('department', this.fb.control(null, CustomValidators.required));
        this.controlName = 'department';
        break;
    }
  }


  private send(): void {
    let response: Partial<IWFResponse> = {
      comment: this.group.get('comment')?.value,
      selectedResponse: this.data.sendToResponse
    };

    if (this.controlName) {
      response[this.data.sendToResponse === WFResponseType.TO_USER ? 'generalUserId' : 'competentDeptId'] = this.group.get(this.controlName)?.value!;
    }

    this.data.inboxService.sendTaskTo(this.data.taskId, response, this.data.service)
      .pipe(take(1))
      .subscribe(() => {
        this.toast.success(this.lang.map.sent_successfully);
        this.dialogRef.close(true);
      });
  }

  private listenToSave() {
    const send$ = this.done$.pipe(takeUntil(this.destroy$));
    // when form fail
    send$.pipe(filter(_ => this.group.invalid))
      .subscribe(() => this.dialog.error(this.lang.map.msg_all_required_fields_are_filled));
    // if form success
    send$
      .pipe(filter(_ => this.group.valid))
      .pipe(switchMap(_ => this.data.claimBefore ? this.data.task.claim() : of(null)))
      .subscribe(() => this.send());
  }
}
