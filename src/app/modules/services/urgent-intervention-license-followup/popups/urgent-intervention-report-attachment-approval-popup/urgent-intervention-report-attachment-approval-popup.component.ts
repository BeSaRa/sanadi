import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UntypedFormControl, ValidatorFn} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {CommonUtils} from '@helpers/common-utils';
import {UrgentInterventionLicenseFollowupService} from '@services/urgent-intervention-license-followup.service';

@Component({
  selector: 'urgent-intervention-report-attachment-approval-popup',
  templateUrl: './urgent-intervention-report-attachment-approval-popup.component.html',
  styleUrls: ['./urgent-intervention-report-attachment-approval-popup.component.scss']
})
export class UrgentInterventionReportAttachmentApprovalPopupComponent implements OnInit, OnDestroy {

  attachmentId: string;
  isApproved: boolean;
  label: keyof ILanguageKeys;
  private commentValidations: ValidatorFn[] = [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)];

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
      this.label = 'lbl_reject';
      this.commentValidations = this.commentValidations.concat([CustomValidators.required]);
    }
  }

  ngOnInit(): void {
    this.comment.setValidators(this.commentValidations);
    this.listenToTakeAction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  comment: UntypedFormControl = new UntypedFormControl('');
  done$: Subject<any> = new Subject<any>();
  destroy$: Subject<any> = new Subject<any>();
  customValidators = CustomValidators;

  private listenToTakeAction() {
    this.done$
      .pipe(
        takeUntil(this.destroy$),
        filter(_ => CommonUtils.isValidValue(this.comment.value)),
        switchMap(() => this.urgentInterventionLicenseFollowupService.updateAttachmentApproval(this.attachmentId, this.isApproved, this.comment.value)),
        filter((result) => !!result)
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

}
