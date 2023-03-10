import { Validators } from '@angular/forms';
import { SubTeamService } from '@app/services/sub-team.service';
import { GeneralProcess } from '@app/models/genral-process';
import { AdminLookupService } from '@services/admin-lookup.service';
import { Lookup } from '@app/models/lookup';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { takeUntil, switchMap, map, catchError, filter, tap, exhaustMap } from 'rxjs/operators';
import { EmployeeService } from '@app/services/employee.service';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { ToastService } from '@app/services/toast.service';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CommonUtils } from '@app/helpers/common-utils';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Component, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ProcessFieldBuilder } from '@app/administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { GeneralProcessNotificationService } from '@app/services/general-process-notification.service';
import { AllRequestTypesEnum } from '@app/enums/all-request-types-enum';
import { AdminLookup } from '@app/models/admin-lookup';
import { InternalDepartment } from '@app/models/internal-department';
import { SubTeam } from '@app/models/sub-team';
import { DialogService } from '@app/services/dialog.service';
import { LicenseService } from '@app/services/license.service';
import { LookupService } from '@app/services/lookup.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { GeneralProcessService } from '@app/services/general-process.service';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { TabComponent } from '@app/shared/components/tab/tab.component';

@Component({
  selector: 'app-general-process-notification',
  templateUrl: './general-process-notification.component.html',
  styleUrls: ['./general-process-notification.component.scss']
})
export class GeneralProcessNotificationComponent extends EServicesGenericComponent<
GeneralProcessNotification,
GeneralProcessNotificationService
> {
  notificationRequestTypeList: Lookup[] = this.lookupService.listByCategory
    .AllRequestTypes.filter(rt => rt.lookupKey == AllRequestTypesEnum.NEW || rt.lookupKey == AllRequestTypesEnum.UPDATE).sort((a, b) => a.lookupKey - b.lookupKey);
  GeneralProcessTypeList: Lookup[] = this.lookupService.listByCategory.GeneralProcessType;
  processList: GeneralProcess[] = [];
  processFieldBuilder: ProcessFieldBuilder;
  otherProcess: GeneralProcess = new GeneralProcess().clone({
    id: -1,
    arName: 'عمليات أخرى',
    enName: 'Other Procss'
  })
  mainClassificationsList: AdminLookup[] = [];
  subClassificationsList: AdminLookup[] = [];
  _subClassificationsList: AdminLookup[] = [];
  departmentList: InternalDepartment[] = [];
  subTeamsList: SubTeam[] = [];

  form!: UntypedFormGroup;
  processTemplateForm!: UntypedFormGroup;
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: GeneralProcessNotification;

  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    DSNNN: {
      name: "DSNNNTab",
      langKey: "disclosure_statements_notices_notifications_notices" as keyof ILanguageKeys,
      validStatus: () => this.DSNNNFormGroup.valid,
    },
    sampleDataForOperations: {
      name: "sampleDataForOperationsTab",
      langKey: "sample_data_for_operations" as keyof ILanguageKeys,
      validStatus: () => this.sampleDataForOperationsFormGroup.valid,
      disabled: this.isOtherProcess
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      validStatus: () => this.specialExplanationsField && this.specialExplanationsField.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };
  loadAttachments: boolean = false;
  constructor(
    public lang: LangService,
    private dialog: DialogService,
    private cd: ChangeDetectorRef,
    private toast: ToastService,
    private licenseService: LicenseService,
    private lookupService: LookupService,
    public fb: UntypedFormBuilder,
    public service: GeneralProcessNotificationService,
    private employeeService: EmployeeService,
    private adminLookupService: AdminLookupService,
    private internalDepartmentService: InternalDepartmentService,
    private subTeamService: SubTeamService,
    private generalProcessService: GeneralProcessService
  ) {
    super();
    this.processFieldBuilder = new ProcessFieldBuilder();
    this.processFieldBuilder.buildMode = 'use';
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
    this.processFieldBuilder.buildMode = this.readonly ? 'view' : 'use';
    this.processFieldBuilder.generateFromString(this.model?.template)
  }

  _getNewInstance(): GeneralProcessNotification {
    return new GeneralProcessNotification()
  }
  _initComponent(): void {
    this.listenToLicenseSearch();
    this._buildForm();
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION, true).subscribe((data: AdminLookup[]) => {
      this.mainClassificationsList = data.filter(c => !c.parentId);
      this._subClassificationsList = data.filter(c => !!c.parentId);
      if (this.model?.domain) {
        this.subClassificationsList = this._subClassificationsList.filter(sc => sc.parentId == this.model?.domain);
      }
    })
    this.internalDepartmentService.loadGeneralProcessDepartments().subscribe(deparments => {
      this.departmentList = deparments;
    })
    this.filterProcess();
  }
  private _loadSubTeam(parentTeamId?: number) {
    if (parentTeamId)
      this.subTeamService.loadActive().pipe(
        map((teams) => teams.filter((team: SubTeam) => parentTeamId == team.parent)),
        catchError(err => of([]))).subscribe(data => {
          this.subTeamsList = data;
        })
    else this.subTeamsList = [];
  }
  handleDepartmentChange() {
    this.handleTeamChange(this.departmentList.find(d => d.id == this.departmentField.value)?.mainTeam.id);
    this.handlefilterProcess();
  }
  handleTeamChange(teamId?: number) {
    this.subTeamField.reset();
    this._loadSubTeam(teamId);
    this.handlefilterProcess()
  }
  filterProcess() {
    const params = {
      departmentId: this.DSNNNFormGroup.value.departmentId,
      subTeamId: this.DSNNNFormGroup.value.competentDepartmentID,
      mainClass: this.DSNNNFormGroup.value.domain,
      subClass: this.DSNNNFormGroup.value.firstSubDomain,
      processType: this.DSNNNFormGroup.value.processType
    }
    this.generalProcessService.loadActive()
      .pipe(
        map((processes) => processes.filter(p =>
          (!params.departmentId || p.departmentId == params.departmentId)
          && (!params.mainClass || p.mainClass == params.mainClass)
          && (!params.processType || p.processType == params.processType)
          && (!params.subClass || p.subClass == params.subClass)
          && (!params.subTeamId || p.subTeamId == params.subTeamId)
        )
        ),
        catchError((err) => {
          console.log(err)
          return of([this.otherProcess])
        })
      ).subscribe((data: GeneralProcess[]) => {
        this.processList = [...data, this.otherProcess];
      })
  }
  handleDomainChange(parentId: number) {
    this.subClassificationsList = this._subClassificationsList.filter(sc => sc.parentId == parentId);
    this.firstSubDomainField.reset();
    this.handlefilterProcess();
  }
  handleProcessChange(id: number) {
    const process = this.processList.find(p => p.id == id);
    this.departmentField.setValidators([]);
    if (!this.isOtherProcess) {
      this.projectNameField.setValue(process?.arName);
      this.processTypeField.setValue(process?.processType);
      this.departmentField.setValue(process?.departmentId);
      this._loadSubTeam(this.departmentList.find(d => d.id == this.departmentField.value)?.mainTeam.id);
      this.subTeamField.setValue(process?.subTeamId);
      this.domainField.setValue(process?.mainClass);
      this.subClassificationsList = this._subClassificationsList.filter(sc => sc.parentId == this.domainField.value);
      this.firstSubDomainField.setValue(process?.subClass);
    } else {
      this.departmentField.setValidators([Validators.required])
    }
    this.departmentField.updateValueAndValidity();
    this.processFieldBuilder.generateFromString(process?.template);
    this.sampleDataForOperationsFormGroup.reset();
    this.form.removeControl('sampleDataForOperations');
    this.form.setControl('sampleDataForOperations', this.fb.group({}));
  }
  handlefilterProcess() {
    this.processIdField.reset()
    this.filterProcess();
  }
  _buildForm(): void {
    const model = new GeneralProcessNotification().buildForm(true)
    this.form = this.fb.group({
      requestType: model.requestType,
      description: model.description,
      oldFullSerial: model.oldFullSerial,
      DSNNN: this.fb.group(model.DSNNN),
      sampleDataForOperations: this.fb.group(model.sampleDataForOperations),
    });
  }
  _afterBuildForm(): void {
    this.handleReadonly();
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.requestTypeField.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({ x: this.lang.map.request_type }));
      return false;
    }
    if (!this.processIdField.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({ x: this.lang.map.lbl_process }));
      return false;
    }
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
  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }
  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): GeneralProcessNotification | Observable<GeneralProcessNotification> {
    this.processFieldBuilder.fields.map(f => {
      f.value = this.sampleDataForOperationsFormGroup.value[f.id];
    })
    const value = new GeneralProcessNotification().clone({
      ...this.model,
      requestType: this.form.value.requestType,
      description: this.form.value.description,
      ...this.form.value.DSNNN,
      template: this.processFieldBuilder.generateAsString()
    })
    return value;
  }
  private _updateModelAfterSave(model: GeneralProcessNotification): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }
  _afterSave(model: GeneralProcessNotification, saveType: SaveTypes, operation: OperationTypes): void {
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
  get canChangeReuestType() {
    return !!(this.readonly || this.model?.id);
  }
  _updateForm(model: GeneralProcessNotification | undefined): void {
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.model = model;
    const formModel = model.buildForm();
    this._loadSubTeam(this.model?.subTeam?.parent);
    this.handleDomainChange(this.model?.domain)
    this.processFieldBuilder.generateFromString(this.model?.template)

    this.form.patchValue({
      requestType: formModel.requestType,
      description: formModel.description,
      oldFullSerial: model.oldFullSerial,
      DSNNN: formModel.DSNNN,
    });
    this.filterProcess();
    this.cd.detectChanges();
    this.handleRequestTypeChange(model.requestType, false);
  }
  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
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
  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false) {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
          this.model!.requestType = requestTypeValue;
        }
        this.requestType$.next(requestTypeValue);
        this.oldFullSerialField.setValidators([])
        if (requestTypeValue == AllRequestTypesEnum.UPDATE) {
          this.oldFullSerialField.setValidators([Validators.required])
        }
        this.oldFullSerialField.updateValueAndValidity();
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }
  _destroyComponent(): void {
  }
  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
  }
  loadLicencesByCriteria(criteria: (Partial<GeneralProcessNotification>)): (Observable<GeneralProcessNotification[]>) {
    return this.service.licenseSearch(criteria as Partial<GeneralProcessNotification>);
  }
  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(exhaustMap(oldFullSerial => {
        return this.loadLicencesByCriteria({
          caseType: CaseTypes.GENERAL_PROCESS_NOTIFICATION,
          fullSerial: oldFullSerial
        }).pipe(catchError(() => of([])));
      }))
      .pipe(
        map(result => result.filter(l => l.caseStatus == CommonCaseStatus.FINAL_APPROVE || l.caseStatus == CommonCaseStatus.CANCELLED || l.caseStatus == CommonCaseStatus.FINAL_REJECTION)),
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
            return this.licenseService.validateLicenseByRequestType(this.model!.getCaseType(), this.requestTypeField.value, licenses[0].fullSerial)
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
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details);
      });
  }

  private setSelectedLicense(licenseDetails: GeneralProcessNotification) {
    this.selectedLicense = licenseDetails;
    let requestType = this.requestTypeField?.value,
      result: Partial<GeneralProcessNotification> = {
        requestType
      };

    result.oldFullSerial = licenseDetails.fullSerial;
    result.oldLicenseId = licenseDetails.id;
    result.oldLicenseSerial = licenseDetails.serial;

    result.description = licenseDetails.description;
    result.projectDescription = licenseDetails.projectDescription;

    result.departmentId = licenseDetails.departmentId;
    result.competentDepartmentID = licenseDetails.competentDepartmentID;
    result.domain = licenseDetails.domain;
    result.firstSubDomain = licenseDetails.firstSubDomain;
    result.processid = licenseDetails.processid;
    result.projectName = licenseDetails.projectName;
    result.needSubject = licenseDetails.needSubject;
    result.processType = licenseDetails.processType;
    result.template = licenseDetails.template;
    result.subject = licenseDetails.subject;
    result.subTeam = licenseDetails.subTeam;

    this._updateForm((new GeneralProcessNotification()).clone(result));
  }
  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldFullSerialField.value;
    }
    this.licenseSearch$.next(value);
  }
  isEdit() {
    return this.requestTypeField.value == AllRequestTypesEnum.UPDATE;
  }
  get isOtherProcess() {
    return this.processIdField && (!this.processIdField.value || this.processIdField.value == -1);
  }
  get requestTypeField(): UntypedFormControl {
    return this.form.get("requestType") as UntypedFormControl;
  }
  get DSNNNFormGroup(): UntypedFormGroup {
    return this.form && this.form.get('DSNNN') as UntypedFormGroup;
  }
  get sampleDataForOperationsFormGroup(): UntypedFormGroup {
    return this.form.get('sampleDataForOperations') as UntypedFormGroup;
  }
  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }
  get oldFullSerialField(): UntypedFormControl {
    return this.form.get('oldFullSerial') as UntypedFormControl;
  }
  get subTeamField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('competentDepartmentID') as UntypedFormControl
  }
  get firstSubDomainField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('firstSubDomain') as UntypedFormControl
  }
  get departmentField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('departmentId') as UntypedFormControl
  }
  get projectNameField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('projectName') as UntypedFormControl
  }
  get processIdField(): UntypedFormControl {
    return this.DSNNNFormGroup && this.DSNNNFormGroup.get('processid') as UntypedFormControl
  }
  get domainField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('domain') as UntypedFormControl
  }
  get processTypeField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('processType') as UntypedFormControl
  }
}
