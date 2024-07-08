import { CaseTypes } from '@app/enums/case-types.enum';
import { IReturnToOrganizationService } from './../../../interfaces/i-return-to-organization-service-interface';
import { CoordinationWithOrganizationsRequest } from '@app/models/coordination-with-organizations-request';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { QueryResult } from '@app/models/query-result';
import { CaseModel } from '@app/models/case-model';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { CustomValidators } from '@app/validators/custom-validators';
import { UrgentJointReliefCampaignService } from '@services/urgent-joint-relief-campaign.service';
import { ValidOrgUnit } from '@app/models/valid-org-unit';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';

@Component({
  selector: 'return-to-organization-popup',
  templateUrl: './return-to-organization-popup.component.html',
  styleUrls: ['./return-to-organization-popup.component.scss'],
})
export class ReturnToOrganizationPopupComponent implements OnInit, OnDestroy {
  organizations: ValidOrgUnit[] = [];
  form!: UntypedFormGroup;
  done$: Subject<void> = new Subject<void>();
  private destroy$: Subject<void> = new Subject();
  controlName: string = '';
  title: keyof ILanguageKeys = 'return_to_org_task';
  countOfOrganizations!: number;
  service!: IReturnToOrganizationService;

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      caseId: number;
      // claimBefore: boolean,
      task: QueryResult | CaseModel<any, any>;
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private urgentJointReliefCampaignService: UrgentJointReliefCampaignService,
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    public lang: LangService
  ) {}

  ngOnInit(): void {
    this._assignService();
    this.buildForm();
    this.loadValidToReturnOrganizations();
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _assignService() {
    const caseType = this.data.task.getCaseType();
    if (caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
      this.service = this.data.task.service;
    } else {
      this.service = this.urgentJointReliefCampaignService;
    }
  }
  loadValidToReturnOrganizations(): void {
    this.service
      .getToReturnValidOrganizations(this.data.caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((organizations) => {
        this.organizations = organizations;
        this.countOfOrganizations = this.organizations.length;
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      organization: [null, [CustomValidators.required]],
    });
  }

  private send(): void {
    this.service
      .returnToOrganization(
        this.data.caseId,
        this.form.get('organization')?.value!
      )
      .pipe(take(1))
      .subscribe(() => {
        this.toast.success(this.lang.map.sent_successfully);
        this.countOfOrganizations -= 1;
        this.dialogRef.close(this.countOfOrganizations == 0);
      });
  }

  private listenToSave() {
    const send$ = this.done$.pipe(takeUntil(this.destroy$));
    // when form fail
    send$
      .pipe(filter((_) => this.form.invalid))
      .subscribe(() =>
        this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)
      );
    // if form success
    send$
      .pipe(filter((_) => this.form.valid))
      // .pipe(switchMap(_ => this.data.claimBefore ? this.data.task.claim() : of(null)))
      .subscribe(() => this.send());
  }
}
