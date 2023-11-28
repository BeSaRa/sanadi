import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { InboxService } from '@app/services/inbox.service';
import { EmployeeService } from '@app/services/employee.service';
import { TeamService } from '@app/services/team.service';
import { InternalUser } from '@app/models/internal-user';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { forkJoin, of, Subject } from 'rxjs';
import { InternalDepartment } from '@app/models/internal-department';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { ToastService } from '@app/services/toast.service';
import { DialogService } from '@app/services/dialog.service';
import { DialogRef } from '../../models/dialog-ref';
import { QueryResult } from '@app/models/query-result';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CaseModel } from "@app/models/case-model";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { ServiceDataService } from '@app/services/service-data.service';
import { Consultation } from '@app/models/consultation';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { AdminstrationDepartmentCodes } from '@app/enums/department-code.enum';
import { CaseTypes } from '@app/enums/case-types.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'send-to-user-popup',
  templateUrl: './send-to.component.html',
  styleUrls: ['./send-to.component.scss']
})
export class SendToComponent implements OnInit, OnDestroy {
  users: InternalUser[] = [];
  departments: InternalDepartment[] = [];
  group!: UntypedFormGroup;
  done$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  WFResponse: typeof WFResponseType = WFResponseType;
  controlName: string = '';
  title: keyof ILanguageKeys = 'send_to_user';
  internationalCooperationAllowedDepartments = [AdminstrationDepartmentCodes.SVC, AdminstrationDepartmentCodes.LCN, AdminstrationDepartmentCodes.RC, AdminstrationDepartmentCodes.IN];
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      inboxService: InboxService,
      taskId: string,
      sendToResponse: WFResponseType,
      service: BaseGenericEService<any>,
      claimBefore: boolean,
      task: QueryResult | CaseModel<any, any>
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private employee: EmployeeService,
    private teamService: TeamService,
    private intDepService: InternalDepartmentService,
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    private serviceDataService: ServiceDataService,
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
      case WFResponseType.SEND_TO_GM:
      case WFResponseType.TO_GM:
        this.title = 'send_to_general_manager';
        break;
      case WFResponseType.TO_DEVELOPMENT_EXPERT:
        this.title = 'send_to_development_expert';
        break;
      case WFResponseType.TO_CONSTRUCTION_EXPERT:
        this.title = 'send_to_structure_expert';
        break;
      case WFResponseType.TO_CHIEF:
        this.title = 'send_to_chief';
        break;
      case WFResponseType.SEEN:
        this.title = 'task_seen';
        break;
      default:
        this.title = 'send';
    }
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    let id;
    if(this.data.task.getCaseType() == CaseTypes.CONSULTATION) {
      id = (this.data.task as Consultation).mainTeamId;
    } else {
      id = this.employee.getInternalDepartment()?.mainTeam.id!;
    }
    this.teamService
      .loadTeamMembers(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.users = users;
      });
  }

  loadDepartments(): void {
    const serviceData = this.serviceDataService.loadByCaseType(this.data.task.getCaseType())
      .pipe(
        map(result => result.concernedDepartmentsIdsParsed ?? []),
      );

    const internalDepartments = this.intDepService.loadAsLookups()

    forkJoin([serviceData, internalDepartments])
      .subscribe(([relatedDepartments, allDepartments]) => {
        this.departments = allDepartments.filter(dep => relatedDepartments.includes(dep.id) && dep.id !== this.employee.getInternalDepartment()?.id);
      })

    // this.intDepService.loadAsLookups()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(deps => {
    //     this.departments = deps.filter(dep => dep.id !== this.employee.getInternalDepartment()?.id)
    //     if (this.data.task.getCaseType() == CaseTypes.INTERNATIONAL_COOPERATION) {
    //       this.departments = this.departments.filter(dep => this.internationalCooperationAllowedDepartments.includes(dep.code as AdminstrationDepartmentCodes))
    //     }
    //   });
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
