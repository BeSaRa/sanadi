import { CollectionItemComponent } from './../../shared/collection-item/collection-item.component';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@enums/operation-types.enum';
import { SaveTypes } from '@enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CollectionApproval } from '@models/collection-approval';
import { CollectionApprovalService } from '@services/collection-approval.service';
import { LangService } from '@services/lang.service';
import { Observable, of } from 'rxjs';
import { Lookup } from '@models/lookup';
import { LookupService } from '@services/lookup.service';
import { CollectionRequestType } from '@enums/service-request-types';
import { DialogService } from '@services/dialog.service';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ToastService } from '@services/toast.service';
import { OpenFrom } from '@enums/open-from.enum';
import { EmployeeService } from '@services/employee.service';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { UserClickOn } from '@enums/user-click-on.enum';
import { TabMap } from '@app/types/types';

@Component({
  selector: 'collection-approval',
  templateUrl: './collection-approval.component.html',
  styleUrls: ['./collection-approval.component.scss']
})
export class CollectionApprovalComponent extends EServicesGenericComponent<CollectionApproval, CollectionApprovalService> {
  constructor(public lang: LangService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    public service: CollectionApprovalService,
    public employeeService: EmployeeService,
    public fb: UntypedFormBuilder) {
    super();
  }
  @ViewChild('collectionItemsTab') collectionItemsComponentRef!: CollectionItemComponent;

  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  requestClassifications: Lookup[] = this.lookupService.listByCategory.CollectionClassification;
  licenseDurationTypes: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  form!: UntypedFormGroup;

  disableSearchField: boolean = true;

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfo',
      langKey: 'lbl_basic_info',
      index: 0,
      validStatus: () => {
        if (!this.basicInfo || this.basicInfo.disabled) {
          return true;
        }
        return this.basicInfo.valid && this.hasCollectionListItems
      },
      isTouchedOrDirty: () => true
    },
    specialExplanation: {
      name: 'specialExplanation',
      langKey: 'special_explanations',
      index: 1,
      validStatus: () => {
        return !this.specialExplanation || this.specialExplanation.disabled || this.specialExplanation.valid;
      },
      isTouchedOrDirty: () => true
    }
  }

  getTabInvalidStatus(tabName: string): boolean {
    let tab = this.tabsData[tabName];
    if (!tab) {
      console.info('tab not found: %s', tabName);
      return true; // if tab not found, consider it invalid
    }
    if (!tab.checkTouchedDirty) {
      return !tab.validStatus();
    }
    return !tab.validStatus() && tab.isTouchedOrDirty();
  }

  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType');
    }
  };

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basicInfo.requestType')!;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get licenseDurationType(): AbstractControl {
    return this.form.get('basicInfo.licenseDurationType')!;
  }

  get requestClassification(): AbstractControl {
    return this.form.get('basicInfo.requestClassification')!;
  }

  _getNewInstance(): CollectionApproval {
    return new CollectionApproval();
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    // 1 - implement all model properties [done]
    const model = new CollectionApproval();
    // 2 - create the form controls for the model
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });
    // 3 - draw the screen controls
  }

  _afterBuildForm(): void {
    this.setDefaultValues();
    this.listenToDurationChanges();
    this.listenToRequestClassificationChanges();
    this.handleReadonly();
  }

  get hasCollectionListItems(): boolean {
    return !!(this.collectionItemsComponentRef && this.collectionItemsComponentRef.list.length);
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.requestType.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({ x: this.lang.map.request_type }));
      return false;
    }
    if (saveType === SaveTypes.DRAFT) {
      if (this.requestType.value === CollectionRequestType.NEW) {
        return true;
      } else {
        if (!this.hasCollectionListItems) {
          this.invalidItemMessage();
          return false;
        }
        return true;
      }
    }
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(map(_ => this.hasCollectionListItems))
      .pipe(tap(hasCollectionItems => !hasCollectionItems && this.invalidItemMessage()));
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.hasCollectionListItems) {
      this.invalidItemMessage();
    }
    return true;
  }

  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_collection_items_to_proceed);
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): CollectionApproval | Observable<CollectionApproval> {
    return new CollectionApproval().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue(),
      collectionItemList: this.collectionItemsComponentRef?.list ?? []
    });
  }

  _afterSave(model: CollectionApproval, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
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
    // throw new Error('Method not implemented.');
    console.log(error);
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: CollectionApproval | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: model?.buildBasicInfo(),
      explanation: model?.buildExplanation()
    });
    this.handleRequestTypeChange(model.requestType, false);
  }

  _resetForm(): void {
    this.form.reset();
    this.collectionItemsComponentRef?.forceClearComponent();
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.requestType.patchValue(this.requestTypes[0].lookupKey);
      this.handleRequestTypeChange(this.requestTypes[0].lookupKey, false);
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
          this.requestType.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);

        this.disableSearchField = requestTypeValue === CollectionRequestType.NEW;
        this.model!.requestType = requestTypeValue;
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }


  private listenToRequestClassificationChanges() {
    this.requestClassification
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.model && (this.model.requestClassification = value);
      });
  }

  private listenToDurationChanges() {
    this.licenseDurationType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.model && (this.model.licenseDurationType = value);
      });
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
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
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  isNewRequestType(): boolean {
    return this.requestType.value && (this.requestType.value === CollectionRequestType.NEW);
  }
}
