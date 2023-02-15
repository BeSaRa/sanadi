import { JobTitleService } from './../../../../services/job-title.service';
import { JobTitle } from '@app/models/job-title';
import {LicenseService} from '@app/services/license.service';
import {SearchAwarenessActivitySuggestionCriteria} from './../../../../models/search-awareness-activity-suggestion-criteria';
import {Lookup} from '@app/models/lookup';
import {DatepickerOptionsMap} from './../../../../types/types';
import {DateUtils} from './../../../../helpers/date-utils';
import {EmployeeService} from './../../../../services/employee.service';
import {TabComponent} from './../../../../shared/components/tab/tab.component';
import {CommonCaseStatus} from './../../../../enums/common-case-status.enum';
import {CollectionRequestType} from './../../../../enums/service-request-types';
import {UserClickOn} from './../../../../enums/user-click-on.enum';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {OpenFrom} from './../../../../enums/open-from.enum';
import {IKeyValue} from './../../../../interfaces/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CommonUtils} from './../../../../helpers/common-utils';
import {ToastService} from './../../../../services/toast.service';
import {DialogService} from './../../../../services/dialog.service';
import {LookupService} from './../../../../services/lookup.service';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {AwarenessActivitySuggestion} from './../../../../models/awareness-activity-suggestion';
import {AwarenessActivitySuggestionService} from './../../../../services/awareness-activity-suggestion.service';
import {ChangeDetectorRef, Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {LangService} from '@app/services/lang.service';
import {Observable, of, Subject} from 'rxjs';

@Component({
  selector: 'app-awareness-activity-suggestion',
  templateUrl: './awareness-activity-suggestion.component.html',
  styleUrls: ['./awareness-activity-suggestion.component.scss']
})
export class AwarenessActivitySuggestionComponent extends EServicesGenericComponent<AwarenessActivitySuggestion, AwarenessActivitySuggestionService> {
  collectionRequestType: Lookup[] = this.lookupService.listByCategory.CollectionRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  linkedProject: Lookup[] = this.lookupService.listByCategory.LinkedProject.sort((a, b) => a.lookupKey - b.lookupKey);
  jobTitleList: JobTitle[] = [];


  licenseSearch$: Subject<string> = new Subject<string>();
  form!: UntypedFormGroup;
  selectedLicense?: AwarenessActivitySuggestion;
  isSameAsApplican = false;
  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => this.requestTypeField && this.requestTypeField.valid && this.activity.valid,
    },
    contactOfficer: {
      name: 'contactOfficerTab',
      langKey: 'contact_officer' as keyof ILanguageKeys,
      validStatus: () => this.contactOfficer.valid,
    },
    beneficiariesNature: {
      name: 'beneficiariesNatureTab',
      langKey: 'contact_officer' as keyof ILanguageKeys,
      validStatus: () => this.beneficiariesNature.valid,
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 3,
      validStatus: () => this.specialExplanationsField && this.specialExplanationsField.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };
  loadAttachments: boolean = false;
  datepickerOptionsMap: DatepickerOptionsMap = {
    expectedDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'past'
    })
  };
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestTypeField', 'requestType');
    }
  }

  constructor(
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: AwarenessActivitySuggestionService,
    private lookupService: LookupService,
    private toast: ToastService,
    private jobTitleService: JobTitleService,
    private cd: ChangeDetectorRef,
    private dialog: DialogService,
    public employeeService: EmployeeService,
    private licenseService: LicenseService
  ) {
    super();
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

  _getNewInstance(): AwarenessActivitySuggestion {
    return new AwarenessActivitySuggestion();
  }

  _initComponent(): void {
    this.listenToLicenseSearch();
    this._loadJobTitles();
  }

  _buildForm(): void {
    const model = new AwarenessActivitySuggestion().formBuilder(true);
    this.form = this.fb.group({
      requestType: model.requestType,
      description: model.description,
      oldLicenseFullSerial: model.oldLicenseFullSerial,
      beneficiariesNature: this.fb.group(model.beneficiariesNature),
      contactOfficer: this.fb.group(model.contactOfficer),
      activity: this.fb.group(model.activity),
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestTypeField.value !== CollectionRequestType.NEW && !this.selectedLicense) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
        this.dialog.error(listHtml.outerHTML);
        return false;
      }
      return true;
    }
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      // if (!(this.tabsData[key].formStatus() && this.tabsData[key].listStatus())) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  private _loadJobTitles(): void {
    this.jobTitleService.loadAsLookups()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe((result) => this.jobTitleList = result);
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): AwarenessActivitySuggestion | Observable<AwarenessActivitySuggestion> {
    const value = new AwarenessActivitySuggestion().clone({
      ...this.model,
      requestType: this.form.value.requestType,
      description: this.form.value.description,
      ...this.form.value.contactOfficer,
      ...this.form.value.beneficiariesNature,
      ...this.form.value.activity,
      profileType: this.employeeService.getProfile()?.profileType
    });
    return value;
  }

  private _updateModelAfterSave(model: AwarenessActivitySuggestion): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: AwarenessActivitySuggestion, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _updateForm(model: AwarenessActivitySuggestion | undefined): void {
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.model = model;
    const formModel = model.formBuilder();
    this.form.patchValue({
      requestType: formModel.requestType,
      description: formModel.description,
      oldLicenseFullSerial: formModel.oldLicenseFullSerial,
      contactOfficer: formModel.contactOfficer,
      beneficiariesNature: formModel.beneficiariesNature,
      activity: formModel.activity,
    });
    this.cd.detectChanges();
    this.handleRequestTypeChange(model.requestType, false);
  }

  get userOrgName() {
    if (this.model!.ouInfo) {
      return this.model!.ouInfo.getName();
    } else {
      return this.employeeService.getProfile()?.getName();
    }
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }

  _setDefaultValues(): void {
    this.requestTypeField.setValue(CollectionRequestType.NEW);
    this.handleRequestTypeChange(CollectionRequestType.NEW, false);
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this._setDefaultValues();
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

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  _destroyComponent(): void {
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldLicenseFullSerialField.value;
    }
    this.licenseSearch$.next(value);
  }

  loadLicencesByCriteria(criteria: (Partial<SearchAwarenessActivitySuggestionCriteria>)): (Observable<AwarenessActivitySuggestion[]>) {
    return this.service.licenseSearch(criteria as Partial<SearchAwarenessActivitySuggestionCriteria>);
  }

  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.loadLicencesByCriteria({
          fullSerial: oldLicenseFullSerial
        }).pipe(catchError(() => of([])));
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => {
          if (!list.length) {
            this.dialog.info(this.lang.map.no_result_for_your_search_criteria);
          }
        }),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(licenses => {
          if (licenses.length === 1) {
            return this.licenseService.validateLicenseByRequestType(this.model!.getCaseType(), this.requestTypeField.value, licenses[0].id)
              .pipe(
                map((data) => {
                  if (!data) {
                    return of(null);
                  }
                  return {selected: licenses[0], details: data};
                }),
                catchError(() => {
                  return of(null);
                })
              );
          } else {
            const displayColumns = this.service.selectLicenseDisplayColumns;
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null}), true, displayColumns).onAfterClose$;
          }
        }),
        // allow only if the user select license
        filter<{ selected: AwarenessActivitySuggestion, details: AwarenessActivitySuggestion }, any>
        ((selection): selection is { selected: AwarenessActivitySuggestion, details: AwarenessActivitySuggestion } => {
          return !!(selection);
        }),
        // allow only if the user select license
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details);
      });
  }

  private setSelectedLicense(licenseDetails: AwarenessActivitySuggestion) {
    this.selectedLicense = licenseDetails;
    let requestType = this.requestTypeField?.value,
      result: Partial<AwarenessActivitySuggestion> = {
        requestType
      };

    result.oldLicenseFullSerial = licenseDetails.fullSerial;
    result.oldLicenseId = licenseDetails.id;
    result.oldLicenseSerial = licenseDetails.serial;

    result.description = licenseDetails.description;

    result.expectedDate = DateUtils.changeDateToDatepicker(licenseDetails.expectedDate);

    result.contactQID = licenseDetails.contactQID;
    result.contactName = licenseDetails.contactName;
    result.contactEmail = licenseDetails.contactEmail;
    result.contactPhone = licenseDetails.contactPhone;
    result.contactExtraPhone = licenseDetails.contactExtraPhone;

    result.agreementWithRACA = licenseDetails.agreementWithRACA;
    result.subject = licenseDetails.subject;
    result.goal = licenseDetails.goal;
    result.activityName = licenseDetails.activityName;
    this._updateForm((new AwarenessActivitySuggestion()).clone(result));
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }

  isEditOrCancel() {
    return this.requestTypeField.value == CollectionRequestType.UPDATE || this.requestTypeField.value == CollectionRequestType.CANCEL;
  }

  get contactOfficer(): UntypedFormGroup {
    return this.form.get('contactOfficer') as UntypedFormGroup;
  }

  get beneficiariesNature(): UntypedFormGroup {
    return this.form.get('beneficiariesNature') as UntypedFormGroup;
  }

  get activity(): UntypedFormGroup {
    return this.form.get('activity') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.form.get('requestType') as UntypedFormControl;
  }

  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.form.get('oldLicenseFullSerial') as UntypedFormControl;
  }
}
