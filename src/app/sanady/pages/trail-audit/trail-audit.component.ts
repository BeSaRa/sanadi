import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {NgIf} from '@angular/common';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkTable
} from '@angular/cdk/table';
import {ContextMenuModule} from '@modules/context-menu/context-menu.module';
import {NgxMaskPipe} from 'ngx-mask';
import {SharedModule} from '@app/shared/shared.module';
import {LangService} from '@services/lang.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {forkJoin, Observable, Subject, switchMap} from 'rxjs';
import {ReportAuditResult} from '@models/report-audit-result';
import {ReportAuditCriteria} from '@models/report-audit-criteria';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {IMyInputFieldChanged} from '@nodro7/angular-mydatepicker';
import {Profile} from '@models/profile';
import {ExternalUser} from '@models/external-user';
import {ExternalUserService} from '@services/external-user.service';
import {ProfileService} from '@services/profile.service';
import {LookupService} from '@services/lookup.service';
import * as dayjs from 'dayjs';
import {BeneficiaryService} from '@services/beneficiary.service';
import {filter, tap} from 'rxjs/operators';
import {DialogService} from '@services/dialog.service';
import {ActivatedRoute} from '@angular/router';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'trail-audit',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
    CdkTable,
    ContextMenuModule,
    NgxMaskPipe,
    SharedModule
  ],
  templateUrl: './trail-audit.component.html',
  styleUrl: './trail-audit.component.scss'
})
export class TrailAuditComponent implements OnInit, OnDestroy {

  langService = inject(LangService);
  fb = inject(FormBuilder);
  externalUserService = inject(ExternalUserService);
  profileService = inject(ProfileService);
  lookupService = inject(LookupService);
  beneficiaryService = inject(BeneficiaryService);
  dialogService = inject(DialogService);
  route = inject(ActivatedRoute);
  form !: UntypedFormGroup;
  private destroy$: Subject<void> = new Subject();
  $search: Subject<void> = new Subject<void>();
  models: ReportAuditResult[] = [];
  displayedColumns: string[] = ['requestFullSerial', 'qId', 'name', 'gdxServiceId', 'actionTime', 'profileId', 'benNationality'];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  headerColumn: string[] = ['extra-header'];
  actions: IMenuItem<ReportAuditResult>[] = [];

  profilesList: Profile[] = [];
  orgUsersList: ExternalUser[] = [];
  GdxServicesList = this.lookupService.listByCategory.GDX_SERVICES;
  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    actionDateFrom: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    acionDateTo: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  buildForm() {
    this.form = this.fb.group(new ReportAuditCriteria().buildForm());
    this.setInitValue();
    this.setInitValidations();
  }

  ngOnInit(): void {
    this.buildForm();
    this._buildDatepickerControlsMap();
    this.loadUsersByOrgUnit();
    this._loadInitData()
      .subscribe(result => {
        this.profilesList = result.profiles;
      });
    this._listenToSearch();
  }

  private _listenToSearch() {
    this.$search
      .pipe(
        tap(() => {
          this.form.invalid && this.dialogService.error(this.langService.map.msg_all_required_fields_are_filled);
        }),
        filter(() => this.form.valid)
      )
      .pipe(
        switchMap(() => {
          return this.beneficiaryService.reportAudit(
            this.form.value
          );
        })
      )
      .subscribe((page) => {
        this.models = page.rs
      });
  }

  setInitValue() {
    this.fromDateField.setValue(DateUtils.changeDateToDatepicker(new Date(dayjs().startOf('year').valueOf())));
    this.fromDateField.updateValueAndValidity();
    this.toDateField.setValue(DateUtils.changeDateToDatepicker(new Date(dayjs().endOf('year').valueOf())));
    this.toDateField.updateValueAndValidity();
  }

  setInitValidations() {
    this.qIdField.setValidators([]);
    this.gdxServiceIdField.setValidators([]);
    this.profileIdField.setValidators([]);
    if (this.isBeneficiaryReport) {
      this.qIdField.setValidators([CustomValidators.required].concat(CustomValidators.commonValidations.qId));
    } else {
      this.gdxServiceIdField.setValidators([CustomValidators.required]);
      this.profileIdField.setValidators([CustomValidators.required]);
    }
    this.form.updateValueAndValidity()
    console.log(this.form)
  }

  get title() {
    if (this.isBeneficiaryReport) {
      return 'menu_trail_audit_beneficiary';
    }
    return 'menu_trail_audit_gdx_services';
  }

  get isBeneficiaryReport() {
    return !!this.route.snapshot.data?.isBeneficiaryReport;
  }

  private _loadInitData(): Observable<{ profiles: Profile[] }> {
    return forkJoin({
      profiles: this.profileService.loadAsLookups()
    });
  }

  loadUsersByOrgUnit(): void {
    this.orgUserField.setValue(null);

    if (!this.profileIdField || !this.profileIdField.value) {
      this.orgUsersList = [];
      return;
    }
    this.externalUserService.getByCriteria({'profile-id': this.profileIdField.value})
      .subscribe((result: ExternalUser[]) => {
        return this.orgUsersList = result;
      });
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      fromDate: this.fromDateField,
      toDate: this.toDateField
    };
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName: fromFieldName,
      toFieldName: toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }

  get qIdField(): UntypedFormControl {
    return this.form.get('qId') as UntypedFormControl;
  }

  get gdxServiceIdField(): UntypedFormControl {
    return this.form.get('gdxServiceId') as UntypedFormControl;
  }

  get profileIdField(): UntypedFormControl {
    return this.form.get('profileId') as UntypedFormControl;
  }

  get orgUserField(): UntypedFormControl {
    return this.form.get('orgUserId') as UntypedFormControl;
  }

  get fromDateField(): UntypedFormControl {
    return this.form.get('actionDateFrom') as UntypedFormControl;
  }

  get toDateField(): UntypedFormControl {
    return this.form.get('acionDateTo') as UntypedFormControl;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
