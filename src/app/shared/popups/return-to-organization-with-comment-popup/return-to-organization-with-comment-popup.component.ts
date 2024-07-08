import { CoordinationWithOrganizationsRequest } from './../../../models/coordination-with-organizations-request';
import { CaseTypes } from './../../../enums/case-types.enum';
import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IReturnToOrganizationService } from '@app/interfaces/i-return-to-organization-service-interface';
import { CaseModel } from '@app/models/case-model';
import { ValidOrgUnit } from '@app/models/valid-org-unit';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { of, Subject } from 'rxjs';
import { filter, take, takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-return-to-organization-with-comment-popup',
  templateUrl: './return-to-organization-with-comment-popup.component.html',
  styleUrls: ['./return-to-organization-with-comment-popup.component.scss'],
})
export class ReturnToOrganizationWithCommentPopupComponent implements OnInit {
  organizations: ValidOrgUnit[] = [];
  comment: UntypedFormControl = new UntypedFormControl('', [
    CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
  ]);
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
      model: CaseModel<any, any>;
      commentRequired: boolean;
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    public lang: LangService
  ) {}

  ngOnInit(): void {
    this._assignService();
    this.buildForm();
    this._checkIfCommentRequired();
    this.loadValidToReturnOrganizations();
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _assignService() {
    this.service = this.data.model.service;
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
      .returnToOrganization(this.data.caseId,this.organization.value)
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
      .pipe(filter((_) => this.form.invalid || this.comment.invalid))
      .subscribe(() =>
        this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)
      );

    send$
      .pipe(filter((_) => this.form.valid && this.comment.valid))
      .pipe(
        switchMap((_) => {
          if (
            this.data.model.caseType ===
            CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST
          ) {
            const model = this.data.model as CoordinationWithOrganizationsRequest;
            const selectedOrganization =
              model.participatingOrganizaionList.find((x) => x.organizationId === this.organization.value)!;
              selectedOrganization.notes = this.comment.value;
            return model.save()
          }
          return of(null);
        })
      )
      .subscribe(() => this.send());
  }

  private _checkIfCommentRequired() {
    if (this.data.commentRequired) {
      this.comment = this.fb.control([
        null,
        CustomValidators.required,
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.EXPLANATIONS
        ),
      ]);
      this.comment.updateValueAndValidity();
    }
  }
  get organization(): UntypedFormControl {
    return this.form.get('organization') as UntypedFormControl;
  }
}
