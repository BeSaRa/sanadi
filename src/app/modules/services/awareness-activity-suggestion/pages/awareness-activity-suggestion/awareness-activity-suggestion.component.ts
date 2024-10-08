import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LicenseService } from '@services/license.service';
import { Lookup } from '@models/lookup';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { ChangeDetectorRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { OperationTypes } from '@enums/operation-types.enum';
import { SaveTypes } from '@enums/save-types';
import { LangService } from '@services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { AwarenessActivitySuggestion } from '@models/awareness-activity-suggestion';
import { IKeyValue } from '@contracts/i-key-value';
import { DatepickerOptionsMap } from '@app/types/types';
import { DateUtils } from '@helpers/date-utils';
import { AwarenessActivitySuggestionService } from '@services/awareness-activity-suggestion.service';
import { LookupService } from '@services/lookup.service';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { EmployeeService } from '@services/employee.service';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { OpenFrom } from '@enums/open-from.enum';
import { CollectionRequestType } from '@enums/service-request-types';
import { CommonUtils } from '@helpers/common-utils';
import { UserClickOn } from '@enums/user-click-on.enum';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { SearchAwarenessActivitySuggestionCriteria } from '@models/search-awareness-activity-suggestion-criteria';
import { JobTitle } from '@models/job-title';
import { JobTitleService } from '@services/job-title.service';
import { FileExtensionsEnum } from '@enums/file-extension-mime-types-icons.enum';
import {
  SelectCustomServiceTemplatePopupComponent
} from '@modules/services/shared-services/popups/select-custom-service-template-popup/select-custom-service-template-popup.component';
import { FileUploaderComponent } from '@app/shared/components/file-uploader/file-uploader.component';
import { CustomServiceTemplate } from '@models/custom-service-template';
import { CustomServiceTemplateService } from '@services/custom-service-template.service';
import { AdminLookup } from '@models/admin-lookup';
import { AdminLookupService } from '@services/admin-lookup.service';
import { AdminLookupTypeEnum } from '@enums/admin-lookup-type-enum';
import { CustomValidators } from '@app/validators/custom-validators';
import { ApprovalTemplateTypeEnum } from '@enums/approvalTemplateType.enum';

@Component({
  selector: 'app-awareness-activity-suggestion',
  templateUrl: './awareness-activity-suggestion.component.html',
  styleUrls: ['./awareness-activity-suggestion.component.scss']
})
export class AwarenessActivitySuggestionComponent extends EServicesGenericComponent<AwarenessActivitySuggestion, AwarenessActivitySuggestionService> implements AfterViewInit {
  collectionRequestType: Lookup[] = this.lookupService.listByCategory.CollectionRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  linkedProject: Lookup[] = this.lookupService.listByCategory.LinkedProject.sort((a, b) => a.lookupKey - b.lookupKey);
  jobTitleList: JobTitle[] = [];
  fileExtensionsEnum = FileExtensionsEnum;
  licenseSearch$: Subject<string> = new Subject<string>();
  form!: UntypedFormGroup;
  selectedTemplate!: CustomServiceTemplate;
  selectedTemplateControl: UntypedFormControl = new UntypedFormControl(null, [Validators.required]);
  selectedLicense?: AwarenessActivitySuggestion;
  isSameAsApplican = false;
  activitiesTypes: AdminLookup[] = [];
  showOther: boolean = false;
  openFromEnum = OpenFrom;
  @ViewChild('fileUploader') fileUploaderRef!: FileUploaderComponent;
  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => this.basicInfo.valid && (!this.isLicensingUser || this.selectedTemplateControl.valid),
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
  uploadedTemplate?: File;
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
    private customServiceTemplate: CustomServiceTemplateService,
    private licenseService: LicenseService,
    private adminLookupService: AdminLookupService,

  ) {
    super();
  }
  ngAfterViewInit(): void {
    this._listenToServiceType();
    this.cd.detectChanges();
  }

  selectTemplatePopup(isUploaded: boolean) {
    if (!this.model) {
      return;
    }
    if (isUploaded) {
      this.customServiceTemplate.loadActiveTemplatesByCaseType(this.model?.getCaseType()).subscribe((data) => {
        this.dialog.show(SelectCustomServiceTemplatePopupComponent, {
          list: data,
          showSelectBtn: true,
          showDelete: false
        }).onAfterClose$.subscribe((temp) => {
          if (temp) {
            this.selectedTemplate = temp;
            this.selectedTemplateControl.setValue(temp.id);
          }
        })
      })
    } else {
      this.customServiceTemplate.loadTemplatesByCaseId(this.model?.getCaseType(), this.model?.getCaseId()).subscribe((data) => {
        this.dialog.show(SelectCustomServiceTemplatePopupComponent, { list: data, showSelectBtn: false, showDelete: this.isLicensingUser && this.openFrom === this.openFromEnum.USER_INBOX  })
      })
    }
  }

  uploadTemplate(file: File | File[] | undefined) {
    if (!this.model) {
      return;
    }
    if (file) {
      let uploadedTemplate;
      if (!file || file instanceof File) {
        uploadedTemplate = file;
      } else {
        uploadedTemplate = file[0];
      }
      this.customServiceTemplate.uploadCaseDoc(this.model.getCaseType(), this.model.getCaseId(), {
        documentDTO: {
          arabicName: this.selectedTemplate.arabicName,
          englishName: this.selectedTemplate.englishName,
          approvalTemplateType: this.selectedTemplate.approvalTemplateType,
        }
      }, uploadedTemplate).subscribe((result) => {
        if (!result) {
          return;
        }
        this.dialog.success(this.lang.map.file_have_been_uploaded_successfully);
      })
    }
  }
  validateApproveTimplate() {
    return of(null).pipe(
      switchMap(() => {
        return this.customServiceTemplate.loadTemplatesByCaseId(this.model!.getCaseType(), this.model?.getCaseId())
      }),
      map(temps => {
        return !!temps.length && temps[0].approvalTemplateType == ApprovalTemplateTypeEnum.approve
      })
    )
  }
  validateRejectTimplate() {
    return of(null).pipe(
      switchMap(() => {
        return this.customServiceTemplate.loadTemplatesByCaseId(this.model!.getCaseType(), this.model?.getCaseId())
      }),
      map(temps => {
        return !!temps.length && temps[0].approvalTemplateType == ApprovalTemplateTypeEnum.reject
      })
    )
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
      if(this.employeeService.isExternalUser()){
        this.readonly = false;
      }
     
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if(this.employeeService.isExternalUser()){
          this.readonly = false;
        }
       
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
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
    this._loadActivityTypes();

  }

  _buildForm(): void {
    const model = new AwarenessActivitySuggestion().formBuilder(true);
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.basicInfo),
      description: model.description,
      beneficiariesNature: this.fb.group(model.beneficiariesNature),
      contactOfficer: this.fb.group(model.contactOfficer),
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
    this.resetForm$.next(false);
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): AwarenessActivitySuggestion | Observable<AwarenessActivitySuggestion> {
    const value = new AwarenessActivitySuggestion().clone({
      ...this.model,
      requestType: this.form.value.basicInfo.requestType,
      subject: this.form.value.basicInfo.subject,
      goal: this.form.value.basicInfo.goal,
      activityType: this.form.value.basicInfo.activityType,
      otherActivity: this.form.value.basicInfo.otherActivity,
      ...this.form.value.contactOfficer,
      ...this.form.value.beneficiariesNature,
      description: this.form.value.description,
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
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
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
      basicInfo: formModel.basicInfo,
      description: formModel.description,
      contactOfficer: formModel.contactOfficer,
      beneficiariesNature: formModel.beneficiariesNature,
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
          this.resetForm$.next(false);
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

  get isLicensingUser() {
    return this.employeeService.isLicensingUser();
  }

  get isInternalUser() {
    return this.employeeService.isInternalUser();
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
                  return { selected: licenses[0], details: data };
                }),
                catchError(() => {
                  return of(null);
                })
              );
          } else {
            const displayColumns = this.service.selectLicenseDisplayColumns;
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: this.requestTypeField.value || null }), true, displayColumns).onAfterClose$;
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
    if (licenseDetails) {
      this.selectedLicense = licenseDetails;
      let requestType = this.requestTypeField?.value,
        result: Partial<AwarenessActivitySuggestion> = {
          requestType
        };

      result.oldLicenseFullSerial = licenseDetails.fullSerial;
      result.oldLicenseId = licenseDetails.id;
      result.oldLicenseSerial = licenseDetails.serial;
      result.activityType = licenseDetails.activityType;

      result.description = licenseDetails.description;

      result.contactQID = licenseDetails.contactQID;
      result.contactName = licenseDetails.contactName;
      result.contactEmail = licenseDetails.contactEmail;
      result.contactPhone = licenseDetails.contactPhone;
      result.contactExtraPhone = licenseDetails.contactExtraPhone;
      result.jobTitle = licenseDetails.jobTitle;
      result.beneficiaries = licenseDetails.beneficiaries;
      result.beneficiariesNumber = licenseDetails.beneficiariesNumber;

      result.otherActivity = licenseDetails.otherActivity;
      result.subject = licenseDetails.subject;
      result.goal = licenseDetails.goal;
      this._updateForm((new AwarenessActivitySuggestion()).clone(result));
    }
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }

  isEditOrCancel() {
    return this.requestTypeField.value == CollectionRequestType.UPDATE || this.requestTypeField.value == CollectionRequestType.CANCEL;
  }

  isCancel() {
    return this.requestTypeField.value == CollectionRequestType.CANCEL;
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get contactOfficer(): UntypedFormGroup {
    return this.form.get('contactOfficer') as UntypedFormGroup;
  }

  get beneficiariesNature(): UntypedFormGroup {
    return this.form.get('beneficiariesNature') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.basicInfo.get('requestType') as UntypedFormControl;
  }

  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.basicInfo.get('oldLicenseFullSerial') as UntypedFormControl;
  }
  get activityType(): UntypedFormControl {
    return this.basicInfo.get('activityType') as UntypedFormControl;
  }
  get otherActivity(): UntypedFormControl {
    return this.basicInfo.get('otherActivity') as UntypedFormControl;
  }
  private _isOthersActivityType(serviceType?: AdminLookup) {
    if (!serviceType) return false;
    return serviceType.enName.toLocaleLowerCase() === 'other' ||
      serviceType.enName.toLocaleLowerCase() === 'others'
  }
  private _loadActivityTypes() {
    this.adminLookupService
      .loadAsLookups(AdminLookupTypeEnum.SERVICE_TYPE_WORK_TYPE)
      .subscribe((list) => {
        this.activitiesTypes = list;
        const id = this.activityType.value;
        const activityType = this.activitiesTypes.find((x) => x.id === id)
        this.showOther = this._isOthersActivityType(activityType);
      });
  }

  private _listenToServiceType() {
    this.activityType.valueChanges.pipe(
      takeUntil(this.destroy$),
      map((id) => this.activitiesTypes.find((x) => x.id === id)),
      tap(_ => {
        this.otherActivity.reset();
      }),
      tap((serviceType) => {
        if (serviceType) {
          if (this._isOthersActivityType(serviceType)) {
            this.showOther = true;
            this.otherActivity.addValidators([CustomValidators.required]);
            return;
          }
        }
        this.otherActivity.removeValidators([CustomValidators.required]);
        this.showOther = false;
      }),
      tap(_ => {
        this.otherActivity.updateValueAndValidity();
      })
    ).subscribe();
  }
}
