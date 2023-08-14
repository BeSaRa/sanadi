import { AdminResult } from '@app/models/admin-result';
import { InterventionFieldInterceptor } from '@app/model-interceptors/intervention-field-interceptor';
import { InterventionRegionInterceptor } from '@app/model-interceptors/intervention-region-interceptor';
import { ImplementingAgencyInterceptor } from '@app/model-interceptors/implementing-agency-interceptor';
import { Component, ViewChild } from '@angular/core';
import { LangService } from '@services/lang.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { UrgentInterventionLicenseFollowupService } from '@services/urgent-intervention-license-followup.service';
import { UrgentInterventionLicenseFollowup } from '@models/urgent-intervention-license-followup';
import { SaveTypes } from '@enums/save-types';
import { OperationTypes } from '@enums/operation-types.enum';
import { Observable, of, Subject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { OpenFrom } from '@enums/open-from.enum';
import { EmployeeService } from '@services/employee.service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { catchError, exhaustMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { DialogService } from '@services/dialog.service';
import { LicenseService } from '@services/license.service';
import { TabMap } from '@app/types/types';
import { UrgentInterventionAnnouncementResult } from '@models/urgent-intervention-announcement-result';
import {
  UrgentInterventionReportListComponent
} from '@modules/services/urgent-intervention-license-followup/shared/urgent-intervention-report-list/urgent-intervention-report-list.component';
import { UrgentInterventionAnnouncement } from '@models/urgent-intervention-announcement';
import {
  InterventionImplementingAgencyListComponent
} from '@modules/services/shared-services/components/intervention-implementing-agency-list/intervention-implementing-agency-list.component';
import {
  InterventionRegionListComponent
} from '@modules/services/shared-services/components/intervention-region-list/intervention-region-list.component';
import {
  InterventionFieldListComponent
} from '@modules/services/shared-services/components/intervention-field-list/intervention-field-list.component';

@Component({
  selector: 'urgent-intervention-license-followup',
  templateUrl: './urgent-intervention-license-followup.component.html',
  styleUrls: ['./urgent-intervention-license-followup.component.scss']
})
export class UrgentInterventionLicenseFollowupComponent extends EServicesGenericComponent<UrgentInterventionLicenseFollowup, UrgentInterventionLicenseFollowupService> {

  constructor(public lang: LangService,
    public fb: UntypedFormBuilder,
    private dialogService: DialogService,
    private licenseService: LicenseService,
    public service: UrgentInterventionLicenseFollowupService,
    private employeeService: EmployeeService) {
    super();
  }

  form!: UntypedFormGroup;
  loadAttachments: boolean = false;
  tabIndex$: Subject<number> = new Subject<number>();
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: UrgentInterventionAnnouncement;

  @ViewChild('implementingAgencyListComponent') implementingAgencyListComponentRef!: InterventionImplementingAgencyListComponent;
  @ViewChild('interventionRegionListComponent') interventionRegionListComponentRef!: InterventionRegionListComponent;
  @ViewChild('interventionFieldListComponent') interventionFieldListComponentRef!: InterventionFieldListComponent;
  @ViewChild('urgentInterventionReportListComponent') urgentInterventionReportListComponentRef!: UrgentInterventionReportListComponent;

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      isTouchedOrDirty: () => true,
      validStatus: () => this.form && this.form.valid
    },
    entities: {
      name: 'entitiesTab',
      langKey: 'entities',
      index: 1,
      isTouchedOrDirty: () => true,
      validStatus: () => true
    },
    interventionAreas: {
      name: 'interventionAreasTab',
      langKey: 'intervention_areas',
      index: 2,
      isTouchedOrDirty: () => true,
      validStatus: () => true
    },
    interventionFields: {
      name: 'interventionFieldsTab',
      langKey: 'intervention_fields',
      index: 3,
      isTouchedOrDirty: () => false,
      validStatus: () => true
    },
    reports: {
      name: 'reportsTab',
      langKey: 'reports' as keyof ILanguageKeys,
      index: 4,
      isTouchedOrDirty: () => false,
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 5,
      isTouchedOrDirty: () => false,
      validStatus: () => true
    }
  };

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  _buildForm(): void {
    let objUrgentInterventionLicenseFollowup = this._getNewInstance();
    this.form = this.fb.group(objUrgentInterventionLicenseFollowup.getBasicFormFields(true));
  }

  private _setDefaultValues() {
    this.implementingAgencyListComponentRef?.forceClearComponent();
    this.interventionRegionListComponentRef?.forceClearComponent();
    this.interventionFieldListComponentRef?.forceClearComponent();
  }

  _afterBuildForm(): void {
    this.handleReadonly();
    this._setDefaultValues();
    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.exportedBookId, () => {
        this.fullSerialField.updateValueAndValidity();
      });
    }
  }

  _afterLaunch(): void {
  }

  _afterSave(model: UrgentInterventionLicenseFollowup, saveType: SaveTypes, operation: OperationTypes): void {
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return true;
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): UrgentInterventionLicenseFollowup {
    return new UrgentInterventionLicenseFollowup().clone();
  }

  _initComponent(): void {
    this.listenToLicenseSearch();
  }

  _launchFail(error: any): void {
  }

  _prepareModel(): Observable<UrgentInterventionLicenseFollowup> | UrgentInterventionLicenseFollowup {
    return this._getNewInstance();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this._setDefaultValues();
    this.tabIndex$.next(0);
  }

  _saveFail(error: any): void {
  }

  _updateForm(model: UrgentInterventionLicenseFollowup | undefined): void {
    this.model = model;
    if (!model) {
      // this.cd.detectChanges();
      return;
    }
    // patch the form here
    this.form.patchValue(model.getBasicFormFields());


    // this.cd.detectChanges();
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.model.getCaseStatus();
      isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
    }
    return !isAllowed;
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService.loadUrgentInterventionAnnouncementByLicenseVsId(id)
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      })
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.fullSerialField.value && this.fullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(exhaustMap(fullSerial => {
        return this.service.licenseSearchUrgentInterventionAnnouncement({ fullSerial: fullSerial })
          .pipe(catchError(() => of([])));
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the result if it has value
        filter(result => !!result.length)
      ).pipe(
        exhaustMap((licenses) => {
          return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
        })
      ).pipe(filter((info): info is UrgentInterventionAnnouncement => !!info))
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }

  private validateSingleLicense(license: UrgentInterventionAnnouncementResult): Observable<undefined | UrgentInterventionAnnouncement> {
    return this.licenseService.loadUrgentInterventionAnnouncementByLicenseId(license.id);
  }

  private openSelectLicense(licenses: UrgentInterventionAnnouncementResult[]): Observable<undefined | UrgentInterventionAnnouncement> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: null }), true, this.service.selectLicenseDisplayColumnsReport)
      .onAfterClose$
      .pipe(map((result: ({ selected: UrgentInterventionAnnouncement, details: UrgentInterventionAnnouncement } | undefined)) => result ? result.details : result));
  }

  setSelectedLicense(licenseDetails: UrgentInterventionAnnouncement | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license

    if (licenseDetails && !ignoreUpdateForm) {
      this.fullSerialField.setValue(licenseDetails?.fullSerial);

      this.selectedLicense = licenseDetails;
    }
  }

  clearSelectedLicense(): void {
    this.setSelectedLicense(undefined, true);
    this.fullSerialField.setValue('');
  }

  get fullSerialField(): UntypedFormControl {
    return this.form.get('fullSerial') as UntypedFormControl;
  }
}
