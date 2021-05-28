import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {InboxService} from '../../../services/inbox.service';
import {EmployeeService} from '../../../services/employee.service';
import {TeamService} from '../../../services/team.service';
import {InternalUser} from '../../../models/internal-user';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {take, takeUntil} from 'rxjs/operators';
import {InternalDepartmentService} from '../../../services/internal-department.service';
import {Subject} from 'rxjs';
import {InternalDepartment} from '../../../models/internal-department';
import {EServiceGenericService} from '../../../generics/e-service-generic-service';
import {WFResponseType} from '../../../enums/wfresponse-type.enum';
import {ToastService} from '../../../services/toast.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogRef} from '../../models/dialog-ref';

@Component({
  selector: 'send-to-user-popup',
  templateUrl: './send-to.component.html',
  styleUrls: ['./send-to.component.scss']
})
export class SendToComponent implements OnInit, OnDestroy {
  users: InternalUser[] = [];
  departments: InternalDepartment[] = [];
  group!: FormGroup;
  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      inboxService: InboxService,
      taskId: string,
      sendToUser: boolean,
      service: EServiceGenericService<any, any>
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
    if (this.data.sendToUser) {
      this.loadUsers();
    } else {
      this.loadDepartments();
    }
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
      .subscribe(deps => this.departments = deps);
  }

  private buildForm(): void {
    this.group = this.fb.group({
      [this.data.sendToUser ? 'user' : 'department']: [null, CustomValidators.required],
      comment: [null]
    });
  }


  send(): void {
    if (this.group.invalid) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }

    const id: number = this.group.get(this.data.sendToUser ? 'user' : 'department')?.value!;

    this.data.inboxService.sendTaskTo(this.data.taskId, {
      comment: this.group.get('comment')?.value,
      selectedResponse: this.data.sendToUser ? WFResponseType.TO_USER : WFResponseType.TO_COMPETENT_DEPARTMENT,
      [this.data.sendToUser ? 'generalUserId' : 'competentDeptId']: id
    }, this.data.service)
      .pipe(take(1))
      .subscribe(() => {
        this.toast.success(this.lang.map.sent_successfully);
        this.dialogRef.close();
      });
  }

}
