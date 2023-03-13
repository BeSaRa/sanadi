import {OrganizationsEntitiesSupport} from '@models/organizations-entities-support';
import {Component, Inject, OnInit} from '@angular/core';
import {exhaustMap, filter, map, switchMap, takeUntil, tap,} from 'rxjs/operators';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {of, Subject} from 'rxjs';
import {DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {InboxService} from '@services/inbox.service';
import {CommonUtils} from '@helpers/common-utils';
import {IWFResponse} from '@contracts/i-w-f-response';
import {AffiliationRequestType, ServiceRequestTypes} from '@enums/service-request-types';

@Component({
  selector: 'app-organizations-entities-support-popup',
  templateUrl: './organizations-entities-support-popup.component.html',
  styleUrls: ['./organizations-entities-support-popup.component.scss'],
})
export class OrganizationsEntitiesSupportPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [
    CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
  ]);
  response: WFResponseType = WFResponseType.APPROVE;
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };
  private destroy$: Subject<any> = new Subject();

  constructor(@Inject(DIALOG_DATA_TOKEN)
              public data: {
                model: OrganizationsEntitiesSupport;
                action: WFResponseType;
              },
              public lang: LangService,
              private dialog: DialogService,
              private dialogRef: DialogRef,
              private toast: ToastService,
              private inboxService: InboxService,
              private fb: UntypedFormBuilder) {
    this.label = (CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys;
    this.response = this.data.action;
    this.approvalForm = this.fb.group(this.data.model.buildApprovalForm(true));
  }

  ngOnInit() {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([
        CustomValidators.required,
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.EXPLANATIONS
        ),
      ]);
    }
  }

  ngAfterViewInit(): void {
    const date = DateUtils.changeDateToDatepicker(this.data.model.followUpDate);
    this.followupDate.patchValue(date);
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        map((_) =>
          this.isCommentRequired()
            ? this.approvalForm.invalid || this.comment.invalid
            : this.approvalForm.invalid
        )
      )
      .pipe(
        tap(
          (invalid) =>
            invalid &&
            this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)
        )
      )
      .pipe(filter((invalid) => !invalid))
      .pipe(
        exhaustMap((_) => {
          if (!this.isCancelRequestType()) {
            Object.assign(this.data.model, this.approvalForm.value);
            return this.data.model.save();
          }
          return of(true);
        })
      )
      .pipe(
        switchMap((_) =>
          this.inboxService.takeActionOnTask(
            this.data.model.taskDetails.tkiid,
            this.getResponse(),
            this.data.model.service
          )
        )
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value
      ? {
        selectedResponse: this.response,
        comment: this.comment.value,
      }
      : {selectedResponse: this.response};
  }

  isCancelRequestType(): boolean {
    return this.data.model.requestType === ServiceRequestTypes.CANCEL;
  }

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  get followupDate(): UntypedFormControl {
    return this.approvalForm.get('followUpDate') as UntypedFormControl;
  }
}
