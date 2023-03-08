import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, of, Subject } from 'rxjs';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { InboxService } from '@services/inbox.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@services/toast.service';
import { LangService } from '@services/lang.service';
import { EmployeeService } from '@services/employee.service';
import { ServiceDataService } from '@services/service-data.service';
import { DialogService } from '@services/dialog.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { IWFResponse } from '@contracts/i-w-f-response';
import { TransferringIndividualFundsAbroad } from '@models/transferring-individual-funds-abroad';
import { TransferFundsCharityPurpose } from '@models/transfer-funds-charity-purpose';
import { TransferFundsExecutiveManagement } from '@models/transfer-funds-executive-management';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'transfer-funds-abroad-complete-task-popup',
  templateUrl: './transfer-funds-abroad-complete-task-popup.component.html',
  styleUrls: ['./transfer-funds-abroad-complete-task-popup.component.scss']
})
export class TransferFundsAbroadCompleteTaskPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  done$: Subject<any> = new Subject<any>();
  destroy$: Subject<any> = new Subject<any>();
  customValidators = CustomValidators;
  model!: TransferringIndividualFundsAbroad;

  private readonly action: WFResponseType;

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      model: TransferringIndividualFundsAbroad,
      actionType: WFResponseType,
      service: BaseGenericEService<any>,
      form: UntypedFormGroup,
      selectedExecutives: TransferFundsExecutiveManagement[],
      selectedPurposes: TransferFundsCharityPurpose[],
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
        // emit only if the beforeSave returned true
        filter(value => !!value),
        switchMap(() => this.proceed())
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  updateCase(): Observable<any> {
    const model = new TransferringIndividualFundsAbroad().clone({
      ...this.data.model,
      ...this.data.form.get('basicInfo')?.getRawValue(),
      ...this.data.form.get('requesterInfo')?.getRawValue(),
      ...this.data.form.get('receiverOrganizationInfo')?.getRawValue(),
      ...this.data.form.get('receiverPersonInfo')?.getRawValue(),
      ...this.data.form.get('financialTransactionInfo')?.getRawValue(),
      ...this.data.form.get('specialExplanation')?.getRawValue(),
      executiveManagementList: this.data.selectedExecutives,
      charityPurposeTransferList: this.data.selectedPurposes
    });
    return model.update().pipe(map(returned => {
      return returned ? of(true) : of(false);
    }));
  }
}
