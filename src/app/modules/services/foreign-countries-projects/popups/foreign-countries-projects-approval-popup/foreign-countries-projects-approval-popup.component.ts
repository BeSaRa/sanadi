import {EmployeeService} from '@services/employee.service';
import {ProfileService} from '@services/profile.service';
import {of, Subject} from 'rxjs';
import {ForeignCountriesProjects} from '@models/foreign-countries-projects';
import {CustomValidators} from '../../../../../validators/custom-validators';
import {IWFResponse} from '@contracts/i-w-f-response';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {LangService} from '@services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../../../../shared/tokens/tokens';
import {InboxService} from '@services/inbox.service';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '../../../../../shared/models/dialog-ref';
import {DialogService} from '@services/dialog.service';
import {DateUtils} from '@helpers/date-utils';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {DatepickerOptionsMap} from '@app-types/types';
import {Component, Inject, OnInit} from '@angular/core';
import {CollectionRequestType} from '@enums/service-request-types';
import {CommonUtils} from '@helpers/common-utils';
import {ILanguageKeys} from '@contracts/i-language-keys';

@Component({
  selector: 'app-foreign-countries-projects-approval-popup',
  templateUrl: './foreign-countries-projects-approval-popup.component.html',
  styleUrls: ['./foreign-countries-projects-approval-popup.component.css']
})
export class ForeignCountriesProjectsApprovalPopupComponent implements OnInit {
  label: keyof ILanguageKeys;
  npos$ = this.profileService.getCharitiesNpoInstitutions();
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: "none"}),
  };
  private destroy$: Subject<any> = new Subject();

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: {
                model: ForeignCountriesProjects,
                action: WFResponseType
              },
              public lang: LangService,
              private dialog: DialogService,
              private dialogRef: DialogRef,
              private toast: ToastService,
              private employeeService: EmployeeService,
              private profileService: ProfileService,
              private inboxService: InboxService,
              private fb: UntypedFormBuilder) {
    this.response = this.data.action;
    this.approvalForm = this.fb.group(this.data.model.buildApprovalForm(true))
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);

  }

  ngOnInit() {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ =>
        this.comment.invalid || (!this.isCancelRequestType()
          ? this.approvalForm.invalid
          : false)))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        if (!this.isCancelRequestType()) {
          Object.assign(this.data.model, this.approvalForm.value)
          return this.data.model.save()
        }
        return of(true)
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  get isNotCreator() {
    return this.employeeService.getCurrentUser()?.generalUserId != this.data.model.creatorInfo.id
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }

  isCancelRequestType(): boolean {
    return this.data.model.requestType === CollectionRequestType.CANCEL;
  }

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
