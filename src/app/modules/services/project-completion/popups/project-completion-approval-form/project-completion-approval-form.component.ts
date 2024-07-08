import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@app/services/toast.service';
import { InboxService } from '@app/services/inbox.service';
import { ProjectCompletion } from '@app/models/project-completion';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { LangService } from "@services/lang.service";
import { CustomTerm } from "@models/custom-term";
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { CustomTermService } from "@services/custom-term.service";
import { CustomTermPopupComponent } from "@app/shared/popups/custom-term-popup/custom-term-popup.component";
import { DialogService } from "@services/dialog.service";
import { DateUtils } from "@helpers/date-utils";
import { ServiceDataService } from "@services/service-data.service";
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { Observable, Subject } from 'rxjs';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DatepickerOptionsMap } from '@app/types/types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IWFResponse } from '@app/interfaces/i-w-f-response';

@Component({
  selector: 'project-completion-approval-form',
  templateUrl: './project-completion-approval-form.component.html',
  styleUrls: ['./project-completion-approval-form.component.scss']
})
export class ProjectCompletionApprovalFormComponent implements OnInit, OnDestroy {
  response: WFResponseType = WFResponseType.APPROVE;
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  private destroy$: Subject<void> = new Subject();
  customTerms: CustomTerm[] = [];
  servicePublicTerms: string = '';

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: ProjectCompletion,
      action: WFResponseType
    },
    private customTermService: CustomTermService,
    private dialog: DialogService,
    private serviceDataService: ServiceDataService,
    private inboxService: InboxService,
    private toast: ToastService,
    private dialogRef: DialogRef,
    public lang: LangService) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.approvalForm = this.fb.group(this.data.model.buildApprovalForm(true))
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTerms();
    this.listenToAction();
  }
  private loadUserCustomTerms(): Observable<CustomTerm[]> {
    return this.customTermService.loadByCaseType(this.data.model.getCaseType())
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(customTerms => this.customTerms = customTerms));
  }

  get customTermsField(): AbstractControl {
    return this.approvalForm.get('customTerms')!
  }

  get publicTerms(): AbstractControl {
    return this.approvalForm.get('publicTerms')!
  }

  get conditionalLicenseField(): AbstractControl {
    return this.approvalForm.get('conditionalLicenseIndicator')!
  }

  private loadTerms() {
    this.serviceDataService
      .loadByCaseType(this.data.model.caseType)
      .pipe(tap(service => {
        this.servicePublicTerms = service.serviceTerms
      }))
      .pipe(switchMap(_ => {
        return this.loadUserCustomTerms()
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe()
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.approvalForm.invalid))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        Object.assign(this.data.model, this.approvalForm.value)
        return this.data.model.save()
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }



  private getResponse(): Partial<IWFResponse> {
    return { selectedResponse: this.response };
  }
  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }

  openAddCustomTermDialog() {
    const customTerm = new CustomTerm().clone({ caseType: this.data.model.getCaseType() });
    this.dialog.show(CustomTermPopupComponent, {
      model: customTerm
    }).onAfterClose$
      .pipe(switchMap(_ => this.loadUserCustomTerms()))
      .subscribe();
  }

  onCustomTermsChange(customTerm: CustomTerm) {
    let appendTerm = this.customTermsField.value ? this.customTermsField.value + '\n' + customTerm.terms : customTerm.terms;
    this.customTermsField.setValue(appendTerm)
  }
}
