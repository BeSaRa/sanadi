import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable, of, Subject} from 'rxjs';
import {GeneralAssociationMeetingAttendance} from '@models/general-association-meeting-attendance';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {EmployeeService} from '@services/employee.service';
import {ServiceDataService} from '@services/service-data.service';
import {DialogService} from '@services/dialog.service';
import {InboxService} from '@services/inbox.service';
import {IWFResponse} from '@contracts/i-w-f-response';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {GeneralAssociationInternalMember} from '@models/general-association-internal-member';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

@Component({
  selector: 'general-association-meeting-approve-task-popup',
  templateUrl: './general-association-meeting-approve-task-popup.component.html',
  styleUrls: ['./general-association-meeting-approve-task-popup.component.scss']
})
export class GeneralAssociationMeetingApproveTaskPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  done$: Subject<any> = new Subject<any>();
  destroy$: Subject<any> = new Subject<any>();
  customValidators = CustomValidators;
  model!: GeneralAssociationMeetingAttendance;

  private readonly action: WFResponseType;

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      model: GeneralAssociationMeetingAttendance,
      actionType: WFResponseType,
      service: BaseGenericEService<any>,
      selectedInternalMembers: GeneralAssociationInternalMember[],
      meetingDate: IMyDateModel,
      year: number
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService,
    private fb: UntypedFormBuilder,
    private employeeService: EmployeeService,
    private serviceDataService: ServiceDataService,
    private dialog: DialogService,
    private inboxService: InboxService) {
    this.action = this.data.actionType;

    this.data.model.meetingDate = this.data.meetingDate;
    this.data.model.year = this.data.year;
  }

  ngOnInit(): void {
    this.listenToTakeAction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  proceed(): Observable<boolean> {
    let responseInfo: Partial<IWFResponse> = {
      selectedResponse: this.action,
      comment: this.comment.value ? this.comment.value : undefined
    }, stream$ = of(null);

    return stream$.pipe(
      switchMap(_ => this.updateCase()),
      switchMap(() => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, responseInfo, this.data.service))
    );
  }

  private listenToTakeAction() {
    this.done$
      .pipe(
        // beforeSave
        switchMap(_ => {
          return of(!!this.comment.value);
        }),
        switchMap(_ => {
          return this.data.selectedInternalMembers.length > 0 ? of(true) : of(false);
        }),
        tap(valid => {
          if (!valid) {
            this.dialog.error(this.lang.map.you_should_add_at_least_one_member_to_internal_users);
          }
        }),
        filter(value => !!value),
        switchMap(() => this.proceed())
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  updateCase(): Observable<any> {
    const model = new GeneralAssociationMeetingAttendance().clone({
      ...this.data.model,
      internalMembersDTO: this.data.selectedInternalMembers
    });
    return model.update().pipe(map(returned => {
      return returned ? of(true) : of(false);
    }));
  }
}
