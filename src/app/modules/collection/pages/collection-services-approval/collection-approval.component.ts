import {Component} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {CollectionApproval} from '@app/models/collection-approval';
import {CollectionApprovalService} from '@app/services/collection-approval.service';
import {LangService} from '@app/services/lang.service';
import {Observable, of} from 'rxjs';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {CollectionRequestType} from '@app/enums/service-request-types';
import {DialogService} from '@app/services/dialog.service';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {ToastService} from '@app/services/toast.service';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EmployeeService} from '@app/services/employee.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';

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

  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  requestClassifications: Lookup[] = this.lookupService.listByCategory.CollectionClassification;
  licenseDurationTypes: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  form!: UntypedFormGroup;

  disableSearchField: boolean = true;

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
    this.listenToRequestTypeChanges();
    this.checkDisableFields();
    this.listenToDurationChanges();
    this.listenToRequestClassificationChanges();
    this.handleReadonly();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(map(_ => !!(this.model && this.model.collectionItemList.length)))
      .pipe(tap(hasCollectionItems => !hasCollectionItems && this.invalidItemMessage()));
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.collectionItemList.length) {
      this.invalidItemMessage();
    }
    return true;
  }

  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_collection_items_to_proceed);
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): CollectionApproval | Observable<CollectionApproval> {
    return new CollectionApproval().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    });
  }

  _afterSave(model: CollectionApproval, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
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
  }

  _resetForm(): void {
    this.form.reset();
    this.model && (this.model.collectionItemList = []);
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
    this.checkDisableFields();
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.requestType.patchValue(this.requestTypes[0].lookupKey);
    }
  }

  private listenToRequestTypeChanges() {
    this.requestType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: CollectionRequestType) => {
        this.disableSearchField = val === CollectionRequestType.NEW;
        this.model!.requestType = val;
      });
  }

  checkDisableFields(): void {
    this.model?.collectionItemList.length ? this.disableFields() : this.enableFields();
  }

  collectionItemFormStatusChanged($event: boolean) {
    $event ? this.disableFields() : this.checkDisableFields();
  }

  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private disableFields() {
    this.requestType.disable();
    this.licenseDurationType.disable();
    this.requestClassification.disable();
  }

  private enableFields(): void {
    this.requestType.enable();
    this.licenseDurationType.enable();
    this.requestClassification.enable();
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

  hasMissingRequiredMultiAttachments(): boolean {
    return !!(this.attachmentHandlers && this.attachmentHandlers.length
      && this.attachmentHandlers.some(validator => validator.hasMissingRequiredAttachments()));
  }
}
