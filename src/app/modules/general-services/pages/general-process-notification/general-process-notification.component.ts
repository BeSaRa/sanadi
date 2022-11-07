import { CustomValidators } from './../../../../validators/custom-validators';
import { ProcessFieldBuilder } from './../../../../administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { AllRequestTypesEnum } from './../../../../enums/all-request-types-enum';
import { LookupService } from './../../../../services/lookup.service';
import { GeneralProcess } from '@app/models/genral-process';
import { GeneralProcessService } from './../../../../services/general-process.service';
import { AdminLookupTypeEnum } from './../../../../enums/admin-lookup-type-enum';
import { TeamService } from './../../../../services/team.service';
import { InternalDepartmentService } from './../../../../services/internal-department.service';
import { AdminLookupService } from '@services/admin-lookup.service';
import { AdminLookup } from './../../../../models/admin-lookup';
import { InternalDepartment } from './../../../../models/internal-department';
import { Team } from './../../../../models/team';
import { LicenseService } from './../../../../services/license.service';
import { Lookup } from '@app/models/lookup';
import { TabComponent } from './../../../../shared/components/tab/tab.component';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { takeUntil, switchMap, map, catchError, filter, tap, exhaustMap } from 'rxjs/operators';
import { EmployeeService } from '@app/services/employee.service';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { ToastService } from '@app/services/toast.service';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './../../../../services/dialog.service';
import { CommonUtils } from '@app/helpers/common-utils';
import { GeneralProcessNotificationService } from './../../../../services/general-process-notification.service';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Component, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { GeneralProcessTemplate } from '@app/models/general-process-template';

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
    .AllRequestTypes.filter(rt => rt.lookupKey == AllRequestTypesEnum.NEW || rt.lookupKey == AllRequestTypesEnum.EDIT);
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
  departmentList: InternalDepartment[] = [];
  _teamsList: Team[] = [];

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
    private teamService: TeamService,
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
  }

  _getNewInstance(): GeneralProcessNotification {
    return new GeneralProcessNotification()
  }
  _initComponent(): void {
    this._buildForm();
    this.handleReadonly();
    this.adminLookupService.loadGeneralProcessClassificaion().subscribe((data: AdminLookup[]) => {
      this.mainClassificationsList = data;
    })
    this.teamService.loadAsLookups().pipe(
      switchMap((teams) => {
        return this.internalDepartmentService.loadGeneralProcessDepartments()
          .pipe(
            tap((deparments) => {
              this._teamsList = teams.filter(team => deparments.findIndex(deparment => team.parentDeptId == deparment.id) != -1);
            }))
      })
    ).subscribe(deparments => {
      this.departmentList = deparments;
    })
    this.filterProcess({});
  }
  handleDepartmentChange() {
    this.teamField.reset();
  }
  get teamsList() {
    return this._teamsList.filter(team => !this.departmentField.value || team.parentDeptId == this.departmentField.value)
  }
  filterProcess(params: Partial<GeneralProcess>) {
    this.generalProcessService.filterProcess(params).pipe(
      catchError((err) => {
        console.log(err)
        return of([this.otherProcess])
      })
    ).subscribe((data: GeneralProcess[]) => {
      this.processList = [...data, this.otherProcess];
    })
  }
  loadSubClasses(parentId: number) {
    this.adminLookupService.loadByParentId(AdminLookupTypeEnum.GENERAL_PROCESS_CLASSIFICATION, parentId).subscribe(data => {
      this.subClassificationsList = data;
    })
  }
  handleProcessChange(id: number) {
    const process = this.processList.find(p => p.id == id);
    this.projectNameField.setValidators([])
    this.projectNameField.reset();
    if (this.isOtherProcess)
      this.projectNameField.setValidators([CustomValidators.required])
    this.processFieldBuilder.generateFromString(process?.template)
    this.sampleDataForOperationsFormGroup.reset();
    this.form.removeControl('sampleDataForOperations');
    this.form.setControl('sampleDataForOperations', this.fb.group({}))
  }
  _buildForm(): void {
    const model = new GeneralProcessNotification().buildForm(true)
    this.form = this.fb.group({
      requestType: model.requestType,
      description: model.description,
      oldLicenseFullSerial: model.oldLicenseFullSerial,
      DSNNN: this.fb.group(model.DSNNN),
      sampleDataForOperations: this.fb.group(model.sampleDataForOperations),
    });
    this.form.valueChanges.subscribe((data) => {
      console.log(data);
    })
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
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
      f.value = this.sampleDataForOperationsFormGroup.value[f.identifyingName];
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
  _updateForm(model: GeneralProcessNotification | undefined): void {
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.model = model;
    const formModel = model.buildForm();
    // TODO: Generate form from string and set form value for sampleDataForOperations
    this.form.patchValue({
      requestType: formModel.requestType,
      description: formModel.description,
      oldLicenseFullSerial: formModel.oldLicenseFullSerial,
      DSNNN: formModel.DSNNN,
      sampleDataForOperations: formModel.sampleDataForOperations
    });

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

    result.oldLicenseFullSerial = licenseDetails.fullSerial;
    result.oldLicenseId = licenseDetails.id;
    result.oldLicenseSerial = licenseDetails.serial;

    result.description = licenseDetails.description;

    this._updateForm((new GeneralProcessNotification()).clone(result));
  }
  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldLicenseFullSerialField.value;
    }
    this.licenseSearch$.next(value);
  }
  isEdit() {
    return this.requestTypeField.value == 2;
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
  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.form.get('oldLicenseFullSerial') as UntypedFormControl;
  }
  get teamField(): UntypedFormControl {
    return this.DSNNNFormGroup.get('competentDepartmentID') as UntypedFormControl
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

}
