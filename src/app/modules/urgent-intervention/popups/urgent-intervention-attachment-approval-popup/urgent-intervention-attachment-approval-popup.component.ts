import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {isObservable, of, Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {InboxService} from '@services/inbox.service';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {QueryResult} from '@app/models/query-result';
import {CaseModel} from '@app/models/case-model';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {EmployeeService} from '@services/employee.service';
import {ServiceDataService} from '@services/service-data.service';
import {CustomTermService} from '@services/custom-term.service';
import {DialogService} from '@services/dialog.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {CommonUtils} from '@helpers/common-utils';
import {UrgentInterventionLicenseFollowupService} from '@services/urgent-intervention-license-followup.service';

@Component({
  selector: 'urgent-intervention-attachment-approval-popup',
  templateUrl: './urgent-intervention-attachment-approval-popup.component.html',
  styleUrls: ['./urgent-intervention-attachment-approval-popup.component.scss']
})
export class UrgentInterventionAttachmentApprovalPopupComponent implements OnInit, OnDestroy {

  attachmentId: string;
  isApproved: boolean;
  label: keyof ILanguageKeys;

  constructor(@Inject(DIALOG_DATA_TOKEN) private data: {
                attachmentId: string,
                isApproved: boolean
              },
              private dialogRef: DialogRef,
              private toast: ToastService,
              public lang: LangService,
              private dialog: DialogService,
              private urgentInterventionLicenseFollowupService: UrgentInterventionLicenseFollowupService) {
    this.attachmentId = data.attachmentId;
    this.isApproved = data.isApproved;
    if (this.isApproved) {
      this.label = 'approve';
    } else {
      this.label= 'lbl_reject';
    }
  }

  ngOnInit(): void {
    this.listenToTakeAction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  comment: UntypedFormControl = new UntypedFormControl('', [
    CustomValidators.required,
    CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)
  ]);
  done$: Subject<any> = new Subject<any>();
  destroy$: Subject<any> = new Subject<any>();
  customValidators = CustomValidators;

  private listenToTakeAction() {
    this.done$
      .pipe(
        takeUntil(this.destroy$),
        filter(_ => CommonUtils.isValidValue(this.comment.value)),
        switchMap(() => this.urgentInterventionLicenseFollowupService.updateAttachmentApproval(this.attachmentId, this.isApproved, this.comment.value)),
        filter((result)=> !!result)
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }
}
